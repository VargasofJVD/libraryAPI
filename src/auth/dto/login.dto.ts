import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user account (required for admin users)',
    example: 'securePassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'The authentication token provided by admin (required for regular users)',
    example: 'a1b2c3d4e5f6...',
    required: false,
  })
  @IsOptional()
  @IsString()
  authToken?: string;
}
