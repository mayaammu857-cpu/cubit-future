import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  ShieldAlert,
  Settings,
  LogOut,
  X,
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Quick search navigation modules
  const quickSearchItems = [
    { title: 'Student Directory', category: 'Student Profiles & Onboarding', path: '/admin/students', icon: Users },
    { title: 'Batches & Cohorts', category: 'Academic Cohorts', path: '/admin/batches', icon: BookOpen },
    { title: 'Examinations & Tests', category: 'Assessments & Schedules', path: '/admin/exams', icon: GraduationCap },
    { title: 'Courses & Programs', category: 'Curriculum & Degrees', path: '/admin/courses', icon: BookOpen },
    { title: 'Marks Management', category: 'Scorecards & Results', path: '/admin/marks', icon: CheckCircle2 },
    { title: 'Google Sheets Hub', category: 'Fleet Integration Pipelines', path: '/admin/google-sheets', icon: CheckCircle2 },
    { title: 'Security Audit Logs', category: 'Governance Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { title: 'System Settings', category: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-20 bg-[#040817]/90 backdrop-blur-md border-b border-[#101C3D] px-4 sm:px-8 flex items-center justify-between transition-all">
        {/* Left Section: Mobile Menu & Search Input */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar matching mockup exactly */}
          <div
            onClick={() => setSearchOpen(true)}
            className="flex-1 max-w-md flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#080E24] border border-[#16254F] hover:border-[#1E3A8A] text-slate-400 cursor-pointer transition shadow-inner group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors flex-shrink-0" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 truncate">
                Search students, exams, courses...
              </span>
            </div>
            <div className="hidden sm:flex items-center px-2 py-0.5 rounded-md bg-[#0F1B3B] border border-[#1E2E5D] text-[10px] font-mono text-slate-400 group-hover:text-slate-200 shadow-sm flex-shrink-0 ml-2">
              Ctrl + K
            </div>
          </div>
        </div>

        {/* Right Section: Notification & User Profile Capsule */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative p-2.5 rounded-xl bg-[#080E24] hover:bg-[#0D1636] border border-[#16254F] hover:border-[#1E3A8A] text-slate-300 hover:text-white transition shadow-sm"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {/* Badge count '3' matching design */}
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF9800] text-[#050814] text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(255,152,0,0.6)]">
                3
              </span>
            </button>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#080E24] border border-[#16254F] shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#16254F]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Academy Alerts
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF9800]/20 text-[#FF9800]">
                      3 New
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/admin/notifications')}
                    className="text-[11px] text-[#38BDF8] hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">System Security Active</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Admin session authenticated and secured
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Live
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#38BDF8] mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">Google Sheets Hub</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Integration pipelines ready for automated sync
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Online
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule matching design */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-white/[0.04] transition group"
            >
              {/* Circular Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#FF9800]/40 shadow-sm bg-[#0B1536] flex items-center justify-center flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-initial') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="avatar-initial hidden w-full h-full items-center justify-center font-bold text-white text-xs bg-[#FF9800]/20 text-[#FF9800]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              </div>

              {/* Name & Role Text */}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white group-hover:text-[#FF9800] transition-colors leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#080E24] border border-[#16254F] shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-[#16254F] mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@cubitfuture.com'}</p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/admin/superadmin');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-[#FF9800]" />
                    <span>Super Admin Console</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                  >
                    <Settings className="w-4 h-4 text-[#38BDF8]" />
                    <span>System Settings</span>
                  </button>

                  <div className="border-t border-[#16254F] my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Interactive Command Palette (Ctrl + K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-[#080E24] border border-[#16254F] rounded-2xl shadow-2xl overflow-hidden">
            {/* Input Header */}
            <div className="flex items-center px-4 py-3 border-b border-[#16254F]">
              <Search className="w-5 h-5 text-[#FF9800] mr-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, exams, courses, batches..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results */}
            <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
              {quickSearchItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching results found for "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-1">
                  {quickSearchItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(item.path);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.05] transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#0E1A3C] text-[#FF9800]">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-[#FF9800] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400">{item.category}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Press ↵</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-4 py-2.5 border-t border-[#16254F] bg-[#050B1C] flex items-center justify-between text-[11px] text-slate-500">
              <span>Quick Navigation Command Center</span>
              <span className="font-mono">ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;
