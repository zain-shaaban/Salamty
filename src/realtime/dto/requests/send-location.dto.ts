import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class SendLocationDto {
  @ApiProperty({ example: 'a2b4-...' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: 34.8959 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 35.8867 })
  @IsLongitude()
  lng: number;

  @ApiProperty({
    example: 1_753_200_000_000,
    description: 'Client epoch milliseconds when the location was captured.',
  })
  @IsNumber()
  @IsPositive()
  time: number;
}
