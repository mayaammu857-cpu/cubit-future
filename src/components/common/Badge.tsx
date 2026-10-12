import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { StudentStatus, GoogleSheetStatus, ExamResultStatus } from '../../types';

interface BadgeProps {
  status: StudentStatus | GoogleSheetStatus | ExamResultStatus | string;
  type?: 'studentStatus' | 'sheetStatus' | 'examStatus' | 'default' | 'student' | 'sheet' | 'result';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, type = 'default', className = '' }) => {
  const norm = String(status).toUpperCase();

  // Student Status
  if (type === 'studentStatus' || type === 'student' || norm === 'ACTIVE' || norm === 'INACTIVE' || norm === 'SUSPENDED') {
    switch (norm) {
      case 'ACTIVE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'INACTIVE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspended
          </span>
        );
    }
  }

  // Google Sheet Status
  if (type === 'sheetStatus' || type === 'sheet' || norm === 'CONNECTED' || norm === 'DISCONNECTED' || norm === 'SYNCING') {
    switch (norm) {
      case 'CONNECTED':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Connected
          </span>
        );
      case 'SYNCING':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Syncing
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            Disconnected
          </span>
        );
      case 'ERROR':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Sync Error
          </span>
        );
    }
  }

  // Exam Status
  if (type === 'examStatus' || type === 'result' || norm === 'EXCELLENT' || norm === 'PASSED' || norm === 'FAILED') {
    switch (norm) {
      case 'EXCELLENT':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-brand-orange border border-brand-orange/40 ${className}`}>
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            Excellent
          </span>
        );
      case 'PASSED':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Passed
          </span>
        );
      case 'FAILED':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Needs Attention
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {status}
    </span>
  );
};
