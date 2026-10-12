import React, { useState, useEffect } from 'react';
import {
  Send,
  User,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { tasksApi, batchesApi, studentApi } from '../../services/api';
import { Batch, Student, TaskPriority, TaskType } from '../../types';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedStudentId?: string;
  preselectedStudentName?: string;
  preselectedBatchId?: string;
  creatorRole?: 'ADMIN' | 'TEACHER';
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedStudentId,
  preselectedStudentName,
  preselectedBatchId,
  creatorRole = 'ADMIN',
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [topic, setTopic] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Practice Questions');
  const [targetType, setTargetType] = useState<'BATCH' | 'STUDENT'>(
    preselectedStudentId ? 'STUDENT' : 'BATCH'
  );
  const [targetId, setTargetId] = useState(preselectedStudentId || preselectedBatchId || '');
  const [studentSearch, setStudentSearch] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [targetQuestions, setTargetQuestions] = useState<number>(30);
  const [targetDuration, setTargetDuration] = useState<number>(45);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [referenceLink, setReferenceLink] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setLoadingResources(true);
        try {
          const [bRes, sRes] = await Promise.all([
            batchesApi.getAll().catch(() => []),
            studentApi.getStudents({ limit: 200 }).catch(() => ({ items: [] })),
          ]);
          setBatches(bRes || []);
          setStudents(sRes.items || []);

          if (preselectedStudentId) {
            setTargetType('STUDENT');
            setTargetId(preselectedStudentId);
          } else if (preselectedBatchId) {
            setTargetType('BATCH');
            setTargetId(preselectedBatchId);
          } else if (bRes && bRes.length > 0 && !targetId) {
            setTargetId(bRes[0].id);
          }
        } finally {
          setLoadingResources(false);
        }
      };
      loadData();
    }
  }, [isOpen, preselectedStudentId, preselectedBatchId]);

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.batchName?.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addNotification('warning', 'Please enter a task title.');
      return;
    }
    if (!targetId) {
      addNotification('warning', 'Please select a student or batch target.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await tasksApi.createTask({
        title: title.trim(),
        instructions: instructions.trim(),
        subject,
        topic: topic.trim(),
        taskType,
        assignmentTargetType: targetType,
        targetId,
        dueDate,
        targetQuestions: Number(targetQuestions) || 0,
        targetDurationMins: Number(targetDuration) || 30,
        priority,
        referenceLinks: referenceLink.trim() ? [referenceLink.trim()] : [],
        teacherRemarks: remarks.trim(),
        createdBy: user?.id || (creatorRole === 'ADMIN' ? 'admin' : 'teacher'),
        createdByName: user?.name || (creatorRole === 'ADMIN' ? 'Academy Administrator' : 'Faculty Mentor'),
      });

      addNotification('success', res.message || `Task successfully assigned!`);
      // Reset form
      setTitle('');
      setInstructions('');
      setTopic('');
      setRemarks('');
      setReferenceLink('');
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      addNotification('error', 'Failed to assign task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        preselectedStudentName
          ? `Assign Task to ${preselectedStudentName}`
          : 'Assign Academic Task & Deliverable'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        {/* Title */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
            Task Title &amp; Core Objective *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Quantitative Aptitude: Work & Time Problems Set 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        {/* Target Selector */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-brand-orange font-bold uppercase tracking-wider">
              Assignment Target
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="assignTargetType"
                  checked={targetType === 'STUDENT'}
                  onChange={() => {
                    setTargetType('STUDENT');
                    if (students.length > 0 && !preselectedStudentId) {
                      setTargetId(students[0].studentId);
                    }
                  }}
                  className="accent-[#FF9500]"
                />
                <span className="text-white font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-orange" />
                  Individual Student
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="assignTargetType"
                  checked={targetType === 'BATCH'}
                  onChange={() => {
                    setTargetType('BATCH');
                    if (batches.length > 0) setTargetId(batches[0].id);
                  }}
                  className="accent-[#FF9500]"
                />
                <span className="text-white font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Entire Batch
                </span>
              </label>
            </div>
          </div>

          {targetType === 'BATCH' ? (
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Select Batch</label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-[#040815] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#070E28]">
                    {b.name} ({b.studentCount || 0} students) &bull; {b.courseName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400">Select Student Candidate</label>
                <input
                  type="text"
                  placeholder="Filter by student name / ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange w-48"
                />
              </div>

              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-[#040815] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              >
                <option value="">-- Choose Student --</option>
                {filteredStudents.map((s) => (
                  <option key={s.studentId} value={s.studentId} className="bg-[#070E28]">
                    {s.name} ({s.studentId}) &bull; {s.batchName || s.courseName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Subject, Topic, Task Type */}
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
              placeholder="e.g. Syllogisms or Percentages"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Task Type *</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="Practice Questions" className="bg-[#070E28]">Practice Questions</option>
              <option value="Study" className="bg-[#070E28]">Study Module</option>
              <option value="Revision" className="bg-[#070E28]">Revision Drill</option>
              <option value="Mock Test" className="bg-[#070E28]">Mock Test</option>
              <option value="Assignment" className="bg-[#070E28]">Assignment</option>
              <option value="Reading" className="bg-[#070E28]">Reading Passage</option>
              <option value="Custom" className="bg-[#070E28]">Custom Goal</option>
            </select>
          </div>
        </div>

        {/* Priority, Due Date, Targets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="Low" className="bg-[#070E28]">Low</option>
              <option value="Medium" className="bg-[#070E28]">Medium</option>
              <option value="High" className="bg-[#070E28]">High</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Due Date *</label>
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
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Target Duration (Mins)</label>
            <input
              type="number"
              min={10}
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
            Task Guidelines &amp; Specific Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Specify problem numbers, page references, or submission expectations..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
          />
        </div>

        {/* Reference Link & Remarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Reference / Material Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={referenceLink}
              onChange={(e) => setReferenceLink(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Faculty / Admin Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on accuracy over speed"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
            />
          </div>
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
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Assigning Task...' : 'Assign Task Now'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
