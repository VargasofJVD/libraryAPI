/**
 * Queue Controller - API endpoints for queue management and monitoring
 * 
 * Endpoints:
 * 1. Queue Statistics
 *    - GET /queue/stats - Get queue statistics
 *    - GET /queue/health - Check queue health
 * 
 * 2. Job Management
 *    - GET /queue/jobs - List jobs in queues
 *    - GET /queue/jobs/:queueName/:jobId - Get specific job
 *    - POST /queue/jobs/:queueName/:jobId/retry - Retry failed job
 *    - DELETE /queue/jobs/:queueName/:jobId - Remove job
 * 
 * 3. Queue Operations
 *    - POST /queue/clean/:queueName - Clean completed/failed jobs
 *    - POST /queue/pause/:queueName - Pause queue
 *    - POST /queue/resume/:queueName - Resume queue
 * 
 * 4. Testing & Debugging
 *    - POST /queue/test-email - Send test email
 *    - POST /queue/test-notification - Send test notification
 * 
 * Security:
 * - Admin access required for all endpoints
 * - JWT authentication
 * - Role-based access control
 * 
 * Features:
 * - Real-time queue monitoring
 * - Job retry and management
 * - Queue health checks
 * - Testing utilities
 * 
 * Swagger Documentation:
 * @ApiTags('Queue Management')
 * @ApiBearerAuth()
 * 
 * Error Responses:
 * - 401: Unauthorized
 * - 403: Forbidden (Admin only)
 * - 404: Job/Queue not found
 * - 400: Invalid request
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Queue Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics and job counts' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics retrieved successfully',
    schema: {
      example: {
        notifications: {
          waiting: 5,
          active: 2,
          completed: 150,
          failed: 3,
          delayed: 10,
        },
        approvals: {
          waiting: 1,
          active: 0,
          completed: 25,
          failed: 1,
          delayed: 0,
        },
        maintenance: {
          waiting: 0,
          active: 0,
          completed: 5,
          failed: 0,
          delayed: 2,
        },
        timestamp: '2025-01-03T18:30:00.000Z',
      },
    },
  })
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check queue health and connectivity' })
  @ApiResponse({
    status: 200,
    description: 'Queue health check completed',
    schema: {
      example: {
        status: 'healthy',
        queues: {
          notifications: 'connected',
          approvals: 'connected',
          maintenance: 'connected',
        },
        redis: 'connected',
        timestamp: '2025-01-03T18:30:00.000Z',
      },
    },
  })
  async getQueueHealth() {
    try {
      const stats = await this.queueService.getQueueStats();
      
      return {
        status: 'healthy',
        queues: {
          notifications: 'connected',
          approvals: 'connected',
          maintenance: 'connected',
        },
        redis: 'connected',
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('jobs/:queueName')
  @ApiOperation({ summary: 'List jobs in a specific queue' })
  @ApiParam({
    name: 'queueName',
    description: 'Name of the queue',
    enum: ['notifications', 'approvals', 'maintenance'],
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully',
  })
  async getQueueJobs(
    @Param('queueName') queueName: string,
    @Param('status') status?: string,
    @Param('limit') limit: number = 50,
  ) {
    // TODO: Implement job listing functionality
    return {
      queueName,
      status: status || 'all',
      limit,
      jobs: [],
      message: 'Job listing functionality will be implemented',
    };
  }

  @Get('jobs/:queueName/:jobId')
  @ApiOperation({ summary: 'Get specific job details' })
  @ApiParam({
    name: 'queueName',
    description: 'Name of the queue',
    enum: ['notifications', 'approvals', 'maintenance'],
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Job details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async getJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    // TODO: Implement job details functionality
    return {
      queueName,
      jobId,
      message: 'Job details functionality will be implemented',
    };
  }

  @Post('jobs/:queueName/:jobId/retry')
  @ApiOperation({ summary: 'Retry a failed job' })
  @ApiParam({
    name: 'queueName',
    description: 'Name of the queue',
    enum: ['notifications', 'approvals', 'maintenance'],
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID to retry',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Job retry initiated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async retryJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    try {
      const job = await this.queueService.retryJob(queueName, jobId);
      return {
        success: true,
        message: `Job ${jobId} retry initiated in queue ${queueName}`,
        jobId: job.id,
        queueName,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete('jobs/:queueName/:jobId')
  @ApiOperation({ summary: 'Remove a job from queue' })
  @ApiParam({
    name: 'queueName',
    description: 'Name of the queue',
    enum: ['notifications', 'approvals', 'maintenance'],
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID to remove',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Job removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async removeJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    try {
      await this.queueService.removeJob(queueName, jobId);
      return {
        success: true,
        message: `Job ${jobId} removed from queue ${queueName}`,
        jobId,
        queueName,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('clean/:queueName')
  @ApiOperation({ summary: 'Clean completed and failed jobs from queue' })
  @ApiParam({
    name: 'queueName',
    description: 'Name of the queue',
    enum: ['notifications', 'approvals', 'maintenance'],
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['completed', 'failed', 'both'],
          default: 'both',
        },
        grace: {
          type: 'number',
          description: 'Grace period in milliseconds',
          default: 5000,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Queue cleaned successfully',
  })
  async cleanQueue(
    @Param('queueName') queueName: string,
    @Body() body: { type?: 'completed' | 'failed' | 'both'; grace?: number } = {},
  ) {
    const { type = 'both', grace = 5000 } = body;

    try {
      if (type === 'completed' || type === 'both') {
        await this.queueService.cleanCompletedJobs(queueName, grace);
      }
      if (type === 'failed' || type === 'both') {
        await this.queueService.cleanFailedJobs(queueName, grace);
      }

      return {
        success: true,
        message: `Queue ${queueName} cleaned successfully`,
        queueName,
        type,
        grace,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Send test email notification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Recipient email address',
        },
        type: {
          type: 'string',
          enum: ['welcome-email', 'loan-confirmation', 'overdue-reminder'],
          default: 'welcome-email',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Test email queued successfully',
  })
  async sendTestEmail(
    @Body() body: { email: string; type?: string },
  ) {
    const { email, type = 'welcome-email' } = body;

    try {
      let job;
      switch (type) {
        case 'welcome-email':
          job = await this.queueService.sendWelcomeEmail({
            userId: 999,
            email,
            firstName: 'Test',
            lastName: 'User',
            authToken: 'test-token-123',
          });
          break;
        case 'loan-confirmation':
          job = await this.queueService.sendLoanConfirmation({
            loanId: 999,
            borrowerEmail: email,
            borrowerName: 'Test User',
            bookTitle: 'Test Book',
            author: 'Test Author',
            borrowedDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          });
          break;
        case 'overdue-reminder':
          job = await this.queueService.scheduleOverdueReminder({
            loanId: 999,
            borrowerEmail: email,
            borrowerName: 'Test User',
            bookTitle: 'Test Book',
            author: 'Test Author',
            dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            daysOverdue: 3,
            fineAmount: 2.50,
          });
          break;
        default:
          throw new Error(`Unknown test email type: ${type}`);
      }

      return {
        success: true,
        message: `Test ${type} email queued successfully`,
        jobId: job.id,
        email,
        type,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('test-notification')
  @ApiOperation({ summary: 'Send test approval notification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Recipient email address',
        },
        requestType: {
          type: 'string',
          enum: ['book_add', 'book_update', 'book_delete'],
          default: 'book_add',
        },
        status: {
          type: 'string',
          enum: ['approved', 'rejected'],
          default: 'approved',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Test notification queued successfully',
  })
  async sendTestNotification(
    @Body() body: { 
      email: string; 
      requestType?: string; 
      status?: 'approved' | 'rejected' 
    },
  ) {
    const { email, requestType = 'book_add', status = 'approved' } = body;

    try {
      const job = await this.queueService.sendApprovalDecisionNotification({
        userId: 999,
        userEmail: email,
        userName: 'Test User',
        requestId: 999,
        requestType,
        status,
        adminNotes: 'This is a test notification',
        resourceTitle: 'Test Book',
      });

      return {
        success: true,
        message: `Test approval notification queued successfully`,
        jobId: job.id,
        email,
        requestType,
        status,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
