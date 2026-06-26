import { ApiProperty } from '@nestjs/swagger';

class GroupMemberDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;
}

class GroupListItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Family' })
  groupName: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  createdById: string;

  @ApiProperty({ type: [GroupMemberDto] })
  members: GroupMemberDto[];
}

export class GetGroupsSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [GroupListItemDto] })
  data: GroupListItemDto[];
}
