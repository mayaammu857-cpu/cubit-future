# ==============================================================================
# CUBIT FUTURE ACADEMY — PRODUCTION DOCKERFILE FOR GOOGLE CLOUD RUN
# Target GCP Project: massive-acrobat-511306-j3
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing bytecode and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies first for efficient layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose default Cloud Run container port
EXPOSE 8080

# Run FastAPI with Uvicorn, dynamically binding to the port provided by Cloud Run
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
