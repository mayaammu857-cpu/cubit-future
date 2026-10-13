import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, Student, Teacher } from '../types';
import { authApi, studentApi, getIsDemoMode, setIsDemoMode as setStoredDemoMode } from '../services/api';
import { defaultDemoUsers, mockStudents } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  teacher: Teacher | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  login: (identifier: string, password?: string, role?: string) => Promise<User>;
  registerStudent: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    courseId: string;
    courseName?: string;
    dateOfBirth?: string;
  }) => Promise<Student>;
  logout: () => void;
  switchRole: (role: Role) => Promise<void>;
  refreshStudentData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(getIsDemoMode());

  const setDemoMode = (val: boolean) => {
    setStoredDemoMode(val);
    setIsDemoModeState(val);
  };

  const refreshStudentData = useCallback(async () => {
    try {
      const data = await studentApi.getMe();
      setStudent(data);
    } catch (err) {
      console.warn('Could not refresh student profile:', err);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('cf_auth_token');
        const savedRole = (localStorage.getItem('cf_user_role') as Role) || 'STUDENT';

        if (token) {
          // Hydrate user
          if (savedRole === 'SUPER_ADMIN') {
            setUser(defaultDemoUsers.superadmin);
            setStudent(null);
            setTeacher(null);
          } else if (savedRole === 'ADMIN') {
            setUser(defaultDemoUsers.admin);
            setStudent(null);
            setTeacher(null);
          } else if (savedRole === 'TEACHER') {
            const rawTeacher = localStorage.getItem('cf_teacher_data');
            let parsedTeacher: Teacher | null = null;
            if (rawTeacher) {
              try {
                parsedTeacher = JSON.parse(rawTeacher);
              } catch {}
            }
            if (parsedTeacher) {
              setUser({
                ...defaultDemoUsers.teacher,
                id: parsedTeacher.userId || parsedTeacher.id,
                name: parsedTeacher.name,
                email: parsedTeacher.email,
              });
              setTeacher(parsedTeacher);
            } else {
              setUser(defaultDemoUsers.teacher);
              setTeacher({
                id: 'tch-001',
                userId: 'user-tch-001',
                name: defaultDemoUsers.teacher.name,
                email: defaultDemoUsers.teacher.email,
                assignedBatches: ['batch-01', 'batch-02'],
                assignedCourses: ['crs-01'],
                specialization: 'Quantitative Aptitude & Financial Reasoning',
                status: 'ACTIVE',
              });
            }
            setStudent(null);
          } else if (savedRole === 'COUNSELLOR') {
            setUser(defaultDemoUsers.counsellor);
            setStudent(null);
            setTeacher(null);
          } else {
            try {
              const stuData = await studentApi.getMe();
              setUser({
                ...defaultDemoUsers.student,
                id: stuData.userId,
                name: stuData.name,
                email: stuData.email,
              });
              setStudent(stuData);
              setTeacher(null);
              if (stuData?.id) {
                localStorage.setItem('cf_current_student_id', stuData.id);
              }
            } catch (studentErr) {
              console.warn('Could not hydrate student session from studentApi, applying fallback:', studentErr);
              const fallbackStudent = mockStudents[0];
              setUser({
                ...defaultDemoUsers.student,
                id: fallbackStudent.userId,
                name: fallbackStudent.name,
                email: fallbackStudent.email,
              });
              setStudent(fallbackStudent);
              setTeacher(null);
              localStorage.setItem('cf_current_student_id', fallbackStudent.id);
            }
          }
        } else {
          // Default unauthenticated on clean start
          setUser(null);
          setStudent(null);
          setTeacher(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setStudent(null);
        setTeacher(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password?: string, role?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(identifier, password, role);
      setUser(res.user);
      localStorage.setItem('cf_auth_token', res.token);
      localStorage.setItem('cf_user_role', res.user.role);

      if (res.user.role === 'STUDENT') {
        const stuData = res.student || (await studentApi.getMe());
        setStudent(stuData);
        setTeacher(null);
        if (stuData?.id) {
          localStorage.setItem('cf_current_student_id', stuData.id);
        }
        localStorage.removeItem('cf_teacher_data');
      } else if (res.user.role === 'TEACHER') {
        setStudent(null);
        localStorage.removeItem('cf_current_student_id');
        const teacherData: Teacher = (res as any).teacher || {
          id: res.user.id.startsWith('tch-') ? res.user.id : `tch-${res.user.id.replace('user-tch-', '')}`,
          userId: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '',
          assignedBatches: ['batch-01', 'batch-02'],
          assignedCourses: ['crs-01'],
          specialization: 'Faculty Mentor',
          status: 'ACTIVE',
        };
        setTeacher(teacherData);
        localStorage.setItem('cf_teacher_data', JSON.stringify(teacherData));
      } else {
        setStudent(null);
        setTeacher(null);
        localStorage.removeItem('cf_current_student_id');
        localStorage.removeItem('cf_teacher_data');
      }
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    courseId: string;
    courseName?: string;
    dateOfBirth?: string;
  }): Promise<Student> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      setStudent(res.student);
      localStorage.setItem('cf_auth_token', res.token);
      localStorage.setItem('cf_user_role', 'STUDENT');
      localStorage.setItem('cf_current_student_id', res.student.id);
      return res.student;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const res = await authApi.switchRole(targetRole);
      setUser(res.user);
      localStorage.setItem('cf_auth_token', res.token);
      localStorage.setItem('cf_user_role', res.user.role);

      if (res.user.role === 'STUDENT') {
        const stuData = res.student || (await studentApi.getMe());
        setStudent(stuData);
        if (stuData?.id) {
          localStorage.setItem('cf_current_student_id', stuData.id);
        }
      } else {
        setStudent(null);
        localStorage.removeItem('cf_current_student_id');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cf_auth_token');
    localStorage.removeItem('cf_user_role');
    localStorage.removeItem('cf_current_student_id');
    localStorage.removeItem('cf_teacher_data');
    setUser(null);
    setStudent(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        teacher,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        isDemoMode,
        setDemoMode,
        login,
        registerStudent,
        logout,
        switchRole,
        refreshStudentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
