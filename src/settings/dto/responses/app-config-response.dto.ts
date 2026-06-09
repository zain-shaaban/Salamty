import { ApiProperty } from '@nestjs/swagger';

export class AppConfigDto {
  @ApiProperty({ example: '1.2.0' })
  lastVersion: string;

  @ApiProperty({ example: '1.0.0' })
  requiredVersion: string;

  @ApiProperty({
    example: 'https://play.google.com/store/apps/details?id=com.salamty',
  })
  downloadURL: string;

  @ApiProperty({ example: '2026-06-09T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-09T00:00:00.000Z' })
  updatedAt: Date;
}

export class AppConfigSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: AppConfigDto })
  data: AppConfigDto;
}
