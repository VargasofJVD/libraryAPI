/**
 * Create Category DTO - Validates category creation requests
 * 
 * Purpose:
 * - Defines structure for new book categories
 * - Implements category validation rules
 * - Provides Swagger documentation
 * 
 * Validation Rules:
 * 1. Name:
 *    - Required field
 *    - String validation
 *    - Maximum length (100 chars)
 *    - Must be unique
 * 
 * 2. Description:
 *    - Optional field
 *    - Text validation
 *    - No length limit
 * 
 * Business Rules:
 * - Categories are unique by name
 * - Categories are active by default
 * - Used for book classification
 * 
 * Used by:
 * @see CategoriesService - Category management
 * @see CategoriesController - API endpoints
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Fiction',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'A description of the category',
    example: 'Fictional literature and stories',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
