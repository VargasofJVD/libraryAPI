/**
 * Queue Service - Manages background job processing
 * 
 * Purpose:
 * - Provides high-level interface for adding jobs to queues
 * - Manages job scheduling and prioritization
 * - Handles queue monitoring and statistics
 * - Integrates with existing services
 * 
 * Features:
 * 1. Job Management:
 *    - Add jobs to appropriate queues
 *    - Schedule delayed jobs
 *    - Set job priorities
 *    - Handle job failures
 * 
 * 2. Queue Operations:
 *    - Get queue statistics
 *    - Retry failed jobs
 *    - Clean up completed jobs
 *    - Monitor queue health
 * 
 * 3. Service Integration:
 *    - User service integration
 *    - Loan service integration
 *    - Approval service integration
 * 
 * @see BullMQ Queue API
 * @see NotificationJob interfaces
 * @see ApprovalJob interfaces
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { 
  NotificationJob,
  WelcomeEmailJob,
  LoanConfirmationJob,
  OverdueReminderJob,
  ReturnConfirmationJob,
  BookAvailableJob,
  ApprovalDecisionJob,
  AccountStatusJob
} from './interfaces/notification-job.interface';
import { 
  ApprovalJob,
  ProcessApprovalJob,
  SendApprovalNotificationJob,
  UpdateApprovalStatusJob,
  GenerateApprovalReportJob
} from './interfaces/approval-job.interface';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    //these are private properties that are injected into the class.
    //injects a queue, assigns it a private property (notificationQueue, approvalQueue, maintenanceQueue), and assigns it a type (Queue<NotificationJob>, Queue<ApprovalJob>, Queue<any>)
    //NB: the types are the types of the jobs that will be processed by the queue... and in this case, the jobs are the NotificationJob, ApprovalJob, and any other job that is processed by the queue.
    @InjectQueue('notifications') private notificationQueue: Queue<NotificationJob>, //this property will be used to access the notification queue.
    @InjectQueue('approvals') private approvalQueue: Queue<ApprovalJob>, //this property will be used to access the approval queue.
    @InjectQueue('maintenance') private maintenanceQueue: Queue<any>, //this property will be used to access the maintenance queue.
  ) {
    // Test Redis connection on startup
    this.testRedisConnection();
  }

  /**
   * Test Redis connection health
   */
  private async testRedisConnection(): Promise<void> {
    try {
      // Test connection by getting queue stats
      await this.notificationQueue.getJobCounts();
      this.logger.log('✅ Redis connection established successfully');
    } catch (error) {
      this.logger.error('❌ Redis connection failed:', error.message);
      this.logger.warn('⚠️  Queue functionality may be limited. Check your Redis configuration.');
    }
  }

  // ==================== NOTIFICATION QUEUE METHODS ====================

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userData: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    authToken: string;
  }): Promise<Job<NotificationJob>> {
    const jobData: WelcomeEmailJob = {
      type: 'welcome-email',
      recipient: {
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
      },
      data: {
        userId: userData.userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        authToken: userData.authToken,
        loginInstructions: 'Use the provided auth token to login to your account.',
      },
    };

    const job = await this.notificationQueue.add('welcome-email', jobData, {
      priority: 10, // High priority for welcome emails
      removeOnComplete: 50,
      removeOnFail: 25,
    });

    this.logger.log(`Welcome email queued for user ${userData.userId}: ${job.id}`);
    return job;
  }

  /**
   * Send loan confirmation email
   */
  async sendLoanConfirmation(loanData: {
    loanId: number;
    borrowerEmail: string;
    borrowerName: string;
    bookTitle: string;
    author: string;
    borrowedDate: string;
    dueDate: string;
  }): Promise<Job<NotificationJob>> {
    const jobData: LoanConfirmationJob = {
      type: 'loan-confirmation',
      recipient: {
        email: loanData.borrowerEmail,
        name: loanData.borrowerName,
      },
      data: {
        loanId: loanData.loanId,
        bookTitle: loanData.bookTitle,
        author: loanData.author,
        borrowedDate: loanData.borrowedDate,
        dueDate: loanData.dueDate,
        borrowerName: loanData.borrowerName,
      },
    };

    const job = await this.notificationQueue.add('loan-confirmation', jobData, {
      priority: 8,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Loan confirmation queued for loan ${loanData.loanId}: ${job.id}`);
    return job;
  }

  /**
   * Schedule overdue reminder email
   */
  async scheduleOverdueReminder(loanData: {
    loanId: number;
    borrowerEmail: string;
    borrowerName: string;
    bookTitle: string;
    author: string;
    dueDate: string;
    daysOverdue: number;
    fineAmount?: number;
  }, delayMs: number = 3 * 24 * 60 * 60 * 1000): Promise<Job<NotificationJob>> {
    const jobData: OverdueReminderJob = {
      type: 'overdue-reminder',
      recipient: {
        email: loanData.borrowerEmail,
        name: loanData.borrowerName,
      },
      data: {
        loanId: loanData.loanId,
        bookTitle: loanData.bookTitle,
        author: loanData.author,
        dueDate: loanData.dueDate,
        daysOverdue: loanData.daysOverdue,
        fineAmount: loanData.fineAmount,
        borrowerName: loanData.borrowerName,
      },
    };

    const job = await this.notificationQueue.add('overdue-reminder', jobData, {
      delay: delayMs,
      priority: 6,
      removeOnComplete: 200,
      removeOnFail: 100,
    });

    this.logger.log(`Overdue reminder scheduled for loan ${loanData.loanId}: ${job.id}`);
    return job;
  }

  /**
   * Send return confirmation email
   */
  async sendReturnConfirmation(returnData: {
    loanId: number;
    borrowerEmail: string;
    borrowerName: string;
    bookTitle: string;
    author: string;
    returnedDate: string;
    wasOverdue: boolean;
    fineAmount?: number;
  }): Promise<Job<NotificationJob>> {
    const jobData: ReturnConfirmationJob = {
      type: 'return-confirmation',
      recipient: {
        email: returnData.borrowerEmail,
        name: returnData.borrowerName,
      },
      data: {
        loanId: returnData.loanId,
        bookTitle: returnData.bookTitle,
        author: returnData.author,
        returnedDate: returnData.returnedDate,
        borrowerName: returnData.borrowerName,
        wasOverdue: returnData.wasOverdue,
        fineAmount: returnData.fineAmount,
      },
    };

    const job = await this.notificationQueue.add('return-confirmation', jobData, {
      priority: 7,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Return confirmation queued for loan ${returnData.loanId}: ${job.id}`);
    return job;
  }

  /**
   * Send book availability notification
   */
  async sendBookAvailableNotification(bookData: {
    userId: number;
    userEmail: string;
    userName: string;
    bookId: number;
    bookTitle: string;
    author: string;
    reservedDate: string;
  }): Promise<Job<NotificationJob>> {
    const jobData: BookAvailableJob = {
      type: 'book-available',
      recipient: {
        email: bookData.userEmail,
        name: bookData.userName,
      },
      data: {
        userId: bookData.userId,
        bookId: bookData.bookId,
        bookTitle: bookData.bookTitle,
        author: bookData.author,
        reservedDate: bookData.reservedDate,
        borrowerName: bookData.userName,
      },
    };

    const job = await this.notificationQueue.add('book-available', jobData, {
      priority: 9,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Book available notification queued for user ${bookData.userId}: ${job.id}`);
    return job;
  }

  /**
   * Send approval decision notification
   */
  async sendApprovalDecisionNotification(approvalData: {
    userId: number;
    userEmail: string;
    userName: string;
    requestId: number;
    requestType: string;
    status: 'approved' | 'rejected';
    adminNotes?: string;
    resourceTitle?: string;
  }): Promise<Job<NotificationJob>> {
    const jobData: ApprovalDecisionJob = {
      type: 'approval-decision',
      recipient: {
        email: approvalData.userEmail,
        name: approvalData.userName,
      },
      data: {
        requestId: approvalData.requestId,
        requestType: approvalData.requestType,
        status: approvalData.status,
        adminNotes: approvalData.adminNotes,
        resourceTitle: approvalData.resourceTitle,
        userId: approvalData.userId,
      },
    };

    const job = await this.notificationQueue.add('approval-decision', jobData, {
      priority: 8,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Approval decision notification queued for request ${approvalData.requestId}: ${job.id}`);
    return job;
  }

  /**
   * Send account status notification
   */
  async sendAccountStatusNotification(statusData: {
    userId: number;
    userEmail: string;
    userName: string;
    status: 'activated' | 'suspended' | 'deactivated';
    reason?: string;
    adminNotes?: string;
  }): Promise<Job<NotificationJob>> {
    const jobData: AccountStatusJob = {
      type: 'account-status',
      recipient: {
        email: statusData.userEmail,
        name: statusData.userName,
      },
      data: {
        userId: statusData.userId,
        status: statusData.status,
        reason: statusData.reason,
        adminNotes: statusData.adminNotes,
      },
    };

    const job = await this.notificationQueue.add('account-status', jobData, {
      priority: 9,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Account status notification queued for user ${statusData.userId}: ${job.id}`);
    return job;
  }

  // ==================== APPROVAL QUEUE METHODS ====================

  /**
   * Process approval request
   */
  async processApprovalRequest(approvalData: {
    requestId: number;
    adminId: number;
    action: 'approve' | 'reject';
    adminNotes?: string;
    requestType: string;
    resourceId?: number;
    requestData: string;
    userId: number;
  }): Promise<Job<ApprovalJob>> {
    const jobData: ProcessApprovalJob = {
      type: 'process-approval',
      requestId: approvalData.requestId,
      adminId: approvalData.adminId,
      data: {
        action: approvalData.action,
        adminNotes: approvalData.adminNotes,
        requestType: approvalData.requestType,
        resourceId: approvalData.resourceId,
        requestData: approvalData.requestData,
        userId: approvalData.userId,
      },
    };

    const job = await this.approvalQueue.add('process-approval', jobData, {
      priority: 10,
      removeOnComplete: 200,
      removeOnFail: 100,
    });

    this.logger.log(`Approval processing queued for request ${approvalData.requestId}: ${job.id}`);
    return job;
  }

  /**
   * Send approval notification
   */
  async sendApprovalNotification(notificationData: {
    requestId: number;
    adminId: number;
    userId: number;
    requestType: string;
    status: 'approved' | 'rejected';
    adminNotes?: string;
    resourceTitle?: string;
    userEmail: string;
    userName: string;
  }): Promise<Job<ApprovalJob>> {
    const jobData: SendApprovalNotificationJob = {
      type: 'send-approval-notification',
      requestId: notificationData.requestId,
      adminId: notificationData.adminId,
      data: {
        userId: notificationData.userId,
        requestType: notificationData.requestType,
        status: notificationData.status,
        adminNotes: notificationData.adminNotes,
        resourceTitle: notificationData.resourceTitle,
        userEmail: notificationData.userEmail,
        userName: notificationData.userName,
      },
    };

    const job = await this.approvalQueue.add('send-approval-notification', jobData, {
      priority: 8,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Approval notification queued for request ${notificationData.requestId}: ${job.id}`);
    return job;
  }

  // ==================== QUEUE MANAGEMENT METHODS ====================

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [notificationStats, approvalStats, maintenanceStats] = await Promise.all([
      this.notificationQueue.getJobCounts(),
      this.approvalQueue.getJobCounts(),
      this.maintenanceQueue.getJobCounts(),
    ]);

    return {
      notifications: notificationStats,
      approvals: approvalStats,
      maintenance: maintenanceStats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retry failed job
   */
  async retryJob(queueName: string, jobId: string): Promise<Job> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.retry();
    this.logger.log(`Retrying job ${jobId} in queue ${queueName}`);
    return job;
  }

  /**
   * Remove job from queue
   */
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    
    if (job) {
      await job.remove();
      this.logger.log(`Removed job ${jobId} from queue ${queueName}`);
    }
  }

  /**
   * Clean completed jobs
   */
  async cleanCompletedJobs(queueName: string, grace: number = 5000): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.clean(grace, 100, 'completed');
    this.logger.log(`Cleaned completed jobs from queue ${queueName}`);
  }

  /**
   * Clean failed jobs
   */
  async cleanFailedJobs(queueName: string, grace: number = 5000): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.clean(grace, 100, 'failed');
    this.logger.log(`Cleaned failed jobs from queue ${queueName}`);
  }

  /**
   * Get queue by name
   */
  private getQueueByName(queueName: string): Queue {
    switch (queueName) {
      case 'notifications':
        return this.notificationQueue;
      case 'approvals':
        return this.approvalQueue;
      case 'maintenance':
        return this.maintenanceQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}
