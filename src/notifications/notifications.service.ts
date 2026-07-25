import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { FcmService } from '../fcm/fcm.service.js';
import { Role } from '../common/enums/role.enum.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';
import { BroadcastChannel } from './enums/broadcast-channel.enum.js';
import type { BroadcastNotificationDto } from './dto/requests/broadcast-notification.dto.js';

export interface GroupNotification {
  /** Sender — excluded from the recipient list. */
  senderUserId: string;
  groupId: string;
  type: NotificationType;
  title: string;
  body: string;
}

export interface UserNotification {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  groupId?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly fcmService: FcmService,
  ) {}

  // ─── Targeted notifications (persisted + FCM push) ─────────────────────────

  /**
   * Notify every member of a group except the sender. Persists a Notification
   * row per recipient and queues an FCM push to their active devices.
   */
  async notifyGroup({
    senderUserId,
    groupId,
    type,
    title,
    body,
  }: GroupNotification): Promise<void> {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId, userId: { not: senderUserId } },
      select: { userId: true },
    });

    const userIds = members.map((member) => member.userId);
    await this.dispatch(userIds, type, title, body, groupId);
  }

  /** Notify a single user (persisted + FCM push to their active devices). */
  async notifyUser({
    userId,
    type,
    title,
    body,
    groupId = null,
  }: UserNotification): Promise<void> {
    await this.dispatch([userId], type, title, body, groupId);
  }

  private async dispatch(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
    groupId: string | null,
  ): Promise<void> {
    if (!userIds.length) return;

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        groupId,
        alertType: type,
        title,
        body,
      })),
    });

    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
        notificationToken: { not: null },
      },
      select: { notificationToken: true },
    });

    const tokens = [
      ...new Set(
        sessions
          .map((session) => session.notificationToken)
          .filter((token): token is string => Boolean(token)),
      ),
    ];

    const data: Record<string, string> = { alertType: type };
    if (groupId) data.groupId = groupId;

    await this.fcmService.queuePushToMany(tokens, title, body, data);
  }

  // ─── User inbox ────────────────────────────────────────────────────────────

  async listForUser(
    userId: string,
    { unreadOnly, take }: { unreadOnly: boolean; take: number },
  ) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        alertType: true,
        title: true,
        body: true,
        isRead: true,
        groupId: true,
        createdAt: true,
      },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<null> {
    const { count } = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    if (count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return null;
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updated: count };
  }

  /**
   * Update the FCM device token for the caller's most recent active session.
   * Device tokens are refreshed by the client SDK, so this keeps push delivery
   * working without forcing a re-login.
   */
  async updateDeviceToken(
    userId: string,
    notificationToken: string,
  ): Promise<null> {
    const session = await this.prisma.userSession.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundException('No active session found');
    }

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { notificationToken },
    });

    return null;
  }

  // ─── Admin broadcast ───────────────────────────────────────────────────────

  async broadcastToAllUsers({
    channel,
    title,
    body,
  }: BroadcastNotificationDto) {
    const sendFcm =
      channel === BroadcastChannel.FCM || channel === BroadcastChannel.BOTH;
    const sendEmail =
      channel === BroadcastChannel.EMAIL || channel === BroadcastChannel.BOTH;

    let emailsQueued = 0;
    let pushQueued = 0;

    if (sendEmail) {
      const users = await this.prisma.user.findMany({
        where: { role: Role.USER, isActive: true, confirmed: true },
        select: { email: true, username: true },
      });

      await Promise.all(
        users.map((user, index) =>
          this.mailService.queueBroadcastEmail(
            {
              to: user.email,
              username: user.username,
              title,
              body,
            },
            index * 300,
          ),
        ),
      );

      emailsQueued = users.length;
    }

    if (sendFcm) {
      const sessions = await this.prisma.userSession.findMany({
        where: {
          isActive: true,
          notificationToken: { not: null },
          user: { role: Role.USER, isActive: true },
        },
        select: { notificationToken: true },
      });

      const tokens = [
        ...new Set(
          sessions
            .map((session) => session.notificationToken)
            .filter((token): token is string => Boolean(token)),
        ),
      ];

      await this.fcmService.queuePushToMany(tokens, title, body, {
        alertType: NotificationType.SYSTEM,
      });

      pushQueued = tokens.length;
    }

    return { emailsQueued, pushQueued };
  }
}
