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
