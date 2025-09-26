// constants/approvals/statusConstants.ts

export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
} as const;

export const QUOTATION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
} as const;

export const BUDGET_COMPLIANCE_STATUS = {
  WITHIN_BUDGET: 'WITHIN_BUDGET',
  EXCEEDS_BUDGET: 'EXCEEDS_BUDGET',
  NO_BUDGET_SET: 'NO_BUDGET_SET',
} as const;

export const URGENCY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];
export type QuotationStatus = typeof QUOTATION_STATUS[keyof typeof QUOTATION_STATUS];
export type BudgetComplianceStatus = typeof BUDGET_COMPLIANCE_STATUS[keyof typeof BUDGET_COMPLIANCE_STATUS];
export type UrgencyLevel = typeof URGENCY_LEVELS[keyof typeof URGENCY_LEVELS];

