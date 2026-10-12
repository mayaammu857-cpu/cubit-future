import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import get_db_connection

router = APIRouter(prefix="/api/v1/teachers", tags=["Teacher Management"])

class CreateTeacherPayload(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    assignedBatches: Optional[List[str]] = []
    assignedCourses: Optional[List[str]] = []
    specialization: Optional[str] = "General Curriculum"
    password: Optional[str] = "Teacher@2026"

class UpdateTeacherBatchesPayload(BaseModel):
    assignedBatches: List[str]
    assignedCourses: Optional[List[str]] = None

@router.get("")
def list_teachers():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM teachers ORDER BY name ASC")
    rows = cursor.fetchall()

    teachers = []
    for r in rows:
        teachers.append({
            "id": r["id"],
            "userId": r["user_id"],
            "name": r["name"],
            "email": r["email"],
            "phone": r["phone"],
            "assignedBatches": json.loads(r["assigned_batches"] or "[]"),
            "assignedCourses": json.loads(r["assigned_courses"] or "[]"),
            "specialization": r["specialization"],
            "status": r["status"],
            "createdAt": r["created_at"]
        })

    conn.close()
    return {"teachers": teachers, "total": len(teachers)}

@router.post("")
def create_teacher(payload: CreateTeacherPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check duplicate
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (payload.email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Account with this email already exists.")

    cursor.execute("SELECT COUNT(*) FROM teachers")
    count = cursor.fetchone()[0] + 1
    t_id = f"tch-{count:03d}"
    u_id = f"user-tch-{count:03d}"
    now_str = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO users (id, name, email, phone, role, password_hash, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        u_id,
        payload.name.strip(),
        payload.email.strip(),
        payload.phone or "",
        "TEACHER",
        payload.password or "Teacher@2026",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        now_str
    ))

    cursor.execute("""
    INSERT INTO teachers (id, user_id, name, email, phone, assigned_batches, assigned_courses, specialization, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        t_id,
        u_id,
        payload.name.strip(),
        payload.email.strip(),
        payload.phone or "",
        json.dumps(payload.assignedBatches or []),
        json.dumps(payload.assignedCourses or []),
        payload.specialization or "General Curriculum",
        "ACTIVE",
        now_str
    ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "teacher": {
            "id": t_id,
            "userId": u_id,
            "name": payload.name.strip(),
            "email": payload.email.strip(),
            "assignedBatches": payload.assignedBatches,
            "specialization": payload.specialization
        }
    }

@router.get("/{teacher_id}/batches")
def get_teacher_batches(teacher_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM teachers WHERE id = ? OR user_id = ? OR email = ?", (teacher_id, teacher_id, teacher_id))
    t = cursor.fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Teacher not found.")

    batch_ids = json.loads(t["assigned_batches"] or "[]")
    batches = []
    if batch_ids:
        placeholders = ", ".join("?" for _ in batch_ids)
        cursor.execute(f"SELECT * FROM batches WHERE id IN ({placeholders})", batch_ids)
        for b in cursor.fetchall():
            cursor.execute("SELECT COUNT(*) FROM students WHERE batch_id = ? AND status = 'ACTIVE'", (b["id"],))
            s_count = cursor.fetchone()[0]
            batches.append({
                "id": b["id"],
                "name": b["name"],
                "code": b["code"],
                "courseId": b["course_id"],
                "courseName": b["course_name"],
                "studentCount": s_count,
                "attendanceRate": b["attendance_rate"],
                "status": b["status"]
            })

    conn.close()
    return {"teacherId": t["id"], "batches": batches}

@router.get("/{teacher_id}/students")
def get_teacher_students(teacher_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM teachers WHERE id = ? OR user_id = ? OR email = ?", (teacher_id, teacher_id, teacher_id))
    t = cursor.fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Teacher not found.")

    batch_ids = json.loads(t["assigned_batches"] or "[]")
    students = []
    if batch_ids:
        placeholders = ", ".join("?" for _ in batch_ids)
        cursor.execute(f"SELECT * FROM students WHERE batch_id IN ({placeholders}) AND status = 'ACTIVE' ORDER BY name ASC", batch_ids)
        for s in cursor.fetchall():
            # Get pending tasks count
            cursor.execute("""
            SELECT COUNT(*) FROM task_assignments
            WHERE student_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS', 'REVISION_REQUIRED')
            """, (s["student_id"],))
            pending_tasks = cursor.fetchone()[0]

            cursor.execute("""
            SELECT COUNT(*) FROM task_assignments
            WHERE student_id = ? AND status = 'SUBMITTED'
            """, (s["student_id"],))
            submitted_tasks = cursor.fetchone()[0]

            cursor.execute("""
            SELECT COUNT(*) FROM task_assignments
            WHERE student_id = ? AND status = 'APPROVED'
            """, (s["student_id"],))
            approved_tasks = cursor.fetchone()[0]

            students.append({
                "id": s["id"],
                "studentId": s["student_id"],
                "name": s["name"],
                "email": s["email"],
                "phone": s["phone"],
                "batchId": s["batch_id"],
                "batchName": s["batch_name"],
                "courseName": s["course_name"],
                "attendanceRate": s["attendance_rate"],
                "averageScore": s["average_score"],
                "pendingTasks": pending_tasks,
                "submittedTasks": submitted_tasks,
                "approvedTasks": approved_tasks,
                "googleSheetStatus": s["google_sheet_status"]
            })

    conn.close()
    return {"students": students, "total": len(students)}

@router.put("/{teacher_id}/batches")
def update_teacher_batches(teacher_id: str, payload: UpdateTeacherBatchesPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM teachers WHERE id = ? OR user_id = ?", (teacher_id, teacher_id))
    t = cursor.fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Teacher not found.")

    cursor.execute("""
    UPDATE teachers
    SET assigned_batches = ?
    WHERE id = ?
    """, (json.dumps(payload.assignedBatches), t["id"]))

    conn.commit()
    conn.close()
    return {"success": True, "message": "Assigned batches updated successfully."}
