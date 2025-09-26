import { 
    LineItem, 
    LineItemCategory 
  } from '../../types/quotation';
  
  export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
  }
  
  export const validateQuotationBasicInfo = (
    projectId: number | null,
    description: string
  ): ValidationResult => {
    const errors: Record<string, string> = {};
  
    if (!projectId) {
      errors.projectId = 'Project selection is required';
    }
  
    if (!description || description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  export const validateLineItem = (item: LineItem, index: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    const prefix = `item_${index}`;
  
    if (!item.description || item.description.trim().length === 0) {
      errors[`${prefix}_description`] = 'Description is required';
    } else if (item.description.trim().length < 5) {
      errors[`${prefix}_description`] = 'Description must be at least 5 characters';
    }
  
    if (!item.amount || item.amount <= 0) {
      errors[`${prefix}_amount`] = 'Amount must be greater than 0';
    } else if (item.amount > 1000000) {
      errors[`${prefix}_amount`] = 'Amount cannot exceed 1,000,000';
    }
  
    if (!item.accountHead || item.accountHead.trim().length === 0) {
      errors[`${prefix}_accountHead`] = 'Account head is required';
    }
  
    if (!item.itemDate) {
      errors[`${prefix}_itemDate`] = 'Item date is required';
    } else {
      const itemDate = new Date(item.itemDate);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
      if (itemDate < oneYearAgo || itemDate > oneYearFromNow) {
        errors[`${prefix}_itemDate`] = 'Item date must be within one year of today';
      }
    }
  
    // Validate vendor information if category requires it
    if ([
      LineItemCategory.CONSUMPTION_DIRECT_MATERIAL,
      LineItemCategory.EQUIPMENT_RENTALS
    ].includes(item.category)) {
      if (!item.vendorName || item.vendorName.trim().length === 0) {
        errors[`${prefix}_vendorName`] = 'Vendor name is required for this category';
      }
    }
  
    // Validate plate number and KM for transportation
    if (item.category === LineItemCategory.TRANSPORTATION) {
      if (!item.plateNumber || item.plateNumber.trim().length === 0) {
        errors[`${prefix}_plateNumber`] = 'Plate number is required for transportation';
      }
      if (!item.currentKM || item.currentKM.trim().length === 0) {
        errors[`${prefix}_currentKM`] = 'Current KM is required for transportation';
      }
    }
  
    return errors;
  };
  
  export const validateLineItems = (items: LineItem[]): ValidationResult => {
    const errors: Record<string, string> = {};
  
    if (!items || items.length === 0) {
      errors.items = 'At least one line item is required';
      return { isValid: false, errors };
    }
  
    if (items.length > 50) {
      errors.items = 'Maximum 50 line items allowed';
      return { isValid: false, errors };
    }
  
    // Validate each item
    items.forEach((item, index) => {
      const itemErrors = validateLineItem(item, index);
      Object.assign(errors, itemErrors);
    });
  
    // Check for duplicate descriptions
    const descriptions = items.map(item => item.description.trim().toLowerCase());
    const duplicateDescriptions = descriptions.filter((desc, index) => 
      descriptions.indexOf(desc) !== index
    );
  
    if (duplicateDescriptions.length > 0) {
      errors.duplicateDescriptions = 'Line items cannot have duplicate descriptions';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  export const validateDocuments = (documents: File[]): ValidationResult => {
    const errors: Record<string, string> = {};
  
    if (documents.length > 10) {
      errors.documents = 'Maximum 10 documents allowed';
    }
  
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  
    const maxFileSize = 5 * 1024 * 1024; // 5MB
  
    documents.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors[`document_${index}_type`] = `File type ${file.type} is not allowed`;
      }
  
      if (file.size > maxFileSize) {
        errors[`document_${index}_size`] = `File size cannot exceed 5MB`;
      }
  
      if (file.name.length > 100) {
        errors[`document_${index}_name`] = `File name too long`;
      }
    });
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  export const validateCompleteQuotation = (formData: any): ValidationResult => {
    const errors: Record<string, string> = {};
  
    // Validate basic info
    const basicInfoValidation = validateQuotationBasicInfo(
      formData.projectId, 
      formData.description
    );
    Object.assign(errors, basicInfoValidation.errors);
  
    // Validate line items
    const lineItemsValidation = validateLineItems(formData.items);
    Object.assign(errors, lineItemsValidation.errors);
  
    // Validate documents
    const documentsValidation = validateDocuments(formData.documents || []);
    Object.assign(errors, documentsValidation.errors);
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };