import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { SettingsService } from '../settings.service.js';
import { AppConfigSuccessResponseDto } from '../dto/responses/app-config-response.dto.js';

@ApiTags('Settings')
@Public()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get app config' })
  @ApiOkResponse({ type: AppConfigSuccessResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  getAppConfig() {
    return this.settingsService.getAppConfig();
  }
}
