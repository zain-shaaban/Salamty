import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../common/enums/notification-type.enum.js';

class NotificationItemDto {
  @ApiProperty({ example: '3f1c...' })
  id: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.SOS })
  alertType: NotificationType;

  @ApiProperty({ example: 'سلامتي - إشعار خطر' })
  title: string;

  @ApiProperty({ example: 'أحمد في وضع الخطر' })
  body: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: 'a2b4...', nullable: true })
  groupId: string | null;

  @ApiProperty({ example: '2026-07-24T10:15:00.000Z' })
  createdAt: Date;
}

export class NotificationListSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [NotificationItemDto] })
  data: NotificationItemDto[];
}
