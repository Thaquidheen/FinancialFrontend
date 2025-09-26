import { useState, useCallback } from 'react';
import { LineItem, LineItemCategory, Currency } from '../../types/quotation';

export interface UseLineItemsReturn {
  items: LineItem[];
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<LineItem>) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  clearItems: () => void;
  getTotalAmount: () => number;
  validateItems: () => Record<string, string>;
}

export const useLineItems = (
  initialItems: LineItem[] = [],
  currency: Currency = Currency.SAR
): UseLineItemsReturn => {
  const [items, setItems] = useState<LineItem[]>(initialItems);

  const createNewItem = useCallback((): LineItem => ({
    description: '',
    amount: 0,
    currency,
    category: LineItemCategory.CONSUMPTION_DIRECT_MATERIAL,
    accountHead: '',
    itemDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    vendorContact: '',
    itemOrder: items.length,
    plateNumber: '',
    currentKM: ''
  }), [currency, items.length]);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, createNewItem()]);
  }, [createNewItem]);

  const removeItem = useCallback((index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      // Reorder items
      return newItems.map((item, i) => ({ ...item, itemOrder: i }));
    });
  }, []);

  const updateItem = useCallback((index: number, updates: Partial<LineItem>) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  }, []);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      
      // Update item orders
      return newItems.map((item, i) => ({ ...item, itemOrder: i }));
    });
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalAmount = useCallback(() => {
    return items.reduce((total, item) => total + (item.amount || 0), 0);
  }, [items]);

  const validateItems = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (items.length === 0) {
      errors.items = 'At least one line item is required';
      return errors;
    }

    items.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors[`item_${index}_description`] = 'Description is required';
      }
      if (!item.amount || item.amount <= 0) {
        errors[`item_${index}_amount`] = 'Amount must be greater than 0';
      }
      if (!item.accountHead?.trim()) {
        errors[`item_${index}_accountHead`] = 'Account head is required';
      }
      if (!item.itemDate) {
        errors[`item_${index}_itemDate`] = 'Date is required';
      }
    });

    return errors;
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    clearItems,
    getTotalAmount,
    validateItems
  };
};