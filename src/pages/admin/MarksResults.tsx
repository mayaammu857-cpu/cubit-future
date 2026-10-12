import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Filter,
  Save,
  Globe,
  Lock,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { marksApi, studentApi, batchApi, examApi } from '../../services/api';
import { MarksRecord, Student, Batch, ExamRecord } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';

export const MarksResults: React.FC = () => {
  const { addNotification } = useNotifications();

  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedExam, setSelectedExam] = useState('');

  // Bulk Entry Modal
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryExamName, setEntryExamName] = useState('All-India Mock 01');
  const [entrySubject, setEntrySubject] = useState('Quantitative Aptitude');
  const [entryMaxMarks, setEntryMaxMarks] = useState(100);
  const [inputScores, setInputScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marksData, stuData, batchData, examData] = await Promise.all([
        marksApi.getAll(),
        studentApi.getStudents({ limit: 100 }),
        batchApi.getAll(),
        examApi.getMyResults(),
      ]);
      setMarks(marksData);
      setStudents(stuData.items);
      setBatches(batchData);
      setExams(examData);
    } catch {
      addNotification('error', 'Failed to load scorecard ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMarks = useMemo(() => {
    return marks.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        m.studentName.toLowerCase().includes(q) ||
        m.studentId.toLowerCase().includes(q) ||
        m.examName.toLowerCase().includes(q);
      const matchBatch = !selectedBatch || m.batchId === selectedBatch;
      const matchExam = !selectedExam || m.examName.toLowerCase().includes(selectedExam.toLowerCase());
      return matchSearch && matchBatch && matchExam;
    });
  }, [marks, search, selectedBatch, selectedExam]);

  const handleOpenBulkEntry = () => {
    // Pre-populate input scores for current students
    const initial: Record<string, number> = {};
    students.forEach((s) => {
      const existing = marks.find((m) => m.studentId === s.studentId);
      initial[s.studentId] = existing ? existing.marksObtained : 75;
    });
    setInputScores(initial);
    setIsEntryModalOpen(true);
  };

  const handleSaveBulkMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const recordsToSave: Partial<MarksRecord>[] = students.map((s) => ({
        examName: entryExamName,
        subject: entrySubject,
        studentId: s.studentId,
        studentName: s.name,
        batchId: s.batchId,
        batchName: s.batchName,
        marksObtained: inputScores[s.studentId] || 0,
        maxMarks: entryMaxMarks,
        published: true,
      }));

      await marksApi.saveBatchMarks(recordsToSave);
      addNotification('success', `Assessment marks saved for ${students.length} students!`);
      setIsEntryModalOpen(false);
      await fetchData();
    } catch {
      addNotification('error', 'Failed to save marks ledger.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (examId: string, currentPublished: boolean) => {
    try {
      await marksApi.togglePublish(examId, !currentPublished);
      addNotification('info', `Results publication toggled to ${!currentPublished ? 'Live' : 'Draft'}.`);
      await fetchData();
    } catch {
      addNotification('error', 'Failed to update publication status.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-brand-orange" />
            Marks & Academic Scorecards Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grade entry, batch percentage calculation, result publication control, and audit trail
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenBulkEntry}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Enter / Import Batch Marks
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, student ID, or exam..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Records Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Candidate</th>
                <th className="py-3.5 px-5">Examination Series</th>
                <th className="py-3.5 px-5">Batch Allocation</th>
                <th className="py-3.5 px-5 text-right">Marks Scored</th>
                <th className="py-3.5 px-5 text-right">Percentage</th>
                <th className="py-3.5 px-5 text-center">Result Status</th>
                <th className="py-3.5 px-5 text-center">Publication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading score records ledger...
                  </td>
                </tr>
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No marks recorded yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click "Enter / Import Batch Marks" above or sync scores via Google Sheets.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMarks.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900">{m.studentName}</p>
                      <p className="text-[11px] font-mono text-brand-navy font-semibold">{m.studentId}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-800">{m.examName}</p>
                      <p className="text-[11px] text-slate-500">{m.subject}</p>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{m.batchName}</td>
                    <td className="py-3.5 px-5 text-right font-black text-brand-navy">
                      {m.marksObtained} / {m.maxMarks}
                    </td>
                    <td className="py-3.5 px-5 text-right font-black text-brand-orange">
                      {m.percentage}%
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          m.resultStatus === 'EXCELLENT'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : m.resultStatus === 'PASSED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {m.resultStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleTogglePublish(m.examId, m.published)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          m.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle student portal visibility"
                      >
                        {m.published ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-emerald-600" /> Published
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Draft Only
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Marks Entry Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Enter / Import Batch Assessment Marks"
        subtitle="Log student marks with automated percentage calculations"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveBulkMarks} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Assessment Series *</label>
              <input
                type="text"
                required
                value={entryExamName}
                onChange={(e) => setEntryExamName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Module *</label>
              <input
                type="text"
                required
                value={entrySubject}
                onChange={(e) => setEntrySubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Score *</label>
              <input
                type="number"
                min={10}
                max={500}
                required
                value={entryMaxMarks}
                onChange={(e) => setEntryMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">Student Candidates Score Ledger ({students.length})</h4>
            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {students.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active students enrolled to record marks for.
                </div>
              ) : (
                students.map((stu) => {
                  const val = inputScores[stu.studentId] ?? 0;
                  const pct = Math.round((val / entryMaxMarks) * 100);

                  return (
                    <div key={stu.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{stu.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {stu.studentId} • {stu.batchName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={entryMaxMarks}
                            value={val}
                            onChange={(e) =>
                              setInputScores({
                                ...inputScores,
                                [stu.studentId]: Number(e.target.value),
                              })
                            }
                            className="w-20 px-2 py-1 text-xs font-bold text-right bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange/40"
                          />
                          <span className="text-xs text-slate-400">/ {entryMaxMarks}</span>
                        </div>
                        <span
                          className={`w-14 text-right text-xs font-extrabold ${
                            pct >= 50 ? 'text-brand-orange' : 'text-rose-600'
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || students.length === 0}
              className="px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Processing...' : 'Save & Publish Marks'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
