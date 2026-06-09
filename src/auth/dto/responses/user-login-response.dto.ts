import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum.js';

class UserAuthProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ example: true })
  confirmed: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-06-09T10:00:00.000Z' })
  createdAt: Date;
}

class UserLoginDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  authToken: string;

  @ApiProperty({ type: UserAuthProfileDto })
  user: UserAuthProfileDto;
}

export class UserLoginSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: UserLoginDataDto })
  data: UserLoginDataDto;
}
