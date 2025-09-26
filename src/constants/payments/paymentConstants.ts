// src/constants/payments/paymentConstants.ts

import { PaymentStatus, PaymentBatchStatus } from '../../types/payment.types';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.READY_FOR_PAYMENT]: 'Ready for Payment',
  [PaymentStatus.BANK_FILE_GENERATED]: 'Bank File Generated',
  [PaymentStatus.SENT_TO_BANK]: 'Sent to Bank',
  [PaymentStatus.BANK_PROCESSING]: 'Bank Processing',
  [PaymentStatus.COMPLETED]: 'Completed',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.CANCELLED]: 'Cancelled'
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [PaymentStatus.READY_FOR_PAYMENT]: 'info',
  [PaymentStatus.BANK_FILE_GENERATED]: 'primary',
  [PaymentStatus.SENT_TO_BANK]: 'warning',
  [PaymentStatus.BANK_PROCESSING]: 'warning',
  [PaymentStatus.COMPLETED]: 'success',
  [PaymentStatus.FAILED]: 'error',
  [PaymentStatus.CANCELLED]: 'default'
};

export const PAYMENT_BATCH_STATUS_LABELS: Record<PaymentBatchStatus, string> = {
  [PaymentBatchStatus.CREATED]: 'Created',
  [PaymentBatchStatus.FILE_GENERATED]: 'File Generated',
  [PaymentBatchStatus.SENT_TO_BANK]: 'Sent to Bank',
  [PaymentBatchStatus.PROCESSING]: 'Processing',
  [PaymentBatchStatus.COMPLETED]: 'Completed',
  [PaymentBatchStatus.FAILED]: 'Failed'
};

export const PAYMENT_BATCH_STATUS_COLORS: Record<PaymentBatchStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [PaymentBatchStatus.CREATED]: 'default',
  [PaymentBatchStatus.FILE_GENERATED]: 'primary',
  [PaymentBatchStatus.SENT_TO_BANK]: 'warning',
  [PaymentBatchStatus.PROCESSING]: 'warning',
  [PaymentBatchStatus.COMPLETED]: 'success',
  [PaymentBatchStatus.FAILED]: 'error'
};

// Payment Processing Configuration
export const PAYMENT_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  BATCH_REFRESH_INTERVAL: 60000, // 1 minute
  FILE_DOWNLOAD_TIMEOUT: 30000, // 30 seconds
  MAX_BULK_SELECTION: 1000,
  
  // Saudi Banking Specific
  SAUDI_WORKING_DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  DEFAULT_CURRENCY: 'SAR',
  CURRENCY_SYMBOL: 'ر.س',
  
  // File Generation
  SUPPORTED_FILE_FORMATS: ['.xlsx', '.xls'],
  MAX_FILE_SIZE_MB: 50,
  FILE_EXPIRY_HOURS: 24,
  
  // Validation
  MIN_PAYMENT_AMOUNT: 0.01,
  MAX_PAYMENT_AMOUNT: 999999999.99,
  IBAN_LENGTH: 24,
  NATIONAL_ID_LENGTH: 10,
  
  // UI Settings
  TABLE_DENSITY: 'standard' as const,
  SHOW_ARABIC_NAMES: true,
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm'
};

// Payment Priority Levels
export const PAYMENT_PRIORITIES = {
  HIGH: {
    label: 'High Priority',
    color: 'error' as const,
    icon: 'PriorityHigh',
    weight: 3
  },
  MEDIUM: {
    label: 'Medium Priority',
    color: 'warning' as const,
    icon: 'Remove',
    weight: 2
  },
  LOW: {
    label: 'Low Priority',
    color: 'info' as const,
    icon: 'KeyboardArrowDown',
    weight: 1
  }
};

// Quick Action Configurations
export const PAYMENT_QUICK_ACTIONS = [
  {
    id: 'generate-files',
    title: 'Generate Bank Files',
    description: 'Create Excel files for bank processing',
    icon: 'FileSpreadsheet',
    actionType: 'GENERATE_FILE',
    color: 'primary',
    requiresSelection: true
  },
  {
    id: 'view-queue',
    title: 'Payment Queue',
    description: 'Review payments ready for processing',
    icon: 'Queue',
    actionType: 'VIEW_QUEUE',
    color: 'info',
    requiresSelection: false
  },
  {
    id: 'check-status',
    title: 'Check Status',
    description: 'Monitor payment processing status',
    icon: 'CheckCircle',
    actionType: 'CHECK_STATUS',
    color: 'success',
    requiresSelection: false
  },
  {
    id: 'view-history',
    title: 'Payment History',
    description: 'View completed payments and reports',
    icon: 'History',
    actionType: 'VIEW_HISTORY',
    color: 'default',
    requiresSelection: false
  }
];

// Filter Options
export const PAYMENT_FILTER_OPTIONS = {
  STATUS: Object.values(PaymentStatus).map(status => ({
    value: status,
    label: PAYMENT_STATUS_LABELS[status],
    color: PAYMENT_STATUS_COLORS[status]
  })),
  
  BATCH_STATUS: Object.values(PaymentBatchStatus).map(status => ({
    value: status,
    label: PAYMENT_BATCH_STATUS_LABELS[status],
    color: PAYMENT_BATCH_STATUS_COLORS[status]
  })),
  
  AMOUNT_RANGES: [
    { label: 'Under SAR 1,000', min: 0, max: 1000 },
    { label: 'SAR 1,000 - 5,000', min: 1000, max: 5000 },
    { label: 'SAR 5,000 - 10,000', min: 5000, max: 10000 },
    { label: 'SAR 10,000 - 50,000', min: 10000, max: 50000 },
    { label: 'Over SAR 50,000', min: 50000, max: null }
  ],
  
  DATE_RANGES: [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Custom range', days: null }
  ]
};

