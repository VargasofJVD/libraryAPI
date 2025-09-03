/**
 * Categories Schema - Book classification system
 * 
 * Core Fields:
 * 1. Basic Info
 *    - id: Unique identifier
 *    - name: Category name (unique)
 *    - description: Category details
 * 
 * 2. Status & Tracking
 *    - isActive: Category availability
 *    - createdAt/updatedAt: Timestamps
 * 
 * Performance Optimizations:
 * - Index on name for fast lookups
 * - Index on isActive for filtering
 * 
 * Relationships:
 * - One-to-Many with Books
 * - Many-to-Many through book_categories
 * 
 * Business Rules:
 * - Unique category names
 * - Categories can be deactivated
 * - Categories can have multiple books
 * - Books can have multiple categories
 * 
 * Usage:
 * - Book classification
 * - Search/filter functionality
 * - Collection organization
 */

import { pgTable, serial, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('categories_name_idx').on(table.name),
  isActiveIdx: index('categories_is_active_idx').on(table.isActive),
}));

// Relations will be defined in the index file to avoid circular dependencies

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
