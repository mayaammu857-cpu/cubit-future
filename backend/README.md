# Cubit Future Academy — Google Sheets Automation Backend

This backend module provides the automated server-side integration for Google Sheets API v4.

## Features

1. **Automatic Student Sheet Provisioning**: Upon student enrollment, automatically creates a dedicated Google Sheet named `Cubit Future - [Name] ([Student ID])`.
2. **Predefined Header Structure**: Locks the 6-column format:
   `| Exam Name | Subject | Marks Obtained | Total Marks | Percentage | Exam Date |`
3. **Automated Sharing**: Gives read access directly to the student's email address via Google Drive v3 API.
4. **Bi-directional Sync**: Pushes exam marks & scorecard updates directly into the sheet and syncs with the academy dashboard.

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a Project named `Cubit Future Academy`.
3. Enable **Google Sheets API** and **Google Drive API**.
4. Go to **IAM & Admin > Service Accounts**, create a service account and generate a JSON key.
5. Save the downloaded JSON file as:

   ```text
   backend/credentials/service_account.json
   ```

### 2. Environment Variables

Create `backend/.env` (or set environment variables):

```env
GOOGLE_SERVICE_ACCOUNT_JSON=credentials/service_account.json
PORT=8000
```

### 3. Run FastAPI Server

```bash
cd backend
pip install -r requirements.txt
python main:app
# Or: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
`http://localhost:8000/docs`
