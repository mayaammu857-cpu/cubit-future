import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Clock,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { batchApi, courseApi } from '../../services/api';
import { Batch, Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export const AdminBatches: React.FC = () => {
  const { addNotification } = useNotification();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    courseId: '',
    startDate: new Date().toISOString().split('T')[0],
    studentCount: 0,
    activeExamsCount: 0,
    attendanceRate: 90,
    status: 'ACTIVE' as const,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batRes, crsRes] = await Promise.all([batchApi.getAll(), courseApi.getAll()]);
      setBatches(batRes);
      setCourses(crsRes);
      if (crsRes.length > 0 && !formData.courseId) {
        setFormData((prev) => ({ ...prev, courseId: crsRes[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find((c) => c.id === formData.courseId);
      await batchApi.create({
        ...formData,
        courseName: selectedCourse?.name || 'General Program',
      });
      addNotification('success', 'Batch created successfully!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        courseId: courses[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        studentCount: 0,
        activeExamsCount: 0,
        attendanceRate: 90,
        status: 'ACTIVE',
      });
      await fetchData();
    } catch {
      addNotification('error', 'Failed to create batch.');
    }
  };

  const handleDeleteBatch = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete batch "${name}"?`)) return;
    try {
      await batchApi.delete(id);
      addNotification('success', `Batch "${name}" deleted successfully.`);
      await fetchData();
    } catch {
      addNotification('error', 'Failed to delete batch.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-orange" />
            Batch Management & Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor cohorts, schedule exam cycles, and track attendance thresholds
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Batch
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="col-span-full py-14 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-navy">No Batches Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Set up student cohorts with start dates, attendance tracking, and linked curriculum courses.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition"
            >
              + Create New Batch
            </button>
          </div>
        ) : (
          batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600">
                    {batch.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${batch.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : batch.status === 'UPCOMING'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {batch.status}
                    </span>
                    <button
                      onClick={() => handleDeleteBatch(batch.id, batch.name)}
                      title="Delete batch"
                      className="p-1 text-slate-400 hover:text-red-500 transition rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{batch.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
                  {batch.courseName}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Students</p>
                    <p className="text-xs font-bold text-slate-800">{batch.studentCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Attendance</p>
                    <p className="text-xs font-bold text-emerald-600">{batch.attendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Exams</p>
                    <p className="text-xs font-bold text-brand-orange">{batch.activeExamsCount}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Started: {batch.startDate}
                </span>
                <span className="font-semibold text-brand-navy">
                  Cohort Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Batch"
        subtitle="Define cohort naming, start date and program affiliation"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Morning Medical Masters 2026-A"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. BATCH-2026-03"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Affiliated Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cohort Start Date *</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20"
            >
              Save Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
