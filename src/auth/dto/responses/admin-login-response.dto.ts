import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.js';

class AdminLoginDataDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcxNzQwMDAwMCwiZXhwIjoxNzE3NDg2NDAwfQ.example',
  })
  authToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class AdminLoginSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: AdminLoginDataDto })
  data: AdminLoginDataDto;
}
