import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpType } from '../../common/enums/otp-type.enum.js';

const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async hashValue(value: string): Promise<string> {
    return bcrypt.hash(value, BCRYPT_ROUNDS);
  }

  async verifyValue(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async createOtp(userId: string, type: OtpType): Promise<string> {
    const otp = this.generateOtp();
    const hashedOtp = await this.hashValue(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.userAuthOtp.create({
      data: { userId, otp: hashedOtp, type, expiresAt },
    });

    return otp;
  }

  async invalidatePreviousOtps(userId: string, type: OtpType): Promise<void> {
    await this.prisma.userAuthOtp.updateMany({
      where: { userId, type, isUsed: false },
      data: { isUsed: true },
    });
  }

  async validateAndConsumeOtp(userId: string, otp: string, type: OtpType): Promise<boolean> {
    const record = await this.prisma.userAuthOtp.findFirst({
      where: { userId, type, isUsed: false, expiresAt: { gt: new Date() } },
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
