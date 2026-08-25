import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Interval } from '@nestjs/schedule';
import type { Server, Socket } from 'socket.io';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';
import { TripStatus } from '../../common/enums/trip-status.enum.js';
import { RealtimeEvent } from '../constants/realtime-events.const.js';
import {
  INACTIVITY_NOTIFY_MS,
  OFFLINE_SNAPSHOT_MS,
  SCHEDULER_INTERVAL_MS,
  TRIP_REMINDER_LEAD_MS,
} from '../constants/tracking.const.js';
import type {
  LiveGroup,
  LiveLocation,
  LiveMember,
} from '../interfaces/live-session.interface.js';
import type {
  ExtendTripPayload,
  LocationPayload,
  StartTripPayload,
} from '../interfaces/socket-payloads.interface.js';
import {
  getHandshakeGroupId,
  getHandshakeToken,
  getHandshakeLocation,
} from '../utils/handshake.util.js';
import { parseOptionalLocation } from '../utils/payload.util.js';

interface JwtPayload {
  sub: string;
}

interface ConnectionContext {
  userId: string;
  groupId: string;
}

const groupRoom = (groupId: string) => `group:${groupId}`;
const toJson = (v: LiveLocation | LiveLocation[]) =>
  v as unknown as Prisma.InputJsonValue;

