import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-light-bg text-brand-text-dark flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - offset by sidebar width on large screens */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all">
        {/* Sticky Header */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white/70 py-4 px-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
          <div>
            &copy; 2026 <span className="font-bold text-brand-navy">Cubit Future Academy</span>. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center justify-center sm:justify-end gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-brand-navy">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              Official Cubit Future Theme
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">v1.0.0 Enterprise</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
