import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  CheckSquare,
  BookOpen,
  Users,
  Award,
  LogOut,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Faculty Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Student Monitoring Hub', path: '/teacher/monitoring', icon: Activity },
    { label: 'Task Management & Review', path: '/teacher/tasks', icon: CheckSquare },
    { label: 'Digital Study Plans', path: '/teacher/study-plans', icon: BookOpen },
    { label: 'My Students & Batches', path: '/teacher/students', icon: Users },
    { label: 'Digital Progress Cards', path: '/teacher/progress-cards', icon: Award },
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
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 sm:w-72 bg-[#060B18] border-r border-[#15234A] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#15234A]">
            <div className="flex items-center gap-3">
              <img
                src="/cubit_future_logo.png"
                alt="Cubit Future"
                className="h-10 w-auto object-contain"
              />
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
                Faculty
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
          <nav className="px-3.5 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-orange to-[#FF7700] text-white shadow-lg shadow-brand-orange/25 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          {/* Faculty Badge Box */}
          <div className="p-4 mx-3.5 mb-3 rounded-2xl bg-gradient-to-br from-[#0B173B] to-[#08102A] border border-[#192B60] relative overflow-hidden shadow-lg">
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Teacher Workspace</p>
                <p className="text-[10px] text-slate-400 truncate">Assign • Review • Mentor</p>
              </div>
            </div>
          </div>


          {/* User Session Info & Logout */}
          <div className="p-3.5 border-t border-[#15234A] bg-[#040815] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#0F204E] border border-brand-orange/40 flex items-center justify-center font-bold text-brand-orange text-xs">
                {(user?.name || 'T').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Faculty Member'}</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">Academic Mentor</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Faculty Portal"
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

export default TeacherSidebar;
