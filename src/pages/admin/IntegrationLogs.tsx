import React, { useState } from 'react';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const IntegrationLogs: React.FC = () => {
  const { addNotification } = useNotifications();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const [logs, setLogs] = useState([
    {
      id: 'log-01',
      timestamp: 'Today, 10:15 AM',
      pipeline: 'Google Sheets Fleet Automated Ingestion',
      target: 'CF-STU-0001 (Arjun Kumar)',
      status: 'SUCCESS',
      recordsProcessed: 12,
      latency: '340ms',
      errorMessage: null,
    },
    {
      id: 'log-02',
      timestamp: 'Today, 09:30 AM',
      pipeline: 'Scheduled Cron Biometric Sync',
      target: 'Batch 14 Morning Achievers',
      status: 'SUCCESS',
      recordsProcessed: 45,
      latency: '820ms',
      errorMessage: null,
    },
    {
      id: 'log-03',
      timestamp: 'Yesterday, 06:45 PM',
      pipeline: 'Google Sheets Endpoint Webhook',
      target: 'CF-STU-0018 (Rahul Sharma)',
      status: 'FAILED',
      recordsProcessed: 0,
      latency: '2100ms',
      errorMessage: 'HTTP 403 Forbidden: Google Sheet permission was restricted to private domain only.',
    },
    {
      id: 'log-04',
      timestamp: 'Yesterday, 04:20 PM',
      pipeline: 'Manual Fleet Reconciliation',
      target: 'Global Candidate Ledger',
      status: 'SUCCESS',
      recordsProcessed: 180,
      latency: '1420ms',
      errorMessage: null,
    },
  ]);

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    setTimeout(() => {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? { ...l, status: 'SUCCESS', errorMessage: null, timestamp: 'Just now' }
            : l
        )
      );
      setRetryingId(null);
      addNotification('success', 'Pipeline retry succeeded! Row records ingested successfully.');
    }, 1200);
  };

  const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-orange" />
            Integrations & Pipeline Diagnostic Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time payload verification, Google Sheets sync telemetry, and failure reconciliation
          </p>
        </div>

        <button
          onClick={() => addNotification('info', 'Integration diagnostics health is 100% operational.')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:border-brand-navy transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Run Health Diagnostic
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Successful Ingestions</p>
            <p className="text-xl font-black text-slate-900">{successCount}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">100% Ingestion integrity</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Failed / Blocked Syncs</p>
            <p className="text-xl font-black text-slate-900">{failedCount}</p>
            <p className="text-[11px] text-slate-400">Retryable with 1-click</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Average Pipeline Latency</p>
            <p className="text-xl font-black text-slate-900">420 ms</p>
            <p className="text-[11px] text-blue-600 font-semibold">Ultra-fast throughput</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Integration Events</h3>
            <p className="text-xs text-slate-500">Audit trail of automated data flows</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Integration Pipeline</th>
                <th className="py-3.5 px-5">Target Entity</th>
                <th className="py-3.5 px-5">Latency</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-5 font-medium text-slate-500">{log.timestamp}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">{log.pipeline}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">{log.target}</td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">{log.latency}</td>
                  <td className="py-3.5 px-5">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> {log.recordsProcessed} Rows Ingested
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Ingestion Blocked
                      </span>
                    )}
                    {log.errorMessage && (
                      <p className="text-[11px] text-rose-600 font-mono mt-1 max-w-md">
                        {log.errorMessage}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {log.status === 'FAILED' ? (
                      <button
                        onClick={() => handleRetry(log.id)}
                        disabled={retryingId === log.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-orange text-white text-xs font-bold hover:bg-[#e55f00] transition disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`}
                        />
                        {retryingId === log.id ? 'Retrying...' : 'Retry Pipeline'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Verified</span>
                    )}
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
