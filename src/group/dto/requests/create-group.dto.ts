import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Family' })
  @IsString()
  @IsNotEmpty({ message: 'Group name is required.' })
  @MaxLength(200)
  groupName: string;
}
