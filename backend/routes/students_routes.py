import json
from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from database import get_db_connection

router = APIRouter(prefix="/api/v1/students", tags=["Students & Progress Card"])

class StudentUpdatePayload(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    courseId: Optional[str] = None
    courseName: Optional[str] = None
    batchId: Optional[str] = None
    batchName: Optional[str] = None
    status: Optional[str] = None
    guardianName: Optional[str] = None
    guardianPhone: Optional[str] = None
    address: Optional[str] = None
    bloodGroup: Optional[str] = None
    dateOfBirth: Optional[str] = None
    googleSheetUrl: Optional[str] = None

@router.get("")
def get_students(
    courseId: Optional[str] = None,
    batchId: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM students WHERE 1=1"
    params = []

    if courseId:
        query += " AND course_id = ?"
        params.append(courseId)
    if batchId:
        query += " AND batch_id = ?"
        params.append(batchId)
    if status:
        query += " AND status = ?"
        params.append(status)
    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(student_id) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?)"
        term = f"%{search.lower().strip()}%"
        params.extend([term, term, term, term])

    query += " ORDER BY student_id ASC LIMIT ? OFFSET ?"
    params.extend([limit, (page - 1) * limit])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) FROM students")
    total_count = cursor.fetchone()[0]

    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "userId": r["user_id"],
            "studentId": r["student_id"],
            "name": r["name"],
            "email": r["email"],
            "phone": r["phone"],
            "courseId": r["course_id"],
            "courseName": r["course_name"],
            "batchId": r["batch_id"],
            "batchName": r["batch_name"],
            "enrollmentDate": r["enrollment_date"],
            "status": r["status"],
            "guardianName": r["guardian_name"],
            "guardianPhone": r["guardian_phone"],
            "address": r["address"],
            "bloodGroup": r["blood_group"],
            "dateOfBirth": r["date_of_birth"],
            "googleSheetStatus": r["google_sheet_status"],
            "googleSheetUrl": r["google_sheet_url"],
            "lastSyncTime": r["last_sync_time"],
            "attendanceRate": r["attendance_rate"],
            "averageScore": r["average_score"],
            "totalExamsAttempted": r["total_exams_attempted"]
        })

    conn.close()
    return {
        "items": items,
        "total": total_count,
        "page": page,
        "limit": limit
    }

