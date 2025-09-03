/**
 * Authors Module - Manages book author information
 * Key responsibilities:
 * 1. Author information management
 * 2. Author-book relationships
 * 3. Author metadata handling
 * 4. Author search capabilities
 * 
 * Features:
 * - CRUD operations for authors
 * - Author search and filtering
 * - Book association management
 * - Author biography handling
 * 
 * Dependencies:
 * - DatabaseModule: Data persistence
 * 
 * Used by:
 * - BooksModule: For book authorship
 * - Search features: For finding books by author
 * 
 * Business rules:
 * - Authors must have unique names or identifiers
 * - Books must have at least one author
 * - Author deletion requires handling book associations
 * - Author information includes bio and bibliography
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
