# ==============================================================================
# Cubit Future Academy — One-Click Google Cloud Run Deploy Script (PowerShell)
# Target Project: massive-acrobat-511306-j3
# ==============================================================================

$PROJECT_ID = "massive-acrobat-511306-j3"
$SERVICE_NAME = "cubit-future-backend"
$REGION = "asia-south1"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Cubit Future Backend - Google Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "  Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "  Service:    $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "  Region:     $REGION" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "`n[ERROR] Google Cloud SDK ('gcloud') is not found in PATH." -ForegroundColor Red
    Write-Host "Please install Google Cloud SDK from:" -ForegroundColor White
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Green
    Write-Host "`nAlternatively, you can open Google Cloud Shell in your browser:" -ForegroundColor White
    Write-Host "https://shell.cloud.google.com/?project=$PROJECT_ID" -ForegroundColor Green
    exit 1
}

# Set active project
Write-Host "`n[1/4] Setting active GCP project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
Write-Host "`n[2/4] Ensuring Cloud Run and Cloud Build APIs are enabled..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.yaml containerregistry.googleapis.com

# Deploy directly using Cloud Build & Cloud Run source deploy
Write-Host "`n[3/4] Building and deploying backend container to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
    --source . `
    --project $PROJECT_ID `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --set-env-vars "GOOGLE_DRIVE_FOLDER_ID=1j9mdfTPvHG_OhAFsMLVWUoD6qH3PkXR1,GOOGLE_MASTER_SPREADSHEET_ID=1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U"

# Retrieve public service URL
Write-Host "`n[4/4] Retrieving Cloud Run Service URL..." -ForegroundColor Cyan
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "  Service URL: $SERVICE_URL" -ForegroundColor Yellow
Write-Host "  API Docs:    $SERVICE_URL/docs" -ForegroundColor Yellow
Write-Host "  Health:      $SERVICE_URL/health" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`nUpdate your frontend .env file with:" -ForegroundColor White
Write-Host "VITE_API_BASE_URL=$SERVICE_URL/api/v1" -ForegroundColor Cyan
