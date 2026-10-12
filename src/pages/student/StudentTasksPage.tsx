import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  RefreshCw,
  Search,
  Filter,
  FileText,
  ExternalLink,
  MessageSquare,
  Play,
  Send,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { tasksApi } from '../../services/api';
import { TaskAssignment, TaskAssignmentStatus, TaskPriority } from '../../types';
import { Modal } from '../../components/common/Modal';

export const StudentTasksPage: React.FC = () => {
  const { student, user } = useAuth();
  const { addNotification } = useNotifications();

  const studentId = student?.studentId || 'CF-STU-0001';

  const [activeTab, setActiveTab] = useState<
    'TODAY' | 'UPCOMING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'OVERDUE' | 'ALL'
  >('TODAY');
  const [tasks, setTasks] = useState<{
    allTasks: TaskAssignment[];
    todayTasks: TaskAssignment[];
    upcomingTasks: TaskAssignment[];
    inProgressTasks: TaskAssignment[];
    submittedTasks: TaskAssignment[];
    completedTasks: TaskAssignment[];
    overdueTasks: TaskAssignment[];
    revisionTasks: TaskAssignment[];
    summary: any;
  }>({
    allTasks: [],
    todayTasks: [],
    upcomingTasks: [],
    inProgressTasks: [],
    submittedTasks: [],
    completedTasks: [],
    overdueTasks: [],
    revisionTasks: [],
    summary: { total: 0, completed: 0, submitted: 0, inProgress: 0, overdue: 0, completionRate: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Task Modal State
  const [selectedTask, setSelectedTask] = useState<TaskAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Update / Submit
  const [studyMins, setStudyMins] = useState<number>(0);
  const [questionsDone, setQuestionsDone] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [evidenceLink, setEvidenceLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getStudentTasks(studentId);
      setTasks(data);
    } catch {
      addNotification('error', 'Could not load student task assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [studentId]);

  const handleOpenTask = (task: TaskAssignment) => {
    setSelectedTask(task);
    setStudyMins(task.actualStudyMins || 0);
    setQuestionsDone(task.completedQuestions || 0);
    setNotes(task.studentNotes || '');
    setEvidenceLink(task.submissionEvidence || '');
    setIsModalOpen(true);
  };

  const handleStartTask = async () => {
    if (!selectedTask) return;
    try {
      await tasksApi.updateProgress(selectedTask.assignmentId, {
        status: 'IN_PROGRESS',
        actualStudyMins: Math.max(selectedTask.actualStudyMins || 0, 10),
      });
      addNotification('success', 'Task started! Status is now In Progress.');
      await fetchTasks();
      setIsModalOpen(false);
    } catch {
      addNotification('error', 'Failed to update task state.');
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await tasksApi.updateProgress(selectedTask.assignmentId, {
        actualStudyMins: studyMins,
        completedQuestions: questionsDone,
        studentNotes: notes,
        status: 'IN_PROGRESS',
      });
      addNotification('success', 'Study progress saved.');
      await fetchTasks();
      setIsModalOpen(false);
    } catch {
      addNotification('error', 'Failed to save progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await tasksApi.submitTask(selectedTask.assignmentId, {
        actualStudyMins: studyMins,
        completedQuestions: questionsDone,
        studentNotes: notes,
        submissionEvidence: evidenceLink,
      });
      addNotification('success', 'Task submitted to faculty for review and verification!');
      await fetchTasks();
      setIsModalOpen(false);
    } catch {
      addNotification('error', 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Tasks by Active Tab
  const getTabFilteredTasks = (): TaskAssignment[] => {
    let list: TaskAssignment[] = [];
    switch (activeTab) {
      case 'TODAY':
        list = tasks.todayTasks;
        break;
      case 'UPCOMING':
        list = tasks.upcomingTasks;
        break;
      case 'IN_PROGRESS':
        list = tasks.inProgressTasks;
        break;
      case 'SUBMITTED':
        list = tasks.submittedTasks;
        break;
      case 'COMPLETED':
        list = tasks.completedTasks;
        break;
      case 'OVERDUE':
        list = tasks.overdueTasks;
        break;
      case 'ALL':
      default:
        list = tasks.allTasks;
        break;
    }

    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.topic && t.topic.toLowerCase().includes(q))
    );
  };

  const displayedTasks = getTabFilteredTasks();

  const getStatusBadge = (st: TaskAssignmentStatus) => {
    switch (st) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved &amp; Completed
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
            <Hourglass className="w-3 h-3" /> Submitted for Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Play className="w-3 h-3" /> In Progress
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Revision Required
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      case 'ASSIGNED':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Not Started
          </span>
        );
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">My Academic Tasks</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Daily study targets, problem sets, and assignments assigned by faculty mentor
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Task Statistics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#091438] border border-[#172B80]/40">
          <p className="text-[11px] text-slate-400">Total Assigned</p>
          <p className="text-xl font-black text-white mt-0.5">{tasks.summary.total}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091438] border border-emerald-500/30">
          <p className="text-[11px] text-emerald-400">Approved Complete</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{tasks.summary.completed}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091438] border border-blue-500/30">
          <p className="text-[11px] text-blue-300">Under Review</p>
          <p className="text-xl font-black text-blue-300 mt-0.5">{tasks.summary.submitted}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091438] border border-amber-500/30">
          <p className="text-[11px] text-amber-300">In Progress</p>
          <p className="text-xl font-black text-amber-300 mt-0.5">{tasks.summary.inProgress}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091438] border border-rose-500/30">
          <p className="text-[11px] text-rose-400">Overdue Tasks</p>
          <p className="text-xl font-black text-rose-400 mt-0.5">{tasks.summary.overdue}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#172B80]/40 to-[#091438] border border-brand-orange/40">
          <p className="text-[11px] text-brand-orange">Verified Rate</p>
          <p className="text-xl font-black text-white mt-0.5">{tasks.summary.completionRate}%</p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
          {[
            { id: 'TODAY', label: "Today's Tasks", count: tasks.todayTasks.length },
            { id: 'IN_PROGRESS', label: 'In Progress', count: tasks.inProgressTasks.length },
            { id: 'SUBMITTED', label: 'Under Review', count: tasks.submittedTasks.length },
            { id: 'UPCOMING', label: 'Upcoming', count: tasks.upcomingTasks.length },
            { id: 'COMPLETED', label: 'Completed', count: tasks.completedTasks.length },
            { id: 'OVERDUE', label: 'Overdue', count: tasks.overdueTasks.length },
            { id: 'ALL', label: 'All Tasks', count: tasks.allTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      {displayedTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#060B1E] border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No tasks in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You're currently all caught up! Check upcoming tasks or switch tabs to review your completed work.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTasks.map((t) => (
            <div
              key={t.assignmentId}
              onClick={() => handleOpenTask(t)}
              className="p-5 rounded-2xl bg-[#070E28] border border-[#162758] hover:border-brand-orange/60 transition cursor-pointer flex flex-col justify-between group shadow-lg hover:shadow-brand-orange/10 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Header: Subject & Priority */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider truncate">
                    {t.subject}
                  </span>
                  {getPriorityBadge(t.priority)}
                </div>

                {/* Title & Topic */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors line-clamp-2">
                    {t.title}
                  </h3>
                  {t.topic && <p className="text-[11px] text-slate-400 mt-1 truncate">{t.topic}</p>}
                </div>

                {/* Instructions snippet */}
                {t.instructions && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/5">
                    {t.instructions}
                  </p>
                )}

                {/* Progress Indicators */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/5 flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                    <span>
                      {t.actualStudyMins} / {t.targetDurationMins}m
                    </span>
                  </div>

                  {t.targetQuestions > 0 && (
                    <div className="p-2 rounded-lg bg-white/5 flex items-center gap-1.5 text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>
                        {t.completedQuestions} / {t.targetQuestions} Qs
                      </span>
                    </div>
                  )}
                </div>

                {/* Teacher Feedback Alert if Revision Required */}
                {t.status === 'REVISION_REQUIRED' && t.teacherFeedback && (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs">
                    <p className="font-bold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-purple-400" /> Revision Requested:
                    </p>
                    <p className="text-[11px] text-purple-300 mt-0.5 line-clamp-2">
                      {t.revisionInstructions || t.teacherFeedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due: {t.dueDate}</span>
                </div>
                <div>{getStatusBadge(t.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Task Detail & Progress Submission Modal */}
      {selectedTask && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Task: ${selectedTask.title}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-slate-300 text-xs">
            {/* Top Info Banner */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-400">Subject &amp; Topic</p>
                <p className="text-sm font-bold text-white">
                  {selectedTask.subject} {selectedTask.topic ? `• ${selectedTask.topic}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedTask.priority)}
                {getStatusBadge(selectedTask.status)}
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Teacher Instructions</h4>
              <p className="text-xs text-slate-200 bg-white/5 p-3.5 rounded-xl border border-white/10 leading-relaxed whitespace-pre-wrap">
                {selectedTask.instructions || 'No detailed instructions provided.'}
              </p>
            </div>

            {/* Reference Links if any */}
            {selectedTask.referenceLinks && selectedTask.referenceLinks.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Reference Materials</h4>
                <div className="space-y-1">
                  {selectedTask.referenceLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-brand-orange hover:underline text-xs p-2 rounded-lg bg-white/5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Faculty Feedback Section if available */}
            {selectedTask.teacherFeedback && (
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200">
                <p className="font-bold flex items-center gap-1.5 text-xs text-white">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-orange" /> Faculty Remarks from{' '}
                  {selectedTask.reviewedBy || 'Mentor'}:
                </p>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  {selectedTask.teacherFeedback}
                </p>
                {selectedTask.revisionInstructions && (
                  <p className="text-xs text-purple-300 mt-2 font-medium bg-purple-900/30 p-2 rounded">
                    Instructions for Revision: {selectedTask.revisionInstructions}
                  </p>
                )}
              </div>
            )}

            {/* Student Progress Recording Section */}
            {selectedTask.status !== 'APPROVED' ? (
              <div className="p-4 rounded-xl bg-[#091438] border border-[#172B80] space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" /> Record Your Study Progress
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                      Actual Study Time Spent (Minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={studyMins}
                      onChange={(e) => setStudyMins(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Target was: {selectedTask.targetDurationMins} minutes
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                      Questions Solved / Completed
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={questionsDone}
                      onChange={(e) => setQuestionsDone(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Target was: {selectedTask.targetQuestions} questions
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                    Study Notes / Summary of Work
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you covered, questions you struggled with, or error analysis..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                    Assignment / Study Proof Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or link to your work"
                    value={evidenceLink}
                    onChange={(e) => setEvidenceLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  {selectedTask.status === 'ASSIGNED' && (
                    <button
                      type="button"
                      onClick={handleStartTask}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Start Task (In Progress)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveProgress}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Save Draft Progress</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#E55F00] hover:to-[#EA7D29] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/20 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Teacher Verification</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200">
                <p className="font-bold flex items-center gap-1.5 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Officially Verified &amp; Approved
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  This task was approved by {selectedTask.reviewedBy || 'Faculty'} on {selectedTask.approvedAt?.slice(0, 10)}. Completed work is locked and contributes to your official Digital Progress Card metrics.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentTasksPage;
