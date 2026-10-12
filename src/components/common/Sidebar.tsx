import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  LogOut,
  Users,
  BookOpen,
  Layers,
  FileCheck2,
  FileBarChart,
  ShieldCheck,
  X,
  Sparkles,
  HeartHandshake,
  BookmarkCheck,
  Trophy,
  Activity,
  Download,
  Lock,
  Bell,
  History,
  ChevronDown,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student Navigation
  const studentNavSections = [
    {
      title: 'Academic Portal',
      items: [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/student/profile', icon: User },
        { label: 'Exam Results', path: '/student/results', icon: FileCheck2 },
        { label: 'Performance Analytics', path: '/student/performance', icon: TrendingUp },
        { label: 'Settings', path: '/student/settings', icon: Settings },
      ],
    },
  ];

  // Official Super Admin & Admin Navigation Hierarchy
  const adminNavSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Admin Accounts', path: '/admin/admins', icon: ShieldCheck },
        { label: 'Counsellors', path: '/admin/counsellors', icon: HeartHandshake },
        { label: 'Courses & Programs', path: '/admin/courses', icon: BookOpen },
        { label: 'Batches & Cohorts', path: '/admin/batches', icon: Layers },
        { label: 'Curriculum Subjects', path: '/admin/subjects', icon: BookmarkCheck },
      ],
    },
    {
      title: 'Academic',
      items: [
        { label: 'Exams & Schedules', path: '/admin/exams', icon: GraduationCap },
        { label: 'Marks & Results', path: '/admin/marks', icon: FileCheck2 },
        { label: 'Student Performance', path: '/admin/performance', icon: TrendingUp },
        { label: 'Rankings & Honors', path: '/admin/rankings', icon: Trophy },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { label: 'Google Sheets Hub', path: '/admin/google-sheets', icon: FileSpreadsheet },
        { label: 'Integration Logs', path: '/admin/integration-logs', icon: Activity },
      ],
    },
    {
      title: 'Business & Reports',
      items: [
        { label: 'Analytics Suite', path: '/admin/analytics', icon: TrendingUp },
        { label: 'Reports Generator', path: '/admin/reports', icon: FileBarChart },
        { label: 'Data Export Center', path: '/admin/data-export', icon: Download },
      ],
    },
    {
      title: 'System & Security',
      items: [
        { label: 'Roles & Permissions', path: '/admin/roles-permissions', icon: Lock },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const sections =
    role === 'SUPER_ADMIN' || role === 'ADMIN' ? adminNavSections : studentNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#050814] border-r border-[#172554] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Official Cubit Future Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#172554]/60 bg-[#070D22]/80">
          <div className="flex items-center gap-3">
            <img
              src="/cubit_future_logo.png"
              alt="Cubit Future Official Logo"
              className="h-10 w-auto object-contain transition-transform hover:scale-105"
            />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role & User Badge */}
        <div className="px-6 py-3.5 border-b border-[#172554]/40 bg-[#081232]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  role === 'SUPER_ADMIN'
                    ? 'bg-purple-400'
                    : role === 'ADMIN'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
                {role === 'SUPER_ADMIN'
                  ? 'Super Admin Portal'
                  : role === 'ADMIN'
                  ? 'Admin Portal'
                  : 'Student Portal'}
              </span>
            </div>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                role === 'SUPER_ADMIN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : role === 'ADMIN'
                  ? 'bg-brand-orange text-brand-dark'
                  : 'bg-brand-navy-light text-brand-orange border border-brand-orange/30'
              }`}
            >
              {role === 'SUPER_ADMIN' ? 'ROOT AUTH' : role || 'STUDENT'}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 custom-scrollbar">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-[#0B1B55] text-white shadow-md shadow-[#0B1B55]/50 border border-brand-orange/40'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 transition-colors flex-shrink-0 ${
                            isActive
                              ? 'text-brand-orange'
                              : 'text-slate-400 group-hover:text-brand-orange'
                          }`}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-4 rounded-full bg-brand-orange shadow-[0_0_8px_#FF9800]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile and Fast Logout Footer */}
        <div className="p-4 border-t border-[#172554] bg-[#070D22]/90 space-y-3">
          {/* View switcher for administrative demo check */}
          <div className="p-2 rounded-xl bg-brand-navy/60 border border-[#1e3a8a]/40">
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-orange" /> Switch Demo Role:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => {
                  switchRole('STUDENT');
                  navigate('/student/dashboard');
                }}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                  role === 'STUDENT'
                    ? 'bg-brand-orange text-brand-dark'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('TEACHER');
                  navigate('/teacher/dashboard');
                }}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                  role === 'TEACHER'
                    ? 'bg-brand-orange text-brand-dark'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('ADMIN');
                  navigate('/admin/dashboard');
                }}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                  role === 'ADMIN'
                    ? 'bg-brand-orange text-brand-dark'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('COUNSELLOR');
                  navigate('/admin/counsellors');
                }}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                  role === 'COUNSELLOR'
                    ? 'bg-brand-orange text-brand-dark'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Counsellor
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('SUPER_ADMIN');
                  navigate('/admin/superadmin');
                }}
                className={`col-span-2 px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                  role === 'SUPER_ADMIN'
                    ? 'bg-brand-orange text-brand-dark'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Super Admin
              </button>
            </div>
          </div>

          {/* User info and Logout */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-navy border border-brand-orange/40 flex items-center justify-center font-bold text-brand-orange text-xs shadow-inner flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">{user?.email || 'admin@cubitfuture.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout from platform"
              className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
