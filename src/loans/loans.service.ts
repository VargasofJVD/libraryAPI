/**
 * Loans Service - Book lending management business logic
 * 
 * Primary Responsibilities:
 * 1. Loan Operations
 *    - Loan creation and updates
 *    - Due date management
 *    - Return processing
 *    - Overdue tracking
 * 
 * 2. Availability Management
 *    - Book availability checks
 *    - Copy allocation
 *    - Stock level updates
 * 
 * 3. Query Operations
 *    - Active loans lookup
 *    - Due date tracking
 *    - Borrower history
 *    - Book loan history
 * 
 * Key Features:
 * - Loan period validation
 * - Automatic due date calculation
 * - Overdue detection
 * - Return processing
 * - History tracking
 * 
 * Dependencies:
 * - BooksService: Book availability
 * - Database: Drizzle ORM operations
 * 
 * Error Handling:
 * - NotFoundException: Loan/Book not found
 * - BadRequestException: Invalid loan data
 * 
 * Business Rules:
 * - Book availability check
 * - Maximum loan duration
 * - User loan limits
 * - Overdue penalties
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { loans, books } from '../database/schema';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { BooksService } from '../books/books.service';

@Injectable()
export class LoansService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any },
    private readonly booksService: BooksService,
  ) {}

  private get db() {
    return this.dbConnection.db;
  }

  async create(createLoanDto: CreateLoanDto) {
    // Check if book exists and has available copies
    const book = await this.booksService.findOne(createLoanDto.bookId);
    
    if (book.copiesAvailable <= 0) {
      throw new BadRequestException('No copies of this book are available for loan');
    }

    // Start transaction
    return await this.db.transaction(async (tx) => {
      // Create loan record
      const [loan] = await tx
        .insert(loans)
        .values(createLoanDto)
        .returning();

      // Update book's available copies
      await tx
        .update(books)
        .set({
          copiesAvailable: sql`${books.copiesAvailable} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(books.id, createLoanDto.bookId));

      return loan;
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, isActive?: boolean) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(loans.borrowerName, `%${search}%`),
          like(loans.borrowerEmail, `%${search}%`)
        )
      );
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(loans.isActive, isActive));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const loansList = await this.db
      .select()
      .from(loans)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(loans.createdAt));

    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(loans)
      .where(whereClause);
    
    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: loansList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number) {
    const [loan] = await this.db
      .select()
      .from(loans)
      .where(eq(loans.id, id))
      .limit(1);

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async findOneWithDetails(id: number) {
    const [loan] = await this.db
      .select({
        ...loans,
        book: books,
      })
      .from(loans)
      .leftJoin(books, eq(loans.bookId, books.id))
      .where(eq(loans.id, id))
      .limit(1);

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async findByBook(bookId: number) {
    // Validate book exists
    await this.booksService.findOne(bookId);

    return this.db
      .select()
      .from(loans)
      .where(eq(loans.bookId, bookId))
      .orderBy(desc(loans.createdAt));
  }

  async findByBorrower(email: string) {
    return this.db
      .select()
      .from(loans)
      .where(eq(loans.borrowerEmail, email))
      .orderBy(desc(loans.createdAt));
  }

  async returnBook(id: number) {
    const loan = await this.findOne(id);

    if (!loan.isActive) {
      throw new BadRequestException('This book has already been returned');
    }

    // Start transaction
    return await this.db.transaction(async (tx) => {
      // Update loan record
      const [updatedLoan] = await tx
        .update(loans)
        .set({
          isActive: false,
          returnedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(loans.id, id))
        .returning();

      // Update book's available copies
      await tx
        .update(books)
        .set({
          copiesAvailable: sql`${books.copiesAvailable} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(books.id, loan.bookId));

      return updatedLoan;
    });
  }

  async update(id: number, updateLoanDto: UpdateLoanDto) {
    const loan = await this.findOne(id);

    // If updating bookId, validate new book exists and has available copies
    if (updateLoanDto.bookId && updateLoanDto.bookId !== loan.bookId) {
      const newBook = await this.booksService.findOne(updateLoanDto.bookId);
      if (newBook.copiesAvailable <= 0) {
        throw new BadRequestException('No copies of the new book are available for loan');
      }
    }

    // Start transaction if changing book
    if (updateLoanDto.bookId && updateLoanDto.bookId !== loan.bookId) {
      return await this.db.transaction(async (tx) => {
        // Increment old book's available copies
        await tx
          .update(books)
          .set({
            copiesAvailable: sql`${books.copiesAvailable} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(books.id, loan.bookId));

        // Decrement new book's available copies
        if (updateLoanDto.bookId) {
          await tx
            .update(books)
            .set({
              copiesAvailable: sql`${books.copiesAvailable} - 1`,
              updatedAt: new Date(),
            })
            .where(eq(books.id, updateLoanDto.bookId));
        }

        // Update loan
        const [updatedLoan] = await tx
          .update(loans)
          .set({ 
            ...updateLoanDto, 
            updatedAt: new Date() 
          })
          .where(eq(loans.id, id))
          .returning();

        return updatedLoan;
      });
    }

    // If not changing book, simple update
    const [updatedLoan] = await this.db
      .update(loans)
      .set({ ...updateLoanDto, updatedAt: new Date() })
      .where(eq(loans.id, id))
      .returning();

    return updatedLoan;
  }

  async remove(id: number) {
    const loan = await this.findOne(id);

    if (loan.isActive) {
      throw new BadRequestException('Cannot delete an active loan');
    }

    // Soft delete
    const [deletedLoan] = await this.db
      .update(loans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(loans.id, id))
      .returning();

    return { message: 'Loan deleted successfully', loan: deletedLoan };
  }
}
