import { ApiProperty } from '@nestjs/swagger';

class MessageDataDto {
  @ApiProperty({ example: 'OTP sent' })
  message: string;
}

export class MessageSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: MessageDataDto })
  data: MessageDataDto;
}
