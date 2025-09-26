// src/components/payments/shared/PaymentStatusBadge.tsx

import React from 'react';
import { Chip, ChipProps, Tooltip } from '@mui/material';
import {
  Schedule,
  FileDownload,
  AccountBalance,
  CheckCircle,
  Error,
  Cancel,
  HourglassEmpty
} from '@mui/icons-material';
import { PaymentStatus } from '../../../types/payment.types';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '../../../constants/payments/paymentConstants';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'];
  showIcon?: boolean;
  tooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  variant = 'filled',
  size = 'small',
  showIcon = true,
  tooltip = true,
  className,
  onClick
}) => {
  const getStatusIcon = (status: PaymentStatus) => {
    const iconProps = { fontSize: 'small' as const };
    
    switch (status) {
      case PaymentStatus.READY_FOR_PAYMENT:
        return <Schedule {...iconProps} />;
      case PaymentStatus.BANK_FILE_GENERATED:
        return <FileDownload {...iconProps} />;
      case PaymentStatus.SENT_TO_BANK:
      case PaymentStatus.BANK_PROCESSING:
        return <AccountBalance {...iconProps} />;
      case PaymentStatus.COMPLETED:
        return <CheckCircle {...iconProps} />;
      case PaymentStatus.FAILED:
        return <Error {...iconProps} />;
      case PaymentStatus.CANCELLED:
        return <Cancel {...iconProps} />;
      default:
        return <HourglassEmpty {...iconProps} />;
    }
  };

  const getStatusDescription = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.READY_FOR_PAYMENT:
        return 'Payment is approved and ready for bank file generation';
      case PaymentStatus.BANK_FILE_GENERATED:
        return 'Bank file has been generated and is ready for download';
      case PaymentStatus.SENT_TO_BANK:
        return 'Payment file has been uploaded to bank portal';
      case PaymentStatus.BANK_PROCESSING:
        return 'Bank is currently processing the payment';
      case PaymentStatus.COMPLETED:
        return 'Payment has been successfully completed by the bank';
      case PaymentStatus.FAILED:
        return 'Payment processing failed - requires attention';
      case PaymentStatus.CANCELLED:
        return 'Payment has been cancelled';
      default:
        return 'Payment status unknown';
    }
  };

  const label = PAYMENT_STATUS_LABELS[status];
  const color = PAYMENT_STATUS_COLORS[status];
  const icon = showIcon ? getStatusIcon(status) : undefined;
  
  const chipComponent = (
    <Chip
      label={label}
      icon={icon}
      color={color}
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? '14px' : '16px'
        },
        cursor: onClick ? 'pointer' : 'default'
      }}
    />
  );

  if (!tooltip) {
    return chipComponent;
  }

  return (
    <Tooltip 
      title={getStatusDescription(status)}
      placement="top"
      arrow
    >
      {chipComponent}
    </Tooltip>
  );
};

export default PaymentStatusBadge;