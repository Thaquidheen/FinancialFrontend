// src/pages/payments/PaymentDashboardPage.tsx

import React from 'react';
import { Box, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PaymentDashboard from '../../components/payments/PaymentDashboard/PaymentDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PaymentDashboardPage: React.FC = () => {
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
        <title>Payment Processing Dashboard - ERP System</title>
        <meta name="description" content="Manage and process payments for approved quotations" />
      </Helmet>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <PaymentDashboard />
      </Container>
    </>
  );
};

export default PaymentDashboardPage;