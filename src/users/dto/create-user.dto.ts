/**
 * Create User DTO - Validates user creation requests
 * 
 * Purpose:
 * - Defines the required data structure for creating new users
 * - Implements validation rules for user data
 * - Provides Swagger documentation
 * 
 * Validation Rules:
 * 1. Email:
 *    - Must be valid email format
 *    - Required field
 *    - Must be unique in system
 * 
 * 2. Password:
 *    - Minimum length enforcement
 *    - Complexity requirements
 *    - Required field
 * 
 * 3. Personal Info:
 *    - First and last names required
 *    - Maximum length constraints
 *    - String validation
 * 
 * 4. Role & Status:
 *    - Must be valid enum values
 *    - Optional with defaults
 * 
 * @see UserRole - Available user roles
 * @see UserStatus - Possible user statuses
 * @see UsersService - Service handling user creation
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'securePassword123',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'The role of the user',
    example: UserRole.USER,
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'The status of the user account',
    example: UserStatus.PENDING,
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
