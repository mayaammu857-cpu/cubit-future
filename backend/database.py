import os
import sqlite3
import json
import uuid
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "cubit_future.db")
)

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 2. Courses Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        duration_months INTEGER DEFAULT 6,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL
    )
    """)

    # 3. Batches Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        course_id TEXT NOT NULL,
        course_name TEXT NOT NULL,
        start_date TEXT,
        status TEXT DEFAULT 'ACTIVE',
        attendance_rate REAL DEFAULT 92.5,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
    """)

    # 4. Teachers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        assigned_batches TEXT DEFAULT '[]',
        assigned_courses TEXT DEFAULT '[]',
        specialization TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 5. Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        student_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        course_id TEXT,
        course_name TEXT,
        batch_id TEXT,
        batch_name TEXT,
        enrollment_date TEXT,
        status TEXT DEFAULT 'ACTIVE',
        guardian_name TEXT,
        guardian_phone TEXT,
        address TEXT,
        blood_group TEXT,
        date_of_birth TEXT,
        google_sheet_status TEXT DEFAULT 'CONNECTED',
        google_sheet_url TEXT,
        last_sync_time TEXT,
        sync_error_message TEXT,
        attendance_rate REAL DEFAULT 100.0,
        average_score REAL DEFAULT 0.0,
        total_exams_attempted INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 6. Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        instructions TEXT,
        subject TEXT NOT NULL,
        topic TEXT,
        task_type TEXT NOT NULL,
        assigned_type TEXT NOT NULL,
        assigned_target_id TEXT NOT NULL,
        assigned_target_name TEXT,
        due_date TEXT NOT NULL,
        target_questions INTEGER DEFAULT 0,
        target_duration_mins INTEGER DEFAULT 30,
        priority TEXT DEFAULT 'Medium',
        reference_links TEXT DEFAULT '[]',
        attachments TEXT DEFAULT '[]',
        teacher_remarks TEXT,
        created_by TEXT NOT NULL,
        created_by_name TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 7. Task Assignments Table (Per Student)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS task_assignments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        batch_id TEXT,
        status TEXT NOT NULL DEFAULT 'ASSIGNED',
        actual_study_mins INTEGER DEFAULT 0,
        completed_questions INTEGER DEFAULT 0,
        student_notes TEXT,
        submission_evidence TEXT,
        submitted_at TEXT,
        approved_at TEXT,
        reviewed_by TEXT,
        teacher_feedback TEXT,
        revision_count INTEGER DEFAULT 0,
        revision_instructions TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    )
    """)

    # 8. Task History (Audit trail for task workflow)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS task_history (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        role TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (assignment_id) REFERENCES task_assignments(id) ON DELETE CASCADE
    )
    """)

    # 9. Study Plans Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        course_id TEXT NOT NULL,
        course_name TEXT,
        batch_id TEXT,
        student_id TEXT,
        start_date TEXT,
        end_date TEXT,
        schedule_json TEXT NOT NULL DEFAULT '[]',
        is_template INTEGER DEFAULT 0,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 10. Exam Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exam_records (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        exam_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        marks_obtained REAL NOT NULL,
        max_marks REAL NOT NULL DEFAULT 100.0,
        percentage REAL NOT NULL,
        exam_date TEXT NOT NULL,
        result_status TEXT DEFAULT 'PASSED',
        rank INTEGER,
        batch_name TEXT,
        source TEXT DEFAULT 'GOOGLE_SHEETS',
        created_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    )
    """)

    # 11. Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'INFO',
        category TEXT DEFAULT 'TASKS',
        is_read INTEGER DEFAULT 0,
        link TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 12. Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        affected_record TEXT NOT NULL,
        result TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    # 13. Google Sheets Config Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS google_sheets_config (
        id TEXT PRIMARY KEY,
        master_spreadsheet_id TEXT,
        master_spreadsheet_name TEXT,
        folder_id TEXT,
        service_account_email TEXT,
        auto_sync_interval_mins INTEGER DEFAULT 15,
        last_sync_time TEXT,
        last_sync_status TEXT,
        last_sync_records_count INTEGER DEFAULT 0,
        last_error TEXT,
        updated_at TEXT NOT NULL
    )
    """)

    conn.commit()
    seed_default_data(conn)
    conn.close()

