// src/types/payment.types.ts

export interface Payment {
    id: string;
    quotationId: string;
    employeeId: string;
    employeeName: string;
    employeeFullName: string;
    amount: number;
    currency: 'SAR';
    status: PaymentStatus;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    beneficiaryAddress?: string;
    nationalId?: string;
    iqamaId?: string;
    projectId?: string;
    projectName?: string;
    description?: string;
    comments?: string;
    createdAt: string;
    updatedAt: string;
    processedAt?: string;
    completedAt?: string;
    batchId?: string;
    bankFileId?: string;
    errorMessage?: string;
  }
  
  export enum PaymentStatus {
    READY_FOR_PAYMENT = 'READY_FOR_PAYMENT',
    BANK_FILE_GENERATED = 'BANK_FILE_GENERATED',
    SENT_TO_BANK = 'SENT_TO_BANK',
    BANK_PROCESSING = 'BANK_PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
  }
  
  export interface PaymentSummaryResponse {
    id: string;
    quotationId: string;
    employeeName: string;
    amount: number;
    status: PaymentStatus;
    bankName?: string;
    projectName?: string;
    createdAt: string;
    processedAt?: string;
  }
  
  export interface PaymentBatch {
    id: string;
    batchNumber: string;
    bankName: string;
    paymentCount: number;
    totalAmount: number;
    status: PaymentBatchStatus;
    createdBy: string;
    createdAt: string;
    processedAt?: string;
    completedAt?: string;
    fileName?: string;
    fileUrl?: string;
    payments: Payment[];
  }
  
  export enum PaymentBatchStatus {
    CREATED = 'CREATED',
    FILE_GENERATED = 'FILE_GENERATED',
    SENT_TO_BANK = 'SENT_TO_BANK',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
  }
  
  export interface BankFileRequest {
    paymentIds: string[];
    bankName: string;
    comments?: string;
  }
  
  export interface BankFileResponse {
    batchId: string;
    fileName: string;
    fileUrl: string;
    paymentCount: number;
    totalAmount: number;
    expiresAt: string;
  }
  
  export interface ConfirmPaymentRequest {
    paymentIds: string[];
    batchId?: string;
    confirmationReference?: string;
    comments?: string;
  }
  
  export interface PaymentStatistics {
    pendingPayments: number;
    processingPayments: number;
    completedPayments: number;
    totalPendingAmount: number;
    totalProcessingAmount: number;
    totalCompletedAmount: number;
    paymentsByBank: Record<string, number>;
    paymentsByStatus: Record<PaymentStatus, number>;
    monthlyTrends: {
      month: string;
      completed: number;
      amount: number;
    }[];
  }
  
  export interface PaymentFilters {
    status?: PaymentStatus[];
    bankName?: string[];
    employeeName?: string;
    projectId?: string[];
    projectName?: string;
    amountRange?: {
      min?: number;
      max?: number;
    };
    dateRange?: {
      startDate?: string;
      endDate?: string;
    };
    batchId?: string;
    highValue?: boolean;
    hasErrors?: boolean;
    recentlyProcessed?: boolean;
  }
  
  export interface PaymentSearchParams extends PaymentFilters {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    search?: string;
  }
  
  // Saudi Bank Definitions
  export interface SaudiBank {
    code: string;
    name: string;
    arabicName: string;
    logoUrl?: string;
    color: string;
    ibanPrefix: string;
    accountNumberLength: number[];
    supportsBulkPayments: boolean;
    fileFormat: 'EXCEL' | 'CSV' | 'XML';
  }
  
  export interface BankFileConfig {
    bankCode: string;
    columns: BankFileColumn[];
    fileName: string;
    sheetName: string;
    headers: boolean;
    dateFormat: string;
    currencyFormat: string;
    encoding: string;
  }
  
  export interface BankFileColumn {
    field: string;
    header: string;
    required: boolean;
    maxLength?: number;
    validation?: string;
    format?: string;
  }
  
  // Payment Queue and Processing
  export interface PaymentQueueItem extends Payment {
    canProcess: boolean;
    validationErrors: string[];
    warnings: string[];
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }
  
  export interface PaymentValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }
  
  export interface PaymentProcessingResult {
    successCount: number;
    failureCount: number;
    batchId: string;
    fileName: string;
    fileUrl: string;
    failures: {
      paymentId: string;
      error: string;
    }[];
  }
  
  // Payment History and Tracking
  export interface PaymentHistory {
    paymentId: string;
    timeline: PaymentTimelineEvent[];
  }
  
  export interface PaymentTimelineEvent {
    id: string;
    type: 'STATUS_CHANGE' | 'BATCH_CREATED' | 'FILE_GENERATED' | 'BANK_CONFIRMED' | 'COMPLETED' | 'ERROR';
    status?: PaymentStatus;
    title: string;
    description?: string;
    createdBy?: string;
    createdAt: string;
    metadata?: Record<string, any>;
  }
  
  // Dashboard specific types
  export interface PaymentDashboardData {
    statistics: PaymentStatistics;
    recentPayments: PaymentSummaryResponse[];
    pendingBatches: PaymentBatch[];
    alerts: PaymentAlert[];
    quickActions: QuickAction[];
  }
  
  export interface PaymentAlert {
    id: string;
    type: 'ERROR' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    createdAt: string;
  }
  
  export interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    actionType: 'GENERATE_FILE' | 'VIEW_QUEUE' | 'CHECK_STATUS' | 'VIEW_HISTORY';
    count?: number;
    enabled: boolean;
  }
  
  // Export utility types
  export type PaymentWithValidation = Payment & {
    validationStatus: 'VALID' | 'WARNING' | 'ERROR';
    validationMessages: string[];
  };