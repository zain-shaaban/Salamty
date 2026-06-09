import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MyPass@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'fcm-device-token-here',
    description: 'FCM device token for push notifications',
  })
  @IsOptional()
  @IsString()
  notificationToken?: string;
}
