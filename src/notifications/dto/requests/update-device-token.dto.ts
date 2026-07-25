import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDeviceTokenDto {
  @ApiProperty({
    example: 'fVx9...:APA91bH...',
    description: 'The FCM device registration token for push notifications.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  notificationToken: string;
}
