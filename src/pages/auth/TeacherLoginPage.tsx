import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckSquare,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const TeacherLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addNotification('warning', 'Please enter your authorized faculty email address.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === 'TEACHER') {
        addNotification('success', `Welcome back, Professor ${loggedUser.name}!`);
        navigate('/teacher/dashboard');
      } else if (loggedUser.role === 'ADMIN' || loggedUser.role === 'SUPER_ADMIN' || loggedUser.role === 'COUNSELLOR') {
        addNotification('info', 'Administrative session detected. Redirecting to Admin Console.');
        navigate('/admin/dashboard');
      } else {
        addNotification('info', 'Student account detected. Redirecting to Student Academic Portal.');
        navigate('/student/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Faculty access denied. Invalid credentials.';
      addNotification('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040817] via-[#071330] to-[#0A1D4A] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background glow effects with animation */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#172B80]/25 rounded-full blur-[140px] pointer-events-none animate-blob" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Top Header Navigation */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full py-2 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <img
            src="/cubit_future_logo.png"
            alt="Cubit Future"
            className="h-10 w-auto object-contain drop-shadow transition-transform hover:scale-105"
          />
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-blue-300 font-bold border-l border-blue-900 pl-3">
            Faculty Academic Portal
          </span>
        </div>

        <Link
          to="/login"
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#162758] hover:border-slate-500 bg-white/5 transition hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Student Login
        </Link>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex items-center justify-center my-6 animate-fade-in-up delay-100">
        <div className="w-full max-w-md bg-[#071330]/90 border border-[#162758] shadow-2xl rounded-2xl p-7 sm:p-9 backdrop-blur-xl space-y-6 hover-lift hover-glow-blue transition-all duration-300">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-800/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-600/20 animate-float">
              <GraduationCap className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-300 animate-text-gradient">
              Faculty &amp; Teacher Portal
            </h1>
            <p className="text-xs text-slate-300">
              Dedicated workstation to create study plans, assign tasks, and verify student progress cards.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Faculty Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@cubitfuture.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Faculty Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Faculty</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Pillars Overview */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
              <CheckSquare className="w-3.5 h-3.5 mx-auto mb-1 text-blue-400" />
              <span>Task Approval</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
              <BookOpen className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
              <span>Study Plans</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
              <Award className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
              <span>Progress Cards</span>
            </div>
          </div>

          {/* Bottom Switcher */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <Link to="/login" className="hover:text-white transition">
              Student Sign In
            </Link>
            <Link to="/admin/login" className="hover:text-purple-300 transition text-purple-400 font-semibold">
              Admin Console &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-500 py-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between px-4 gap-2">
        <span>&copy; 2026 Cubit Future Academy &bull; Dedicated Faculty Console</span>
        <a
          href="https://loopuniverse.net"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-red-400 font-mono transition text-[11px] inline-flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Powered by loopuniverse.net</span>
        </a>
      </footer>
    </div>
  );
};

export default TeacherLoginPage;
