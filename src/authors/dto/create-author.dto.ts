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
