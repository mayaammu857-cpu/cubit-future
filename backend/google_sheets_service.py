import os
import glob
from typing import List, Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass

import googleapiclient.schema
# Fix known Python 3.13 MemoryError in dynamic schema docstring generation
googleapiclient.schema.Schemas.prettyPrintSchema = lambda self, schema: ''

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

HEADER_COLUMNS = [
    'Exam Name',
    'Subject',
    'Marks Obtained',
    'Total Marks',
    'Percentage',
    'Exam Date'
]

class GoogleSheetsService:
    def __init__(self, credentials_path: Optional[str] = None):
        """
        Initializes Google Sheets & Drive API clients using Google Service Account.
        Credentials path can be set via env GOOGLE_SERVICE_ACCOUNT_JSON or placed in backend/credentials/.
        """
        self.creds_path = self._resolve_credentials_path(credentials_path)
        self.service_sheets = None
        self.service_drive = None
        self._init_services()

    def _resolve_credentials_path(self, explicit_path: Optional[str] = None) -> Optional[str]:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.abspath(os.path.join(base_dir, ".."))

        candidates = []
        if explicit_path:
            candidates.append(explicit_path)
            candidates.append(os.path.join(base_dir, explicit_path))

        env_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
        if env_path:
            candidates.append(env_path)
            candidates.append(os.path.join(base_dir, env_path))

        # Standard configured location
        candidates.append(os.path.join(base_dir, "credentials", "service_account.json"))
        # Any json in backend/credentials/
        candidates.extend(glob.glob(os.path.join(base_dir, "credentials", "*.json")))
        # Any service account json in project root
        candidates.extend(glob.glob(os.path.join(root_dir, "*massive-acrobat*.json")))
        candidates.extend(glob.glob(os.path.join(root_dir, "*service_account*.json")))

        for path in candidates:
            if path and os.path.isfile(path):
                return path
        return None

    def _init_services(self):
        creds = None

        # 1. Check direct JSON string in environment variable (Cloud Run / Secret Manager)
        json_content = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON_CONTENT")
        if json_content and json_content.strip():
            try:
                import json
                info = json.loads(json_content.strip())
                creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
                print("[INFO] Google service account credentials loaded from GOOGLE_SERVICE_ACCOUNT_JSON_CONTENT env var.")
            except Exception as e:
                print(f"[WARN] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON_CONTENT env var: {e}")

        # 2. Check credentials file path
        if not creds and self.creds_path and os.path.exists(self.creds_path):
            try:
                creds = service_account.Credentials.from_service_account_file(
                    self.creds_path, scopes=SCOPES
                )
                print(f"[INFO] Google Sheets & Drive APIs connected successfully with {self.creds_path}.")
            except Exception as e:
                print(f"[ERROR] Failed to initialize Google API client from {self.creds_path}: {e}")

        # 3. Check Google Cloud Application Default Credentials (Cloud Run runtime identity)
        if not creds:
            try:
                import google.auth
                creds, project = google.auth.default(scopes=SCOPES)
                print(f"[INFO] Using Google Application Default Credentials (GCP runtime project: {project}).")
            except Exception as e:
                pass

        if not creds:
            print(f"[WARN] Google service account credentials not found. Running in mock/simulation mode.")
            return

        try:
            self.service_sheets = build('sheets', 'v4', credentials=creds)
            self.service_drive = build('drive', 'v3', credentials=creds)
            print("[INFO] Google Sheets & Drive API clients initialized successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to build Google Sheets/Drive service clients: {e}")

    def _get_target_folder_id(self) -> Optional[str]:
        env_folder = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
        if env_folder and env_folder.strip():
            return env_folder.strip()

        # Try to auto-detect any folder shared with this service account
        if self.service_drive:
            try:
                res = self.service_drive.files().list(
                    q="mimeType='application/vnd.google-apps.folder'",
                    pageSize=10,
                    fields="files(id, name)"
                ).execute()
                folders = res.get("files", [])
                if folders:
                    print(f"[INFO] Auto-detected shared Google Drive folder: '{folders[0]['name']}' ({folders[0]['id']})")
                    return folders[0]["id"]
            except Exception as e:
                print(f"[WARN] Auto folder detection check: {e}")
        return None

    def _get_master_spreadsheet_id(self) -> Optional[str]:
        env_sheet = os.getenv("GOOGLE_MASTER_SPREADSHEET_ID")
        if env_sheet and env_sheet.strip():
            return env_sheet.strip()

        # Check inside shared folder for any spreadsheet
        if self.service_drive:
            try:
                res = self.service_drive.files().list(
                    pageSize=10,
                    fields="files(id, name, mimeType)"
                ).execute()
                for f in res.get("files", []):
                    if f.get("mimeType") == "application/vnd.google-apps.spreadsheet":
                        print(f"[INFO] Auto-detected Master Spreadsheet: '{f['name']}' ({f['id']})")
                        return f["id"]
            except Exception as e:
                print(f"[WARN] Master sheet detection: {e}")
        return None

    def create_student_sheet(self, student_id: str, student_name: str, student_email: Optional[str] = None) -> Dict[str, str]:
        """
        Generates a dedicated Google Sheet tab for the student in the Master Spreadsheet,
        formats predefined headers, sets sharing permissions, and returns the sheet URL.
        """
        title = f"Cubit Future - {student_name} ({student_id})"

        # Simulation fallback if credentials not configured yet
        if not self.service_sheets:
            mock_sheet_id = f"mock-sheet-{student_id.lower().replace('-', '')}"
            return {
                "spreadsheet_id": mock_sheet_id,
                "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{mock_sheet_id}/edit",
                "status": "SIMULATED_READY"
            }

        master_id = self._get_master_spreadsheet_id()
        if master_id:
            tab_title = f"{student_id} - {student_name}"
            # Check existing sheets in master spreadsheet
            sheet_meta = self.service_sheets.spreadsheets().get(spreadsheetId=master_id).execute()
            existing_sheets = sheet_meta.get('sheets', [])
            tab_id = None

            for s in existing_sheets:
                props = s.get('properties', {})
                if props.get('title') == tab_title:
                    tab_id = props.get('sheetId')
                    break

            if tab_id is None:
                # Add student tab
                add_res = self.service_sheets.spreadsheets().batchUpdate(
                    spreadsheetId=master_id,
                    body={
                        'requests': [
                            {
                                'addSheet': {
                                    'properties': {
                                        'title': tab_title,
                                        'gridProperties': {'rowCount': 200, 'columnCount': 10, 'frozenRowCount': 1}
                                    }
                                }
                            }
                        ]
                    }
                ).execute()
                tab_id = add_res['replies'][0]['addSheet']['properties']['sheetId']

            # Update headers on student tab
            self.service_sheets.spreadsheets().values().update(
                spreadsheetId=master_id,
                range=f"'{tab_title}'!A1:F1",
                valueInputOption="RAW",
                body={'values': [HEADER_COLUMNS]}
            ).execute()

            # Share with student email if provided
            if student_email and self.service_drive:
                try:
                    self.service_drive.permissions().create(
                        fileId=master_id,
                        body={'type': 'user', 'role': 'reader', 'emailAddress': student_email},
                        fields='id',
                        sendNotificationEmail=False
                    ).execute()
                except Exception as pe:
                    print(f"[WARN] Could not share sheet with {student_email}: {pe}")

            return {
                "spreadsheet_id": master_id,
                "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{master_id}/edit#gid={tab_id}",
                "status": "CONNECTED"
            }

        # Fallback simulation if master sheet not available
        mock_sheet_id = f"mock-sheet-{student_id.lower().replace('-', '')}"
        return {
            "spreadsheet_id": mock_sheet_id,
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{mock_sheet_id}/edit",
            "status": "SIMULATED_READY"
        }

    def append_exam_record(self, spreadsheet_id: str, record: Dict[str, Any], tab_name: Optional[str] = None) -> bool:
        """
        Appends an exam score to the student's Google Sheet:
        [Exam Name, Subject, Marks Obtained, Total Marks, Percentage, Exam Date]
        """
        if not self.service_sheets:
            return True

        target_sheet = self._get_master_spreadsheet_id() or spreadsheet_id
        sheet_range = "A:F"

        if tab_name:
            sheet_range = f"'{tab_name}'!A:F"
        elif record.get("studentId"):
            try:
                meta = self.service_sheets.spreadsheets().get(spreadsheetId=target_sheet).execute()
                for s in meta.get('sheets', []):
                    title = s.get('properties', {}).get('title', '')
                    if record.get("studentId") in title:
                        sheet_range = f"'{title}'!A:F"
                        break
            except Exception:
                pass

        row_data = [[
            record.get("examName", ""),
            record.get("subject", ""),
            record.get("marksObtained", 0),
            record.get("maxMarks", 100),
            f"{record.get('percentage', 0)}%",
            record.get("examDate", "")
        ]]

        self.service_sheets.spreadsheets().values().append(
            spreadsheetId=target_sheet,
            range=sheet_range,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={'values': row_data}
        ).execute()
        return True

    def fetch_records(self, spreadsheet_id: str, tab_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Reads exam records from the student's Google Sheet for synchronization.
        """
        if not self.service_sheets:
            return []

        target_sheet = self._get_master_spreadsheet_id() or spreadsheet_id
        sheet_range = f"'{tab_name}'!A2:F" if tab_name else "A2:F"

        result = self.service_sheets.spreadsheets().values().get(
            spreadsheetId=target_sheet,
            range=sheet_range
        ).execute()

        rows = result.get('values', [])
        records = []
        for r in rows:
            if len(r) >= 6:
                records.append({
                    "examName": r[0],
                    "subject": r[1],
                    "marksObtained": float(r[2]) if str(r[2]).replace('.', '').isdigit() else 0,
                    "maxMarks": float(r[3]) if str(r[3]).replace('.', '').isdigit() else 100,
                    "percentage": r[4],
                    "examDate": r[5]
                })
        return records

# Singleton instance
sheets_service = GoogleSheetsService()
