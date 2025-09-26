// hooks/approvals/useApprovalStats.ts
import { useState, useEffect, useCallback } from 'react';
import { ApprovalStatistics } from '../../types/approval.types';
import approvalService from '../../services/approvalService';

interface UseApprovalStatsReturn {
  // Data
  statistics: ApprovalStatistics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  loadStatistics: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  loadDashboard: () => Promise<{
    statistics: ApprovalStatistics;
    urgentApprovalsCount: number;
    totalPendingApprovals: number;
  }>;

  // Computed values
  approvalRate: number;
  averageProcessingTime: string;
  workloadBalance: number;
  budgetComplianceRate: number;
}

export const useApprovalStats = (): UseApprovalStatsReturn => {
  const [statistics, setStatistics] = useState<ApprovalStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await approvalService.getApprovalStatistics();
      setStatistics(response);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load approval statistics');
      console.error('Error loading approval statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStatistics = useCallback(async () => {
    await loadStatistics();
  }, [loadStatistics]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await approvalService.getApprovalDashboard();
      setStatistics(response.statistics);
      setLastUpdated(new Date());
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Computed values
  const approvalRate = statistics ? 
    (statistics.approvedToday / (statistics.approvedToday + statistics.rejectedToday)) * 100 : 0;

  const averageProcessingTime = statistics ? 
    `${Math.round(statistics.averageApprovalTime)} hours` : 'N/A';

  const workloadBalance = statistics && statistics.workloadDistribution.length > 0 ? 
    (() => {
      const pendingCounts = statistics.workloadDistribution.map(w => w.pendingCount);
      const max = Math.max(...pendingCounts);
      const min = Math.min(...pendingCounts);
      return max > 0 ? ((max - min) / max) * 100 : 0;
    })() : 0;

  const budgetComplianceRate = statistics ? 
    (statistics.budgetComplianceStats.compliant / statistics.budgetComplianceStats.total) * 100 : 0;

  // Load statistics on mount
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    // Data
    statistics,
    loading,
    error,
    lastUpdated,

    // Actions
    loadStatistics,
    refreshStatistics,
    loadDashboard,

    // Computed values
    approvalRate,
    averageProcessingTime,
    workloadBalance,
    budgetComplianceRate,
  };
};
