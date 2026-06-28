import { ApiProperty } from '@nestjs/swagger';

class CreateGroupDataDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  groupId: string;
}

export class CreateGroupSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: CreateGroupDataDto })
  data: CreateGroupDataDto;
}
