// src/types/saudiBanking.types.ts

export interface SaudiBankDefinition {
    code: string;
    name: string;
    arabicName: string;
    shortName: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    ibanPrefix: string;
    accountNumberFormats: AccountNumberFormat[];
    supportsBulkPayments: boolean;
    maxBulkPayments: number;
    fileFormats: SupportedFileFormat[];
    processingTime: string;
    cutoffTime: string;
    workingDays: string[];
    website: string;
    supportEmail?: string;
    supportPhone?: string;
  }
  
  export interface AccountNumberFormat {
    type: 'ACCOUNT_NUMBER' | 'IBAN';
    length: number[];
    pattern: string;
    description: string;
    example: string;
  }
  
  export interface SupportedFileFormat {
    type: 'EXCEL' | 'CSV' | 'XML' | 'TEXT';
    extension: string;
    mimeType: string;
    encoding: string;
    preferred: boolean;
  }
  
  // Saudi Bank File Excel Format
  export interface SaudiBankExcelFormat {
    bankCode: string;
    fileName: string;
    sheetName: string;
    startRow: number;
    columns: ExcelColumnDefinition[];
    footerRow?: boolean;
    summarySheet?: boolean;
  }
  
  export interface ExcelColumnDefinition {
    columnIndex: number; // A=1, B=2, etc.
    columnLetter: string;
    fieldName: string;
    header: string;
    arabicHeader?: string;
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'CURRENCY';
    required: boolean;
    maxLength?: number;
    minLength?: number;
    validation?: ColumnValidation;
    format?: ExcelCellFormat;
    defaultValue?: string;
  }
  
  export interface ColumnValidation {
    pattern?: string;
    enum?: string[];
    min?: number;
    max?: number;
    customValidator?: string;
  }
  
  export interface ExcelCellFormat {
    numberFormat?: string;
    alignment?: 'left' | 'center' | 'right';
    bold?: boolean;
    backgroundColor?: string;
    fontColor?: string;
  }
  
  // IBAN Validation for Saudi Arabia
  export interface SaudiIBANValidation {
    isValid: boolean;
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    checkDigits?: string;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }
  
  // Saudi Banking Constants
  export const SAUDI_BANKS: SaudiBankDefinition[] = [
    {
      code: 'ALRAJHI',
      name: 'Al Rajhi Bank',
      arabicName: 'مصرف الراجحي',
      shortName: 'Al Rajhi',
      primaryColor: '#1B4D3E',
      secondaryColor: '#F0F8F0',
      ibanPrefix: '80',
      accountNumberFormats: [
        {
          type: 'IBAN',
          length: [24],
          pattern: 'SA[0-9]{2}80[0-9]{18}',
          description: 'Saudi IBAN format for Al Rajhi Bank',
          example: 'SA0380000000608010167519'
        },
        {
          type: 'ACCOUNT_NUMBER',
          length: [10, 12, 15],
          pattern: '[0-9]{10,15}',
          description: 'Account number format',
          example: '608010167519'
        }
      ],
      supportsBulkPayments: true,
      maxBulkPayments: 1000,
      fileFormats: [
        {
          type: 'EXCEL',
          extension: '.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          encoding: 'UTF-8',
          preferred: true
        }
      ],
      processingTime: '2-3 business hours',
      cutoffTime: '14:00',
      workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      website: 'https://www.alrajhibank.com.sa'
    },
    {
      code: 'NCB',
      name: 'National Commercial Bank',
      arabicName: 'البنك الأهلي التجاري',
      shortName: 'NCB',
      primaryColor: '#1E3A8A',
      secondaryColor: '#EBF8FF',
      ibanPrefix: '10',
      accountNumberFormats: [
        {
          type: 'IBAN',
          length: [24],
          pattern: 'SA[0-9]{2}10[0-9]{18}',
          description: 'Saudi IBAN format for NCB',
          example: 'SA0310000000014016000101'
        }
      ],
      supportsBulkPayments: true,
      maxBulkPayments: 500,
      fileFormats: [
        {
          type: 'EXCEL',
          extension: '.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          encoding: 'UTF-8',
          preferred: true
        }
      ],
      processingTime: '1-2 business hours',
      cutoffTime: '15:00',
      workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      website: 'https://www.alahli.com'
    },
    {
      code: 'SABB',
      name: 'Saudi British Bank',
      arabicName: 'البنك السعودي البريطاني',
      shortName: 'SABB',
      primaryColor: '#DC2626',
      secondaryColor: '#FEF2F2',
      ibanPrefix: '45',
      accountNumberFormats: [
        {
          type: 'IBAN',
          length: [24],
          pattern: 'SA[0-9]{2}45[0-9]{18}',
          description: 'Saudi IBAN format for SABB',
          example: 'SA0345000000012345678901'
        }
      ],
      supportsBulkPayments: true,
      maxBulkPayments: 750,
      fileFormats: [
        {
          type: 'EXCEL',
          extension: '.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          encoding: 'UTF-8',
          preferred: true
        }
      ],
      processingTime: '2-4 business hours',
      cutoffTime: '13:30',
      workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      website: 'https://www.sabb.com'
    },
    {
      code: 'RIYAD',
      name: 'Riyad Bank',
      arabicName: 'بنك الرياض',
      shortName: 'Riyad Bank',
      primaryColor: '#059669',
      secondaryColor: '#ECFDF5',
      ibanPrefix: '20',
      accountNumberFormats: [
        {
          type: 'IBAN',
          length: [24],
          pattern: 'SA[0-9]{2}20[0-9]{18}',
          description: 'Saudi IBAN format for Riyad Bank',
          example: 'SA0320000000012345678901'
        }
      ],
      supportsBulkPayments: true,
      maxBulkPayments: 600,
      fileFormats: [
        {
          type: 'EXCEL',
          extension: '.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          encoding: 'UTF-8',
          preferred: true
        }
      ],
      processingTime: '1-3 business hours',
      cutoffTime: '14:30',
      workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      website: 'https://www.riyadbank.com'
    },
    {
      code: 'ANB',
      name: 'Arab National Bank',
      arabicName: 'البنك العربي الوطني',
      shortName: 'ANB',
      primaryColor: '#7C3AED',
      secondaryColor: '#F3E8FF',
      ibanPrefix: '05',
      accountNumberFormats: [
        {
          type: 'IBAN',
          length: [24],
          pattern: 'SA[0-9]{2}05[0-9]{18}',
          description: 'Saudi IBAN format for ANB',
          example: 'SA0305000000012345678901'
        }
      ],
      supportsBulkPayments: true,
      maxBulkPayments: 400,
      fileFormats: [
        {
          type: 'EXCEL',
          extension: '.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          encoding: 'UTF-8',
          preferred: true
        }
      ],
      processingTime: '2-4 business hours',
      cutoffTime: '13:00',
      workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      website: 'https://www.anb.com.sa'
    }
  ];
  
  // Bank File Column Configurations
  export const SAUDI_BANK_EXCEL_FORMATS: Record<string, SaudiBankExcelFormat> = {
    ALRAJHI: {
      bankCode: 'ALRAJHI',
      fileName: 'AlRajhi_Payments_{date}_{batchNumber}.xlsx',
      sheetName: 'Payments',
      startRow: 2,
      columns: [
        {
          columnIndex: 1,
          columnLetter: 'A',
          fieldName: 'bankName',
          header: 'Bank Name',
          arabicHeader: 'اسم البنك',
          dataType: 'TEXT',
          required: true,
          defaultValue: 'Al Rajhi Bank'
        },
        {
          columnIndex: 2,
          columnLetter: 'B',
          fieldName: 'iban',
          header: 'Account Number/IBAN',
          arabicHeader: 'رقم الحساب/الآيبان',
          dataType: 'TEXT',
          required: true,
          maxLength: 24,
          validation: {
            pattern: 'SA[0-9]{22}'
          }
        },
        {
          columnIndex: 3,
          columnLetter: 'C',
          fieldName: 'amount',
          header: 'Amount',
          arabicHeader: 'المبلغ',
          dataType: 'CURRENCY',
          required: true,
          format: {
            numberFormat: '#,##0.00',
            alignment: 'right'
          }
        },
        {
          columnIndex: 4,
          columnLetter: 'D',
          fieldName: 'description',
          header: 'Comments/Description',
          arabicHeader: 'التعليقات/الوصف',
          dataType: 'TEXT',
          required: false,
          maxLength: 200
        },
        {
          columnIndex: 5,
          columnLetter: 'E',
          fieldName: 'employeeName',
          header: 'Employee Name',
          arabicHeader: 'اسم الموظف',
          dataType: 'TEXT',
          required: true,
          maxLength: 100
        },
        {
          columnIndex: 6,
          columnLetter: 'F',
          fieldName: 'nationalId',
          header: 'National ID/Iqama ID',
          arabicHeader: 'رقم الهوية/الإقامة',
          dataType: 'TEXT',
          required: true,
          minLength: 10,
          maxLength: 10
        },
        {
          columnIndex: 7,
          columnLetter: 'G',
          fieldName: 'beneficiaryAddress',
          header: 'Beneficiary Address',
          arabicHeader: 'عنوان المستفيد',
          dataType: 'TEXT',
          required: false,
          maxLength: 200
        }
      ]
    },
    NCB: {
      bankCode: 'NCB',
      fileName: 'NCB_Payments_{date}_{batchNumber}.xlsx',
      sheetName: 'BulkPayments',
      startRow: 1,
      columns: [
        // Similar structure but with NCB specific requirements
        {
          columnIndex: 1,
          columnLetter: 'A',
          fieldName: 'bankName',
          header: 'Bank Name',
          dataType: 'TEXT',
          required: true,
          defaultValue: 'National Commercial Bank'
        },
        {
          columnIndex: 2,
          columnLetter: 'B',
          fieldName: 'iban',
          header: 'IBAN',
          dataType: 'TEXT',
          required: true,
          validation: {
            pattern: 'SA[0-9]{2}10[0-9]{18}'
          }
        },
        {
          columnIndex: 3,
          columnLetter: 'C',
          fieldName: 'amount',
          header: 'Amount (SAR)',
          dataType: 'CURRENCY',
          required: true
        },
        {
          columnIndex: 4,
          columnLetter: 'D',
          fieldName: 'employeeName',
          header: 'Beneficiary Name',
          dataType: 'TEXT',
          required: true
        },
        {
          columnIndex: 5,
          columnLetter: 'E',
          fieldName: 'description',
          header: 'Purpose of Payment',
          dataType: 'TEXT',
          required: true
        },
        {
          columnIndex: 6,
          columnLetter: 'F',
          fieldName: 'nationalId',
          header: 'National ID',
          dataType: 'TEXT',
          required: true
        }
      ]
    }
    // Add other banks as needed
  };