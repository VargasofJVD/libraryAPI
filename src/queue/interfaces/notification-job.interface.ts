/**
 * Notification Job Interfaces
 * 
 * Defines the structure for different types of notification jobs
 * that can be processed by the notification queue.
 * 
 * Job Types:
 * 1. Email Notifications
 * 2. SMS Notifications (future)
 * 3. Push Notifications (future)
 * 
 * Each job type has specific data requirements and processing logic.
 */

// Base notification job interface
export interface BaseNotificationJob {
  type: string;
  recipient: {
    email: string;
    name?: string;
  };
  metadata?: Record<string, any>;
}

// Welcome email for new users
export interface WelcomeEmailJob extends BaseNotificationJob {
  type: 'welcome-email';
  data: {
    userId: number;
    firstName: string;
    lastName: string;
    authToken: string;
    loginInstructions: string;
  };
}

// Loan confirmation email
export interface LoanConfirmationJob extends BaseNotificationJob {
  type: 'loan-confirmation';
  data: {
    loanId: number;
    bookTitle: string;
    author: string;
    borrowedDate: string;
    dueDate: string;
    borrowerName: string;
  };
}

// Overdue book reminder
export interface OverdueReminderJob extends BaseNotificationJob {
  type: 'overdue-reminder';
  data: {
    loanId: number;
    bookTitle: string;
    author: string;
    dueDate: string;
    daysOverdue: number;
    fineAmount?: number;
    borrowerName: string;
  };
}

// Book return confirmation
export interface ReturnConfirmationJob extends BaseNotificationJob {
  type: 'return-confirmation';
  data: {
    loanId: number;
    bookTitle: string;
    author: string;
    returnedDate: string;
    borrowerName: string;
    wasOverdue: boolean;
    fineAmount?: number;
  };
}

// Book availability notification
export interface BookAvailableJob extends BaseNotificationJob {
  type: 'book-available';
  data: {
    userId: number;
    bookId: number;
    bookTitle: string;
    author: string;
    reservedDate: string;
    borrowerName: string;
  };
}

// Approval decision notification
export interface ApprovalDecisionJob extends BaseNotificationJob {
  type: 'approval-decision';
  data: {
    requestId: number;
    requestType: string;
    status: 'approved' | 'rejected';
    adminNotes?: string;
    resourceTitle?: string;
    userId: number;
  };
}

// Account status notification
export interface AccountStatusJob extends BaseNotificationJob {
  type: 'account-status';
  data: {
    userId: number;
    status: 'activated' | 'suspended' | 'deactivated';
    reason?: string;
    adminNotes?: string;
  };
}

// Union type for all notification jobs
export type NotificationJob = 
  | WelcomeEmailJob
  | LoanConfirmationJob
  | OverdueReminderJob
  | ReturnConfirmationJob
  | BookAvailableJob
  | ApprovalDecisionJob
  | AccountStatusJob;

// Email template data interface
export interface EmailTemplateData {
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType: string;
  }>;
}
