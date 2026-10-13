import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Award,
  BarChart3,
  User,
  X,
  LogOut,
  Sparkles,
  Target,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose }) => {
  const { user, student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNavItems = [
    { label: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Question Bank Practice', path: '/student/question-bank', icon: HelpCircle },
    { label: 'My Tasks', path: '/student/tasks', icon: CheckSquare },
    { label: 'Digital Study Plan', path: '/student/study-plan', icon: BookOpen },
    { label: 'Digital Progress Card', path: '/student/progress-card', icon: Award },
    { label: 'My Marks & Tests', path: '/student/results', icon: BarChart3 },
  ];

  const aiNavItems = [
    { label: 'AI Doubt Solver', path: '/student/ai-tutor', icon: Sparkles, badge: '24/7' },
    { label: 'Knowledge Gap Radar', path: '/student/knowledge-radar', icon: Target, badge: 'AI' },
    { label: 'Lecture Summarizer', path: '/student/summarizer', icon: FileText, badge: 'Notes' },
  ];

  const accountNavItems = [
    { label: 'Student Profile', path: '/student/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#060b1d]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#060b1d] border-r border-[#111c3d] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#111c3d]/60 sticky top-0 bg-[#060b1d] z-10">
            <div className="flex items-center gap-3">
              <img
                src="/cubit_future_logo.png"
                alt="Cubit Future"
                className="h-10 w-auto object-contain"
              />
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
                Student
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3.5 py-4 space-y-1">
            {/* Academic Core */}
            <div className="px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
              Academic Hub
            </div>
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === '/student/dashboard'}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-orange to-[#FF7700] text-white shadow-lg shadow-brand-orange/25 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 transition-colors flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* AI Co-Pilot Suite */}
            <div className="pt-3 px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-purple-400 flex items-center justify-between">
              <span>AI Learning Suite</span>
              <span className="px-1.5 py-0.2 bg-purple-500/20 rounded text-[9px] text-purple-300 border border-purple-500/30 font-mono">
                PRO
              </span>
            </div>
            {aiNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30 font-semibold'
                        : 'text-purple-200/90 hover:text-white hover:bg-purple-950/20'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-4 h-4 transition-colors flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-purple-400 group-hover:text-purple-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Account */}
            <div className="pt-3 px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
              Account
            </div>
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-orange to-[#FF7700] text-white shadow-lg shadow-brand-orange/25 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 transition-colors flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          {/* Feature Widget: "Build Better Futures" */}
          <div className="p-4 mx-3.5 mb-3 rounded-2xl bg-gradient-to-br from-[#091438] to-[#070e28] border border-[#162758] relative overflow-hidden shadow-lg">
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-brand-orange/30 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-1">
              <h3 className="text-sm font-extrabold leading-tight text-white tracking-tight">
                Cubit Future <br />
                <span className="text-brand-orange">Progress Card</span>
              </h3>
              <p className="text-[10px] text-slate-400 tracking-wider pt-1 font-medium">
                Targeted • Tracked • Verified
              </p>
            </div>
          </div>

          {/* Switch Portal Button */}
          <div className="px-3.5 mb-2">
            <button
              onClick={() => {
                logout();
                navigate('/portal');
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#162758] text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
            >
              <span>Switch Portal (Faculty / Admin) &rarr;</span>
            </button>
          </div>

          {/* User Session Info & Logout */}
          <div className="p-3.5 border-t border-[#111c3d] bg-[#040817] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#0d1b46] border border-brand-orange/40 flex items-center justify-center font-bold text-brand-orange text-xs">
                {(student?.name || user?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {student?.name || user?.name || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {student?.studentId || 'CF-STU-0001'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Portal"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
