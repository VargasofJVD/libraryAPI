import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateApprovalRequestDto {
  @ApiProperty({
    description: 'The ID of the user making the request',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'The type of request',
    example: 'book_add',
    enum: ['book_add', 'book_update', 'book_delete'],
  })
  @IsString()
  @IsNotEmpty()
  requestType: string;

  @ApiProperty({
    description: 'The ID of the resource being requested (optional for new items)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  resourceId?: number;

  @ApiProperty({
    description: 'JSON string containing the request details',
    example: '{"title": "New Book", "author": "John Doe"}',
  })
  @IsString()
  @IsNotEmpty()
  requestData: string;
}
