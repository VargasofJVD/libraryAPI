/**
 * Login DTO - Authentication request validation
 * 
 * Example Usage in Swagger UI:
 * 
 * 1. Admin Login:
 * ```json
 * {
 *   "email": "admin@library.com",
 *   "password": "adminPass123!",
 *   "authToken": null
 * }
 * ```
 * 
 * 2. Regular User Login with Token:
 * ```json
 * {
 *   "email": "user@example.com",
 *   "authToken": "eyJhbGciOiJIUzI1NiIs..."
 * }
 * ```
 * 
 * 3. New User Registration:
 * ```json
 * {
 *   "email": "newuser@example.com",
 *   "password": "UserPass123!"
 * }
 * ```
 * 
 * Notes:
 * - Admin users must provide password
 * - Regular users must provide authToken
 * - Email must be valid format
 * - Password should be at least 8 characters
 * - Token format: JWT string
 */

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
