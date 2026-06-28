import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddUserToGroupDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsUUID()
  @IsNotEmpty({ message: 'Group id is required.' })
  groupId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsString()
  @IsNotEmpty({ message: 'Secret key is required.' })
  secretKey: string;
}
