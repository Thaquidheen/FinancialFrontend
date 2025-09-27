// src/pages/notifications/NotificationsPage.tsx

import React from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { NotificationCenter } from '@/components/notifications';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationCenter />
    </div>
  );
};

export default NotificationsPage;