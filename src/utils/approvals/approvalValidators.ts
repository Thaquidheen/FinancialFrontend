// utils/approvals/approvalValidators.ts
import { ApprovalItem } from '../../types/approval.types';

export const validateApprovalAction = (
  approval: ApprovalItem, 
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
  comments?: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if approval is in valid state
  if (approval.status !== 'PENDING') {
    errors.push('Approval is not in pending status');
  }

  // Check for required comments on rejection
  if (action === 'REJECT' && (!comments || comments.trim().length === 0)) {
    errors.push('Comments are required for rejection');
  }

  // Check for required comments on request changes
  if (action === 'REQUEST_CHANGES' && (!comments || comments.trim().length === 0)) {
    errors.push('Comments are required when requesting changes');
  }

  // Check budget compliance for approval
  if (action === 'APPROVE' && approval.exceedsBudget) {
    errors.push('Cannot approve quotation that exceeds project budget');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateBulkApproval = (
  approvals: ApprovalItem[],
  action: 'APPROVE' | 'REJECT',
  comments?: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (approvals.length === 0) {
    errors.push('No approvals selected');
    return { isValid: false, errors };
  }

  // Validate each approval
  approvals.forEach((approval, index) => {
    const validation = validateApprovalAction(approval, action, comments);
    if (!validation.isValid) {
      errors.push(`Approval ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  // Check for mixed statuses
  const statuses = new Set(approvals.map(a => a.status));
  if (statuses.size > 1) {
    errors.push('Cannot process approvals with different statuses');
  }

  return { isValid: errors.length === 0, errors };
};

export const canBulkProcess = (approvals: ApprovalItem[]): boolean => {
  if (approvals.length === 0) return false;
  
  // All approvals must be pending
  const allPending = approvals.every(a => a.status === 'PENDING');
  if (!allPending) return false;

  // All approvals must be from the same project for bulk approval
  const projectIds = new Set(approvals.map(a => a.projectId));
  if (projectIds.size > 1) return false;

  return true;
};

