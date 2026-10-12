import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Sparkles,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { examApi } from '../../services/api';
import { ExamRecord } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';

export const StudentResults: React.FC = () => {
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await examApi.getMyResults();
        setRecords(data);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.subject));
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.examName.toLowerCase().includes(search.toLowerCase()) ||
        r.subject.toLowerCase().includes(search.toLowerCase());
      const matchSubject = !subjectFilter || r.subject === subjectFilter;
      return matchSearch && matchSubject;
    });
  }, [records, search, subjectFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Print action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-brand-orange" />
            Exam Results & Scorecard Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete assessment history, sectional accuracy, and percentile rank rankings
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-navy text-slate-700 hover:text-brand-navy font-bold text-xs transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-orange" /> Print / Export Scorecard
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search exam name or subject..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          >
            <option value="">All Subjects & Categories</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-navy text-white text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-6">Exam Title</th>
                <th className="py-3.5 px-6">Subject Domain</th>
                <th className="py-3.5 px-6 text-right">Marks Scored</th>
                <th className="py-3.5 px-6 text-right">Max Marks</th>
                <th className="py-3.5 px-6 text-right">Percentage</th>
                <th className="py-3.5 px-6 text-center">Batch Rank</th>
                <th className="py-3.5 px-6">Exam Date</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-navy">{rec.examName}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{rec.subject}</td>
                    <td className="py-4 px-6 text-right font-black text-brand-navy">
                      {rec.marksObtained}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-500">
                      {rec.maxMarks}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-brand-orange">
                      {rec.percentage}%
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-700">
                      #{rec.rank || 1} <span className="text-[10px] text-slate-400 font-normal">/ {rec.totalStudents || 45}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-500">{rec.examDate}</td>
                    <td className="py-4 px-6 text-center">
                      <Badge status={rec.resultStatus} type="examStatus" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedExam(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-navy/5 hover:bg-brand-navy hover:text-white text-brand-navy text-xs font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No results match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination component */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>

      {/* Details Modal */}
      {selectedExam && (
        <Modal
          isOpen={Boolean(selectedExam)}
          onClose={() => setSelectedExam(null)}
          title={selectedExam.examName}
          subtitle={`Subject: ${selectedExam.subject} • Completed on ${selectedExam.examDate}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block">Marks Obtained:</span>
                <span className="text-xl font-black text-brand-navy">
                  {selectedExam.marksObtained} / {selectedExam.maxMarks}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Percentage:</span>
                <span className="text-xl font-black text-brand-orange">
                  {selectedExam.percentage}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Batch Rank:</span>
                <span className="text-sm font-bold text-slate-800">
                  #{selectedExam.rank || 1} of {selectedExam.totalStudents || 45}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Time Spent:</span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedExam.timeTakenMinutes || 18}m / {selectedExam.durationMinutes || 20}m
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-700">
              <span className="font-bold text-emerald-800 block mb-1">Status Classification:</span>
              Passed with high distinction. Accuracy rate was recorded at {selectedExam.accuracy || 94}%.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 rounded-xl bg-brand-navy text-white font-bold text-xs hover:bg-brand-navy-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
