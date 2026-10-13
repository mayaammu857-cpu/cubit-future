import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Activity,
  GraduationCap,
  Layers,
  Boxes,
  CheckSquare,
  Award,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  X,
  Crown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: Home },
    { label: 'Student Accounts', path: '/admin/students', icon: Users },
    { label: 'Student Monitoring Hub', path: '/admin/student-monitoring', icon: Activity },
    { label: 'Faculty & Teachers', path: '/admin/teachers', icon: GraduationCap },
    { label: 'Courses & Programs', path: '/admin/courses', icon: Layers },
    { label: 'Exam Question Bank', path: '/admin/question-bank', icon: HelpCircle },
    { label: 'Batches Management', path: '/admin/batches', icon: Boxes },
    { label: 'Study Plans & Tasks', path: '/admin/tasks', icon: CheckSquare },
    { label: 'Progress Cards Hub', path: '/admin/progress-cards', icon: Award },
    { label: 'Google Sheets Sync', path: '/admin/google-sheets', icon: FileSpreadsheet },
    { label: 'Security & Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 sm:w-72 bg-[#040817] border-r border-[#101C3D] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-24 px-6 flex items-center justify-between border-b border-[#101C3D]">
          <div
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/cubit_future_logo.png"
              alt="Cubit Future Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
              {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/admin/dashboard' && location.pathname === '/admin');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-orange to-[#FF7700] text-white shadow-lg shadow-brand-orange/30 font-semibold'
                    : 'text-[#8E9BB0] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-[#8E9BB0] group-hover:text-white'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>


        {/* Bottom User Card & Session */}
        <div className="p-4 pt-2 border-t border-[#101C3D] bg-[#030612]">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-xs">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {role === 'SUPER_ADMIN' ? 'Root Controller' : 'Staff Admin'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out of Administration"
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

export default AdminSidebar;
