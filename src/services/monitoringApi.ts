import { getStoredStudents, getStoredExams, getStoredAssignments } from './api';
import { mockStudents } from '../data/mockData';
import {
  StudentMonitoringMetric,
  StudentRiskLevel,
  StudentOnlineStatus,
  MonitoringStats,
  InterventionLog,
  TeacherNote,
} from '../types/monitoring';

const STORAGE_KEY_INTERVENTIONS = 'cf_student_monitoring_interventions';
const STORAGE_KEY_NOTES = 'cf_student_monitoring_notes';

function getStoredInterventionsMap(): Record<string, InterventionLog[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    'CF-STU-0005': [
      {
        id: 'int-001',
        studentId: 'CF-STU-0005',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        type: 'WHATSAPP_ALERT',
        title: 'Attendance Drop Notice Sent',
        summary: 'Notified guardian regarding low attendance (61.5%) and consecutive absences in Quantitative Aptitude.',
        recordedBy: 'Prof. Sarah Mathews',
        status: 'COMPLETED',
      },
    ],
    'CF-STU-0006': [
      {
        id: 'int-002',
        studentId: 'CF-STU-0006',
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        type: 'REMEDIAL_ASSIGNED',
        title: 'Remedial Module: Linear Regression & SQL Joins',
        summary: 'Targeted practice set assigned to address foundational weaknesses identified in Diagnostic Exam 2.',
        recordedBy: 'Prof. Sarah Mathews',
        status: 'PENDING',
      },
    ],
  };
}

function persistInterventionsMap(data: Record<string, InterventionLog[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(data));
  } catch {}
}

function getStoredNotesMap(): Record<string, TeacherNote[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    'CF-STU-0005': [
      {
        id: 'note-001',
        studentId: 'CF-STU-0005',
        author: 'Prof. Sarah Mathews',
        role: 'Faculty Mentor',
        note: 'Fahad expressed difficulty keeping up with rapid calculation techniques. Recommended 1-on-1 peer study session and recorded lecture review.',
        date: '2026-10-10',
        priority: 'URGENT',
      },
    ],
    'CF-STU-0001': [
      {
        id: 'note-002',
        studentId: 'CF-STU-0001',
        author: 'Dr. Anand Raman',
        role: 'Academic Director',
        note: 'Demonstrating consistent dedication in morning mock assessments. Preparing for fast-track interview rounds.',
        date: '2026-10-08',
        priority: 'NORMAL',
      },
    ],
  };
}

function persistNotesMap(data: Record<string, TeacherNote[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(data));
  } catch {}
}