// Sort Options
export const PAYMENT_SORT_OPTIONS = [
  { value: 'createdDate', label: 'Date Created', defaultDirection: 'desc' },
  { value: 'employeeName', label: 'Employee Name', defaultDirection: 'asc' },
  { value: 'amount', label: 'Amount', defaultDirection: 'desc' },
  { value: 'bankName', label: 'Bank', defaultDirection: 'asc' },
  { value: 'projectName', label: 'Project', defaultDirection: 'asc' },
  { value: 'status', label: 'Status', defaultDirection: 'asc' }
];

export const BATCH_SORT_OPTIONS = [
  { value: 'createdDate', label: 'Date Created', defaultDirection: 'desc' },
  { value: 'batchNumber', label: 'Batch Number', defaultDirection: 'desc' },
  { value: 'bankName', label: 'Bank Name', defaultDirection: 'asc' },
  { value: 'paymentCount', label: 'Payment Count', defaultDirection: 'desc' },
  { value: 'totalAmount', label: 'Total Amount', defaultDirection: 'desc' },
  { value: 'status', label: 'Status', defaultDirection: 'asc' }
];

// Error Messages
export const PAYMENT_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please correct the highlighted errors and try again.',
  FILE_GENERATION_ERROR: 'Failed to generate bank file. Please try again.',
  DOWNLOAD_ERROR: 'Failed to download file. Please try again.',
  CONFIRMATION_ERROR: 'Failed to confirm payments. Please try again.',
  NO_SELECTION: 'Please select at least one payment to proceed.',
  MIXED_BANKS: 'Cannot process payments from different banks in the same file.',
  BANK_CLOSED: 'The selected bank is currently closed. Processing will occur on the next working day.',
  AMOUNT_LIMIT_EXCEEDED: 'Payment amount exceeds the bank limit.',
  INVALID_IBAN: 'Invalid IBAN format. Please check and correct.',
  MISSING_BANK_DETAILS: 'Bank details are missing for some payments.',
  BATCH_NOT_FOUND: 'Payment batch not found.',
  FILE_EXPIRED: 'The download file has expired. Please generate a new file.',
  PROCESSING_IN_PROGRESS: 'Another operation is in progress. Please wait.'
};

// Success Messages
export const PAYMENT_SUCCESS_MESSAGES = {
  FILE_GENERATED: 'Bank file generated successfully',
  FILE_DOWNLOADED: 'File downloaded successfully',
  PAYMENTS_CONFIRMED: 'Payments confirmed as completed',
  BATCH_CREATED: 'Payment batch created successfully',
  STATUS_UPDATED: 'Payment status updated successfully',
  FILTERS_APPLIED: 'Filters applied successfully',
  SELECTION_CLEARED: 'Selection cleared'
};

// Validation Rules
export const PAYMENT_VALIDATION_RULES = {
  EMPLOYEE_NAME: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\u0600-\u06FF]+$/, // English and Arabic characters
    errorMessage: 'Employee name must contain only letters and spaces'
  },
  
  AMOUNT: {
    required: true,
    min: PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT,
    max: PAYMENT_CONFIG.MAX_PAYMENT_AMOUNT,
    precision: 2,
    errorMessage: 'Amount must be between 0.01 and 999,999,999.99 SAR'
  },
  
  IBAN: {
    required: true,
    length: PAYMENT_CONFIG.IBAN_LENGTH,
    pattern: /^SA[0-9]{22}$/,
    errorMessage: 'IBAN must be in Saudi format (SA followed by 22 digits)'
  },
  
  NATIONAL_ID: {
    required: true,
    length: PAYMENT_CONFIG.NATIONAL_ID_LENGTH,
    pattern: /^[0-9]{10}$/,
    errorMessage: 'National ID must be exactly 10 digits'
  },
  
  COMMENTS: {
    required: false,
    maxLength: 200,
    errorMessage: 'Comments cannot exceed 200 characters'
  }
};

// Export all constants as a single object for easier imports
export const PAYMENT_CONSTANTS = {
  STATUS_LABELS: PAYMENT_STATUS_LABELS,
  STATUS_COLORS: PAYMENT_STATUS_COLORS,
  BATCH_STATUS_LABELS: PAYMENT_BATCH_STATUS_LABELS,
  BATCH_STATUS_COLORS: PAYMENT_BATCH_STATUS_COLORS,
  CONFIG: PAYMENT_CONFIG,
  PRIORITIES: PAYMENT_PRIORITIES,
  QUICK_ACTIONS: PAYMENT_QUICK_ACTIONS,
  FILTER_OPTIONS: PAYMENT_FILTER_OPTIONS,
  SORT_OPTIONS: PAYMENT_SORT_OPTIONS,
  BATCH_SORT_OPTIONS: BATCH_SORT_OPTIONS,
  ERROR_MESSAGES: PAYMENT_ERROR_MESSAGES,
  SUCCESS_MESSAGES: PAYMENT_SUCCESS_MESSAGES,
  VALIDATION_RULES: PAYMENT_VALIDATION_RULES
};