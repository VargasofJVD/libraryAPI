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
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or book unavailable' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for borrower name or email' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('active') active?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const isActive = active ? active === 'true' : undefined;
    return this.loansService.findAll(pageNum, limitNum, search, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a loan by ID' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({ status: 200, description: 'Loan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get a loan by ID with book details' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({ status: 200, description: 'Loan details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findOneWithDetails(id);
  }

  @Get('by-book/:bookId')
  @ApiOperation({ summary: 'Get all loans for a specific book' })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  findByBook(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.loansService.findByBook(bookId);
  }

  @Get('by-borrower/:email')
  @ApiOperation({ summary: 'Get all loans for a specific borrower' })
  @ApiParam({ name: 'email', description: 'Borrower email' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  findByBorrower(@Param('email') email: string) {
    return this.loansService.findByBorrower(email);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Mark a loan as returned' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({ status: 200, description: 'Book returned successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 400, description: 'Book already returned' })
  returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnBook(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a loan (soft delete)' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({ status: 200, description: 'Loan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete active loan' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.remove(id);
  }
}
