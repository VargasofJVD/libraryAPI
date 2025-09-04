/**
 * Users Module - Manages user operations and authentication
 * Key responsibilities:
 * 1. User CRUD operations
 * 2. User role management (Admin, Librarian, User)
 * 3. User status handling (Active, Suspended, Pending)
 * 4. Integration with auth system
 * 
 * Features:
 * - Secure password handling
 * - Role-based access control
 * - User profile management
 * - Status state management
 * 
 * Related modules:
 * - AuthModule: For user authentication
 * - LoansModule: For tracking user's book loans
 * - ApprovalRequestsModule: For handling user registration approvals
 * 
 * Key components:
 * - UsersService: Business logic for user operations
 * - UsersController: REST API endpoints
 * - User DTOs: Data transfer objects for user operations
 */

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { ApprovalRequestsModule } from '../approval-requests/approval-requests.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [DatabaseModule, ApprovalRequestsModule, QueueModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
