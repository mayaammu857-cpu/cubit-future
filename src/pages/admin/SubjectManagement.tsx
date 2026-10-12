import React, { useState, useEffect, useMemo } from 'react';
import {
  BookmarkCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { subjectApi, courseApi } from '../../services/api';
import { Subject, Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';

export const SubjectManagement: React.FC = () => {
  const { addNotification } = useNotifications();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    courseId: '',
    maxMarks: 100,
    passPercentage: 50,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subData, courseData] = await Promise.all([
        subjectApi.getAll(),
        courseApi.getAll(),
      ]);
      setSubjects(subData);
      setCourses(courseData);
      if (courseData.length > 0 && !formData.courseId) {
        setFormData((prev) => ({ ...prev, courseId: courseData[0].id }));
      }
    } catch {
      addNotification('error', 'Failed to load subject inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.courseName.toLowerCase().includes(q);
      const matchCourse = !courseFilter || s.courseId === courseFilter;
      return matchSearch && matchCourse;
    });
  }, [subjects, search, courseFilter]);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      courseId: courses[0]?.id || '',
      maxMarks: 100,
      passPercentage: 50,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      courseId: sub.courseId,
      maxMarks: sub.maxMarks,
      passPercentage: sub.passPercentage,
      status: sub.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingSubject) {
        await subjectApi.update(editingSubject.id, formData);
        addNotification('success', `Subject ${formData.name} updated.`);
      } else {
        await subjectApi.create(formData);
        addNotification('success', `Subject ${formData.name} added to curriculum.`);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      addNotification('error', err?.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await subjectApi.delete(id);
        addNotification('info', `Subject ${name} removed.`);
        await fetchData();
      } catch {
        addNotification('error', 'Failed to delete subject.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-brand-orange" />
            Curriculum & Subject Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure examination modules, maximum benchmarks, and syllabus weighting
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Curriculum Subject
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject name or course code..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Academic Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Subject Module</th>
                <th className="py-3.5 px-5">Subject Code</th>
                <th className="py-3.5 px-5">Enrolled Course</th>
                <th className="py-3.5 px-5">Max Score</th>
                <th className="py-3.5 px-5">Passing Threshold</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading curriculum subjects...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No subjects configured yet.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3.5 px-5 font-mono text-brand-navy font-semibold">{sub.code}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{sub.courseName}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{sub.maxMarks} Marks</td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-brand-orange">{sub.passPercentage}%</span> (Min{' '}
                      {Math.round((sub.maxMarks * sub.passPercentage) / 100)})
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sub.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Subject"
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
      </div>

      {/* Modal for Creating / Editing Subject */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Curriculum Subject' : 'Add Curriculum Subject'}
        subtitle="Define examination grading parameters and assigned courses"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Quantitative Aptitude"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. QA-101"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program / Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 text-slate-800"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Marks *</label>
              <input
                type="number"
                min={10}
                max={500}
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Percentage (%) *</label>
              <input
                type="number"
                min={20}
                max={100}
                required
                value={formData.passPercentage}
                onChange={(e) => setFormData({ ...formData, passPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 text-slate-800"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
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
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
