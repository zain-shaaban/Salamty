import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from '../services/auth.service.js';
import { UserRegisterDto } from '../dto/requests/user-register.dto.js';
import { UserLoginDto } from '../dto/requests/user-login.dto.js';
import { VerifyEmailDto } from '../dto/requests/verify-email.dto.js';
import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto.js';
import { NewPasswordDto } from '../dto/requests/new-password.dto.js';
import { ResendOtpDto } from '../dto/requests/resend-otp.dto.js';
import { UserLoginSuccessResponseDto } from '../dto/responses/user-login-response.dto.js';
import { RegenerateSecretKeySuccessResponseDto } from '../dto/responses/regenerate-secret-key-response.dto.js';
import {
  ForgotPasswordSuccessResponseDto,
  LogoutSuccessResponseDto,
  RegisterSuccessResponseDto,
  ResendOtpSuccessResponseDto,
  ResetPasswordSuccessResponseDto,
  VerifyEmailSuccessResponseDto,
} from '../dto/responses/auth-message-response.dto.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('User Auth')
@Controller('auth')
export class UserAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({ type: RegisterSuccessResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  register(@Body() dto: UserRegisterDto) {
    return this.authService.userRegister(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email using OTP',
    description:
      'Returns "Email verified successfully. You can now log in." on success, or "Email already verified" if the account was already confirmed.',
  })
  @ApiOkResponse({ type: VerifyEmailSuccessResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.userVerifyEmail(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({ type: UserLoginSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  login(@Body() dto: UserLoginDto) {
    return this.authService.userLogin(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for password reset' })
  @ApiOkResponse({ type: ForgotPasswordSuccessResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.userForgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiOkResponse({ type: ResetPasswordSuccessResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  resetPassword(@Body() dto: NewPasswordDto) {
    return this.authService.userResetPassword(dto);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP (verification or password reset)' })
  @ApiOkResponse({ type: ResendOtpSuccessResponseDto })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.userResendOtp(dto.email);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiOkResponse({ type: LogoutSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.userLogout(user.id);
  }

  @Post('regenerate-secret-key')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerate secret key for the current user',
    description:
      'Invalidates the previous secret key and returns a new plain secret key.',
  })
  @ApiOkResponse({ type: RegenerateSecretKeySuccessResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  regenerateSecretKey(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.regenerateSecretKey(user.id);
  }
}
