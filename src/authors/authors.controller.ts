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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiResponse({ status: 201, description: 'Author created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate email' })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all authors with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for author name or email' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.authorsService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.findOne(id);
  }

  @Get(':id/with-books')
  @ApiOperation({ summary: 'Get an author by ID with book count' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author with book count retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findOneWithBooks(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.findOneWithBooks(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an author' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author updated successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate email' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an author (soft delete)' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author deleted successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete author with associated books' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.remove(id);
  }
}
