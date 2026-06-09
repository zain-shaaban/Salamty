import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppConfigDto {
  @ApiPropertyOptional({ example: '1.2.0' })
  @IsOptional()
  @IsString()
  lastVersion?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  requiredVersion?: string;

  @ApiPropertyOptional({
    example: 'https://play.google.com/store/apps/details?id=com.salamty',
  })
  @IsOptional()
  @IsString()
  downloadURL?: string;
}
