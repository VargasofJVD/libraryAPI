import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { books, authors, categories, loans } from '../database/schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { AuthorsService } from '../authors/authors.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class BooksService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any },
    private readonly authorsService: AuthorsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private get db() {
    return this.dbConnection.db;
  }

  async create(createBookDto: CreateBookDto) {
    // Check if book with same ISBN already exists
    const existingBook = await this.db
      .select()
      .from(books)
      .where(eq(books.isbn, createBookDto.isbn))
      .limit(1);

    if (existingBook.length > 0) {
      throw new BadRequestException(`Book with ISBN '${createBookDto.isbn}' already exists`);
    }

    // Validate author exists
    await this.authorsService.findOne(createBookDto.authorId);

    // Validate category exists
    await this.categoriesService.findOne(createBookDto.categoryId);

    const [book] = await this.db
      .insert(books)
      .values(createBookDto)
      .returning();

    return book;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(books.title, `%${search}%`),
          like(books.isbn, `%${search}%`)
        )
      );
    }
    
    whereConditions.push(eq(books.isActive, true));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const booksList = await this.db
      .select()
      .from(books)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(books.createdAt));

    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(whereClause);
    
    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: booksList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number) {
    const [book] = await this.db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async findOneWithDetails(id: number) {
    const [book] = await this.db
      .select({
        ...books,
        author: authors,
        category: categories,
        activeLoans: sql<number>`count(${loans.id})`.as('activeLoansCount'),
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(loans, and(eq(books.id, loans.bookId), eq(loans.isActive, true)))
      .where(eq(books.id, id))
      .groupBy(books.id, authors.id, categories.id)
      .limit(1);

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async findByAuthor(authorId: number) {
    // Validate author exists
    await this.authorsService.findOne(authorId);

    return this.db
      .select()
      .from(books)
      .where(
        and(
          eq(books.authorId, authorId),
          eq(books.isActive, true)
        )
      )
      .orderBy(desc(books.createdAt));
  }

  async findByCategory(categoryId: number) {
    // Validate category exists
    await this.categoriesService.findOne(categoryId);

    return this.db
      .select()
      .from(books)
      .where(
        and(
          eq(books.categoryId, categoryId),
          eq(books.isActive, true)
        )
      )
      .orderBy(desc(books.createdAt));
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    // Check if book exists
    const existingBook = await this.db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (existingBook.length === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // If updating ISBN, check if new ISBN already exists
    if (updateBookDto.isbn) {
      const duplicateBook = await this.db
        .select()
        .from(books)
        .where(
          and(
            eq(books.isbn, updateBookDto.isbn),
            sql`${books.id} != ${id}`
          )
        )
        .limit(1);

      if (duplicateBook.length > 0) {
        throw new BadRequestException(`Book with ISBN '${updateBookDto.isbn}' already exists`);
      }
    }

    // If updating author, validate author exists
    if (updateBookDto.authorId) {
      await this.authorsService.findOne(updateBookDto.authorId);
    }

    // If updating category, validate category exists
    if (updateBookDto.categoryId) {
      await this.categoriesService.findOne(updateBookDto.categoryId);
    }

    const [updatedBook] = await this.db
      .update(books)
      .set({ ...updateBookDto, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();

    return updatedBook;
  }

  async remove(id: number) {
    // Check if book exists
    const existingBook = await this.db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (existingBook.length === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Check if book has active loans
    const activeLoans = await this.db
      .select()
      .from(loans)
      .where(
        and(
          eq(loans.bookId, id),
          eq(loans.isActive, true)
        )
      )
      .limit(1);

    if (activeLoans.length > 0) {
      throw new BadRequestException('Cannot delete book with active loans');
    }

    // Soft delete - mark as inactive
    const [deletedBook] = await this.db
      .update(books)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();

    return { message: 'Book deleted successfully', book: deletedBook };
  }
}
