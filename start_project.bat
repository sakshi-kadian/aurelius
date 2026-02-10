@echo off
echo ===================================================
echo   AURELIUS: NEURO-SYMBOLIC ENGINE LAUNCHER
echo ===================================================

echo [1/3] Starting Infrastructure (Docker)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ! Error starting Docker. Is Docker Desktop running?
    pause
    exit /b
)

echo [2/3] Launching Backend (FastAPI)...
start "Aurelius Neural Brain" cmd /k "cd server && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo [3/3] Launching Frontend (The Nexus)...
start "Aurelius Nexus" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo   SYSTEM ONLINE.
echo   Access the Nexus at: http://localhost:3000
echo   API Documentation:   http://localhost:8000/docs
echo ===================================================
pause