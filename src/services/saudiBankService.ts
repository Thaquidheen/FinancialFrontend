

import { 
    SAUDI_BANKS, 
    SAUDI_BANK_EXCEL_FORMATS,
    SaudiBankDefinition, 
    SaudiIBANValidation,
    SaudiBankExcelFormat 
  } from '../types/saudiBanking.types';
  import { Payment } from '../types/payment.types';
  
  export class SaudiBankService {
    /**
     * Get all supported Saudi banks
     */
    getAllBanks(): SaudiBankDefinition[] {
      return SAUDI_BANKS;
    }
  
    /**
     * Get bank by code
     */
    getBankByCode(bankCode: string): SaudiBankDefinition | undefined {
      return SAUDI_BANKS.find(bank => bank.code === bankCode);
    }
  
    /**
     * Get bank by IBAN prefix
     */
    getBankByIBANPrefix(ibanPrefix: string): SaudiBankDefinition | undefined {
      return SAUDI_BANKS.find(bank => bank.ibanPrefix === ibanPrefix);
    }
  
    /**
     * Get banks that support bulk payments
     */
    getBulkPaymentBanks(): SaudiBankDefinition[] {
      return SAUDI_BANKS.filter(bank => bank.supportsBulkPayments);
    }
  
    /**
     * Validate Saudi IBAN
     */
    validateSaudiIBAN(iban: string): SaudiIBANValidation {
      const result: SaudiIBANValidation = {
        isValid: false,
        errors: [],
        warnings: [],
        suggestions: []
      };
  
      // Remove spaces and convert to uppercase
      const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
      // Check if it starts with SA
      if (!cleanIBAN.startsWith('SA')) {
        result.errors.push('IBAN must start with SA for Saudi Arabia');
        return result;
      }
  
      // Check length (should be 24 characters)
      if (cleanIBAN.length !== 24) {
        result.errors.push(`IBAN must be 24 characters long. Current length: ${cleanIBAN.length}`);
        if (cleanIBAN.length < 24) {
          result.suggestions.push('IBAN appears to be incomplete');
        }
        return result;
      }
  
      // Extract components
      const countryCode = cleanIBAN.substring(0, 2); // SA
      const checkDigits = cleanIBAN.substring(2, 4);
      const bankCode = cleanIBAN.substring(4, 6);
      const accountNumber = cleanIBAN.substring(6);
  
      result.checkDigits = checkDigits;
      result.accountNumber = accountNumber;
  
      // Find bank by code
      const bank = this.getBankByIBANPrefix(bankCode);
      if (bank) {
        result.bankCode = bank.code;
        result.bankName = bank.name;
      } else {
        result.warnings.push(`Bank code ${bankCode} not recognized`);
      }
  
      // Validate check digits using MOD-97 algorithm
      if (this.validateIBANChecksum(cleanIBAN)) {
        result.isValid = true;
      } else {
        result.errors.push('Invalid IBAN checksum');
      }
  
      return result;
    }
  
    /**
     * Validate IBAN checksum using MOD-97 algorithm
     */
    private validateIBANChecksum(iban: string): boolean {
      // Move first 4 characters to the end
      const rearranged = iban.substring(4) + iban.substring(0, 4);
      
      // Convert letters to numbers (A=10, B=11, ..., Z=35)
      let numericString = '';
      for (const char of rearranged) {
        if (char >= 'A' && char <= 'Z') {
          numericString += (char.charCodeAt(0) - 55).toString();
        } else {
          numericString += char;
        }
      }
  
      // Calculate mod 97
      let remainder = 0;
      for (let i = 0; i < numericString.length; i++) {
        remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
      }
  
      return remainder === 1;
    }
  
    /**
     * Format IBAN for display
     */
    formatIBAN(iban: string): string {
      const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
      return cleanIBAN.replace(/(.{4})/g, '$1 ').trim();
    }
  
    /**
     * Generate bank-specific file name
     */
    generateFileName(bankCode: string, date: Date, batchNumber: string): string {
      const format = SAUDI_BANK_EXCEL_FORMATS[bankCode];
      if (!format) {
        return `${bankCode}_Payments_${this.formatDate(date)}_${batchNumber}.xlsx`;
      }
  
      const dateStr = this.formatDate(date);
      return format.fileName
        .replace('{date}', dateStr)
        .replace('{batchNumber}', batchNumber);
    }
  
    /**
     * Get Excel format configuration for a bank
     */
    getBankExcelFormat(bankCode: string): SaudiBankExcelFormat | undefined {
      return SAUDI_BANK_EXCEL_FORMATS[bankCode];
    }
  
    /**
     * Validate payment data against bank requirements
     */
    validatePaymentForBank(payment: Payment, bankCode: string): {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    } {
      const result: { isValid: boolean; errors: string[]; warnings: string[] } = {
        isValid: true,
        errors: [],
        warnings: []
      };
  
      const bank = this.getBankByCode(bankCode);
      if (!bank) {
        result.errors.push(`Bank code ${bankCode} is not supported`);
        result.isValid = false;
        return result;
      }
  
      // Validate IBAN if present
      if (payment.iban) {
        const ibanValidation = this.validateSaudiIBAN(payment.iban);
        if (!ibanValidation.isValid) {
          result.errors.push(...(ibanValidation.errors || []));
          result.isValid = false;
        }
        if (ibanValidation.warnings && ibanValidation.warnings.length > 0) {
          result.warnings.push(...ibanValidation.warnings);
        }
  
        // Check if IBAN belongs to the correct bank
        if (ibanValidation.bankCode && ibanValidation.bankCode !== bankCode) {
          result.errors.push(`IBAN belongs to ${ibanValidation.bankName}, not ${bank.name}`);
          result.isValid = false;
        }
      }
  
      // Validate required fields
      if (!payment.employeeName?.trim()) {
        result.errors.push('Employee name is required');
        result.isValid = false;
      }
  
      if (!payment.amount || payment.amount <= 0) {
        result.errors.push('Amount must be greater than 0');
        result.isValid = false;
      }
  
      if (!payment.nationalId?.trim() && !payment.iqamaId?.trim()) {
        result.errors.push('National ID or Iqama ID is required');
        result.isValid = false;
      }
  
      // Validate National ID/Iqama ID format (should be 10 digits)
      const idNumber = payment.nationalId || payment.iqamaId;
      if (idNumber && !/^\d{10}$/.test(idNumber)) {
        result.errors.push('National ID/Iqama ID must be exactly 10 digits');
        result.isValid = false;
      }
  
      // Check bulk payment limits
      // Note: This would be validated during batch processing
      
      return result;
    }
  
    /**
     * Group payments by bank
     */
    groupPaymentsByBank(payments: Payment[]): Map<string, Payment[]> {
      const grouped = new Map<string, Payment[]>();
  
      payments.forEach(payment => {
        let bankCode = payment.bankName;
  
        // Try to determine bank from IBAN if bank name is not set
        if (!bankCode && payment.iban) {
          const validation = this.validateSaudiIBAN(payment.iban);
          if (validation.bankCode) {
            bankCode = validation.bankCode;
          }
        }
  
        if (bankCode) {
          if (!grouped.has(bankCode)) {
            grouped.set(bankCode, []);
          }
          grouped.get(bankCode)!.push(payment);
        }
      });
  
      return grouped;
    }
  
    /**
     * Get bank working hours info
     */
    getBankWorkingHours(bankCode: string): {
      cutoffTime: string;
      processingTime: string;
      workingDays: string[];
      isWorkingDay: boolean;
      timeUntilCutoff?: string;
    } | undefined {
      const bank = this.getBankByCode(bankCode);
      if (!bank) return undefined;
  
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const isWorkingDay = bank.workingDays.includes(currentDay);
  
      let timeUntilCutoff: string | undefined;
      
      if (isWorkingDay && bank.cutoffTime) {
        const [hours, minutes] = bank.cutoffTime.split(':').map(Number);
        const cutoff = new Date();
        cutoff.setHours(hours, minutes, 0, 0);
        
        if (now < cutoff) {
          const diff = cutoff.getTime() - now.getTime();
          const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
          const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          timeUntilCutoff = `${hoursLeft}h ${minutesLeft}m`;
        }
      }
  
      return {
        cutoffTime: bank.cutoffTime,
        processingTime: bank.processingTime,
        workingDays: bank.workingDays,
        isWorkingDay,
        timeUntilCutoff
      };
    }
  
    /**
     * Get currency formatter for SAR
     */
    formatSAR(amount: number): string {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
  
    /**
     * Format date for file naming
     */
    private formatDate(date: Date): string {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    }
  
    /**
     * Get next batch number
     */
    generateBatchNumber(): string {
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-6);
      return `PB${timestamp}`;
    }
  
    /**
     * Check if payment can be processed today
     */
    canProcessToday(bankCode: string): boolean {
      const workingHours = this.getBankWorkingHours(bankCode);
      if (!workingHours) return false;
  
      const now = new Date();
      const [cutoffHours, cutoffMinutes] = workingHours.cutoffTime.split(':').map(Number);
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffHours, cutoffMinutes, 0, 0);
  
      return workingHours.isWorkingDay && now < cutoffTime;
    }
  }
  
  // Export singleton instance
  export const saudiBankService = new SaudiBankService();
  export default saudiBankService;