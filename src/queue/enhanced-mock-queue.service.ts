/**
 * Enhanced Mock Queue Service - With file logging
 * 
 * This service provides the same interface as QueueService
 * but logs to both console and files.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
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
export class EnhancedMockQueueService {
  private readonly logger = new Logger(EnhancedMockQueueService.name);
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly queueLogFile = path.join(this.logDir, 'queue-mock.log');

  constructor() {
    this.ensureLogDirectory();
    this.logger.warn('🚨 Using EnhancedMockQueueService - Redis not available');
    this.logger.warn('📧 Emails will be logged to console and files');
    this.logToFile('INFO', 'MockQueueService initialized');
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private logToFile(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data || null
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.queueLogFile, logLine);
  }

  async sendWelcomeEmail(userData: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    authToken: string;
  }): Promise<Job<NotificationJob>> {
    const logData = {
      type: 'welcome-email',
      recipient: userData.email,
      user: `${userData.firstName} ${userData.lastName}`,
      userId: userData.userId
    };

    this.logger.log(`📧 [MOCK] Welcome email for ${userData.email}`);
    this.logger.log(`   User: ${userData.firstName} ${userData.lastName}`);
    this.logger.log(`   Token: ${userData.authToken}`);
    
    this.logToFile('INFO', 'Welcome email queued', logData);
    
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
    const logData = {
      type: 'loan-confirmation',
      recipient: loanData.borrowerEmail,
      loanId: loanData.loanId,
      book: loanData.bookTitle,
      author: loanData.author,
      dueDate: loanData.dueDate
    };

    this.logger.log(`📧 [MOCK] Loan confirmation for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle} by ${loanData.author}`);
    this.logger.log(`   Due: ${loanData.dueDate}`);
    
    this.logToFile('INFO', 'Loan confirmation queued', logData);
    
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
    const logData = {
      type: 'overdue-reminder',
      recipient: loanData.borrowerEmail,
      loanId: loanData.loanId,
      book: loanData.bookTitle,
      daysOverdue: loanData.daysOverdue,
      fineAmount: loanData.fineAmount,
      delayMs
    };

    this.logger.log(`📧 [MOCK] Overdue reminder scheduled for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle}`);
    this.logger.log(`   Days overdue: ${loanData.daysOverdue}`);
    this.logger.log(`   Fine: $${loanData.fineAmount || 0}`);
    this.logger.log(`   Delay: ${delayMs}ms`);
    
    this.logToFile('WARN', 'Overdue reminder scheduled', logData);
    
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
    const logData = {
      type: 'return-confirmation',
      recipient: loanData.borrowerEmail,
      loanId: loanData.loanId,
      book: loanData.bookTitle,
      returnedDate: loanData.returnedDate,
      wasOverdue: loanData.wasOverdue,
      fineAmount: loanData.fineAmount
    };

    this.logger.log(`📧 [MOCK] Return confirmation for ${loanData.borrowerEmail}`);
    this.logger.log(`   Book: ${loanData.bookTitle}`);
    this.logger.log(`   Returned: ${loanData.returnedDate}`);
    this.logger.log(`   Was overdue: ${loanData.wasOverdue}`);
    
    this.logToFile('INFO', 'Return confirmation queued', logData);
    
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
    const logData = {
      type: 'book-available',
      recipient: bookData.userEmail,
      userId: bookData.userId,
      bookId: bookData.bookId,
      book: bookData.bookTitle,
      author: bookData.author,
      reservedDate: bookData.reservedDate
    };

    this.logger.log(`📧 [MOCK] Book available notification for ${bookData.userEmail}`);
    this.logger.log(`   Book: ${bookData.bookTitle} by ${bookData.author}`);
    this.logger.log(`   Reserved: ${bookData.reservedDate}`);
    
    this.logToFile('INFO', 'Book available notification queued', logData);
    
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
    const logData = {
      type: 'approval-decision',
      recipient: approvalData.userEmail,
      userId: approvalData.userId,
      requestId: approvalData.requestId,
      requestType: approvalData.requestType,
      status: approvalData.status,
      resourceTitle: approvalData.resourceTitle
    };

    this.logger.log(`📧 [MOCK] Approval decision for ${approvalData.userEmail}`);
    this.logger.log(`   Request: ${approvalData.requestType} - ${approvalData.status}`);
    this.logger.log(`   Resource: ${approvalData.resourceTitle}`);
    this.logger.log(`   Notes: ${approvalData.adminNotes || 'None'}`);
    
    this.logToFile('INFO', 'Approval decision notification queued', logData);
    
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
    const logData = {
      type: 'account-status',
      recipient: accountData.userEmail,
      userId: accountData.userId,
      status: accountData.status,
      reason: accountData.reason,
      adminNotes: accountData.adminNotes
    };

    this.logger.log(`📧 [MOCK] Account status notification for ${accountData.userEmail}`);
    this.logger.log(`   Status: ${accountData.status}`);
    this.logger.log(`   Reason: ${accountData.reason || 'None'}`);
    this.logger.log(`   Notes: ${accountData.adminNotes || 'None'}`);
    
    this.logToFile('INFO', 'Account status notification queued', logData);
    
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
    const logData = {
      type: 'process-approval',
      requestId: approvalData.requestId,
      adminId: approvalData.adminId,
      action: approvalData.data.action,
      requestType: approvalData.data.requestType,
      userId: approvalData.data.userId
    };

    this.logger.log(`🔍 [MOCK] Processing approval for request ${approvalData.requestId}`);
    this.logger.log(`   Action: ${approvalData.data.action}`);
    this.logger.log(`   Type: ${approvalData.data.requestType}`);
    
    this.logToFile('INFO', 'Approval processing queued', logData);
    
    return this.createMockJob('process-approval', approvalData);
  }

  // Queue management methods (mock implementations)
  async getQueueStats() {
    const stats = {
      notifications: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      approvals: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      maintenance: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      timestamp: new Date().toISOString(),
    };

    this.logToFile('INFO', 'Queue stats requested', stats);
    return stats;
  }

  async retryJob(queueName: string, jobId: string): Promise<Job<any>> {
    this.logger.log(`🔄 [MOCK] Retrying job ${jobId} in queue ${queueName}`);
    this.logToFile('INFO', 'Job retry requested', { queueName, jobId });
    return this.createMockJob('retry', { queueName, jobId });
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    this.logger.log(`🗑️ [MOCK] Removing job ${jobId} from queue ${queueName}`);
    this.logToFile('INFO', 'Job removal requested', { queueName, jobId });
  }

  async cleanCompletedJobs(queueName: string, grace: number): Promise<void> {
    this.logger.log(`🧹 [MOCK] Cleaning completed jobs from queue ${queueName}`);
    this.logToFile('INFO', 'Completed jobs cleanup requested', { queueName, grace });
  }

  async cleanFailedJobs(queueName: string, grace: number): Promise<void> {
    this.logger.log(`🧹 [MOCK] Cleaning failed jobs from queue ${queueName}`);
    this.logToFile('INFO', 'Failed jobs cleanup requested', { queueName, grace });
  }

  private createMockJob(type: string, data: any): Job<any> {
    const jobId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.logToFile('DEBUG', 'Mock job created', { jobId, type, data });
    
    return {
      id: jobId,
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
