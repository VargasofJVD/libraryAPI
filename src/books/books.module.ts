import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AuthorsModule } from '../authors/authors.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [DatabaseModule, AuthorsModule, CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
