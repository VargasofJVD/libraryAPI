import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { categories, books } from '../database/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any }
  ) {}

  private get db() {
    return this.dbConnection.db;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category with same name already exists
    const existingCategory = await this.db
      .select()
      .from(categories)
      .where(eq(categories.name, createCategoryDto.name))
      .limit(1);

    if (existingCategory.length > 0) {
      throw new BadRequestException(`Category with name '${createCategoryDto.name}' already exists`);
    }

    const [category] = await this.db
      .insert(categories)
      .values(createCategoryDto)
      .returning();

    return category;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        like(categories.name, `%${search}%`)
      );
    }
    
    whereConditions.push(eq(categories.isActive, true));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const categoriesList = await this.db
      .select()
      .from(categories)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(categories.createdAt));

    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(whereClause);
    
    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: categoriesList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findOneWithBooks(id: number) {
    const [category] = await this.db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        books: sql<number>`count(${books.id})`.as('booksCount'),
      })
      .from(categories)
      .leftJoin(books, eq(categories.id, books.categoryId))
      .where(eq(categories.id, id))
      .groupBy(categories.id)
      .limit(1);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    const existingCategory = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existingCategory.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // If updating name, check if new name already exists
    if (updateCategoryDto.name) {
      const duplicateCategory = await this.db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.name, updateCategoryDto.name),
            sql`${categories.id} != ${id}`
          )
        )
        .limit(1);

      if (duplicateCategory.length > 0) {
        throw new BadRequestException(`Category with name '${updateCategoryDto.name}' already exists`);
      }
    }

    const [updatedCategory] = await this.db
      .update(categories)
      .set({ ...updateCategoryDto, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return updatedCategory;
  }

  async remove(id: number) {
    // Check if category exists
    const existingCategory = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existingCategory.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has associated books
    const associatedBooks = await this.db
      .select()
      .from(books)
      .where(eq(books.categoryId, id))
      .limit(1);

    if (associatedBooks.length > 0) {
      throw new BadRequestException('Cannot delete category with associated books');
    }

    // Soft delete - mark as inactive
    const [deletedCategory] = await this.db
      .update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return { message: 'Category deleted successfully', category: deletedCategory };
  }
}
