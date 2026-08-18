import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { LiveSessionService } from '../services/live-session.service.js';
import { SendLocationDto } from '../dto/requests/send-location.dto.js';

@ApiTags('Tracking')
@ApiBearerAuth()
@Controller('tracking')
export class LocationController {
  constructor(private readonly liveSession: LiveSessionService) {}

  @Post('location')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Report a location update for a group (HTTP fallback)',
    description:
      'The user must have an active live session for the group (i.e. be ' +
      'connected to the tracking socket). Broadcasts the location to peers.',
  })
  @ApiOkResponse({ description: 'Location accepted' })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiTooManyRequestsResponse({ type: ApiErrorResponseDto })
  async sendLocation(
    @Body() dto: SendLocationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<null> {
    await this.liveSession.updateLocation(user.id, dto.groupId, {
      lat: dto.lat,
      lng: dto.lng,
      time: dto.time,
    });
    return null;
  }
}
