import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { LiveSessionService } from './services/live-session.service.js';
import { TrackingGateway } from './gateways/tracking.gateway.js';
import { GroupEventsGateway } from './gateways/group-events.gateway.js';
import { LocationController } from './controllers/location.controller.js';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [LocationController],
  providers: [LiveSessionService, TrackingGateway, GroupEventsGateway],
  exports: [GroupEventsGateway],
})
export class RealtimeModule {}
