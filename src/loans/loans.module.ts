/**
 * Loans Module - Manages book lending operations
 * Key responsibilities:
 * 1. Book borrowing process
 * 2. Return management
 * 3. Due date tracking
 * 4. Loan history maintenance
 * 
 * Features:
 * - Loan creation and management
 * - Due date calculations
 * - Overdue notifications
 * - Loan history tracking
 * 
 * Dependencies:
 * - DatabaseModule: Data persistence
 * - BooksModule: Book availability and status updates
 * 
 * Business rules:
 * - Users can only borrow available books
 * - Maximum loan duration enforced
 * - Late return penalties calculated
 * - Loan limits per user type
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [DatabaseModule, BooksModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
