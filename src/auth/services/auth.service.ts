import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import { SessionService } from './session.service.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AdminLoginDto } from '../dto/requests/admin-login.dto.js';
import type { NewPasswordDto } from '../dto/requests/new-password.dto.js';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
  ) {}

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const authToken = this.jwtService.sign(payload);

    await this.sessionService.createSession(user.id, authToken);

    const { password: _unused, ...safeUser } = user;
    void _unused;
    return { authToken, user: safeUser };
  }

  async adminForgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.role === Role.ADMIN) {
      const otp = await this.otpService.createOtp(user.id);
      console.log(`[OTP] Forgot password OTP for ${email}: ${otp}`);
    }

    return { message: 'OTP sent' };
  }

  async adminNewPassword(dto: NewPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.role !== Role.ADMIN) {
      throw new BadRequestException('Invalid request');
    }

    const isValid = await this.otpService.validateAndConsumeOtp(
      user.id,
      dto.otp,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async adminResendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.role === Role.ADMIN) {
      await this.otpService.invalidatePreviousOtps(user.id);
      const otp = await this.otpService.createOtp(user.id);
      console.log(`[OTP] Resend OTP for ${email}: ${otp}`);
    }

    return { message: 'OTP resent' };
  }
}
