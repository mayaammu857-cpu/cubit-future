import { Student } from './index';

export type StudentRiskLevel = 'SAFE' | 'MODERATE' | 'CRITICAL';
export type StudentOnlineStatus = 'ONLINE' | 'STUDYING' | 'AWAY' | 'OFFLINE';

export interface InterventionLog {
  id: string;
  studentId: string;
  timestamp: string;
  type: 'WHATSAPP_ALERT' | 'CALL_SCHEDULED' | 'REMEDIAL_ASSIGNED' | 'MENTOR_NOTE' | 'COUNSELLOR_FLAG';
  title: string;
  summary: string;
  recordedBy: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface TeacherNote {
  id: string;
  studentId: string;
  author: string;
  role: string;
  note: string;
  date: string;
  priority: 'NORMAL' | 'URGENT';
}

export interface StudentMonitoringMetric {
  studentId: string;
  student: Student;
  riskLevel: StudentRiskLevel;
  riskScore: number; // 0 - 100
  riskFactors: string[];
  onlineStatus: StudentOnlineStatus;
  lastActive: string;
  weeklyStudyHours: number;
  attendance: {
    rate: number;
    classesAttended: number;
    totalClasses: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    consecutiveAbsences: number;
  };
  academics: {
    averageScore: number;
    latestScore: number;
    latestExamName: string;
    scoreTrend: number[];
    weakestSubject: string;
    weakestTopic: string;
    strongestSubject: string;
    rankInBatch: number;
  };
  tasks: {
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  aiRadar: {
    doubtsAskedThisWeek: number;
    lastDoubtTopic: string;
    knowledgeGapsCount: number;
    gapSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  interventions: InterventionLog[];
  teacherNotes: TeacherNote[];
}

export interface MonitoringStats {
  totalMonitored: number;
  onlineNow: number;
  safeCount: number;
  moderateRiskCount: number;
  criticalRiskCount: number;
  avgAttendance: number;
  avgScore: number;
  totalInterventionsThisMonth: number;
}
