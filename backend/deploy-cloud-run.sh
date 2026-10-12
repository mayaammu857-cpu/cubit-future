#!/usr/bin/env bash
# ==============================================================================
# Cubit Future Backend — Google Cloud Run Deployment Script (Bash / Cloud Shell)
# Target Project: massive-acrobat-511306-j3
# ==============================================================================

set -e

PROJECT_ID="massive-acrobat-511306-j3"
SERVICE_NAME="cubit-future-backend"
REGION="asia-south1"

echo "=========================================================="
echo "  Deploying Cubit Future Backend to Google Cloud Run"
echo "  Project: $PROJECT_ID"
echo "  Service: $SERVICE_NAME"
echo "  Region:  $REGION"
echo "=========================================================="

# Ensure gcloud is configured
gcloud config set project "$PROJECT_ID"

# Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com

# Deploy source directly via Cloud Build to Cloud Run
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "GOOGLE_DRIVE_FOLDER_ID=1j9mdfTPvHG_OhAFsMLVWUoD6qH3PkXR1,GOOGLE_MASTER_SPREADSHEET_ID=1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U"

# Print URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format "value(status.url)")

echo "=========================================================="
echo "  DEPLOYMENT COMPLETE!"
echo "  Service URL: $SERVICE_URL"
echo "  Interactive Docs: $SERVICE_URL/docs"
echo "  Health Check:     $SERVICE_URL/health"
echo "=========================================================="
