import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { SettingsService } from '../settings.service.js';
import { UpdateAppConfigDto } from '../dto/requests/update-app-config.dto.js';
import { AppConfigSuccessResponseDto } from '../dto/responses/app-config-response.dto.js';

@ApiTags('Admin Settings')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update app config' })
  @ApiOkResponse({ type: AppConfigSuccessResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  updateAppConfig(@Body() dto: UpdateAppConfigDto) {
    return this.settingsService.updateAppConfig(dto);
  }
}
