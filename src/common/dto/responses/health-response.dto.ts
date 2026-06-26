import { ApiProperty } from '@nestjs/swagger';

class HealthDataDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 12345.67 })
  uptime: number;

  @ApiProperty({ example: 1717400000000 })
  timestamp: number;
}

export class HealthSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: HealthDataDto })
  data: HealthDataDto;
}
