import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Layers,
  Users,
  Lock,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PortalGateway: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleStudentPortal = () => {
    if (user && role === 'STUDENT') {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleTeacherPortal = () => {
    if (user && role === 'TEACHER') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/teacher/login');
    }
  };

  const handleAdminPanel = () => {
    if (user && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
      navigate(role === 'SUPER_ADMIN' ? '/admin/superadmin' : '/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B18] text-white flex flex-col justify-between p-4 sm:p-8 lg:p-12 font-sans relative overflow-hidden">
      {/* Brand Ambient Lights with Smooth Floating and Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#172B80]/30 rounded-full blur-[140px] pointer-events-none animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FF9500]/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none animate-float-slow" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#15234A] animate-fade-in-up">
        <div className="flex items-center gap-3">
          <img
            src="/cubit_future_logo.png"
            alt="Cubit Future Official Logo"
            className="h-11 sm:h-12 w-auto object-contain drop-shadow transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(255,152,0,0.5)]"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Role Isolation Active &bull;</span> Protected
          </span>
        </div>
      </header>

      {/* Main Gateway Selection Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full my-auto py-8 sm:py-12">
        {/* Title & Headline with Staggered Entrance and Gradient Animation */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,152,0,0.2)] animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            Cubit Future Educational Ecosystem
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Role-Isolated <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-300 to-brand-orange animate-text-gradient">Portal Gateway</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 animate-fade-in-up delay-100">
            Dedicated consoles with strictly isolated workflows for Students, Teachers, and Administrators.
          </p>
        </div>

        {/* 3 Standalone Role Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {/* ========================================================= */}
          {/* PORTAL 1: STUDENT PORTAL                                  */}
          {/* ========================================================= */}
          <div className="group relative rounded-3xl bg-[#09112F]/90 border-2 border-[#1E293B] hover:border-brand-orange/70 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover-lift hover-glow-orange animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-orange/20 text-brand-orange border border-brand-orange/40 shadow-[0_0_10px_rgba(255,152,0,0.2)]">
                PORTAL 1 &bull; STUDENT
              </span>
              <span className="text-xs text-slate-400 font-medium">Candidate Area</span>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-[#FF7700] flex items-center justify-center text-white shadow-lg shadow-brand-orange/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-brand-orange transition-colors">
                  Student Portal
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Daily study plan, practice question targets, task submission workflows, exam scorecards, and the official Digital Progress Card.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <CheckSquare className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                  <span className="truncate">My Tasks</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Progress Card</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">Study Schedule</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Marks &amp; Tests</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleStudentPortal}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-[#ff8c33] hover:from-[#e55f00] hover:to-[#ea7d29] text-white font-bold text-sm shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hover:text-brand-orange transition flex items-center gap-1 font-medium"
                >
                  Student Login <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hover:text-brand-orange transition flex items-center gap-1 font-medium text-brand-orange"
                >
                  New Admission <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PORTAL 2: TEACHER / FACULTY PORTAL                        */}
          {/* ========================================================= */}
          <div className="group relative rounded-3xl bg-[#071330]/90 border-2 border-[#1E293B] hover:border-blue-500/70 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover-lift hover-glow-blue animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                PORTAL 2 &bull; FACULTY
              </span>
              <span className="text-xs text-slate-400 font-medium">Teachers &amp; Mentors</span>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-[#172B80] flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BookOpen className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
                  Teacher Dashboard
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Assign tasks to batches, verify student submissions, request revisions, curate digital study plans, and monitor progress cards.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">Task Assignment</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Review &amp; Approve</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">Assigned Batches</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Verify Progress</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleTeacherPortal}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Teacher Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/login')}
                  className="hover:text-blue-300 transition flex items-center gap-1 font-medium"
                >
                  Faculty Sign In <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <span className="text-slate-500 text-[11px]">Role Isolated</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PORTAL 3: SUPER ADMIN & OPERATIONS CONSOLE                */}
          {/* ========================================================= */}
          <div className="group relative rounded-3xl bg-[#0A0D22]/90 border-2 border-[#1E293B] hover:border-purple-500/70 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover-lift hover-glow-purple animate-fade-in-up delay-300">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                PORTAL 3 &bull; ADMIN
              </span>
              <span className="text-xs text-slate-400 font-medium">Root Control</span>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-[#4c1d95] flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  Super Admin Panel
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Manage student admissions, assign teacher batches, automate Google Sheets sync, manage tasks, and inspect security audit logs.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <Users className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="truncate">Admissions &amp; Batches</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">Faculty Allocation</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Google Sheets Sync</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                  <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Audit &amp; Security</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleAdminPanel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="hover:text-purple-300 transition flex items-center gap-1 font-medium"
                >
                  Staff Sign In <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/superadmin/login')}
                  className="hover:text-purple-300 transition flex items-center gap-1 font-medium text-purple-300"
                >
                  Root Console <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full pt-6 border-t border-[#15234A] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div>
          &copy; 2026 <span className="font-bold text-white">Cubit Future Academy</span> &bull; Powered by{' '}
          <a
            href="https://loopuniverse.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-400 hover:underline font-mono font-bold"
          >
            loopuniverse.net
          </a>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Role-Isolated Multi-Portal Architecture</span>
          <span>&bull;</span>
          <span className="text-slate-300 font-mono">v2.0.0 Production</span>
        </div>
      </footer>
    </div>
  );
};

export default PortalGateway;
