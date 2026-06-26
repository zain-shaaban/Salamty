import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum.js';

class AdminAuthProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'admin@admin.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role: Role;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-06-03T06:36:50.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-03T06:36:50.000Z' })
  updatedAt: Date;
}

class AdminLoginDataDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcxNzQwMDAwMCwiZXhwIjoxNzE3NDg2NDAwfQ.example',
  })
  authToken: string;

  @ApiProperty({ type: AdminAuthProfileDto })
  user: AdminAuthProfileDto;
}

export class AdminLoginSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: AdminLoginDataDto })
  data: AdminLoginDataDto;
}
