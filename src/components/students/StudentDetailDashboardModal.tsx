import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Key,
  RefreshCw,
  AlertTriangle,
  User,
  CheckSquare,
  Layers,
  Activity,
  Phone,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { Student, ExamRecord, TaskAssignment } from '../../types';
import { examsApi, tasksApi, auditLogApi } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { AssignTaskModal } from '../tasks/AssignTaskModal';

interface StudentDetailDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | any | null;
  onStudentUpdated?: (updatedStudent: any) => void;
  userRole?: 'ADMIN' | 'TEACHER' | 'SUPER_ADMIN';
}

const COMMON_SUBJECTS = [
  'Quantitative Aptitude',
  'Reasoning Ability',
  'English Language',
  'Banking & Financial Awareness',
  'General Studies',
  'Current Affairs',
  'Computer Aptitude',
  'Data Interpretation',
];

const PRESET_EXAM_NAMES = [
  'Weekly Assessment 1',
  'Weekly Assessment 2',
  'Unit Mock Exam',
  'Speed & Accuracy Test',
  'Full Length Mock 1',
  'Full Length Mock 2',
  'Monthly Evaluation',
  'Daily Practice Quiz',
];

export const StudentDetailDashboardModal: React.FC<StudentDetailDashboardModalProps> = ({
  isOpen,
  onClose,
  student,
  onStudentUpdated,
  userRole = 'ADMIN',
}) => {
  const { addNotification } = useNotifications();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'EXAMS' | 'TASKS' | 'PROFILE'>('EXAMS');

  // Exam records state
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);

  // New Exam Form Fields (Multiple time addition)
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [marksObtained, setMarksObtained] = useState<number | ''>('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examNotes, setExamNotes] = useState('');

  // Tasks state
  const [studentTasks, setStudentTasks] = useState<TaskAssignment[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Student metrics tracking
  const [currentAvg, setCurrentAvg] = useState<number>(student?.averageScore || 0);
  const [totalExamsCount, setTotalExamsCount] = useState<number>(student?.totalExamsAttempted || 0);

  const stuId = student?.studentId || student?.id;

  // Load exam records and tasks whenever modal opens or student changes
  useEffect(() => {
    if (!isOpen || !student) return;

    setCurrentAvg(student.averageScore || 0);
    setTotalExamsCount(student.totalExamsAttempted || 0);

    const loadData = async () => {
      setLoadingExams(true);
      try {
        const results = await examsApi.getStudentResults(stuId);
        setExams(results);

        if (results.length > 0) {
          const avg = Math.round((results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length) * 10) / 10;
          setCurrentAvg(avg);
          setTotalExamsCount(results.length);
        }
      } catch (err) {
        console.warn('Failed loading student exams:', err);
      } finally {
        setLoadingExams(false);
      }

      setLoadingTasks(true);
      try {
        const tList = await tasksApi.getStudentAssignments(stuId);
        setStudentTasks(tList || []);
      } catch (err) {
        console.warn('Failed loading student tasks:', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    loadData();
  }, [isOpen, student, stuId]);

  if (!isOpen || !student) return null;

  // Calculate live preview percentage
  const numObtained = typeof marksObtained === 'number' ? marksObtained : 0;
  const numMax = maxMarks > 0 ? maxMarks : 100;
  const previewPct = Math.round((numObtained / numMax) * 100);

  // Handle adding exam marks (multiple times support)
  const handleSaveExam = async (keepFormOpen: boolean = false) => {
    if (!examName.trim()) {
      addNotification('warning', 'Please provide an Assessment / Exam Name.');
      return;
    }
    if (marksObtained === '' || marksObtained < 0) {
      addNotification('warning', 'Please enter valid marks obtained.');
      return;
    }
    if (maxMarks <= 0) {
      addNotification('warning', 'Max marks must be greater than zero.');
      return;
    }
    if (numObtained > numMax) {
      addNotification('warning', 'Marks obtained cannot be higher than Maximum marks.');
      return;
    }

    setSubmittingExam(true);
    try {
      const activeSubject = subject === 'Other / Custom' ? customSubject.trim() || 'General Studies' : subject;
      const pct = Math.round((numObtained / numMax) * 100);

      const saved = await examsApi.submitExamRecord({
        studentId: stuId,
        studentName: student.name,
        examName: examName.trim(),
        subject: activeSubject,
        marksObtained: numObtained,
        maxMarks: numMax,
        totalMarks: numMax,
        percentage: pct,
        examDate: examDate || new Date().toISOString().split('T')[0],
        resultStatus: pct >= 85 ? 'EXCELLENT' : pct >= 50 ? 'PASSED' : 'FAILED',
        status: pct >= 85 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 50 ? 'Average' : 'Needs Improvement',
      });

      // Update local exams list immediately
      const updatedList = [saved, ...exams];
      setExams(updatedList);

      const newAvg = Math.round((updatedList.reduce((s, r) => s + (r.percentage || 0), 0) / updatedList.length) * 10) / 10;
      setCurrentAvg(newAvg);
      setTotalExamsCount(updatedList.length);

      if (onStudentUpdated) {
        onStudentUpdated({
          ...student,
          averageScore: newAvg,
          totalExamsAttempted: updatedList.length,
        });
      }

      addNotification('success', `Marks for "${examName}" added successfully (${pct}%)!`);

      if (keepFormOpen) {
        // Prepare next exam entry: auto increment number if applicable, keep subject and date
        const match = examName.match(/(.*?)(\d+)$/);
        if (match) {
          const prefix = match[1];
          const num = parseInt(match[2], 10);
          setExamName(`${prefix}${num + 1}`);
        } else {
          setExamName('');
        }
        setMarksObtained('');
        setExamNotes('');
      } else {
        setShowAddExamForm(false);
        setExamName('');
        setMarksObtained('');
        setExamNotes('');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save exam marks.';
      addNotification('error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmittingExam(false);
    }
  };

  // Handle deleting an exam entry
  const handleDeleteExam = async (examId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the exam entry for "${name}"?`)) return;

    try {
      await examsApi.delete(examId);
      const updatedList = exams.filter((e) => e.id !== examId);
      setExams(updatedList);

      const newAvg = updatedList.length > 0
        ? Math.round((updatedList.reduce((s, r) => s + (r.percentage || 0), 0) / updatedList.length) * 10) / 10
        : 0;
      setCurrentAvg(newAvg);
      setTotalExamsCount(updatedList.length);

      if (onStudentUpdated) {
        onStudentUpdated({
          ...student,
          averageScore: newAvg,
          totalExamsAttempted: updatedList.length,
        });
      }

      addNotification('success', `Exam "${name}" deleted.`);
    } catch {
      addNotification('error', 'Could not delete exam record.');
    }
  };

  // Copy Student Login Credentials
  const handleCopyCredentials = () => {
    const pass = student.password || 'student123';
    const text = `*Cubit Future Student Portal Credentials*\nStudent ID: ${student.studentId || student.id}\nName: ${student.name}\nEmail: ${student.email}\nPhone: ${student.phone}\nPassword: ${pass}\nPortal Login URL: https://future-six-fawn.vercel.app/login`;
    navigator.clipboard.writeText(text);
    addNotification('success', `Portal credentials for ${student.name} copied to clipboard!`);
  };

  // Performance calculations
  const highestScore = exams.length > 0 ? Math.max(...exams.map((e) => e.percentage || 0)) : 0;
  const latestScore = exams.length > 0 ? (exams[0]?.percentage ?? 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#030712]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#070E28] border border-[#162758] rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#091438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 p-0.5 shadow-xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
              {student.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">{student.name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-white/10 text-brand-orange font-bold border border-white/10">
                  {student.studentId || student.id}
                </span>
                <span
                  className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                    student.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {student.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{student.courseName || 'General Program'}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{student.batchName || 'Cohort Batch'}</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleCopyCredentials}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Copy Student Login Credentials"
            >
              <Key className="w-3.5 h-3.5 text-brand-orange" />
              <span>Copy Login</span>
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange/30 border border-brand-orange/40 text-brand-orange text-xs font-bold flex items-center gap-1.5 transition"
              title="Assign Academic Task"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Assign Task</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/10"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vital KPI Metric Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 sm:p-5 border-b border-white/10 bg-[#060D24]">
          <div className="p-3.5 rounded-2xl bg-[#091438] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-black ${currentAvg >= 80 ? 'text-emerald-400' : currentAvg >= 60 ? 'text-brand-orange' : 'text-rose-400'}`}>
                {currentAvg}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#091438] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Tests
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{totalExamsCount}</span>
              <span className="text-[10px] text-slate-400 font-medium">exams</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#091438] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Peak Marks %
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-400">{highestScore}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#091438] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Latest Test
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-brand-orange">{latestScore}%</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#091438] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Attendance
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-blue-400">
                {student.attendanceRate || 95}%
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#070E28] px-5 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('EXAMS')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'EXAMS'
                  ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Assessment & Exam Marks ({exams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('TASKS')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'TASKS'
                  ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Assigned Tasks ({studentTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'PROFILE'
                  ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Profile & Contact</span>
            </button>
          </div>

          {/* Quick Action Button in Header Tab Bar */}
          {activeTab === 'EXAMS' && !showAddExamForm && (
            <button
              onClick={() => setShowAddExamForm(true)}
              className="my-1.5 px-3.5 py-1.5 rounded-xl bg-brand-orange hover:bg-[#e55f00] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Marks (മാർക്ക് ചേർക്കുക)</span>
            </button>
          )}
        </div>

        {/* Main Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
          {/* TAB 1: EXAMS & MULTIPLE MARK ADDITION */}
          {activeTab === 'EXAMS' && (
            <div className="space-y-6">
              {/* Form to Add Marks Repeatedly */}
              {showAddExamForm && (
                <div className="p-5 rounded-3xl bg-[#091438] border-2 border-brand-orange/40 shadow-xl space-y-4 animate-scale-up">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Enter Student Exam Marks (മാർക്ക് രേഖപ്പെടുത്തുക)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Add multiple tests, mocks, and subject assessment marks consecutively
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddExamForm(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Exam Name Quick Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Quick Assessment Templates (വേഗത്തിലുള്ള തെരഞ്ഞെടുപ്പ്):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_EXAM_NAMES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setExamName(name)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                            examName === name
                              ? 'bg-brand-orange text-white font-bold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Exam / Assessment Name *
                      </label>
                      <input
                        type="text"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="e.g. Weekly Mock 1"
                        className="w-full px-3 py-2 bg-[#060D24] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Subject (വിഷയം) *
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-[#060D24] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-orange text-xs"
                      >
                        {COMMON_SUBJECTS.map((s) => (
                          <option key={s} value={s} className="bg-[#091438]">
                            {s}
                          </option>
                        ))}
                        <option value="Other / Custom" className="bg-[#091438]">Other / Custom Subject</option>
                      </select>
                    </div>

                    {subject === 'Other / Custom' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Custom Subject Name *
                        </label>
                        <input
                          type="text"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="e.g. Current Affairs"
                          className="w-full px-3 py-2 bg-[#060D24] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-orange text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Marks Obtained (ലഭിച്ച മാർക്ക്) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        step="0.5"
                        value={marksObtained}
                        onChange={(e) => setMarksObtained(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="e.g. 78"
                        className="w-full px-3 py-2 bg-[#060D24] border border-white/15 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-brand-orange text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Maximum Marks (ആകെ മാർക്ക്) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(parseFloat(e.target.value) || 100)}
                        placeholder="100"
                        className="w-full px-3 py-2 bg-[#060D24] border border-white/15 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-brand-orange text-xs"
                      />
                    </div>
                  </div>

                  {/* Second Row: Date & Live Percentage Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Exam Date (പരീക്ഷ തീയതി)
                      </label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#060D24] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-orange text-xs"
                      />
                    </div>

                    {/* Live Calculated Output */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between sm:col-span-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Auto-Calculated Percentage & Standing
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-base font-black text-brand-orange">
                            {marksObtained !== '' ? `${previewPct}%` : '0%'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              previewPct >= 85
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : previewPct >= 50
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {previewPct >= 85 ? 'EXCELLENT' : previewPct >= 50 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <span>Candidate: </span>
                        <strong className="text-white">{student.name}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Multiple Entries */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowAddExamForm(false)}
                      className="px-3.5 py-2 text-slate-400 hover:text-white rounded-xl transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={submittingExam}
                      onClick={() => handleSaveExam(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
                      title="Save this exam and immediately enter another"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{submittingExam ? 'Saving...' : 'Save & Add Another Mark (സേവ് ചെയ്ത് അടുത്തത്)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={submittingExam}
                      onClick={() => handleSaveExam(false)}
                      className="px-5 py-2 rounded-xl bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs shadow-lg shadow-brand-orange/20 transition"
                    >
                      {submittingExam ? 'Saving...' : 'Save Marks (പൂർത്തിയാക്കുക)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Visual Performance Trajectory Sparkline / Bar Chart */}
              {exams.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#091438] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        Assessment Performance Trajectory (സ്കോർ പുരോഗതി)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Chronological progression across recorded examinations
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300">
                      Average: <strong className="text-brand-orange">{currentAvg}%</strong>
                    </span>
                  </div>

                  {/* Bar progression */}
                  <div className="flex items-end gap-2 h-28 pt-4 pb-2 border-b border-white/10 overflow-x-auto">
                    {[...exams].reverse().map((ex, idx) => {
                      const p = ex.percentage || 0;
                      return (
                        <div key={ex.id || idx} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[10px] font-bold font-mono text-white">{p}%</span>
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              p >= 80 ? 'bg-emerald-500' : p >= 60 ? 'bg-brand-orange' : 'bg-rose-500'
                            }`}
                            style={{ height: `${Math.max(12, (p / 100) * 70)}px` }}
                            title={`${ex.examName} (${ex.subject}): ${p}%`}
                          />
                          <span className="text-[9px] text-slate-400 font-mono truncate max-w-[48px]">
                            T{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Recorded Exams Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#091438] shadow-lg">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      All Recorded Examination Records ({exams.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Detailed marksheets with subject breakdown and percentage calculation
                    </p>
                  </div>
                  {!showAddExamForm && (
                    <button
                      onClick={() => setShowAddExamForm(true)}
                      className="px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-[#e55f00] text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Mark</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#060D24] text-slate-400 text-[10px] uppercase font-bold border-b border-white/10">
                      <tr>
                        <th className="p-3.5">Assessment Name</th>
                        <th className="p-3.5">Subject</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Marks Obtained</th>
                        <th className="p-3.5">Percentage</th>
                        <th className="p-3.5">Standing</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {loadingExams ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Loading student exam marks...
                          </td>
                        </tr>
                      ) : exams.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400 space-y-2">
                            <Award className="w-10 h-10 text-slate-500 mx-auto opacity-40 mb-1" />
                            <p className="font-bold text-white text-xs">No exam marks recorded yet</p>
                            <p className="text-[11px] text-slate-400">
                              Click "+ Add Marks" above to record the first mock test, quiz, or exam score for {student.name}.
                            </p>
                            <button
                              onClick={() => setShowAddExamForm(true)}
                              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl font-bold transition shadow-md"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ Add Marks Now</span>
                            </button>
                          </td>
                        </tr>
                      ) : (
                        exams.map((ex) => (
                          <tr key={ex.id} className="hover:bg-white/[0.02] transition">
                            <td className="p-3.5 font-bold text-white">{ex.examName}</td>
                            <td className="p-3.5 text-slate-300">{ex.subject}</td>
                            <td className="p-3.5 text-slate-400 font-mono text-[11px]">{ex.examDate}</td>
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-white">{ex.marksObtained}</span>
                              <span className="text-slate-500 font-mono text-[11px]"> / {ex.maxMarks || 100}</span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`font-mono font-bold text-xs ${
                                  (ex.percentage || 0) >= 80
                                    ? 'text-emerald-400'
                                    : (ex.percentage || 0) >= 60
                                    ? 'text-brand-orange'
                                    : 'text-rose-400'
                                }`}
                              >
                                {ex.percentage}%
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  (ex.percentage || 0) >= 85
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : (ex.percentage || 0) >= 50
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {ex.resultStatus || ((ex.percentage || 0) >= 50 ? 'PASSED' : 'FAILED')}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDeleteExam(ex.id, ex.examName)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete exam entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & ASSIGNMENTS */}
          {activeTab === 'TASKS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Assigned Academic Tasks & Homework</h4>
                  <p className="text-[11px] text-slate-400">
                    Track student task submissions, review status, and completion velocity
                  </p>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-orange hover:bg-[#e55f00] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New Task</span>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#091438]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#060D24] text-slate-400 text-[10px] uppercase font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Task Title</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Target Questions</th>
                      <th className="p-3.5">Study Mins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {loadingTasks ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Loading assigned tasks...
                        </td>
                      </tr>
                    ) : studentTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          <CheckSquare className="w-8 h-8 text-slate-500 mx-auto opacity-40 mb-1" />
                          <p className="font-semibold text-white">No tasks assigned to this student yet</p>
                          <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="mt-2 px-3 py-1.5 bg-brand-orange text-white rounded-xl font-bold"
                          >
                            + Assign Task Now
                          </button>
                        </td>
                      </tr>
                    ) : (
                      studentTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-3.5 font-bold text-white">{t.title || 'Academic Task'}</td>
                          <td className="p-3.5 text-slate-300">{t.subject || 'General'}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.status === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : t.status === 'SUBMITTED'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">{t.completedQuestions || 0} / {t.targetQuestions || 25}</td>
                          <td className="p-3.5 font-mono">{t.actualStudyMins || 0}m</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT PROFILE & CONTACT */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#091438] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs border-b border-white/10 pb-2">
                    Contact & Personal Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {student.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {student.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guardian Name:</span>
                      <span className="text-white font-medium">{student.guardianName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guardian Phone:</span>
                      <span className="text-white font-medium">{student.guardianPhone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Enrollment Date:</span>
                      <span className="text-white font-medium">{student.enrollmentDate || 'Recently enrolled'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#091438] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs border-b border-white/10 pb-2">
                    Academic Cohort & Credentials
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Enrolled Program:</span>
                      <span className="text-white font-semibold">{student.courseName || 'General Program'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Cohort Batch:</span>
                      <span className="text-white font-semibold">{student.batchName || 'Regular Batch'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Student Portal Password:</span>
                      <span className="font-mono text-brand-orange font-bold">
                        {student.password || 'student123'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Attendance Rate:</span>
                      <span className="font-bold text-blue-400">{student.attendanceRate || 95}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Google Sheet Sync Card */}
              {student.googleSheetUrl && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-emerald-200 text-xs">
                        Dedicated Google Sheet Synchronized
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-400/80 font-mono truncate max-w-lg">
                      {student.googleSheetUrl}
                    </p>
                  </div>
                  <a
                    href={student.googleSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition flex-shrink-0"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#060D24] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Student Record: <strong>{student.studentId || student.id}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        preselectedStudentId={student?.studentId || student?.id}
        preselectedStudentName={student?.name}
        preselectedBatchId={student?.batchId}
        creatorRole={userRole}
      />
    </div>
  );
};
export default StudentDetailDashboardModal;
