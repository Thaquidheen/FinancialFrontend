// src/types/quotation/approval.ts
import { User, QuotationSummary } from './quotation';

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_CLARIFICATION = 'REQUEST_CLARIFICATION',
  FORWARD = 'FORWARD'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED',
  FORWARDED = 'FORWARDED',
  EXPIRED = 'EXPIRED'
}

export enum ApprovalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export interface ApprovalWorkflow {
  id: number;
  quotationId: number;
  quotation: QuotationSummary;
  currentApprover: User;
  assignedDate: string;
  dueDate: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  escalationLevel: number;
  comments?: string;
  attachments?: string[];
  history: ApprovalHistory[];
  isOverdue: boolean;
  daysPending: number;
  canApprove: boolean;
  canReject: boolean;
  canForward: boolean;
  requiresEscalation: boolean;
  escalationReason?: string;
  tags: string[];
}

export interface ApprovalHistory {
  id: number;
  workflowId: number;
  action: ApprovalAction;
  performedBy: User;
  timestamp: string;
  comments?: string;
  reason?: string;
  previousApprover?: User;
  nextApprover?: User;
  documentsAdded?: string[];
  metadata?: Record<string, any>;
}

export interface ApprovalRequest {
  quotationId: number;
  action: ApprovalAction;
  comments?: string;
  reason?: string;
  forwardTo?: number;
  attachments?: File[];
  notifySubmitter?: boolean;
  scheduleFollowUp?: boolean;
  followUpDate?: string;
}

export interface BulkApprovalRequest {
  quotationIds: number[];
  action: ApprovalAction;
  comments?: string;
  reason?: string;
  forwardTo?: number;
  applyToAll?: boolean;
  individualComments?: {
    quotationId: number;
    comments: string;
  }[];
}

export interface ApprovalQueueFilters {
  status?: ApprovalStatus[];
  priority?: ApprovalPriority[];
  assignee?: number[];
  projectId?: number[];
  amountRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  overdue?: boolean;
  tags?: string[];
  createdBy?: number[];
  exceedsBudget?: boolean;
  requiresEscalation?: boolean;
}

export interface ApprovalStatistics {
  totalPending: number;
  totalOverdue: number;
  totalApproved: number;
  totalRejected: number;
  averageApprovalTime: number;
  approvalRate: number;
  rejectionRate: number;
  escalationRate: number;
  myPendingCount: number;
  myOverdueCount: number;
  priorityBreakdown: {
    priority: ApprovalPriority;
    count: number;
    averageTime: number;
  }[];
  dailyTrend: {
    date: string;
    approved: number;
    rejected: number;
    pending: number;
  }[];
  approverPerformance: {
    approverId: number;
    approverName: string;
    totalProcessed: number;
    averageTime: number;
    approvalRate: number;
  }[];
}

export interface ApprovalRule {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  conditions: ApprovalCondition[];
  actions: ApprovalRuleAction[];
  priority: number;
  createdBy: User;
  createdAt: string;
  lastModified: string;
}

export interface ApprovalCondition {
  field: 'amount' | 'project' | 'category' | 'approver' | 'days_pending';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ApprovalRuleAction {
  type: 'auto_approve' | 'escalate' | 'notify' | 'assign' | 'set_priority';
  parameters: Record<string, any>;
}

export interface ApprovalTemplate {
  id: number;
  name: string;
  description: string;
  defaultComments: string;
  tags: string[];
  conditions: string[];
  isActive: boolean;
  createdBy: User;
  usageCount: number;
}

export interface ApprovalNotification {
  id: number;
  type: 'approval_request' | 'approval_reminder' | 'approved' | 'rejected' | 'escalated';
  quotationId: number;
  recipientId: number;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface ApprovalSettings {
  autoEscalationDays: number;
  reminderDays: number[];
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  workingHoursOnly: boolean;
  businessDays: string[];
  holidayCalendar?: string;
  approvalLimits: {
    userId: number;
    maxAmount: number;
    currency: string;
  }[];
}