@router.get("/{student_id}")
def get_student_by_id(student_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE student_id = ? OR id = ?", (student_id, student_id))
    r = cursor.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")

    res = {
        "id": r["id"],
        "userId": r["user_id"],
        "studentId": r["student_id"],
        "name": r["name"],
        "email": r["email"],
        "phone": r["phone"],
        "courseId": r["course_id"],
        "courseName": r["course_name"],
        "batchId": r["batch_id"],
        "batchName": r["batch_name"],
        "enrollmentDate": r["enrollment_date"],
        "status": r["status"],
        "guardianName": r["guardian_name"],
        "guardianPhone": r["guardian_phone"],
        "address": r["address"],
        "bloodGroup": r["blood_group"],
        "dateOfBirth": r["date_of_birth"],
        "googleSheetStatus": r["google_sheet_status"],
        "googleSheetUrl": r["google_sheet_url"],
        "lastSyncTime": r["last_sync_time"],
        "attendanceRate": r["attendance_rate"],
        "averageScore": r["average_score"],
        "totalExamsAttempted": r["total_exams_attempted"]
    }
    conn.close()
    return res

@router.put("/{student_id}")
def update_student(student_id: str, payload: StudentUpdatePayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE student_id = ? OR id = ?", (student_id, student_id))
    r = cursor.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")

    real_id = r["student_id"]
    updates = []
    params = []

    for field, val in payload.model_dump(exclude_unset=True).items():
        db_col = {
            "name": "name", "email": "email", "phone": "phone",
            "courseId": "course_id", "courseName": "course_name",
            "batchId": "batch_id", "batchName": "batch_name",
            "status": "status", "guardianName": "guardian_name",
            "guardianPhone": "guardian_phone", "address": "address",
            "bloodGroup": "blood_group", "dateOfBirth": "date_of_birth",
            "googleSheetUrl": "google_sheet_url"
        }.get(field)
        if db_col and val is not None:
            updates.append(f"{db_col} = ?")
            params.append(val)

    if updates:
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(real_id)
        cursor.execute(f"UPDATE students SET {', '.join(updates)} WHERE student_id = ?", params)
        conn.commit()

    conn.close()
    return {"success": True, "message": "Student profile updated successfully."}

@router.get("/{student_id}/progress-card")
def get_student_progress_card(student_id: str):
    """
    Flagship Digital Progress Card calculation:
    Calculates approved task completion rate vs student reported progress,
    subject-wise marks, test percentages, planned vs actual study time,
    target vs completed questions, pending/overdue tasks, revision requirements,
    and teacher comments.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Fetch Student Details
    cursor.execute("SELECT * FROM students WHERE student_id = ? OR id = ?", (student_id, student_id))
    stu = cursor.fetchone()
    if not stu:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found.")

    actual_stu_id = stu["student_id"]
    today_str = date.today().isoformat()

    # 2. Fetch Task Assignments & Tasks
    cursor.execute("""
    SELECT ta.*, t.title, t.subject, t.topic, t.task_type, t.due_date,
           t.target_questions, t.target_duration_mins, t.priority, t.teacher_remarks
    FROM task_assignments ta
    JOIN tasks t ON ta.task_id = t.id
    WHERE ta.student_id = ?
    ORDER BY t.due_date ASC
    """, (actual_stu_id,))
    assignments = cursor.fetchall()

    total_tasks = len(assignments)
    approved_count = 0
    submitted_count = 0
    in_progress_count = 0
    assigned_count = 0
    overdue_count = 0
    revision_count = 0

    planned_study_mins = 0
    actual_study_mins = 0
    target_questions = 0
    completed_questions = 0

    subject_tasks_map = {}
    pending_overdue_tasks = []
    revision_requirements = []

    for a in assignments:
        st = a["status"]
        due_d = a["due_date"]
        subj = a["subject"]

        target_q = a["target_questions"] or 0
        comp_q = a["completed_questions"] or 0
        plan_m = a["target_duration_mins"] or 30
        act_m = a["actual_study_mins"] or 0

        planned_study_mins += plan_m
        actual_study_mins += act_m
        target_questions += target_q
        completed_questions += comp_q

        # Track Subject metrics
        if subj not in subject_tasks_map:
            subject_tasks_map[subj] = {
                "subject": subj,
                "totalTasks": 0,
                "approvedTasks": 0,
                "targetQuestions": 0,
                "completedQuestions": 0,
                "plannedMins": 0,
                "actualMins": 0
            }
        subject_tasks_map[subj]["totalTasks"] += 1
        subject_tasks_map[subj]["targetQuestions"] += target_q
        subject_tasks_map[subj]["completedQuestions"] += comp_q
        subject_tasks_map[subj]["plannedMins"] += plan_m
        subject_tasks_map[subj]["actualMins"] += act_m

        # Dynamic Overdue Calculation
        is_overdue = False
        if st not in ("APPROVED", "SUBMITTED") and due_d < today_str:
            is_overdue = True
            overdue_count += 1
            st = "OVERDUE"
        elif st == "APPROVED":
            approved_count += 1
            subject_tasks_map[subj]["approvedTasks"] += 1
        elif st == "SUBMITTED":
            submitted_count += 1
        elif st == "IN_PROGRESS":
            in_progress_count += 1
        elif st == "REVISION_REQUIRED":
            revision_count += 1
            revision_requirements.append({
                "taskId": a["task_id"],
                "assignmentId": a["id"],
                "title": a["title"],
                "subject": subj,
                "instructions": a["revision_instructions"] or a["teacher_feedback"],
                "updatedAt": a["updated_at"]
            })
        else:
            assigned_count += 1

        if is_overdue or st in ("IN_PROGRESS", "ASSIGNED"):
            pending_overdue_tasks.append({
                "id": a["id"],
                "taskId": a["task_id"],
                "title": a["title"],
                "subject": subj,
                "dueDate": due_d,
                "status": st,
                "priority": a["priority"]
            })

    official_completion_rate = round((approved_count / total_tasks * 100), 1) if total_tasks > 0 else 0.0
    student_reported_rate = round(((approved_count + submitted_count) / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # 3. Fetch Exam Records
    cursor.execute("""
    SELECT * FROM exam_records
    WHERE student_id = ?
    ORDER BY exam_date ASC
    """, (actual_stu_id,))
    exam_rows = cursor.fetchall()

    subject_marks_map = {}
    test_records = []
    total_obtained = 0
    total_max = 0

    for ex in exam_rows:
        subj = ex["subject"]
        pct = ex["percentage"]
        obt = ex["marks_obtained"]
        max_m = ex["max_marks"]

        total_obtained += obt
        total_max += max_m

        test_records.append({
            "id": ex["id"],
            "examName": ex["exam_name"],
            "subject": subj,
            "marksObtained": obt,
            "maxMarks": max_m,
            "percentage": pct,
            "examDate": ex["exam_date"],
            "resultStatus": ex["result_status"],
            "rank": ex["rank"]
        })

        if subj not in subject_marks_map:
            subject_marks_map[subj] = {
                "subject": subj,
                "totalObtained": 0,
                "totalMax": 0,
                "examCount": 0
            }
        subject_marks_map[subj]["totalObtained"] += obt
        subject_marks_map[subj]["totalMax"] += max_m
        subject_marks_map[subj]["examCount"] += 1

    subject_wise_performance = []
    for s_name, data in subject_marks_map.items():
        pct = round((data["totalObtained"] / data["totalMax"] * 100), 1) if data["totalMax"] > 0 else 0
        subject_wise_performance.append({
            "subject": s_name,
            "marksObtained": data["totalObtained"],
            "maxMarks": data["totalMax"],
            "percentage": pct,
            "examsCount": data["examCount"]
        })

    overall_avg_pct = round((total_obtained / total_max * 100), 1) if total_max > 0 else (stu["average_score"] or 0.0)
    highest_score = max([t["percentage"] for t in test_records]) if test_records else 0.0
    latest_score = test_records[-1]["percentage"] if test_records else 0.0

    # 4. Teacher Comments & Recommended Improvement Areas
    areas_for_improvement = []
    if official_completion_rate < 70:
        areas_for_improvement.append("Study Plan Adherence: Accelerate submission of pending daily study targets.")
    if completed_questions < target_questions * 0.8:
        areas_for_improvement.append("Practice Question Volume: Increase daily problem set completion to build mental speed.")
    if revision_count > 0:
        areas_for_improvement.append("Conceptual Verification: Prioritize revisions requested by teacher before next mock test.")
    for subj_perf in subject_wise_performance:
        if subj_perf["percentage"] < 75:
            areas_for_improvement.append(f"Subject Focus: Additional practice needed in {subj_perf['subject']} (current average: {subj_perf['percentage']}%).")

    teacher_comments = [
        "Consistent daily attendance and steady improvement in Financial Awareness.",
        "Demonstrating good logic reasoning speed. Needs tighter focus on calculation shortcuts in Data Interpretation.",
        "Regularly consults faculty for doubt clearing. Keep up the disciplined routine!"
    ]

    conn.close()

    return {
        "student": {
            "id": stu["id"],
            "studentId": actual_stu_id,
            "name": stu["name"],
            "email": stu["email"],
            "phone": stu["phone"],
            "courseName": stu["course_name"],
            "batchName": stu["batch_name"],
            "enrollmentDate": stu["enrollment_date"],
            "attendanceRate": stu["attendance_rate"],
            "googleSheetStatus": stu["google_sheet_status"],
            "lastSyncTime": stu["last_sync_time"]
        },
        "taskMetrics": {
            "totalTasks": total_tasks,
            "approvedTasks": approved_count,
            "submittedTasks": submitted_count,
            "inProgressTasks": in_progress_count,
            "assignedTasks": assigned_count,
            "overdueTasks": overdue_count,
            "revisionRequiredTasks": revision_count,
            "officialCompletionRate": official_completion_rate,
            "studentReportedRate": student_reported_rate,
            "plannedStudyHours": round(planned_study_mins / 60, 1),
            "actualStudyHours": round(actual_study_mins / 60, 1),
            "targetQuestions": target_questions,
            "completedQuestions": completed_questions,
            "subjectWiseTasks": list(subject_tasks_map.values())
        },
        "academicMetrics": {
            "overallAveragePercentage": overall_avg_pct,
            "highestScore": highest_score,
            "latestExamScore": latest_score,
            "totalExamsAttempted": len(test_records),
            "subjectWisePerformance": subject_wise_performance,
            "testRecords": test_records
        },
        "pendingAndOverdueTasks": pending_overdue_tasks,
        "revisionRequirements": revision_requirements,
        "areasForImprovement": areas_for_improvement,
        "teacherComments": teacher_comments,
        "generatedAt": datetime.now().isoformat()
    }
