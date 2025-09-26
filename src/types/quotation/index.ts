// src/types/quotation/index.ts

// Common types
export * from './common';

// Core quotation types
export * from './quotation';

// Line item types
export * from './lineItem';

// Approval workflow types
export * from './approval';

// Filter and search types
export * from './filters';

// Re-export commonly used types for convenience
export type {
  Quotation,
  QuotationSummary,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationStatistics,
  QuotationFormData,
  User,
  Project,
  QuotationDocument
} from './quotation';

export type {
  LineItem,
  LineItemFormState,
  LineItemTemplate,
  LineItemSummary
} from './lineItem';

export type {
  ApprovalWorkflow,
  ApprovalRequest,
  BulkApprovalRequest,
  ApprovalStatistics,
  ApprovalHistory
} from './approval';

export type {
  QuotationFilters,
  ApprovalFilters,
  FilterState,
  SavedFilter,
  FilterPreset,
  QuickFilter
} from './filters';

// Re-export commonly used enums
export {
  QuotationStatus,
  Currency
} from './quotation';

export {
  LineItemCategory,
  AccountHead,
  UnitOfMeasure
} from './lineItem';

export {
  ApprovalAction,
  ApprovalStatus,
  ApprovalPriority
} from './approval';

export {
  SearchField,
  QUOTATION_FILTER_PRESETS
} from './filters';