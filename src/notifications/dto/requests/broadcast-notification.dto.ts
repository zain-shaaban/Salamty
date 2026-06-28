import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BroadcastChannel } from '../../enums/broadcast-channel.enum.js';

export class BroadcastNotificationDto {
  @ApiProperty({
    enum: BroadcastChannel,
    example: BroadcastChannel.BOTH,
    description: 'Delivery channel: fcm, email, or both',
  })
  @IsEnum(BroadcastChannel)
  channel: BroadcastChannel;

  @ApiProperty({ example: 'تحديث مهم' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'يرجى تحديث التطبيق إلى أحدث إصدار.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}
