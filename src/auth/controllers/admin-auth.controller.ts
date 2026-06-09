import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from '../services/auth.service.js';
import { AdminLoginDto } from '../dto/requests/admin-login.dto.js';
import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto.js';
import { NewPasswordDto } from '../dto/requests/new-password.dto.js';
import { ResendOtpDto } from '../dto/requests/resend-otp.dto.js';
import { AdminLoginSuccessResponseDto } from '../dto/responses/admin-login-response.dto.js';
import { MessageSuccessResponseDto } from '../dto/responses/message-success-response.dto.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';

@ApiTags('Admin Auth')
@Public()
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiOkResponse({ type: AdminLoginSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  login(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for password reset' })
  @ApiOkResponse({ type: MessageSuccessResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.adminForgotPassword(dto.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set new password using OTP' })
  @ApiOkResponse({
    type: MessageSuccessResponseDto,
    schema: {
      example: {
        success: true,
        data: { message: 'Password updated successfully' },
      },
    },
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  newPassword(@Body() dto: NewPasswordDto) {
    return this.authService.adminNewPassword(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP' })
  @ApiOkResponse({
    type: MessageSuccessResponseDto,
    schema: {
      example: {
        success: true,
        data: { message: 'OTP resent' },
      },
    },
  })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.adminResendOtp(dto.email);
  }
}