@Injectable()
export class LiveSessionService {
  private readonly logger = new Logger(LiveSessionService.name);
  private server!: Server;
  private readonly groups = new Map<string, LiveGroup>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly notifications: NotificationsService,
  ) {}

  setServer(server: Server): void {
    this.server = server;
  }

  async handleConnection(client: Socket): Promise<ConnectionContext> {
    const token = getHandshakeToken(client);
    const groupId = getHandshakeGroupId(client);
    if (!token || !groupId) throw new Error('Missing auth token or group id');

    let userId: string;
    try {
      userId = this.jwt.verify<JwtPayload>(token).sub;
    } catch {
      throw new Error('Invalid auth token');
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
      select: { userId: true },
    });
    if (!membership) throw new Error('Not a member of this group');

    const location = parseOptionalLocation(getHandshakeLocation(client));

    let group = this.groups.get(groupId);
    if (!group) {
      group = await this.buildGroupSession(
        groupId,
        userId,
        client.id,
        location,
      );
      this.groups.set(groupId, group);
    } else {
      this.attachMember(group, userId, client.id, location);
    }

    await client.join(groupRoom(groupId));
    this.emitSessionInit(client, group, userId);

    const self = group.members.find((m) => m.userId === userId);
    if (self?.location) {
      this.broadcastToGroup(group, RealtimeEvent.LOCATION_UPDATE, {
        userId,
        location: self.location,
        sos: self.sos,
      });
    }

    return { userId, groupId };
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const ctx = client.data as Partial<ConnectionContext>;
    if (!ctx.groupId || !ctx.userId) return;

    const member = this.groups
      .get(ctx.groupId)
      ?.members.find((m) => m.userId === ctx.userId);
    if (!member) return;

    member.socketId = null;
    if (member.location) {
      await this.persistLastLocation(ctx.userId, ctx.groupId, member.location);
    }
  }

  async updateLocation(
    userId: string,
    groupId: string,
    location: LocationPayload,
  ): Promise<void> {
    const { group, member } = this.requireMember(groupId, userId);

    member.location = location;
    member.offline = false;
    member.inactivityNotified = false;

    if (member.sos) {
      member.path.push(location);
      await this.persistPath(userId, groupId, member.path);
    }
    if (member.sos || member.tripId) {
      await this.logLocation(userId, groupId, member.tripId, location);
    }

    this.broadcastToGroup(group, RealtimeEvent.LOCATION_UPDATE, {
      userId,
      location,
      sos: member.sos,
    });
  }

  async startSos(userId: string, groupId: string): Promise<void> {
    const { group, member } = this.requireMember(groupId, userId);
    if (member.sos) return;

    member.sos = true;
    member.path = member.location ? [member.location] : [];

    await this.prisma.user.update({
      where: { id: userId },
      data: { sos: true },
    });
    await this.persistPath(userId, groupId, member.path);
    if (member.location) {
      await this.logLocation(userId, groupId, member.tripId, member.location);
    }

    await this.notifications.notifyGroup({
      senderUserId: userId,
      groupId,
      type: NotificationType.SOS,
      title: 'سلامتي - إشعار خطر',
      body: `${member.username} في وضع الخطر`,
    });

    this.broadcastToGroup(group, RealtimeEvent.SOS_STARTED, { userId });
  }

  async endSos(userId: string, groupId: string): Promise<void> {
    const { group, member } = this.requireMember(groupId, userId);
    if (!member.sos) return;

    member.sos = false;
    member.path = [];

    await this.prisma.user.update({
      where: { id: userId },
      data: { sos: false },
    });
    await this.persistPath(userId, groupId, []);

    if (member.tripId) {
      await this.closeTrip(member.tripId, TripStatus.CANCELLED);
      this.resetTrip(member);
      this.broadcastToGroup(group, RealtimeEvent.TRIP_ENDED, {
        userId,
      });
    }

    await this.notifications.notifyGroup({
      senderUserId: userId,
      groupId,
      type: NotificationType.SYSTEM,
      title: 'سلامتي - إشعار أمان',
      body: `${member.username} عاد إلى وضع الأمان`,
    });

    this.broadcastToGroup(group, RealtimeEvent.SOS_ENDED, { userId });
  }

  async startTrip(
    userId: string,
    groupId: string,
    payload: StartTripPayload,
  ): Promise<void> {
    const { group, member } = this.requireMember(groupId, userId);

    if (member.tripId)
      await this.closeTrip(member.tripId, TripStatus.CANCELLED);

    const trip = await this.prisma.trip.create({
      data: {
        userId,
        groupId,
        status: TripStatus.ACTIVE,
        destinationLat: payload.lat,
        destinationLng: payload.lng,
        estimatedArrival: new Date(payload.estimatedArrival),
        startedAt: new Date(),
      },
      select: { id: true },
    });

    member.tripId = trip.id;
    member.destination = {
      lat: payload.lat,
      lng: payload.lng,
      estimatedArrival: payload.estimatedArrival,
    };
    member.tripReminderSent = false;

    this.broadcastToGroup(group, RealtimeEvent.TRIP_STARTED, {
      userId,
      destination: member.destination,
    });
  }

  async extendTrip(
    userId: string,
    groupId: string,
    { increase, amount }: ExtendTripPayload,
  ): Promise<void> {
    const { group, member } = this.requireMember(groupId, userId);
    if (!member.tripId || !member.destination)
      throw new Error('No active trip');

    member.destination.estimatedArrival += (increase ? 1 : -1) * amount;
    member.tripReminderSent = false;

    await this.prisma.trip.update({
      where: { id: member.tripId },
      data: { estimatedArrival: new Date(member.destination.estimatedArrival) },
    });

    this.broadcastToGroup(group, RealtimeEvent.TRIP_TIME_CHANGED, {
      userId,
      estimatedArrival: member.destination.estimatedArrival,
    });
  }

  async endTrip(userId: string, groupId: string): Promise<void> {
    const { group, member } = this.requireMember(groupId, userId);
    if (!member.tripId) throw new Error('No active trip');

    await this.closeTrip(member.tripId, TripStatus.COMPLETED);
    this.resetTrip(member);
    this.broadcastToGroup(group, RealtimeEvent.TRIP_ENDED, { userId });
  }

  @Interval(SCHEDULER_INTERVAL_MS)
  async sweep(): Promise<void> {
    const now = Date.now();

    for (const group of this.groups.values()) {
      for (const member of group.members) {
        try {
          await this.processMember(group, member, now);
        } catch (error) {
          this.logger.error(
            `sweep failed for ${member.userId} in ${group.groupId}: ${
              (error as Error).message
            }`,
          );
        }
      }

      if (group.members.every((m) => m.offline)) {
        this.groups.delete(group.groupId);
      }
    }
  }

  private async processMember(
    group: LiveGroup,
    member: LiveMember,
    now: number,
  ): Promise<void> {
    const eta = member.destination?.estimatedArrival;

    if (eta !== undefined && !member.sos) {
      if (!member.tripReminderSent && eta < now + TRIP_REMINDER_LEAD_MS) {
        member.tripReminderSent = true;
        await this.notifications.notifyUser({
          userId: member.userId,
          groupId: group.groupId,
          type: NotificationType.SYSTEM,
          title: 'سلامتي - إشعار تفقد',
          body: 'بقي أقل من 5 دقائق على نهاية رحلتك، هل تريد تمديد المدة؟',
        });
      }
      if (eta < now) await this.startSos(member.userId, group.groupId);
    }

    if (!member.location || member.socketId) return;

    if (
      !member.inactivityNotified &&
      member.location.time < now - INACTIVITY_NOTIFY_MS
    ) {
      member.inactivityNotified = true;
      await this.notifications.notifyGroup({
        senderUserId: member.userId,
        groupId: group.groupId,
        type: NotificationType.SYSTEM,
        title: 'سلامتي - إشعار تفقد',
        body: `لم يرسل ${member.username} موقعه إلى ${group.groupName} منذ 30 دقيقة`,
      });
    }

    if (!member.offline && member.location.time < now - OFFLINE_SNAPSHOT_MS) {
      member.offline = true;
      await this.snapshotMember(group.groupId, member);
    }
  }

  private async buildGroupSession(
    groupId: string,
    connectingUserId: string,
    socketId: string,
    location: LocationPayload | null,
  ): Promise<LiveGroup> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        groupName: true,
        groupMembers: {
          select: {
            userId: true,
            lastLocation: true,
            path: true,
            user: { select: { username: true, sos: true } },
          },
        },
      },
    });
    if (!group) throw new Error('Group not found');

    const activeTrips = await this.prisma.trip.findMany({
      where: { groupId, status: TripStatus.ACTIVE },
      select: {
        id: true,
        userId: true,
        destinationLat: true,
        destinationLng: true,
        estimatedArrival: true,
      },
    });
    const tripByUser = new Map(activeTrips.map((trip) => [trip.userId, trip]));

    const members: LiveMember[] = group.groupMembers
      .map((gm): LiveMember => {
        const isCurrent = gm.userId === connectingUserId;
        const restored = gm.lastLocation as LiveLocation | null;
        const trip = tripByUser.get(gm.userId);
        const destination =
          trip?.destinationLat != null &&
          trip?.destinationLng != null &&
          trip?.estimatedArrival != null
            ? {
                lat: trip.destinationLat,
                lng: trip.destinationLng,
                estimatedArrival: trip.estimatedArrival.getTime(),
              }
            : null;

        return {
          userId: gm.userId,
          username: gm.user.username,
          socketId: isCurrent ? socketId : null,
          location: isCurrent ? (location ?? restored) : restored,
          sos: gm.user.sos,
          path: (gm.path as LiveLocation[] | null) ?? [],
          destination,
          tripId: trip?.id ?? null,
          offline: !isCurrent,
          inactivityNotified: !isCurrent,
          tripReminderSent: false,
        };
      })
      .filter((m) => m.location !== null || m.userId === connectingUserId);

    return { groupId: group.id, groupName: group.groupName, members };
  }

  private attachMember(
    group: LiveGroup,
    userId: string,
    socketId: string,
    location: LocationPayload | null,
  ): void {
    const member = group.members.find((m) => m.userId === userId);
    if (member) {
      member.socketId = socketId;
      member.offline = false;
      member.inactivityNotified = false;
      if (location) {
        member.location = location;
        if (member.sos) member.path.push(location);
      }
      return;
    }

    group.members.push({
      userId,
      username: '',
      socketId,
      location,
      sos: false,
      path: [],
      destination: null,
      tripId: null,
      offline: false,
      inactivityNotified: false,
      tripReminderSent: false,
    });
    void this.hydrateUsername(group, userId);
  }

  private async hydrateUsername(
    group: LiveGroup,
    userId: string,
  ): Promise<void> {
    const member = group.members.find((m) => m.userId === userId);
    if (!member || member.username) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    if (user) member.username = user.username;
  }

  private emitSessionInit(
    client: Socket,
    group: LiveGroup,
    userId: string,
  ): void {
    const self = group.members.find((m) => m.userId === userId);
    const peers = group.members
      .filter((m) => m.userId !== userId)
      .map(({ userId, username, location, sos, path, destination }) => ({
        userId,
        username,
        location,
        sos,
        path,
        destination,
      }));

    client.emit(RealtimeEvent.SESSION_INIT, {
      members: peers,
      session: {
        sos: self?.sos ?? false,
        destination: self?.destination ?? null,
      },
    });
  }

  private broadcastToGroup(
    group: LiveGroup,
    event: string,
    payload: unknown,
  ): void {
    this.server.to(groupRoom(group.groupId)).emit(event, payload);
  }

  private resetTrip(member: LiveMember): void {
    member.tripId = null;
    member.destination = null;
    member.tripReminderSent = false;
  }

  private async persistLastLocation(
    userId: string,
    groupId: string,
    location: LiveLocation,
  ): Promise<void> {
    await this.prisma.groupMember.updateMany({
      where: { userId, groupId },
      data: { lastLocation: toJson(location) },
    });
  }

  private async persistPath(
    userId: string,
    groupId: string,
    path: LiveLocation[],
  ): Promise<void> {
    await this.prisma.groupMember.updateMany({
      where: { userId, groupId },
      data: { path: toJson(path) },
    });
  }

  private async snapshotMember(
    groupId: string,
    member: LiveMember,
  ): Promise<void> {
    await this.prisma.groupMember.updateMany({
      where: { userId: member.userId, groupId },
      data: {
        lastLocation: member.location ? toJson(member.location) : undefined,
        path: toJson(member.path),
      },
    });
  }

  private async logLocation(
    userId: string,
    groupId: string,
    tripId: string | null,
    location: LiveLocation,
  ): Promise<void> {
    await this.prisma.locationLog.create({
      data: {
        userId,
        groupId,
        tripId,
        latitude: location.lat,
        longitude: location.lng,
        locationTime: new Date(location.time),
      },
    });
  }

  private async closeTrip(tripId: string, status: TripStatus): Promise<void> {
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { status, endedAt: new Date() },
    });
  }

  private requireMember(
    groupId: string,
    userId: string,
  ): { group: LiveGroup; member: LiveMember } {
    const group = this.groups.get(groupId);
    if (!group)
      throw new NotFoundException(`No live session for group ${groupId}`);
    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      throw new NotFoundException(`User ${userId} is not in the live session`);
    }
    return { group, member };
  }
}
