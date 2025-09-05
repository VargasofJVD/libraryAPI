/**
 * Mock Queue Service - For development without Redis
 * 
 * This service provides the same interface as QueueService
 * but doesn't actually process jobs - just logs them.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
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
export class MockQueueService {
  private readonly logger = new Logger(MockQueueService.name);

  constructor() {
    this.logger.warn('🚨 Using MockQueueService - Redis not available');
    this.logger.warn('📧 Emails will be logged but not sent');
  }

  async sendWelcomeEmail(userData: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    authToken: string;
  }): Promise<Job<NotificationJob>> {
    this.logger.log(`📧 [MOCK] Welcome email for ${userData.email}`);
    this.logger.log(`   User: ${userData.firstName} ${userData.lastName}`);
    this.logger.log(`   Token: ${userData.authToken}`);
    
    return this.createMockJob('welcome-email', userData);
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
    this.logger.log(`📧 [MOCK] Loan confirmation for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle} by ${loanData.author}`);
    this.logger.log(`   Due: ${loanData.dueDate}`);
    
    return this.createMockJob('loan-confirmation', loanData);
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
    this.logger.log(`📧 [MOCK] Overdue reminder scheduled for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle}`);
    this.logger.log(`   Days overdue: ${loanData.daysOverdue}`);
    this.logger.log(`   Fine: $${loanData.fineAmount || 0}`);
    this.logger.log(`   Delay: ${delayMs}ms`);
    
    return this.createMockJob('overdue-reminder', loanData);
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
    this.logger.log(`📧 [MOCK] Return confirmation for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle}`);
    this.logger.log(`   Returned: ${loanData.returnedDate}`);
    this.logger.log(`   Was overdue: ${loanData.wasOverdue}`);
    
    return this.createMockJob('return-confirmation', loanData);
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
    this.logger.log(`📧 [MOCK] Book available notification for ${bookData.userEmail}`);
    this.logger.log(`   Book: ${bookData.bookTitle} by ${bookData.author}`);
    this.logger.log(`   Reserved: ${bookData.reservedDate}`);
    
    return this.createMockJob('book-available', bookData);
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
    this.logger.log(`📧 [MOCK] Approval decision for ${approvalData.userEmail}`);
    this.logger.log(`   Request: ${approvalData.requestType} - ${approvalData.status}`);
    this.logger.log(`   Resource: ${approvalData.resourceTitle}`);
    this.logger.log(`   Notes: ${approvalData.adminNotes || 'None'}`);
    
    return this.createMockJob('approval-decision', approvalData);
  }

  async sendAccountStatusNotification(accountData: {
    userId: number;
    userEmail: string;
    userName: string;
    status: 'activated' | 'suspended' | 'deactivated';
    reason?: string;
    adminNotes?: string;
  }): Promise<Job<NotificationJob>> {
    this.logger.log(`📧 [MOCK] Account status notification for ${accountData.userEmail}`);
    this.logger.log(`   Status: ${accountData.status}`);
    this.logger.log(`   Reason: ${accountData.reason || 'None'}`);
    this.logger.log(`   Notes: ${accountData.adminNotes || 'None'}`);
    
    return this.createMockJob('account-status', accountData);
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
    this.logger.log(`🔍 [MOCK] Processing approval for request ${approvalData.requestId}`);
    this.logger.log(`   Action: ${approvalData.data.action}`);
    this.logger.log(`   Type: ${approvalData.data.requestType}`);
    
    return this.createMockJob('process-approval', approvalData);
  }

  // Queue management methods (mock implementations)
  async getQueueStats() {
    return {
      notifications: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      approvals: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      maintenance: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      timestamp: new Date().toISOString(),
    };
  }

  async retryJob(queueName: string, jobId: string): Promise<Job<any>> {
    this.logger.log(`🔄 [MOCK] Retrying job ${jobId} in queue ${queueName}`);
    return this.createMockJob('retry', { queueName, jobId });
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    this.logger.log(`🗑️ [MOCK] Removing job ${jobId} from queue ${queueName}`);
  }

  async cleanCompletedJobs(queueName: string, grace: number): Promise<void> {
    this.logger.log(`🧹 [MOCK] Cleaning completed jobs from queue ${queueName}`);
  }

  async cleanFailedJobs(queueName: string, grace: number): Promise<void> {
    this.logger.log(`🧹 [MOCK] Cleaning failed jobs from queue ${queueName}`);
  }

  private createMockJob(type: string, data: any): Job<any> {
    return {
      id: `mock-${Date.now()}`,
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
