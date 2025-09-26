import { Currency } from '../../types/quotation';

export const formatCurrency = (
  amount: number,
  currency: Currency = Currency.SAR,
  locale: string = 'en-SA'
): string => {
  const currencyMap = {
    [Currency.SAR]: 'SAR',
    [Currency.USD]: 'USD',
    [Currency.EUR]: 'EUR'
  };

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[currency],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (
  date: string | Date,
  locale: string = 'en-SA',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

export const formatDateTime = (
  date: string | Date,
  locale: string = 'en-SA'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const formatNumber = (
  number: number,
  locale: string = 'en-SA',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(number);
};

// Convert Hijri date to Gregorian (placeholder - would need actual implementation)
export const formatHijriDate = (date: string | Date): string => {
  // This would need a proper Hijri calendar library
  // For now, return formatted Gregorian date
  return formatDate(date, 'ar-SA');
};
