import React from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { NotificationPreferences } from '@/components/notifications';

const NotificationSettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure how you receive notifications
          </p>
        </div>

        <NotificationPreferences />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
