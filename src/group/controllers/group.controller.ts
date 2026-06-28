import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GroupService } from '../group.service.js';
import { CreateGroupDto } from '../dto/requests/create-group.dto.js';
import { AddUserToGroupDto } from '../dto/requests/add-user-to-group.dto.js';
import { LeaveGroupDto } from '../dto/requests/leave-group.dto.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator.js';
import { ApiErrorResponseDto } from '../../common/dto/responses/api-error-response.dto.js';
import { CreateGroupSuccessResponseDto } from '../dto/responses/create-group-response.dto.js';
import { AddUserToGroupSuccessResponseDto } from '../dto/responses/add-user-to-group-response.dto.js';
import { LeaveGroupSuccessResponseDto } from '../dto/responses/leave-group-response.dto.js';
import { GetGroupsSuccessResponseDto } from '../dto/responses/get-groups-response.dto.js';

@ApiTags('Group')
@ApiBearerAuth()
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiOkResponse({ type: CreateGroupSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  createNewGroup(
    @Body() dto: CreateGroupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.groupService.createNewGroup(dto, user.id);
  }

  @Post('adduser')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add a user to a group by secret key',
    description:
      'The invited user must have a verified email (confirmed account).',
  })
  @ApiOkResponse({ type: AddUserToGroupSuccessResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  addUserToGroup(
    @Body() dto: AddUserToGroupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.groupService.addUserToGroup(dto, user.id);
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a group' })
  @ApiOkResponse({ type: LeaveGroupSuccessResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  leaveGroup(
    @Body() dto: LeaveGroupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.groupService.leaveGroup(dto, user.id);
  }

  @Get('get')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all groups for the current user' })
  @ApiOkResponse({ type: GetGroupsSuccessResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  getGroups(@CurrentUser() user: AuthenticatedUser) {
    return this.groupService.getGroups(user.id);
  }
}
