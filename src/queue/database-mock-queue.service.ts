/**
 * Database Mock Queue Service - Logs to database
 * 
 * This service logs queue operations to a database table
 * for persistent tracking of mock queue activities.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
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

// Mock queue log table schema (you'd need to create this table)
interface QueueLog {
  id: number;
  jobId: string;
  jobType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DatabaseMockQueueService {
  private readonly logger = new Logger(DatabaseMockQueueService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any },
  ) {
    this.logger.warn('🚨 Using DatabaseMockQueueService - Redis not available');
    this.logger.warn('📧 Emails will be logged to console and database');
  }

  private get db() {
    return this.dbConnection.db;
  }

  private async logToDatabase(jobId: string, jobType: string, status: string, data: any) {
    try {
      // This would require creating a queue_logs table
      // For now, we'll just log to console
      this.logger.log(`📊 [DB-MOCK] ${status.toUpperCase()}: ${jobType} (${jobId})`);
      this.logger.log(`   Data: ${JSON.stringify(data, null, 2)}`);
      
      // In a real implementation, you would:
      // await this.db.insert(queueLogs).values({
      //   jobId,
      //   jobType,
      //   status,
      //   data: JSON.stringify(data),
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });
    } catch (error) {
      this.logger.error('Failed to log to database:', error);
    }
  }

  async sendWelcomeEmail(userData: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    authToken: string;
  }): Promise<Job<NotificationJob>> {
    const jobId = `mock-welcome-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Welcome email for ${userData.email}`);
    this.logger.log(`   User: ${userData.firstName} ${userData.lastName}`);
    this.logger.log(`   Token: ${userData.authToken}`);
    
    await this.logToDatabase(jobId, 'welcome-email', 'queued', userData);
    
    return this.createMockJob('welcome-email', userData, jobId);
  }

  async sendLoanConfirmation(loanData: {
    loanId: number;
    borrowerEmail: string;
    borrowerName: string;
    bookTitle: string;
    author: string;
    borrowedDate: string;
    dueDate: string;
  }): Promise<Job<NotificationJob>> {
    const jobId = `mock-loan-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Loan confirmation for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle} by ${loanData.author}`);
    this.logger.log(`   Due: ${loanData.dueDate}`);
    
    await this.logToDatabase(jobId, 'loan-confirmation', 'queued', loanData);
    
    return this.createMockJob('loan-confirmation', loanData, jobId);
  }

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
    const jobId = `mock-overdue-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Overdue reminder scheduled for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle}`);
    this.logger.log(`   Days overdue: ${loanData.daysOverdue}`);
    this.logger.log(`   Fine: $${loanData.fineAmount || 0}`);
    this.logger.log(`   Delay: ${delayMs}ms`);
    
    await this.logToDatabase(jobId, 'overdue-reminder', 'queued', { ...loanData, delayMs });
    
    return this.createMockJob('overdue-reminder', loanData, jobId);
  }

  async sendReturnConfirmation(loanData: {
    loanId: number;
    borrowerEmail: string;
    borrowerName: string;
    bookTitle: string;
    author: string;
    returnedDate: string;
    wasOverdue: boolean;
    fineAmount?: number;
  }): Promise<Job<NotificationJob>> {
    const jobId = `mock-return-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Return confirmation for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle}`);
    this.logger.log(`   Returned: ${loanData.returnedDate}`);
    this.logger.log(`   Was overdue: ${loanData.wasOverdue}`);
    
    await this.logToDatabase(jobId, 'return-confirmation', 'queued', loanData);
    
    return this.createMockJob('return-confirmation', loanData, jobId);
  }

  async sendBookAvailableNotification(bookData: {
    userId: number;
    userEmail: string;
    userName: string;
    bookId: number;
    bookTitle: string;
    author: string;
    reservedDate: string;
  }): Promise<Job<NotificationJob>> {
    const jobId = `mock-available-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Book available notification for ${bookData.userEmail}`);
    this.logger.log(`   Book: ${bookData.bookTitle} by ${bookData.author}`);
    this.logger.log(`   Reserved: ${bookData.reservedDate}`);
    
    await this.logToDatabase(jobId, 'book-available', 'queued', bookData);
    
    return this.createMockJob('book-available', bookData, jobId);
  }

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
    const jobId = `mock-approval-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Approval decision for ${approvalData.userEmail}`);
    this.logger.log(`   Request: ${approvalData.requestType} - ${approvalData.status}`);
    this.logger.log(`   Resource: ${approvalData.resourceTitle}`);
    this.logger.log(`   Notes: ${approvalData.adminNotes || 'None'}`);
    
    await this.logToDatabase(jobId, 'approval-decision', 'queued', approvalData);
    
    return this.createMockJob('approval-decision', approvalData, jobId);
  }

  async sendAccountStatusNotification(accountData: {
    userId: number;
    userEmail: string;
    userName: string;
    status: 'activated' | 'suspended' | 'deactivated';
    reason?: string;
    adminNotes?: string;
  }): Promise<Job<NotificationJob>> {
    const jobId = `mock-status-${Date.now()}`;
    
    this.logger.log(`📧 [MOCK] Account status notification for ${accountData.userEmail}`);
    this.logger.log(`   Status: ${accountData.status}`);
    this.logger.log(`   Reason: ${accountData.reason || 'None'}`);
    this.logger.log(`   Notes: ${accountData.adminNotes || 'None'}`);
    
    await this.logToDatabase(jobId, 'account-status', 'queued', accountData);
    
    return this.createMockJob('account-status', accountData, jobId);
  }

  // Approval queue methods
  async processApproval(approvalData: {
    requestId: number;
    adminId: number;
    data: {
      action: 'approve' | 'reject';
      adminNotes?: string;
      requestType: string;
      resourceId?: number;
      requestData: string;
      userId: number;
    };
  }): Promise<Job<ApprovalJob>> {
    const jobId = `mock-process-${Date.now()}`;
    
    this.logger.log(`🔍 [MOCK] Processing approval for request ${approvalData.requestId}`);
    this.logger.log(`   Action: ${approvalData.data.action}`);
    this.logger.log(`   Type: ${approvalData.data.requestType}`);
    
    await this.logToDatabase(jobId, 'process-approval', 'queued', approvalData);
    
    return this.createMockJob('process-approval', approvalData, jobId);
  }

  // Queue management methods (mock implementations)
  async getQueueStats() {
    const stats = {
      notifications: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      approvals: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      maintenance: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      timestamp: new Date().toISOString(),
    };

    await this.logToDatabase('stats-request', 'queue-stats', 'completed', stats);
    return stats;
  }

  async retryJob(queueName: string, jobId: string): Promise<Job<any>> {
    this.logger.log(`🔄 [MOCK] Retrying job ${jobId} in queue ${queueName}`);
    await this.logToDatabase(jobId, 'retry', 'queued', { queueName, jobId });
    return this.createMockJob('retry', { queueName, jobId }, jobId);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    this.logger.log(`🗑️ [MOCK] Removing job ${jobId} from queue ${queueName}`);
    await this.logToDatabase(jobId, 'remove', 'completed', { queueName, jobId });
  }

  async cleanCompletedJobs(queueName: string, grace: number): Promise<void> {
    this.logger.log(`🧹 [MOCK] Cleaning completed jobs from queue ${queueName}`);
    await this.logToDatabase('cleanup', 'clean-completed', 'completed', { queueName, grace });
  }

  async cleanFailedJobs(queueName: string, grace: number): Promise<void> {
    this.logger.log(`🧹 [MOCK] Cleaning failed jobs from queue ${queueName}`);
    await this.logToDatabase('cleanup', 'clean-failed', 'completed', { queueName, grace });
  }

  private createMockJob(type: string, data: any, jobId?: string): Job<any> {
    const finalJobId = jobId || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: finalJobId,
      name: type,
      data,
      progress: () => {},
      updateProgress: () => {},
      log: () => {},
      update: () => {},
      moveToCompleted: () => {},
      moveToFailed: () => {},
      retry: () => {},
      remove: () => {},
    } as any;
  }
}
