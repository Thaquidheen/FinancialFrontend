// src/pages/payments/PaymentQueuePage.tsx

import React from 'react';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PaymentQueue from '../../components/payments/PaymentQueue/PaymentQueue';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PaymentQueuePage: React.FC = () => {
  const { user, hasPermission } = useAuth();

  // Check if user has payment management permissions
  const canAccessPayments = hasPermission('PAYMENT_PROCESSING') || 
                            user?.roles?.some(role => 
                              role === 'ACCOUNT_MANAGER' || 
                              role === 'SUPER_ADMIN'
                            );

  if (!canAccessPayments) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Payment Queue - ERP System</title>
        <meta name="description" content="Manage payments ready for processing" />
      </Helmet>
      
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc', // Light gray background
        p: 3
      }}>
        <PaymentQueue />
      </Box>
    </>
  );
};

export default PaymentQueuePage;

