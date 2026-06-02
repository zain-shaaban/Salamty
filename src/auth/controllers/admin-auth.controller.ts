import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AdminLoginDto } from '../dto/admin-login.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { NewPasswordDto } from '../dto/new-password.dto.js';
import { ResendOtpDto } from '../dto/resend-otp.dto.js';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.authService.adminLogin(dto, req.headers['user-agent'], req.ip);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.adminForgotPassword(dto.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set new password using OTP' })
  newPassword(@Body() dto: NewPasswordDto) {
    return this.authService.adminNewPassword(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP' })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.adminResendOtp(dto.email);
  }
}
