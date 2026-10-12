import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Search,
  Filter,
  TrendingUp,
  Download,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { marksApi, batchApi } from '../../services/api';
import { Batch } from '../../types';

export const StudentRankings: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [board, batchData] = await Promise.all([
          marksApi.getLeaderboard(),
          batchApi.getAll(),
        ]);
        setLeaderboard(board);
        setBatches(batchData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBoard = leaderboard.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.studentName.toLowerCase().includes(q) ||
      item.studentId.toLowerCase().includes(q);
    const matchBatch = !selectedBatch || item.batchName === selectedBatch;
    return matchSearch && matchBatch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-orange" />
            Academy Student Rankings & Honor Roll
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized percentile percentiles, cohort leadership rankings, and academic distinctions
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:border-brand-navy transition"
        >
          <Download className="w-4 h-4 text-brand-orange" /> Export Honor Roll PDF
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between order-2 md:order-1 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-black text-slate-400">#2</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Medal className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {filteredBoard[1]?.studentName || 'Runner Up'}
            </h3>
            <p className="text-xs text-slate-500 font-mono">{filteredBoard[1]?.studentId || '-'}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Score</span>
            <span className="text-base font-black text-brand-navy">
              {filteredBoard[1]?.percentage ? `${filteredBoard[1].percentage}%` : '-'}
            </span>
          </div>
        </div>

        {/* 1st Place Champion */}
        <div className="bg-gradient-to-b from-[#0B1B55] to-[#050814] text-white p-6 rounded-2xl border-2 border-brand-orange shadow-xl flex flex-col justify-between order-1 md:order-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-black text-brand-orange">#1</span>
            <div className="p-2.5 rounded-xl bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
              <Trophy className="w-7 h-7" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange px-2 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20">
              Academic Champion
            </span>
            <h3 className="font-black text-white text-base mt-2">
              {filteredBoard[0]?.studentName || 'Leading Scholar'}
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{filteredBoard[0]?.studentId || '-'}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-300">Top Score</span>
            <span className="text-xl font-black text-brand-orange">
              {filteredBoard[0]?.percentage ? `${filteredBoard[0].percentage}%` : '-'}
            </span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between order-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-black text-amber-600">#3</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {filteredBoard[2]?.studentName || 'Second Runner Up'}
            </h3>
            <p className="text-xs text-slate-500 font-mono">{filteredBoard[2]?.studentId || '-'}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Score</span>
            <span className="text-base font-black text-brand-navy">
              {filteredBoard[2]?.percentage ? `${filteredBoard[2].percentage}%` : '-'}
            </span>
          </div>
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
            placeholder="Search candidate name or student ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Cohort Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5 text-center">Rank</th>
                <th className="py-3.5 px-5">Candidate</th>
                <th className="py-3.5 px-5">Batch Assignment</th>
                <th className="py-3.5 px-5 text-right">Marks Obtained</th>
                <th className="py-3.5 px-5 text-right">Percentile</th>
                <th className="py-3.5 px-5 text-center">Honors Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Calculating cohort percentiles...
                  </td>
                </tr>
              ) : filteredBoard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No rankings available yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rankings generate automatically as marks are recorded in the system.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBoard.map((item, idx) => (
                  <tr key={item.studentId + idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900">{item.studentName}</p>
                      <p className="text-[11px] font-mono text-brand-navy">{item.studentId}</p>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{item.batchName}</td>
                    <td className="py-3.5 px-5 text-right font-black text-brand-navy">
                      {item.marks} / {item.maxMarks}
                    </td>
                    <td className="py-3.5 px-5 text-right font-black text-brand-orange text-sm">
                      {item.percentage}%
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.percentage >= 80
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.percentage >= 60
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.percentage >= 80 ? 'Distinction' : item.percentage >= 60 ? 'First Class' : 'Pass'}
                      </span>
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
