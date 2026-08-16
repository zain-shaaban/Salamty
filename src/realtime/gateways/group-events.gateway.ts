import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Namespace, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GroupEvent } from '../constants/realtime-events.const.js';
import { getHandshakeToken } from '../utils/handshake.util.js';
import { resolveCorsOrigins } from '../utils/cors.util.js';

interface JwtPayload {
  sub: string;
}

const groupRoom = (groupId: string) => `group:${groupId}`;

/**
 * Push-only gateway on the `groups` namespace. Each client joins a room per
 * group it belongs to, so a membership change is one `group:changed` room emit.
 */
@WebSocketGateway({
  namespace: 'groups',
  cors: { origin: resolveCorsOrigins(), credentials: true },
})
export class GroupEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private namespace!: Namespace;

  /** userId → its connected socket id (one device per user). */
  private readonly socketByUser = new Map<string, string>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = getHandshakeToken(client);
    if (!token) {
      client.disconnect();
      return;
    }

    let userId: string;
    try {
      userId = this.jwt.verify<JwtPayload>(token).sub;
    } catch {
      client.disconnect();
      return;
    }

    client.data = { userId };
    this.socketByUser.set(userId, client.id);

    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    await client.join(memberships.map((m) => groupRoom(m.groupId)));
  }

  handleDisconnect(client: Socket): void {
    const userId = (client.data as { userId?: string } | undefined)?.userId;
    // Guard against a reconnect race: only clear if this is still the live id.
    if (userId && this.socketByUser.get(userId) === client.id) {
      this.socketByUser.delete(userId);
    }
  }

  /** One room emit — every connected member of the group is notified. */
  notifyGroupChanged(groupId: string): void {
    this.namespace.to(groupRoom(groupId)).emit(GroupEvent.GROUP_CHANGED);
  }

  /**
   * Add a connected user's socket to a group room (on join). Awaited by
   * callers that immediately follow up with notifyGroupChanged() — join()
   * isn't guaranteed synchronous, so emitting to the room before it resolves
   * can miss the very socket that was just added.
   */
  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    await this.socketOf(userId)?.join(groupRoom(groupId));
  }

  /** Remove a connected user's socket from a group room (on leave). */
  removeUserFromGroup(userId: string, groupId: string): void {
    void this.socketOf(userId)?.leave(groupRoom(groupId));
  }

  private socketOf(userId: string): Socket | undefined {
    const id = this.socketByUser.get(userId);
    return id ? this.namespace.sockets.get(id) : undefined;
  }
}
