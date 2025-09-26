// types/approval.types.ts
export interface ApprovalItem {
    id: string;
    quotationId: string;
    quotationNumber: string;
    projectName: string;
    projectId: string;
    projectManagerName: string;
    projectManagerId: string;
    totalAmount: number;
    currency: string;
    submissionDate: Date;
    urgencyLevel: UrgencyLevel;
    status: ApprovalStatus;
    daysWaiting: number;
    hasDocuments: boolean;
    budgetCompliance: BudgetComplianceStatus;
    description?: string;
    lineItemCount: number;
    lastUpdated: Date;
    // Additional fields from backend
    projectBudget?: number;
    remainingBudget?: number;
    exceedsBudget?: boolean;
    approverName?: string;
    approverUsername?: string;
    approvalDate?: Date;
    comments?: string;
  }
  
  export interface QuotationDetails {
    id: string;
    quotationNumber: string;
    projectId: string;
    projectName: string;
    projectManagerId: string;
    projectManagerName: string;
    totalAmount: number;
    currency: string;
    description: string;
    submissionDate: Date;
    status: QuotationStatus;
    lineItems: QuotationLineItem[];
    documents: QuotationDocument[];
    comments: QuotationComment[];
    budgetInfo: BudgetInfo;
    createdDate: Date;
    lastUpdated: Date;
  }
  
  export interface QuotationLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
    accountHead: string;
  }
  
  export interface QuotationDocument {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadDate: Date;
    downloadUrl: string;
  }

  export interface DocumentInfo {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    url: string;
    description?: string;
  }
  
  export interface QuotationComment {
    id: string;
    userId: string;
    userName: string;
    comment: string;
    createdDate: Date;
    type: 'SUBMISSION' | 'APPROVAL' | 'REJECTION' | 'GENERAL';
  }
  
  export interface BudgetInfo {
    projectBudget: number;
    spentAmount: number;
    remainingBudget: number;
    budgetUtilization: number; // percentage
    isOverBudget: boolean;
    wouldExceedBudget: boolean;
    totalBudget: number;
    usedBudget: number;
    complianceStatus: BudgetComplianceStatus;
    excessAmount?: number;
    recentTransactions?: Array<{
      id: string;
      description: string;
      amount: number;
      type: 'DEBIT' | 'CREDIT';
      date: Date;
    }>;
  }
  
  export interface ApprovalFilters {
    status?: ApprovalStatus[];
    urgency?: UrgencyLevel[];
    projectId?: string;
    managerId?: string;
    amountRange?: { min: number; max: number };
    dateRange?: { start: Date; end: Date };
    hasDocuments?: boolean;
    budgetCompliance?: BudgetComplianceStatus[];
    searchTerm?: string;
  }
  
  export interface ApprovalRequest {
    quotationId: string;
    action: ApprovalAction;
    comments?: string;
    reason?: string;
  }
  
  export interface BulkApprovalRequest {
    quotationIds: string[];
    action: ApprovalAction;
    comments?: string;
    reason?: string;
  }
  
  export interface ApprovalResponse {
    success: boolean;
    message: string;
    quotationId: string;
    newStatus: ApprovalStatus;
    processedAt: Date;
  }
  
  export interface BulkApprovalResponse {
    success: boolean;
    message: string;
    processedCount: number;
    failedCount: number;
    results: ApprovalResponse[];
  }
  
  export interface ApprovalHistory {
    id: string;
    quotationId: string;
    action: ApprovalAction;
    performedBy: string;
    performedByName: string;
    comments?: string;
    reason?: string;
    timestamp: Date;
    oldStatus: ApprovalStatus;
    newStatus: ApprovalStatus;
  }
  
  export interface ApprovalStatistics {
    totalPending: number;
    totalUrgent: number;
    approvedToday: number;
    rejectedToday: number;
    averageApprovalTime: number; // in hours
    workloadDistribution: WorkloadDistribution[];
    approvalTrends: ApprovalTrend[];
    budgetComplianceStats: BudgetComplianceStats;
  }
  
  export interface WorkloadDistribution {
    managerId: string;
    managerName: string;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    averageTime: number;
  }
  
  export interface ApprovalTrend {
    date: string;
    approved: number;
    rejected: number;
    pending: number;
  }
  
  export interface BudgetComplianceStats {
    compliant: number;
    warning: number;
    exceeded: number;
    total: number;
  }
  
  export interface ApprovalSummary {
    totalSelected: number;
    totalAmount: number;
    projectsCount: number;
    managersCount: number;
    urgentCount: number;
    budgetIssuesCount: number;
  }
  
  // Enums and Union Types
  export type ApprovalStatus = 
    | 'PENDING' 
    | 'UNDER_REVIEW' 
    | 'APPROVED' 
    | 'REJECTED' 
    | 'RETURNED';
  
  export type UrgencyLevel = 
    | 'LOW' 
    | 'MEDIUM' 
    | 'HIGH' 
    | 'CRITICAL';
  
  export type BudgetComplianceStatus = 
    | 'COMPLIANT' 
    | 'WARNING' 
    | 'EXCEEDED'
    | 'WITHIN_BUDGET'
    | 'BUDGET_EXCEEDED';
  
  export type ApprovalAction = 
    | 'APPROVE' 
    | 'REJECT' 
    | 'REQUEST_CHANGES' 
    | 'RETURN';
  
  export type QuotationStatus = 
    | 'DRAFT' 
    | 'SUBMITTED' 
    | 'UNDER_REVIEW' 
    | 'APPROVED' 
    | 'REJECTED' 
    | 'RETURNED' 
    | 'PAID';
  
  // Filter and Sorting Types
  export interface SortConfig {
    field: keyof ApprovalItem;
    direction: 'asc' | 'desc';
  }
  
  export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }
  
  // UI State Types
  export interface ApprovalQueueState {
    approvals: ApprovalItem[];
    loading: boolean;
    error: string | null;
    filters: ApprovalFilters;
    sort: SortConfig;
    pagination: {
      page: number;
      size: number;
      total: number;
    };
    selectedItems: string[];
  }
  
  export interface BulkOperationState {
    isProcessing: boolean;
    progress: number;
    currentOperation: string;
    results: BulkApprovalResponse | null;
    error: string | null;
  }