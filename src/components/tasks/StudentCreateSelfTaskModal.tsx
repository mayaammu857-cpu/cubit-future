import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { tasksApi } from '../../services/api';
import { TaskPriority, TaskType } from '../../types';

interface StudentCreateSelfTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  studentId: string;
  studentName?: string;
}

export const StudentCreateSelfTaskModal: React.FC<StudentCreateSelfTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  studentName,
}) => {
  const { addNotification } = useNotifications();

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [topic, setTopic] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Practice Questions');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
  );
  const [targetQuestions, setTargetQuestions] = useState<number>(25);
  const [targetDuration, setTargetDuration] = useState<number>(45);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [notes, setNotes] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addNotification('warning', 'Please provide a title for your self-study goal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await tasksApi.createTask({
        title: title.trim(),
        instructions: notes.trim() || 'Self-assigned study milestone created by student candidate.',
        subject,
        topic: topic.trim(),
        taskType,
        assignmentTargetType: 'STUDENT',
        targetId: studentId,
        dueDate,
        targetQuestions: Number(targetQuestions) || 0,
        targetDurationMins: Number(targetDuration) || 30,
        priority,
        referenceLinks: referenceLink.trim() ? [referenceLink.trim()] : [],
        teacherRemarks: 'Self-Study Goal',
        createdBy: studentId,
        createdByName: studentName || 'Self-Study Plan',
      });

      addNotification('success', 'Self-study task created! Let’s crush this goal.');
      setTitle('');
      setTopic('');
      setNotes('');
      setReferenceLink('');
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      addNotification('error', 'Failed to create self-study task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Self-Study Target & Task"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        {/* Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-brand-orange/15 to-indigo-500/15 border border-brand-orange/30 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-[12px]">Set Your Personal Academic Goal</p>
            <p className="text-[10px] text-slate-300">
              Create your own practice targets, revision goals, or reading sessions to boost your track record.
            </p>
          </div>
        </div>

        {/* Goal / Title */}
        <div>
          <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
            Goal / Task Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Solve 30 Quadratic Equations & Formulas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        {/* Subject, Topic, Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="Quantitative Aptitude" className="bg-[#070E28]">Quantitative Aptitude</option>
              <option value="Logical Reasoning" className="bg-[#070E28]">Logical Reasoning</option>
              <option value="General Awareness" className="bg-[#070E28]">General Awareness</option>
              <option value="English Language" className="bg-[#070E28]">English Language</option>
              <option value="Physics" className="bg-[#070E28]">Physics</option>
              <option value="Chemistry" className="bg-[#070E28]">Chemistry</option>
              <option value="Mathematics" className="bg-[#070E28]">Mathematics</option>
              <option value="General Studies" className="bg-[#070E28]">General Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Topic / Sub-area</label>
            <input
              type="text"
              placeholder="e.g. Geometry or Speed Math"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Activity Type *</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="Practice Questions" className="bg-[#070E28]">Practice Questions</option>
              <option value="Study" className="bg-[#070E28]">Study Module</option>
              <option value="Revision" className="bg-[#070E28]">Revision Drill</option>
              <option value="Mock Test" className="bg-[#070E28]">Mock Test</option>
              <option value="Reading" className="bg-[#070E28]">Reading Session</option>
              <option value="Assignment" className="bg-[#070E28]">Personal Assignment</option>
            </select>
          </div>
        </div>

        {/* Due Date, Questions, Duration, Priority */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Target Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Target Questions</label>
            <input
              type="number"
              min={0}
              value={targetQuestions}
              onChange={(e) => setTargetQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Target Mins</label>
            <input
              type="number"
              min={5}
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="High" className="bg-[#070E28]">High</option>
              <option value="Medium" className="bg-[#070E28]">Medium</option>
              <option value="Low" className="bg-[#070E28]">Low</option>
            </select>
          </div>
        </div>

        {/* Notes & Motivation */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
            Personal Notes &amp; Strategy (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Key formulas to remember, book chapters, or areas you want to concentrate on..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        {/* Reference URL */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
            Study Resource URL / Drive Link (Optional)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={referenceLink}
            onChange={(e) => setReferenceLink(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold hover:bg-white/15 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white text-xs font-bold shadow-lg shadow-brand-orange/20 transition flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Adding Goal...' : 'Add Self-Study Task'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
