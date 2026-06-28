import { ApiProperty } from '@nestjs/swagger';

class AddUserToGroupDataDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;
}

export class AddUserToGroupSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: AddUserToGroupDataDto })
  data: AddUserToGroupDataDto;
}
