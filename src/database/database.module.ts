/**
 * Database Module - Handles all database connections and configurations
 * Key responsibilities:
 * 1. Establishes and manages PostgreSQL connection
 * 2. Sets up Drizzle ORM with schema
 * 3. Provides database connection to other modules
 * 
 * Dependencies:
 * - drizzle-orm: Modern TypeScript ORM
 * - postgres: PostgreSQL client
 * - @nestjs/config: For database configuration
 * 
 * Features:
 * - Connection pooling
 * - Type-safe queries using Drizzle
 * - Environment-based configuration
 * - Lazy loading of database connection
 * 
 * Used by:
 * - All feature modules (Categories, Authors, Books, Loans)
 * - Provides DATABASE_CONNECTION token for dependency injection
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories, authors, books, loans } from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL environment variable is required');
        }
        
        const client = postgres(connectionString);
        const db = drizzle(client, { 
          schema: { categories, authors, books, loans } 
        });
        
        return { db, client };
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
