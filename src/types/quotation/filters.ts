// src/types/quotation/filters.ts
import { QuotationStatus, Currency } from './quotation';
import { LineItemCategory, AccountHead } from './lineItem';
import { ApprovalStatus, ApprovalPriority } from './approval';

export interface QuotationFilters {
  // Pagination
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  
  // Basic filters
  status?: QuotationStatus[];
  projectId?: number[];
  createdById?: number[];
  currency?: Currency[];
  
  // Date filters
  startDate?: string;
  endDate?: string;
  submittedStartDate?: string;
  submittedEndDate?: string;
  approvedStartDate?: string;
  approvedEndDate?: string;
  
  // Amount filters
  minAmount?: number;
  maxAmount?: number;
  
  // Boolean filters
  exceedsBudget?: boolean;
  urgentApproval?: boolean;
  hasDocuments?: boolean;
  
  // Text search
  search?: string;
  description?: string;
  
  // Advanced filters
  categoryIds?: LineItemCategory[];
  accountHeads?: AccountHead[];
  vendorNames?: string[];
  tags?: string[];
  approvalDaysMin?: number;
  approvalDaysMax?: number;
  budgetUtilizationMin?: number;
  budgetUtilizationMax?: number;
}

export interface ApprovalFilters {
  // Pagination
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  
  // Status and priority
  status?: ApprovalStatus[];
  priority?: ApprovalPriority[];
  
  // Assignment
  assignedTo?: number[];
  assignedBy?: number[];
  
  // Date filters
  assignedStartDate?: string;
  assignedEndDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  
  // Flags
  overdue?: boolean;
  requiresEscalation?: boolean;
  
  // Quotation filters
  quotationFilters?: QuotationFilters;
  
  // Text search
  search?: string;
  comments?: string;
}

export interface SearchCriteria {
  query: string;
  fields: SearchField[];
  fuzzy?: boolean;
  exactMatch?: boolean;
  caseSensitive?: boolean;
  includeArchived?: boolean;
}

export enum SearchField {
  DESCRIPTION = 'description',
  PROJECT_NAME = 'project.name',
  PROJECT_CODE = 'project.code',
  CREATED_BY_NAME = 'createdBy.name',
  VENDOR_NAME = 'items.vendorName',
  ITEM_DESCRIPTION = 'items.description',
  COMMENTS = 'approvalComments',
  REJECTION_REASON = 'rejectionReason',
  TAGS = 'tags'
}

export interface FilterGroup {
  id: string;
  name: string;
  filters: QuotationFilters | ApprovalFilters;
  isDefault?: boolean;
  isShared?: boolean;
  createdBy?: number;
  createdAt?: string;
  description?: string;
}

export interface SavedFilter {
  id: number;
  name: string;
  description?: string;
  filterType: 'quotation' | 'approval';
  filters: Record<string, any>;
  isPublic: boolean;
  isDefault: boolean;
  createdBy: number;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  tags: string[];
}

export interface FilterOption {
  value: any;
  label: string;
  count?: number;
  disabled?: boolean;
  description?: string;
  icon?: string;
  color?: string;
}

export interface FilterConfig {
  field: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean' | 'autocomplete';
  label: string;
  placeholder?: string;
  options?: FilterOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  dependencies?: {
    field: string;
    value: any;
    action: 'show' | 'hide' | 'enable' | 'disable';
  }[];
  defaultValue?: any;
  width?: 'small' | 'medium' | 'large' | 'full';
  advanced?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  filters: Record<string, any>;
  isSystem?: boolean;
  category?: 'status' | 'date' | 'amount' | 'user' | 'custom';
}

export interface QuickFilter {
  key: string;
  label: string;
  value: any;
  count?: number;
  active?: boolean;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface SortOption {
  field: string;
  label: string;
  direction?: 'asc' | 'desc';
  defaultDirection?: 'asc' | 'desc';
  enabled?: boolean;
}

export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface FilterState {
  filters: Record<string, any>;
  activeFilters: Record<string, any>;
  quickFilters: QuickFilter[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  pagination: PaginationState;
  loading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export interface ExportFilters extends QuotationFilters {
  format: 'xlsx' | 'csv' | 'pdf';
  columns: string[];
  includeLineItems?: boolean;
  includeDocuments?: boolean;
  includeHistory?: boolean;
  groupBy?: string;
  template?: string;
}

// Predefined filter presets
export const QUOTATION_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'my-drafts',
    name: 'My Drafts',
    icon: 'draft',
    filters: { status: [QuotationStatus.DRAFT] },
    category: 'status'
  },
  {
    id: 'pending-approval',
    name: 'Pending Approval',
    icon: 'pending',
    filters: { status: [QuotationStatus.PENDING] },
    category: 'status'
  },
  {
    id: 'approved-this-month',
    name: 'Approved This Month',
    icon: 'check_circle',
    filters: { 
      status: [QuotationStatus.APPROVED],
      approvedStartDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    },
    category: 'date'
  },
  {
    id: 'high-value',
    name: 'High Value (>100K)',
    icon: 'trending_up',
    filters: { minAmount: 100000 },
    category: 'amount'
  },
  {
    id: 'exceeds-budget',
    name: 'Exceeds Budget',
    icon: 'warning',
    filters: { exceedsBudget: true },
    category: 'status'
  },
  {
    id: 'urgent',
    name: 'Urgent Approvals',
    icon: 'priority_high',
    filters: { urgentApproval: true },
    category: 'status'
  }
];