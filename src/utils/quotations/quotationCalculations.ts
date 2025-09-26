import { LineItem } from '../../types/quotation';

export const calculateTotal = (items: LineItem[]): number => {
  return items.reduce((total, item) => total + (item.amount || 0), 0);
};

export const calculateTax = (amount: number, taxRate: number = 0.15): number => {
  return amount * taxRate;
};

export const calculateGrandTotal = (subtotal: number, taxRate: number = 0.15): number => {
  return subtotal + calculateTax(subtotal, taxRate);
};

export const calculateBudgetUtilization = (
  quotationAmount: number,
  projectBudget: number
): number => {
  if (projectBudget === 0) return 0;
  return (quotationAmount / projectBudget) * 100;
};

export const checkBudgetExceeded = (
  quotationAmount: number,
  projectBudget: number,
  usedBudget: number = 0
): boolean => {
  const remainingBudget = projectBudget - usedBudget;
  return quotationAmount > remainingBudget;
};
