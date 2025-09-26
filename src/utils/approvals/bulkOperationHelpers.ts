// utils/approvals/bulkOperationHelpers.ts
import { ApprovalItem } from '../../types/approval.types';

export const validateBulkSelection = (approvals: ApprovalItem[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (approvals.length === 0) {
    errors.push('No approvals selected');
    return { isValid: false, errors };
  }

  // Check for mixed statuses
  const statuses = new Set(approvals.map(a => a.status));
  if (statuses.size > 1) {
    errors.push('Cannot process approvals with different statuses');
  }

  // Check for already processed approvals
  const processedApprovals = approvals.filter(a => a.status !== 'PENDING');
  if (processedApprovals.length > 0) {
    errors.push(`${processedApprovals.length} approval(s) have already been processed`);
  }

  return { isValid: errors.length === 0, errors };
};

export const groupApprovalsByProject = (approvals: ApprovalItem[]): Record<string, ApprovalItem[]> => {
  return approvals.reduce((groups, approval) => {
    const projectId = approval.projectId;
    if (!groups[projectId]) {
      groups[projectId] = [];
    }
    groups[projectId].push(approval);
    return groups;
  }, {} as Record<string, ApprovalItem[]>);
};

export const calculateBulkAmount = (approvals: ApprovalItem[]): number => {
  return approvals.reduce((total, approval) => total + approval.totalAmount, 0);
};

export const getBulkSummary = (approvals: ApprovalItem[]) => {
  const totalAmount = calculateBulkAmount(approvals);
  const projectCount = new Set(approvals.map(a => a.projectId)).size;
  const urgentCount = approvals.filter(a => a.urgencyLevel === 'HIGH' || a.urgencyLevel === 'CRITICAL').length;
  
  return {
    count: approvals.length,
    totalAmount,
    projectCount,
    urgentCount,
    averageAmount: totalAmount / approvals.length,
  };
};

