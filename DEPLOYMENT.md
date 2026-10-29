# 🚀 Deployment Guide — Placement Preparation Tracker

This guide covers 4 ways to deploy your application to the web.

---

## Option 1: Render.com (Recommended — Single Unified Service)

Because FastAPI is configured to serve the React production build (`frontend/dist`), you can run the entire application as a single web service.

### Step 1: Push Project to GitHub
1. Create a new GitHub repository (e.g. `placement-tracker`).
2. In your local project folder:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit of placement preparation tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/placement-tracker.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `placement-tracker`
   - **Region**: Choose the closest region (e.g., Singapore or Frankfurt).
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Free tier.
5. Click **Create Web Service**.

Once deployed, Render gives you a live URL like `https://placement-tracker.onrender.com`. Both your frontend and backend API will work automatically on that domain.

---

## Option 2: Docker Container (Render / Railway / Fly.io / VPS)

The project includes a ready-to-use production `Dockerfile` that builds the React frontend with Node 20 and packages it into a lightweight Python 3.11 container.

### Deploying with Docker on Railway.app:
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically detect the `Dockerfile` at the root and build the full stack container.
5. In the settings, generate a domain (e.g., `placement-tracker.up.railway.app`).

### Testing the Docker Build Locally:
```bash
docker build -t placement-tracker .
docker run -p 8000:8000 placement-tracker
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Option 3: Decoupled Deployment (Frontend on Vercel + Backend on Render)

If you prefer keeping the frontend and backend separate:

### 1. Deploy the Backend on Render
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Note your live API URL (e.g., `https://placement-api.onrender.com`).

### 2. Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and import your repo.
2. Set **Root Directory** to `frontend`.
3. In `frontend/vite.config.ts`, update the proxy or update `BASE_URL` in `frontend/src/api.ts` with your backend URL.
4. Click **Deploy**.

---

## 💾 Database Persistence in Cloud Hosting

The application uses an SQLite database (`backend/placement_tracker.db`).

> [!NOTE]
> On free serverless tiers (like Render Free or Railway Free without a persistent disk), the filesystem resets when the container restarts or re-deploys.
> 
> **How to preserve your data**:
> 1. **Built-in Export/Import**: In the application under the **Reports** view, click **Export Data (JSON)** once a week to download an instant backup file. If your service ever resets, simply click **Import Data** to restore your exact progress.
> 2. **Render Persistent Disk**: On a paid Render instance ($7/mo), you can attach a persistent disk mounted at `/app/backend` so `placement_tracker.db` persists forever.
> 3. **PostgreSQL Upgrade**: You can change `DATABASE_URL` in `backend/app/database.py` to point to a PostgreSQL connection string (e.g., on Supabase or Neon.tech) without changing any application code.
