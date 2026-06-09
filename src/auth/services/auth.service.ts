import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import { SessionService } from './session.service.js';
import { MailService } from '../../mail/mail.service.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AdminLoginDto } from '../dto/requests/admin-login.dto.js';
import type { NewPasswordDto } from '../dto/requests/new-password.dto.js';
import type { UserRegisterDto } from '../dto/requests/user-register.dto.js';
import type { UserLoginDto } from '../dto/requests/user-login.dto.js';
import type { VerifyEmailDto } from '../dto/requests/verify-email.dto.js';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
  ) {}

  // ─── Admin Auth ─────────────────────────────────────────────────────────────

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
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

    const { password: _p, ...adminUser } = user;
    void _p;

    return { authToken, user: adminUser };
  }

  async adminForgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.role === Role.ADMIN) {
      const otp = await this.otpService.createOtp(user.id);
      await this.mailService.queueOtpEmail({
        to: email,
        username: user.username,
        otp,
      });
    }

    return { message: 'If this email is registered, an OTP has been sent.' };
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

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.sessionService.revokeAllUserSessions(user.id);

    return { message: 'Password updated successfully' };
  }

  async adminResendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.role === Role.ADMIN) {
      await this.otpService.invalidatePreviousOtps(user.id);
      const otp = await this.otpService.createOtp(user.id);
      await this.mailService.queueOtpEmail({
        to: email,
        username: user.username,
        otp,
      });
    }

    return { message: 'If this email is registered, an OTP has been resent.' };
  }

  // ─── User Auth ───────────────────────────────────────────────────────────────

  async userRegister(dto: UserRegisterDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        role: Role.USER,
        confirmed: false,
      },
    });

    const otp = await this.otpService.createOtp(user.id);
    await this.mailService.queueOtpEmail({
      to: user.email,
      username: user.username,
      otp,
    });

    return {
      message:
        'Registration successful. Please check your email for the verification code.',
    };
  }

  async userVerifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.role !== Role.USER) {
      throw new BadRequestException('Invalid request');
    }

    if (user.confirmed) {
      return { message: 'Email already verified' };
    }

    const isValid = await this.otpService.validateAndConsumeOtp(
      user.id,
      dto.otp,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { confirmed: true },
    });

    await this.mailService.queueWelcomeEmail({
      to: user.email,
      username: user.username,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async userLogin(dto: UserLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.role !== Role.USER) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.confirmed) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const authToken = this.jwtService.sign(payload);

    await this.sessionService.createSession(
      user.id,
      authToken,
      dto.notificationToken,
    );

    const { password: _p, secretKey: _s, ...safeUser } = user;
    void _p;
    void _s;
    return { authToken, user: safeUser };
  }

  async userForgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.role === Role.USER && user.confirmed) {
      await this.otpService.invalidatePreviousOtps(user.id);
      const otp = await this.otpService.createOtp(user.id);
      await this.mailService.queueOtpEmail({
        to: email,
        username: user.username,
        otp,
      });
    }

    return { message: 'If this email is registered, an OTP has been sent.' };
  }

  async userResetPassword(dto: NewPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.role !== Role.USER) {
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

    await this.sessionService.revokeAllUserSessions(user.id);

    return { message: 'Password reset successfully. Please log in again.' };
  }

  async userResendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.role === Role.USER) {
      await this.otpService.invalidatePreviousOtps(user.id);
      const otp = await this.otpService.createOtp(user.id);
      await this.mailService.queueOtpEmail({
        to: email,
        username: user.username,
        otp,
      });
    }

    return { message: 'If this email is registered, an OTP has been resent.' };
  }

  async userLogout(userId: string): Promise<{ message: string }> {
    await this.sessionService.revokeAllUserSessions(userId);
    return { message: 'Logged out successfully' };
  }
}
