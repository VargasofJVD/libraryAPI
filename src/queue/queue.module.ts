/**
 * Queue Module - BullMQ configuration and setup
 * 
 * Purpose:
 * - Configures BullMQ queues for background job processing
 * - Sets up Redis connection for job storage
 * - Registers queue processors and services
 * 
 * Features:
 * 1. Notification Queue:
 *    - Email notifications
 *    - SMS notifications (future)
 *    - Push notifications (future)
 * 
 * 2. Approval Queue:
 *    - Process approval requests
 *    - Send approval notifications
 *    - Update request status
 * 
 * 3. Maintenance Queue:
 *    - Cleanup expired data
 *    - Generate reports
 *    - System maintenance tasks
 * 
 * Configuration:
 * - Redis connection via environment variables
 * - Queue concurrency and retry settings
 * - Job timeout and retention policies
 * 
 * @see BullMQ documentation
 * @see Redis configuration
 */

import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { QueueService } from './queue.service';
import { MockQueueService } from './mock-queue.service';
// import { QueueController } from './queue.controller';
// import { NotificationProcessor } from './processors/notification.processor';
// import { ApprovalProcessor } from './processors/approval.processor';

@Module({
  imports: [
    // BullModule configuration commented out - Redis not available
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     connection: {
    //       host: configService.get<string>('REDIS_HOST', 'localhost'),
    //       port: configService.get<number>('REDIS_PORT', 6379),
    //       password: configService.get<string>('REDIS_PASSWORD'),
    //       db: configService.get<number>('REDIS_DB', 0),
    //       retryDelayOnFailover: 100,
    //       maxRetriesPerRequest: 3,
    //       lazyConnect: true,
    //       keepAlive: 30000,
    //       connectTimeout: 10000,
    //       commandTimeout: 5000,
    //     },
    //     defaultJobOptions: {
    //       removeOnComplete: 100, // Keep last 100 completed jobs
    //       removeOnFail: 50,      // Keep last 50 failed jobs
    //       attempts: 3,           // Retry failed jobs 3 times
    //       backoff: {
    //         type: 'exponential',
    //         delay: 2000,         // Start with 2 second delay
    //       },
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // BullModule.registerQueue(
    //   {
    //     name: 'notifications',
    //     defaultJobOptions: {
    //       removeOnComplete: 50,
    //       removeOnFail: 25,
    //       attempts: 3,
    //       backoff: {
    //         type: 'exponential',
    //         delay: 1000,
    //       },
    //     },
    //   },
    //   {
    //     name: 'approvals',
    //     defaultJobOptions: {
    //       removeOnComplete: 100,
    //       removeOnFail: 50,
    //       attempts: 2,
    //       backoff: {
    //         type: 'fixed',
    //         delay: 5000,
    //       },
    //     },
    //   },
    //   {
    //     name: 'maintenance',
    //     defaultJobOptions: {
    //       removeOnComplete: 20,
    //       removeOnFail: 10,
    //       attempts: 1,
    //       delay: 60000, // 1 minute delay for maintenance jobs
    //     },
    //   },
    // ),
  ],
  // controllers: [QueueController], // Commented out - requires Redis
  providers: [
    MockQueueService, // Using mock service instead of real QueueService
    // NotificationProcessor, // Commented out - requires Redis
    // ApprovalProcessor // Commented out - requires Redis
  ],
  exports: [MockQueueService], // Export mock service
})
export class QueueModule {}
