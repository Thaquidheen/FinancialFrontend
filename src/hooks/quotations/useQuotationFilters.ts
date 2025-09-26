import { useState, useMemo, useCallback } from 'react';
import { QuotationFilters } from '../../types/quotation';

export interface UseQuotationFiltersReturn {
  filters: QuotationFilters;
  setFilters: (filters: QuotationFilters) => void;
  updateFilter: (key: keyof QuotationFilters, value: any) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  getFilterSummary: () => string;
}

const defaultFilters: QuotationFilters = {
  page: 0,
  size: 10,
  sortBy: 'createdDate',
  sortDir: 'desc'
};

export const useQuotationFilters = (
  initialFilters: QuotationFilters = {}
): UseQuotationFiltersReturn => {
  const [filters, setFilters] = useState<QuotationFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  const updateFilter = useCallback((key: keyof QuotationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0 // Reset page when filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    const activeKeys = Object.keys(filters).filter(key => 
      !['page', 'size', 'sortBy', 'sortDir'].includes(key) &&
      filters[key as keyof QuotationFilters] !== undefined &&
      filters[key as keyof QuotationFilters] !== null &&
      filters[key as keyof QuotationFilters] !== ''
    );
    return activeKeys.length > 0;
  }, [filters]);

  const getFilterSummary = useCallback((): string => {
    const activeFilters: string[] = [];

    if (filters.status) {
      activeFilters.push(`Status: ${filters.status}`);
    }
    if (filters.projectId) {
      activeFilters.push(`Project ID: ${filters.projectId}`);
    }
    if (filters.currency) {
      activeFilters.push(`Currency: ${filters.currency}`);
    }
    if (filters.exceedsBudget !== undefined) {
      activeFilters.push(`Exceeds Budget: ${filters.exceedsBudget ? 'Yes' : 'No'}`);
    }
    if (filters.startDate) {
      activeFilters.push(`From: ${filters.startDate}`);
    }
    if (filters.endDate) {
      activeFilters.push(`To: ${filters.endDate}`);
    }
    if (filters.minAmount) {
      activeFilters.push(`Min Amount: ${filters.minAmount}`);
    }
    if (filters.maxAmount) {
      activeFilters.push(`Max Amount: ${filters.maxAmount}`);
    }

    return activeFilters.join(', ');
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    getFilterSummary
  };
};