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
