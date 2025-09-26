// utils/approvals/priorityCalculator.ts
import { ApprovalItem } from '../../types/approval.types';
import { PRIORITY_THRESHOLDS, PRIORITY_LEVELS } from '../../constants/approvals/priorityConstants';

export const calculatePriority = (approval: ApprovalItem): string => {
  const daysWaiting = approval.daysWaiting;
  const amount = approval.totalAmount;
  const exceedsBudget = approval.exceedsBudget;

  // Critical priority conditions
  if (daysWaiting >= PRIORITY_THRESHOLDS.CRITICAL_DAYS) {
    return PRIORITY_LEVELS.CRITICAL;
  }

  if (exceedsBudget && amount >= PRIORITY_THRESHOLDS.CRITICAL_AMOUNT_THRESHOLD) {
    return PRIORITY_LEVELS.CRITICAL;
  }

  // High priority conditions
  if (daysWaiting >= PRIORITY_THRESHOLDS.URGENT_DAYS) {
    return PRIORITY_LEVELS.HIGH;
  }

  if (amount >= PRIORITY_THRESHOLDS.HIGH_AMOUNT_THRESHOLD) {
    return PRIORITY_LEVELS.HIGH;
  }

  if (exceedsBudget) {
    return PRIORITY_LEVELS.HIGH;
  }

  // Medium priority conditions
  if (daysWaiting >= 1 || amount >= 1000) {
    return PRIORITY_LEVELS.MEDIUM;
  }

  // Default to low priority
  return PRIORITY_LEVELS.LOW;
};

export const isUrgent = (approval: ApprovalItem): boolean => {
  return calculatePriority(approval) === PRIORITY_LEVELS.HIGH || 
         calculatePriority(approval) === PRIORITY_LEVELS.CRITICAL;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case PRIORITY_LEVELS.CRITICAL:
      return 'error';
    case PRIORITY_LEVELS.HIGH:
      return 'warning';
    case PRIORITY_LEVELS.MEDIUM:
      return 'info';
    case PRIORITY_LEVELS.LOW:
      return 'success';
    default:
      return 'default';
  }
};

