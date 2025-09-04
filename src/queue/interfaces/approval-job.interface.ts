/**
 * Approval Job Interfaces
 * 
 * Defines the structure for approval workflow jobs
 * that can be processed by the approval queue.
 * 
 * Job Types:
 * 1. Process Approval Requests
 * 2. Send Approval Notifications
 * 3. Update Request Status
 * 4. Generate Approval Reports
 */

// Base approval job interface
export interface BaseApprovalJob {
  type: string;
  requestId: number;
  adminId: number;
  metadata?: Record<string, any>;
}

// Process approval request
export interface ProcessApprovalJob extends BaseApprovalJob {
  type: 'process-approval';
  data: {
    action: 'approve' | 'reject';
    adminNotes?: string;
    requestType: string;
    resourceId?: number;
    requestData: string;
    userId: number;
  };
}

// Send approval notification
export interface SendApprovalNotificationJob extends BaseApprovalJob {
  type: 'send-approval-notification';
  data: {
    userId: number;
    requestType: string;
    status: 'approved' | 'rejected';
    adminNotes?: string;
    resourceTitle?: string;
    userEmail: string;
    userName: string;
  };
}

// Update approval status
export interface UpdateApprovalStatusJob extends BaseApprovalJob {
  type: 'update-approval-status';
  data: {
    status: 'approved' | 'rejected';
    processedAt: string;
    adminNotes?: string;
  };
}

// Generate approval report
export interface GenerateApprovalReportJob extends BaseApprovalJob {
  type: 'generate-approval-report';
  data: {
    reportType: 'daily' | 'weekly' | 'monthly';
    dateRange: {
      start: string;
      end: string;
    };
    adminEmail: string;
    includeDetails: boolean;
  };
}

// Union type for all approval jobs
export type ApprovalJob = 
  | ProcessApprovalJob
  | SendApprovalNotificationJob
  | UpdateApprovalStatusJob
  | GenerateApprovalReportJob;

// Approval workflow result
export interface ApprovalWorkflowResult {
  success: boolean;
  requestId: number;
  status: 'approved' | 'rejected';
  message: string;
  error?: string;
  timestamp: string;
}
