import React, { useState } from 'react';
import {
  X,
  User,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  CheckSquare,
  BookOpen,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Plus,
  Shield,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { StudentMonitoringMetric } from '../../types/monitoring';
import { monitoringApi } from '../../services/monitoringApi';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: StudentMonitoringMetric | null;
  onTriggerIntervention: (metric: StudentMonitoringMetric) => void;
  onRefresh: () => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  metric,
  onTriggerIntervention,
  onRefresh,
}) => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACADEMICS' | 'ATTENDANCE' | 'TASKS' | 'NOTES'>('OVERVIEW');
  const [newNote, setNewNote] = useState('');
  const [notePriority, setNotePriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [savingNote, setSavingNote] = useState(false);

  if (!isOpen || !metric) return null;

  const student = metric.student;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      await monitoringApi.addTeacherNote(student.studentId, {
        author: user?.name || 'Faculty Mentor',
        role: user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Administrator' : 'Faculty Mentor',
        note: newNote.trim(),
        priority: notePriority,
      });

      addNotification('success', 'Faculty observation logged successfully.');
      setNewNote('');
      onRefresh();
    } catch {
      addNotification('error', 'Failed to log note.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#070E28] border border-[#162758] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Dossier Header */}
        <div className="p-6 border-b border-white/10 bg-[#091438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-xl flex items-center justify-center text-white font-black text-xl">
                {student.name.charAt(0)}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#091438] ${
                  metric.onlineStatus === 'ONLINE'
                    ? 'bg-emerald-500'
                    : metric.onlineStatus === 'STUDYING'
                    ? 'bg-blue-500 animate-pulse'
                    : metric.onlineStatus === 'AWAY'
                    ? 'bg-amber-500'
                    : 'bg-slate-500'
                }`}
                title={`Status: ${metric.onlineStatus}`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-white">{student.name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {student.studentId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    metric.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : metric.riskLevel === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {metric.riskLevel} Risk • {metric.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{student.courseName}</span>
                <span>•</span>
                <span className="text-brand-orange font-semibold">{student.batchName}</span>
                <span>•</span>
                <span className="text-slate-400">Active: {metric.lastActive}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onTriggerIntervention(metric)}
              className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-[#FF7700] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-orange/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Intervene / Alert</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Risk Banner Alert (If Critical or Moderate) */}
        {metric.riskFactors.length > 0 && (
          <div
            className={`px-6 py-3 border-b flex items-start gap-3 ${
              metric.riskLevel === 'CRITICAL'
                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-current" />
            <div className="text-xs flex-1">
              <span className="font-bold uppercase tracking-wider text-[10px] block">
                Automated Radar Warning Flags:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5 text-[11px]">
                {metric.riskFactors.map((rf, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    • {rf}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 bg-[#060D24] px-6 overflow-x-auto custom-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'Monitoring Overview' },
            { id: 'ACADEMICS', label: 'Exams & Score Trajectory' },
            { id: 'ATTENDANCE', label: 'Attendance Analysis' },
            { id: 'TASKS', label: 'Assignments & Tasks' },
            { id: 'NOTES', label: `Faculty Observations (${metric.teacherNotes.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3.5 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === t.id
                  ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 custom-scrollbar">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Vital Telemetry KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Rate</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-2xl font-black ${
                        metric.attendance.rate < 75 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {metric.attendance.rate}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {metric.attendance.classesAttended}/{metric.attendance.totalClasses}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Average Exam Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-2xl font-black ${
                        metric.academics.averageScore < 60 ? 'text-amber-400' : 'text-blue-400'
                      }`}
                    >
                      {metric.academics.averageScore}%
                    </span>
                    <span className="text-[10px] text-slate-400">Rank #{metric.academics.rankInBatch}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Task Completion</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-purple-400">
                      {metric.tasks.completionRate}%
                    </span>
                    {metric.tasks.overdue > 0 && (
                      <span className="text-[10px] font-bold text-red-400">
                        ({metric.tasks.overdue} overdue)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Study Velocity</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-brand-orange">
                      {metric.weeklyStudyHours}h
                    </span>
                    <span className="text-[10px] text-slate-400">this week</span>
                  </div>
                </div>
              </div>

              {/* AI Radar & Subject Mastery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Doubt Solver & Gap Telemetry */}
                <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-orange" />
                      <h4 className="font-bold text-white text-xs">AI Learning Radar Signals</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        metric.aiRadar.gapSeverity === 'HIGH'
                          ? 'bg-red-500/20 text-red-400'
                          : metric.aiRadar.gapSeverity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {metric.aiRadar.gapSeverity} Gap Severity
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Doubts Raised to AI Solver:</span>
                      <span className="font-bold text-white">{metric.aiRadar.doubtsAskedThisWeek} queries</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Knowledge Gaps Flagged:</span>
                      <span className="font-bold text-amber-400">{metric.aiRadar.knowledgeGapsCount} critical topics</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Frequent Struggle Area:</span>
                      <span className="font-bold text-brand-orange text-right">{metric.academics.weakestTopic}</span>
                    </div>
                  </div>
                </div>

                {/* Subject Mastery Strengths vs Weaknesses */}
                <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <h4 className="font-bold text-white text-xs">Subject Health Assessment</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-emerald-400 font-bold">Strongest Domain:</span>
                        <span className="text-white font-semibold">{metric.academics.strongestSubject}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-red-400 font-bold">Priority Weakness:</span>
                        <span className="text-white font-semibold">{metric.academics.weakestSubject}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${Math.max(25, metric.academics.averageScore - 20)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Guardian Fast-Action Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Contact Details</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.email}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Guardian: <strong className="text-white">{student.guardianName || 'Parent'}</strong> ({student.guardianPhone || student.phone})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${student.phone}`}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Student</span>
                  </a>
                  <button
                    onClick={() => onTriggerIntervention(metric)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Guardian</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICS & SCORE TRAJECTORY */}
          {activeTab === 'ACADEMICS' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">Assessment Score Trajectory (Last 5 Mocks)</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Latest: <strong className="text-brand-orange">{metric.academics.latestScore}%</strong>
                  </span>
                </div>

                {/* Visual Sparkline representation */}
                <div className="flex items-end gap-3 h-32 pt-4 pb-2 border-b border-white/10">
                  {metric.academics.scoreTrend.map((score, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-bold font-mono text-white">{score}%</span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          score >= 80
                            ? 'bg-emerald-500'
                            : score >= 60
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        }`}
                        style={{ height: `${(score / 100) * 80}px` }}
                      />
                      <span className="text-[9px] text-slate-400 font-mono">Test {i + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target Passing Benchmark: 70%</span>
                  <span>Cohort Average: 74%</span>
                </div>
              </div>

              {/* Detailed Exam Records */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0A1338]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3.5">Assessment Name</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-3.5 font-bold text-white">{metric.academics.latestExamName}</td>
                      <td className="p-3.5">{metric.academics.weakestSubject}</td>
                      <td className="p-3.5 font-bold text-brand-orange font-mono">{metric.academics.latestScore}%</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            metric.academics.latestScore >= 70
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {metric.academics.latestScore >= 70 ? 'CLEARED' : 'NEEDS RETAKE'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-white">Diagnostic Milestone Assessment</td>
                      <td className="p-3.5">{metric.academics.strongestSubject}</td>
                      <td className="p-3.5 font-bold text-emerald-400 font-mono">
                        {metric.academics.scoreTrend[0]}%
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          CLEARED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE ANALYSIS */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0A1338] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Official Academy Attendance Register</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Requirement: Minimum 75% physical &amp; virtual cohort presence
                  </p>
                </div>
                <span
                  className={`text-2xl font-black ${
                    metric.attendance.rate >= 75 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {metric.attendance.rate}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Lectures</span>
                  <p className="text-xl font-bold text-white mt-1">{metric.attendance.totalClasses}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{metric.attendance.classesAttended}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Missed</span>
                  <p className="text-xl font-bold text-red-400 mt-1">
                    {metric.attendance.totalClasses - metric.attendance.classesAttended}
                  </p>
                </div>
              </div>

              {metric.attendance.rate < 75 && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-300">Statutory Notice Pending</p>
                      <p className="text-[11px] text-red-200/80">
                        Attendance is below university/regulatory cutoff. Immediate counseling notice advised.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onTriggerIntervention(metric)}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition"
                  >
                    Issue Warning
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TASKS AUDIT */}
          {activeTab === 'TASKS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned</span>
                  <p className="text-lg font-bold text-white mt-1">{metric.tasks.assigned}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Completed</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{metric.tasks.completed}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">In Progress</span>
                  <p className="text-lg font-bold text-blue-400 mt-1">{metric.tasks.pending}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Overdue</span>
                  <p className="text-lg font-bold text-red-400 mt-1">{metric.tasks.overdue}</p>
                </div>
              </div>

              {metric.tasks.overdue > 0 && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                  Student has <strong>{metric.tasks.overdue} task(s)</strong> past the submission deadline without faculty extension.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FACULTY NOTES & OBSERVATIONS */}
          {activeTab === 'NOTES' && (
            <div className="space-y-5">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-[#0A1338] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">Record Confidential Faculty Observation</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Priority:</label>
                    <select
                      value={notePriority}
                      onChange={(e) => setNotePriority(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-[11px] focus:outline-none focus:border-brand-orange"
                    >
                      <option value="NORMAL" className="bg-[#070E28]">Normal Observation</option>
                      <option value="URGENT" className="bg-[#070E28]">Urgent / Follow-Up Required</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter observation on student motivation, class participation, or doubt trends..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-[#FF7700] text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Observation Note</span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline */}
              <div className="space-y-3">
                {metric.teacherNotes.length === 0 ? (
                  <p className="text-center py-6 text-slate-500 text-xs">
                    No faculty observations logged yet. Add the first observation above.
                  </p>
                ) : (
                  metric.teacherNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-2xl border space-y-2 ${
                        note.priority === 'URGENT'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-[#0A1338] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <strong className="text-white">{note.author}</strong>
                          <span className="text-slate-400">({note.role})</span>
                          {note.priority === 'URGENT' && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">
                              URGENT
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">{note.date}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
