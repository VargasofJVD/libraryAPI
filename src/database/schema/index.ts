// Export individual schemas
export * from './categories.schema';
export * from './authors.schema';
export * from './books.schema';
export * from './loans.schema';
export * from './users.schema';

// Import schemas to create the tables object
import { categories } from './categories.schema';
import { authors } from './authors.schema';
import { books } from './books.schema';
import { loans } from './loans.schema';
import { users, approvalRequests, userSessions } from './users.schema';

// Define relations to avoid circular dependencies
import { relations } from 'drizzle-orm';

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
}));

// Export all tables for Drizzle Kit
export const tables = {
  categories,
  authors,
  books,
  loans,
  users,
  approvalRequests,
  userSessions,
};
