import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  User,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  Target,
  Layers,
  Sparkles,
} from 'lucide-react';
import { studentApi, progressCardApi } from '../../services/api';
import { DigitalProgressCardData, Student } from '../../types';

export const TeacherProgressCardsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('CF-STU-0001');
  const [cardData, setCardData] = useState<DigitalProgressCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentApi.getStudents({ limit: 50 });
        setStudents(res.items || []);
        if (res.items && res.items.length > 0) {
          setSelectedStudentId(res.items[0].studentId);
        }
      } catch {}
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchCard = async () => {
      setLoading(true);
      try {
        const res = await progressCardApi.getStudentProgressCard(selectedStudentId);
        setCardData(res);
      } catch {
        setCardData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [selectedStudentId]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Student Digital Progress Cards</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review comprehensive progress metrics, verify task completion rates, and print progress cards
          </p>
        </div>

        {cardData && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] text-white text-xs font-bold shadow-lg shadow-brand-orange/20 transition self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Student Card</span>
          </button>
        )}
      </div>

      {/* Main Grid: Student Selector Sidebar + Progress Card View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Student Selector (1 col) */}
        <div className="p-4 rounded-3xl bg-[#070E28] border border-[#162758] space-y-3 h-fit">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredStudents.map((s) => {
              const isSelected = s.studentId === selectedStudentId;
              return (
                <div
                  key={s.studentId}
                  onClick={() => setSelectedStudentId(s.studentId)}
                  className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-orange to-[#FF7700] text-white font-bold shadow-md shadow-brand-orange/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs">{s.name}</p>
                    <p className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {s.studentId}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Digital Progress Card (3 cols) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Compiling Digital Progress Card...</p>
            </div>
          ) : !cardData ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-bold text-white">No progress data found for selected student.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#060B1E] border-2 border-[#162758] space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">{cardData.student.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {cardData.student.studentId} &bull; {cardData.student.batchName} &bull; {cardData.student.courseName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Verified Completion Rate</p>
                  <p className="text-2xl font-black text-brand-orange">
                    {cardData.taskMetrics.officialCompletionRate}%
                  </p>
                </div>
              </div>

              {/* 4 Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#091438] border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400">Approved Complete</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {cardData.taskMetrics.approvedTasks} / {cardData.taskMetrics.totalTasks}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#091438] border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400">Exam Avg Percentage</p>
                  <p className="text-xl font-black text-brand-orange mt-1">
                    {cardData.academicMetrics.overallAveragePercentage}%
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#091438] border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400">Study Hours Logged</p>
                  <p className="text-xl font-black text-blue-300 mt-1">
                    {cardData.taskMetrics.actualStudyHours}h / {cardData.taskMetrics.plannedStudyHours}h
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#091438] border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400">Practice Qs Done</p>
                  <p className="text-xl font-black text-amber-300 mt-1">
                    {cardData.taskMetrics.completedQuestions} / {cardData.taskMetrics.targetQuestions}
                  </p>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-orange" /> Subject Academic Standing
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-slate-300 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Score %</th>
                        <th className="p-3">Exams Done</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {cardData.academicMetrics.subjectWisePerformance.map((s) => (
                        <tr key={s.subject}>
                          <td className="p-3 font-semibold text-white">{s.subject}</td>
                          <td className="p-3 font-bold text-brand-orange">{s.percentage}%</td>
                          <td className="p-3">{s.examsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Faculty Observations & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <p className="text-xs font-bold text-white">Faculty Commendations</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {cardData.teacherComments.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <p className="text-xs font-bold text-white">Recommended Actions</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {cardData.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-brand-orange flex-shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProgressCardsPage;
