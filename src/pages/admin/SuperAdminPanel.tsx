import React, { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  Database,
  Users,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Building2,
  Activity,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Layers,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  BookOpen,
  UserPlus,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  studentApi,
  courseApi,
  batchApi,
  campusApi,
  examApi,
  auditLogApi,
} from '../../services/api';
import { Student, Course, Batch, Campus, AuditLog } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Link } from 'react-router-dom';

export const SuperAdminPanel: React.FC = () => {
  const { user, role } = useAuth();
  const { addNotification } = useNotifications();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);

  // Active Creation Modal
  const [activeModal, setActiveModal] = useState<
    'course' | 'batch' | 'student' | 'campus' | 'exam' | null
  >(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    durationMonths: 6,
    totalModules: 8,
    status: 'ACTIVE' as const,
  });

  const [batchForm, setBatchForm] = useState({
    name: '',
    code: '',
    courseId: '',
    startDate: new Date().toISOString().split('T')[0],
    attendanceRate: 95,
    status: 'ACTIVE' as const,
  });

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: 'student123',
    phone: '',
    courseId: '',
    batchId: '',
    guardianName: '',
    guardianPhone: '',
    googleSheetUrl: '',
    status: 'ACTIVE' as const,
  });

  const [campusForm, setCampusForm] = useState({
    name: '',
    code: '',
    head: '',
    students: 0,
    batches: 0,
    status: 'Active',
  });

  const [examForm, setExamForm] = useState({
    examName: '',
    subject: '',
    studentId: '',
    batchId: '',
    marksObtained: 85,
    maxMarks: 100,
    examDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, courseRes, batchRes, campusRes, logsRes] = await Promise.all([
        studentApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: [], total: 0 })),
        courseApi.getAll().catch(() => []),
        batchApi.getAll().catch(() => []),
        campusApi.getAll().catch(() => []),
        auditLogApi.getAll().catch(() => []),
      ]);
      setStudents(stuRes.data || []);
      setCourses(courseRes || []);
      setBatches(batchRes || []);
      setCampuses(campusRes || []);
      setAuditLogs(logsRes || []);

      // Auto-select defaults in form if available
      if (courseRes && courseRes.length > 0 && !batchForm.courseId) {
        setBatchForm((prev) => ({ ...prev, courseId: courseRes[0].id }));
      }
      if (courseRes && courseRes.length > 0 && !studentForm.courseId) {
        setStudentForm((prev) => ({
          ...prev,
          courseId: courseRes[0].id,
          batchId: batchRes.find((b: Batch) => b.courseId === courseRes[0].id)?.id || batchRes[0]?.id || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleForceFleetSync = async () => {
    setSyncingAll(true);
    try {
      const res = await studentApi.syncAllGoogleSheets();
      addNotification('success', res.message || 'All student Google Sheets synchronized successfully.');
      await auditLogApi.log('Manual Fleet Sync', `Synchronized ${students.length} student sheets`, 'SUCCESS');
      await fetchData();
    } catch {
      addNotification('error', 'Failed to synchronize fleet Google Sheets.');
    } finally {
      setSyncingAll(false);
    }
  };

  // 1. Create Course Handler
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courseApi.create(courseForm);
      addNotification('success', `Program "${courseForm.name}" created successfully.`);
      setActiveModal(null);
      setCourseForm({
        name: '',
        code: '',
        description: '',
        durationMonths: 6,
        totalModules: 8,
        status: 'ACTIVE',
      });
      await fetchData();
    } catch {
      addNotification('error', 'Failed to create program.');
    }
  };

  // 2. Create Batch Handler
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find((c) => c.id === batchForm.courseId);
      await batchApi.create({
        ...batchForm,
        courseName: selectedCourse?.name || 'General Program',
      });
      addNotification('success', `Batch "${batchForm.name}" created successfully.`);
      setActiveModal(null);
      setBatchForm({
        name: '',
        code: '',
        courseId: courses[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        attendanceRate: 95,
        status: 'ACTIVE',
      });
      await fetchData();
    } catch {
      addNotification('error', 'Failed to create batch.');
    }
  };

  // 3. Create Student Handler
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find((c) => c.id === studentForm.courseId);
      const selectedBatch = batches.find((b) => b.id === studentForm.batchId);
      await studentApi.create({
        ...studentForm,
        courseName: selectedCourse?.name || 'General Program',
        batchName: selectedBatch?.name || 'Regular Batch',
        googleSheetStatus: 'CONNECTED',
      });
      addNotification('success', `Student "${studentForm.name}" enrolled. Login key saved.`);
      setActiveModal(null);
      setStudentForm({
        name: '',
        email: '',
        password: 'student123',
        phone: '',
        courseId: courses[0]?.id || '',
        batchId: batches[0]?.id || '',
        guardianName: '',
        guardianPhone: '',
        googleSheetUrl: '',
        status: 'ACTIVE',
      });
      await fetchData();
    } catch (err: any) {
      addNotification('error', err?.message || 'Failed to enroll student.');
    }
  };

  // 4. Create Campus Handler
  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campusApi.create(campusForm);
      addNotification('success', `Campus center "${campusForm.name}" registered.`);
      setActiveModal(null);
      setCampusForm({
        name: '',
        code: '',
        head: '',
        students: 0,
        batches: 0,
        status: 'Active',
      });
      await fetchData();
    } catch {
      addNotification('error', 'Failed to create campus.');
    }
  };

  // 5. Delete Campus Handler
  const handleDeleteCampus = async (code: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove campus "${name}" (${code})?`)) return;
    try {
      await campusApi.delete(code);
      addNotification('success', `Campus "${name}" removed.`);
      await fetchData();
    } catch {
      addNotification('error', 'Failed to remove campus.');
    }
  };

  // 6. Record Exam Assessment Handler
  const handleRecordExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pct = Math.round((examForm.marksObtained / examForm.maxMarks) * 100);
      const selStudent = students.find((s) => s.id === examForm.studentId || s.studentId === examForm.studentId);
      await examApi.submitExamRecord({
        examName: examForm.examName,
        subject: examForm.subject,
        studentId: selStudent?.studentId || examForm.studentId,
        studentName: selStudent?.name,
        marksObtained: Number(examForm.marksObtained),
        maxMarks: Number(examForm.maxMarks),
        percentage: pct,
        examDate: examForm.examDate,
        resultStatus: pct >= 80 ? 'EXCELLENT' : pct >= 50 ? 'PASSED' : 'FAILED',
      });
      addNotification('success', `Exam assessment for "${examForm.examName}" recorded!`);
      setActiveModal(null);
      setExamForm({
        examName: '',
        subject: '',
        studentId: '',
        batchId: '',
        marksObtained: 85,
        maxMarks: 100,
        examDate: new Date().toISOString().split('T')[0],
      });
      await fetchData();
    } catch {
      addNotification('error', 'Failed to record exam assessment.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Super Admin Executive Banner */}
      <div className="bg-gradient-to-r from-[#030712] via-[#09153D] to-[#040B24] p-6 sm:p-8 rounded-2xl border border-brand-orange/30 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
                <Shield className="w-5 h-5 text-brand-orange" />
              </span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-orange">
                Root Governance Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Super Administrator Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Global infrastructure management, multi-branch oversight, staff role assignments, master Google Sheets synchronization, and direct academy data provisioning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleForceFleetSync}
              disabled={syncingAll}
              className="px-4 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-orange/20 flex items-center gap-2 transition disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
              {syncingAll ? 'Synchronizing Fleet...' : 'Sync All Google Sheets'}
            </button>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/20 transition whitespace-nowrap"
            >
              Branch Dashboard
            </Link>
            <Link
              to="/student/dashboard"
              className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition whitespace-nowrap"
            >
              Student Portal View →
            </Link>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN QUICK CREATION & DATA PROVISIONING HUB */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              Super Admin Data Provisioning & Creation Suite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Directly add real courses, student cohorts, branch campuses, and publish exam evaluations with persistent cloud/local storage.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-navy bg-slate-100 px-3 py-1 rounded-full w-fit">
            Root Authority Enabled
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Button 1: Add Program / Course */}
          <button
            onClick={() => setActiveModal('course')}
            className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-brand-navy">+ Add Program</p>
            <p className="text-[11px] text-slate-500 mt-0.5">New Curriculum Course</p>
          </button>

          {/* Button 2: Create Batch */}
          <button
            onClick={() => setActiveModal('batch')}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-brand-navy">+ Create Batch</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Cohort Schedule</p>
          </button>

          {/* Button 3: Enroll Student */}
          <button
            onClick={() => setActiveModal('student')}
            className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-left transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <UserPlus className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-brand-navy">+ Enroll Student</p>
            <p className="text-[11px] text-slate-500 mt-0.5">With Login & Sheet</p>
          </button>

          {/* Button 4: Add Campus / Branch */}
          <button
            onClick={() => setActiveModal('campus')}
            className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-brand-navy">+ Add Campus</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Regional Study Center</p>
          </button>

          {/* Button 5: Record Exam Marks */}
          <button
            onClick={() => setActiveModal('exam')}
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <GraduationCap className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-brand-navy">+ Record Exam</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Publish Marks & Rank</p>
          </button>
        </div>
      </div>

      {/* Global Infrastructure KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Students</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">{students.length}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Across {campuses.length} Campus{campuses.length === 1 ? '' : 'es'}
            </p>
          </div>
          <div className="p-3 bg-orange-50 text-brand-orange rounded-xl border border-brand-orange/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Programs & Batches</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              {courses.length} / {batches.length}
            </p>
            <p className="text-[11px] text-blue-600 font-bold mt-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Real Operational Cohorts
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Google Sheets Integration</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">Online</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Two-Way Fleet Sync</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security & System Health</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">Optimal</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Role Boundaries Enforced</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Campus / Branch Governance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-orange" />
              Campus & Regional Center Governance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity and operational metrics across affiliated Cubit Future study centers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {campuses.length} Location{campuses.length === 1 ? '' : 's'} Connected
            </span>
            <button
              onClick={() => setActiveModal('campus')}
              className="px-3 py-1 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-lg shadow-sm transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Center
            </button>
          </div>
        </div>

        {campuses.length === 0 ? (
          <div className="py-10 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Regional Campuses Registered Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Center" above to register regional branches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campuses.map((c) => (
              <div key={c.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{c.code}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    <button
                      onClick={() => handleDeleteCampus(c.code, c.name)}
                      title="Remove branch center"
                      className="text-slate-300 hover:text-red-500 transition p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-brand-navy">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Lead: {c.head}</p>
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{c.students} Students</span>
                  <span>{c.batches} Batches</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Controls: Staff Role Governance & Real-Time Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Role Permissions Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-orange" />
                Administrative Roles & Personnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Assigned security clearance and portal permissions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs">
                  SA
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Chief Administrator</p>
                  <p className="text-[11px] text-slate-500">superadmin@cubitfuture.com</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-brand-orange text-white">
                Super Admin (Root)
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  AD
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Dr. Anand Raman (Campus Dean)</p>
                  <p className="text-[11px] text-slate-500">admin@cubitfuture.com</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Branch Admin
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  CN
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Priya Sharma (Student Counsellor)</p>
                  <p className="text-[11px] text-slate-500">counsellor@cubitfuture.com</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Counsellor
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Audit Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-orange" />
                Security & Operation Audit Stream
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Chronological system events and verification triggers</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No audit records logged yet.</p>
            ) : (
              auditLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.result === 'FAILED'
                          ? 'bg-red-500'
                          : log.result === 'WARNING'
                          ? 'bg-brand-orange'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{log.action}</p>
                      <p className="text-[11px] text-slate-400">{log.affectedRecord}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Access to Specialized Portals */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-brand-orange" /> Direct Portal Jump Links
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Navigate directly to specific administration subsystems
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/students"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
          >
            Manage Students
          </Link>
          <Link
            to="/admin/exams"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
          >
            Exams & Results
          </Link>
          <Link
            to="/admin/courses"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
          >
            Courses
          </Link>
          <Link
            to="/admin/batches"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
          >
            Batches
          </Link>
          <Link
            to="/admin/google-sheets"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
          >
            Google Sheets API
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODAL: ADD COURSE / PROGRAM */}
      {/* ============================================================== */}
      <Modal
        isOpen={activeModal === 'course'}
        onClose={() => setActiveModal(null)}
        title="Add New Academic Program"
        subtitle="Establish syllabus curriculum and duration"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              placeholder="e.g. Banking & Financial Services Mastery"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program Code *</label>
              <input
                type="text"
                required
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                placeholder="e.g. CRS-BNK-01"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Months) *</label>
              <input
                type="number"
                min={1}
                max={48}
                required
                value={courseForm.durationMonths}
                onChange={(e) => setCourseForm({ ...courseForm, durationMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Curriculum Modules *</label>
            <input
              type="number"
              min={1}
              required
              value={courseForm.totalModules}
              onChange={(e) => setCourseForm({ ...courseForm, totalModules: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Description</label>
            <textarea
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Comprehensive syllabus overview..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-[#e55f00] rounded-xl shadow-md"
            >
              Create Program
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 2. MODAL: CREATE BATCH */}
      {/* ============================================================== */}
      <Modal
        isOpen={activeModal === 'batch'}
        onClose={() => setActiveModal(null)}
        title="Create New Batch"
        subtitle="Schedule cohorts linked to academic programs"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name *</label>
            <input
              type="text"
              required
              value={batchForm.name}
              onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
              placeholder="e.g. Morning Achievers Batch 2026-A"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Code *</label>
              <input
                type="text"
                required
                value={batchForm.code}
                onChange={(e) => setBatchForm({ ...batchForm, code: e.target.value })}
                placeholder="e.g. BAT-2026-A"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={batchForm.startDate}
                onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Course / Program *</label>
            {courses.length === 0 ? (
              <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                No courses available. Please add a Course/Program first!
              </p>
            ) : (
              <select
                required
                value={batchForm.courseId}
                onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
            >
              Create Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 3. MODAL: ENROLL STUDENT */}
      {/* ============================================================== */}
      <Modal
        isOpen={activeModal === 'student'}
        onClose={() => setActiveModal(null)}
        title="Enroll New Student"
        subtitle="Creates portal credentials & dedicated progress card"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Candidate Full Name"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                placeholder="+91 98470 00000"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Email *</label>
              <input
                type="email"
                required
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                placeholder="student@cubitfuture.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portal Password / PIN *</label>
              <input
                type="text"
                required
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                placeholder="e.g. student123"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Course *</label>
              <select
                required
                value={studentForm.courseId}
                onChange={(e) => setStudentForm({ ...studentForm, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              >
                {courses.length === 0 ? (
                  <option value="">No courses created yet</option>
                ) : (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Batch *</label>
              <select
                required
                value={studentForm.batchId}
                onChange={(e) => setStudentForm({ ...studentForm, batchId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              >
                {batches.length === 0 ? (
                  <option value="">No batches created yet</option>
                ) : (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Spreadsheet Link (Optional)
            </label>
            <input
              type="url"
              value={studentForm.googleSheetUrl}
              onChange={(e) => setStudentForm({ ...studentForm, googleSheetUrl: e.target.value })}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Students view clean visual charts; the raw spreadsheet is hidden from them.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-[#e55f00] rounded-xl shadow-md"
            >
              Enroll Student
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 4. MODAL: ADD CAMPUS CENTER */}
      {/* ============================================================== */}
      <Modal
        isOpen={activeModal === 'campus'}
        onClose={() => setActiveModal(null)}
        title="Add Campus / Regional Center"
        subtitle="Establish regional study location and director oversight"
      >
        <form onSubmit={handleCreateCampus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Name *</label>
            <input
              type="text"
              required
              value={campusForm.name}
              onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
              placeholder="e.g. Calicut Regional Center"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Code *</label>
              <input
                type="text"
                required
                value={campusForm.code}
                onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value })}
                placeholder="e.g. CLT-05"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Director / Head *</label>
              <input
                type="text"
                required
                value={campusForm.head}
                onChange={(e) => setCampusForm({ ...campusForm, head: e.target.value })}
                placeholder="Dr. / Prof. Director"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
            >
              Register Campus
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 5. MODAL: RECORD EXAM MARKS */}
      {/* ============================================================== */}
      <Modal
        isOpen={activeModal === 'exam'}
        onClose={() => setActiveModal(null)}
        title="Record Exam Assessment"
        subtitle="Evaluate students and update progress scorecards"
      >
        <form onSubmit={handleRecordExam} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Title *</label>
              <input
                type="text"
                required
                value={examForm.examName}
                onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                placeholder="e.g. Mock Test 01"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Discipline *</label>
              <input
                type="text"
                required
                value={examForm.subject}
                onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                placeholder="e.g. Reasoning / Mathematics"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Student *</label>
            {students.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                No students enrolled yet. (Marks will be logged globally).
              </p>
            ) : (
              <select
                value={examForm.studentId}
                onChange={(e) => setExamForm({ ...examForm, studentId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              >
                <option value="">All Candidates / Batch General</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marks Obtained *</label>
              <input
                type="number"
                min={0}
                required
                value={examForm.marksObtained}
                onChange={(e) => setExamForm({ ...examForm, marksObtained: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Marks *</label>
              <input
                type="number"
                min={1}
                required
                value={examForm.maxMarks}
                onChange={(e) => setExamForm({ ...examForm, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={examForm.examDate}
                onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
            >
              Publish Marks
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
