import * as XLSX from 'xlsx';
import { PaymentSummaryResponse, PaymentSearchParams } from '../types/payment.types';
import { paymentService } from './paymentService';

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeDetails: boolean;
  includeTimeline: boolean;
  dateFormat: 'US' | 'UK' | 'ISO';
  currencyFormat: 'SAR' | 'USD';
}

class PaymentExportService {
  
  /**
   * Export payments to Excel
   */
  async exportToExcel(payments: PaymentSummaryResponse[], options: ExportOptions = {
    format: 'excel',
    includeDetails: true,
    includeTimeline: false,
    dateFormat: 'US',
    currencyFormat: 'SAR'
  }) {
    const workbook = XLSX.utils.book_new();
    
    // Main payments sheet
    const mainData = this.preparePaymentData(payments, options);
    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    
    // Apply styling
    this.styleWorksheet(mainSheet);
    
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Payments');
    
    // Summary sheet
    const summaryData = this.prepareSummaryData(payments);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Bank breakdown sheet
    const bankData = this.prepareBankBreakdown(payments);
    const bankSheet = XLSX.utils.json_to_sheet(bankData);
    XLSX.utils.book_append_sheet(workbook, bankSheet, 'Bank Breakdown');
    
    // Generate and download
    const fileName = `payment-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
  
  /**
   * Export payments to CSV
   */
  async exportToCSV(payments: PaymentSummaryResponse[], options: ExportOptions) {
    const data = this.preparePaymentData(payments, options);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Export using backend service
   */
  async exportViaBackend(
    filters: PaymentSearchParams,
    format: 'excel' | 'csv' | 'pdf' = 'excel'
  ) {
    try {
      const blob = await paymentService.exportPayments(format, filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-export-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export payments');
    }
  }
  
  private preparePaymentData(payments: PaymentSummaryResponse[], options: ExportOptions) {
    return payments.map(payment => {
      const baseData = {
        'Payment ID': payment.id,
        'Employee Name': payment.payeeName,
        'Employee ID': payment.id,
        'Department': '',
        'Amount': this.formatCurrency(payment.amount, options.currencyFormat),
        'Currency': 'SAR',
        'Status': payment.status,
        'Bank Name': payment.bankName || '',
        'Account Number': '',
        'IBAN': '',
        'Project Name': payment.projectName || '',
        'Quotation ID': payment.quotationId,
        'Created Date': this.formatDate(payment.createdDate, options.dateFormat),
        'Payment Date': payment.paymentDate ? this.formatDate(payment.paymentDate, options.dateFormat) : '',
        'Bank Reference': '',
        'Batch ID': ''
      };
      
      if (options.includeDetails) {
        return {
          ...baseData,
          'Beneficiary Address': '',
          'Failure Reason': '',
          'Last Modified': ''
        };
      }
      
      return baseData;
    });
  }
  
  private prepareSummaryData(payments: PaymentSummaryResponse[]) {
    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bankCounts = payments.reduce((acc, payment) => {
      const bank = payment.bankName || 'Unassigned';
      acc[bank] = (acc[bank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const avgAmount = totalAmount / payments.length;
    
    return [
      { Metric: 'Total Payments', Value: payments.length },
      { Metric: 'Total Amount (SAR)', Value: this.formatCurrency(totalAmount, 'SAR') },
      { Metric: 'Average Amount (SAR)', Value: this.formatCurrency(avgAmount, 'SAR') },
      { Metric: '', Value: '' }, // Empty row
      { Metric: 'Status Breakdown', Value: '' },
      ...Object.entries(statusCounts).map(([status, count]) => ({
        Metric: status,
        Value: count
      })),
      { Metric: '', Value: '' }, // Empty row
      { Metric: 'Bank Breakdown', Value: '' },
      ...Object.entries(bankCounts).map(([bank, count]) => ({
        Metric: bank,
        Value: count
      }))
    ];
  }
  
  private prepareBankBreakdown(payments: PaymentSummaryResponse[]) {
    const bankStats = payments.reduce((acc, payment) => {
      const bankName = payment.bankName || 'Unassigned';
      if (!acc[bankName]) {
        acc[bankName] = {
          count: 0,
          totalAmount: 0,
          payments: []
        };
      }
      acc[bankName].count += 1;
      acc[bankName].totalAmount += payment.amount;
      acc[bankName].payments.push(payment);
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(bankStats).map(([bankName, stats]) => ({
      'Bank Name': bankName,
      'Payment Count': stats.count,
      'Total Amount (SAR)': this.formatCurrency(stats.totalAmount, 'SAR'),
      'Average Amount (SAR)': this.formatCurrency(stats.totalAmount / stats.count, 'SAR'),
      'Percentage': `${((stats.count / payments.length) * 100).toFixed(1)}%`
    }));
  }
  
  private styleWorksheet(worksheet: XLSX.WorkSheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Auto-width columns
    const colWidths: any[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          maxWidth = Math.max(maxWidth, cell.v.toString().length);
        }
      }
      colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    worksheet['!cols'] = colWidths;
  }
  
  private formatCurrency(amount: number, format: 'SAR' | 'USD') {
    if (format === 'SAR') {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  private formatDate(dateString: string, format: 'US' | 'UK' | 'ISO') {
    const date = new Date(dateString);
    switch (format) {
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'ISO':
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString();
    }
  }
}

export const paymentExportService = new PaymentExportService();