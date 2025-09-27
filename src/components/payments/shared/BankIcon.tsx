import React from 'react';
import { Avatar, Box } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

interface BankIconProps {
  bankCode: string;
  size?: 'small' | 'medium' | 'large';
}

const BankIcon: React.FC<BankIconProps> = ({ bankCode, size = 'medium' }) => {
  const getBankColor = (code: string) => {
    switch (code.toUpperCase()) {
      case 'RAJHI':
      case 'AL RAJHI BANK':
        return '#0066CC';
      case 'NCB':
      case 'NATIONAL COMMERCIAL BANK':
        return '#1B5E20';
      case 'SABB':
      case 'SAUDI BRITISH BANK':
        return '#D32F2F';
      case 'SNB':
      case 'SAUDI NATIONAL BANK':
        return '#2E7D32';
      case 'RIYAD':
      case 'RIYAD BANK':
        return '#1976D2';
      default:
        return '#757575';
    }
  };

  const sizeConfig = {
    small: { width: 24, height: 24 },
    medium: { width: 32, height: 32 },
    large: { width: 40, height: 40 }
  };

  return (
    <Avatar
      sx={{
        ...sizeConfig[size],
        bgcolor: getBankColor(bankCode),
        fontSize: size === 'small' ? '0.75rem' : '1rem'
      }}
    >
      <AccountBalance fontSize={size === 'small' ? 'small' : 'medium'} />
    </Avatar>
  );
};

export default BankIcon;