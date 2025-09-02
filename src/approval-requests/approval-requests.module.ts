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
