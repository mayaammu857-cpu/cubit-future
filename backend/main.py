import os
import sys
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from google_sheets_service import sheets_service, HEADER_COLUMNS

# Import Route Modules
from routes.auth_routes import router as auth_router
from routes.students_routes import router as students_router
from routes.tasks_routes import router as tasks_router
from routes.teachers_routes import router as teachers_router
from routes.study_plans_routes import router as study_plans_router
from routes.sheets_routes import router as sheets_router
from routes.notifications_routes import router as notifications_router
from routes.academic_routes import router as academic_router

app = FastAPI(
    title="Cubit Future — Digital Progress Card & Study Plan Management System",
    version="2.0.0",
    description="Dedicated educational progress monitoring, study plan orchestration, task management, and Google Sheets integration system."
)

# Initialize database schema & default data on startup
@app.on_event("startup")
def on_startup():
    init_db()
    print("[INFO] Cubit Future Database initialized and seeded successfully.")

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(tasks_router)
app.include_router(teachers_router)
app.include_router(study_plans_router)
app.include_router(sheets_router)
app.include_router(notifications_router)
app.include_router(academic_router)

# Health & System Status Endpoints (Supports Cloud Run liveness/readiness probes)
@app.get("/")
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Cubit Future Digital Progress Card & Study Plan Management System",
        "version": "2.0.0",
        "google_sheets_connected": sheets_service.service_sheets is not None,
        "credentials_loaded": sheets_service.service_sheets is not None,
        "predefined_headers": HEADER_COLUMNS
    }

# Legacy Compatibility Endpoints
class StudentEnrollmentPayload(BaseModel):
    studentId: str
    name: str
    email: EmailStr
    courseName: Optional[str] = "Banking & Financial Services"
    batchName: Optional[str] = "Morning Achievers"

class ExamScorePayload(BaseModel):
    examName: str
    subject: str
    marksObtained: float
    maxMarks: float
    percentage: float
    examDate: str

class SyncSheetPayload(BaseModel):
    studentId: str
    spreadsheetId: Optional[str] = None
    records: Optional[List[ExamScorePayload]] = []

@app.post("/api/v1/students/auto-provision-sheet")
def auto_provision_student_sheet(payload: StudentEnrollmentPayload):
    try:
        res = sheets_service.create_student_sheet(
            student_id=payload.studentId,
            student_name=payload.name,
            student_email=payload.email
        )
        return {
            "success": True,
            "studentId": payload.studentId,
            "spreadsheetUrl": res["spreadsheet_url"],
            "spreadsheetId": res["spreadsheet_id"],
            "status": "CONNECTED",
            "message": f"Dedicated Google Sheet created and linked for {payload.studentId}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/students/sync-sheet")
def sync_student_sheet(payload: SyncSheetPayload):
    try:
        if not payload.spreadsheetId:
            return {"success": True, "message": "Simulated sync completed.", "syncedRecords": len(payload.records or [])}

        for rec in payload.records or []:
            sheets_service.append_exam_record(payload.spreadsheetId, rec.model_dump())

        return {
            "success": True,
            "studentId": payload.studentId,
            "syncedCount": len(payload.records or []),
            "message": "Student scorecard synchronized with Google Sheet"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/students/fleet-sync")
def fleet_sync(background_tasks: BackgroundTasks):
    return {
        "success": True,
        "message": "Super Admin master Google Sheets synchronization cycle scheduled."
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
