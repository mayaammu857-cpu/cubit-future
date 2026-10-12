import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Trash2,
  Check,
} from 'lucide-react';
import { notificationApi } from '../../services/api';
import { NotificationItem } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleClearAll = async () => {
    await notificationApi.clearAll();
    setNotifications([]);
    addNotification('info', 'All notifications cleared.');
  };

  const filtered = notifications.filter(
    (n) => categoryFilter === 'ALL' || n.category === categoryFilter
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-orange" />
            System Notifications & Event Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry for Google Sheets sync failures, candidate enrolments, and exam updates
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:border-brand-navy transition"
          >
            <Trash2 className="w-4 h-4 text-rose-500" /> Clear All Notifications
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'GOOGLE_SHEETS', 'REGISTRATION', 'EXAMS', 'SECURITY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              categoryFilter === cat
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            Loading system alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">All Clear!</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are no pending alerts or errors requiring Super Admin intervention.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-white border-slate-100 opacity-75'
                  : 'bg-white border-brand-orange/30 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl mt-0.5 ${
                    item.type === 'ERROR'
                      ? 'bg-rose-50 text-rose-600'
                      : item.type === 'WARNING'
                      ? 'bg-amber-50 text-amber-600'
                      : item.type === 'SUCCESS'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {item.type === 'ERROR' ? (
                    <XCircle className="w-5 h-5" />
                  ) : item.type === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : item.type === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">• {item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>

              {!item.read && (
                <button
                  onClick={() => handleMarkAsRead(item.id)}
                  className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
