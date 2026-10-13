import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  Users,
  Send,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Eye,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { tasksApi, teachersApi, studentApi } from '../../services/api';
import { TaskAssignment, Batch, TaskType, TaskPriority } from '../../types';
import { Modal } from '../../components/common/Modal';

export const TeacherTasksPage: React.FC = () => {
  const { user, teacher } = useAuth();
  const { addNotification } = useNotifications();
  const teacherId = teacher?.id || user?.id || 'tch-001';

  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [batchFilter, setBatchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskAssignment | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Task Creation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newSubject, setNewSubject] = useState('Quantitative Aptitude');
  const [newTopic, setNewTopic] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('Practice Questions');
  const [newTargetType, setNewTargetType] = useState<'BATCH' | 'STUDENT'>('BATCH');
  const [newTargetId, setNewTargetId] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [newTargetQuestions, setNewTargetQuestions] = useState<number>(30);
  const [newTargetDuration, setNewTargetDuration] = useState<number>(45);
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newReferenceLink, setNewReferenceLink] = useState('');
  const [newRemarks, setNewRemarks] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Review Submission State
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes, sRes] = await Promise.all([
        tasksApi.listTasks({
          batchId: batchFilter || undefined,
          status: statusFilter || undefined,
          subject: subjectFilter || undefined,
        }),
        teachersApi.getTeacherBatches(teacherId),
        studentApi.getStudents({ limit: 100 }),
      ]);
      setTasks(tRes.tasks || []);
      setBatches(bRes.batches || []);
      setStudents(sRes.items || []);
      if (bRes.batches && bRes.batches.length > 0 && !newTargetId) {
        setNewTargetId(bRes.batches[0].id);
      }
    } catch {
      addNotification('error', 'Failed to load task assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchFilter, statusFilter, subjectFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addNotification('warning', 'Please provide a task title.');
      return;
    }
    if (!newTargetId) {
      addNotification('warning', 'Please select a batch or student target.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await tasksApi.createTask({
        title: newTitle.trim(),
        instructions: newInstructions.trim(),
        subject: newSubject,
        topic: newTopic.trim(),
        taskType: newTaskType,
        assignmentTargetType: newTargetType,
        targetId: newTargetId,
        dueDate: newDueDate,
        targetQuestions: newTargetQuestions,
        targetDurationMins: newTargetDuration,
        priority: newPriority,
        referenceLinks: newReferenceLink.trim() ? [newReferenceLink.trim()] : [],
        teacherRemarks: newRemarks.trim(),
        createdBy: user?.id || 'user-tch-001',
        createdByName: user?.name || 'Prof. Sarah Mathews',
      });

      addNotification('success', `Task successfully assigned to ${res.assignedCount} student(s)!`);
      setIsCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewInstructions('');
      setNewTopic('');
      setNewRemarks('');
      await fetchData();
    } catch {
      addNotification('error', 'Failed to create task assignment.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenReview = async (t: TaskAssignment) => {
    setSelectedTask(t);
    setReviewFeedback(t.teacherFeedback || '');
    setRevisionInstructions(t.revisionInstructions || '');
    setIsReviewModalOpen(true);
    try {
      const h = await tasksApi.getTaskHistory(t.assignmentId);
      setHistoryList(h.history || []);
    } catch {
      setHistoryList([]);
    }
  };

  const handleReviewAction = async (action: 'APPROVE' | 'REQUEST_REVISION' | 'REOPEN') => {
    if (!selectedTask) return;
    setIsReviewing(true);
    try {
      await tasksApi.reviewTask(selectedTask.assignmentId, {
        action,
        teacherFeedback: reviewFeedback,
        revisionInstructions: action === 'REQUEST_REVISION' ? revisionInstructions : undefined,
        reviewedBy: user?.name || 'Prof. Sarah Mathews',
      });
      addNotification(
        'success',
        action === 'APPROVE'
          ? 'Task verified and marked Approved.'
          : action === 'REQUEST_REVISION'
          ? 'Revision request dispatched to student.'
          : 'Task reopened.'
      );
      setIsReviewModalOpen(false);
      await fetchData();
    } catch {
      addNotification('error', 'Action failed.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSendReminder = async (assignmentId: string, studentName: string) => {
    try {
      await tasksApi.sendReminder(assignmentId);
      addNotification('success', `Deadline reminder sent to ${studentName}.`);
    } catch {
      addNotification('error', 'Could not send reminder.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.studentName.toLowerCase().includes(q) ||
      t.studentId.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Task Management &amp; Review</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assign individual deliverables, review student submissions, verify question counts, and approve completion
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#E55F00] hover:to-[#EA7D29] text-white text-xs font-bold shadow-lg shadow-brand-orange/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create &amp; Assign New Task</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#070E28] border border-[#162758] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Cohort Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
          >
            <option value="" className="bg-[#070E28]">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#070E28]">
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
          >
            <option value="" className="bg-[#070E28]">All Statuses</option>
            <option value="SUBMITTED" className="bg-[#070E28]">Submitted for Review</option>
            <option value="IN_PROGRESS" className="bg-[#070E28]">In Progress</option>
            <option value="APPROVED" className="bg-[#070E28]">Approved &amp; Completed</option>
            <option value="REVISION_REQUIRED" className="bg-[#070E28]">Revision Required</option>
            <option value="OVERDUE" className="bg-[#070E28]">Overdue</option>
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
          >
            <option value="" className="bg-[#070E28]">All Subjects</option>
            <option value="Quantitative Aptitude" className="bg-[#070E28]">Quantitative Aptitude</option>
            <option value="Logical Reasoning" className="bg-[#070E28]">Logical Reasoning</option>
            <option value="Financial Awareness" className="bg-[#070E28]">Financial Awareness</option>
            <option value="English Verbal" className="bg-[#070E28]">English Verbal</option>
            <option value="Comprehensive Assessment" className="bg-[#070E28]">Comprehensive Assessment</option>
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, task title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto rounded-3xl border border-[#162758] bg-[#070E28] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#091438] text-slate-300 uppercase text-[10px] font-bold border-b border-white/10">
            <tr>
              <th className="p-4">Student &amp; Cohort</th>
              <th className="p-4">Task Deliverable</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Progress / Qs</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No matching tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t.assignmentId} className="hover:bg-white/[0.02] transition">
                  <td className="p-4">
                    <p className="font-bold text-white">{t.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{t.studentId}</p>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-white truncate">{t.title}</p>
                    {t.topic && <p className="text-[10px] text-slate-400 truncate">{t.topic}</p>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-brand-orange font-bold text-[10px]">
                      {t.subject}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-[11px]">
                      <p className="font-bold text-white">
                        {t.completedQuestions} / {t.targetQuestions} Qs
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t.actualStudyMins}m logged
                      </p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-300">{t.dueDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'SUBMITTED'
                          ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                          : t.status === 'REVISION_REQUIRED'
                          ? 'bg-purple-500/20 text-purple-300'
                          : t.status === 'OVERDUE'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenReview(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          t.status === 'SUBMITTED'
                            ? 'bg-gradient-to-r from-brand-orange to-[#FF7700] text-white shadow-md shadow-brand-orange/20'
                            : 'bg-white/10 hover:bg-white/15 text-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.status === 'SUBMITTED' ? 'Review & Verify' : 'View Details'}</span>
                      </button>

                      {t.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleSendReminder(t.assignmentId, t.studentName)}
                          title="Send Deadline Reminder"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 transition"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CREATE TASK ASSIGNMENT                                */}
      {/* ============================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create & Assign Academic Task"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Percentages & Fractional Equivalents"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Subject *
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              >
                <option value="Quantitative Aptitude" className="bg-[#070E28]">Quantitative Aptitude</option>
                <option value="Logical Reasoning" className="bg-[#070E28]">Logical Reasoning</option>
                <option value="Financial Awareness" className="bg-[#070E28]">Financial Awareness</option>
                <option value="English Verbal" className="bg-[#070E28]">English Verbal</option>
                <option value="Comprehensive Assessment" className="bg-[#070E28]">Comprehensive Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Topic / Chapter
              </label>
              <input
                type="text"
                placeholder="e.g. Arithmetic - Percentages Module 3"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Task Type
              </label>
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              >
                <option value="Study" className="bg-[#070E28]">Study</option>
                <option value="Revision" className="bg-[#070E28]">Revision</option>
                <option value="Practice Questions" className="bg-[#070E28]">Practice Questions</option>
                <option value="Mock Test" className="bg-[#070E28]">Mock Test</option>
                <option value="Assignment" className="bg-[#070E28]">Assignment</option>
                <option value="Reading" className="bg-[#070E28]">Reading</option>
                <option value="Custom" className="bg-[#070E28]">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              >
                <option value="Low" className="bg-[#070E28]">Low</option>
                <option value="Medium" className="bg-[#070E28]">Medium</option>
                <option value="High" className="bg-[#070E28]">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Assignment Scope */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <label className="block text-[11px] text-brand-orange font-bold uppercase tracking-wider">
              Assign Target
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={newTargetType === 'BATCH'}
                  onChange={() => setNewTargetType('BATCH')}
                  className="accent-[#FF9500]"
                />
                <span className="text-white font-bold">Entire Batch</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={newTargetType === 'STUDENT'}
                  onChange={() => setNewTargetType('STUDENT')}
                  className="accent-[#FF9500]"
                />
                <span className="text-white font-bold">Single Student</span>
              </label>
            </div>

            {newTargetType === 'BATCH' ? (
              <select
                value={newTargetId}
                onChange={(e) => setNewTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-[#040815] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange mt-2"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#070E28]">
                    {b.name} ({b.studentCount} students)
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={newTargetId}
                onChange={(e) => setNewTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-[#040815] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange mt-2"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId} className="bg-[#070E28]">
                    {s.name} ({s.studentId} &bull; {s.batchName})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Target Questions
              </label>
              <input
                type="number"
                min={0}
                value={newTargetQuestions}
                onChange={(e) => setNewTargetQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Target Duration (Minutes)
              </label>
              <input
                type="number"
                min={10}
                value={newTargetDuration}
                onChange={(e) => setNewTargetDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Detailed Instructions &amp; Task Guidelines
            </label>
            <textarea
              rows={3}
              placeholder="Explain the required steps, question sets, or reference chapters..."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Reference Links / Material URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://cubitfuture.com/handouts/module3.pdf"
              value={newReferenceLink}
              onChange={(e) => setNewReferenceLink(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold hover:bg-white/15 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isCreating ? 'Assigning...' : 'Save & Assign Task'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: REVIEW SUBMISSION & AUDIT TRAIL                       */}
      {/* ============================================================== */}
      {selectedTask && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Task Submission: ${selectedTask.title}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-slate-300 text-xs">
            {/* Student & Task Overview */}
            <div className="p-4 rounded-xl bg-[#091438] border border-[#172B80] flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Student Candidate</p>
                <p className="text-sm font-bold text-white">
                  {selectedTask.studentName} ({selectedTask.studentId})
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {selectedTask.subject} &bull; Due: {selectedTask.dueDate}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Current State</p>
                <p className="text-sm font-bold text-brand-orange">{selectedTask.status}</p>
              </div>
            </div>

            {/* Student's Reported Progress Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-slate-400">Actual Study Time</p>
                <p className="text-base font-black text-white mt-0.5">
                  {selectedTask.actualStudyMins} mins
                </p>
                <p className="text-[10px] text-slate-500">Target: {selectedTask.targetDurationMins}m</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-slate-400">Completed Questions</p>
                <p className="text-base font-black text-white mt-0.5">
                  {selectedTask.completedQuestions} Qs
                </p>
                <p className="text-[10px] text-slate-500">Target: {selectedTask.targetQuestions} Qs</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-400">Revision Cycles</p>
                <p className="text-base font-black text-purple-400 mt-0.5">
                  #{selectedTask.revisionCount}
                </p>
                <p className="text-[10px] text-slate-500">Total revisions</p>
              </div>
            </div>

            {/* Student Submission Notes */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">
                Student Notes / Summary of Work
              </h4>
              <p className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed whitespace-pre-wrap">
                {selectedTask.studentNotes || 'No notes provided by student.'}
              </p>
            </div>

            {/* Submission Evidence Link if provided */}
            {selectedTask.submissionEvidence && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Student Assignment Evidence:</span>
                <a
                  href={selectedTask.submissionEvidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Attached Document / Link</span>
                </a>
              </div>
            )}

            {/* Teacher Review Actions */}
            <div className="p-4 rounded-xl bg-[#070D24] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-orange" /> Faculty Review &amp; Remarks
              </h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Teacher Feedback &amp; Commendations
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter comments on performance, speed, accuracy..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Specific Revision Instructions (if requesting revision)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please recalculate Question 14 using shortcut approximation and resubmit."
                  value={revisionInstructions}
                  onChange={(e) => setRevisionInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('REOPEN')}
                  disabled={isReviewing}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition"
                >
                  Reopen Task
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction('REQUEST_REVISION')}
                  disabled={isReviewing}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Revision</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction('APPROVE')}
                  disabled={isReviewing}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve &amp; Verify Complete</span>
                </button>
              </div>
            </div>

            {/* Task Activity History / Audit Trail */}
            {historyList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Trail &amp; Activity Log
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {historyList.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg bg-white/[0.03] text-[11px] flex items-center justify-between text-slate-300"
                    >
                      <div>
                        <span className="font-bold text-white">{h.action}</span> by{' '}
                        <span className="text-brand-orange">{h.performedBy}</span> ({h.role}):{' '}
                        <span className="text-slate-400">{h.details}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{h.timestamp?.slice(11, 16)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherTasksPage;
