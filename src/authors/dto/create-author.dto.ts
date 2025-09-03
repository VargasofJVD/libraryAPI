/**
 * Create Author DTO - Validates author creation requests
 * 
 * Purpose:
 * - Defines structure for new author entries
 * - Implements author validation rules
 * - Provides Swagger documentation
 * 
 * Validation Rules:
 * 1. Name Fields:
 *    - First Name: Required, max length 100
 *    - Last Name: Required, max length 100
 *    - String validation for both
 * 
 * 2. Contact Info:
 *    - Email: Required, valid format
 *    - Must be unique in system
 * 
 * 3. Optional Fields:
 *    - Biography: Text field
 *    - No length restriction
 * 
 * Business Rules:
 * - Authors are active by default
 * - Email must be unique
 * - Can be associated with multiple books
 * 
 * Used by:
 * @see AuthorsService - Author management
 * @see AuthorsController - API endpoints
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'The first name of the author',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'The last name of the author',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'The biography of the author',
    example: 'A renowned author known for...',
    required: false,
  })
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiProperty({
    description: 'The email address of the author',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}
