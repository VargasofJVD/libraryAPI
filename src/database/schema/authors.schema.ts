/**
 * Authors Schema - Book author information management
 * 
 * Core Fields:
 * 1. Personal Info
 *    - id: Unique identifier
 *    - firstName/lastName: Author's name
 *    - biography: Author's background
 *    - email: Contact information
 * 
 * 2. Status & Tracking
 *    - isActive: Author availability
 *    - createdAt/updatedAt: Timestamps
 * 
 * Performance Optimizations:
 * - Indexes on firstName and lastName
 * - Compound index for full name searches
 * - Index on email for unique constraint
 * 
 * Relationships:
 * - One-to-Many with Books
 * - Many-to-Many through book_authors
 * 
 * Business Rules:
 * - Unique email addresses
 * - Required name fields
 * - Authors can be deactivated
 * - Authors can have multiple books
 * 
 * Usage:
 * - Author management
 * - Book attribution
 * - Contact information
 */

import { pgTable, serial, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  biography: text('biography'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  firstNameIdx: index('authors_first_name_idx').on(table.firstName),
  lastNameIdx: index('authors_last_name_idx').on(table.lastName),
  emailIdx: index('authors_email_idx').on(table.email),
  isActiveIdx: index('authors_is_active_idx').on(table.isActive),
}));

// Relations will be defined in the index file to avoid circular dependencies

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