export const monitoringApi = {
  async getMonitoringOverview(filter?: {
    batchId?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<{
    metrics: StudentMonitoringMetric[];
    stats: MonitoringStats;
  }> {
    await new Promise((r) => setTimeout(r, 200));

    let students = getStoredStudents();
    if (!students || students.length === 0) {
      students = mockStudents;
    }

    const interventionsMap = getStoredInterventionsMap();
    const notesMap = getStoredNotesMap();
    const allExams = getStoredExams();
    const allAssignments = getStoredAssignments();

    let currentLoggedUser: any = null;
    try {
      const rawUser = localStorage.getItem('cf_auth_user');
      if (rawUser) currentLoggedUser = JSON.parse(rawUser);
    } catch {}

    // Map each student to a rich monitoring metric
    const allMetrics: StudentMonitoringMetric[] = students.map((s, idx) => {
      const att = s.attendanceRate || 80;
      const studentExams = allExams.filter((e) => e.studentId === s.studentId || e.studentId === s.id);
      const studentTasks = allAssignments.filter((t) => t.studentId === s.studentId || t.studentId === s.id);

      const avg = studentExams.length > 0
        ? Math.round((studentExams.reduce((sum, e) => sum + (e.percentage || 0), 0) / studentExams.length) * 10) / 10
        : s.averageScore || 70;

      // Risk score calculation
      let riskScore = 0;
      const riskFactors: string[] = [];

      if (att < 65) {
        riskScore += 45;
        riskFactors.push(`Critical attendance deficit (${att}%, threshold is 75%)`);
      } else if (att < 75) {
        riskScore += 25;
        riskFactors.push(`Attendance warning zone (${att}%)`);
      }

      if (avg < 50) {
        riskScore += 40;
        riskFactors.push(`Critical academic shortfall (Average ${avg}%)`);
      } else if (avg < 65) {
        riskScore += 20;
        riskFactors.push(`Below benchmark examination average (${avg}%)`);
      }

      // Check task status simulation based on student
      let overdueTasks = 0;
      let pendingTasks = 1;
      let completedTasks = 4;
      let onlineStatus: StudentOnlineStatus = 'OFFLINE';
      let lastActive = '2 hours ago';
      let weeklyStudyHours = 14.5;
      let doubtsThisWeek = 3;
      let gapSeverity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let scoreTrend = [75, 78, 80, 82, 81];
      let weakestSubject = 'Logical Reasoning';
      let weakestTopic = 'Syllogisms & Analytical Puzzles';
      let strongestSubject = 'Quantitative Aptitude';
      let latestExamName = 'Comprehensive Mock Assessment';

      // Pull real student exams if present
      if (studentExams.length > 0) {
        scoreTrend = studentExams.slice(0, 5).reverse().map((e) => e.percentage);
        latestExamName = studentExams[0]?.examName || latestExamName;
        const sorted = [...studentExams].sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
        weakestSubject = sorted[0]?.subject || weakestSubject;
        strongestSubject = sorted[sorted.length - 1]?.subject || strongestSubject;
      }

      // Pull real student task assignments if present
      if (studentTasks.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        completedTasks = studentTasks.filter((t) => t.status === 'APPROVED').length;
        pendingTasks = studentTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'SUBMITTED' || t.status === 'REVISION_REQUIRED').length;
        overdueTasks = studentTasks.filter((t) => t.status !== 'APPROVED' && t.dueDate && t.dueDate < todayStr).length;

        if (overdueTasks > 0) {
          riskScore += overdueTasks * 12;
          riskFactors.push(`${overdueTasks} assigned tasks overdue in Student Portal`);
        }
      }

      if (currentLoggedUser && (currentLoggedUser.id === s.id || currentLoggedUser.studentId === s.studentId || currentLoggedUser.email === s.email)) {
        onlineStatus = 'STUDYING';
        lastActive = 'Active now in Student Portal';
      } else if (s.studentId === 'CF-STU-0005') {
        // High Risk Student
        overdueTasks = Math.max(overdueTasks, 3);
        pendingTasks = Math.max(pendingTasks, 2);
        riskScore += 30;
        riskFactors.push('3 assignments currently overdue past deadline');
        riskFactors.push('Unresponsive in portal for > 72 hours');
        onlineStatus = 'OFFLINE';
        lastActive = '3 days ago';
        weeklyStudyHours = 3.2;
        doubtsThisWeek = 0;
        gapSeverity = 'HIGH';
        if (studentExams.length === 0) scoreTrend = [58, 52, 49, 44, 48];
        weakestSubject = 'Quantitative Aptitude';
        weakestTopic = 'Compound Interest & Data Interpretation';
        strongestSubject = 'General Awareness';
      } else if (s.studentId === 'CF-STU-0006') {
        // Moderate Risk Student
        overdueTasks = Math.max(overdueTasks, 1);
        riskScore += 15;
        riskFactors.push('Declining score trajectory in latest mock exam');
        onlineStatus = 'AWAY';
        lastActive = 'Yesterday, 5:40 PM';
        weeklyStudyHours = 8.0;
        doubtsThisWeek = 5;
        gapSeverity = 'MEDIUM';
        if (studentExams.length === 0) scoreTrend = [74, 71, 68, 62, 63];
      } else if (s.studentId === 'CF-STU-0004') {
        // Top performer
        onlineStatus = 'STUDYING';
        lastActive = 'Active now';
        weeklyStudyHours = 22.4;
        doubtsThisWeek = 8;
        gapSeverity = 'LOW';
        if (studentExams.length === 0) scoreTrend = [88, 90, 94, 91, 95];
        weakestSubject = 'Current Affairs';
        weakestTopic = 'Global Economics';
        strongestSubject = 'Financial Reasoning';
      } else if (s.studentId === 'CF-STU-0001') {
        onlineStatus = 'ONLINE';
        lastActive = 'Active now';
        weeklyStudyHours = 18.0;
        doubtsThisWeek = 6;
        gapSeverity = 'LOW';
        if (studentExams.length === 0) scoreTrend = [78, 82, 84, 80, 86];
      } else {
        onlineStatus = idx % 2 === 0 ? 'ONLINE' : 'AWAY';
        lastActive = idx % 2 === 0 ? 'Active now' : '45 mins ago';
      }

      riskScore = Math.min(100, riskScore);

      let riskLevel: StudentRiskLevel = 'SAFE';
      if (riskScore >= 55) {
        riskLevel = 'CRITICAL';
      } else if (riskScore >= 25) {
        riskLevel = 'MODERATE';
      }

      const totalTasks = completedTasks + pendingTasks + overdueTasks;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const studentInterventions = interventionsMap[s.studentId] || [];
      const studentNotes = notesMap[s.studentId] || [];

      return {
        studentId: s.studentId,
        student: s,
        riskLevel,
        riskScore,
        riskFactors,
        onlineStatus,
        lastActive,
        weeklyStudyHours,
        attendance: {
          rate: att,
          classesAttended: Math.round((att / 100) * 40),
          totalClasses: 40,
          trend: att < 75 ? 'DOWN' : att > 90 ? 'UP' : 'STABLE',
          consecutiveAbsences: att < 65 ? 3 : att < 75 ? 1 : 0,
        },
        academics: {
          averageScore: avg,
          latestScore: scoreTrend[scoreTrend.length - 1],
          latestExamName: 'Comprehensive Mock Assessment',
          scoreTrend,
          weakestSubject,
          weakestTopic,
          strongestSubject,
          rankInBatch: idx + 1,
        },
        tasks: {
          assigned: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
          completionRate,
        },
        aiRadar: {
          doubtsAskedThisWeek: doubtsThisWeek,
          lastDoubtTopic: weakestTopic,
          knowledgeGapsCount: gapSeverity === 'HIGH' ? 5 : gapSeverity === 'MEDIUM' ? 3 : 1,
          gapSeverity,
        },
        interventions: studentInterventions,
        teacherNotes: studentNotes,
      };
    });

    // Compute Global Stats
    const totalMonitored = allMetrics.length;
    const onlineNow = allMetrics.filter((m) => m.onlineStatus === 'ONLINE' || m.onlineStatus === 'STUDYING').length;
    const safeCount = allMetrics.filter((m) => m.riskLevel === 'SAFE').length;
    const moderateRiskCount = allMetrics.filter((m) => m.riskLevel === 'MODERATE').length;
    const criticalRiskCount = allMetrics.filter((m) => m.riskLevel === 'CRITICAL').length;
    const avgAttendance = Math.round(
      allMetrics.reduce((acc, m) => acc + m.attendance.rate, 0) / (totalMonitored || 1)
    );
    const avgScore = Math.round(
      allMetrics.reduce((acc, m) => acc + m.academics.averageScore, 0) / (totalMonitored || 1)
    );

    const totalInterventionsThisMonth = Object.values(interventionsMap).reduce(
      (acc, list) => acc + list.length,
      0
    );

    const stats: MonitoringStats = {
      totalMonitored,
      onlineNow,
      safeCount,
      moderateRiskCount,
      criticalRiskCount,
      avgAttendance,
      avgScore,
      totalInterventionsThisMonth,
    };

    // Apply Filters
    let filtered = allMetrics;
    if (filter?.batchId) {
      filtered = filtered.filter((m) => m.student.batchId === filter.batchId);
    }
    if (filter?.riskLevel && filter.riskLevel !== 'ALL') {
      filtered = filtered.filter((m) => m.riskLevel === filter.riskLevel);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.student.name.toLowerCase().includes(q) ||
          m.student.studentId.toLowerCase().includes(q) ||
          m.student.email.toLowerCase().includes(q) ||
          m.student.courseName.toLowerCase().includes(q)
      );
    }

    return { metrics: filtered, stats };
  },

  async logIntervention(
    studentId: string,
    data: {
      type: InterventionLog['type'];
      title: string;
      summary: string;
      recordedBy: string;
    }
  ): Promise<InterventionLog> {
    const map = getStoredInterventionsMap();
    const newLog: InterventionLog = {
      id: `int-${Date.now()}`,
      studentId,
      timestamp: new Date().toISOString(),
      type: data.type,
      title: data.title,
      summary: data.summary,
      recordedBy: data.recordedBy,
      status: 'COMPLETED',
    };
    map[studentId] = [newLog, ...(map[studentId] || [])];
    persistInterventionsMap(map);
    return newLog;
  },

  async addTeacherNote(
    studentId: string,
    data: {
      author: string;
      role: string;
      note: string;
      priority: 'NORMAL' | 'URGENT';
    }
  ): Promise<TeacherNote> {
    const map = getStoredNotesMap();
    const newNote: TeacherNote = {
      id: `note-${Date.now()}`,
      studentId,
      author: data.author,
      role: data.role,
      note: data.note,
      date: new Date().toISOString().split('T')[0],
      priority: data.priority,
    };
    map[studentId] = [newNote, ...(map[studentId] || [])];
    persistNotesMap(map);
    return newNote;
  },

  generateWhatsAppUrl(
    student: { name: string; phone: string; guardianPhone?: string; studentId: string },
    type: 'ATTENDANCE_WARNING' | 'ACADEMIC_ALERT' | 'APPRECIATION' | 'CUSTOM',
    customText?: string
  ): string {
    const targetPhone = (student.guardianPhone || student.phone || '').replace(/\D/g, '');
    let message = '';

    if (type === 'ATTENDANCE_WARNING') {
      message = `*Cubit Future Academy — Academic Attendance Alert*\n\nDear Parent/Guardian,\nThis is an official notice regarding *${student.name}* (ID: ${student.studentId}). Their attendance has dropped below our mandated 75% threshold. Please connect with our faculty coordinator today to discuss remediation.\n\nHelpline: +91 98111 22334\nPortal: https://future-six-fawn.vercel.app`;
    } else if (type === 'ACADEMIC_ALERT') {
      message = `*Cubit Future Academy — Academic Progress Update*\n\nDear Student/Parent,\nOur faculty monitoring radar has flagged areas requiring reinforcement in upcoming mock assessments for *${student.name}* (${student.studentId}). Remedial practice modules and 1-on-1 faculty guidance are now available in your portal.\n\nLogin: https://future-six-fawn.vercel.app/login`;
    } else if (type === 'APPRECIATION') {
      message = `*Cubit Future Academy — Commendation Note*\n\nCongratulations! *${student.name}* has demonstrated outstanding academic consistency and top percentile marks this week. Keep up the brilliant effort!\n\nCubit Future Faculty`;
    } else {
      message = customText || `Message from Cubit Future Academy regarding student ${student.name}.`;
    }

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  },
};
