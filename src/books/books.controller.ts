/**
 * Books Controller - API endpoints for book management
 * 
 * Endpoints:
 * 1. Book Management
 *    - POST /books - Add new book
 *    - GET /books - List books (with filters)
 *    - GET /books/:id - Get book details
 *    - PATCH /books/:id - Update book
 *    - DELETE /books/:id - Remove book
 * 
 * 2. Book Search
 *    - GET /books/search - Search books
 *    - GET /books/category/:id - Books by category
 *    - GET /books/author/:id - Books by author
 * 
 * Query Parameters:
 * - search: Search in title/description
 * - category: Filter by category
 * - author: Filter by author
 * - available: Filter by availability
 * - page/limit: Pagination
 * 
 * Features:
 * - Advanced search capabilities
 * - Pagination and filtering
 * - Category/Author associations
 * - Stock management
 * 
 * Swagger Documentation:
 * @ApiTags('books')
 * 
 * Error Responses:
 * - 404: Book not found
 * - 400: Invalid input
 * - 409: ISBN conflict
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate ISBN' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for book title or ISBN' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.booksService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get a book by ID with author and category details' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOneWithDetails(id);
  }

  @Get('by-author/:authorId')
  @ApiOperation({ summary: 'Get all books by author ID' })
  @ApiParam({ name: 'authorId', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Books retrieved successfully' })
  findByAuthor(@Param('authorId', ParseIntPipe) authorId: number) {
    return this.booksService.findByAuthor(authorId);
  }

  @Get('by-category/:categoryId')
  @ApiOperation({ summary: 'Get all books by category ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Books retrieved successfully' })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.booksService.findByCategory(categoryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate ISBN' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book (soft delete)' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete book with active loans' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
