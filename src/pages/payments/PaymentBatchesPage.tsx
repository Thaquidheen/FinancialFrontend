// src/pages/payments/PaymentBatchesPage.tsx

import React from 'react';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PaymentBatches from '../../components/payments/PaymentBatches/PaymentBatches';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PaymentBatchesPage: React.FC = () => {
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
        <title>Payment Batches - ERP System</title>
        <meta name="description" content="View and manage generated payment batches and bank files" />
      </Helmet>
      
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc', // Light gray background
        p: 3
      }}>
        <PaymentBatches />
      </Box>
    </>
  );
};

export default PaymentBatchesPage;
