// hooks/approvals/useApprovalHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { ApprovalHistory } from '../../types/approval.types';
import approvalService from '../../services/approvalService';

interface UseApprovalHistoryReturn {
  history: ApprovalHistory[];
  loading: boolean;
  error: string | null;
  loadHistory: (quotationId: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export const useApprovalHistory = (quotationId?: string): UseApprovalHistoryReturn => {
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const historyData = await approvalService.getApprovalHistory(id);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approval history');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    if (quotationId) {
      await loadHistory(quotationId);
    }
  }, [quotationId, loadHistory]);

  useEffect(() => {
    if (quotationId) {
      loadHistory(quotationId);
    }
  }, [quotationId, loadHistory]);

  return {
    history,
    loading,
    error,
    loadHistory,
    refreshHistory,
  };
};

