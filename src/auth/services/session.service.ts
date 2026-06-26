import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(
    userId: string,
    token: string,
    notificationToken?: string,
  ) {
    const hashedToken = await bcrypt.hash(token, 10);
    return this.prisma.userSession.create({
      data: { userId, token: hashedToken, notificationToken, isActive: true },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }
}
