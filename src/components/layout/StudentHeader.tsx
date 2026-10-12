import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentHeaderProps {
  onToggleSidebar: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ onToggleSidebar }) => {
  const { student, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentName = student?.name || user?.name || 'Aman Krishna';
  const studentId = student?.studentId || 'CF-STU-0001';

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#060b1d] border-b border-[#111c3d] px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left section: mobile hamburger & search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search input from screenshot */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search exams, subjects, or anything..."
            className="w-full pl-10 pr-4 py-2 bg-[#091438] border border-[#162758] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/40 transition"
          />
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Icon with Badge '2' */}
        <button
          className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 hover:scale-105"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-orange text-[#060b1d] text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            2
          </span>
        </button>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <img
              src="/student_aman_avatar.jpg"
              alt={studentName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-orange shadow-md transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:shadow-[0_0_15px_rgba(255,152,0,0.4)]"
              onError={(e) => {
                // Fallback to initials if image load fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#060b1d] animate-pulse" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-tight group-hover:text-brand-orange transition-colors">
              {studentName}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Student ID: {studentId}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-white transition-colors group-hover:translate-y-0.5" />
        </div>

        {/* Logout Quick Action */}
        <button
          onClick={handleLogout}
          title="Sign Out of Portal"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-slate-800"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default StudentHeader;
