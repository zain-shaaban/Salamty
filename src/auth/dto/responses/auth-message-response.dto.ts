import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum.js';

class MessageDataDto {
  @ApiProperty()
  message: string;
}

class AuthMessageSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: MessageDataDto })
  data: MessageDataDto;
}

class RegisterMessageDataDto {
  @ApiProperty({
    example:
      'Registration successful. Please check your email for the verification code.',
  })
  message: string;
}

export class RegisterSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: RegisterMessageDataDto })
  declare data: RegisterMessageDataDto;
}

class VerifyEmailUserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ example: true })
  confirmed: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-06-09T10:00:00.000Z' })
  createdAt: Date;
}

class VerifyEmailMessageDataDto {
  @ApiProperty({
    example: 'Email verified successfully.',
  })
  message: string;

  @ApiPropertyOptional({
    description:
      'Absent only when the account was already verified previously.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  authToken?: string;

  @ApiPropertyOptional({ type: VerifyEmailUserProfileDto })
  user?: VerifyEmailUserProfileDto;

  @ApiPropertyOptional({
    description:
      'One-time plain secret key — never retrievable again after this response. Absent only when the account was already verified previously.',
    example: 'a3f5c8d2e1b409678901234567890abcdef0123456789abcdef0123456789ab',
  })
  secretKey?: string;
}

export class VerifyEmailSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: VerifyEmailMessageDataDto })
  declare data: VerifyEmailMessageDataDto;
}

class ForgotPasswordMessageDataDto {
  @ApiProperty({
    example: 'If this email is registered, an OTP has been sent.',
  })
  message: string;
}

export class ForgotPasswordSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: ForgotPasswordMessageDataDto })
  declare data: ForgotPasswordMessageDataDto;
}

class ResetPasswordMessageDataDto {
  @ApiProperty({
    example: 'Password reset successfully. Please log in again.',
  })
  message: string;
}

export class ResetPasswordSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: ResetPasswordMessageDataDto })
  declare data: ResetPasswordMessageDataDto;
}

class ResendOtpMessageDataDto {
  @ApiProperty({
    example: 'If this email is registered, an OTP has been resent.',
  })
  message: string;
}

export class ResendOtpSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: ResendOtpMessageDataDto })
  declare data: ResendOtpMessageDataDto;
}

class LogoutMessageDataDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}

export class LogoutSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: LogoutMessageDataDto })
  declare data: LogoutMessageDataDto;
}

class NewPasswordMessageDataDto {
  @ApiProperty({ example: 'Password updated successfully' })
  message: string;
}

export class NewPasswordSuccessResponseDto extends AuthMessageSuccessResponseDto {
  @ApiProperty({ type: NewPasswordMessageDataDto })
  declare data: NewPasswordMessageDataDto;
}
