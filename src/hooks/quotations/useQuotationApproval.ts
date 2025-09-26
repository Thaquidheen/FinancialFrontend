import { useState, useCallback } from 'react';
import { quotationService } from '../../services/quotation/quotationService';

export interface UseQuotationApprovalReturn {
  loading: boolean;
  error: string | null;
  approveSingle: (id: number, comments?: string) => Promise<void>;
  rejectSingle: (id: number, reason: string) => Promise<void>;
  approveBulk: (ids: number[], comments?: string) => Promise<void>;
  rejectBulk: (ids: number[], reason: string) => Promise<void>;
}

export const useQuotationApproval = (
  onSuccess?: () => void
): UseQuotationApprovalReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveSingle = useCallback(async (id: number, comments?: string) => {
    setLoading(true);
    setError(null);

    try {
      await quotationService.approveQuotation(id, comments);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to approve quotation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const rejectSingle = useCallback(async (id: number, reason: string) => {
    setLoading(true);
    setError(null);

    try {
      await quotationService.rejectQuotation(id, reason);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to reject quotation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const approveBulk = useCallback(async (ids: number[], comments?: string) => {
    setLoading(true);
    setError(null);

    try {
      await quotationService.bulkApprove(ids, comments);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to approve quotations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const rejectBulk = useCallback(async (ids: number[], reason: string) => {
    setLoading(true);
    setError(null);

    try {
      await quotationService.bulkReject(ids, reason);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to reject quotations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    loading,
    error,
    approveSingle,
    rejectSingle,
    approveBulk,
    rejectBulk
  };
};