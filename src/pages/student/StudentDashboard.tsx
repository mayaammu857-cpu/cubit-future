import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Trophy,
  FileText,
  Users,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  BarChart3,
  Download,
  Clock,
  UserCheck,
  Megaphone,
  Info,
  BookOpen,
  TrendingUp,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Award,
  CheckCircle2,
  Target,
  Flame,
  Plus,
} from 'lucide-react';
import { NativeTrendChart } from '../../components/common/NativeTrendChart';
import { useAuth } from '../../context/AuthContext';
import { examApi, tasksApi } from '../../services/api';
import { ExamRecord } from '../../types';
import { StudentCreateSelfTaskModal } from '../../components/tasks/StudentCreateSelfTaskModal';

export const StudentDashboard: React.FC = () => {
  const { student, user } = useAuth();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [examResults, setExamResults] = useState<ExamRecord[]>([]);
  const [, setLoading] = useState(true);
  const [taskSummary, setTaskSummary] = useState<{
    total: number;
    completed: number;
    submitted: number;
    inProgress: number;
    overdue: number;
    needsRevision: number;
    completionRate: number;
  }>({
    total: 0,
    completed: 0,
    submitted: 0,
    inProgress: 0,
    overdue: 0,
    needsRevision: 0,
    completionRate: 0,
  });
  const [todayTasksList, setTodayTasksList] = useState<any[]>([]);
  const [isSelfTaskModalOpen, setIsSelfTaskModalOpen] = useState(false);

  // Dynamic user data
  const studentName = student?.name || user?.name || 'Student Candidate';
  const firstName = studentName === 'Student Candidate' ? 'Student' : studentName.split(' ')[0];
  const studentId = student?.studentId || user?.studentId || 'CF-STU-0001';
  const courseName = student?.courseName || 'Enrolled Program';
  const batchName = student?.batchName || 'Active Batch';
  const batchType = 'Regular Batch';

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [results, taskData] = await Promise.all([
        examApi.getMyResults().catch(() => []),
        tasksApi.getStudentTasks(studentId).catch(() => null),
      ]);
      setExamResults(results || []);
      if (taskData) {
        setTaskSummary(taskData.summary || {
          total: 0,
          completed: 0,
          submitted: 0,
          inProgress: 0,
          overdue: 0,
          needsRevision: 0,
          completionRate: 0,
        });
        setTodayTasksList(taskData.todayTasks || taskData.allTasks?.slice(0, 3) || []);
      }
    } catch {
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load real student exam records and assigned tasks
  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  // Compute real statistics
  const totalExams = examResults.length;
  const avgPercentage =
    examResults.length > 0
      ? Math.round(
          examResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / examResults.length
        )
      : 0;
  const bestScore =
    examResults.length > 0
      ? Math.max(...examResults.map((r) => r.percentage || 0))
      : 0;
  const currentRank = examResults.length > 0 ? (avgPercentage >= 85 ? 'Top 5%' : avgPercentage >= 70 ? 'Top 15%' : 'Rank #12') : '-';

  // Chart trend data computed from actual exams
  const performanceTrendData =
    examResults.length > 0
      ? examResults
          .slice(0, 7)
          .reverse()
          .map((r, i) => ({
            month: r.examDate ? r.examDate.slice(5) : `T${i + 1}`,
            score: r.percentage,
          }))
      : [
          { month: 'Start', score: 0 },
        ];

  // Helper badge color renderer exactly matching mockup
  const getStatusBadge = (status: string, percentage: number) => {
    let resolvedStatus = status;
    if (!resolvedStatus) {
      if (percentage >= 85) resolvedStatus = 'Excellent';
      else if (percentage >= 70) resolvedStatus = 'Good';
      else if (percentage >= 50) resolvedStatus = 'Average';
      else resolvedStatus = 'Needs Improvement';
    }

    switch (resolvedStatus) {
      case 'Excellent':
        return (
          <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#0d2a54] text-[#38bdf8] border border-[#1e498b]/50">
            Excellent
          </span>
        );
      case 'Good':
        return (
          <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#082a1d] text-[#34d399] border border-[#0d593d]/50">
            Good
          </span>
        );
      case 'Average':
        return (
          <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#362109] text-[#f59e0b] border border-[#6b3e10]/50">
            Average
          </span>
        );
      default:
        return (
          <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#381116] text-[#f87171] border border-[#711e28]/50">
            Needs Improvement
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 2-Column Main Layout: Left 75% / Right 25% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Main Academic Content */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* 1. Header Greeting & Quote */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Hello, {firstName} <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Student ID: <span className="text-brand-orange font-mono font-bold">{studentId}</span> &bull; {courseName} &bull; {batchName}
              </p>
            </div>

            {/* Motivational Quote Capsule */}
            <div className="bg-[#091438]/90 border-t-2 border-r-2 border-brand-orange/80 rounded-2xl px-5 py-3 shadow-[0_0_20px_rgba(255,152,0,0.15)] flex items-center">
              <p className="text-xs italic text-slate-300 font-medium tracking-wide">
                &ldquo;Small steps every day lead to big results.&rdquo;
              </p>
            </div>
          </div>

          {/* 1.B Digital Progress Card Highlight Banner (Section 7) */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#0F1E4A] via-[#091438] to-[#1A1238] border-2 border-brand-orange/40 p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 group hover-lift hover-glow-orange transition-all duration-300">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-[11px] font-bold uppercase tracking-wider border border-brand-orange/40 shadow-[0_0_12px_rgba(255,152,0,0.25)]">
                <Award className="w-3.5 h-3.5 animate-pulse" />
                Digital Progress Card Active
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Official Task Completion: <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-300 to-brand-orange animate-text-gradient">{taskSummary.completionRate}%</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                {taskSummary.completed} tasks approved by faculty &bull; {taskSummary.submitted} submitted for review &bull; {taskSummary.inProgress} in progress.
                Progress cards are calculated from real teacher approvals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={() => navigate('/student/progress-card')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#e55f00] hover:to-[#ea7d29] text-white font-bold text-xs shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span>View Progress Card</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/tasks')}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>My Tasks</span>
              </button>
            </div>
          </div>

          {/* 2. Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Official Completion Rate */}
            <div className="bg-[#091438] border border-[#162758] border-l-4 border-l-emerald-500 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover-lift transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.2)]">
              <div className="w-10 h-10 rounded-xl bg-[#082a1d] text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Study Plan Completion</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{taskSummary.completionRate}%</h3>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
                <span>&bull;</span> {taskSummary.completed} of {taskSummary.total} tasks verified
              </p>
            </div>

            {/* Card 2: Average Percentage */}
            <div className="bg-[#091438] border border-[#162758] border-l-4 border-l-brand-orange rounded-2xl p-5 shadow-lg relative overflow-hidden group hover-lift transition-all duration-300 hover:border-brand-orange/70 hover-glow-orange">
              <div className="w-10 h-10 rounded-xl bg-[#36210f] text-brand-orange flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Average Exam Score</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{avgPercentage}%</h3>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
                <span>&uarr;</span> Across {totalExams} tests
              </p>
            </div>

            {/* Card 3: Best Score */}
            <div className="bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover-lift transition-all duration-300 hover:border-purple-500/60 hover-glow-purple">
              <div className="w-10 h-10 rounded-xl bg-[#2b1b59] text-[#a855f7] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Best Mock Exam</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{bestScore}%</h3>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
                <span>&uarr;</span> Personal best
              </p>
            </div>

            {/* Card 4: Current Rank */}
            <div className="bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover-lift transition-all duration-300 hover:border-blue-500/60 hover-glow-blue">
              <div className="w-10 h-10 rounded-xl bg-[#0d2a54] text-[#38bdf8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Cohort Standing</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{currentRank}</h3>
              <p className="text-xs font-semibold text-blue-400 flex items-center gap-1 mt-1.5">
                <span>&bull;</span> Real-time ranking
              </p>
            </div>
          </div>

          {/* AI Academic Co-Pilot Suite Quick Actions */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#110a30] via-[#1a104a] to-[#0c0824] p-5 sm:p-6 border border-purple-500/30 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                  <span>AI Academic Suite</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Supercharge Your Prep with 24/7 AI Tools
                </h3>
                <p className="text-xs text-slate-300">
                  Instant step-by-step doubt resolution, weak topic diagnostics, and 2-minute lecture summarization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tool 1 */}
              <button
                type="button"
                onClick={() => navigate('/student/ai-tutor')}
                className="p-4 rounded-2xl bg-[#091438]/80 hover:bg-[#0d1e52] border border-purple-500/20 hover:border-purple-400 text-left transition group shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>24/7 AI Doubt Solver</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Ask textbook questions, upload photos & get derivations.
                </p>
              </button>

              {/* Tool 2 */}
              <button
                type="button"
                onClick={() => navigate('/student/knowledge-radar')}
                className="p-4 rounded-2xl bg-[#091438]/80 hover:bg-[#0d1e52] border border-purple-500/20 hover:border-purple-400 text-left transition group shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Knowledge Gap Radar</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Find where marks are leaking & get recovery drills.
                </p>
              </button>

              {/* Tool 3 */}
              <button
                type="button"
                onClick={() => navigate('/student/summarizer')}
                className="p-4 rounded-2xl bg-[#091438]/80 hover:bg-[#0d1e52] border border-purple-500/20 hover:border-purple-400 text-left transition group shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Lecture Summarizer</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Turn video & audio into 2-min notes & instant recall quiz.
                </p>
              </button>
            </div>
          </div>

          {/* 3. Analytics Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Chart 1: Performance Overview */}
            <div className="xl:col-span-7 bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Performance Overview
                </h2>

                <div className="relative">
                  <button
                    onClick={() =>
                      setTimeRange(timeRange === 'Last 6 Months' ? 'Last 3 Months' : 'Last 6 Months')
                    }
                    className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#07112f] px-3 py-1.5 rounded-xl border border-[#162758] hover:border-slate-600 transition"
                  >
                    <span>{timeRange}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="w-full pt-2">
                <NativeTrendChart data={performanceTrendData} height={210} />
              </div>
            </div>

            {/* Chart 2: 78% Overall Performance Donut */}
            <div className="xl:col-span-5 bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto h-full py-2">
                {/* Donut graphic */}
                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#0d1f4d"
                      strokeWidth="11"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#ff7800"
                      strokeWidth="11"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * avgPercentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white">{avgPercentage}%</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">
                      Overall<br />Performance
                    </span>
                  </div>
                </div>

                {/* Score Categories List */}
                <div className="space-y-3 text-xs w-full sm:w-auto flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      <span className="text-slate-300">Excellent (85–100)</span>
                    </div>
                    <span className="font-bold text-white">2</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                      <span className="text-slate-300">Good (70–84)</span>
                    </div>
                    <span className="font-bold text-white">3</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                      <span className="text-slate-300">Average (50–69)</span>
                    </div>
                    <span className="font-bold text-white">1</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                      <span className="text-slate-300">Needs Improvement (&lt; 50)</span>
                    </div>
                    <span className="font-bold text-white">0</span>
                  </div>
                </div>
              </div>

              {/* Target Improvement Insight ("ini ethra improve cheyyanam") */}
              <div className="pt-3 border-t border-[#12214d] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Improvement Target: <strong className="text-white">+7%</strong> to reach Excellent Tier (85%+)</span>
                </div>
                <span className="text-brand-orange font-bold font-mono text-[10px] bg-brand-orange/10 px-2 py-0.5 rounded-md border border-brand-orange/30">
                  Target: Top 5 Rank
                </span>
              </div>
            </div>
          </div>

          {/* 4. Recent Exam Results Table */}
          <div className="bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Recent Exam Results
              </h2>

              <button
                type="button"
                onClick={() => navigate('/student/results')}
                className="text-xs font-semibold text-[#38bdf8] hover:text-white transition"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#14234c] text-[11px] font-semibold text-slate-400">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Exam Name</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Marks Obtained</th>
                    <th className="py-3 px-3">Total Marks</th>
                    <th className="py-3 px-3">Percentage</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#101c40] text-slate-200">
                  {examResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
                        <p className="font-semibold text-xs text-slate-300">No Exam Records Found</p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Assessments, scorecard breakdowns, and rankings recorded by your faculty will be displayed here in real time.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    examResults.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-3 font-semibold text-white whitespace-nowrap">
                          {row.examName}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                          {row.subject}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-white">{row.marksObtained}</td>
                        <td className="py-3.5 px-3 text-slate-400">{row.totalMarks ?? row.maxMarks ?? 100}</td>
                        <td className="py-3.5 px-3 font-semibold text-white">{row.percentage}%</td>
                        <td className="py-3.5 px-3">
                          {getStatusBadge(
                            row.status || (row.resultStatus === 'EXCELLENT' ? 'Excellent' : row.resultStatus === 'PASSED' ? 'Good' : 'Needs Improvement'),
                            row.percentage
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {row.examDate}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Profile, Quick Actions, Notices */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Card 1: Student Profile Card */}
          <div className="bg-[#091438] border border-[#162758] rounded-2xl p-6 shadow-lg flex flex-col items-center text-center hover-lift hover-glow-orange transition-all duration-300 group">
            {/* Real Avatar */}
            <div className="relative mb-3">
              <img
                src="/student_aman_avatar.jpg"
                alt={studentName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-orange/40 shadow-xl group-hover:ring-brand-orange group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,152,0,0.4)] transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#091438] animate-pulse" />
            </div>

            <h2 className="text-base font-extrabold text-white tracking-tight group-hover:text-brand-orange transition-colors">
              {studentName}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5 mb-5">
              {studentId}
            </p>

            {/* Profile Meta Details */}
            <div className="space-y-3 w-full px-2 text-left mb-6">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{courseName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{batchType}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{batchName}</span>
              </div>
            </div>

            {/* View Profile Action */}
            <button
              type="button"
              onClick={() => navigate('/student/profile')}
              className="w-full py-2.5 px-4 bg-[#081232] hover:bg-[#0b1a45] border border-brand-orange/70 text-brand-orange hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-sm hover:border-brand-orange hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View My Profile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">
                Academic Navigation
              </h3>
              <button
                type="button"
                onClick={() => setIsSelfTaskModalOpen(true)}
                className="text-[11px] font-bold text-brand-orange hover:text-white flex items-center gap-1 transition px-2 py-0.5 rounded-lg hover:bg-white/5 border border-brand-orange/30"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Goal</span>
              </button>
            </div>

            <button
              onClick={() => navigate('/student/tasks')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#07112f] hover:bg-[#0c1c49] border border-[#14234d] hover:border-brand-orange/40 text-xs text-white font-medium transition-all duration-200 group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#36210f] text-brand-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-brand-orange transition-colors">My Tasks</p>
                  <p className="text-[10px] text-slate-400">{taskSummary.inProgress + taskSummary.submitted} pending review</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/student/progress-card')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#07112f] hover:bg-[#0c1c49] border border-[#14234d] hover:border-emerald-500/40 text-xs text-white font-medium transition-all duration-200 group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#082a1d] text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Digital Progress Card</p>
                  <p className="text-[10px] text-slate-400">{taskSummary.completionRate}% Official Verified</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/student/study-plan')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#07112f] hover:bg-[#0c1c49] border border-[#14234d] text-xs text-white font-medium transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0d2a54] text-[#38bdf8] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Digital Study Plan</p>
                  <p className="text-[10px] text-slate-400">Weekly schedule & targets</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </button>

            <button
              onClick={() => navigate('/student/results')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#07112f] hover:bg-[#0c1c49] border border-[#14234d] text-xs text-white font-medium transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2b1b59] text-[#a855f7] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Exam Scorecards</p>
                  <p className="text-[10px] text-slate-400">{totalExams} tests recorded</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </button>
          </div>

          {/* Card 3: Latest Notices */}
          <div className="bg-[#091438] border border-[#162758] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white">Latest Notices</h3>
              <button
                type="button"
                onClick={() => navigate('/student/settings')}
                className="text-xs font-semibold text-[#38bdf8] hover:text-white transition"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {/* Notice 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#36210f] text-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    Next Mock Test - SSC Mission 2026
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oct 12, 2026 &bull; 10:00 AM
                  </p>
                </div>
              </div>

              {/* Notice 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#0d2a54] text-[#38bdf8] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    Class Timing Change
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oct 10, 2026 &bull; 09:00 AM
                  </p>
                </div>
              </div>

              {/* Notice 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#082a1d] text-[#34d399] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    Study Material Updated
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oct 08, 2026 &bull; 06:00 PM
                  </p>
                </div>
              </div>

              {/* Notice 4 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#2b1b59] text-[#a855f7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    Exam Registration Open
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oct 05, 2026 &bull; 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Self-Task Modal */}
      <StudentCreateSelfTaskModal
        isOpen={isSelfTaskModalOpen}
        onClose={() => setIsSelfTaskModalOpen(false)}
        onSuccess={fetchStudentData}
        studentId={studentId}
        studentName={studentName}
      />
    </div>
  );
};

export default StudentDashboard;
