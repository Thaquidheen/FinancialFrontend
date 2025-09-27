// src/services/saudiBankService.ts

export interface SaudiBankDefinition {
  code: string;
  name: string;
  arabicName: string;
  shortName: string;
  swiftCode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  supportsBulkPayments: boolean;
  maxFileSize?: number;
  maxBulkPayments?: number;
  requiredFields: string[];
  ibanPrefix?: string;
  processingTime?: string;
  cutoffTime?: string;
}

class SaudiBankService {
  private banks: SaudiBankDefinition[] = [
    {
      code: 'RAJHI',
      name: 'Al Rajhi Bank',
      arabicName: 'مصرف الراجحي',
      shortName: 'Al Rajhi',
      swiftCode: 'RJHISARI',
      primaryColor: '#0066CC',
      secondaryColor: '#E3F2FD',
      supportsBulkPayments: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxBulkPayments: 1000,
      requiredFields: ['accountNumber', 'amount', 'beneficiaryName', 'nationalId'],
      ibanPrefix: 'SA',
      processingTime: '1 business day',
      cutoffTime: '15:00'
    },
    {
      code: 'NCB',
      name: 'National Commercial Bank',
      arabicName: 'البنك الأهلي التجاري',
      shortName: 'NCB',
      swiftCode: 'NCBKSAJE',
      primaryColor: '#1B5E20',
      secondaryColor: '#E8F5E8',
      supportsBulkPayments: true,
      maxFileSize: 30 * 1024 * 1024, // 30MB
      maxBulkPayments: 500,
      requiredFields: ['accountNumber', 'amount', 'beneficiaryName', 'nationalId'],
      ibanPrefix: 'SA',
      processingTime: '1 business day',
      cutoffTime: '13:30'
    },
    {
      code: 'SABB',
      name: 'Saudi British Bank',
      arabicName: 'البنك السعودي البريطاني',
      shortName: 'SABB',
      swiftCode: 'SABBSARI',
      primaryColor: '#D32F2F',
      secondaryColor: '#FFEBEE',
      supportsBulkPayments: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxBulkPayments: 300,
      requiredFields: ['accountNumber', 'amount', 'beneficiaryName', 'nationalId'],
      ibanPrefix: 'SA',
      processingTime: '1-2 business days',
      cutoffTime: '14:00'
    },
    {
      code: 'SNB',
      name: 'Saudi National Bank',
      arabicName: 'البنك الأهلي السعودي',
      shortName: 'SNB',
      swiftCode: 'NCBKSAJE',
      primaryColor: '#2E7D32',
      secondaryColor: '#E8F5E8',
      supportsBulkPayments: true,
      maxFileSize: 40 * 1024 * 1024, // 40MB
      maxBulkPayments: 800,
      requiredFields: ['accountNumber', 'amount', 'beneficiaryName', 'nationalId'],
      ibanPrefix: 'SA',
      processingTime: '1 business day',
      cutoffTime: '13:30'
    },
    {
      code: 'RIYAD',
      name: 'Riyad Bank',
      arabicName: 'بنك الرياض',
      shortName: 'Riyad Bank',
      swiftCode: 'RIBLSARI',
      primaryColor: '#1976D2',
      supportsBulkPayments: true,
      maxFileSize: 35 * 1024 * 1024, // 35MB
      requiredFields: ['accountNumber', 'amount', 'beneficiaryName', 'nationalId']
    }
  ];

  /**
   * Get all available banks
   */
  getAllBanks(): SaudiBankDefinition[] {
    return this.banks;
  }

  /**
   * Get bank by code
   */
  getBankByCode(code: string): SaudiBankDefinition | undefined {
    return this.banks.find(bank => 
      bank.code === code || 
      bank.name === code || 
      bank.shortName === code
    );
  }

  /**
   * Get bank by name (case insensitive)
   */
  getBankByName(name: string): SaudiBankDefinition | undefined {
    const normalizedName = name.toLowerCase();
    return this.banks.find(bank => 
      bank.name.toLowerCase().includes(normalizedName) ||
      bank.shortName.toLowerCase().includes(normalizedName) ||
      bank.arabicName.includes(name)
    );
  }

