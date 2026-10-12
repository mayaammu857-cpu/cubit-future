import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  BookOpen,
  Award,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { teachersApi, tasksApi } from '../../services/api';
import { Batch, Student } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const teacherId = 'tch-001';

  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bRes, sRes, tRes] = await Promise.all([
          teachersApi.getTeacherBatches(teacherId),
          teachersApi.getTeacherStudents(teacherId),
          tasksApi.listTasks(),
        ]);
        setBatches(bRes.batches || []);
        setStudents(sRes.students || []);
        setTasks(tRes.tasks || []);
      } catch {
        addNotification('error', 'Could not fetch faculty dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  // Derived statistics
  const submittedForReview = tasks.filter((t) => t.status === 'SUBMITTED');
  const overdueTasks = tasks.filter((t) => t.status === 'OVERDUE');
  const approvedTasks = tasks.filter((t) => t.status === 'APPROVED');
  const totalAssigned = tasks.length;
  const overallCompletionRate = totalAssigned > 0 ? Math.round((approvedTasks.length / totalAssigned) * 100) : 0;

  // Students needing support (low completion or overdue)
  const studentsNeedingSupport = students.filter(
    (s) => (s.pendingTasks || 0) > 2 || (s.averageScore || 0) < 75
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & Fast Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
              Faculty Command Console
            </span>
            <span className="text-xs text-slate-400">Assigned Batches: {batches.length}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Welcome back, {user?.name || 'Prof. Sarah Mathews'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor study plans, review student progress submissions, and verify academic task deliverables
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/teacher/tasks')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-[#FF7700] text-white text-xs font-bold shadow-lg shadow-brand-orange/25 transition"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Create &amp; Assign Tasks</span>
          </button>
          <button
            onClick={() => navigate('/teacher/study-plans')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Study Plans</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pending Submissions to Review */}
        <div
          onClick={() => navigate('/teacher/tasks')}
          className="p-5 rounded-2xl bg-[#070E28] border-2 border-blue-500/40 hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover-lift hover-glow-blue group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Awaiting Verification
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-white">{submittedForReview.length}</p>
            <p className="text-xs text-slate-400 mt-1">Student submissions ready for review</p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-blue-400 font-bold">
            <span>Review Submissions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Total Enrolled Students */}
        <div
          onClick={() => navigate('/teacher/students')}
          className="p-5 rounded-2xl bg-[#070E28] border border-[#162758] hover:border-brand-orange/60 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover-lift hover-glow-orange group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Mentored Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-white">{students.length}</p>
            <p className="text-xs text-slate-400 mt-1">Across {batches.length} active cohorts</p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-brand-orange font-bold">
            <span>View Student Directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 3. Verified Task Completion Rate */}
        <div className="p-5 rounded-2xl bg-[#070E28] border border-[#162758] hover:border-emerald-500/50 flex flex-col justify-between shadow-lg hover-lift transition-all duration-300 group hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Cohort Completion
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-emerald-400">{overallCompletionRate}%</p>
            <p className="text-xs text-slate-400 mt-1">
              {approvedTasks.length} / {totalAssigned} tasks officially verified
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Official Completion Metric</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* 4. Overdue Task Deliverables */}
        <div className="p-5 rounded-2xl bg-[#070E28] border border-rose-500/30 hover:border-rose-500/60 flex flex-col justify-between shadow-lg hover-lift transition-all duration-300 group hover:shadow-[0_10px_25px_-5px_rgba(244,63,94,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              Attention Required
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-black text-rose-400">{overdueTasks.length}</p>
            <p className="text-xs text-slate-400 mt-1">Tasks past due date without submission</p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-rose-400 font-bold">
            <span>Reminders Needed</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two-Column Working Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Immediate Task Review Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-orange" />
              <h2 className="text-base font-bold text-white">Student Submissions Pending Review</h2>
            </div>
            <button
              onClick={() => navigate('/teacher/tasks')}
              className="text-xs text-brand-orange hover:underline font-bold flex items-center gap-1"
            >
              <span>Manage All Tasks</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {submittedForReview.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#060B1E] border border-white/5 text-center text-xs text-slate-400">
              No pending student submissions waiting for review!
            </div>
          ) : (
            <div className="space-y-3">
              {submittedForReview.slice(0, 5).map((t) => (
                <div
                  key={t.assignmentId}
                  className="p-4 rounded-2xl bg-[#070E28] border border-[#162758] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{t.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-brand-orange">
                        {t.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Submitted by: <span className="font-bold text-white">{t.studentName}</span> ({t.studentId})
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>Study Time: {t.actualStudyMins} mins</span>
                      <span>&bull;</span>
                      <span>Questions Solved: {t.completedQuestions}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/teacher/tasks')}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition"
                    >
                      Review &amp; Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assigned Batches Overview */}
          <div className="pt-4 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-orange" />
              Assigned Cohort Batches
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#060B1E] border border-[#14234E] flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-white">{b.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{b.courseName}</p>
                    <p className="text-[10px] text-brand-orange font-mono mt-1">{b.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-white">{b.studentCount}</p>
                    <p className="text-[10px] text-slate-400">Students</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Students Requiring Academic Support (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Students Requiring Support</h2>
          </div>

          <div className="space-y-3">
            {studentsNeedingSupport.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#060B1E] border border-white/5 text-center text-xs text-slate-400">
                All students currently meeting academic targets!
              </div>
            ) : (
              studentsNeedingSupport.slice(0, 5).map((stu) => (
                <div
                  key={stu.studentId}
                  className="p-4 rounded-2xl bg-[#070E28] border border-amber-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white">{stu.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{stu.studentId}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      Score: {stu.averageScore}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Pending tasks: <span className="font-bold text-white">{stu.pendingTasks || 0}</span> &bull; Batch: {stu.batchName}
                  </p>

                  <button
                    onClick={() => navigate('/teacher/progress-cards')}
                    className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-brand-orange text-xs font-semibold transition"
                  >
                    Inspect Digital Progress Card &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
