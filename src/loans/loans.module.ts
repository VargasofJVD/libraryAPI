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
