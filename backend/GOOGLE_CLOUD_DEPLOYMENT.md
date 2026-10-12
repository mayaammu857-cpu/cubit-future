# Cubit Future Academy — Google Cloud Run Deployment Guide

Backend Google Cloud Run-ലേക്ക് deploy ചെയ്യുന്നതിനുള്ള വിശദമായ വിവരങ്ങൾ താഴെ നൽകിയിരിക്കുന്നു.
Target GCP Project: **`massive-acrobat-511306-j3`**

---

## 🚀 Deployment Options (3 വഴികൾ)

### Method 1: Google Cloud Shell വഴി Deploy ചെയ്യുക (ഏറ്റവും എളുപ്പമുള്ള വഴി)

നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ `gcloud` ഇൻസ്റ്റാൾ ചെയ്യേണ്ടതില്ല. ബ്രൗസറിലെ Cloud Shell വഴി നേരിട്ട് ചെയ്യാം:

1. ബ്രൗസറിൽ [Google Cloud Shell](https://shell.cloud.google.com/?project=massive-acrobat-511306-j3) തുറക്കുക.

2. പ്രൊജക്റ്റ് ക്ലോൺ ചെയ്യുക അല്ലെങ്കിൽ `backend` ഫോൾഡറിലേക്ക് മാറുക:

   ```bash
   cd backend
   ```

3. താഴെ നൽകിയിരിക്കുന്ന കമാൻഡ് റൺ ചെയ്യുക:

   ```bash
   chmod +x deploy-cloud-run.sh
   ./deploy-cloud-run.sh
   ```

   *അല്ലെങ്കിൽ നേരിട്ട് ഒരു കമാൻഡ്:*

   ```bash
   gcloud run deploy cubit-future-backend \
     --source . \
     --project massive-acrobat-511306-j3 \
     --region asia-south1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080
   ```

---

### Method 2: Google Cloud Console UI വഴി (ബ്രൗസറിൽ നേരിട്ട്)

CLI ഉപയോഗിക്കാതെ Google Cloud Console വഴി നേരിട്ട് deploy ചെയ്യാം:

1. [Google Cloud Run Console](https://console.cloud.google.com/run?project=massive-acrobat-511306-j3) തുറക്കുക.
2. **"Create Service"** ക്ലിക്ക് ചെയ്യുക.
3. **Deploy one revision from an existing container image** അല്ലെങ്കിൽ **Continuously deploy from a repository** (GitHub) തിരഞ്ഞെടുക്കുക.
4. **Service name**: `cubit-future-backend`
5. **Region**: `asia-south1` (Mumbai)
6. **Authentication**: **Allow unauthenticated invocations** തിരഞ്ഞെടുക്കുക.
7. **Container port**: `8080`
8. **Environment variables**:
   - `GOOGLE_DRIVE_FOLDER_ID`: `1j9mdfTPvHG_OhAFsMLVWUoD6qH3PkXR1`
   - `GOOGLE_MASTER_SPREADSHEET_ID`: `1iqRsoh_H6_5NOW5-gjsvr0NiNV7mRDK_aVXcXtdRG3U`
9. **Create** ക്ലിക്ക് ചെയ്യുക. ഏതാനും സെക്കൻഡുകൾക്കുള്ളിൽ ലൈവ് URL ലഭ്യമാകും.

---

### Method 3: നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ നിന്ന് (Local CLI)

നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ Google Cloud SDK (`gcloud`) ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ടെങ്കിൽ:

#### Windows PowerShell

```powershell
cd backend
.\deploy-cloud-run.ps1
```

#### Windows Command Prompt (CMD)

```cmd
cd backend
deploy-cloud-run.bat
```

---

## 🔗 Frontend കണക്റ്റ് ചെയ്യുക (Connecting Frontend)

Cloud Run deployment പൂർത്തിയായ ശേഷം ലഭിക്കുന്ന URL (ഉദാഹരണത്തിന്: `https://cubit-future-backend-xxxxxx-el.a.run.app`) നിങ്ങളുടെ റൂട്ട് ഫോൾഡറിലെ `.env` ഫയലിൽ ചേർക്കുക:

```env
# .env ഫയലിൽ മാറ്റുക:
VITE_API_BASE_URL=https://cubit-future-backend-xxxxxx-el.a.run.app/api/v1
```

---

## 🛠️ ഒരുക്കിയ ഫയലുകൾ (Configured Files)

1. **`Dockerfile`**: Python 3.11-slim അടിസ്ഥാനമാക്കിയുള്ള ഒപ്റ്റിമൈസ് ചെയ്ത container setup.
2. **`cloudbuild.yaml`**: Google Cloud Build pipeline configuration.
3. **`cloudrun-service.yaml`**: Declarative Knative/Cloud Run service specification.
4. **`deploy-cloud-run.ps1` & `deploy-cloud-run.bat` & `deploy-cloud-run.sh`**: 1-ക്ലിക്ക് deployment സ്ക്രിപ്റ്റുകൾ.
5. **`main.py` & `google_sheets_service.py`**: Cloud Run dynamic port & credentials സപ്പോർട്ട്.
