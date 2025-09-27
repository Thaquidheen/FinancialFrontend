
import React from 'react';
import { Chip } from '@mui/material';

interface PaymentStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'small' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'READY_FOR_PAYMENT':
        return { label: 'Ready for Payment', color: 'success' as const };
      case 'PENDING':
        return { label: 'Pending', color: 'warning' as const };
      case 'PROCESSING':
        return { label: 'Processing', color: 'info' as const };
      case 'SENT_TO_BANK':
        return { label: 'Sent to Bank', color: 'primary' as const };
      case 'PAID':
        return { label: 'Paid', color: 'success' as const };
      case 'FAILED':
        return { label: 'Failed', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  const { label, color } = getStatusConfig(status);

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="filled"
    />
  );
};

export default PaymentStatusBadge;