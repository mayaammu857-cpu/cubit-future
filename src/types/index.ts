export type Role = 'STUDENT' | 'ADMIN' | 'COUNSELLOR' | 'TEACHER' | 'SUPER_ADMIN';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type GoogleSheetStatus = 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR' | 'PENDING';

export type ExamResultStatus = 'PASSED' | 'FAILED' | 'EXCELLENT';

export type TaskType =
  | 'Study'
  | 'Revision'
  | 'Practice Questions'
  | 'Mock Test'
  | 'Assignment'
  | 'Reading'
  | 'Custom';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskAssignmentStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REVISION_REQUIRED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  studentId?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string; // Format: CF-STU-0001
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  enrollmentDate: string;
  status: StudentStatus;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  googleSheetStatus: GoogleSheetStatus;
  googleSheetUrl?: string | null;
  lastSyncTime?: string | null;
  syncErrorMessage?: string | null;
  attendanceRate: number; // e.g. 94.5
  averageScore: number;   // e.g. 81.2
  totalExamsAttempted: number;
  password?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  assignedBatches: string[];
  assignedCourses: string[];
  specialization?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  instructions: string;
  subject: string;
  topic?: string;
  taskType: TaskType;
  assignedTargetType: 'BATCH' | 'STUDENT' | 'MULTI';
  targetId?: string;
  targetName?: string;
  dueDate: string;
  targetQuestions: number;
  targetDurationMins: number;
  priority: TaskPriority;
  referenceLinks?: string[];
  attachments?: any[];
  teacherRemarks?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface TaskAssignment {
  assignmentId: string;
  taskId: string;
  studentId: string;
  studentName: string;
  batchId: string;
  title: string;
  instructions: string;
  subject: string;
  topic?: string;
  taskType: TaskType;
  dueDate: string;
  targetQuestions: number;
  completedQuestions: number;
  targetDurationMins: number;
  actualStudyMins: number;
  priority: TaskPriority;
  status: TaskAssignmentStatus;
  studentNotes?: string;
  submissionEvidence?: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  reviewedBy?: string | null;
  teacherFeedback?: string | null;
  revisionCount: number;
  revisionInstructions?: string | null;
  referenceLinks?: string[];
  attachments?: any[];
  createdByName?: string;
  updatedAt: string;
}

export interface TaskHistoryItem {
  id: string;
  assignmentId: string;
  action: string;
  performedBy: string;
  role: string;
  details?: string;
  timestamp: string;
}

export interface StudyPlanTaskItem {
  id: string;
  title: string;
  durationMins: number;
  targetQuestions: number;
  type: TaskType;
  completed?: boolean;
}

