import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Filter,
} from 'lucide-react';
import { auditLogApi } from '../../services/api';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await auditLogApi.getAll();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      l.action.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      l.affectedRecord.toLowerCase().includes(q);
    const matchResult = !resultFilter || l.result === resultFilter;
    return matchSearch && matchResult;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <History className="w-6 h-6 text-brand-orange" />
            Security Audit Trail & Governance Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Append-only immutable record of administrative actions, credential assignments, and data transactions
          </p>
        </div>

        <button
          onClick={() => {
            const csv =
              'data:text/csv;charset=utf-8,' +
              ['ID,Timestamp,User,Action,Record,Result', ...logs.map((l) => `${l.id},"${l.timestamp}","${l.user}","${l.action}","${l.affectedRecord}",${l.result}`)].join('\n');
            const link = document.createElement('a');
            link.href = encodeURI(csv);
            link.download = `Cubit_Future_Audit_Logs_${Date.now()}.csv`;
            link.click();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:border-brand-navy transition"
        >
          <Download className="w-4 h-4 text-brand-orange" /> Export Compliance Audit Trail
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor email, or affected record..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Execution Results</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Authorizing User</th>
                <th className="py-3.5 px-5">Action Event</th>
                <th className="py-3.5 px-5">Affected System Target</th>
                <th className="py-3.5 px-5 text-center">Status Result</th>
                <th className="py-3.5 px-5 text-right">TLS Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">{log.user}</td>
                    <td className="py-3.5 px-5 font-bold text-brand-navy">{log.action}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">{log.affectedRecord}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.result === 'WARNING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.result === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-400">
                      {log.ipAddress || 'Authorized Session'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
