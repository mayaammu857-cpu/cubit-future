import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentChatbot } from '../student/StudentChatbot';
import { useAuth } from '../../context/AuthContext';
import { Eye, ArrowLeft } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();

  const isTeacherOrAdmin = role && role !== 'STUDENT';

  return (
    <div className="min-h-screen bg-[#060b1d] text-white flex flex-col font-sans selection:bg-brand-orange selection:text-white">
      {/* Top Banner when a Teacher / Admin / Super Admin is previewing the Student Portal */}
      {isTeacherOrAdmin && (
        <div className="bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse" />
            <span>
              Teacher / Admin Preview Mode &bull; You are inspecting the Student Portal as{' '}
              <strong className="underline">{role}</strong>
            </span>
          </div>
          <Link
            to={role === 'SUPER_ADMIN' ? '/admin/superadmin' : '/admin/dashboard'}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#060b1d]/80 hover:bg-[#060b1d] text-white text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Panel</span>
          </Link>
        </div>
      )}

      {/* Student Exclusive Sidebar (Contains NO admin links) */}
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 transition-all">
        {/* Sticky Student Header */}
        <StudentHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full mx-auto animate-fade-in max-w-[1680px]">
          <Outlet />
        </main>
      </div>

      {/* Interactive AI Study & Digital Progress Chatbot for Students */}
      <StudentChatbot />
    </div>
  );
};

export default StudentLayout;
