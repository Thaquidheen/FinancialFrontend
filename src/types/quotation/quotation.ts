// src/types/quotation/quotation.ts

// Forward reference to avoid circular dependency
declare interface LineItem {
  id?: number;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  unitOfMeasure?: any;
  currency: any;
  category: any;
  accountHead: string;
  itemDate: string;
  expectedDeliveryDate?: string;
  vendorName?: string;
  vendorContact?: string;
  vendorEmail?: string;
  itemOrder: number;
  plateNumber?: string;
  currentKM?: string;
  startLocation?: string;
  endLocation?: string;
  notes?: string;
  taxRate?: number;
  discountAmount?: number;
  isApproved?: boolean;
  requiresApproval?: boolean;
  specifications?: string;
  brandModel?: string;
  warrantyPeriod?: string;
}

export enum QuotationStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
  }
  
  import { Currency } from './common';
  
  // Re-export for external use
  export { Currency };
  
  export interface User {
    id: number;
    name: string;
    email: string;
    employeeId: string;
    role: string;
    department?: string;
    phone?: string;
    nationalId?: string;
  }
  
  export interface Project {
    id: number;
    name: string;
    code: string;
    description?: string;
    budget: number;
    usedBudget: number;
    remainingBudget: number;
    currency: Currency;
    managerId: number;
    managerName: string;
    status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    endDate?: string;
    location?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }
  
  export interface QuotationDocument {
    id: number;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    fileType: string;
    filePath: string;
    uploadedAt: string;
    uploadedBy: User;
    url: string;
    description?: string;
    category: 'INVOICE' | 'RECEIPT' | 'CONTRACT' | 'SPECIFICATION' | 'OTHER';
  }
  
  export interface Quotation {
    id: number;
    projectId: number;
    projectName: string;
    createdBy: string;
    createdByUsername: string;
    description: string;
    totalAmount: number;
    currency: Currency;
    status: QuotationStatus;
    submissionNotes?: string;
    submittedDate?: string;
    approvedDate?: string;
    approvedBy?: string;
    rejectionReason?: string;
    createdDate: string;
    active: boolean;
    items: LineItem[];
    documents?: QuotationDocument[];
    
    // Budget information
    projectBudget?: number;
    remainingBudget?: number;
    budgetImpact?: number;
    exceedsBudget?: boolean;
    
    // Computed properties (added by frontend)
    itemCount?: number;
    budgetUtilization?: number;
    urgentApproval?: boolean;
    approvalDays?: number;
    version?: number;
    isEditable?: boolean;
    canApprove?: boolean;
    canReject?: boolean;
    canSubmit?: boolean;
    canDelete?: boolean;
  }
  
  export interface QuotationSummary {
    id: number;
    description: string;
    totalAmount: number;
    currency: Currency;
    status: QuotationStatus;
    createdDate: string;
    updatedDate: string;
    submittedDate?: string;
    approvedDate?: string;
    dueDate?: string;
    projectId: number;
    projectName: string;
    projectCode: string;
    createdById: number;
    createdByName: string;
    createdByEmployeeId: string;
    itemCount: number;
    documentCount: number;
    exceedsBudget: boolean;
    urgentApproval: boolean;
    approvalDays?: number;
    budgetUtilization: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }
  
  export interface CreateQuotationRequest {
    projectId: number;
    description: string;
    currency: Currency;
    dueDate?: string;
    items: Omit<LineItem, 'id'>[];
  }
  
export interface UpdateQuotationRequest {
  description?: string;
  dueDate?: string;
  items?: LineItem[];
}

export interface SubmitQuotationRequest {
  submissionNotes?: string;
}
  
  export interface QuotationStatistics {
    totalQuotations: number;
    draftQuotations: number;
    pendingQuotations: number;
    approvedQuotations: number;
    rejectedQuotations: number;
    cancelledQuotations: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    averageApprovalTime: number;
    budgetExceedingCount: number;
    urgentApprovalsCount: number;
    monthlyTrend: {
      month: string;
      count: number;
      amount: number;
    }[];
    statusDistribution: {
      status: QuotationStatus;
      count: number;
      percentage: number;
    }[];
  }
  
export interface QuotationHistory {
  id: number;
  quotationId: number;
  action: 'CREATED' | 'UPDATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  previousStatus?: QuotationStatus;
  newStatus: QuotationStatus;
  timestamp: string;
  performedBy: User;
  comments?: string;
  reason?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface QuotationFormData {
  projectId: number | null;
  description: string;
  currency: Currency;
  items: LineItem[];
  documents: File[];
}