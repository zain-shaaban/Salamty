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

@WebSocketGateway({
  namespace: 'groups',
  cors: { origin: resolveCorsOrigins(), credentials: true },
})
export class GroupEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private namespace!: Namespace;

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
    if (userId && this.socketByUser.get(userId) === client.id) {
      this.socketByUser.delete(userId);
    }
  }

  notifyGroupChanged(groupId: string): void {
    this.namespace.to(groupRoom(groupId)).emit(GroupEvent.GROUP_CHANGED);
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    await this.socketOf(userId)?.join(groupRoom(groupId));
  }

  removeUserFromGroup(userId: string, groupId: string): void {
    void this.socketOf(userId)?.leave(groupRoom(groupId));
  }

  private socketOf(userId: string): Socket | undefined {
    const id = this.socketByUser.get(userId);
    return id ? this.namespace.sockets.get(id) : undefined;
  }
}
