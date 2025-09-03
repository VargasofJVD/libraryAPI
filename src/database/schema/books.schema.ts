/**
 * Books Schema - Defines the database structure for book inventory
 * 
 * Core Fields:
 * 1. Identification
 *    - id: Unique identifier
 *    - isbn: International Standard Book Number
 *    - title: Book title
 * 
 * 2. Description
 *    - description: Book summary
 *    - publicationYear: Year of publication
 *    - pages: Book length
 * 
 * 3. Inventory Management
 *    - price: Book cost
 *    - copiesAvailable: Current available copies
 *    - totalCopies: Total owned copies
 * 
 * Relationships:
 * - Many-to-One with Authors
 * - Many-to-One with Categories
 * - One-to-Many with Loans
 * 
 * Indexes:
 * - Primary: id
 * - Unique: isbn
 * - Foreign: authorId, categoryId
 * 
 * Business Rules:
 * - ISBN must be unique
 * - Must have at least one author and category
 * - Available copies <= Total copies
 * - Price and pages must be positive
 */

import { pgTable, serial, varchar, text, integer, decimal, boolean, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  isbn: varchar('isbn', { length: 20 }).notNull().unique(),
  description: text('description'),
  publicationYear: integer('publication_year'),
  pages: integer('pages'),
  price: decimal('price', { precision: 10, scale: 2 }),
  copiesAvailable: integer('copies_available').notNull().default(0),
  totalCopies: integer('total_copies').notNull().default(0),
  authorId: integer('author_id').notNull(),
  categoryId: integer('category_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  titleIdx: index('books_title_idx').on(table.title),
  isbnIdx: index('books_isbn_idx').on(table.isbn),
  authorIdIdx: index('books_author_id_idx').on(table.authorId),
  categoryIdIdx: index('books_category_id_idx').on(table.categoryId),
  isActiveIdx: index('books_is_active_idx').on(table.isActive),
}));

// Relations will be defined in the index file to avoid circular dependencies

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
