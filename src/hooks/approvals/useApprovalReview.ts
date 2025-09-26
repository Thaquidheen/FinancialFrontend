// hooks/approvals/useApprovalReview.ts
import { useState, useCallback } from 'react';
import { ApprovalItem } from '../../types/approval.types';
import approvalService from '../../services/approvalService';

interface UseApprovalReviewReturn {
  isProcessing: boolean;
  error: string | null;
  processApproval: (approval: ApprovalItem, action: string, comments?: string) => Promise<boolean>;
  processRejection: (approval: ApprovalItem, reason: string, comments: string) => Promise<boolean>;
  processRequestChanges: (approval: ApprovalItem, comments: string) => Promise<boolean>;
}

export const useApprovalReview = (): UseApprovalReviewReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processApproval = useCallback(async (
    approval: ApprovalItem, 
    action: string, 
    comments?: string
  ): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);

    try {
      await approvalService.processApproval({
        quotationId: approval.quotationId,
        action: action.toUpperCase() as 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
        comments: comments || '',
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process approval');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processRejection = useCallback(async (
    approval: ApprovalItem, 
    reason: string, 
    comments: string
  ): Promise<boolean> => {
    return processApproval(approval, 'REJECT', `${reason}: ${comments}`);
  }, [processApproval]);

  const processRequestChanges = useCallback(async (
    approval: ApprovalItem, 
    comments: string
  ): Promise<boolean> => {
    return processApproval(approval, 'REQUEST_CHANGES', comments);
  }, [processApproval]);

  return {
    isProcessing,
    error,
    processApproval,
    processRejection,
    processRequestChanges,
  };
};
