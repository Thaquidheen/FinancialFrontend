// hooks/approvals/useBulkApprovals.ts
import { useState, useCallback } from 'react';
import { BulkApprovalRequest, BulkApprovalResponse, ApprovalItem } from '../../types/approval.types';
import approvalService from '../../services/approvalService';
import { BULK_OPERATION_LIMITS } from '../../constants/approvals/approvalConstants';

interface UseBulkApprovalsReturn {
  // State
  isProcessing: boolean;
  progress: number;
  currentOperation: string;
  results: BulkApprovalResponse | null;
  error: string | null;

  // Actions
  processBulkApprovals: (request: BulkApprovalRequest) => Promise<void>;
  processBulkApprove: (quotationIds: string[], comments?: string) => Promise<void>;
  processBulkReject: (quotationIds: string[], reason: string) => Promise<void>;
  processBulkRequestChanges: (quotationIds: string[], comments: string) => Promise<void>;
  resetState: () => void;

  // Validation
  validateBulkOperation: (items: ApprovalItem[], action: string) => { isValid: boolean; errors: string[] };
  canBulkProcess: (items: ApprovalItem[]) => boolean;
}

export const useBulkApprovals = (): UseBulkApprovalsReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [results, setResults] = useState<BulkApprovalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processBulkApprovals = useCallback(async (request: BulkApprovalRequest) => {
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setCurrentOperation(`Processing ${request.action.toLowerCase()} for ${request.quotationIds.length} quotations...`);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await approvalService.processBulkApprovals(request);
      
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentOperation('Completed');
      setResults(response);

      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setCurrentOperation('');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to process bulk approvals');
      setCurrentOperation('Failed');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processBulkApprove = useCallback(async (quotationIds: string[], comments?: string) => {
    const request: BulkApprovalRequest = {
      quotationIds,
      action: 'APPROVE',
      comments,
    };
    await processBulkApprovals(request);
  }, [processBulkApprovals]);

  const processBulkReject = useCallback(async (quotationIds: string[], reason: string) => {
    const request: BulkApprovalRequest = {
      quotationIds,
      action: 'REJECT',
      reason,
    };
    await processBulkApprovals(request);
  }, [processBulkApprovals]);

  const processBulkRequestChanges = useCallback(async (quotationIds: string[], comments: string) => {
    const request: BulkApprovalRequest = {
      quotationIds,
      action: 'REQUEST_CHANGES',
      comments,
    };
    await processBulkApprovals(request);
  }, [processBulkApprovals]);

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setCurrentOperation('');
    setResults(null);
    setError(null);
  }, []);

  const validateBulkOperation = useCallback((items: ApprovalItem[], action: string) => {
    const errors: string[] = [];

    // Check if items are provided
    if (!items || items.length === 0) {
      errors.push('No items selected for bulk operation');
      return { isValid: false, errors };
    }

    // Check maximum selection limit
    if (items.length > BULK_OPERATION_LIMITS.MAX_SELECTION) {
      errors.push(`Cannot process more than ${BULK_OPERATION_LIMITS.MAX_SELECTION} items at once`);
    }

    // Check if all items are in processable status
    const processableStatuses: string[] = ['PENDING', 'UNDER_REVIEW'];
    const invalidItems = items.filter(item => !processableStatuses.includes(item.status));
    if (invalidItems.length > 0) {
      errors.push(`${invalidItems.length} items are not in a processable status`);
    }

    // Check for mixed project managers (warning, not error)
    const uniqueManagers = new Set(items.map(item => item.projectManagerId));
    if (uniqueManagers.size > 1) {
      // This is a warning, not an error
      console.warn(`Bulk operation spans ${uniqueManagers.size} different project managers`);
    }

    // Check for budget issues
    const budgetIssues = items.filter(item => 
      item.budgetCompliance === 'WARNING' || item.budgetCompliance === 'EXCEEDED'
    );
    if (budgetIssues.length > 0 && action === 'APPROVE') {
      errors.push(`${budgetIssues.length} items have budget compliance issues`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const canBulkProcess = useCallback((items: ApprovalItem[]) => {
    if (!items || items.length === 0) return false;
    if (items.length > BULK_OPERATION_LIMITS.MAX_SELECTION) return false;
    
    const processableStatuses: string[] = ['PENDING', 'UNDER_REVIEW'];
    return items.every(item => processableStatuses.includes(item.status));
  }, []);

  return {
    // State
    isProcessing,
    progress,
    currentOperation,
    results,
    error,

    // Actions
    processBulkApprovals,
    processBulkApprove,
    processBulkReject,
    processBulkRequestChanges,
    resetState,

    // Validation
    validateBulkOperation,
    canBulkProcess,
  };
};