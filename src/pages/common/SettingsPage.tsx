import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  User,
  Shield,
  Save,
  Moon,
  Sun,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [examSms, setExamSms] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = () => {
    addNotification('success', 'Preferences updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-orange" />
          System Preferences & Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure security credentials, notification dispatches, and runtime environments
        </p>
      </div>

      {/* Account Info Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-orange" />
          Active Account Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Display Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Administrator'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Verified Email Address</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'admin@cubitfuture.com'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          Notification Alerts
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-800">Email Grade Notifications</p>
              <p className="text-[11px] text-slate-500">Dispatch immediate emails whenever a test is graded.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded border-slate-300"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-800">SMS Alerts for Attendance</p>
              <p className="text-[11px] text-slate-500">Send notifications for attendance drops below 85%.</p>
            </div>
            <input
              type="checkbox"
              checked={examSms}
              onChange={(e) => setExamSms(e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded border-slate-300"
            />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
