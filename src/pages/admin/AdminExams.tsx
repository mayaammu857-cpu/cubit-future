import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Calendar,
  Award,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Users,
  Clock,
  Trash2,
} from 'lucide-react';
import { examApi } from '../../services/api';
import { ExamRecord } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useNotifications } from '../../context/NotificationContext';

export const AdminExams: React.FC = () => {
  const { addNotification } = useNotifications();
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    examName: '',
    subject: '',
    marksObtained: 85,
    maxMarks: 100,
    percentage: 85,
    examDate: new Date().toISOString().split('T')[0],
    resultStatus: 'PASSED' as const,
    timeTakenMinutes: 45,
    durationMinutes: 60,
    accuracy: 90,
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await examApi.getMyResults();
      setExams(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => set.add(e.subject));
    return Array.from(set);
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchSearch =
        e.examName.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase());
      const matchSubject = !subjectFilter || e.subject === subjectFilter;
      return matchSearch && matchSubject;
    });
  }, [exams, search, subjectFilter]);

  const paginatedExams = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, page, pageSize]);

  const totalPages = Math.ceil(filteredExams.length / pageSize) || 1;

  const handleDeleteExam = async (id: string, examName: string) => {
    if (!window.confirm(`Are you sure you want to delete exam assessment "${examName}"?`)) return;
    try {
      await examApi.delete(id);
      addNotification('success', 'Exam record deleted.');
      await fetchExams();
    } catch {
      addNotification('error', 'Failed to delete exam record.');
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pct = Math.round((formData.marksObtained / formData.maxMarks) * 100);
      await examApi.submitExamRecord({
        ...formData,
        percentage: pct,
        resultStatus: pct >= 80 ? 'EXCELLENT' : pct >= 50 ? 'PASSED' : 'FAILED',
      });
      addNotification('success', 'Exam assessment recorded!');
      setIsModalOpen(false);
      await fetchExams();
    } catch {
      addNotification('error', 'Failed to save exam record.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-orange" />
            Exams & Assessments Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized examination series, grade distribution, and scorecard logs
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Assessment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search exam by title or medical discipline..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange/40"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Disciplines</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Exam Title</th>
                <th className="py-3.5 px-5">Discipline</th>
                <th className="py-3.5 px-5">Date Conducted</th>
                <th className="py-3.5 px-5">Marks</th>
                <th className="py-3.5 px-5">Score (%)</th>
                <th className="py-3.5 px-5">Outcome</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading exams...
                  </td>
                </tr>
              ) : paginatedExams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-xs text-slate-600">No examination records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Schedule a test or enter candidate assessment scores.</p>
                  </td>
                </tr>
              ) : (
                paginatedExams.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{e.examName}</td>
                    <td className="py-3.5 px-5 font-medium text-brand-navy">{e.subject}</td>
                    <td className="py-3.5 px-5 text-slate-500">{e.examDate}</td>
                    <td className="py-3.5 px-5 font-semibold">
                      {e.marksObtained} / {e.maxMarks}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-brand-orange">{e.percentage}%</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="result" status={e.resultStatus} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteExam(e.id, e.examName)}
                        title="Delete assessment"
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={filteredExams.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Schedule Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Assessment Record"
        subtitle="Log examination series into the academy ledger"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Name *</label>
            <input
              type="text"
              required
              value={formData.examName}
              onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
              placeholder="e.g. Pathology Midterm Block 1"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical Discipline *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Pathology"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marks Obtained *</label>
              <input
                type="number"
                required
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Marks *</label>
              <input
                type="number"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20"
            >
              Record Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