def seed_default_data(conn: sqlite3.Connection):
    cursor = conn.cursor()

    # Check if courses already exist
    cursor.execute("SELECT COUNT(*) FROM courses")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().isoformat()
        # Seed Courses
        courses_data = [
            ("crs-01", "Banking & Financial Services", "BFS-2026", "Comprehensive training for Banking, IBPS, SBI, and Financial sector careers", 6, "ACTIVE", now_str),
            ("crs-02", "Data Analytics & AI Operations", "DAI-2026", "Applied statistics, Python, SQL, BI, and machine learning foundations", 4, "ACTIVE", now_str),
            ("crs-03", "Civil Services Foundation", "CSF-2026", "UPSC & State PSC exam coaching, GS, and CSAT curriculum", 12, "ACTIVE", now_str)
        ]
        cursor.executemany("INSERT INTO courses VALUES (?, ?, ?, ?, ?, ?, ?)", courses_data)

        # Seed Batches
        batches_data = [
            ("batch-01", "Morning Achievers", "BATCH-MA-01", "crs-01", "Banking & Financial Services", "2026-01-15", "ACTIVE", 94.5, now_str),
            ("batch-02", "Evening Scholars", "BATCH-ES-02", "crs-01", "Banking & Financial Services", "2026-02-01", "ACTIVE", 91.0, now_str),
            ("batch-03", "Data Intelligence Alpha", "BATCH-DA-01", "crs-02", "Data Analytics & AI Operations", "2026-03-01", "ACTIVE", 96.0, now_str)
        ]
        cursor.executemany("INSERT INTO batches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", batches_data)

    # Check if users already exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().isoformat()
        
        # 1. Super Admin
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "user-spadm-001",
            "Chief Administrator (Super Admin)",
            "superadmin@cubitfuture.com",
            "+91 99000 11223",
            "SUPER_ADMIN",
            "SuperAdmin@2026",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            now_str
        ))

        # 2. Admin
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "user-adm-001",
            "Dr. Anand Raman",
            "admin@cubitfuture.com",
            "+91 98111 22334",
            "ADMIN",
            "Admin@2026",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            now_str
        ))

        # 3. Teacher
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "user-tch-001",
            "Prof. Sarah Mathews",
            "teacher@cubitfuture.com",
            "+91 98222 33445",
            "TEACHER",
            "Teacher@2026",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            now_str
        ))
        cursor.execute("""
        INSERT INTO teachers (id, user_id, name, email, phone, assigned_batches, assigned_courses, specialization, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "tch-001",
            "user-tch-001",
            "Prof. Sarah Mathews",
            "teacher@cubitfuture.com",
            "+91 98222 33445",
            json.dumps(["batch-01", "batch-02"]),
            json.dumps(["crs-01"]),
            "Quantitative Aptitude & Financial Reasoning",
            "ACTIVE",
            now_str
        ))

        # 4. Student 1: Arjun Kumar (CF-STU-0001)
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "user-stu-001",
            "Arjun Kumar",
            "arjun.kumar@student.cubitfuture.com",
            "+91 98450 12345",
            "STUDENT",
            "student123",
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
            now_str
        ))
        cursor.execute("""
        INSERT INTO students (
            id, user_id, student_id, name, email, phone, course_id, course_name, batch_id, batch_name,
            enrollment_date, status, guardian_name, guardian_phone, address, blood_group, date_of_birth,
            google_sheet_status, google_sheet_url, last_sync_time, attendance_rate, average_score,
            total_exams_attempted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "stu-001",
            "user-stu-001",
            "CF-STU-0001",
            "Arjun Kumar",
            "arjun.kumar@student.cubitfuture.com",
            "+91 98450 12345",
            "crs-01",
            "Banking & Financial Services",
            "batch-01",
            "Morning Achievers",
            "2026-01-15",
            "ACTIVE",
            "K. Ramanathan",
            "+91 98450 12300",
            "Cochin, Kerala",
            "O+",
            "2002-04-12",
            "CONNECTED",
            "https://docs.google.com/spreadsheets/d/1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U/edit#gid=0",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            94.5,
            81.2,
            5,
            now_str,
            now_str
        ))

        # 5. Student 2: Sneha Nair (CF-STU-0002)
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "user-stu-002",
            "Sneha Nair",
            "sneha.nair@student.cubitfuture.com",
            "+91 98765 43210",
            "STUDENT",
            "student123",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            now_str
        ))
        cursor.execute("""
        INSERT INTO students (
            id, user_id, student_id, name, email, phone, course_id, course_name, batch_id, batch_name,
            enrollment_date, status, guardian_name, guardian_phone, address, blood_group, date_of_birth,
            google_sheet_status, google_sheet_url, last_sync_time, attendance_rate, average_score,
            total_exams_attempted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "stu-002",
            "user-stu-002",
            "CF-STU-0002",
            "Sneha Nair",
            "sneha.nair@student.cubitfuture.com",
            "+91 98765 43210",
            "crs-01",
            "Banking & Financial Services",
            "batch-01",
            "Morning Achievers",
            "2026-01-16",
            "ACTIVE",
            "V. Nair",
            "+91 98765 43200",
            "Trivandrum, Kerala",
            "A+",
            "2002-09-20",
            "CONNECTED",
            "https://docs.google.com/spreadsheets/d/1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U/edit#gid=0",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            98.0,
            88.5,
            5,
            now_str,
            now_str
        ))

        # 6. Student 3: Rahul Sharma (CF-STU-0003)
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "user-stu-003",
            "Rahul Sharma",
            "rahul.sharma@student.cubitfuture.com",
            "+91 98111 55667",
            "STUDENT",
            "student123",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            now_str
        ))
        cursor.execute("""
        INSERT INTO students (
            id, user_id, student_id, name, email, phone, course_id, course_name, batch_id, batch_name,
            enrollment_date, status, guardian_name, guardian_phone, address, blood_group, date_of_birth,
            google_sheet_status, google_sheet_url, last_sync_time, attendance_rate, average_score,
            total_exams_attempted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "stu-003",
            "user-stu-003",
            "CF-STU-0003",
            "Rahul Sharma",
            "rahul.sharma@student.cubitfuture.com",
            "+91 98111 55667",
            "crs-02",
            "Data Analytics & AI Operations",
            "batch-03",
            "Data Intelligence Alpha",
            "2026-03-01",
            "ACTIVE",
            "M. Sharma",
            "+91 98111 55600",
            "Calicut, Kerala",
            "B+",
            "2001-11-15",
            "CONNECTED",
            "https://docs.google.com/spreadsheets/d/1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U/edit#gid=0",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            92.0,
            76.0,
            3,
            now_str,
            now_str
        ))

        # Seed Exam Records for Arjun Kumar (CF-STU-0001)
        today = date.today()
        exam_records = [
            ("rec-01", "CF-STU-0001", "Diagnostic Mock Test 1", "Quantitative Aptitude", 42.0, 50.0, 84.0, (today - timedelta(days=28)).isoformat(), "EXCELLENT", 3, "Morning Achievers", "GOOGLE_SHEETS", now_str),
            ("rec-02", "CF-STU-0001", "Weekly Review Test 2", "Logical Reasoning", 38.0, 50.0, 76.0, (today - timedelta(days=21)).isoformat(), "PASSED", 6, "Morning Achievers", "GOOGLE_SHEETS", now_str),
            ("rec-03", "CF-STU-0001", "Banking Awareness Assessment", "Financial Awareness", 44.0, 50.0, 88.0, (today - timedelta(days=14)).isoformat(), "EXCELLENT", 2, "Morning Achievers", "GOOGLE_SHEETS", now_str),
            ("rec-04", "CF-STU-0001", "English Verbal Speed Test", "English Verbal", 36.0, 50.0, 72.0, (today - timedelta(days=7)).isoformat(), "PASSED", 9, "Morning Achievers", "GOOGLE_SHEETS", now_str),
            ("rec-05", "CF-STU-0001", "Comprehensive Mid-Term Mock", "Comprehensive Assessment", 86.0, 100.0, 86.0, (today - timedelta(days=2)).isoformat(), "EXCELLENT", 4, "Morning Achievers", "GOOGLE_SHEETS", now_str),
        ]
        cursor.executemany("INSERT INTO exam_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", exam_records)

        # Seed Initial Tasks & Assignments
        task_id_1 = "task-001"
        task_id_2 = "task-002"
        task_id_3 = "task-003"
        task_id_4 = "task-004"
        task_id_5 = "task-005"
        task_id_6 = "task-006"

        tasks_list = [
            (
                task_id_1,
                "Master Percentages & Fractional Equivalents",
                "Review fraction-to-percentage conversion tables (1/2 to 1/20). Solve all exercise questions in module 3.",
                "Quantitative Aptitude",
                "Arithmetic - Percentages",
                "Study",
                "BATCH",
                "batch-01",
                "Morning Achievers",
                today.isoformat(),
                30,
                45,
                "High",
                json.dumps(["https://cubitfuture.com/materials/percentages-handbook.pdf"]),
                json.dumps([]),
                "Focus on mental math speed. Target < 45 seconds per question.",
                "user-tch-001",
                "Prof. Sarah Mathews",
                (datetime.now() - timedelta(days=2)).isoformat()
            ),
            (
                task_id_2,
                "Complete 30 Practice Questions on Syllogisms",
                "Solve 30 categorical syllogisms including 'only a few' and 'possibility' cases without Venn diagram errors.",
                "Logical Reasoning",
                "Deductive Logic - Syllogisms",
                "Practice Questions",
                "BATCH",
                "batch-01",
                "Morning Achievers",
                today.isoformat(),
                30,
                40,
                "Medium",
                json.dumps([]),
                json.dumps([]),
                "Verify answer keys and write down error analysis for wrong attempts.",
                "user-tch-001",
                "Prof. Sarah Mathews",
                (datetime.now() - timedelta(days=1)).isoformat()
            ),
            (
                task_id_3,
                "Reading Comprehension & Vocabulary Analysis",
                "Read the assigned financial editorial. Identify 15 central vocabulary words and complete inference questions 1-10.",
                "English Verbal",
                "Reading Comprehension",
                "Reading",
                "BATCH",
                "batch-01",
                "Morning Achievers",
                (today + timedelta(days=1)).isoformat(),
                15,
                30,
                "Low",
                json.dumps(["https://cubitfuture.com/reading/financial-editorial-w4.pdf"]),
                json.dumps([]),
                "Submit summary notes in your own words.",
                "user-tch-001",
                "Prof. Sarah Mathews",
                datetime.now().isoformat()
            ),
            (
                task_id_4,
                "Banking Regulations & RBI Monetary Policy Revision",
                "Revise Repo Rate, Reverse Repo, CRR, SLR mechanisms and recent MPC committee statements.",
                "Financial Awareness",
                "Banking Structure",
                "Revision",
                "BATCH",
                "batch-01",
                "Morning Achievers",
                (today - timedelta(days=3)).isoformat(),
                25,
                50,
                "High",
                json.dumps([]),
                json.dumps([]),
                "Key topic for upcoming interview and mains exam.",
                "user-tch-001",
                "Prof. Sarah Mathews",
                (datetime.now() - timedelta(days=5)).isoformat()
            ),
            (
                task_id_5,
                "Data Interpretation Set 4 - Bar & Pie Charts",
                "Solve 4 complex DI sets combining bar graphs with table missing data.",
                "Quantitative Aptitude",
                "Data Interpretation",
                "Assignment",
                "BATCH",
                "batch-01",
                "Morning Achievers",
                (today - timedelta(days=4)).isoformat(),
                20,
                45,
                "High",
                json.dumps([]),
                json.dumps([]),
                "Needs revision on question 14 calculation approach.",
                "user-tch-001",
                "Prof. Sarah Mathews",
                (datetime.now() - timedelta(days=6)).isoformat()
            ),
            (
                task_id_6,
                "Full Length Sectional Mock Test 3",
                "Timed 45-minute online sectional mock test on Quant & Reasoning.",
                "Comprehensive Assessment",
                "Sectional Mock",
                "Mock Test",
                "BATCH",
                "batch-01",
                "Morning Achievers",
                (today + timedelta(days=3)).isoformat(),
                50,
                60,
                "High",
                json.dumps([]),
                json.dumps([]),
                "Simulates real exam environment. Attempt in one continuous sitting.",
                "user-tch-001",
                "Prof. Sarah Mathews",
                datetime.now().isoformat()
            ),
        ]
        cursor.executemany("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tasks_list)

        # Seed Task Assignments for Arjun Kumar (CF-STU-0001)
        assignments = [
            # 1. In Progress
            (
                "asgn-001",
                task_id_1,
                "CF-STU-0001",
                "Arjun Kumar",
                "batch-01",
                "IN_PROGRESS",
                25,
                18,
                "Completed conversion flashcards. Currently working on problem set 3.",
                "",
                None,
                None,
                None,
                "",
                0,
                "",
                (datetime.now() - timedelta(days=1)).isoformat(),
                datetime.now().isoformat()
            ),
            # 2. Submitted for Review
            (
                "asgn-002",
                task_id_2,
                "CF-STU-0001",
                "Arjun Kumar",
                "batch-01",
                "SUBMITTED",
                45,
                30,
                "All 30 questions completed with 28 correct. Analyzed mistake on Q12 and Q24.",
                "https://drive.google.com/file/d/submission-syllogisms-proof",
                (datetime.now() - timedelta(hours=3)).isoformat(),
                None,
                None,
                "",
                0,
                "",
                (datetime.now() - timedelta(days=1)).isoformat(),
                datetime.now().isoformat()
            ),
            # 3. Assigned (Upcoming/Today)
            (
                "asgn-003",
                task_id_3,
                "CF-STU-0001",
                "Arjun Kumar",
                "batch-01",
                "ASSIGNED",
                0,
                0,
                "",
                "",
                None,
                None,
                None,
                "",
                0,
                "",
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ),
            # 4. Approved (Completed & Verified by Teacher)
            (
                "asgn-004",
                task_id_4,
                "CF-STU-0001",
                "Arjun Kumar",
                "batch-01",
                "APPROVED",
                55,
                25,
                "Prepared summary mind-map covering all current interest rates and RBI tools.",
                "https://drive.google.com/file/d/rbi-notes-mindmap",
                (datetime.now() - timedelta(days=2)).isoformat(),
                (datetime.now() - timedelta(days=1)).isoformat(),
                "Prof. Sarah Mathews",
                "Excellent thorough conceptual clarity and neat tabular summary. Keep this for quick revision.",
                0,
                "",
                (datetime.now() - timedelta(days=4)).isoformat(),
                (datetime.now() - timedelta(days=1)).isoformat()
            ),
            # 5. Revision Required
            (
                "asgn-005",
                task_id_5,
                "CF-STU-0001",
                "Arjun Kumar",
                "batch-01",
                "REVISION_REQUIRED",
                30,
                15,
                "Submitted initial calculation notes.",
                "",
                (datetime.now() - timedelta(days=2)).isoformat(),
                None,
                "Prof. Sarah Mathews",
                "Questions 12 and 14 calculation steps were skipped. Re-calculate using approximation technique and resubmit.",
                1,
                "Please show complete step-by-step cross-multiplication for ratio comparisons.",
                (datetime.now() - timedelta(days=5)).isoformat(),
                (datetime.now() - timedelta(days=2)).isoformat()
            ),
            # 6. Assigned (Future Mock)
            (
                "asgn-006",
                task_id_6,
                "CF-STU-0001",
                "Arjun Kumar",
                "batch-01",
                "ASSIGNED",
                0,
                0,
                "",
                "",
                None,
                None,
                None,
                "",
                0,
                "",
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ),
        ]
        cursor.executemany("INSERT INTO task_assignments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", assignments)

        # Seed Task History
        history_records = [
            ("th-001", "asgn-004", "ASSIGNED", "Prof. Sarah Mathews", "TEACHER", "Assigned task to student batch", (datetime.now() - timedelta(days=4)).isoformat()),
            ("th-002", "asgn-004", "SUBMITTED", "Arjun Kumar", "STUDENT", "Student submitted task with study evidence", (datetime.now() - timedelta(days=2)).isoformat()),
            ("th-003", "asgn-004", "APPROVED", "Prof. Sarah Mathews", "TEACHER", "Teacher verified and approved task completion", (datetime.now() - timedelta(days=1)).isoformat()),
            ("th-004", "asgn-005", "SUBMITTED", "Arjun Kumar", "STUDENT", "Student submitted assignment", (datetime.now() - timedelta(days=3)).isoformat()),
            ("th-005", "asgn-005", "REVISION_REQUESTED", "Prof. Sarah Mathews", "TEACHER", "Teacher requested revision with feedback", (datetime.now() - timedelta(days=2)).isoformat()),
            ("th-006", "asgn-002", "SUBMITTED", "Arjun Kumar", "STUDENT", "Student completed 30 questions and submitted for review", (datetime.now() - timedelta(hours=3)).isoformat()),
        ]
        cursor.executemany("INSERT INTO task_history VALUES (?, ?, ?, ?, ?, ?, ?)", history_records)

        # Seed Study Plan
        plan_id = "plan-001"
        days_schedule = [
            {
                "day": "Monday",
                "subject": "Quantitative Aptitude",
                "focus": "Percentages & Fractional Shortcuts",
                "targetMins": 75,
                "targetQuestions": 30,
                "tasks": [
                    {"id": "t-m1", "title": "Study Percentages Concept", "durationMins": 30, "targetQuestions": 0, "type": "Study", "completed": True},
                    {"id": "t-m2", "title": "Solve 30 Practice Questions", "durationMins": 30, "targetQuestions": 30, "type": "Practice Questions", "completed": True},
                    {"id": "t-m3", "title": "Review Incorrect Answers", "durationMins": 15, "targetQuestions": 0, "type": "Revision", "completed": True}
                ]
            },
            {
                "day": "Tuesday",
                "subject": "Logical Reasoning",
                "focus": "Syllogisms & Conditional Deductions",
                "targetMins": 70,
                "targetQuestions": 30,
                "tasks": [
                    {"id": "t-tu1", "title": "Theory: Syllogism Possibility Cases", "durationMins": 30, "targetQuestions": 0, "type": "Study", "completed": True},
                    {"id": "t-tu2", "title": "Practice 30 Syllogism Questions", "durationMins": 40, "targetQuestions": 30, "type": "Practice Questions", "completed": True}
                ]
            },
            {
                "day": "Wednesday",
                "subject": "English Verbal",
                "focus": "Reading Comprehension & Critical Inferences",
                "targetMins": 60,
                "targetQuestions": 20,
                "tasks": [
                    {"id": "t-w1", "title": "Editorial Reading & Vocabulary", "durationMins": 30, "targetQuestions": 10, "type": "Reading", "completed": False},
                    {"id": "t-w2", "title": "RC Inference Questions 1-10", "durationMins": 30, "targetQuestions": 10, "type": "Practice Questions", "completed": False}
                ]
            },
            {
                "day": "Thursday",
                "subject": "Financial Awareness",
                "focus": "RBI Monetary Policy & Inflation Metrics",
                "targetMins": 60,
                "targetQuestions": 25,
                "tasks": [
                    {"id": "t-th1", "title": "Monetary Policy Study", "durationMins": 35, "targetQuestions": 0, "type": "Study", "completed": True},
                    {"id": "t-th2", "title": "Objective Banking Quiz (25 Qs)", "durationMins": 25, "targetQuestions": 25, "type": "Practice Questions", "completed": True}
                ]
            },
            {
                "day": "Friday",
                "subject": "Data Interpretation",
                "focus": "High-Density Table & Missing Data Sets",
                "targetMins": 75,
                "targetQuestions": 20,
                "tasks": [
                    {"id": "t-f1", "title": "Calculate Ratios & Percentage DI Sets", "durationMins": 45, "targetQuestions": 15, "type": "Assignment", "completed": False},
                    {"id": "t-f2", "title": "Error Correction Revision", "durationMins": 30, "targetQuestions": 5, "type": "Revision", "completed": False}
                ]
            },
            {
                "day": "Saturday",
                "subject": "Comprehensive Assessment",
                "focus": "Weekly Speed & Accuracy Benchmark Test",
                "targetMins": 60,
                "targetQuestions": 50,
                "tasks": [
                    {"id": "t-s1", "title": "Full Sectional Mock Test 3", "durationMins": 45, "targetQuestions": 50, "type": "Mock Test", "completed": False},
                    {"id": "t-s2", "title": "Performance Review with Teacher", "durationMins": 15, "targetQuestions": 0, "type": "Revision", "completed": False}
                ]
            }
        ]

        cursor.execute("""
        INSERT INTO study_plans (id, title, description, course_id, course_name, batch_id, student_id, start_date, end_date, schedule_json, is_template, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            plan_id,
            "Banking Achievers 6-Day Intensive Study Plan",
            "Structured day-by-day learning targets covering Quantitative, Reasoning, English, and Banking Awareness.",
            "crs-01",
            "Banking & Financial Services",
            "batch-01",
            "CF-STU-0001",
            (today - timedelta(days=2)).isoformat(),
            (today + timedelta(days=28)).isoformat(),
            json.dumps(days_schedule),
            1,
            "user-tch-001",
            now_str
        ))

        # Seed Notifications
        notifications = [
            ("notif-001", "user-stu-001", "STUDENT", "Task Submission Approved", "Prof. Sarah Mathews approved your task 'Banking Regulations & RBI Monetary Policy Revision'. Great work!", "SUCCESS", "TASKS", 0, "/student/tasks", (datetime.now() - timedelta(days=1)).isoformat()),
            ("notif-002", "user-stu-001", "STUDENT", "Revision Requested", "Prof. Sarah Mathews requested a revision on 'Data Interpretation Set 4'. Please check remarks.", "WARNING", "TASKS", 0, "/student/tasks", (datetime.now() - timedelta(days=2)).isoformat()),
            ("notif-003", "user-stu-001", "STUDENT", "New Task Assigned", "New study task assigned: 'Reading Comprehension & Vocabulary Analysis' due tomorrow.", "INFO", "TASKS", 0, "/student/tasks", (datetime.now() - timedelta(hours=5)).isoformat()),
            ("notif-004", "user-tch-001", "TEACHER", "New Task Submission", "Arjun Kumar submitted 'Complete 30 Practice Questions on Syllogisms' for verification.", "INFO", "TASKS", 0, "/teacher/tasks", (datetime.now() - timedelta(hours=3)).isoformat()),
        ]
        cursor.executemany("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", notifications)

        # Seed Google Sheets Config
        cursor.execute("""
        INSERT INTO google_sheets_config (
            id, master_spreadsheet_id, master_spreadsheet_name, folder_id, service_account_email,
            auto_sync_interval_mins, last_sync_time, last_sync_status, last_sync_records_count, last_error, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "cfg-01",
            "1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U",
            "Cubit Future - Student Marks & Performance Master",
            "1j9mdfTPvHG_OhAFsMLVWUoD6qH3PkXR1",
            "cubit-future-sheets@massive-acrobat-511306-j3.iam.gserviceaccount.com",
            15,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "CONNECTED",
            5,
            None,
            now_str
        ))

        # Seed Audit Log
        cursor.execute("""
        INSERT INTO audit_logs (id, user, user_role, action, affected_record, result, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "aud-001",
            "Chief Administrator",
            "SUPER_ADMIN",
            "SYSTEM_INITIALIZE",
            "Academy Database",
            "SUCCESS",
            "Digital Progress Card and Study Plan Management System provisioned successfully",
            now_str
        ))

        conn.commit()
