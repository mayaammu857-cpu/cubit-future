import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  User,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  ChevronRight,
  Target,
  BarChart3,
  Layers,
} from 'lucide-react';
import { NativeTrendChart } from '../../components/common/NativeTrendChart';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { progressCardApi } from '../../services/api';
import { DigitalProgressCardData } from '../../types';

export const DigitalProgressCardPage: React.FC = () => {
  const { student, user } = useAuth();
  const { addNotification } = useNotifications();

  const studentId = student?.studentId || 'CF-STU-0001';

  const [cardData, setCardData] = useState<DigitalProgressCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const data = await progressCardApi.getStudentProgressCard(studentId);
        setCardData(data);
      } catch {
        addNotification('error', 'Could not compile digital progress card.');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-bold">
          Generating Verified Digital Progress Card...
        </p>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-sm font-bold text-white">No progress record available for this student.</p>
      </div>
    );
  }

  const { student: sInfo, taskMetrics, academicMetrics, pendingAndOverdueTasks, revisionRequirements, areasForImprovement, teacherComments } = cardData;

  // Chart data from test records
  const trendChartData = academicMetrics.testRecords.map((t) => ({
    name: t.examName.slice(0, 14),
    percentage: t.percentage,
    marks: t.marksObtained,
  }));

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Digital Progress Card</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official academic scorecard &amp; verified study plan completion audit
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#E55F00] hover:to-[#EA7D29] text-white text-xs font-bold shadow-lg shadow-brand-orange/25 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Progress Card</span>
        </button>
      </div>

      {/* Main Printable Progress Card Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#060B1E] border-2 border-[#162758] shadow-2xl space-y-8 relative overflow-hidden print:border-none print:bg-white print:text-black print:p-0">
        {/* Subtle Decorative Ambient Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none print:hidden" />

        {/* ============================================================== */}
        {/* CARD SECTION 1: OFFICIAL ACADEMY HEADER & STUDENT IDENTIFIER   */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/cubit_future_logo.png"
              alt="Cubit Future"
              className="h-14 sm:h-16 w-auto object-contain"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight print:text-black">
                Cubit Future Academy
              </h2>
              <p className="text-xs text-brand-orange font-bold uppercase tracking-wider">
                Digital Progress Card &bull; Academic Year 2026
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10 print:bg-slate-100 print:text-black">
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 font-semibold uppercase">Student Name</p>
              <p className="font-bold text-white print:text-black mt-0.5 truncate">{sInfo.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 font-semibold uppercase">Student ID</p>
              <p className="font-mono font-bold text-brand-orange mt-0.5">{sInfo.studentId}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 font-semibold uppercase">Enrolled Course</p>
              <p className="font-bold text-white print:text-black mt-0.5 truncate">{sInfo.courseName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 font-semibold uppercase">Assigned Batch</p>
              <p className="font-bold text-white print:text-black mt-0.5 truncate">{sInfo.batchName}</p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD SECTION 2: CORE PERFORMANCE METRICS & COMPLETION RATE     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Official Approved Task Completion Rate */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#09153D] to-[#070F2B] border-2 border-brand-orange/50 relative overflow-hidden print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange">
                Verified Metric
              </span>
              <CheckCircle2 className="w-4 h-4 text-brand-orange" />
            </div>
            <p className="text-xs text-slate-300 mt-2 print:text-slate-700">Official Task Completion</p>
            <p className="text-3xl font-black text-white mt-1 print:text-black">
              {taskMetrics.officialCompletionRate}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {taskMetrics.approvedTasks} of {taskMetrics.totalTasks} tasks approved by mentor
            </p>
          </div>

          {/* 2. Overall Exam Average Score */}
          <div className="p-5 rounded-2xl bg-[#091438] border border-[#192B60] print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Academic Marks
              </span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-300 mt-2 print:text-slate-700">Average Exam Score</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              {academicMetrics.overallAveragePercentage}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Highest Score: {academicMetrics.highestScore}% across {academicMetrics.totalExamsAttempted} tests
            </p>
          </div>

          {/* 3. Study Hours Target vs Actual */}
          <div className="p-5 rounded-2xl bg-[#091438] border border-[#192B60] print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                Study Hours
              </span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-slate-300 mt-2 print:text-slate-700">Actual vs Planned Hours</p>
            <p className="text-3xl font-black text-white mt-1 print:text-black">
              {taskMetrics.actualStudyHours}h{' '}
              <span className="text-xs text-slate-400 font-normal">/ {taskMetrics.plannedStudyHours}h</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Recorded study effort logged in tasks
            </p>
          </div>

          {/* 4. Question Practice Target vs Completed */}
          <div className="p-5 rounded-2xl bg-[#091438] border border-[#192B60] print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Problem Practice
              </span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-300 mt-2 print:text-slate-700">Practice Questions Solved</p>
            <p className="text-3xl font-black text-white mt-1 print:text-black">
              {taskMetrics.completedQuestions}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {taskMetrics.targetQuestions}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Attendance Rate: {sInfo.attendanceRate}%
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD SECTION 3: SUBJECT-WISE PERFORMANCE & TEST SCORECARDS     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject-Wise Marks & Practice Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Layers className="w-4 h-4 text-brand-orange" />
              Subject-Wise Academic Performance
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-300 uppercase text-[10px] font-bold border-b border-white/10 print:bg-slate-100 print:text-black">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Avg Score</th>
                    <th className="p-3">Tests Count</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 print:text-black">
                  {academicMetrics.subjectWisePerformance.map((subj) => (
                    <tr key={subj.subject} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white print:text-black">{subj.subject}</td>
                      <td className="p-3 font-bold text-brand-orange">{subj.percentage}%</td>
                      <td className="p-3">{subj.examsCount}</td>
                      <td className="p-3">
                        {subj.percentage >= 80 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            Strong
                          </span>
                        ) : subj.percentage >= 65 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                            Moderate
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                            Needs Focus
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Performance Trend Chart */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <TrendingUp className="w-4 h-4 text-brand-orange" />
              Examination Progress Trajectory
            </h3>

            <div className="p-4 rounded-2xl bg-[#040815] border border-white/10 print:border-slate-300">
              <NativeTrendChart
                data={trendChartData.map((t) => ({ month: t.name, score: t.percentage }))}
                height={210}
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD SECTION 4: TASK EXECUTION & REVISION AUDIT                */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending & Overdue Tasks */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending &amp; Upcoming Study Deliverables
            </h3>

            {pendingAndOverdueTasks.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                All assigned study tasks are currently submitted and up to date!
              </div>
            ) : (
              <div className="space-y-2">
                {pendingAndOverdueTasks.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs print:bg-slate-50 print:text-black"
                  >
                    <div>
                      <p className="font-bold text-white print:text-black">{item.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.subject} &bull; Due: {item.dueDate}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        item.status === 'OVERDUE'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Requirements */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              Teacher Revision Feedback &amp; Action Items
            </h3>

            {revisionRequirements.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                No active revisions required. Conceptual work verified on first submission!
              </div>
            ) : (
              <div className="space-y-2">
                {revisionRequirements.map((rev) => (
                  <div
                    key={rev.assignmentId}
                    className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs print:bg-purple-50 print:text-black"
                  >
                    <p className="font-bold text-purple-200 print:text-purple-950">{rev.title}</p>
                    <p className="text-[11px] text-purple-300 print:text-purple-800 mt-1 leading-relaxed">
                      {rev.instructions}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD SECTION 5: FACULTY COMMENTS & IMPROVEMENT ROADMAP         */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              Faculty Observations &amp; Commendations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 print:text-black">
              {teacherComments.map((com, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{com}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Target className="w-4 h-4 text-amber-400" />
              Targeted Action Areas for Next Cycle
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 print:text-black">
              {areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verification Footer & Timestamp */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 print:text-black">
          <p>
            Official Record ID: <span className="font-mono text-slate-400">{sInfo.studentId}-PROG-2026</span>
          </p>
          <p>
            Generated on {new Date(cardData.generatedAt).toLocaleString()} IST &bull; Cubit Future Digital Progress Card System
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalProgressCardPage;
