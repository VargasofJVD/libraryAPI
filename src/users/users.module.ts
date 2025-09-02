import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { ApprovalRequestsModule } from '../approval-requests/approval-requests.module';

@Module({
  imports: [DatabaseModule, ApprovalRequestsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
