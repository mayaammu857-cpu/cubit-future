import json
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(prefix="/api/v1/study-plans", tags=["Digital Study Plan"])

class CreateStudyPlanPayload(BaseModel):
    title: str
    description: Optional[str] = ""
    courseId: str
    courseName: Optional[str] = ""
    batchId: Optional[str] = None
    studentId: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    schedule: List[Dict[str, Any]]  # List of Day plans with tasks
    isTemplate: Optional[bool] = False
    createdBy: Optional[str] = "user-tch-001"

class AssignPlanPayload(BaseModel):
    templatePlanId: str
    targetType: str  # 'BATCH' or 'STUDENT'
    targetId: str    # batch_id or student_id
    startDate: Optional[str] = None

@router.get("")
def list_study_plans(isTemplate: Optional[bool] = None, courseId: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM study_plans WHERE 1=1"
    params = []

    if isTemplate is not None:
        query += " AND is_template = ?"
        params.append(1 if isTemplate else 0)
    if courseId:
        query += " AND course_id = ?"
        params.append(courseId)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    plans = []
    for r in rows:
        plans.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "courseId": r["course_id"],
            "courseName": r["course_name"],
            "batchId": r["batch_id"],
            "studentId": r["student_id"],
            "startDate": r["start_date"],
            "endDate": r["end_date"],
            "schedule": json.loads(r["schedule_json"] or "[]"),
            "isTemplate": bool(r["is_template"]),
            "createdBy": r["created_by"],
            "createdAt": r["created_at"]
        })

    conn.close()
    return {"plans": plans, "total": len(plans)}

@router.get("/student/{student_id}")
def get_student_study_plan(student_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Look for student-specific plan first, or batch plan
    cursor.execute("SELECT student_id, batch_id, course_id FROM students WHERE student_id = ? OR id = ?", (student_id, student_id))
    stu = cursor.fetchone()
    if not stu:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")

    actual_stu_id = stu["student_id"]
    batch_id = stu["batch_id"]

    cursor.execute("""
    SELECT * FROM study_plans
    WHERE student_id = ? OR (batch_id = ? AND is_template = 0)
    ORDER BY created_at DESC LIMIT 1
    """, (actual_stu_id, batch_id))
    row = cursor.fetchone()

    # If none found, fallback to first course template
    if not row:
        cursor.execute("SELECT * FROM study_plans WHERE course_id = ? OR is_template = 1 ORDER BY created_at DESC LIMIT 1", (stu["course_id"],))
        row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="No study plan found.")

    res = {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "courseId": row["course_id"],
        "courseName": row["course_name"],
        "batchId": row["batch_id"],
        "studentId": actual_stu_id,
        "startDate": row["start_date"],
        "endDate": row["end_date"],
        "schedule": json.loads(row["schedule_json"] or "[]"),
        "isTemplate": bool(row["is_template"]),
        "createdAt": row["created_at"]
    }

    conn.close()
    return res

@router.post("")
def create_study_plan(payload: CreateStudyPlanPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    plan_id = f"plan-{int(datetime.now().timestamp() * 1000)}"
    now_str = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO study_plans (
        id, title, description, course_id, course_name, batch_id, student_id,
        start_date, end_date, schedule_json, is_template, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        plan_id,
        payload.title.strip(),
        payload.description or "",
        payload.courseId,
        payload.courseName or "",
        payload.batchId,
        payload.studentId,
        payload.startDate or date.today().isoformat(),
        payload.endDate or (date.today() + timedelta(days=30)).isoformat(),
        json.dumps(payload.schedule or []),
        1 if payload.isTemplate else 0,
        payload.createdBy or "user-tch-001",
        now_str
    ))

    conn.commit()
    conn.close()

    return {"success": True, "planId": plan_id, "message": "Study plan created successfully."}

