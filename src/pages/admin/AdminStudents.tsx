import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Eye,
  EyeOff,
  Key,
  Copy,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  BookOpen,
  Layers,
  CheckSquare,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { studentApi, coursesApi, batchesApi } from '../../services/api';
import { Student, Course, Batch, StudentStatus, GoogleSheetStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useNotifications } from '../../context/NotificationContext';
import { AssignTaskModal } from '../../components/tasks/AssignTaskModal';
import { StudentDetailDashboardModal } from '../../components/students/StudentDetailDashboardModal';

export const AdminStudents: React.FC = () => {
  const { addNotification } = useNotifications();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sheetFilter, setSheetFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [taskTargetStudent, setTaskTargetStudent] = useState<Student | null>(null);

  const handleStudentUpdated = (updatedStu: any) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStu.id || s.studentId === updatedStu.studentId ? { ...s, ...updatedStu } : s))
    );
    setSelectedStudent(updatedStu);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseId: '',
    batchId: '',
    guardianName: '',
    guardianPhone: '',
    googleSheetUrl: '',
    password: '',
    status: 'ACTIVE' as StudentStatus,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = () => {
    const randomPass = 'Stu@' + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, password: randomPass }));
    addNotification('info', `Generated password: ${randomPass}`);
  };

  const handleCopyCredentials = (stu: Student) => {
    const pass = stu.password || 'student123';
    const credText = `*Cubit Future Student Portal Credentials*\nStudent ID: ${stu.studentId}\nName: ${stu.name}\nEmail: ${stu.email}\nPhone: ${stu.phone}\nPortal Password: ${pass}\nPortal Login URL: https://future-six-fawn.vercel.app/login`;
    navigator.clipboard.writeText(credText);
    addNotification('success', `Login credentials for ${stu.name} (${stu.studentId}) copied to clipboard!`);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stuRes, crsRes, batRes] = await Promise.all([
        studentApi.getStudents({ limit: 200 }),
        coursesApi.getAll(),
        batchesApi.getAll(),
      ]);
      setStudents(stuRes.items);
      setCourses(crsRes);
      setBatches(batRes);
      if (crsRes.length > 0 && !formData.courseId) {
        setFormData((prev) => ({
          ...prev,
          courseId: crsRes[0].id,
          batchId: batRes.find((b) => b.courseId === crsRes[0].id)?.id || batRes[0]?.id || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = search.toLowerCase();
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(query) ||
        s.studentId.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query));

      const matchCourse = !courseFilter || s.courseId === courseFilter;
      const matchBatch = !batchFilter || s.batchId === batchFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;
      const matchSheet = !sheetFilter || s.googleSheetStatus === sheetFilter;

      return matchSearch && matchCourse && matchBatch && matchStatus && matchSheet;
    });
  }, [students, search, courseFilter, batchFilter, statusFilter, sheetFilter]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  const handleSyncStudent = async (studentId: string) => {
    setSyncingId(studentId);
    try {
      const res = await studentApi.syncGoogleSheet(studentId);
      addNotification('success', res.message || 'Sheet synchronized!');
      await fetchAll();
    } catch {
      addNotification('error', 'Failed to synchronize sheet.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudentId(stu.id);
    setFormData({
      name: stu.name,
      email: stu.email,
      phone: stu.phone,
      courseId: stu.courseId,
      batchId: stu.batchId,
      guardianName: stu.guardianName || '',
      guardianPhone: stu.guardianPhone || '',
      googleSheetUrl: stu.googleSheetUrl || '',
      password: stu.password || '',
      status: stu.status,
    });
    setIsAddModalOpen(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find((c) => c.id === formData.courseId) || courses[0];
      const selectedBatch = batches.find((b) => b.id === formData.batchId) || batches[0];
      const courseId = formData.courseId || selectedCourse?.id || 'crs-01';
      const batchId = formData.batchId || selectedBatch?.id || 'batch-01';

      if (editingStudentId) {
        await studentApi.update(editingStudentId, {
          ...formData,
          courseId,
          batchId,
          courseName: selectedCourse?.name || 'General Program',
          batchName: selectedBatch?.name || 'Regular Batch',
          googleSheetStatus: formData.googleSheetUrl ? 'CONNECTED' : 'DISCONNECTED',
        });
        addNotification('success', 'Student details & credentials updated successfully!');
      } else {
        await studentApi.create({
          ...formData,
          courseId,
          batchId,
          password: formData.password.trim() || 'student123',
          courseName: selectedCourse?.name || 'General Program',
          batchName: selectedBatch?.name || 'Regular Batch',
          googleSheetStatus: 'CONNECTED',
        });
        addNotification('success', 'Student enrolled with credentials and dedicated Google Sheet generated!');
      }

      setIsAddModalOpen(false);
      setEditingStudentId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        courseId: courses[0]?.id || '',
        batchId: batches[0]?.id || '',
        guardianName: '',
        guardianPhone: '',
        googleSheetUrl: '',
        password: '',
        status: 'ACTIVE',
      });
      // Refresh list without crashing if network has delay
      fetchAll().catch(() => {});
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error saving student record.';
      addNotification('error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await studentApi.delete(id);
      addNotification('success', 'Student record removed.');
      await fetchAll();
    } catch {
      addNotification('error', 'Could not delete student.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Student ID', 'Name', 'Email', 'Phone', 'Course', 'Batch', 'Avg Score', 'Attendance', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.id,
      s.studentId,
      s.name,
      s.email,
      s.phone,
      s.courseName,
      s.batchName,
      s.averageScore,
      s.attendanceRate,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cubit_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('info', 'Exported student directory to CSV');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-orange" />
            Student Enrollment Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student registrations, academic standing, and individual Google Sheets links
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => {
              setEditingStudentId(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                courseId: courses[0]?.id || '',
                batchId: batches[0]?.id || '',
                guardianName: '',
                guardianPhone: '',
                googleSheetUrl: '',
                password: '',
                status: 'ACTIVE',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, Name, Email, Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition"
            />
          </div>

          {/* Course filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-orange/40 transition"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-orange/40 transition"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange/40 transition text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Program & Batch</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Avg Score</th>
                <th className="py-3.5 px-5">Attendance</th>
                <th className="py-3.5 px-5">Google Sheet</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-xs text-slate-600">No students enrolled yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Click "+ Enroll New Student" to register candidates with credentials.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(stu);
                          setIsDashboardModalOpen(true);
                        }}
                        className="font-bold text-slate-900 hover:text-brand-orange text-left transition flex items-center gap-1 group"
                        title="Click to view full student dashboard & manage marks"
                      >
                        <span>{stu.name}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-orange transition" />
                      </button>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-brand-navy font-semibold">{stu.studentId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(stu)}
                          title="Copy student login credentials (ID & password)"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-brand-navy hover:text-brand-orange bg-slate-100 hover:bg-orange-50 rounded border border-slate-200 hover:border-orange-200 transition"
                        >
                          <Key className="w-2.5 h-2.5 text-brand-orange" />
                          <span>Copy Login</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-800">{stu.courseName}</div>
                      <div className="text-[11px] text-slate-400">{stu.batchName}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {stu.email}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {stu.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-brand-orange text-sm">{stu.averageScore}%</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-800">{stu.attendanceRate}%</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <Badge type="sheet" status={stu.googleSheetStatus} />
                        <button
                          onClick={() => handleSyncStudent(stu.id)}
                          disabled={syncingId === stu.id}
                          title="Trigger sync"
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === stu.id ? 'animate-spin text-emerald-600' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="student" status={stu.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(stu);
                            setIsDashboardModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-navy hover:text-white bg-slate-100 hover:bg-brand-navy rounded-lg transition border border-slate-200"
                          title="Student Academic Dashboard & Add Marks"
                        >
                          <Activity className="w-3.5 h-3.5 text-brand-orange" />
                          <span>Dashboard & Marks</span>
                        </button>
                        <button
                          onClick={() => {
                            setTaskTargetStudent(stu);
                            setIsAssignModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition"
                          title="Assign Academic Task to Student"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(stu);
                            setIsDashboardModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition"
                          title="View Full Profile & Marks"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition"
                          title="Edit Student Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(stu.id, stu.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudentId ? 'Edit Student Details' : 'Enroll New Student'}
        subtitle="Provide student academic credentials & Google Sheet sync URL"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rohith Sharma"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rohith@gmail.com"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Program *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              >
                {courses.length === 0 ? (
                  <option value="crs-01">Banking & Financial Services</option>
                ) : (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Batch *</label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              >
                {batches.length === 0 ? (
                  <option value="batch-01">Morning Achievers</option>
                ) : (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Name</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent or Guardian"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Phone Number</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+91 98765 43211"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
          </div>

          {/* Student Portal Login Password */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Key className="w-3.5 h-3.5 text-brand-orange" />
                Student Portal Password (പോർട്ടൽ പാസ്‌വേഡ്) *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-brand-orange hover:text-[#e55f00] flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3" />
                Generate Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingStudentId ? "Leave blank to keep existing password" : "Enter custom password (or leave blank for student123)"}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              The student will use their <strong>Student ID</strong> (or Email) and this <strong>Password</strong> to log into their own personalized student dashboard.
            </p>
          </div>

          {/* Automatic Google Sheet Integration */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/70 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Automatic Google Sheet Integration
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                Predefined 6-Col Format
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Upon student creation, the system automatically assigns and provisions a dedicated Google Sheet with the standard template:
              <span className="block font-mono text-[10px] mt-1 bg-white/90 p-1.5 rounded border border-emerald-200 text-slate-800 font-semibold overflow-x-auto">
                Exam Name | Subject | Marks Obtained | Total Marks | Percentage | Exam Date
              </span>
            </p>
            {editingStudentId && (
              <div className="mt-2.5 pt-2.5 border-t border-emerald-200/60">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Custom Google Sheet URL (Optional Override)
                </label>
                <input
                  type="url"
                  value={formData.googleSheetUrl}
                  onChange={(e) => setFormData({ ...formData, googleSheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20"
            >
              {editingStudentId ? 'Update Student Details' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Student Profile: ${selectedStudent.name}`}
          subtitle={`ID: ${selectedStudent.studentId}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[11px] text-slate-400">Course</p>
                <p className="text-xs font-bold text-slate-800">{selectedStudent.courseName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Batch</p>
                <p className="text-xs font-bold text-slate-800">{selectedStudent.batchName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Avg Performance</p>
                <p className="text-xs font-bold text-brand-orange">{selectedStudent.averageScore}%</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Attendance</p>
                <p className="text-xs font-bold text-emerald-600">{selectedStudent.attendanceRate}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Personal & Academic Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[11px]">Enrollment Date</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.enrollmentDate}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[11px]">Guardian Details</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.guardianName || 'N/A'} ({selectedStudent.guardianPhone || 'N/A'})
                  </span>
                </div>
              </div>
            </div>

            {selectedStudent.googleSheetUrl && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Google Sheets Auto-Sync Linked
                  </h5>
                  <p className="text-[11px] text-emerald-800 font-mono mt-0.5 truncate max-w-sm">
                    {selectedStudent.googleSheetUrl}
                  </p>
                </div>
                <a
                  href={selectedStudent.googleSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setTaskTargetStudent(null);
        }}
        preselectedStudentId={taskTargetStudent?.studentId}
        preselectedStudentName={taskTargetStudent?.name}
        preselectedBatchId={taskTargetStudent?.batchId}
        creatorRole="ADMIN"
      />

      {/* Comprehensive Student Detail Dashboard & Multi-Time Marks Manager */}
      <StudentDetailDashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => {
          setIsDashboardModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onStudentUpdated={handleStudentUpdated}
        userRole="ADMIN"
      />
    </div>
  );
};
