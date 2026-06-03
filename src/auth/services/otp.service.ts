import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';

const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 10;
const DEV_OTP = '111111';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  generateOtp(): string {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    return DEV_OTP;
  }

  async hashValue(value: string): Promise<string> {
    return bcrypt.hash(value, BCRYPT_ROUNDS);
  }

  async verifyValue(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async createOtp(userId: string): Promise<string> {
    const otp = this.generateOtp();
    const hashedOtp = await this.hashValue(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.userAuthOtp.create({
      data: { userId, otp: hashedOtp, expiresAt },
    });

    return otp;
  }

  async invalidatePreviousOtps(userId: string): Promise<void> {
    await this.prisma.userAuthOtp.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });
  }

  async validateAndConsumeOtp(userId: string, otp: string): Promise<boolean> {
    const record = await this.prisma.userAuthOtp.findFirst({
      where: { userId, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return false;

    const isValid = await this.verifyValue(otp, record.otp);
    if (!isValid) return false;

    await this.prisma.userAuthOtp.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    return true;
  }
}
