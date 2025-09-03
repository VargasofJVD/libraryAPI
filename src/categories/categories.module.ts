/**
 * Categories Module - Manages book categorization system
 * Key responsibilities:
 * 1. Category management (create, update, delete)
 * 2. Category hierarchy maintenance
 * 3. Book-category associations
 * 4. Category metadata handling
 * 
 * Features:
 * - CRUD operations for categories
 * - Category search and filtering
 * - Category validation
 * - Book categorization support
 * 
 * Dependencies:
 * - DatabaseModule: Data persistence
 * 
 * Used by:
 * - BooksModule: For book categorization
 * - Search features: For filtering books by category
 * 
 * Business rules:
 * - Categories must have unique names
 * - Books can belong to multiple categories
 * - Categories can be hierarchical (parent-child)
 * - Category deletion requires handling book associations
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
