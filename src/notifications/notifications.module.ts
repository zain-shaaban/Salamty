import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MailModule } from '../mail/mail.module.js';
import { FcmModule } from '../fcm/fcm.module.js';
import { NotificationsService } from './notifications.service.js';
import { AdminNotificationsController } from './controllers/admin-notifications.controller.js';

@Module({
  imports: [PrismaModule, MailModule, FcmModule],
  controllers: [AdminNotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
