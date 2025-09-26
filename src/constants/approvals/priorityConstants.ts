// constants/approvals/priorityConstants.ts

export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const PRIORITY_COLORS = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'error',
} as const;

export const PRIORITY_THRESHOLDS = {
  URGENT_DAYS: 3,
  CRITICAL_DAYS: 7,
  HIGH_AMOUNT_THRESHOLD: 10000,
  CRITICAL_AMOUNT_THRESHOLD: 50000,
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];
export type PriorityColor = typeof PRIORITY_COLORS[keyof typeof PRIORITY_COLORS];