export interface StudyPlanDay {
  day: string; // e.g. "Monday"
  subject: string;
  focus: string;
  targetMins: number;
  targetQuestions: number;
  tasks: StudyPlanTaskItem[];
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  studentId?: string;
  startDate: string;
  endDate: string;
  schedule: StudyPlanDay[];
  isTemplate: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface ExamRecord {
  id: string;
  examId?: string;
  examName: string;
  subject: string;
  marksObtained: number;
  maxMarks?: number;
  totalMarks?: number;
  percentage: number;
  examDate: string;
  resultStatus?: ExamResultStatus;
  status?: string;
  rank?: number;
  totalStudents?: number;
  timeTakenMinutes?: number;
  durationMinutes?: number;
  accuracy?: number;
  batchName?: string;
  studentId?: string;
  studentName?: string;
}

export interface SubjectPerformance {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  examsCount: number;
  improvement?: number;
}

export interface PerformanceAnalytics {
  totalExamsAttempted: number;
  averagePercentage: number;
  highestScore: number;
  latestExamScore: number;
  accuracyRate: number;
  improvementRate: number;
  trend: {
    examName: string;
    date: string;
    score: number;
    percentage: number;
    classAverage: number;
  }[];
  subjectWise: SubjectPerformance[];
}

export interface DigitalProgressCardData {
  student: {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    courseName: string;
    batchName: string;
    enrollmentDate: string;
    attendanceRate: number;
    googleSheetStatus: GoogleSheetStatus;
    lastSyncTime?: string;
  };
  taskMetrics: {
    totalTasks: number;
    approvedTasks: number;
    submittedTasks: number;
    inProgressTasks: number;
    assignedTasks: number;
    overdueTasks: number;
    revisionRequiredTasks: number;
    officialCompletionRate: number;
    studentReportedRate: number;
    plannedStudyHours: number;
    actualStudyHours: number;
    targetQuestions: number;
    completedQuestions: number;
    subjectWiseTasks: {
      subject: string;
      totalTasks: number;
      approvedTasks: number;
      targetQuestions: number;
      completedQuestions: number;
      plannedMins: number;
      actualMins: number;
    }[];
  };
  academicMetrics: {
    overallAveragePercentage: number;
    highestScore: number;
    latestExamScore: number;
    totalExamsAttempted: number;
    subjectWisePerformance: SubjectPerformance[];
    testRecords: ExamRecord[];
  };
  pendingAndOverdueTasks: {
    id: string;
    taskId: string;
    title: string;
    subject: string;
    dueDate: string;
    status: TaskAssignmentStatus;
    priority: TaskPriority;
  }[];
  revisionRequirements: {
    taskId: string;
    assignmentId: string;
    title: string;
    subject: string;
    instructions: string;
    updatedAt: string;
  }[];
  areasForImprovement: string[];
  teacherComments: string[];
  generatedAt: string;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  courseId: string;
  courseName: string;
  startDate: string;
  studentCount: number;
  activeExamsCount?: number;
  attendanceRate: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  durationMonths: number;
  totalModules?: number;
  activeBatchesCount?: number;
  studentCount?: number;
  batchCount?: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface GoogleSheetsSyncLog {
  id: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  recordsSynced: number;
  details: string;
  error?: string;
}

export interface StudentFilterOptions {
  search?: string;
  courseId?: string;
  batchId?: string;
  status?: string;
  googleSheetStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: string;
  timestamp?: string;
  createdAt?: string;
  read: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole?: Role;
  action: string;
  affectedRecord: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED';
  details?: string;
  ipAddress?: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: string;
  createdAt: string;
}

export interface Counsellor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedBatches: string[];
  status: 'ACTIVE' | 'INACTIVE';
  assignedStudentCount?: number;
  assignedStudentsCount?: number;
  lastActive?: string;
  createdAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  courseId: string;
  courseName?: string;
  maxMarks: number;
  passPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface MarksRecord {
  id: string;
  examId: string;
  examName: string;
  subject: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  resultStatus: 'PASSED' | 'FAILED' | 'EXCELLENT';
  published?: boolean;
  gradedBy?: string;
  updatedAt?: string;
}

export interface PermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  export: boolean;
  delete: boolean;
}

export interface RolePermission {
  module: string;
  moduleLabel: string;
  superAdmin: PermissionActions;
  admin: PermissionActions;
  counsellor: PermissionActions;
  student: PermissionActions;
  teacher?: PermissionActions;
}

export type ReportType =
  | 'ENROLMENT'
  | 'DIRECTORY'
  | 'EXAM_RESULTS'
  | 'COURSE_PERFORMANCE'
  | 'BATCH_PERFORMANCE'
  | 'PASS_FAIL'
  | 'GOOGLE_SHEETS_SYNC'
  | 'STAFF_ACCOUNTS';

export interface Campus {
  name: string;
  code: string;
  students: number;
  batches: number;
  status: string;
  head: string;
}

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ' | 'DESCRIPTIVE' | 'NUMERICAL';

export interface QuestionBankItem {
  id: string;
  courseId: string;
  courseName: string;
  subject: string;
  topic: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctOptionIndex: number;
  difficulty: QuestionDifficulty;
  marks: number;
  negativeMarks: number;
  explanation: string;
  addedBy: string;
  creatorRole: Role;
  createdAt: string;
  updatedAt?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  usageCount: number;
  accuracyRate: number;
}

export interface CourseQuestionStats {
  courseId: string;
  courseName: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  subjectsCount: number;
  uniqueTopicsCount: number;
  totalAttempts: number;
  avgAccuracy: number;
  coverageStatus: 'OPTIMAL' | 'MODERATE' | 'NEEDS_QUESTIONS';
  lastUpdated: string;
}

