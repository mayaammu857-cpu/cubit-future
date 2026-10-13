import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Calendar,
  AlertTriangle,
  Send,
  BookOpen,
  CheckCircle2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { StudentMonitoringMetric } from '../../types/monitoring';
import { monitoringApi } from '../../services/monitoringApi';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface QuickInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: StudentMonitoringMetric | null;
  onSuccess: () => void;
}

export const QuickInterventionModal: React.FC<QuickInterventionModalProps> = ({
  isOpen,
  onClose,
  metric,
  onSuccess,
}) => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'MENTOR_CALL' | 'COUNSELLOR' | 'REMEDIAL'>('WHATSAPP');
  const [whatsAppType, setWhatsAppType] = useState<'ATTENDANCE_WARNING' | 'ACADEMIC_ALERT' | 'APPRECIATION' | 'CUSTOM'>('ATTENDANCE_WARNING');
  const [customMessage, setCustomMessage] = useState('');
  const [callTopic, setCallTopic] = useState('Foundational Concepts & Attendance Improvement');
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState('16:00');
  const [remedialTitle, setRemedialTitle] = useState('Remedial Assessment: Quantitative Data Interpretation');
  const [remedialInstructions, setRemedialInstructions] = useState('Complete 25 practice questions focused on ratios, percentages, and graph calculation before next session.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !metric) return null;

  const student = metric.student;

  const handleSendWhatsApp = async () => {
    setSubmitting(true);
    try {
      const url = monitoringApi.generateWhatsAppUrl(
        {
          name: student.name,
          phone: student.phone,
          guardianPhone: student.guardianPhone,
          studentId: student.studentId,
        },
        whatsAppType,
        customMessage
      );

      // Log intervention to persistent database/storage
      const title =
        whatsAppType === 'ATTENDANCE_WARNING'
          ? 'WhatsApp Attendance Notice Dispatched'
          : whatsAppType === 'ACADEMIC_ALERT'
          ? 'WhatsApp Academic Warning Dispatched'
          : whatsAppType === 'APPRECIATION'
          ? 'WhatsApp Academic Commendation Sent'
          : 'Custom WhatsApp Notice Dispatched';

      await monitoringApi.logIntervention(student.studentId, {
        type: 'WHATSAPP_ALERT',
        title,
        summary: `Alert dispatched to ${student.guardianPhone || student.phone}. Target: ${whatsAppType}`,
        recordedBy: user?.name || 'Faculty Mentor',
      });

      addNotification('success', 'Intervention logged! Opening WhatsApp Web/App...');
      window.open(url, '_blank');
      onSuccess();
      onClose();
    } catch {
      addNotification('error', 'Failed to log intervention.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleCall = async () => {
    setSubmitting(true);
    try {
      await monitoringApi.logIntervention(student.studentId, {
        type: 'CALL_SCHEDULED',
        title: `1-on-1 Mentorship Scheduled: ${callTopic}`,
        summary: `Session set for ${callDate} at ${callTime} with ${user?.name || 'Mentor'}. Focus on academic recovery.`,
        recordedBy: user?.name || 'Faculty Mentor',
      });

      addNotification('success', `Mentorship call logged with ${student.name} for ${callDate} at ${callTime}.`);
      onSuccess();
      onClose();
    } catch {
      addNotification('error', 'Could not schedule mentorship session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReferCounsellor = async () => {
    setSubmitting(true);
    try {
      await monitoringApi.logIntervention(student.studentId, {
        type: 'COUNSELLOR_FLAG',
        title: 'Priority Escalation to Academic Counsellor',
        summary: `Student flagged for direct counselling intervention due to ${metric.riskFactors.join(', ')}.`,
        recordedBy: user?.name || 'Faculty Mentor',
      });

      addNotification('success', `Student ${student.name} has been referred to Academic Counselling on high priority.`);
      onSuccess();
      onClose();
    } catch {
      addNotification('error', 'Could not refer to counsellor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignRemedial = async () => {
    setSubmitting(true);
    try {
      await monitoringApi.logIntervention(student.studentId, {
        type: 'REMEDIAL_ASSIGNED',
        title: remedialTitle,
        summary: remedialInstructions,
        recordedBy: user?.name || 'Faculty Mentor',
      });

      addNotification('success', `Remedial module "${remedialTitle}" assigned to ${student.name}.`);
      onSuccess();
      onClose();
    } catch {
      addNotification('error', 'Could not assign remedial task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#070E28] border border-[#162758] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A1338]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Direct Academic Intervention</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    metric.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : metric.riskLevel === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {metric.riskLevel} Risk ({metric.riskScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Aspirant: <strong className="text-white">{student.name}</strong> ({student.studentId}) • {student.batchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-white/10 bg-[#060D24] px-6">
          <button
            onClick={() => setActiveTab('WHATSAPP')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'WHATSAPP'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Alert</span>
          </button>
          <button
            onClick={() => setActiveTab('MENTOR_CALL')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'MENTOR_CALL'
                ? 'border-brand-orange text-brand-orange bg-brand-orange/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule 1-on-1 Call</span>
          </button>
          <button
            onClick={() => setActiveTab('REMEDIAL')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'REMEDIAL'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Assign Remedial</span>
          </button>
          <button
            onClick={() => setActiveTab('COUNSELLOR')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'COUNSELLOR'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Escalate to Counsellor</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {activeTab === 'WHATSAPP' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Instant WhatsApp Message Dispatcher</h4>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Pre-formats an official alert to the student’s guardian (<span className="font-mono text-white">{student.guardianPhone || student.phone}</span>) and opens WhatsApp with one click.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Alert Template
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'ATTENDANCE_WARNING', label: 'Attendance Deficit Notice (< 75%)', icon: AlertTriangle },
                    { id: 'ACADEMIC_ALERT', label: 'Academic Performance Reinforcement', icon: BookOpen },
                    { id: 'APPRECIATION', label: 'Commendation & Top Rank Note', icon: CheckCircle2 },
                    { id: 'CUSTOM', label: 'Custom Personalized Message', icon: MessageCircle },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setWhatsAppType(tpl.id as any)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                        whatsAppType === tpl.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <tpl.icon className={`w-4 h-4 shrink-0 mt-0.5 ${whatsAppType === tpl.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight">{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {whatsAppType === 'CUSTOM' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Custom Message Content
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom note to send via WhatsApp..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 font-mono">
                <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold mb-1">Message Preview:</p>
                {whatsAppType === 'ATTENDANCE_WARNING' && (
                  <p>
                    *Cubit Future Academy — Academic Attendance Alert*<br />
                    Dear Parent/Guardian, This is an official notice regarding *{student.name}* (ID: {student.studentId}). Their attendance has dropped to {student.attendanceRate}%...
                  </p>
                )}
                {whatsAppType === 'ACADEMIC_ALERT' && (
                  <p>
                    *Cubit Future Academy — Academic Progress Update*<br />
                    Dear Student/Parent, Our faculty monitoring radar has flagged areas requiring reinforcement for *{student.name}*...
                  </p>
                )}
                {whatsAppType === 'APPRECIATION' && (
                  <p>
                    *Cubit Future Academy — Commendation Note*<br />
                    Congratulations! *{student.name}* has demonstrated outstanding academic consistency and top percentile marks...
                  </p>
                )}
                {whatsAppType === 'CUSTOM' && (
                  <p>{customMessage || 'Enter custom text above to preview...'}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSendWhatsApp}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Launch WhatsApp &amp; Log Alert</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'MENTOR_CALL' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-brand-orange/10 border border-brand-orange/30 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-orange">1-on-1 Academic Mentorship Appointment</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Schedule a private counseling or academic remedial discussion with {student.name}.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Discussion Agenda / Focus Area
                </label>
                <input
                  type="text"
                  value={callTopic}
                  onChange={(e) => setCallTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleScheduleCall}
                  className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-[#FF7700] text-white font-bold flex items-center gap-2 shadow-lg shadow-brand-orange/30 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Log Session</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'REMEDIAL' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-300">Targeted Remedial Practice Module</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assign focused exercises directly targeting {metric.academics.weakestSubject || 'weak topics'}.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  value={remedialTitle}
                  onChange={(e) => setRemedialTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Remedial Deliverable Instructions
                </label>
                <textarea
                  rows={3}
                  value={remedialInstructions}
                  onChange={(e) => setRemedialInstructions(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleAssignRemedial}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Assign Remedial Task</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'COUNSELLOR' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-purple-300">Escalate to Academy Counselling Wing</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Flag student for urgent psycho-social or motivation counselling. Sends immediate notification to Academy Head Counsellor Priya Sharma.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-white">Identified Risk Triggers to Submit:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {metric.riskFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                  {metric.riskFactors.length === 0 && (
                    <li>Student requires proactive guidance and motivation check-in.</li>
                  )}
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleReferCounsellor}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Submit Counsellor Referral</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
