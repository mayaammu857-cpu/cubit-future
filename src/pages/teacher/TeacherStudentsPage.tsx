import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Award,
  CheckSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  Mail,
  Phone,
  Layers,
  Sparkles,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { teachersApi } from '../../services/api';
import { Batch } from '../../types';
import { AssignTaskModal } from '../../components/tasks/AssignTaskModal';
import { StudentDetailDashboardModal } from '../../components/students/StudentDetailDashboardModal';

export const TeacherStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, teacher } = useAuth();
  const teacherId = teacher?.id || user?.id || 'tch-001';

  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchFilter, setBatchFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [taskTargetStudent, setTaskTargetStudent] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);

  const handleStudentUpdated = (updatedStu: any) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStu.id || s.studentId === updatedStu.studentId ? { ...s, ...updatedStu } : s))
    );
    setSelectedStudent(updatedStu);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sRes, bRes] = await Promise.all([
          teachersApi.getTeacherStudents(teacherId),
          teachersApi.getTeacherBatches(teacherId),
        ]);
        setStudents(sRes.students || []);
        setBatches(bRes.batches || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  const filteredStudents = students.filter((s) => {
    if (batchFilter && s.batchId !== batchFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Assigned Students Directory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enrolled aspirants across your assigned cohort batches with task submission indicators
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#070E28] border border-[#162758] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
          >
            <option value="" className="bg-[#070E28]">All Assigned Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#070E28]">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-3xl border border-[#162758] bg-[#070E28] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#091438] text-slate-300 uppercase text-[10px] font-bold border-b border-white/10">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Batch / Course</th>
              <th className="p-4">Average Exam Score</th>
              <th className="p-4">Approved Tasks</th>
              <th className="p-4">Under Review</th>
              <th className="p-4">Attendance</th>
              <th className="p-4 text-right">Progress Card</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-white/[0.02] transition">
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(s);
                        setIsDashboardModalOpen(true);
                      }}
                      className="text-left group"
                      title="Open Student Dashboard & Enter Marks"
                    >
                      <p className="font-bold text-white group-hover:text-brand-orange transition flex items-center gap-1">
                        <span>{s.name}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-orange transition" />
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.studentId}</p>
                    </button>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{s.batchName}</p>
                    <p className="text-[10px] text-slate-400">{s.courseName}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-brand-orange text-sm">{s.averageScore}%</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      {s.approvedTasks || 0} Complete
                    </span>
                  </td>
                  <td className="p-4">
                    {(s.submittedTasks || 0) > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 animate-pulse">
                        {s.submittedTasks} Pending
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">0</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-white">{s.attendanceRate}%</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 ml-auto">
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setIsDashboardModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
                        title="Student Dashboard & Add Marks (ഡാഷ്‌ബോർഡും മാർക്കുകളും)"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Dashboard & Marks</span>
                      </button>
                      <button
                        onClick={() => {
                          setTaskTargetStudent(s);
                          setIsAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-bold text-xs flex items-center gap-1.5 transition"
                        title="Assign Academic Task to Student"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-brand-orange" />
                        <span>Assign Task</span>
                      </button>
                      <button
                        onClick={() => navigate('/teacher/progress-cards')}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Award className="w-3.5 h-3.5 text-brand-orange" />
                        <span>View Card</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
        creatorRole="TEACHER"
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
        userRole="TEACHER"
      />
    </div>
  );
};

export default TeacherStudentsPage;
