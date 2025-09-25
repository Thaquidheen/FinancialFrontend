import { format, formatDistance, parseISO } from 'date-fns';
import { DATE_FORMATS } from '@constants/app';

// Date formatting utilities
export const formatDate = (date: string | Date, formatString: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Invalid date format:', date);
    return 'Invalid date';
  }
};

export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.warn('Invalid date format:', date);
    return 'Invalid date';
  }
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Number formatting
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidSaudiMobile = (mobile: string): boolean => {
  const saudiMobileRegex = /^(\+966|966|0)?5[0-9]{8}$/;
  return saudiMobileRegex.test(mobile.replace(/\s/g, ''));
};

export const isValidSaudiNationalId = (nationalId: string): boolean => {
  const nationalIdRegex = /^[12][0-9]{9}$/;
  return nationalIdRegex.test(nationalId);
};

export const isValidIban = (iban: string): boolean => {
  // Saudi IBAN format: SA followed by 22 digits
  const saudiIbanRegex = /^SA[0-9]{22}$/;
  return saudiIbanRegex.test(iban.replace(/\s/g, ''));
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Object utilities
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// URL utilities
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// Storage utilities
export const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage get failed:', error);
    return null;
  }
};

export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('localStorage set failed:', error);
    return false;
  }
};

export const safeLocalStorageRemove = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('localStorage remove failed:', error);
    return false;
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Color utilities
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Random utilities
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T;
  
  const clonedObj = {} as T;
  Object.keys(obj as any).forEach(key => {
    (clonedObj as any)[key] = deepClone((obj as any)[key]);
  });
  
  return clonedObj;
};

// Error handling utility
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message);
  }
  return 'An unknown error occurred';
};