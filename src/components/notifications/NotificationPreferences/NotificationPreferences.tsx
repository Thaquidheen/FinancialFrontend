import React, { useState, useEffect } from 'react';
import { Bell, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotificationPreferences } from '@/contexts/NotificationContext';
import { NotificationPreferences as NotificationPreferencesType } from '@/types/notification.types';

interface NotificationPreferencesProps {
  className?: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ className = '' }) => {
  const { preferences, updatePreferences, requestBrowserPermission } = useNotificationPreferences();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferencesType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handlePreferenceChange = (key: keyof NotificationPreferencesType, value: any) => {
    if (localPreferences) {
      setLocalPreferences(prev => ({
        ...prev!,
        [key]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    setSaving(true);
    try {
      await updatePreferences(localPreferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await requestBrowserPermission();
      setBrowserPermission(permission);
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  };

  if (!localPreferences) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Browser Notifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Browser Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Enable Browser Notifications</h3>
                <p className="text-sm text-gray-500">
                  Receive notifications in your browser when you're not actively using the app
                </p>
              </div>
              <div className="flex items-center gap-3">
                {browserPermission === 'granted' ? (
                  <span className="text-green-600 text-sm font-medium">✓ Enabled</span>
                ) : browserPermission === 'denied' ? (
                  <span className="text-red-600 text-sm font-medium">✗ Blocked</span>
                ) : (
                  <button
                    onClick={handleRequestPermission}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive push notifications for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.pushEnabled}
                  onChange={(e) => handlePreferenceChange('pushEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.emailEnabled}
                  onChange={(e) => handlePreferenceChange('emailEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Daily Digest</h3>
                <p className="text-sm text-gray-500">Receive a daily summary of notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.dailyDigest}
                  onChange={(e) => handlePreferenceChange('dailyDigest', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Notification Types</h2>
          
          <div className="space-y-4">
            {Object.entries(localPreferences.types || {}).map(([type, enabled]) => (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {type.replace(/_/g, ' ').toLowerCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications for {type.replace(/_/g, ' ').toLowerCase()} events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handlePreferenceChange('types', {
                      ...localPreferences.types,
                      [type]: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Priority Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Critical Notifications Only</h3>
                <p className="text-sm text-gray-500">Only receive critical priority notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.criticalOnly}
                  onChange={(e) => handlePreferenceChange('criticalOnly', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Quiet Hours</h3>
                <p className="text-sm text-gray-500">Pause notifications during quiet hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.quietHoursEnabled}
                  onChange={(e) => handlePreferenceChange('quietHoursEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Sound Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Sound Notifications</h3>
                <p className="text-sm text-gray-500">Play sound when receiving notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.soundEnabled}
                  onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
