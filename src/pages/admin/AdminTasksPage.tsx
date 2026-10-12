import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  BookOpen,
  Plus,
} from 'lucide-react';
import { tasksApi, batchesApi } from '../../services/api';
import { TaskAssignment, Batch } from '../../types';
import { AssignTaskModal } from '../../components/tasks/AssignTaskModal';

export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes] = await Promise.all([
        tasksApi.listTasks({
          batchId: batchFilter || undefined,
          status: statusFilter || undefined,
        }),
        batchesApi.getAll(),
      ]);
      setTasks(tRes.tasks || []);
      setBatches(bRes || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchFilter, statusFilter]);

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.studentName.toLowerCase().includes(q) ||
      t.studentId.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  });

  const total = tasks.length;
  const approved = tasks.filter((t) => t.status === 'APPROVED').length;
  const submitted = tasks.filter((t) => t.status === 'SUBMITTED').length;
  const overdue = tasks.filter((t) => t.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Academy Task Tracking &amp; Deliverables</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            System-wide audit of study plan task assignments, verified completion rates, and submission backlogs
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white text-xs font-bold shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#070E28] border border-[#162758]">
          <p className="text-[11px] text-slate-400">Total System Tasks</p>
          <p className="text-2xl font-black text-white mt-1">{total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#070E28] border border-emerald-500/30">
          <p className="text-[11px] text-emerald-400">Approved Complete</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{approved}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#070E28] border border-blue-500/30">
          <p className="text-[11px] text-blue-300">Under Review Queue</p>
          <p className="text-2xl font-black text-blue-300 mt-1">{submitted}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#070E28] border border-rose-500/30">
          <p className="text-[11px] text-rose-400">Overdue Deliverables</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{overdue}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#070E28] border border-[#162758] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
          >
            <option value="" className="bg-[#070E28]">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#070E28]">
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
          >
            <option value="" className="bg-[#070E28]">All Statuses</option>
            <option value="APPROVED" className="bg-[#070E28]">Approved</option>
            <option value="SUBMITTED" className="bg-[#070E28]">Submitted</option>
            <option value="IN_PROGRESS" className="bg-[#070E28]">In Progress</option>
            <option value="REVISION_REQUIRED" className="bg-[#070E28]">Revision Required</option>
            <option value="OVERDUE" className="bg-[#070E28]">Overdue</option>
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or deliverable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto rounded-3xl border border-[#162758] bg-[#070E28] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#091438] text-slate-300 uppercase text-[10px] font-bold border-b border-white/10">
            <tr>
              <th className="p-4">Student ID &amp; Name</th>
              <th className="p-4">Task Deliverable</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Recorded Effort</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No task assignments found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t.assignmentId} className="hover:bg-white/[0.02] transition">
                  <td className="p-4">
                    <p className="font-bold text-white">{t.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{t.studentId}</p>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-white truncate">{t.title}</p>
                    {t.topic && <p className="text-[10px] text-slate-400 truncate">{t.topic}</p>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-brand-orange font-bold text-[10px]">
                      {t.subject}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white">{t.actualStudyMins} mins</p>
                    <p className="text-[10px] text-slate-400">{t.completedQuestions} questions</p>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-300">{t.dueDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'SUBMITTED'
                          ? 'bg-blue-500/20 text-blue-300'
                          : t.status === 'REVISION_REQUIRED'
                          ? 'bg-purple-500/20 text-purple-300'
                          : t.status === 'OVERDUE'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchData}
        creatorRole="ADMIN"
      />
    </div>
  );
};

export default AdminTasksPage;
