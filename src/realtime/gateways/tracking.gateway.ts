import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { LiveSessionService } from '../services/live-session.service.js';
import { RealtimeEvent } from '../constants/realtime-events.const.js';
import {
  parseExtendTrip,
  parseLocation,
  parseStartTrip,
} from '../utils/payload.util.js';
import type { Ack } from '../interfaces/socket-payloads.interface.js';
import { resolveCorsOrigins } from '../utils/cors.util.js';

interface SocketState {
  userId: string;
  groupId: string;
}

@WebSocketGateway({ cors: { origin: resolveCorsOrigins(), credentials: true } })
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TrackingGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(private readonly liveSession: LiveSessionService) {}

  afterInit(server: Server): void {
    this.liveSession.setServer(server);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const { userId, groupId } =
        await this.liveSession.handleConnection(client);
      client.data = { userId, groupId } satisfies SocketState;
    } catch (error) {
      this.logger.warn(
        `Rejected socket ${client.id}: ${(error as Error).message}`,
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    try {
      await this.liveSession.handleDisconnect(client);
    } catch (error) {
      this.logger.error(
        `Disconnect cleanup failed: ${(error as Error).message}`,
      );
    }
  }

  @SubscribeMessage(RealtimeEvent.LOCATION_SEND)
  onLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<Ack> {
    return this.control(client, (s) =>
      this.liveSession.updateLocation(s.userId, s.groupId, parseLocation(body)),
    );
  }

  @SubscribeMessage(RealtimeEvent.SOS_START)
  onSosStart(@ConnectedSocket() client: Socket): Promise<Ack> {
    return this.control(client, (s) =>
      this.liveSession.startSos(s.userId, s.groupId),
    );
  }

  @SubscribeMessage(RealtimeEvent.SOS_END)
  onSosEnd(@ConnectedSocket() client: Socket): Promise<Ack> {
    return this.control(client, (s) =>
      this.liveSession.endSos(s.userId, s.groupId),
    );
  }

  @SubscribeMessage(RealtimeEvent.TRIP_START)
  onTripStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<Ack> {
    return this.control(client, (s) =>
      this.liveSession.startTrip(s.userId, s.groupId, parseStartTrip(body)),
    );
  }

  @SubscribeMessage(RealtimeEvent.TRIP_EXTEND)
  onTripExtend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<Ack> {
    return this.control(client, (s) =>
      this.liveSession.extendTrip(s.userId, s.groupId, parseExtendTrip(body)),
    );
  }

  @SubscribeMessage(RealtimeEvent.TRIP_END)
  onTripEnd(@ConnectedSocket() client: Socket): Promise<Ack> {
    return this.control(client, (s) =>
      this.liveSession.endTrip(s.userId, s.groupId),
    );
  }

  private async control(
    client: Socket,
    action: (state: SocketState) => Promise<void>,
  ): Promise<Ack> {
    const state = client.data as SocketState | undefined;
    if (!state?.userId) return { status: false, message: 'Not authenticated' };

    try {
      await action(state);
      return { status: true };
    } catch (error) {
      return { status: false, message: (error as Error).message };
    }
  }
}
