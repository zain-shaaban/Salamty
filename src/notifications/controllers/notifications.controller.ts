import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { NotificationsService } from '../notifications.service.js';
import { ListNotificationsDto } from '../dto/requests/list-notifications.dto.js';
import { UpdateDeviceTokenDto } from '../dto/requests/update-device-token.dto.js';
import { NotificationListSuccessResponseDto } from '../dto/responses/notification-list-response.dto.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user notifications' })
  @ApiOkResponse({ type: NotificationListSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  list(
    @Query() query: ListNotificationsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.listForUser(user.id, query);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  markRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('device-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update the FCM device token for the current session',
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  updateDeviceToken(
    @Body() dto: UpdateDeviceTokenDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.updateDeviceToken(
      user.id,
      dto.notificationToken,
    );
  }
}
