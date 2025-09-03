/**
 * Books Module - Core module for managing library books
 * Key responsibilities:
 * 1. Book inventory management
 * 2. Book metadata handling
 * 3. Book availability tracking
 * 4. Category and author associations
 * 
 * Features:
 * - CRUD operations for books
 * - Search and filter capabilities
 * - Stock management
 * - Book status tracking
 * 
 * Related modules:
 * - AuthorsModule: Book author management
 * - CategoriesModule: Book categorization
 * - LoansModule: Book lending tracking
 * - DatabaseModule: Data persistence
 * 
 * Business rules:
 * - Books must have at least one author
 * - Books must belong to at least one category
 * - Books track their loan status
 * - Books maintain lending history
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AuthorsModule } from '../authors/authors.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [DatabaseModule, AuthorsModule, CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
