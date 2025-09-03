/**
 * Approval Requests Module - Manages user registration workflow
 * Key responsibilities:
 * 1. New user registration requests
 * 2. Librarian/Admin approval workflow
 * 3. Request status tracking
 * 4. Email notifications
 * 
 * Features:
 * - Request submission and tracking
 * - Approval/Rejection workflow
 * - Status updates and notifications
 * - Request history maintenance
 * 
 * Dependencies:
 * - DatabaseModule: Data persistence
 * 
 * Related to:
 * - UsersModule: For user creation after approval
 * - AuthModule: For access control
 * 
 * Business rules:
 * - All new user registrations require approval
 * - Only librarians/admins can approve requests
 * - Requests expire after defined period
 * - Users notified of request status changes
 */

import { Module } from '@nestjs/common';
import { ApprovalRequestsService } from './approval-requests.service';
import { ApprovalRequestsController } from './approval-requests.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ApprovalRequestsController],
  providers: [ApprovalRequestsService],
  exports: [ApprovalRequestsService],
})
export class ApprovalRequestsModule {}
