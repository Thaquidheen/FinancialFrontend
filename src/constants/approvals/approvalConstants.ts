// constants/approvals/approvalConstants.ts

export const APPROVAL_STATUS = {
    PENDING: 'PENDING',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RETURNED: 'RETURNED'
  } as const;
  
  export const URGENCY_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  } as const;
  
  export const BUDGET_COMPLIANCE = {
    COMPLIANT: 'COMPLIANT',
    WARNING: 'WARNING',
    EXCEEDED: 'EXCEEDED'
  } as const;
  
  export const APPROVAL_ACTIONS = {
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    REQUEST_CHANGES: 'REQUEST_CHANGES',
    RETURN: 'RETURN'
  } as const;
  
  // UI Configuration
  export const BULK_OPERATION_LIMITS = {
    MAX_SELECTION: 50,
    BATCH_SIZE: 10,
    PROGRESS_UPDATE_INTERVAL: 500
  } as const;
  
  export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100
  } as const;
  
  // Time-based Constants
  export const URGENCY_THRESHOLDS = {
    HIGH_DAYS: 3,
    CRITICAL_DAYS: 7,
    BUSINESS_HOURS_START: 8,
    BUSINESS_HOURS_END: 17
  } as const;
  
  // Status Colors and Styles
  export const STATUS_COLORS = {
    PENDING: {
      color: '#faad14',
      backgroundColor: '#fff7e6',
      borderColor: '#ffd591'
    },
    UNDER_REVIEW: {
      color: '#1890ff',
      backgroundColor: '#e6f7ff',
      borderColor: '#91d5ff'
    },
    APPROVED: {
      color: '#52c41a',
      backgroundColor: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    REJECTED: {
      color: '#ff4d4f',
      backgroundColor: '#fff2f0',
      borderColor: '#ffb3b3'
    },
    RETURNED: {
      color: '#722ed1',
      backgroundColor: '#f9f0ff',
      borderColor: '#d3adf7'
    }
  } as const;
  
  export const URGENCY_COLORS = {
    LOW: {
      color: '#52c41a',
      backgroundColor: '#f6ffed'
    },
    MEDIUM: {
      color: '#faad14',
      backgroundColor: '#fff7e6'
    },
    HIGH: {
      color: '#fa8c16',
      backgroundColor: '#fff2e6'
    },
    CRITICAL: {
      color: '#ff4d4f',
      backgroundColor: '#fff2f0'
    }
  } as const;
  
  export const BUDGET_COMPLIANCE_COLORS = {
    COMPLIANT: {
      color: '#52c41a',
      backgroundColor: '#f6ffed'
    },
    WARNING: {
      color: '#faad14',
      backgroundColor: '#fff7e6'
    },
    EXCEEDED: {
      color: '#ff4d4f',
      backgroundColor: '#fff2f0'
    },
    WITHIN_BUDGET: {
      color: '#52c41a',
      backgroundColor: '#f6ffed'
    },
    BUDGET_EXCEEDED: {
      color: '#ff4d4f',
      backgroundColor: '#fff2f0'
    }
  } as const;
  
  // Filter Options
  export const FILTER_OPTIONS = {
    STATUS: [
      { value: 'PENDING', label: 'Pending' },
      { value: 'UNDER_REVIEW', label: 'Under Review' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
      { value: 'RETURNED', label: 'Returned' }
    ],
    URGENCY: [
      { value: 'LOW', label: 'Low Priority' },
      { value: 'MEDIUM', label: 'Medium Priority' },
      { value: 'HIGH', label: 'High Priority' },
      { value: 'CRITICAL', label: 'Critical' }
    ],
    BUDGET_COMPLIANCE: [
      { value: 'COMPLIANT', label: 'Budget Compliant' },
      { value: 'WARNING', label: 'Budget Warning' },
      { value: 'EXCEEDED', label: 'Budget Exceeded' }
    ]
  } as const;
  
  // Sort Options
  export const SORT_OPTIONS = [
    { value: 'submissionDate', label: 'Submission Date' },
    { value: 'totalAmount', label: 'Amount' },
    { value: 'urgencyLevel', label: 'Priority' },
    { value: 'daysWaiting', label: 'Days Waiting' },
    { value: 'projectName', label: 'Project Name' },
    { value: 'projectManagerName', label: 'Project Manager' }
  ] as const;
  
  // Quick Actions
  export const QUICK_ACTIONS = {
    APPROVE: {
      label: 'Quick Approve',
      icon: 'CheckCircleOutlined',
      color: '#52c41a',
      requiresComment: false
    },
    REJECT: {
      label: 'Quick Reject',
      icon: 'CloseCircleOutlined',
      color: '#ff4d4f',
      requiresComment: true
    },
    REVIEW: {
      label: 'Review Details',
      icon: 'EyeOutlined',
      color: '#1890ff',
      requiresComment: false
    }
  } as const;
  
  // Rejection Reasons
  export const REJECTION_REASONS = [
    'Budget exceeded',
    'Insufficient documentation',
    'Duplicate expenses',
    'Unreasonable amounts',
    'Wrong project allocation',
    'Missing receipts',
    'Policy violation',
    'Requires additional approval',
    'Other (specify in comments)'
  ] as const;
  
  // Notification Messages
  export const NOTIFICATION_MESSAGES = {
    APPROVAL_SUCCESS: 'Quotation approved successfully',
    REJECTION_SUCCESS: 'Quotation rejected successfully',
    BULK_APPROVAL_SUCCESS: (count: number) => `${count} quotations approved successfully`,
    BULK_REJECTION_SUCCESS: (count: number) => `${count} quotations rejected successfully`,
    BULK_PARTIAL_SUCCESS: (success: number, failed: number) => 
      `${success} quotations processed successfully, ${failed} failed`,
    LOAD_ERROR: 'Failed to load approval queue',
    PROCESS_ERROR: 'Failed to process approval',
    NETWORK_ERROR: 'Network error. Please try again.',
    VALIDATION_ERROR: 'Please correct the validation errors'
  } as const;
  
  // API Endpoints
  export const API_ENDPOINTS = {
    APPROVALS: '/approvals',
    PENDING: '/approvals/pending',
    URGENT: '/approvals/urgent',
    PROCESS: '/approvals/process',
    BULK: '/approvals/bulk',
    STATISTICS: '/approvals/statistics',
    HISTORY: (quotationId: string) => `/approvals/quotation/${quotationId}/history`,
    APPROVE: (quotationId: string) => `/approvals/${quotationId}/approve`,
    REJECT: (quotationId: string) => `/approvals/${quotationId}/reject`,
    DASHBOARD: '/approvals/dashboard'
  } as const;
  
  // Default Values
  export const DEFAULT_FILTERS: Record<string, any> = {
    status: [],
    urgency: [],
    budgetCompliance: [],
    hasDocuments: undefined,
    searchTerm: '',
    amountRange: undefined,
    dateRange: undefined,
    projectId: undefined,
    managerId: undefined
  } as const;
  
  export const DEFAULT_SORT = {
    field: 'submissionDate' as const,
    direction: 'desc' as const
  };
  
  export const DEFAULT_PAGINATION = {
    page: 0,
    size: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    total: 0
  };
  
  // Business Rules
  export const BUSINESS_RULES = {
    URGENT_THRESHOLD_DAYS: 3,
    CRITICAL_THRESHOLD_DAYS: 7,
    MAX_COMMENT_LENGTH: 1000,
    MIN_COMMENT_LENGTH_FOR_REJECTION: 10,
    AUTO_REFRESH_INTERVAL: 60000, // 1 minute
    BULK_OPERATION_TIMEOUT: 300000, // 5 minutes
    MAX_EXPORT_RECORDS: 10000
  } as const;