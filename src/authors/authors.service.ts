import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { authors, books } from '../database/schema';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class AuthorsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any }
  ) {}

  private get db() {
    return this.dbConnection.db;
  }

  async create(createAuthorDto: CreateAuthorDto) {
    // Check if author with same email already exists
    const existingAuthor = await this.db
      .select()
      .from(authors)
      .where(eq(authors.email, createAuthorDto.email))
      .limit(1);

    if (existingAuthor.length > 0) {
      throw new BadRequestException(`Author with email '${createAuthorDto.email}' already exists`);
    }

    const [author] = await this.db
      .insert(authors)
      .values(createAuthorDto)
      .returning();

    return author;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(authors.firstName, `%${search}%`),
          like(authors.lastName, `%${search}%`),
          like(authors.email, `%${search}%`)
        )
      );
    }
    
    whereConditions.push(eq(authors.isActive, true));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const authorsList = await this.db
      .select()
      .from(authors)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(authors.createdAt));

    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(authors)
      .where(whereClause);
    
    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: authorsList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number) {
    const [author] = await this.db
      .select()
      .from(authors)
      .where(eq(authors.id, id))
      .limit(1);

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async findOneWithBooks(id: number) {
    const [author] = await this.db
      .select({
        id: authors.id,
        firstName: authors.firstName,
        lastName: authors.lastName,
        biography: authors.biography,
        email: authors.email,
        isActive: authors.isActive,
        createdAt: authors.createdAt,
        updatedAt: authors.updatedAt,
        books: sql<number>`count(${books.id})`.as('booksCount'),
      })
      .from(authors)
      .leftJoin(books, eq(authors.id, books.authorId))
      .where(eq(authors.id, id))
      .groupBy(authors.id)
      .limit(1);

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    // Check if author exists
    const existingAuthor = await this.db
      .select()
      .from(authors)
      .where(eq(authors.id, id))
      .limit(1);

    if (existingAuthor.length === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    // If updating email, check if new email already exists
    if (updateAuthorDto.email) {
      const duplicateAuthor = await this.db
        .select()
        .from(authors)
        .where(
          and(
            eq(authors.email, updateAuthorDto.email),
            sql`${authors.id} != ${id}`
          )
        )
        .limit(1);

      if (duplicateAuthor.length > 0) {
        throw new BadRequestException(`Author with email '${updateAuthorDto.email}' already exists`);
      }
    }

    const [updatedAuthor] = await this.db
      .update(authors)
      .set({ ...updateAuthorDto, updatedAt: new Date() })
      .where(eq(authors.id, id))
      .returning();

    return updatedAuthor;
  }

  async remove(id: number) {
    // Check if author exists
    const existingAuthor = await this.db
      .select()
      .from(authors)
      .where(eq(authors.id, id))
      .limit(1);

    if (existingAuthor.length === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    // Check if author has associated books
    const associatedBooks = await this.db
      .select()
      .from(books)
      .where(eq(books.authorId, id))
      .limit(1);

    if (associatedBooks.length > 0) {
      throw new BadRequestException('Cannot delete author with associated books');
    }

    // Soft delete - mark as inactive
    const [deletedAuthor] = await this.db
      .update(authors)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(authors.id, id))
      .returning();

    return { message: 'Author deleted successfully', author: deletedAuthor };
  }
}
