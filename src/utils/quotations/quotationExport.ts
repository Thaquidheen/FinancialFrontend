import { QuotationSummary, Quotation, LineItem } from '../../types/quotation';
import { formatCurrency, formatDate } from './quotationFormatters';

export const exportToCSV = (quotations: QuotationSummary[]): string => {
  const headers = [
    'ID',
    'Description', 
    'Project',
    'Amount',
    'Currency',
    'Status',
    'Created Date',
    'Created By',
    'Items Count'
  ].join(',');

  const rows = quotations.map(q => [
    q.id,
    `"${q.description.replace(/"/g, '""')}"`,
    `"${q.projectName.replace(/"/g, '""')}"`,
    q.totalAmount,
    q.currency,
    q.status,
    formatDate(q.createdDate),
    `"${q.createdByName.replace(/"/g, '""')}"`,
    q.itemCount
  ].join(',')).join('\n');

  return `${headers}\n${rows}`;
};

export const downloadCSV = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateQuotationPDF = async (quotation: Quotation): Promise<Blob> => {
  // This would require a PDF generation library like jsPDF
  // For now, return a placeholder
  const content = `
    Quotation #${quotation.id}
    Project: ${quotation.project.name}
    Description: ${quotation.description}
    Total Amount: ${formatCurrency(quotation.totalAmount, quotation.currency)}
    Status: ${quotation.status}
    Created: ${formatDate(quotation.createdDate)}
    
    Line Items:
    ${quotation.items.map((item: LineItem, index: number) => `
    ${index + 1}. ${item.description}
       Amount: ${formatCurrency(item.amount, item.currency)}
       Category: ${item.category}
       Date: ${formatDate(item.itemDate)}
    `).join('\n')}
  `;

  return new Blob([content], { type: 'text/plain' });
};

// Helper functions for data manipulation
export const groupQuotationsByStatus = (quotations: QuotationSummary[]) => {
  return quotations.reduce((groups, quotation) => {
    const status = quotation.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(quotation);
    return groups;
  }, {} as Record<string, QuotationSummary[]>);
};

export const sortQuotationsByAmount = (
  quotations: QuotationSummary[],
  ascending: boolean = true
): QuotationSummary[] => {
  return [...quotations].sort((a, b) => {
    return ascending 
      ? a.totalAmount - b.totalAmount
      : b.totalAmount - a.totalAmount;
  });
};

export const filterQuotationsByDateRange = (
  quotations: QuotationSummary[],
  startDate: string,
  endDate: string
): QuotationSummary[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return quotations.filter(q => {
    const created = new Date(q.createdDate);
    return created >= start && created <= end;
  });
};