import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  IsInt,
  IsPositive,
  Matches,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'The ISBN (International Standard Book Number)',
    example: '978-0743273565',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^(?:\d{10}|\d{13}|(?:\d{9}X|\d{12}X))$/, {
    message: 'ISBN must be a valid 10 or 13 digit number (can end with X)',
  })
  isbn: string;

  @ApiProperty({
    description: 'A description of the book',
    example: 'A novel about the mysterious millionaire Jay Gatsby...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The year the book was published',
    example: 1925,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1000)
  publicationYear?: number;

  @ApiProperty({
    description: 'The number of pages in the book',
    example: 180,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @IsPositive()
  pages?: number;

  @ApiProperty({
    description: 'The price of the book',
    example: 19.99,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty({
    description: 'The number of copies available for loan',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  copiesAvailable: number;

  @ApiProperty({
    description: 'The total number of copies owned by the library',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  totalCopies: number;

  @ApiProperty({
    description: 'The ID of the author',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  authorId: number;

  @ApiProperty({
    description: 'The ID of the category',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  categoryId: number;
}
