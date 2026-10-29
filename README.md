# 🎯 Placement Preparation Tracker & Timetable Engine

A data-driven study timetable and placement preparation system built for **Computer Science and Business Systems (CSBS)** students targeting fresher Software Developer placements by **30 March 2027**.

---

## 🌟 Key Features

1. **Flexible Daily Timetable & Study Engine**
   - 6-hour daily quota (360 minutes) divided into 5 focused categories:
     - **DSA Patterns**: 150 mins
     - **SQL Practice**: 60 mins
     - **Core Computer Science**: 60 mins
     - **Python Full-Stack Revision**: 45 mins
     - **Placement Prep & Job Applications**: 45 mins
   - **Strict Study-Time Separation**: Checking off tasks records status, but **does not invent study time**. Actual time is recorded only via timers or explicit logs.
   - 12 flexible daily subtasks designed to adapt to irregular schedules.

2. **16 DSA Patterns Dashboard**
   - Covers Two Pointers, Sliding Window, Kadane's, Fast & Slow Pointers, Merge Intervals, and 11 others.
   - Strict 5-point mastery verification checklist (cannot mark "Mastered" without concrete evidence).

3. **SQL Practice Tracker**
   - Logs query attempts, expected outputs, syntax mistakes, execution time, and accuracy metrics.

4. **Core CS Weekly Rotation & Spaced Repetition**
   - 28 pre-seeded topics across Operating Systems, DBMS, Networks, and System Design with automated 1, 3, and 7-day spaced repetition reminders.

5. **Python Full-Stack Revision**
   - Tracks self-study separately from training-center classes.

6. **Placement & Application Tracker**
   - Manages company applications, resume versions, technical project records, and mock interviews.

7. **Weekly Consistency & Accountability Engine**
   - Weekly charts, 2,520-minute weekly quota tracking, consistency percentages, audit logs, and one-click JSON backup/import/export.

8. **Theme & UX**
   - Light/Dark mode switcher, persistent theme preferences, active timer modal, session log modal, and a daily closing review.

---

## 📁 Project Structure

```
placement-tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # SQLAlchemy SQLite engine & session
│   │   ├── models.py         # 15 database tables
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── crud.py           # Core business logic & query helpers
│   │   ├── seed_data.py      # Initial database seed (16 patterns, 28 CS topics)
│   │   └── main.py           # FastAPI routes & static file mount
│   ├── tests/
│   │   └── run_tests.py      # 13 automated acceptance tests
│   ├── requirements.txt      # Python dependencies
│   └── placement_tracker.db  # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Sidebar, Modals, Timer
│   │   ├── views/            # 8 main application views
│   │   ├── api.ts            # Typed API client
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── App.tsx           # Main application shell
│   │   └── index.css         # Tailwind & theme tokens
│   ├── package.json
│   ├── vite.config.ts
│   └── dist/                 # Production-built assets
├── Dockerfile                # Multi-stage production container build
├── start.bat                 # 1-click Windows launcher
├── DEPLOYMENT.md             # Complete cloud deployment guide
└── README.md                 # This documentation file
```

---

## 🚀 Quick Start (Local)

### Method 1: One-Click Launcher (Windows)
Double-click `start.bat` in the root folder, or run:
```cmd
start.bat
```
This automatically boots the backend on port 8000, the frontend on port 5173, and opens your browser.

---

### Method 2: Manual Start

#### 1. Backend (FastAPI)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs & Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Single-port Unified Web App: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

#### 2. Frontend (Vite + React)
```powershell
cd frontend
npm install
npm run dev
```
- Local Web App: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests

Run the acceptance test suite to verify all 13 core requirements:
```powershell
cd backend
python tests/run_tests.py
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guides on deploying to:
- **Render.com** (Free / low-cost Python Web Service)
- **Railway.app** (Single-service Docker deployment)
- **Vercel + Render** (Decoupled frontend & backend)
- **Docker** (Self-hosted on any VPS)
