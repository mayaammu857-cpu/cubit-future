import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { studentApi, courseApi } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Course } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, registerStudent } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  // Authentication & Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Form Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      addNotification('warning', 'Please enter your user ID.');
      return;
    }
    if (!password.trim()) {
      addNotification('warning', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(identifier.trim(), password.trim());

      if (loggedUser.role === 'SUPER_ADMIN') {
        addNotification('success', 'Super Administrator authentication verified.');
        navigate('/admin/superadmin');
      } else if (loggedUser.role === 'ADMIN') {
        addNotification('success', `Welcome back, ${loggedUser.name}!`);
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'TEACHER') {
        addNotification('success', `Welcome back, Professor ${loggedUser.name}!`);
        navigate('/teacher/dashboard');
      } else if (loggedUser.role === 'COUNSELLOR') {
        addNotification('success', `Welcome, Counsellor ${loggedUser.name}!`);
        navigate('/admin/counsellors');
      } else {
        addNotification('success', `Welcome back, ${loggedUser.name}!`);
        navigate('/student/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      addNotification('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Modals for Real Registration and Account Recovery
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotResult, setForgotResult] = useState<string | null>(null);

  const handleForgotLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    try {
      const found = await studentApi.lookupStudent(forgotInput.trim());
      if (found) {
        setForgotResult(`Account located for ${found.name} (Student ID: ${found.studentId}). Reset instructions sent to ${found.email}.`);
        setIdentifier(found.studentId);
      } else {
        setForgotResult('No matching account was found. Please verify your phone number or student ID.');
      }
    } catch {
      setForgotResult('Unable to retrieve account at this moment. Please reach out to your academy counselor.');
    }
  };

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', password: '', courseId: '', dob: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    courseApi.getAll().then((data) => {
      setCourses(data);
      if (data.length > 0 && !regData.courseId) {
        setRegData((prev) => ({ ...prev, courseId: data[0].id }));
      }
    }).catch(() => {});
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name.trim() || !regData.email.trim() || !regData.phone.trim() || !regData.password) {
      addNotification('warning', 'Please provide name, email, phone number, and password.');
      return;
    }
    setRegLoading(true);
    try {
      const newStudent = await registerStudent({
        name: regData.name.trim(),
        email: regData.email.trim(),
        phone: regData.phone.trim(),
        password: regData.password,
        courseId: regData.courseId || courses[0]?.id || 'course-1',
        dateOfBirth: regData.dob || undefined,
      });
      addNotification('success', `Enrollment complete! Welcome, ${newStudent.name} (${newStudent.studentId}).`);
      setShowRegisterModal(false);
      navigate('/student/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      addNotification('error', msg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans text-slate-800 selection:bg-[#0052CC] selection:text-white">
      {/* ====================================================================== */}
      {/* LEFT COLUMN: Clean White Login Panel (100% Matching Mockup)             */}
      {/* ====================================================================== */}
      <div className="w-full lg:w-[480px] xl:w-[520px] 2xl:w-[540px] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 relative z-10 shrink-0">
        {/* Subtle Ambient Curved Glow Wave in Background */}
        <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-gradient-to-br from-blue-50/50 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="max-w-[430px] w-full mx-auto my-auto flex flex-col justify-center py-6 relative z-10">
          {/* Top Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/cubit_logo_transparent.png"
              alt="CUBIT FUTURE"
              className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105 animate-fade-in"
            />
          </div>

          {/* Student Portal Badge */}
          <div className="mb-2 animate-fade-in-up">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#0052CC] uppercase inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] animate-pulse" />
              STUDENT PORTAL
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-[35px] font-black tracking-tight text-[#0D1829] leading-tight animate-fade-in-up delay-75">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052CC] via-[#2563EB] to-[#0047CC] animate-gradient-text">Back!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm mt-2 mb-5 leading-relaxed animate-fade-in-up delay-100">
            Sign in to your account and continue your learning journey with Cubit Future.
          </p>


          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field: User ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5 text-slate-400 stroke-[1.75]" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your user ID"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC]/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0052CC] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0052CC]/10 transition font-normal"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 text-slate-400 stroke-[1.75]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-[#F8FAFC]/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0052CC] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0052CC]/10 transition font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 stroke-[1.75]" /> : <Eye className="w-5 h-5 stroke-[1.75]" />}
                </button>
              </div>
            </div>

            {/* Row: Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-0.5">
              <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#0052CC] border-slate-300 rounded focus:ring-[#0052CC]"
                />
                <span className="font-medium text-slate-700">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotResult(null);
                  setShowForgotModal(true);
                }}
                className="text-[#0052CC] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Submit Button: -> Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0047CC] hover:bg-[#003BB0] active:bg-[#003399] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-900/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider: New to Cubit Future? */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                New to Cubit Future?
              </span>
            </div>
          </div>

          {/* Secondary Button: Contact Your Counsellor */}
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 hover:border-slate-300"
          >
            <GraduationCap className="w-4 h-4 text-slate-700" />
            <span>Contact Your Counsellor</span>
          </button>


          {/* Footer Sub-branding */}
          <div className="mt-6 text-center flex flex-col items-center gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              LEARN &nbsp;•&nbsp; PRACTICE &nbsp;•&nbsp; ACHIEVE
            </p>
            <a
              href="https://loopuniverse.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-slate-400 hover:text-red-500 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>loopuniverse.net</span>
            </a>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* RIGHT COLUMN: Cinematic Hero Graphic (100% Matching Mockup)             */}
      {/* ====================================================================== */}
      <div className="hidden lg:flex flex-1 relative min-h-screen overflow-hidden bg-[#000F2B] items-center justify-center">
        {/* Ambient Animated Glowing Nebulas */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/25 rounded-full blur-[140px] animate-blob pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[460px] h-[460px] bg-amber-500/20 rounded-full blur-[150px] animate-blob delay-300 pointer-events-none" />
        <img
          src="/cubit_login_hero_perfect.png"
          alt="Cubit Future - A Brighter Future"
          className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-105 animate-fade-in"
        />
      </div>

      {/* ====================================================================== */}
      {/* MODALS: Student Admission Registration & Account Recovery              */}
      {/* ====================================================================== */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Student Admission Enrollment"
        subtitle="Connect with Cubit Future counsellor or register your student profile"
        maxWidth="lg"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={regData.name}
              onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={regData.phone}
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Enrolled Course *
              </label>
              <select
                value={regData.courseId}
                onChange={(e) => setRegData({ ...regData, courseId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="course-1">OET (Occupational English Test)</option>
                    <option value="course-2">IELTS Academic / General</option>
                    <option value="course-3">Banking &amp; Financial Services</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                placeholder="Choose account password"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={regLoading}
              className="px-5 py-2 bg-[#0047CC] hover:bg-[#003BB0] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {regLoading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Forgot Password Lookup Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Student Account Recovery"
        subtitle="Enter your registered Student ID or email address to recover access"
        maxWidth="md"
      >
        <form onSubmit={handleForgotLookup} className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Student ID or Registered Email
            </label>
            <input
              type="text"
              required
              value={forgotInput}
              onChange={(e) => setForgotInput(e.target.value)}
              placeholder="e.g. CF-STU-0001 or email@domain.com"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {forgotResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs leading-relaxed">
              {forgotResult}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 font-medium"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0047CC] hover:bg-[#003BB0] text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              Verify Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
