import os
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from database import get_db_connection

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    identifier: str
    password: Optional[str] = None
    role: Optional[str] = None  # Expected role if specified: STUDENT, TEACHER, SUPER_ADMIN, ADMIN

class RegisterStudentRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: Optional[str] = "student123"
    courseId: str
    courseName: Optional[str] = None
    batchId: Optional[str] = None
    batchName: Optional[str] = None
    dateOfBirth: Optional[str] = "2002-05-15"

@router.post("/login")
def login(payload: LoginRequest):
    clean_id = payload.identifier.strip().lower()
    raw_pass = (payload.password or "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Check Super Admin / Admin
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(id) = ?", (clean_id, clean_id))
    user_row = cursor.fetchone()

    # Master passwords allowed for rapid testing / development
    valid_master_passwords = {"SuperAdmin@2026", "Admin@2026", "Teacher@2026", "admin123", "student123", "cubit2026"}

    if user_row:
        stored_hash = user_row["password_hash"]
        user_role = user_row["role"]

        # Validate password
        if raw_pass != stored_hash and raw_pass not in valid_master_passwords:
            conn.close()
            raise HTTPException(status_code=401, detail="Invalid account password. Please verify credentials.")

        # If role isolation requested, ensure role matches
        if payload.role and payload.role != user_role:
            # Allow SUPER_ADMIN to access ADMIN routes
            if not (user_role == "SUPER_ADMIN" and payload.role == "ADMIN"):
                conn.close()
                raise HTTPException(status_code=403, detail=f"Account exists but is registered as {user_role}. Access to {payload.role} portal is restricted.")

        user_data = {
            "id": user_row["id"],
            "name": user_row["name"],
            "email": user_row["email"],
            "phone": user_row["phone"],
            "role": user_role,
            "avatarUrl": user_row["avatar_url"],
            "createdAt": user_row["created_at"]
        }

        # If Teacher, include teacher profile
        teacher_data = None
        if user_role == "TEACHER":
            cursor.execute("SELECT * FROM teachers WHERE user_id = ?", (user_row["id"],))
            t_row = cursor.fetchone()
            if t_row:
                teacher_data = {
                    "id": t_row["id"],
                    "userId": t_row["user_id"],
                    "name": t_row["name"],
                    "email": t_row["email"],
                    "assignedBatches": json.loads(t_row["assigned_batches"] or "[]"),
                    "assignedCourses": json.loads(t_row["assigned_courses"] or "[]"),
                    "specialization": t_row["specialization"]
                }

        token = f"jwt-token-{user_role.lower()}-{user_row['id']}-{int(datetime.now().timestamp())}"
        conn.close()
        return {
            "token": token,
            "user": user_data,
            "teacher": teacher_data
        }

    # 2. Check Student by student_id or email or phone
    clean_digits = "".join(filter(str.isdigit, clean_id))
    cursor.execute("""
    SELECT s.*, u.password_hash, u.avatar_url, u.id as u_id
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE LOWER(s.student_id) = ? OR LOWER(s.email) = ? OR (LENGTH(?) >= 10 AND s.phone LIKE ?)
    """, (clean_id, clean_id, clean_digits, f"%{clean_digits[-10:]}%" if clean_digits else ""))
    
    student_row = cursor.fetchone()
    if student_row:
        stored_hash = student_row["password_hash"]
        dob = student_row["date_of_birth"] or ""

        # Validate password or date of birth
        if raw_pass != stored_hash and raw_pass != dob and raw_pass not in valid_master_passwords:
            conn.close()
            raise HTTPException(status_code=401, detail="Invalid student credentials. Please enter correct password or Date of Birth (YYYY-MM-DD).")

        user_data = {
            "id": student_row["u_id"],
            "name": student_row["name"],
            "email": student_row["email"],
            "phone": student_row["phone"],
            "role": "STUDENT",
            "avatarUrl": student_row["avatar_url"],
            "createdAt": student_row["created_at"]
        }

        student_data = {
            "id": student_row["id"],
            "userId": student_row["user_id"],
            "studentId": student_row["student_id"],
            "name": student_row["name"],
            "email": student_row["email"],
            "phone": student_row["phone"],
            "courseId": student_row["course_id"],
            "courseName": student_row["course_name"],
            "batchId": student_row["batch_id"],
            "batchName": student_row["batch_name"],
            "enrollmentDate": student_row["enrollment_date"],
            "status": student_row["status"],
            "guardianName": student_row["guardian_name"],
            "guardianPhone": student_row["guardian_phone"],
            "address": student_row["address"],
            "bloodGroup": student_row["blood_group"],
            "dateOfBirth": student_row["date_of_birth"],
            "googleSheetStatus": student_row["google_sheet_status"],
            "googleSheetUrl": student_row["google_sheet_url"],
            "lastSyncTime": student_row["last_sync_time"],
            "attendanceRate": student_row["attendance_rate"],
            "averageScore": student_row["average_score"],
            "totalExamsAttempted": student_row["total_exams_attempted"]
        }

        token = f"jwt-token-student-{student_row['student_id']}-{int(datetime.now().timestamp())}"
        conn.close()
        return {
            "token": token,
            "user": user_data,
            "student": student_data
        }

    conn.close()
    raise HTTPException(status_code=404, detail="Account not found. Please verify identifier or register.")

@router.post("/register")
def register_student(payload: RegisterStudentRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check duplicate
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (payload.email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email is already registered.")

    cursor.execute("SELECT COUNT(*) FROM students")
    next_num = cursor.fetchone()[0] + 1
    student_id = f"CF-STU-{str(next_num).padStart(4, '0')}" if hasattr(str(next_num), "padStart") else f"CF-STU-{str(next_num).zfill(4)}"
    
    user_id = f"user-stu-{next_num:03d}"
    stu_id = f"stu-{next_num:03d}"
    now_str = datetime.now().isoformat()

    # Get course and batch names
    course_name = payload.courseName or "Banking & Financial Services"
    batch_name = payload.batchName or "Morning Achievers"
    batch_id = payload.batchId or "batch-01"

    cursor.execute("""
    INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        payload.name.strip(),
        payload.email.strip(),
        payload.phone.strip(),
        "STUDENT",
        payload.password or "student123",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
        stu_id,
        user_id,
        student_id,
        payload.name.strip(),
        payload.email.strip(),
        payload.phone.strip(),
        payload.courseId,
        course_name,
        batch_id,
        batch_name,
        datetime.now().strftime("%Y-%m-%d"),
        "ACTIVE",
        "Self / Guardian",
        payload.phone.strip(),
        "Kerala, India",
        "B+",
        payload.dateOfBirth or "2002-05-15",
        "CONNECTED",
        f"https://docs.google.com/spreadsheets/d/1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U/edit#gid={next_num}",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        100.0,
        0.0,
        0,
        now_str,
        now_str
    ))

    conn.commit()

    user_data = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": payload.email.strip(),
        "phone": payload.phone.strip(),
        "role": "STUDENT",
        "createdAt": now_str
    }

    student_data = {
        "id": stu_id,
        "userId": user_id,
        "studentId": student_id,
        "name": payload.name.strip(),
        "email": payload.email.strip(),
        "phone": payload.phone.strip(),
        "courseId": payload.courseId,
        "courseName": course_name,
        "batchId": batch_id,
        "batchName": batch_name,
        "enrollmentDate": datetime.now().strftime("%Y-%m-%d"),
        "status": "ACTIVE",
        "dateOfBirth": payload.dateOfBirth,
        "googleSheetStatus": "CONNECTED",
        "googleSheetUrl": f"https://docs.google.com/spreadsheets/d/1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U/edit#gid={next_num}",
        "attendanceRate": 100.0,
        "averageScore": 0.0,
        "totalExamsAttempted": 0
    }

    token = f"jwt-token-student-{student_id}-{int(datetime.now().timestamp())}"
    conn.close()

    return {
        "token": token,
        "user": user_data,
        "student": student_data
    }
