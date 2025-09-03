/**
 * Root module of the NestJS application.
 * Key responsibilities:
 * 1. Imports and configures all feature modules
 * 2. Sets up global configuration using ConfigModule
 * 3. Orchestrates module dependencies
 * 
 * Module Structure:
 * - ConfigModule: Manages environment variables globally
 * - DatabaseModule: Handles database connection and Drizzle ORM setup
 * - Feature Modules: Categories, Authors, Books, Loans
 * 
 * Dependencies:
 * - @nestjs/config: For environment variables
 * - Feature modules: For domain-specific functionality
 * - Database module: For data persistence
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApprovalRequestsModule } from './approval-requests/approval-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CategoriesModule,
    AuthorsModule,
    BooksModule,
    LoansModule,
    AuthModule,
    UsersModule,
    ApprovalRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
