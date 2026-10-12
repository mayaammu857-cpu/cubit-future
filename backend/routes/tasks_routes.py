import json
from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(prefix="/api/v1/tasks", tags=["Task Assignment & Tracking System"])

class CreateTaskPayload(BaseModel):
    title: str
    instructions: Optional[str] = ""
    subject: str
    topic: Optional[str] = ""
    taskType: str  # Study, Revision, Practice Questions, Mock Test, Assignment, Reading, Custom
    assignmentTargetType: str  # 'BATCH' or 'STUDENT' or 'STUDENTS_LIST'
    targetId: Optional[str] = None  # batch_id or student_id
    studentIds: Optional[List[str]] = None  # if multiple selected students
    dueDate: str
    targetQuestions: Optional[int] = 0
    targetDurationMins: Optional[int] = 30
    priority: Optional[str] = "Medium"  # Low, Medium, High
    referenceLinks: Optional[List[str]] = []
    attachments: Optional[List[dict]] = []
    teacherRemarks: Optional[str] = ""
    createdBy: Optional[str] = "user-tch-001"
    createdByName: Optional[str] = "Prof. Sarah Mathews"

class UpdateProgressPayload(BaseModel):
    actualStudyMins: Optional[int] = None
    completedQuestions: Optional[int] = None
    studentNotes: Optional[str] = None
    status: Optional[str] = "IN_PROGRESS"

class SubmitTaskPayload(BaseModel):
    actualStudyMins: Optional[int] = 0
    completedQuestions: Optional[int] = 0
    studentNotes: Optional[str] = ""
    submissionEvidence: Optional[str] = ""

class ReviewTaskPayload(BaseModel):
    action: str  # 'APPROVE' or 'REQUEST_REVISION' or 'REOPEN'
    teacherFeedback: Optional[str] = ""
    revisionInstructions: Optional[str] = ""
    reviewedBy: Optional[str] = "Prof. Sarah Mathews"

