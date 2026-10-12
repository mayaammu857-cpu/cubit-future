import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Send,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Users,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { studyPlansApi, teachersApi, coursesApi } from '../../services/api';
import { StudyPlan, Batch, Course } from '../../types';
import { Modal } from '../../components/common/Modal';

export const TeacherStudyPlansPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<StudyPlan | null>(null);
  const [assignBatchId, setAssignBatchId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        studyPlansApi.listPlans(),
        teachersApi.getTeacherBatches('tch-001'),
        coursesApi.getAll(),
      ]);
      setPlans(pRes.plans || []);
      setBatches(bRes.batches || []);
      setCourses(cRes || []);
      if (bRes.batches && bRes.batches.length > 0) {
        setAssignBatchId(bRes.batches[0].id);
      }
    } catch {
      addNotification('error', 'Could not fetch study plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = (tmpl: StudyPlan) => {
    setSelectedTemplate(tmpl);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !assignBatchId) return;

    setIsAssigning(true);
    try {
      const res = await studyPlansApi.assignPlan({
        templatePlanId: selectedTemplate.id,
        targetType: 'BATCH',
        targetId: assignBatchId,
      });

      addNotification(
        'success',
        `Study plan assigned to batch! Generated ${res.assignedStudentsCount} individual task queues.`
      );
      setIsAssignModalOpen(false);
      await fetchData();
    } catch {
      addNotification('error', 'Failed to assign study plan.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Digital Study Plans Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build day-by-day learning schedules and assign templates across cohort batches
          </p>
        </div>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-3xl bg-[#070E28] border border-[#162758] flex flex-col justify-between shadow-xl space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-orange/20 text-brand-orange border border-brand-orange/40">
                  {p.isTemplate ? 'Reusable Template' : 'Assigned Plan'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {p.schedule?.length || 6} Days Schedule
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{p.description}</p>
              </div>

              {/* Day Highlights Preview */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Daily Topics Outline:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {p.schedule?.slice(0, 4).map((d) => (
                    <div
                      key={d.day}
                      className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <span className="font-bold text-white text-[11px] truncate">{d.day}</span>
                      <span className="text-[10px] text-brand-orange truncate">{d.subject}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Course: {p.courseName || 'Banking'}</span>

              <button
                type="button"
                onClick={() => handleOpenAssign(p)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#E55F00] hover:to-[#EA7D29] text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Assign to Batch</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Template Modal */}
      {selectedTemplate && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Plan: ${selectedTemplate.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs text-slate-300">
            <p className="text-xs text-slate-300 leading-relaxed">
              Assigning this study-plan template will automatically generate individual, trackable daily task records for every student in the selected batch.
            </p>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Select Target Cohort Batch *
              </label>
              <select
                value={assignBatchId}
                onChange={(e) => setAssignBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-[#040815] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#070E28]">
                    {b.name} ({b.studentCount} active students)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold hover:bg-white/15 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssigning}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAssigning ? 'Assigning...' : 'Confirm & Deploy Schedule'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherStudyPlansPage;
