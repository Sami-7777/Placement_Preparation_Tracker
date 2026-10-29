@echo off
echo ========================================================
echo   Launching Placement Preparation Tracker & Timetable
echo ========================================================

echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "Placement Tracker - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend (Vite on http://localhost:5173)...
start "Placement Tracker - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 >nul
start http://localhost:5173

echo ========================================================
echo   Application started in separate windows!
echo   Frontend: http://localhost:5173
echo   API Docs: http://127.0.0.1:8000/docs
echo ========================================================