@router.post("")
def create_task(payload: CreateTaskPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    task_id = f"task-{int(datetime.now().timestamp() * 1000)}"
    now_str = datetime.now().isoformat()

    # Determine assigned targets
    target_students = []
    target_name = ""

    if payload.assignmentTargetType == "BATCH" and payload.targetId:
        cursor.execute("SELECT name FROM batches WHERE id = ?", (payload.targetId,))
        b_row = cursor.fetchone()
        target_name = b_row["name"] if b_row else payload.targetId
        cursor.execute("SELECT student_id, name, batch_id FROM students WHERE batch_id = ? AND status = 'ACTIVE'", (payload.targetId,))
        for s in cursor.fetchall():
            target_students.append({"student_id": s["student_id"], "name": s["name"], "batch_id": s["batch_id"]})
    elif payload.assignmentTargetType == "STUDENT" and payload.targetId:
        cursor.execute("SELECT student_id, name, batch_id FROM students WHERE student_id = ? OR id = ?", (payload.targetId, payload.targetId))
        s_row = cursor.fetchone()
        if s_row:
            target_name = s_row["name"]
            target_students.append({"student_id": s_row["student_id"], "name": s_row["name"], "batch_id": s_row["batch_id"]})
        else:
            target_name = payload.createdByName or payload.targetId
            target_students.append({"student_id": payload.targetId, "name": target_name, "batch_id": "BATCH-01"})
    elif payload.studentIds:
        for s_id in payload.studentIds:
            cursor.execute("SELECT student_id, name, batch_id FROM students WHERE student_id = ? OR id = ?", (s_id, s_id))
            s_row = cursor.fetchone()
            if s_row:
                target_students.append({"student_id": s_row["student_id"], "name": s_row["name"], "batch_id": s_row["batch_id"]})
        target_name = f"{len(target_students)} Selected Students"

    if not target_students:
        conn.close()
        raise HTTPException(status_code=400, detail="No active students found for task assignment target.")

    # 1. Insert Master Task Record
    cursor.execute("""
    INSERT INTO tasks (
        id, title, instructions, subject, topic, task_type, assigned_type,
        assigned_target_id, assigned_target_name, due_date, target_questions,
        target_duration_mins, priority, reference_links, attachments, teacher_remarks,
        created_by, created_by_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        task_id,
        payload.title.strip(),
        payload.instructions or "",
        payload.subject.strip(),
        payload.topic or "",
        payload.taskType,
        payload.assignmentTargetType,
        payload.targetId or "MULTI",
        target_name,
        payload.dueDate,
        payload.targetQuestions or 0,
        payload.targetDurationMins or 30,
        payload.priority or "Medium",
        json.dumps(payload.referenceLinks or []),
        json.dumps(payload.attachments or []),
        payload.teacherRemarks or "",
        payload.createdBy or "user-tch-001",
        payload.createdByName or "Teacher",
        now_str
    ))

    # 2. Generate Individual Assignments for each student
    for s in target_students:
        asgn_id = f"asgn-{int(datetime.now().timestamp() * 1000)}-{s['student_id'][-4:]}"
        cursor.execute("""
        INSERT INTO task_assignments (
            id, task_id, student_id, student_name, batch_id, status,
            actual_study_mins, completed_questions, student_notes, submission_evidence,
            submitted_at, approved_at, reviewed_by, teacher_feedback, revision_count,
            revision_instructions, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            asgn_id,
            task_id,
            s["student_id"],
            s["name"],
            s["batch_id"],
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

        # Record initial history
        cursor.execute("""
        INSERT INTO task_history (id, assignment_id, action, performed_by, role, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            f"th-{asgn_id}",
            asgn_id,
            "ASSIGNED",
            payload.createdByName or "Teacher",
            "TEACHER",
            f"Assigned task: {payload.title}",
            now_str
        ))

        # Create In-App Notification for each student
        cursor.execute("""
        INSERT INTO notifications (id, user_id, role, title, message, type, category, is_read, link, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"notif-{asgn_id}",
            s["student_id"],
            "STUDENT",
            "New Study Task Assigned",
            f"'{payload.title}' ({payload.subject}) has been assigned. Due on {payload.dueDate}.",
            "INFO",
            "TASKS",
            0,
            "/student/tasks",
            now_str
        ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "taskId": task_id,
        "assignedCount": len(target_students),
        "message": f"Task created and assigned to {len(target_students)} student(s)."
    }

@router.get("")
def list_tasks(
    batchId: Optional[str] = None,
    studentId: Optional[str] = None,
    subject: Optional[str] = None,
    status: Optional[str] = None,
    taskType: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT ta.*, t.title, t.instructions, t.subject, t.topic, t.task_type,
           t.due_date, t.target_questions, t.target_duration_mins, t.priority,
           t.reference_links, t.attachments, t.teacher_remarks, t.created_by_name
    FROM task_assignments ta
    JOIN tasks t ON ta.task_id = t.id
    WHERE 1=1
    """
    params = []

    if batchId:
        query += " AND ta.batch_id = ?"
        params.append(batchId)
    if studentId:
        query += " AND ta.student_id = ?"
        params.append(studentId)
    if subject:
        query += " AND t.subject = ?"
        params.append(subject)
    if taskType:
        query += " AND t.task_type = ?"
        params.append(taskType)
    if status:
        query += " AND ta.status = ?"
        params.append(status)

    query += " ORDER BY ta.updated_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    today_str = date.today().isoformat()
    tasks_list = []

    for r in rows:
        st = r["status"]
        due_d = r["due_date"]
        # Overdue check
        if st not in ("APPROVED", "SUBMITTED") and due_d < today_str:
            st = "OVERDUE"

        tasks_list.append({
            "assignmentId": r["id"],
            "taskId": r["task_id"],
            "studentId": r["student_id"],
            "studentName": r["student_name"],
            "batchId": r["batch_id"],
            "title": r["title"],
            "instructions": r["instructions"],
            "subject": r["subject"],
            "topic": r["topic"],
            "taskType": r["task_type"],
            "dueDate": due_d,
            "targetQuestions": r["target_questions"],
            "completedQuestions": r["completed_questions"],
            "targetDurationMins": r["target_duration_mins"],
            "actualStudyMins": r["actual_study_mins"],
            "priority": r["priority"],
            "status": st,
            "studentNotes": r["student_notes"],
            "submissionEvidence": r["submission_evidence"],
            "submittedAt": r["submitted_at"],
            "approvedAt": r["approved_at"],
            "reviewedBy": r["reviewed_by"],
            "teacherFeedback": r["teacher_feedback"],
            "revisionCount": r["revision_count"],
            "revisionInstructions": r["revision_instructions"],
            "referenceLinks": json.loads(r["reference_links"] or "[]"),
            "attachments": json.loads(r["attachments"] or "[]"),
            "createdByName": r["created_by_name"],
            "updatedAt": r["updated_at"]
        })

    conn.close()
    return {"tasks": tasks_list, "total": len(tasks_list)}

@router.get("/student/{student_id}")
def get_student_tasks(student_id: str):
    """
    Dedicated Student Tasks endpoint categorized into:
    Today, Upcoming, In Progress, Submitted for Review, Completed (Approved), Overdue.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT ta.*, t.title, t.instructions, t.subject, t.topic, t.task_type,
           t.due_date, t.target_questions, t.target_duration_mins, t.priority,
           t.reference_links, t.attachments, t.teacher_remarks, t.created_by_name
    FROM task_assignments ta
    JOIN tasks t ON ta.task_id = t.id
    WHERE ta.student_id = ? OR ta.student_id = (SELECT student_id FROM students WHERE id = ? LIMIT 1)
    ORDER BY t.due_date ASC
    """, (student_id, student_id))
    rows = cursor.fetchall()

    today_str = date.today().isoformat()

    all_tasks = []
    today_tasks = []
    upcoming_tasks = []
    in_progress_tasks = []
    submitted_tasks = []
    completed_tasks = []
    overdue_tasks = []
    revision_tasks = []

    for r in rows:
        st = r["status"]
        due_d = r["due_date"]

        # Calculate overdue dynamically
        is_overdue = False
        if st not in ("APPROVED", "SUBMITTED") and due_d < today_str:
            is_overdue = True
            st = "OVERDUE"

        task_item = {
            "assignmentId": r["id"],
            "taskId": r["task_id"],
            "studentId": r["student_id"],
            "studentName": r["student_name"],
            "batchId": r["batch_id"],
            "title": r["title"],
            "instructions": r["instructions"],
            "subject": r["subject"],
            "topic": r["topic"],
            "taskType": r["task_type"],
            "dueDate": due_d,
            "targetQuestions": r["target_questions"],
            "completedQuestions": r["completed_questions"],
            "targetDurationMins": r["target_duration_mins"],
            "actualStudyMins": r["actual_study_mins"],
            "priority": r["priority"],
            "status": st,
            "studentNotes": r["student_notes"],
            "submissionEvidence": r["submission_evidence"],
            "submittedAt": r["submitted_at"],
            "approvedAt": r["approved_at"],
            "reviewedBy": r["reviewed_by"],
            "teacherFeedback": r["teacher_feedback"],
            "revisionCount": r["revision_count"],
            "revisionInstructions": r["revision_instructions"],
            "referenceLinks": json.loads(r["reference_links"] or "[]"),
            "attachments": json.loads(r["attachments"] or "[]"),
            "createdByName": r["created_by_name"],
            "updatedAt": r["updated_at"]
        }

        all_tasks.append(task_item)

        if st == "APPROVED":
            completed_tasks.append(task_item)
        elif st == "SUBMITTED":
            submitted_tasks.append(task_item)
        elif st == "REVISION_REQUIRED":
            revision_tasks.append(task_item)
        elif is_overdue:
            overdue_tasks.append(task_item)
        elif st == "IN_PROGRESS":
            in_progress_tasks.append(task_item)

        # Categorize by date
        if due_d == today_str and st != "APPROVED":
            today_tasks.append(task_item)
        elif due_d > today_str and st != "APPROVED":
            upcoming_tasks.append(task_item)

    conn.close()

    return {
        "studentId": student_id,
        "allTasks": all_tasks,
        "todayTasks": today_tasks,
        "upcomingTasks": upcoming_tasks,
        "inProgressTasks": in_progress_tasks,
        "submittedTasks": submitted_tasks,
        "completedTasks": completed_tasks,
        "overdueTasks": overdue_tasks,
        "revisionTasks": revision_tasks,
        "summary": {
            "total": len(all_tasks),
            "completed": len(completed_tasks),
            "submitted": len(submitted_tasks),
            "inProgress": len(in_progress_tasks),
            "overdue": len(overdue_tasks),
            "needsRevision": len(revision_tasks),
            "completionRate": round((len(completed_tasks) / len(all_tasks) * 100), 1) if all_tasks else 0
        }
    }

@router.patch("/assignment/{assignment_id}/progress")
def update_task_progress(assignment_id: str, payload: UpdateProgressPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM task_assignments WHERE id = ?", (assignment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task assignment not found.")

    if row["status"] == "APPROVED":
        conn.close()
        raise HTTPException(status_code=400, detail="Verified task cannot be modified.")

    now_str = datetime.now().isoformat()
    new_mins = payload.actualStudyMins if payload.actualStudyMins is not None else row["actual_study_mins"]
    new_qs = payload.completedQuestions if payload.completedQuestions is not None else row["completed_questions"]
    new_notes = payload.studentNotes if payload.studentNotes is not None else row["student_notes"]
    new_status = payload.status or "IN_PROGRESS"

    cursor.execute("""
    UPDATE task_assignments
    SET actual_study_mins = ?, completed_questions = ?, student_notes = ?, status = ?, updated_at = ?
    WHERE id = ?
    """, (new_mins, new_qs, new_notes, new_status, now_str, assignment_id))

    cursor.execute("""
    INSERT INTO task_history (id, assignment_id, action, performed_by, role, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        f"th-{int(datetime.now().timestamp() * 1000)}",
        assignment_id,
        "PROGRESS_UPDATED",
        row["student_name"],
        "STUDENT",
        f"Updated study time: {new_mins} mins, questions completed: {new_qs}",
        now_str
    ))

    conn.commit()
    conn.close()
    return {"success": True, "message": "Progress recorded successfully."}

@router.post("/assignment/{assignment_id}/submit")
def submit_task_for_review(assignment_id: str, payload: SubmitTaskPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT ta.*, t.title FROM task_assignments ta JOIN tasks t ON ta.task_id = t.id WHERE ta.id = ?", (assignment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task assignment not found.")

    now_str = datetime.now().isoformat()

    cursor.execute("""
    UPDATE task_assignments
    SET status = 'SUBMITTED',
        actual_study_mins = COALESCE(?, actual_study_mins),
        completed_questions = COALESCE(?, completed_questions),
        student_notes = COALESCE(?, student_notes),
        submission_evidence = ?,
        submitted_at = ?,
        updated_at = ?
    WHERE id = ?
    """, (
        payload.actualStudyMins or row["actual_study_mins"],
        payload.completedQuestions or row["completed_questions"],
        payload.studentNotes or row["student_notes"],
        payload.submissionEvidence or "",
        now_str,
        now_str,
        assignment_id
    ))

    # Audit log
    cursor.execute("""
    INSERT INTO task_history (id, assignment_id, action, performed_by, role, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        f"th-{int(datetime.now().timestamp() * 1000)}",
        assignment_id,
        "SUBMITTED",
        row["student_name"],
        "STUDENT",
        f"Submitted task for teacher review with notes: {payload.studentNotes[:100] if payload.studentNotes else 'None'}",
        now_str
    ))

    # In-App Notification for Teacher
    cursor.execute("""
    INSERT INTO notifications (id, user_id, role, title, message, type, category, is_read, link, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"notif-sub-{int(datetime.now().timestamp() * 1000)}",
        None,
        "TEACHER",
        "Student Task Submitted",
        f"{row['student_name']} submitted '{row['title']}' for review.",
        "INFO",
        "TASKS",
        0,
        "/teacher/tasks",
        now_str
    ))

    conn.commit()
    conn.close()
    return {"success": True, "message": "Task submitted for teacher review."}

@router.post("/assignment/{assignment_id}/review")
def review_task_submission(assignment_id: str, payload: ReviewTaskPayload):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT ta.*, t.title FROM task_assignments ta JOIN tasks t ON ta.task_id = t.id WHERE ta.id = ?", (assignment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task assignment not found.")

    now_str = datetime.now().isoformat()
    action = payload.action.upper()

    if action == "APPROVE":
        cursor.execute("""
        UPDATE task_assignments
        SET status = 'APPROVED',
            approved_at = ?,
            reviewed_by = ?,
            teacher_feedback = ?,
            updated_at = ?
        WHERE id = ?
        """, (now_str, payload.reviewedBy or "Teacher", payload.teacherFeedback or "Approved", now_str, assignment_id))

        # Notification for student
        cursor.execute("""
        INSERT INTO notifications (id, user_id, role, title, message, type, category, is_read, link, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"notif-app-{int(datetime.now().timestamp() * 1000)}",
            row["student_id"],
            "STUDENT",
            "Task Approved by Teacher",
            f"Your work for '{row['title']}' has been verified and approved by {payload.reviewedBy}.",
            "SUCCESS",
            "TASKS",
            0,
            "/student/tasks",
            now_str
        ))

        action_name = "APPROVED"
        log_detail = f"Verified and marked complete. Remarks: {payload.teacherFeedback}"

    elif action == "REQUEST_REVISION":
        new_rev_count = (row["revision_count"] or 0) + 1
        cursor.execute("""
        UPDATE task_assignments
        SET status = 'REVISION_REQUIRED',
            reviewed_by = ?,
            teacher_feedback = ?,
            revision_instructions = ?,
            revision_count = ?,
            updated_at = ?
        WHERE id = ?
        """, (
            payload.reviewedBy or "Teacher",
            payload.teacherFeedback or "Revision required",
            payload.revisionInstructions or payload.teacherFeedback or "Please revise and resubmit.",
            new_rev_count,
            now_str,
            assignment_id
        ))

        # Notification for student
        cursor.execute("""
        INSERT INTO notifications (id, user_id, role, title, message, type, category, is_read, link, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"notif-rev-{int(datetime.now().timestamp() * 1000)}",
            row["student_id"],
            "STUDENT",
            "Revision Required on Task",
            f"Teacher requested revision on '{row['title']}': {payload.revisionInstructions or payload.teacherFeedback}",
            "WARNING",
            "TASKS",
            0,
            "/student/tasks",
            now_str
        ))

        action_name = "REVISION_REQUESTED"
        log_detail = f"Requested revision #{new_rev_count}: {payload.revisionInstructions}"

    else:  # REOPEN
        cursor.execute("""
        UPDATE task_assignments
        SET status = 'IN_PROGRESS',
            reviewed_by = ?,
            teacher_feedback = ?,
            updated_at = ?
        WHERE id = ?
        """, (payload.reviewedBy or "Teacher", payload.teacherFeedback or "", now_str, assignment_id))

        action_name = "REOPENED"
        log_detail = "Reopened task for further student progress."

    # Audit trail
    cursor.execute("""
    INSERT INTO task_history (id, assignment_id, action, performed_by, role, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        f"th-{int(datetime.now().timestamp() * 1000)}",
        assignment_id,
        action_name,
        payload.reviewedBy or "Teacher",
        "TEACHER",
        log_detail,
        now_str
    ))

    conn.commit()
    conn.close()
    return {"success": True, "action": action, "message": f"Task submission {action.lower()}d successfully."}

@router.get("/assignment/{assignment_id}/history")
def get_task_history(assignment_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM task_history
    WHERE assignment_id = ?
    ORDER BY timestamp ASC
    """, (assignment_id,))
    rows = cursor.fetchall()

    history = []
    for r in rows:
        history.append({
            "id": r["id"],
            "assignmentId": r["assignment_id"],
            "action": r["action"],
            "performedBy": r["performed_by"],
            "role": r["role"],
            "details": r["details"],
            "timestamp": r["timestamp"]
        })

    conn.close()
    return {"history": history}

@router.post("/assignment/{assignment_id}/remind")
def send_task_reminder(assignment_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT ta.*, t.title, t.due_date
    FROM task_assignments ta
    JOIN tasks t ON ta.task_id = t.id
    WHERE ta.id = ?
    """, (assignment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task assignment not found.")

    now_str = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO notifications (id, user_id, role, title, message, type, category, is_read, link, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"notif-rem-{int(datetime.now().timestamp() * 1000)}",
        row["student_id"],
        "STUDENT",
        "Deadline Reminder",
        f"Reminder: '{row['title']}' is due on {row['due_date']}. Please submit your progress.",
        "WARNING",
        "TASKS",
        0,
        "/student/tasks",
        now_str
    ))

    conn.commit()
    conn.close()
    return {"success": True, "message": f"Deadline reminder notification dispatched to {row['student_name']}."}
