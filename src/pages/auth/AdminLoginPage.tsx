import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addNotification('warning', 'Please enter your authorized administrative email address.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === 'SUPER_ADMIN') {
        addNotification('success', 'Super Administrator authentication verified. Welcome to Root Console.');
        navigate('/admin/superadmin');
      } else if (loggedUser.role === 'ADMIN') {
        addNotification('success', 'Administrative session initiated.');
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'COUNSELLOR') {
        addNotification('success', `Welcome, Counsellor ${loggedUser.name}!`);
        navigate('/admin/counsellors');
      } else if (loggedUser.role === 'TEACHER') {
        addNotification('success', `Faculty session initiated for Professor ${loggedUser.name}.`);
        navigate('/teacher/dashboard');
      } else {
        addNotification('info', 'Student account detected. Redirecting to Student Academic Portal.');
        navigate('/student/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Administrative access denied. Invalid credentials.';
      addNotification('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-[#060D25] to-[#0A1338] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background glow effects with dynamic animations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/15 rounded-full blur-[140px] pointer-events-none animate-blob" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Top Header Navigation */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full py-2 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <img
            src="/cubit_future_logo.png"
            alt="Cubit Future"
            className="h-10 w-auto object-contain drop-shadow transition-transform hover:scale-105"
          />
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-slate-400 font-bold border-l border-slate-700 pl-3">
            Internal Systems Control
          </span>
        </div>

        <Link
          to="/login"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 bg-white/5 transition hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Main Login
        </Link>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex items-center justify-center my-6 animate-fade-in-up delay-100">
        <div className="w-full max-w-md bg-[#0A1333]/90 border border-[#1E293B] shadow-2xl rounded-2xl p-7 sm:p-9 backdrop-blur-xl space-y-6 hover-lift hover-glow-orange transition-all duration-300">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-orange/20 to-amber-500/10 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-lg shadow-brand-orange/15 animate-float">
              <Shield className="w-7 h-7 text-brand-orange" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-300 to-brand-orange animate-text-gradient">
              Super Admin &amp; Staff Access
            </h1>
            <p className="text-xs text-slate-400">
              Restricted portal for authorized administrators, academic deans, and system controllers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Authorized Staff Email or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cubitfuture.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Password
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
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Security PIN / 2FA Token (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="6-digit authorization token"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-orange to-[#ff8c33] hover:from-[#e55f00] hover:to-[#ea7d29] text-white font-bold rounded-xl shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying Root Credentials...
                </span>
              ) : (
                <>
                  Authenticate &amp; Enter Console
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 text-center text-xs text-slate-500 py-3 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>&copy; 2026 Cubit Future Academy • System Architecture v2.4</span>
        <span className="hidden sm:inline">•</span>
        <a
          href="https://loopuniverse.net"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-400 font-mono transition text-[11px] inline-flex items-center gap-1.5 text-slate-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>loopuniverse.net</span>
        </a>
        <span className="hidden sm:inline">•</span>
        <span className="flex items-center gap-1 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted Tunnel
        </span>
      </footer>
    </div>
  );
};
