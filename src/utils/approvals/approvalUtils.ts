// utils/approvals/approvalUtils.ts
import {
    ApprovalItem,
    UrgencyLevel,
    BudgetComplianceStatus,
    ApprovalSummary,
    ApprovalStatus,
    ApprovalHistory
  } from '../../types/approval.types';
  import {
    URGENCY_THRESHOLDS,
    STATUS_COLORS,
    URGENCY_COLORS,
    BUDGET_COMPLIANCE_COLORS,
    BUSINESS_RULES
  } from '../../constants/approvals/approvalConstants';
  
  /**
   * Calculate urgency level based on days waiting
   */
  export const calculateUrgency = (submissionDate: Date): UrgencyLevel => {
    const now = new Date();
    const daysWaiting = Math.floor(
      (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  
    if (daysWaiting >= URGENCY_THRESHOLDS.CRITICAL_DAYS) {
      return 'CRITICAL';
    } else if (daysWaiting >= URGENCY_THRESHOLDS.HIGH_DAYS) {
      return 'HIGH';
    } else if (daysWaiting >= 1) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  };
  
  /**
   * Calculate days waiting since submission
   */
  export const calculateDaysWaiting = (submissionDate: Date): number => {
    const now = new Date();
    return Math.floor(
      (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };
  
  /**
   * Calculate business days waiting (excluding weekends)
   */
  export const calculateBusinessDaysWaiting = (submissionDate: Date): number => {
    const now = new Date();
    let businessDays = 0;
    const currentDate = new Date(submissionDate);
  
    while (currentDate < now) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return businessDays;
  };
  
  /**
   * Determine budget compliance status
   */
  export const determineBudgetCompliance = (
    projectBudget: number,
    spentAmount: number,
    quotationAmount: number
  ): BudgetComplianceStatus => {
    const totalAfterQuotation = spentAmount + quotationAmount;
    const utilizationPercentage = (totalAfterQuotation / projectBudget) * 100;
  
    if (utilizationPercentage > 100) {
      return 'EXCEEDED';
    } else if (utilizationPercentage > 90) {
      return 'WARNING';
    } else {
      return 'COMPLIANT';
    }
  };
  
  /**
   * Format approval status for display
   */
  export const formatApprovalStatus = (status: ApprovalStatus): string => {
    const statusMap: Record<ApprovalStatus, string> = {
      PENDING: 'Pending Review',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      RETURNED: 'Returned for Changes'
    };
    return statusMap[status] || status;
  };
  
  /**
   * Format urgency level for display
   */
  export const formatUrgencyLevel = (urgency: UrgencyLevel): string => {
    const urgencyMap: Record<UrgencyLevel, string> = {
      LOW: 'Low Priority',
      MEDIUM: 'Medium Priority',
      HIGH: 'High Priority',
      CRITICAL: 'Critical'
    };
    return urgencyMap[urgency] || urgency;
  };
  
  /**
   * Format budget compliance for display
   */
  export const formatBudgetCompliance = (compliance: BudgetComplianceStatus): string => {
    const complianceMap: Record<BudgetComplianceStatus, string> = {
      COMPLIANT: 'Budget Compliant',
      WARNING: 'Budget Warning',
      EXCEEDED: 'Budget Exceeded',
      WITHIN_BUDGET: 'Within Budget',
      BUDGET_EXCEEDED: 'Budget Exceeded'
    };
    return complianceMap[compliance] || compliance;
  };
  
  /**
   * Get status color configuration
   */
  export const getStatusColor = (status: ApprovalStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  };
  
  /**
   * Get urgency color configuration
   */
  export const getUrgencyColor = (urgency: UrgencyLevel) => {
    return URGENCY_COLORS[urgency] || URGENCY_COLORS.LOW;
  };
  
  /**
   * Get budget compliance color configuration
   */
  export const getBudgetComplianceColor = (compliance: BudgetComplianceStatus) => {
    return BUDGET_COMPLIANCE_COLORS[compliance] || BUDGET_COMPLIANCE_COLORS.COMPLIANT;
  };
  
  /**
   * Validate if items can be bulk processed
   */
  export const canBulkProcess = (items: ApprovalItem[]): boolean => {
    if (items.length === 0 || items.length > BUSINESS_RULES.MAX_EXPORT_RECORDS) {
      return false;
    }
  
    // Check if all items are in processable status
    const processableStatuses: ApprovalStatus[] = ['PENDING', 'UNDER_REVIEW'];
    return items.every(item => processableStatuses.includes(item.status));
  };
  
  /**
   * Generate approval summary for selected items
   */
  export const generateApprovalSummary = (approvals: ApprovalItem[]): ApprovalSummary => {
    const uniqueProjects = new Set(approvals.map(item => item.projectId));
    const uniqueManagers = new Set(approvals.map(item => item.projectManagerId));
    
    const totalAmount = approvals.reduce((sum, item) => sum + item.totalAmount, 0);
    const urgentCount = approvals.filter(item => 
      item.urgencyLevel === 'HIGH' || item.urgencyLevel === 'CRITICAL'
    ).length;
    const budgetIssuesCount = approvals.filter(item => 
      item.budgetCompliance === 'WARNING' || item.budgetCompliance === 'EXCEEDED'
    ).length;
  
    return {
      totalSelected: approvals.length,
      totalAmount,
      projectsCount: uniqueProjects.size,
      managersCount: uniqueManagers.size,
      urgentCount,
      budgetIssuesCount
    };
  };
  
  /**
   * Format currency amount
   */
  export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };
  
  /**
   * Format relative time (e.g., "2 days ago")
   */
  export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  /**
   * Format date for display
   */
  export const formatDate = (date: Date, includeTime: boolean = false): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
  
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
  
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  
  /**
   * Generate approval timeline from history
   */
  export const generateApprovalTimeline = (history: ApprovalHistory[]) => {
    return history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(item => ({
        ...item,
        formattedTime: formatRelativeTime(new Date(item.timestamp)),
        formattedDate: formatDate(new Date(item.timestamp), true)
      }));
  };
  
  /**
   * Calculate approval statistics
   */
  export const calculateApprovalStats = (approvals: ApprovalItem[]) => {
    const totalCount = approvals.length;
    const statusCounts = approvals.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<ApprovalStatus, number>);
  
    const urgencyCounts = approvals.reduce((acc, item) => {
      acc[item.urgencyLevel] = (acc[item.urgencyLevel] || 0) + 1;
      return acc;
    }, {} as Record<UrgencyLevel, number>);
  
    const averageAmount = totalCount > 0 
      ? approvals.reduce((sum, item) => sum + item.totalAmount, 0) / totalCount 
      : 0;
  
    const averageWaitingDays = totalCount > 0
      ? approvals.reduce((sum, item) => sum + item.daysWaiting, 0) / totalCount
      : 0;
  
    return {
      totalCount,
      statusCounts,
      urgencyCounts,
      averageAmount,
      averageWaitingDays
    };
  };
  
  /**
   * Filter approvals based on search criteria
   */
  export const filterApprovals = (
    approvals: ApprovalItem[], 
    searchTerm: string
  ): ApprovalItem[] => {
    if (!searchTerm.trim()) {
      return approvals;
    }
  
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return approvals.filter(approval => 
      approval.quotationNumber.toLowerCase().includes(lowercaseSearch) ||
      approval.projectName.toLowerCase().includes(lowercaseSearch) ||
      approval.projectManagerName.toLowerCase().includes(lowercaseSearch) ||
      approval.description?.toLowerCase().includes(lowercaseSearch) ||
      approval.totalAmount.toString().includes(searchTerm)
    );
  };
  
  /**
   * Sort approvals by specified criteria
   */
  export const sortApprovals = (
    approvals: ApprovalItem[],
    sortBy: keyof ApprovalItem,
    sortDirection: 'asc' | 'desc'
  ): ApprovalItem[] => {
    return [...approvals].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
  
      // Handle date values
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
  
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
  
      if (sortDirection === 'asc') {
        return (aValue || 0) < (bValue || 0) ? -1 : (aValue || 0) > (bValue || 0) ? 1 : 0;
      } else {
        return (aValue || 0) > (bValue || 0) ? -1 : (aValue || 0) < (bValue || 0) ? 1 : 0;
      }
    });
  };
  
  /**
   * Validate approval action
   */
  export const validateApprovalAction = (
    approval: ApprovalItem,
    action: 'APPROVE' | 'REJECT',
    comments?: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
  
    // Check if approval is in processable status
    if (!['PENDING', 'UNDER_REVIEW'].includes(approval.status)) {
      errors.push('Quotation is not in a processable status');
    }
  
    // Check if rejection requires comments
    if (action === 'REJECT') {
      if (!comments || comments.trim().length < BUSINESS_RULES.MIN_COMMENT_LENGTH_FOR_REJECTION) {
        errors.push(`Rejection comments must be at least ${BUSINESS_RULES.MIN_COMMENT_LENGTH_FOR_REJECTION} characters`);
      }
    }
  
    // Check comment length limits
    if (comments && comments.length > BUSINESS_RULES.MAX_COMMENT_LENGTH) {
      errors.push(`Comments cannot exceed ${BUSINESS_RULES.MAX_COMMENT_LENGTH} characters`);
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Export approvals to CSV format
   */
  export const exportToCSV = (approvals: ApprovalItem[]): string => {
    const headers = [
      'Quotation Number',
      'Project Name',
      'Project Manager',
      'Total Amount',
      'Currency',
      'Submission Date',
      'Days Waiting',
      'Status',
      'Urgency',
      'Budget Compliance',
      'Has Documents'
    ];
  
    const rows = approvals.map(approval => [
      approval.quotationNumber,
      approval.projectName,
      approval.projectManagerName,
      approval.totalAmount.toString(),
      approval.currency,
      formatDate(approval.submissionDate, true),
      approval.daysWaiting.toString(),
      formatApprovalStatus(approval.status),
      formatUrgencyLevel(approval.urgencyLevel),
      formatBudgetCompliance(approval.budgetCompliance),
      approval.hasDocuments ? 'Yes' : 'No'
    ]);
  
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };
  
  /**
   * Download file helper
   */
  export const downloadFile = (content: string | Blob, filename: string, contentType: string = 'text/plain') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  /**
   * Get approval action color
   */
  export const getActionColor = (action: string): string => {
    const actionColors: Record<string, string> = {
      APPROVE: '#52c41a',
      REJECT: '#ff4d4f',
      REQUEST_CHANGES: '#faad14',
      RETURN: '#722ed1'
    };
    return actionColors[action] || '#1890ff';
  };