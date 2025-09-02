import { pgTable, serial, integer, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const loans = pgTable('loans', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull(),
  borrowerName: varchar('borrower_name', { length: 255 }).notNull(),
  borrowerEmail: varchar('borrower_email', { length: 255 }).notNull(),
  borrowedAt: timestamp('borrowed_at').notNull().defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  returnedAt: timestamp('returned_at'),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  bookIdIdx: index('loans_book_id_idx').on(table.bookId),
  borrowerEmailIdx: index('loans_borrower_email_idx').on(table.borrowerEmail),
  dueDateIdx: index('loans_due_date_idx').on(table.dueDate),
  isActiveIdx: index('loans_is_active_idx').on(table.isActive),
}));

// Relations will be defined in the index file to avoid circular dependencies

export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