  /**
   * Format Saudi Riyal currency
   */
  formatSAR(amount: number): string {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format Saudi Riyal without currency symbol
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Validate Saudi IBAN
   */
  validateIBAN(iban: string): { isValid: boolean; error?: string } {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Check if it starts with SA
    if (!cleanIban.startsWith('SA')) {
      return { isValid: false, error: 'IBAN must start with SA for Saudi Arabia' };
    }

    // Check length (Saudi IBAN should be 24 characters)
    if (cleanIban.length !== 24) {
      return { isValid: false, error: 'Saudi IBAN must be 24 characters long' };
    }

    // Check if all characters after SA are digits
    const digits = cleanIban.substring(2);
    if (!/^\d+$/.test(digits)) {
      return { isValid: false, error: 'IBAN must contain only digits after SA prefix' };
    }

    // Basic IBAN checksum validation
    const ibanChecksum = this.calculateIBANChecksum(cleanIban);
    if (ibanChecksum !== 1) {
      return { isValid: false, error: 'Invalid IBAN checksum' };
    }

    return { isValid: true };
  }

  /**
   * Calculate IBAN checksum for validation
   */
  private calculateIBANChecksum(iban: string): number {
    // Move first 4 characters to end
    const rearranged = iban.substring(4) + iban.substring(0, 4);
    
    // Replace letters with numbers (A=10, B=11, ..., Z=35)
    const numeric = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );

    // Calculate mod 97
    let remainder = '';
    for (let i = 0; i < numeric.length; i++) {
      remainder += numeric[i];
      if (remainder.length >= 9) {
        remainder = (parseInt(remainder) % 97).toString();
      }
    }
    
    return parseInt(remainder) % 97;
  }

