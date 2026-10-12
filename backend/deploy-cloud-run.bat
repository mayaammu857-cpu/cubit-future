@echo off
setlocal
echo ==========================================================
echo   Cubit Future Backend - Google Cloud Run Deployment
echo   Project ID: massive-acrobat-511306-j3
echo   Service:    cubit-future-backend
echo   Region:     asia-south1
echo ==========================================================

where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Google Cloud SDK ('gcloud') is not found in PATH.
    echo Please install Google Cloud SDK or deploy via Google Cloud Console:
    echo https://console.cloud.google.com/run?project=massive-acrobat-511306-j3
    pause
    exit /b 1
)

echo.
echo [1/3] Setting active GCP project...
call gcloud config set project massive-acrobat-511306-j3

echo.
echo [2/3] Building and deploying container to Cloud Run...
call gcloud run deploy cubit-future-backend ^
    --source . ^
    --project massive-acrobat-511306-j3 ^
    --region asia-south1 ^
    --platform managed ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 512Mi ^
    --cpu 1 ^
    --set-env-vars GOOGLE_DRIVE_FOLDER_ID=1j9mdfTPvHG_OhAFsMLVWUoD6qH3PkXR1,GOOGLE_MASTER_SPREADSHEET_ID=1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U

echo.
echo [3/3] Deployment completed!
echo Check your Cloud Run console:
echo https://console.cloud.google.com/run?project=massive-acrobat-511306-j3
pause
