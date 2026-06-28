import { ApiProperty } from '@nestjs/swagger';

class BroadcastNotificationDataDto {
  @ApiProperty({ example: 42 })
  emailsQueued: number;

  @ApiProperty({ example: 18 })
  pushQueued: number;
}

export class BroadcastNotificationSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: BroadcastNotificationDataDto })
  data: BroadcastNotificationDataDto;
}
