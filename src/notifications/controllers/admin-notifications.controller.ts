import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { NotificationsService } from '../notifications.service.js';
import { BroadcastNotificationDto } from '../dto/requests/broadcast-notification.dto.js';
import { BroadcastNotificationSuccessResponseDto } from '../dto/responses/broadcast-notification-response.dto.js';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a notification to all app users',
    description:
      'Broadcast via FCM push, Gmail email, or both. Targets active confirmed users (email) and active sessions with a device token (FCM).',
  })
  @ApiOkResponse({ type: BroadcastNotificationSuccessResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastToAllUsers(dto);
  }
}