@router.post("/assign")
def assign_study_plan(payload: AssignPlanPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM study_plans WHERE id = ?", (payload.templatePlanId,))
    tmpl = cursor.fetchone()
    if not tmpl:
        conn.close()
        raise HTTPException(status_code=404, detail="Study plan template not found.")

    schedule = json.loads(tmpl["schedule_json"] or "[]")
    now_str = datetime.now().isoformat()
    start_d = payload.startDate or date.today().isoformat()

    new_plan_id = f"plan-{int(datetime.now().timestamp() * 1000)}"
    batch_id = payload.targetId if payload.targetType == "BATCH" else None
    student_id = payload.targetId if payload.targetType == "STUDENT" else None

    cursor.execute("""
    INSERT INTO study_plans (
        id, title, description, course_id, course_name, batch_id, student_id,
        start_date, end_date, schedule_json, is_template, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_plan_id,
        f"{tmpl['title']} - Assigned",
        tmpl["description"],
        tmpl["course_id"],
        tmpl["course_name"],
        batch_id,
        student_id,
        start_d,
        (date.today() + timedelta(days=30)).isoformat(),
        json.dumps(schedule),
        0,
        tmpl["created_by"],
        now_str
    ))

    # Also automatically generate task assignments for the target students
    target_students = []
    if payload.targetType == "BATCH":
        cursor.execute("SELECT student_id, name, batch_id FROM students WHERE batch_id = ? AND status = 'ACTIVE'", (batch_id,))
        for s in cursor.fetchall():
            target_students.append({"student_id": s["student_id"], "name": s["name"], "batch_id": s["batch_id"]})
    else:
        cursor.execute("SELECT student_id, name, batch_id FROM students WHERE student_id = ? OR id = ?", (student_id, student_id))
        s_row = cursor.fetchone()
        if s_row:
            target_students.append({"student_id": s_row["student_id"], "name": s_row["name"], "batch_id": s_row["batch_id"]})

    # For each day in schedule, create master task and individual assignments
    day_idx = 0
    for day in schedule:
        due_d = (date.today() + timedelta(days=day_idx)).isoformat()
        day_idx += 1
        for sub_task in day.get("tasks", []):
            t_id = f"task-sp-{int(datetime.now().timestamp() * 1000)}-{day_idx}"
            cursor.execute("""
            INSERT INTO tasks (
                id, title, instructions, subject, topic, task_type, assigned_type,
                assigned_target_id, assigned_target_name, due_date, target_questions,
                target_duration_mins, priority, reference_links, attachments, teacher_remarks,
                created_by, created_by_name, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                t_id,
                sub_task.get("title", f"{day.get('subject')} Task"),
                f"Study plan assignment for {day.get('day')}: {day.get('focus', '')}",
                day.get("subject", "General"),
                day.get("focus", ""),
                sub_task.get("type", "Study"),
                payload.targetType,
                payload.targetId,
                payload.targetType,
                due_d,
                sub_task.get("targetQuestions", 0),
                sub_task.get("durationMins", 30),
                "Medium",
                "[]",
                "[]",
                "Assigned via Digital Study Plan module",
                "user-tch-001",
                "Faculty",
                now_str
            ))

            for stu in target_students:
                asgn_id = f"asgn-sp-{t_id}-{stu['student_id'][-4:]}"
                cursor.execute("""
                INSERT INTO task_assignments (
                    id, task_id, student_id, student_name, batch_id, status,
                    actual_study_mins, completed_questions, student_notes, submission_evidence,
                    submitted_at, approved_at, reviewed_by, teacher_feedback, revision_count,
                    revision_instructions, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    asgn_id,
                    t_id,
                    stu["student_id"],
                    stu["name"],
                    stu["batch_id"],
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
                    now_str,
                    now_str
                ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "newPlanId": new_plan_id,
        "assignedStudentsCount": len(target_students),
        "message": f"Study plan assigned successfully to {len(target_students)} student(s)."
    }