  /**
   * Validate Saudi National ID / Iqama
   */
  validateNationalId(id: string): { isValid: boolean; error?: string } {
    // Remove any non-digits
    const cleanId = id.replace(/\D/g, '');

    // Check length
    if (cleanId.length !== 10) {
      return { isValid: false, error: 'National ID/Iqama must be 10 digits' };
    }

    // Check first digit (1 for Saudi nationals, 2 for residents)
    const firstDigit = parseInt(cleanId[0]);
    if (firstDigit !== 1 && firstDigit !== 2) {
      return { isValid: false, error: 'National ID must start with 1 (Saudi) or 2 (Resident)' };
    }

    // Validate checksum using Luhn algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(cleanId[i]);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit = digit % 10 + Math.floor(digit / 10);
        }
      }
      sum += digit;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    if (checkDigit !== parseInt(cleanId[9])) {
      return { isValid: false, error: 'Invalid National ID checksum' };
    }

    return { isValid: true };
  }

  /**
   * Format account number with bank-specific formatting
   */
  formatAccountNumber(accountNumber: string, bankCode: string): string {
    const bank = this.getBankByCode(bankCode);
    if (!bank) return accountNumber;

    // Remove any existing formatting
    const clean = accountNumber.replace(/\D/g, '');

    // Apply bank-specific formatting
    switch (bank.code) {
      case 'RAJHI':
        // Al Rajhi format: XXXX-XXXX-XXXX-XX
        return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{2})/, '$1-$2-$3-$4');
      case 'NCB':
      case 'SNB':
        // NCB/SNB format: XXXX-XXXXXX
        return clean.replace(/(\d{4})(\d{6})/, '$1-$2');
      default:
        return clean;
    }
  }

  /**
   * Get bank file format requirements
   */
  getBankFileFormat(bankCode: string): {
    headers: string[];
    requiredFields: string[];
    maxRecords: number;
    supportedFormats: string[];
  } {
    const bank = this.getBankByCode(bankCode);
    
    const defaultFormat = {
      headers: [
        'Bank',
        'Account Number',
        'Amount',
        'Comments',
        'Employee Name',
        'National ID/Iqama ID',
        'Beneficiary Address'
      ],
      requiredFields: ['accountNumber', 'amount', 'beneficiaryName', 'nationalId'],
      maxRecords: 1000,
      supportedFormats: ['xlsx', 'xls']
    };

    if (!bank) return defaultFormat;

    return {
      ...defaultFormat,
      requiredFields: bank.requiredFields
    };
  }

  /**
   * Validate payment data for bank file generation
   */
  validatePaymentData(payments: any[], bankCode: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const bank = this.getBankByCode(bankCode);

    if (!bank) {
      errors.push(`Unknown bank code: ${bankCode}`);
      return { isValid: false, errors, warnings };
    }

    payments.forEach((payment, index) => {
      const rowNumber = index + 1;

      // Check required fields
      bank.requiredFields.forEach(field => {
        if (!payment[field]) {
          errors.push(`Row ${rowNumber}: Missing ${field}`);
        }
      });

      // Validate amount
      if (payment.amount <= 0) {
        errors.push(`Row ${rowNumber}: Amount must be greater than 0`);
      }

      // Validate National ID if present
      if (payment.nationalId) {
        const idValidation = this.validateNationalId(payment.nationalId);
        if (!idValidation.isValid) {
          errors.push(`Row ${rowNumber}: ${idValidation.error}`);
        }
      }

      // Check for large amounts
      if (payment.amount > 100000) {
        warnings.push(`Row ${rowNumber}: High amount payment (${this.formatSAR(payment.amount)})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get supported payment methods for a bank
   */
  getSupportedPaymentMethods(bankCode: string): string[] {
    const bank = this.getBankByCode(bankCode);
    if (!bank || !bank.supportsBulkPayments) {
      return [];
    }

    return [
      'BULK_TRANSFER',
      'SALARY_PAYMENT',
      'VENDOR_PAYMENT',
      'EMPLOYEE_REIMBURSEMENT'
    ];
  }

  /**
   * Get bank processing timeline
   */
  getBankProcessingTimeline(bankCode: string): {
    cutoffTime: string;
    processingDays: number;
    description: string;
  } {
    const bank = this.getBankByCode(bankCode);
    
    const defaultTimeline = {
      cutoffTime: '14:00',
      processingDays: 1,
      description: 'Files submitted before 2:00 PM will be processed same day'
    };

    if (!bank) return defaultTimeline;

    // Bank-specific processing times
    switch (bank.code) {
      case 'RAJHI':
        return {
          cutoffTime: '15:00',
          processingDays: 1,
          description: 'Al Rajhi Bank processes files submitted before 3:00 PM on the same day'
        };
      case 'NCB':
      case 'SNB':
        return {
          cutoffTime: '13:30',
          processingDays: 1,
          description: 'NCB processes files submitted before 1:30 PM on the same day'
        };
      default:
        return defaultTimeline;
    }
  }

  /**
   * Generate file name for bank file
   */
  generateFileName(bankCode: string, batchId?: string): string {
    const bank = this.getBankByCode(bankCode);
    const bankName = bank?.shortName || bankCode;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const batch = batchId ? `_${batchId}` : '';
    return `${bankName}_PAYMENTS_${timestamp}${batch}.txt`;
  }

  /**
   * Check if bank can process payments today
   */
  canProcessToday(bankCode: string): boolean {
    const now = new Date();
    const timeline = this.getBankProcessingTimeline(bankCode);
    const cutoffTime = timeline.cutoffTime.split(':');
    const cutoffHour = parseInt(cutoffTime[0]);
    const cutoffMinute = parseInt(cutoffTime[1]);
    
    const cutoffDateTime = new Date(now);
    cutoffDateTime.setHours(cutoffHour, cutoffMinute, 0, 0);
    
    return now < cutoffDateTime;
  }

  /**
   * Get bank working hours
   */
  getBankWorkingHours(bankCode: string): { 
    start: string; 
    end: string; 
    days: string[]; 
    isWorkingDay: boolean;
    timeUntilCutoff: string;
  } {
    const bank = this.getBankByCode(bankCode);
    
    const defaultHours = {
      start: '08:00',
      end: '16:00',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      isWorkingDay: true,
      timeUntilCutoff: '2 hours'
    };

    if (!bank) return defaultHours;

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const isWorkingDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(dayName);
    
    // Calculate time until cutoff
    const timeline = this.getBankProcessingTimeline(bankCode);
    const cutoffTime = timeline.cutoffTime.split(':');
    const cutoffHour = parseInt(cutoffTime[0]);
    const cutoffMinute = parseInt(cutoffTime[1]);
    
    const cutoffDateTime = new Date(now);
    cutoffDateTime.setHours(cutoffHour, cutoffMinute, 0, 0);
    
    const timeDiff = cutoffDateTime.getTime() - now.getTime();
    const hoursUntilCutoff = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesUntilCutoff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeUntilCutoff = 'Closed';
    if (timeDiff > 0) {
      if (hoursUntilCutoff > 0) {
        timeUntilCutoff = `${hoursUntilCutoff}h ${minutesUntilCutoff}m`;
      } else {
        timeUntilCutoff = `${minutesUntilCutoff}m`;
      }
    }

    // Bank-specific working hours
    switch (bank.code) {
      case 'RAJHI':
        return {
          start: '08:00',
          end: '16:00',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          isWorkingDay,
          timeUntilCutoff
        };
      case 'NCB':
      case 'SNB':
        return {
          start: '08:30',
          end: '16:30',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          isWorkingDay,
          timeUntilCutoff
        };
      default:
        return {
          ...defaultHours,
          isWorkingDay,
          timeUntilCutoff
        };
    }
  }
}

// Export singleton instance
export const saudiBankService = new SaudiBankService();
export default saudiBankService;