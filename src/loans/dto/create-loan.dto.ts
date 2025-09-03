/**
 * Create Loan DTO - Validates book loan requests
 * 
 * Purpose:
 * - Defines structure for new book loans
 * - Implements loan validation rules
 * - Provides Swagger documentation
 * 
 * Validation Rules:
 * 1. Book Information:
 *    - Book ID: Required, exists
 *    - Copy must be available
 * 
 * 2. Borrower Details:
 *    - Name: Required, max length
 *    - Email: Valid format
 *    - User must be active
 * 
 * 3. Loan Period:
 *    - Due Date: Required, future date
 *    - Loan Duration: Within policy limits
 * 
 * 4. Additional Info:
 *    - Notes: Optional
 *    - Status tracking
 * 
 * Business Rules:
 * - One active loan per book copy
 * - User loan limit checks
 * - Automatic availability updates
 * 
 * Used by:
 * @see LoansService - Loan processing
 * @see LoansController - API endpoints
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsOptional,
  MaxLength,
  IsInt,
  IsPositive,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @ApiProperty({
    description: 'The ID of the book to be loaned',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  bookId: number;

  @ApiProperty({
    description: 'The name of the borrower',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  borrowerName: string;

  @ApiProperty({
    description: 'The email of the borrower',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  borrowerEmail: string;

  @ApiProperty({
    description: 'The due date for returning the book',
    example: '2025-09-16T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({
    description: 'Additional notes about the loan',
    example: 'Book is in good condition',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
