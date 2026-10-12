import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040817] text-slate-100 flex flex-col font-sans selection:bg-[#FF9800] selection:text-black">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all">
        {/* Sticky Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1680px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Layout Footer */}
        <footer className="mt-auto py-4 px-6 border-t border-white/5 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1680px] w-full mx-auto">
          <span>&copy; {new Date().getFullYear()} Cubit Future Academy &bull; Central Administration Panel</span>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a
              href="https://loopuniverse.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-red-500 font-mono transition font-medium"
            >
              loopuniverse.net
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
