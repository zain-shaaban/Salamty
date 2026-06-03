import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { HealthSuccessResponseDto } from './dto/responses/health-response.dto.js';
import { ApiErrorResponseDto } from '../common/dto/responses/api-error-response.dto.js';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Health check (admin only)' })
  @ApiOkResponse({ type: HealthSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  }
}
