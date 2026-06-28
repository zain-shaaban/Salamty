import { ApiProperty } from '@nestjs/swagger';

class RegenerateSecretKeyDataDto {
  @ApiProperty({
    example: 'a3f5c8d2e1b409678901234567890abcdef0123456789abcdef0123456789ab',
  })
  secretKey: string;
}

export class RegenerateSecretKeySuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: RegenerateSecretKeyDataDto })
  data: RegenerateSecretKeyDataDto;
}
