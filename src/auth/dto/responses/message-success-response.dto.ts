import { ApiProperty } from '@nestjs/swagger';

class MessageDataDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class MessageSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: MessageDataDto })
  data: MessageDataDto;
}
