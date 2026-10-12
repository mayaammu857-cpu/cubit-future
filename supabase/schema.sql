-- ==============================================================================
-- CUBIT FUTURE ACADEMY — FULL SUPABASE DATABASE SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mirehthtnneezxmffwce/sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (For Authentication & Profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || uuid_generate_v4()),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'STUDENT', -- 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'COUNSELLOR' | 'STUDENT'
    password_hash TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY DEFAULT ('crs-' || uuid_generate_v4()),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    duration_months INTEGER DEFAULT 6,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY DEFAULT ('batch-' || uuid_generate_v4()),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'ACTIVE',
    attendance_rate NUMERIC DEFAULT 92.5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY DEFAULT ('tch-' || uuid_generate_v4()),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    assigned_batches JSONB DEFAULT '[]'::jsonb,
    assigned_courses JSONB DEFAULT '[]'::jsonb,
    specialization TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY DEFAULT ('stu-' || uuid_generate_v4()),
    user_id TEXT,
    student_id TEXT NOT NULL UNIQUE, -- e.g. CF-STU-0001
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    course_id TEXT,
    course_name TEXT,
    batch_id TEXT,
    batch_name TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'ACTIVE',
    guardian_name TEXT,
    guardian_phone TEXT,
    address TEXT,
    blood_group TEXT,
    date_of_birth DATE,
    google_sheet_status TEXT DEFAULT 'CONNECTED',
    google_sheet_url TEXT,
    last_sync_time TEXT,
    sync_error_message TEXT,
    attendance_rate NUMERIC DEFAULT 100,
    average_score NUMERIC DEFAULT 0,
    total_exams_attempted INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Exam Records Table
CREATE TABLE IF NOT EXISTS public.exam_records (
    id TEXT PRIMARY KEY DEFAULT ('exam-rec-' || uuid_generate_v4()),
    exam_id TEXT NOT NULL,
    student_id TEXT REFERENCES public.students(student_id) ON DELETE CASCADE,
    exam_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    marks_obtained NUMERIC NOT NULL DEFAULT 0,
    max_marks NUMERIC NOT NULL DEFAULT 100,
    percentage NUMERIC NOT NULL DEFAULT 0,
    exam_date DATE DEFAULT CURRENT_DATE,
    result_status TEXT DEFAULT 'PASSED',
    rank INTEGER,
    batch_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT ('task-' || uuid_generate_v4()),
    title TEXT NOT NULL,
    instructions TEXT,
    subject TEXT NOT NULL,
    topic TEXT,
    task_type TEXT NOT NULL DEFAULT 'Assignment',
    assigned_type TEXT NOT NULL DEFAULT 'BATCH',
    assigned_target_id TEXT,
    assigned_target_name TEXT,
    due_date DATE NOT NULL,
    target_questions INTEGER DEFAULT 0,
    target_duration_mins INTEGER DEFAULT 30,
    priority TEXT DEFAULT 'Medium',
    reference_links JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    teacher_remarks TEXT,
    created_by TEXT,
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Task Assignments Table
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id TEXT PRIMARY KEY DEFAULT ('asgn-' || uuid_generate_v4()),
    task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.students(student_id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    batch_id TEXT,
    status TEXT NOT NULL DEFAULT 'ASSIGNED',
    actual_study_mins INTEGER DEFAULT 0,
    completed_questions INTEGER DEFAULT 0,
    student_notes TEXT,
    submission_evidence TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    reviewed_by TEXT,
    teacher_feedback TEXT,
    revision_count INTEGER DEFAULT 0,
    revision_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Study Plans Table
CREATE TABLE IF NOT EXISTS public.study_plans (
    id TEXT PRIMARY KEY DEFAULT ('plan-' || uuid_generate_v4()),
    title TEXT NOT NULL,
    description TEXT,
    course_id TEXT,
    course_name TEXT,
    batch_id TEXT,
    student_id TEXT,
    start_date DATE,
    end_date DATE,
    schedule_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_template BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || uuid_generate_v4()),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    target_role TEXT,
    target_user_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. Enable Row Level Security (RLS) & Grant Full Access Policies
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public full access to users" ON public.users;
    CREATE POLICY "Public full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to courses" ON public.courses;
    CREATE POLICY "Public full access to courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to batches" ON public.batches;
    CREATE POLICY "Public full access to batches" ON public.batches FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to teachers" ON public.teachers;
    CREATE POLICY "Public full access to teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to students" ON public.students;
    CREATE POLICY "Public full access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to exam_records" ON public.exam_records;
    CREATE POLICY "Public full access to exam_records" ON public.exam_records FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to tasks" ON public.tasks;
    CREATE POLICY "Public full access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to task_assignments" ON public.task_assignments;
    CREATE POLICY "Public full access to task_assignments" ON public.task_assignments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to study_plans" ON public.study_plans;
    CREATE POLICY "Public full access to study_plans" ON public.study_plans FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access to notifications" ON public.notifications;
    CREATE POLICY "Public full access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- 13. Seed Default Courses & Batches
-- ==============================================================================
INSERT INTO public.courses (id, name, code, description, duration_months, status)
VALUES 
    ('crs-01', 'Banking & Financial Services', 'BFS-2026', 'Comprehensive training for Banking & Financial careers', 6, 'ACTIVE'),
    ('crs-02', 'Data Analytics & AI Operations', 'DAI-2026', 'Applied statistics, Python & business intelligence', 4, 'ACTIVE'),
    ('crs-03', 'Civil Services Foundation', 'CSF-2026', 'UPSC & State PSC exam coaching curriculum', 12, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.batches (id, name, code, course_id, course_name, start_date, status)
VALUES 
    ('batch-01', 'Morning Achievers', 'BATCH-MA-01', 'crs-01', 'Banking & Financial Services', '2026-01-15', 'ACTIVE'),
    ('batch-02', 'Evening Scholars', 'BATCH-ES-02', 'crs-01', 'Banking & Financial Services', '2026-02-01', 'ACTIVE'),
    ('batch-03', 'Data Intelligence Alpha', 'BATCH-DA-01', 'crs-02', 'Data Analytics & AI Operations', '2026-03-01', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;
