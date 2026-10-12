import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { Student } from '../../types';
import { Badge } from '../../components/common/Badge';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const GoogleSheetsSync: React.FC = () => {
  const { role } = useAuth();
  const { addNotification } = useNotifications();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getStudents({ limit: 100 });
      setStudents(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await studentApi.syncAllGoogleSheets();
      setLastSyncTime(new Date().toLocaleTimeString());
      addNotification('success', res.message || 'All connected sheets synced with academy database!');
      await fetchData();
    } catch {
      addNotification('error', 'Sync encountered a temporary failure.');
    } finally {
      setIsSyncing(false);
    }
  };

  const connectedCount = students.filter((s) => s.googleSheetStatus === 'CONNECTED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Google Sheets Automated Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric & score synchronization with Google Workspace spreadsheets
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronizing Spreadsheets...' : 'Run Sync Cycle Now'}
        </button>
      </div>

      {/* Connectivity Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Connected Spreadsheets</p>
            <p className="text-xl font-bold text-slate-900">
              {loading ? '...' : `${connectedCount} / ${students.length}`}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">Auto-polling every 15 mins</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Last Synced Timestamp</p>
            <p className="text-xl font-bold text-slate-900">{lastSyncTime}</p>
            <p className="text-[11px] text-slate-400">Status: Healthy & Active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-brand-orange">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Sync Pipeline Protocol</p>
            <p className="text-xl font-bold text-slate-900">Google Sheets v4 API</p>
            <p className="text-[11px] text-slate-400">OAuth2 Enterprise Token</p>
          </div>
        </div>
      </div>

      {/* Integration Guide Box */}
      <div className="p-5 bg-gradient-to-r from-brand-navy to-[#122353] rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-orange text-white">
            Automation Protocol
          </span>
          <h3 className="text-base font-bold mt-2">Automatic Student Google Sheet Provisioning & Sync</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            When a new student is enrolled, a dedicated Google Sheet is automatically generated with unique identifier linking. Exam marks and performance metrics sync bi-directionally with the Cubit Future Academy master ledger.
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-emerald-400 border border-white/10">
            <ShieldCheck className="w-4 h-4" /> Zero Data Loss Guarantee
          </span>
        </div>
      </div>

      {/* Predefined Sheet Structure Template Showcase */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-brand-navy flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Standard Predefined Google Sheet Structure
            </h3>
            <p className="text-[11px] text-slate-500">
              Generated automatically upon student account registration with locked column headers:
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1 self-start sm:self-auto">
            Format: Auto-Generated Sheet Template
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-4">Exam Name</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4 text-right">Marks Obtained</th>
                <th className="py-2.5 px-4 text-right">Total Marks</th>
                <th className="py-2.5 px-4 text-right">Percentage</th>
                <th className="py-2.5 px-4">Exam Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600 text-xs bg-slate-50/40">
              <tr>
                <td className="py-2.5 px-4 font-bold text-brand-navy">Mock Test 01</td>
                <td className="py-2.5 px-4">English</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">80</td>
                <td className="py-2.5 px-4 text-right font-mono">100</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-600">80%</td>
                <td className="py-2.5 px-4 font-mono text-slate-500">10/10/2026</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-brand-navy">Weekly Revision 04</td>
                <td className="py-2.5 px-4">Quantitative Aptitude</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">92</td>
                <td className="py-2.5 px-4 text-right font-mono">100</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-600">92%</td>
                <td className="py-2.5 px-4 font-mono text-slate-500">12/10/2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Sheet Connections Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Student Spreadsheet Endpoints</h3>
          <p className="text-xs text-slate-500">Live endpoint verification status per candidate</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Student ID</th>
                <th className="py-3.5 px-5">Course</th>
                <th className="py-3.5 px-5">Google Spreadsheet Endpoint</th>
                <th className="py-3.5 px-5">Sync Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {students.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{stu.name}</td>
                  <td className="py-3.5 px-5 font-mono text-brand-navy font-semibold">{stu.studentId}</td>
                  <td className="py-3.5 px-5">{stu.courseName}</td>
                  <td className="py-3.5 px-5">
                    {stu.googleSheetUrl ? (
                      <a
                        href={stu.googleSheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-mono text-[11px] flex items-center gap-1 truncate max-w-xs hover:underline"
                      >
                        {stu.googleSheetUrl}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No URL configured</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge type="sheet" status={stu.googleSheetStatus} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={handleSyncAll}
                      className="px-2.5 py-1 text-xs font-semibold text-brand-navy hover:text-brand-orange bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                    >
                      Sync
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
