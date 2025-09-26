// src/types/quotation/lineItem.ts
import { Currency } from './common';

export enum LineItemCategory {
  CONSUMPTION_DIRECT_MATERIAL = 'CONSUMPTION_DIRECT_MATERIAL',
  CONTRACT_LABOUR = 'CONTRACT_LABOUR',
  EQUIPMENT_RENTALS = 'EQUIPMENT_RENTALS',
  ROOM_RENT = 'ROOM_RENT',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
  MAINTENANCE = 'MAINTENANCE',
  SERVICES = 'SERVICES',
  OTHER = 'OTHER'
}

export enum AccountHead {
  // Direct Material
  RAW_MATERIALS = 'RAW_MATERIALS',
  CONSUMABLES = 'CONSUMABLES',
  SPARE_PARTS = 'SPARE_PARTS',
  
  // Labour
  SKILLED_LABOUR = 'SKILLED_LABOUR',
  UNSKILLED_LABOUR = 'UNSKILLED_LABOUR',
  OVERTIME = 'OVERTIME',
  
  // Equipment
  HEAVY_MACHINERY = 'HEAVY_MACHINERY',
  TOOLS_EQUIPMENT = 'TOOLS_EQUIPMENT',
  VEHICLES = 'VEHICLES',
  
  // Overhead
  RENT_UTILITIES = 'RENT_UTILITIES',
  INSURANCE = 'INSURANCE',
  PERMITS = 'PERMITS',
  
  // Services
  CONSULTING = 'CONSULTING',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  MAINTENANCE_SERVICES = 'MAINTENANCE_SERVICES',
  
  // Other
  MISCELLANEOUS = 'MISCELLANEOUS'
}

export enum UnitOfMeasure {
  PIECES = 'PIECES',
  KILOGRAMS = 'KG',
  LITERS = 'L',
  METERS = 'M',
  SQUARE_METERS = 'SQM',
  CUBIC_METERS = 'CBM',
  HOURS = 'HRS',
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
  UNITS = 'UNITS'
}

export interface LineItem {
  id?: number;
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  unitOfMeasure?: UnitOfMeasure;
  currency: Currency;
  category: LineItemCategory;
  accountHead: string;
  itemDate: string;
  expectedDeliveryDate?: string;
  vendorName?: string;
  vendorContact?: string;
  vendorEmail?: string;
  itemOrder: number;
  plateNumber?: string;
  currentKM?: string;
  startLocation?: string;
  endLocation?: string;
  notes?: string;
  taxRate?: number;
  discountAmount?: number;
  isApproved?: boolean;
  requiresApproval?: boolean;
  specifications?: string;
  brandModel?: string;
  warrantyPeriod?: string;
}

export interface LineItemFormState {
  description: string;
  amount: string;
  quantity: string;
  unitPrice: string;
  unitOfMeasure: UnitOfMeasure;
  currency: Currency;
  category: LineItemCategory;
  accountHead: string;
  itemDate: string;
  expectedDeliveryDate: string;
  vendorName: string;
  vendorContact: string;
  vendorEmail: string;
  plateNumber: string;
  currentKM: string;
  startLocation: string;
  endLocation: string;
  notes: string;
  taxRate: string;
  discountAmount: string;
  specifications: string;
  brandModel: string;
  warrantyPeriod: string;
}

export interface LineItemValidation {
  field: keyof LineItemFormState;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  condition?: (item: LineItemFormState) => boolean;
}

export interface LineItemTemplate {
  id: number;
  name: string;
  description: string;
  category: LineItemCategory;
  accountHead: string;
  unitOfMeasure: UnitOfMeasure;
  estimatedUnitPrice: number;
  currency: Currency;
  specifications?: string;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  usage_count: number;
}

export interface LineItemBulkAction {
  action: 'delete' | 'update_category' | 'update_account_head' | 'apply_discount' | 'copy';
  itemIds: number[];
  data?: {
    category?: LineItemCategory;
    accountHead?: string;
    discountPercentage?: number;
    targetQuotationId?: number;
  };
}

export interface LineItemSummary {
  totalItems: number;
  totalAmount: number;
  averageAmount: number;
  categoryBreakdown: {
    category: LineItemCategory;
    count: number;
    amount: number;
    percentage: number;
  }[];
  accountHeadBreakdown: {
    accountHead: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  vendorBreakdown: {
    vendorName: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
}