// src/components/payments/shared/BankIcon.tsx

import React from 'react';
import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { saudiBankService } from '../../../services/saudiBankService';

interface BankIconProps {
  bankCode: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  tooltip?: boolean;
  variant?: 'circular' | 'rounded' | 'square';
  className?: string;
}

const BankIcon: React.FC<BankIconProps> = ({
  bankCode,
  size = 'medium',
  showName = false,
  tooltip = true,
  variant = 'circular',
  className
}) => {
  const bank = saudiBankService.getBankByCode(bankCode);
  
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, fontSize: '12px' };
      case 'large':
        return { width: 48, height: 48, fontSize: '20px' };
      default:
        return { width: 32, height: 32, fontSize: '16px' };
    }
  };

  const sizeProps = getSizeProps();

  const getBankInitials = (bankName: string): string => {
    // Special handling for known banks
    const initialsMap: Record<string, string> = {
      'Al Rajhi Bank': 'AR',
      'National Commercial Bank': 'NCB',
      'Saudi British Bank': 'SABB',
      'Riyad Bank': 'RB',
      'Arab National Bank': 'ANB'
    };

    if (initialsMap[bankName]) {
      return initialsMap[bankName];
    }

    // Generate initials from bank name
    return bankName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const avatarContent = bank ? (
    <Avatar
      sx={{
        ...sizeProps,
        bgcolor: bank.primaryColor,
        color: 'white',
        fontWeight: 'bold',
        fontSize: sizeProps.fontSize
      }}
      variant={variant}
      className={className}
    >
      {bank.logoUrl ? (
        <img 
          src={bank.logoUrl} 
          alt={bank.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            padding: '2px'
          }}
        />
      ) : (
        getBankInitials(bank.name)
      )}
    </Avatar>
  ) : (
    <Avatar
      sx={{
        ...sizeProps,
        bgcolor: 'grey.400',
        color: 'white'
      }}
      variant={variant}
      className={className}
    >
      <AccountBalance sx={{ fontSize: sizeProps.fontSize }} />
    </Avatar>
  );

  const content = showName && bank ? (
    <Box display="flex" alignItems="center" gap={1}>
      {avatarContent}
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {bank.shortName || bank.name}
        </Typography>
        {size === 'large' && (
          <Typography variant="caption" color="text.secondary">
            {bank.arabicName}
          </Typography>
        )}
      </Box>
    </Box>
  ) : (
    avatarContent
  );

  if (!tooltip || !bank) {
    return content;
  }

  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {bank.name}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {bank.arabicName}
          </Typography>
          <Typography variant="caption" color="inherit">
            IBAN Prefix: SA{bank.ibanPrefix}xx
          </Typography>
          {bank.supportsBulkPayments && (
            <Typography variant="caption" display="block" color="inherit">
              Supports bulk payments (max: {bank.maxBulkPayments})
            </Typography>
          )}
          {bank.processingTime && (
            <Typography variant="caption" display="block" color="inherit">
              Processing time: {bank.processingTime}
            </Typography>
          )}
        </Box>
      }
      placement="top"
      arrow
    >
      {content}
    </Tooltip>
  );
};

export default BankIcon;