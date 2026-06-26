import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { FcmService } from '../fcm/fcm.service.js';
import { Role } from '../common/enums/role.enum.js';
import { BroadcastChannel } from './enums/broadcast-channel.enum.js';
import type { BroadcastNotificationDto } from './dto/requests/broadcast-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly fcmService: FcmService,
  ) {}

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
        alertType: 'SYSTEM',
      });

      pushQueued = tokens.length;
    }

    return { emailsQueued, pushQueued };
  }
}
