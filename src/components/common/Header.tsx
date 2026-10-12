import React from 'react';
import { Menu, Search, Bell, FileSpreadsheet, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { studentApi } from '../../services/api';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, student, refreshStudentData } = useAuth();
  const { success, error } = useNotification();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleQuickSync = async () => {
    if (!student) return;
    setIsSyncing(true);
    try {
      const res = await studentApi.syncGoogleSheet(student.id);
      await refreshStudentData();
      success('Google Sheet Synchronized', res.message);
    } catch (err: any) {
      error('Sync Failed', err?.message || 'Unable to sync with Google Sheet');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-brand-light-border px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left section: mobile hamburger & search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-brand-navy hover:text-brand-orange hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, exams, batches or records..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
          />
        </div>
      </div>

      {/* Right section: Quick actions, Google Sheets indicator, notifications, user avatar */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Google Sheet Sync Indicator (if student or admin) */}
        {student && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-slate-700">Sheet:</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Synced
              </span>
              <button
                onClick={handleQuickSync}
                disabled={isSyncing}
                title="Sync now with Google Sheets"
                className="ml-1 p-1 hover:text-brand-orange hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-orange' : 'text-slate-500'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Notifications Icon */}
        <button
          className="relative p-2.5 text-slate-600 hover:text-brand-navy hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange ring-2 ring-white" />
        </button>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-brand-text-dark leading-tight">{user?.name || 'Cubit Member'}</p>
            <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
              {role || 'STUDENT'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-navy border-2 border-brand-orange/40 flex items-center justify-center font-bold text-white shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
