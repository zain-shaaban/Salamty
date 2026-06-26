import { ApiProperty } from '@nestjs/swagger';

export class LeaveGroupSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    nullable: true,
    example: null,
    type: Object,
  })
  data: object | null;
}
