import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TeacherSidebar } from './TeacherSidebar';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeacherLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#040817] text-white flex">
      {/* Teacher Sidebar */}
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <header className="h-20 bg-[#060B1E]/80 backdrop-blur-md border-b border-[#121E42] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Faculty Academic Portal</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Role Verified
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Study Plan Orchestration & Task Verification Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <span>Academic Year 2026</span>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center font-bold text-brand-orange text-xs">
                {(user?.name || 'T').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Faculty Member'}</p>
                <p className="text-[10px] text-slate-400 leading-tight">Teacher Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
