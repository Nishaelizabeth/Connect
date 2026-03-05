import React from 'react';
import { Settings, Shield, Database, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 text-sm">Manage application settings and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">General Settings</h3>
              <p className="text-xs text-gray-500">App-wide configurations</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Disable the app for all non-staff users</p>
              </div>
              <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">New User Registration</p>
                <p className="text-xs text-gray-500">Allow new users to sign up</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Google OAuth</p>
                <p className="text-xs text-gray-500">Allow sign-in with Google</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Security</h3>
              <p className="text-xs text-gray-500">Authentication & permissions</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">JWT Token Lifetime</p>
                <p className="text-xs text-gray-500">Access token expiry</p>
              </div>
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">30 min</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Refresh Token Lifetime</p>
                <p className="text-xs text-gray-500">Refresh token expiry</p>
              </div>
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">7 days</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Data Management</h3>
              <p className="text-xs text-gray-500">Database & cache settings</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Clear Recommendation Cache</span>
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-700">Clear Image Cache</span>
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm">
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-gray-700">Clear Weather Cache</span>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500">Configure notification settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Buddy Request Alerts</p>
                <p className="text-xs text-gray-500">Real-time buddy notifications</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Trip Invite Alerts</p>
                <p className="text-xs text-gray-500">Trip invitation notifications</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Order Status Alerts</p>
                <p className="text-xs text-gray-500">Store order updates</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
