from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(prefix="/api/v1/academic", tags=["Academic Structure & Exams"])

class CreateBatchPayload(BaseModel):
    name: str
    code: str
    courseId: str
    startDate: Optional[str] = None

class CreateExamPayload(BaseModel):
    studentId: str
    examName: str
    subject: str
    marksObtained: float
    maxMarks: Optional[float] = 100.0
    examDate: Optional[str] = None
    batchName: Optional[str] = None

@router.get("/courses")
def list_courses():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses ORDER BY name ASC")
    rows = cursor.fetchall()
    courses = []
    for r in rows:
        cursor.execute("SELECT COUNT(*) FROM students WHERE course_id = ?", (r["id"],))
        s_cnt = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM batches WHERE course_id = ?", (r["id"],))
        b_cnt = cursor.fetchone()[0]
        courses.append({
            "id": r["id"],
            "name": r["name"],
            "code": r["code"],
            "description": r["description"],
            "durationMonths": r["duration_months"],
            "status": r["status"],
            "studentCount": s_cnt,
            "batchCount": b_cnt
        })

    conn.close()
    return {"courses": courses}

@router.get("/batches")
def list_batches(courseId: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM batches WHERE 1=1"
    params = []
    if courseId:
        query += " AND course_id = ?"
        params.append(courseId)

    query += " ORDER BY name ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    batches = []
    for r in rows:
        cursor.execute("SELECT COUNT(*) FROM students WHERE batch_id = ?", (r["id"],))
        s_cnt = cursor.fetchone()[0]
        batches.append({
            "id": r["id"],
            "name": r["name"],
            "code": r["code"],
            "courseId": r["course_id"],
            "courseName": r["course_name"],
            "startDate": r["start_date"],
            "status": r["status"],
            "attendanceRate": r["attendance_rate"],
            "studentCount": s_cnt
        })

    conn.close()
    return {"batches": batches}

@router.post("/batches")
def create_batch(payload: CreateBatchPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM courses WHERE id = ?", (payload.courseId,))
    c_row = cursor.fetchone()
    if not c_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found.")

    b_id = f"batch-{int(datetime.now().timestamp() * 1000)}"
    now_str = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO batches (id, name, code, course_id, course_name, start_date, status, attendance_rate, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        b_id,
        payload.name.strip(),
        payload.code.strip(),
        payload.courseId,
        c_row["name"],
        payload.startDate or datetime.now().strftime("%Y-%m-%d"),
        "ACTIVE",
        95.0,
        now_str
    ))

    conn.commit()
    conn.close()
    return {"success": True, "batchId": b_id, "message": "Batch created successfully."}

@router.get("/exams/{student_id}")
def get_student_exams(student_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM exam_records
    WHERE student_id = ? OR student_id = (SELECT student_id FROM students WHERE id = ? LIMIT 1)
    ORDER BY exam_date DESC
    """, (student_id, student_id))
    rows = cursor.fetchall()

    exams = []
    for r in rows:
        exams.append({
            "id": r["id"],
            "studentId": r["student_id"],
            "examName": r["exam_name"],
            "subject": r["subject"],
            "marksObtained": r["marks_obtained"],
            "maxMarks": r["max_marks"],
            "percentage": r["percentage"],
            "examDate": r["exam_date"],
            "resultStatus": r["result_status"],
            "rank": r["rank"],
            "batchName": r["batch_name"]
        })

    conn.close()
    return {"exams": exams, "total": len(exams)}

@router.post("/exams")
def create_exam_record(payload: CreateExamPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT student_id, batch_name FROM students WHERE student_id = ? OR id = ?", (payload.studentId, payload.studentId))
    stu = cursor.fetchone()
    if not stu:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")

    actual_stu_id = stu["student_id"]
    pct = round((payload.marksObtained / (payload.maxMarks or 100.0) * 100), 1)
    status = "EXCELLENT" if pct >= 85 else ("PASSED" if pct >= 50 else "FAILED")
    rec_id = f"rec-{int(datetime.now().timestamp() * 1000)}"
    now_str = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO exam_records (
        id, student_id, exam_name, subject, marks_obtained, max_marks,
        percentage, exam_date, result_status, batch_name, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rec_id,
        actual_stu_id,
        payload.examName.strip(),
        payload.subject.strip(),
        payload.marksObtained,
        payload.maxMarks or 100.0,
        pct,
        payload.examDate or datetime.now().strftime("%Y-%m-%d"),
        status,
        payload.batchName or stu["batch_name"],
        "INTERNAL_ASSESSMENT",
        now_str
    ))

    # Recalculate student averages
    cursor.execute("SELECT COUNT(*), AVG(percentage) FROM exam_records WHERE student_id = ?", (actual_stu_id,))
    cnt, avg_pct = cursor.fetchone()

    cursor.execute("""
    UPDATE students SET total_exams_attempted = ?, average_score = ? WHERE student_id = ?
    """, (cnt, round(avg_pct or 0.0, 1), actual_stu_id))

    conn.commit()
    conn.close()
    return {
        "success": True,
        "examId": rec_id,
        "percentage": pct,
        "resultStatus": status,
        "averageScore": round(avg_pct or 0.0, 1),
        "totalExamsAttempted": cnt
    }

@router.delete("/exams/{exam_id}")
def delete_exam_record(exam_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT student_id FROM exam_records WHERE id = ?", (exam_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Exam record not found.")

    actual_stu_id = row["student_id"]
    cursor.execute("DELETE FROM exam_records WHERE id = ?", (exam_id,))

    cursor.execute("SELECT COUNT(*), AVG(percentage) FROM exam_records WHERE student_id = ?", (actual_stu_id,))
    cnt, avg_pct = cursor.fetchone()

    cursor.execute("""
    UPDATE students SET total_exams_attempted = ?, average_score = ? WHERE student_id = ?
    """, (cnt, round(avg_pct or 0.0, 1), actual_stu_id))

    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": "Exam record deleted successfully.",
        "averageScore": round(avg_pct or 0.0, 1),
        "totalExamsAttempted": cnt
    }
