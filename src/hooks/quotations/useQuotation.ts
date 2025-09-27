import { useState, useEffect } from 'react';
import { quotationService } from '../../services/quotation/quotationService';
import { Quotation } from '../../types/quotation';

export interface UseQuotationReturn {
  quotation: Quotation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submit: () => Promise<void>;
  approve: (comments?: string) => Promise<void>;
  reject: (reason: string) => Promise<void>;
  update: (data: any) => Promise<void>;
  remove: () => Promise<void>;
}

export const useQuotation = (id: number): UseQuotationReturn => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await quotationService.getQuotation(id);
      setQuotation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quotation');
      setQuotation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const refresh = async () => {
    await fetchQuotation();
  };

  const submit = async () => {
    if (!quotation) return;
    await quotationService.submitQuotation(quotation.id, {});
    await refresh();
  };

  const approve = async (comments?: string) => {
    if (!quotation) return;
    await quotationService.approveQuotation(quotation.id, comments);
    await refresh();
  };

  const reject = async (reason: string) => {
    if (!quotation) return;
    await quotationService.rejectQuotation(quotation.id, reason);
    await refresh();
  };

  const update = async (data: any) => {
    if (!quotation) return;
    await quotationService.updateQuotation(quotation.id, data);
    await refresh();
  };

  const remove = async () => {
    if (!quotation) return;
    await quotationService.deleteQuotation(quotation.id);
  };

  return {
    quotation,
    loading,
    error,
    refresh,
    submit,
    approve,
    reject,
    update,
    remove
  };
};
