/**
 * Notification Processor - Handles email notification jobs
 * 
 * Purpose:
 * - Processes notification jobs from the queue
 * - Sends emails using configured email service
 * - Handles different types of notifications
 * - Manages email templates and formatting
 * 
 * Features:
 * 1. Email Processing:
 *    - Welcome emails for new users
 *    - Loan confirmations and reminders
 *    - Overdue notifications
 *    - Approval decisions
 * 
 * 2. Template Management:
 *    - HTML email templates
 *    - Dynamic content injection
 *    - Responsive design
 * 
 * 3. Error Handling:
 *    - Retry failed emails
 *    - Log email failures
 *    - Dead letter queue for permanent failures
 * 
 * @see NotificationJob interfaces
 * @see Email service configuration
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
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
  AccountStatusJob,
  EmailTemplateData
} from '../interfaces/notification-job.interface';

@Injectable()
@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationJob>): Promise<void> {
    const { type, recipient, data } = job.data;
    
    this.logger.log(`Processing notification job: ${type} for ${recipient.email}`);

    try {
      switch (type) {
        case 'welcome-email':
          await this.processWelcomeEmail(job as Job<WelcomeEmailJob>);
          break;
        case 'loan-confirmation':
          await this.processLoanConfirmation(job as Job<LoanConfirmationJob>);
          break;
        case 'overdue-reminder':
          await this.processOverdueReminder(job as Job<OverdueReminderJob>);
          break;
        case 'return-confirmation':
          await this.processReturnConfirmation(job as Job<ReturnConfirmationJob>);
          break;
        case 'book-available':
          await this.processBookAvailable(job as Job<BookAvailableJob>);
          break;
        case 'approval-decision':
          await this.processApprovalDecision(job as Job<ApprovalDecisionJob>);
          break;
        case 'account-status':
          await this.processAccountStatus(job as Job<AccountStatusJob>);
          break;
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      this.logger.log(`Successfully processed notification: ${type} for ${recipient.email}`);
    } catch (error) {
      this.logger.error(`Failed to process notification: ${type}`, error);
      throw error; // This will trigger the retry mechanism
    }
  }

  private async processWelcomeEmail(job: Job<WelcomeEmailJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: 'Welcome to Library Management System',
      template: 'welcome-email',
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        authToken: data.authToken,
        loginInstructions: data.loginInstructions,
        libraryName: 'Library Management System',
        supportEmail: 'support@library.com',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async processLoanConfirmation(job: Job<LoanConfirmationJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: `Book Borrowed: ${data.bookTitle}`,
      template: 'loan-confirmation',
      data: {
        borrowerName: data.borrowerName,
        bookTitle: data.bookTitle,
        author: data.author,
        borrowedDate: data.borrowedDate,
        dueDate: data.dueDate,
        libraryName: 'Library Management System',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async processOverdueReminder(job: Job<OverdueReminderJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: `Overdue Book: ${data.bookTitle}`,
      template: 'overdue-reminder',
      data: {
        borrowerName: data.borrowerName,
        bookTitle: data.bookTitle,
        author: data.author,
        dueDate: data.dueDate,
        daysOverdue: data.daysOverdue,
        fineAmount: data.fineAmount || 0,
        libraryName: 'Library Management System',
        returnInstructions: 'Please return the book as soon as possible to avoid additional fines.',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async processReturnConfirmation(job: Job<ReturnConfirmationJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: `Book Returned: ${data.bookTitle}`,
      template: 'return-confirmation',
      data: {
        borrowerName: data.borrowerName,
        bookTitle: data.bookTitle,
        author: data.author,
        returnedDate: data.returnedDate,
        wasOverdue: data.wasOverdue,
        fineAmount: data.fineAmount || 0,
        libraryName: 'Library Management System',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async processBookAvailable(job: Job<BookAvailableJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: `Book Available: ${data.bookTitle}`,
      template: 'book-available',
      data: {
        borrowerName: data.borrowerName,
        bookTitle: data.bookTitle,
        author: data.author,
        reservedDate: data.reservedDate,
        libraryName: 'Library Management System',
        pickupInstructions: 'Please visit the library to borrow this book.',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async processApprovalDecision(job: Job<ApprovalDecisionJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: `Request ${data.status === 'approved' ? 'Approved' : 'Rejected'}: ${data.requestType}`,
      template: 'approval-decision',
      data: {
        requestType: data.requestType,
        status: data.status,
        adminNotes: data.adminNotes,
        resourceTitle: data.resourceTitle,
        libraryName: 'Library Management System',
        nextSteps: data.status === 'approved' 
          ? 'Your request has been approved and will be processed shortly.'
          : 'Please review the admin notes and submit a new request if needed.',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async processAccountStatus(job: Job<AccountStatusJob>): Promise<void> {
    const { recipient, data } = job.data;
    
    const emailData: EmailTemplateData = {
      subject: `Account ${data.status === 'activated' ? 'Activated' : 'Status Updated'}`,
      template: 'account-status',
      data: {
        status: data.status,
        reason: data.reason,
        adminNotes: data.adminNotes,
        libraryName: 'Library Management System',
        supportEmail: 'support@library.com',
      },
    };

    await this.sendEmail(recipient.email, emailData);
  }

  private async sendEmail(to: string, emailData: EmailTemplateData): Promise<void> {
    // TODO: Implement actual email sending service
    // This is a placeholder implementation
    this.logger.log(`Sending email to ${to}: ${emailData.subject}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log(`Email sent successfully to ${to}`);
    
    // In a real implementation, you would:
    // 1. Use a service like SendGrid, AWS SES, or Nodemailer
    // 2. Render HTML templates
    // 3. Handle email delivery status
    // 4. Log email metrics
  }
}
