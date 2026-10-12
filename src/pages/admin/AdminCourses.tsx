import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  Award,
  Users,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { coursesApi } from '../../services/api';
import { Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';

export const AdminCourses: React.FC = () => {
  const { addNotification } = useNotifications();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    durationMonths: 6,
    totalModules: 12,
    activeBatchesCount: 1,
    status: 'ACTIVE' as const,
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await coursesApi.getAll();
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await coursesApi.create(formData);
      addNotification('success', 'New course curriculum created!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        durationMonths: 6,
        totalModules: 12,
        activeBatchesCount: 1,
        status: 'ACTIVE',
      });
      await fetchCourses();
    } catch {
      addNotification('error', 'Failed to create course.');
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${name}"?`)) return;
    try {
      await coursesApi.delete(id);
      addNotification('success', `Course "${name}" deleted successfully.`);
      await fetchCourses();
    } catch {
      addNotification('error', 'Failed to delete course.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-orange" />
            Curriculum & Courses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain academic qualifications, syllabus modularity, and active enrollments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Program
        </button>
      </div>

      {/* Courses List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-14 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-navy">No Academic Programs Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Start building your academy curriculum by creating programs with specific modules, certifications, and duration.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition"
            >
              + Add New Program
            </button>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-navy/5 font-bold text-brand-navy">
                    {course.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {course.status}
                    </span>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.name)}
                      title="Delete course"
                      className="p-1 text-slate-400 hover:text-red-500 transition rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Duration</p>
                    <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-brand-orange" /> {course.durationMonths} Mos
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Total Modules</p>
                    <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" /> {course.totalModules} Units
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {course.activeBatchesCount} Active Batches
                </span>
                <span className="font-semibold text-brand-navy">
                  Curriculum Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Academic Program"
        subtitle="Establish syllabus structure and completion requirements"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. USMLE Step 1 Clinical High-Yield"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CRS-USMLE-01"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Months) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Summary</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline learning milestones and clinical objectives..."
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
              Save Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
