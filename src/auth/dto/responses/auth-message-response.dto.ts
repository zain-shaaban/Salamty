import { ApiProperty } from '@nestjs/swagger';

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

class VerifyEmailMessageDataDto {
  @ApiProperty({
    example: 'Email verified successfully. You can now log in.',
  })
  message: string;
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
