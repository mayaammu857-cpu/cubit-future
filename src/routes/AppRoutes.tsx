import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

// Layouts with Zero Overlap and Strict Isolation
import { StudentLayout } from '../components/layout/StudentLayout';
import { TeacherLayout } from '../components/layout/TeacherLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Public and Cinematic Flow Pages
import { CinematicIntro } from '../pages/intro/CinematicIntro';
import { PortalGateway } from '../pages/portal/PortalGateway';
import { LoginPage } from '../pages/auth/LoginPage';
import { TeacherLoginPage } from '../pages/auth/TeacherLoginPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';

// Super Admin & Admin Pages
import { SuperAdminPanel } from '../pages/admin/SuperAdminPanel';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminTeachers } from '../pages/admin/AdminTeachers';
import { AdminTasksPage } from '../pages/admin/AdminTasksPage';
import { AdminProgressCardsHub } from '../pages/admin/AdminProgressCardsHub';
import { AdminStudents } from '../pages/admin/AdminStudents';
import { AdminAccounts } from '../pages/admin/AdminAccounts';
import { CounsellorManagement } from '../pages/admin/CounsellorManagement';
import { AdminCourses } from '../pages/admin/AdminCourses';
import { AdminBatches } from '../pages/admin/AdminBatches';
import { SubjectManagement } from '../pages/admin/SubjectManagement';
import { AdminExams } from '../pages/admin/AdminExams';
import { MarksResults } from '../pages/admin/MarksResults';
import { StudentRankings } from '../pages/admin/StudentRankings';
import { IntegrationLogs } from '../pages/admin/IntegrationLogs';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { DataExport } from '../pages/admin/DataExport';
import { RolesPermissions } from '../pages/admin/RolesPermissions';
import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Teacher & Faculty Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherTasksPage } from '../pages/teacher/TeacherTasksPage';
import { TeacherStudyPlansPage } from '../pages/teacher/TeacherStudyPlansPage';
import { TeacherStudentsPage } from '../pages/teacher/TeacherStudentsPage';
import { TeacherProgressCardsPage } from '../pages/teacher/TeacherProgressCardsPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentTasksPage } from '../pages/student/StudentTasksPage';
import { StudentStudyPlanPage } from '../pages/student/StudentStudyPlanPage';
import { DigitalProgressCardPage } from '../pages/student/DigitalProgressCardPage';
import { StudentProfile } from '../pages/student/StudentProfile';
import { StudentResults } from '../pages/student/StudentResults';
import { StudentPerformance } from '../pages/student/StudentPerformance';

// Shared System Pages
import { GoogleSheetsSync } from '../pages/common/GoogleSheetsSync';
import { SettingsPage } from '../pages/common/SettingsPage';

// Route Guards & Strict Role Isolation
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/portal" replace />;
  if (role === 'SUPER_ADMIN') return <Navigate to="/admin/superadmin" replace />;
  if (role === 'ADMIN' || role === 'COUNSELLOR') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

const PublicAuthRoute: React.FC<{ children: React.ReactNode; targetRole?: Role }> = ({
  children,
  targetRole,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;

  // Only bounce if user is already authenticated with the SAME role as the target login portal
  if (isAuthenticated && role) {
    const isMatchingRole = targetRole
      ? role === targetRole || (targetRole === 'ADMIN' && (role === 'SUPER_ADMIN' || role === 'COUNSELLOR'))
      : true;

    if (isMatchingRole) {
      if (role === 'SUPER_ADMIN') return <Navigate to="/admin/superadmin" replace />;
      if (role === 'ADMIN' || role === 'COUNSELLOR') return <Navigate to="/admin/dashboard" replace />;
      if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
      return <Navigate to="/student/dashboard" replace />;
    }
  }
  return <>{children}</>;
};

// Strict Student Isolation Guard
const StudentRouteGuard: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'STUDENT') {
    if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COUNSELLOR') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return <StudentLayout />;
};

// Strict Teacher / Faculty Isolation Guard
const TeacherRouteGuard: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/teacher/login" replace />;
  if (role !== 'TEACHER') {
    if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COUNSELLOR') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/teacher/login" replace />;
  }
  return <TeacherLayout />;
};

// Strict Admin & Super Admin Isolation Guard
const AdminRouteGuard: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'COUNSELLOR') {
    if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout />;
};

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D22] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Initializing Cubit Future Portal...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. Root & Cinematic Intro Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/intro" element={<CinematicIntro onComplete={() => window.location.href = '/portal'} />} />
      <Route path="/portal" element={<PortalGateway />} />

      {/* 2. Public Unified Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute targetRole="STUDENT">
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/teacher/login"
        element={
          <PublicAuthRoute targetRole="TEACHER">
            <TeacherLoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <PublicAuthRoute targetRole="ADMIN">
            <AdminLoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/superadmin/login"
        element={
          <PublicAuthRoute targetRole="ADMIN">
            <AdminLoginPage />
          </PublicAuthRoute>
        }
      />

      {/* 3. STUDENT PORTAL — Strictly Isolated */}
      <Route element={<StudentRouteGuard />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/tasks" element={<StudentTasksPage />} />
        <Route path="/student/study-plan" element={<StudentStudyPlanPage />} />
        <Route path="/student/progress-card" element={<DigitalProgressCardPage />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/results" element={<StudentResults />} />
        <Route path="/student/performance" element={<StudentPerformance />} />
        <Route path="/student/settings" element={<SettingsPage />} />
      </Route>

      {/* 4. TEACHER / FACULTY PORTAL — Strictly Isolated */}
      <Route element={<TeacherRouteGuard />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/tasks" element={<TeacherTasksPage />} />
        <Route path="/teacher/study-plans" element={<TeacherStudyPlansPage />} />
        <Route path="/teacher/students" element={<TeacherStudentsPage />} />
        <Route path="/teacher/progress-cards" element={<TeacherProgressCardsPage />} />
        <Route path="/teacher/settings" element={<SettingsPage />} />
      </Route>

      {/* 5. ADMIN & SUPER ADMIN PANEL — Strictly Protected */}
      <Route element={<AdminRouteGuard />}>
        {/* Dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/superadmin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/superadmin" element={<SuperAdminPanel />} />
        <Route path="/superadmin" element={<SuperAdminPanel />} />

        {/* Faculty & Teachers Management */}
        <Route path="/admin/teachers" element={<AdminTeachers />} />

        {/* Tasks & Progress Cards Supervision */}
        <Route path="/admin/tasks" element={<AdminTasksPage />} />
        <Route path="/admin/progress-cards" element={<AdminProgressCardsHub />} />

        {/* Management Module */}
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/admins" element={<AdminAccounts />} />
        <Route path="/admin/counsellors" element={<CounsellorManagement />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/batches" element={<AdminBatches />} />
        <Route path="/admin/subjects" element={<SubjectManagement />} />

        {/* Academic Module */}
        <Route path="/admin/exams" element={<AdminExams />} />
        <Route path="/admin/marks" element={<MarksResults />} />
        <Route path="/admin/performance" element={<StudentPerformance />} />
        <Route path="/admin/rankings" element={<StudentRankings />} />

        {/* Integrations Module */}
        <Route path="/admin/google-sheets" element={<GoogleSheetsSync />} />
        <Route path="/admin/integration-logs" element={<IntegrationLogs />} />

        {/* Analytics & Reports */}
        <Route path="/admin/analytics" element={<StudentPerformance />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/data-export" element={<DataExport />} />

        {/* Security & System */}
        <Route path="/admin/roles-permissions" element={<RolesPermissions />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback to root redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

