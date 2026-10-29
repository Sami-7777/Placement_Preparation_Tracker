import os
import json
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import engine, Base, get_db
from .models import (
    UserSettings, DsaPattern, DsaSubtopic, DsaProblem, DailyTask, StudySession,
    SqlProblem, CoreCsTopic, PythonTopic, PythonDailyLog, PlacementActivity,
    ProjectRecord, JobApplication, AuditLog, DailyReport
)
from .schemas import (
    UserSettingsResponse, UserSettingsBase,
    DsaPatternResponse, DsaPatternUpdate, DsaSubtopicCreate, DsaSubtopicResponse,
    DsaProblemCreate, DsaProblemResponse,
    DailyTaskResponse, DailyTaskCreate, DailyTaskUpdate,
    StudySessionResponse, StudySessionCreate,
    SqlProblemResponse, SqlProblemCreate,
    CoreCsTopicResponse, CoreCsTopicUpdate,
    PythonTopicResponse, PythonTopicUpdate, PythonDailyLogCreate, PythonDailyLogResponse,
    PlacementActivityCreate, PlacementActivityResponse,
    ProjectRecordCreate, ProjectRecordResponse,
    JobApplicationCreate, JobApplicationResponse,
    DailyReportCreate, DailyReportResponse,
    DashboardSummary
)
from .seed_data import seed_initial_data
from .crud import (
    ensure_daily_tasks_for_date, get_dashboard_summary, log_audit,
    get_day_of_week_core_cs_subject
)

# Initialize tables
Base.metadata.create_all(bind=engine)

# Seed data on startup
with next(get_db()) as db:
    seed_initial_data(db)

app = FastAPI(title="Personal Placement Preparation Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Settings -----------------

@app.get("/api/settings", response_model=UserSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/api/settings", response_model=UserSettingsResponse)
def update_settings(update_data: UserSettingsBase, db: Session = Depends(get_db)):
    # Validate category target minutes add up to daily target
    cat_sum = (
        update_data.dsa_target_minutes +
        update_data.sql_target_minutes +
        update_data.core_cs_target_minutes +
        update_data.python_target_minutes +
        update_data.placement_target_minutes
    )
    if cat_sum != update_data.daily_target_minutes:
        raise HTTPException(
            status_code=400,
            detail=f"Category targets sum to {cat_sum} minutes, which must equal daily target {update_data.daily_target_minutes} minutes."
        )

    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)

    for field, val in update_data.model_dump().items():
        setattr(settings, field, val)
    db.commit()
    db.refresh(settings)
    log_audit(db, "UserSettings", settings.id, "UPDATE", f"Updated daily target to {settings.daily_target_minutes}m, theme: {settings.theme_mode}")
    return settings

# ----------------- Dashboard Summary -----------------

@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_summary(
    date_str: Optional[str] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    if not date_str:
        date_str = date.today().strftime("%Y-%m-%d")
    return get_dashboard_summary(db, date_str)

# ----------------- Daily Tasks -----------------

@app.get("/api/tasks", response_model=List[DailyTaskResponse])
def get_tasks(
    date_str: Optional[str] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    if not date_str:
        date_str = date.today().strftime("%Y-%m-%d")
    return ensure_daily_tasks_for_date(db, date_str)

@app.post("/api/tasks", response_model=DailyTaskResponse)
def create_custom_task(task_in: DailyTaskCreate, db: Session = Depends(get_db)):
    task = DailyTask(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    log_audit(db, "DailyTask", task.id, "CREATE", f"Created custom task '{task.title}' for {task.date}")
    return task

@app.put("/api/tasks/{task_id}", response_model=DailyTaskResponse)
def update_task(task_id: int, task_in: DailyTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_dict = task_in.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(task, k, v)

    # Re-evaluate status based on completion if status not explicitly sent
    if "is_completed" in update_dict and "status" not in update_dict:
        task.status = "Completed" if task.is_completed else ("In Progress" if task.actual_duration > 0 else "Not Started")

    db.commit()
    db.refresh(task)
    log_audit(db, "DailyTask", task.id, "UPDATE", f"Updated task '{task.title}', is_completed={task.is_completed}, actual={task.actual_duration}m")
    return task

@app.patch("/api/tasks/{task_id}/toggle", response_model=DailyTaskResponse)
def toggle_task_completion(task_id: int, db: Session = Depends(get_db)):
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    if task.is_completed:
        task.status = "Completed"
        task.completion_time = datetime.now().strftime("%H:%M:%S")
    else:
        task.status = "In Progress" if task.actual_duration > 0 else "Not Started"
        task.completion_time = None

    db.commit()
    db.refresh(task)
    log_audit(db, "DailyTask", task.id, "TOGGLE", f"Task '{task.title}' toggled to is_completed={task.is_completed}")
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    title = task.title
    db.delete(task)
    db.commit()
    log_audit(db, "DailyTask", task_id, "DELETE", f"Deleted task '{title}'")
    return {"message": "Task deleted successfully"}

@app.post("/api/tasks/{task_id}/reschedule")
def reschedule_task(task_id: int, target_date: Optional[str] = None, db: Session = Depends(get_db)):
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if not target_date:
        target_date = date.today().strftime("%Y-%m-%d")

    # Mark old task as Missed
    task.status = "Missed"
    task.is_overdue = True

    # Create new task carried forward
    new_task = DailyTask(
        date=target_date,
        title=f"[Carried Forward] {task.title.replace('[Carried Forward] ', '')}",
        category=task.category,
        subtask_type=task.subtask_type,
        target_duration=task.target_duration,
        actual_duration=0,
        is_completed=False,
        status="Not Started",
        notes=task.notes,
        is_overdue=False,
        was_carried_forward=True,
        order_index=task.order_index + 100
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    log_audit(db, "DailyTask", task_id, "RESCHEDULE", f"Rescheduled task '{task.title}' to {target_date}")
    return new_task

# ----------------- Study Sessions & Timers -----------------

@app.get("/api/sessions", response_model=List[StudySessionResponse])
def get_sessions(
    date_str: Optional[str] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    query = db.query(StudySession)
    if date_str:
        query = query.filter(StudySession.date == date_str)
    return query.order_by(StudySession.id.desc()).all()

@app.post("/api/sessions", response_model=StudySessionResponse)
def record_study_session(session_in: StudySessionCreate, db: Session = Depends(get_db)):
    session = StudySession(**session_in.model_dump())
    db.add(session)

    # If linked to a task, increment task actual duration accurately
    if session.task_id:
        task = db.query(DailyTask).filter(DailyTask.id == session.task_id).first()
        if task:
            task.actual_duration = int(task.actual_duration + session.duration_minutes)
            if task.status == "Not Started":
                task.status = "In Progress"
            if not task.start_time:
                task.start_time = session.start_time

    db.commit()
    db.refresh(session)
    log_audit(db, "StudySession", session.id, "RECORD", f"Logged {session.duration_minutes:.1f}m session for category '{session.category}' ({session.session_type})")
    return session

@app.delete("/api/sessions/{session_id}")
def delete_study_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}

# ----------------- DSA Patterns -----------------

@app.get("/api/patterns", response_model=List[DsaPatternResponse])
def get_dsa_patterns(db: Session = Depends(get_db)):
    return db.query(DsaPattern).order_by(DsaPattern.order_index).all()

@app.get("/api/patterns/{pattern_id}", response_model=DsaPatternResponse)
def get_dsa_pattern(pattern_id: int, db: Session = Depends(get_db)):
    p = db.query(DsaPattern).filter(DsaPattern.id == pattern_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pattern not found")
    return p

@app.put("/api/patterns/{pattern_id}", response_model=DsaPatternResponse)
def update_dsa_pattern(pattern_id: int, update_in: DsaPatternUpdate, db: Session = Depends(get_db)):
    pattern = db.query(DsaPattern).filter(DsaPattern.id == pattern_id).first()
    if not pattern:
        raise HTTPException(status_code=404, detail="Pattern not found")

    update_dict = update_in.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(pattern, k, v)

    # Check mastery criteria: user prompt states:
    # "Do not mark a pattern as mastered just because I check a box.
    # Track evidence that I can:
    # - Explain when to use the pattern
    # - Implement the core approach without copying
    # - Solve unfamiliar problems independently
    # - Explain time and space complexity
    # - Re-solve problems after a delay"
    all_evidence = (
        pattern.can_explain_use and
        pattern.can_implement_core and
        pattern.can_solve_unfamiliar and
        pattern.can_explain_complexity and
        pattern.can_resolve_delayed
    )
    if pattern.status == "Mastered" and not all_evidence:
        # Don't allow marked Mastered without all 5 criteria satisfied
        pattern.status = "Practicing"

    db.commit()
    db.refresh(pattern)
    log_audit(db, "DsaPattern", pattern.id, "UPDATE", f"Updated pattern '{pattern.name}' status to '{pattern.status}', confidence={pattern.confidence_rating}")
    return pattern

@app.post("/api/patterns/{pattern_id}/subtopics", response_model=DsaSubtopicResponse)
def add_subtopic(pattern_id: int, sub_in: DsaSubtopicBase, db: Session = Depends(get_db)):
    subtopic = DsaSubtopic(
        pattern_id=pattern_id,
        title=sub_in.title,
        is_completed=sub_in.is_completed,
        order_index=sub_in.order_index,
        is_disabled=sub_in.is_disabled
    )
    db.add(subtopic)
    db.commit()
    db.refresh(subtopic)
    return subtopic

@app.patch("/api/subtopics/{subtopic_id}/toggle", response_model=DsaSubtopicResponse)
def toggle_subtopic(subtopic_id: int, db: Session = Depends(get_db)):
    sub = db.query(DsaSubtopic).filter(DsaSubtopic.id == subtopic_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    sub.is_completed = not sub.is_completed
    db.commit()
    db.refresh(sub)
    return sub

@app.delete("/api/subtopics/{subtopic_id}")
def delete_subtopic(subtopic_id: int, db: Session = Depends(get_db)):
    sub = db.query(DsaSubtopic).filter(DsaSubtopic.id == subtopic_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    db.delete(sub)
    db.commit()
    return {"message": "Subtopic deleted"}

@app.get("/api/patterns/{pattern_id}/problems", response_model=List[DsaProblemResponse])
def get_pattern_problems(pattern_id: int, db: Session = Depends(get_db)):
    return db.query(DsaProblem).filter(DsaProblem.pattern_id == pattern_id).all()

@app.post("/api/patterns/{pattern_id}/problems", response_model=DsaProblemResponse)
def add_pattern_problem(pattern_id: int, prob_in: DsaProblemCreate, db: Session = Depends(get_db)):
    prob = DsaProblem(**prob_in.model_dump())
    prob.pattern_id = pattern_id
    db.add(prob)

    # Update pattern last practiced date
    pattern = db.query(DsaPattern).filter(DsaPattern.id == pattern_id).first()
    if pattern:
        pattern.last_practiced_date = prob.date_solved
        if pattern.status == "Not Started":
            pattern.status = "Practicing"

    db.commit()
    db.refresh(prob)
    log_audit(db, "DsaProblem", prob.id, "CREATE", f"Logged DSA problem '{prob.title}' for pattern ID {pattern_id}")
    return prob

@app.delete("/api/problems/{problem_id}")
def delete_dsa_problem(problem_id: int, db: Session = Depends(get_db)):
    prob = db.query(DsaProblem).filter(DsaProblem.id == problem_id).first()
    if not prob:
        raise HTTPException(status_code=404, detail="Problem not found")
    db.delete(prob)
    db.commit()
    return {"message": "Problem deleted"}

# ----------------- SQL Practice Module -----------------

@app.get("/api/sql/problems", response_model=List[SqlProblemResponse])
def get_sql_problems(db: Session = Depends(get_db)):
    return db.query(SqlProblem).order_by(SqlProblem.date_logged.desc(), SqlProblem.id.desc()).all()

@app.post("/api/sql/problems", response_model=SqlProblemResponse)
def create_sql_problem(prob_in: SqlProblemCreate, db: Session = Depends(get_db)):
    prob = SqlProblem(**prob_in.model_dump())
    db.add(prob)
    db.commit()
    db.refresh(prob)
    log_audit(db, "SqlProblem", prob.id, "CREATE", f"Recorded SQL problem '{prob.title}' [{prob.status}] topic: {prob.sql_topic}")
    return prob

@app.put("/api/sql/problems/{problem_id}", response_model=SqlProblemResponse)
def update_sql_problem(problem_id: int, prob_in: SqlProblemCreate, db: Session = Depends(get_db)):
    prob = db.query(SqlProblem).filter(SqlProblem.id == problem_id).first()
    if not prob:
        raise HTTPException(status_code=404, detail="SQL problem not found")
    for k, v in prob_in.model_dump().items():
        setattr(prob, k, v)
    db.commit()
    db.refresh(prob)
    return prob

@app.delete("/api/sql/problems/{problem_id}")
def delete_sql_problem(problem_id: int, db: Session = Depends(get_db)):
    prob = db.query(SqlProblem).filter(SqlProblem.id == problem_id).first()
    if not prob:
        raise HTTPException(status_code=404, detail="SQL problem not found")
    db.delete(prob)
    db.commit()
    return {"message": "SQL problem deleted"}

@app.get("/api/sql/summary")
def get_sql_summary(db: Session = Depends(get_db)):
    problems = db.query(SqlProblem).all()
    total_attempted = len(problems)
    correct = sum(1 for p in problems if p.status == "Solved Correct")
    with_hint = sum(1 for p in problems if p.status == "Hint Required")
    incorrect = sum(1 for p in problems if p.status == "Incorrect")
    attempted_only = sum(1 for p in problems if p.status == "Attempted")
    accuracy_pct = round((correct / total_attempted * 100), 1) if total_attempted > 0 else 100.0

    # Topic breakdown
    topics_map: Dict[str, Dict[str, int]] = {}
    for p in problems:
        if p.sql_topic not in topics_map:
            topics_map[p.sql_topic] = {"attempted": 0, "correct": 0, "incorrect": 0}
        topics_map[p.sql_topic]["attempted"] += 1
        if p.status == "Solved Correct":
            topics_map[p.sql_topic]["correct"] += 1
        elif p.status == "Incorrect":
            topics_map[p.sql_topic]["incorrect"] += 1

    weak_topics = [t for t, data in topics_map.items() if data["incorrect"] > 0 or (data["correct"] / data["attempted"] < 0.7)]

    return {
        "total_attempted": total_attempted,
        "correct": correct,
        "with_hint": with_hint,
        "incorrect": incorrect,
        "attempted_only": attempted_only,
        "accuracy_pct": accuracy_pct,
        "weak_topics": weak_topics,
        "topic_breakdown": topics_map
    }

# ----------------- Core CS Fundamentals -----------------

@app.get("/api/core-cs", response_model=List[CoreCsTopicResponse])
def get_core_cs_topics(subject: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CoreCsTopic)
    if subject:
        query = query.filter(CoreCsTopic.subject == subject)
    return query.order_by(CoreCsTopic.order_index).all()

@app.put("/api/core-cs/{topic_id}", response_model=CoreCsTopicResponse)
def update_core_cs_topic(topic_id: int, update_in: CoreCsTopicUpdate, db: Session = Depends(get_db)):
    topic = db.query(CoreCsTopic).filter(CoreCsTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for k, v in update_in.model_dump(exclude_unset=True).items():
        setattr(topic, k, v)
    db.commit()
    db.refresh(topic)
    log_audit(db, "CoreCsTopic", topic.id, "UPDATE", f"Updated Core CS topic '{topic.topic_name}' status: {topic.status}")
    return topic

@app.patch("/api/core-cs/{topic_id}/toggle", response_model=CoreCsTopicResponse)
def toggle_core_cs_completion(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(CoreCsTopic).filter(CoreCsTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    topic.is_completed = not topic.is_completed
    if topic.is_completed:
        topic.status = "Revised"
        topic.last_revised_date = date.today().strftime("%Y-%m-%d")
        # Set next spaced repetition revision in 3 days
        next_dt = date.today() + timedelta(days=3)
        topic.next_revision_date = next_dt.strftime("%Y-%m-%d")
    else:
        topic.status = "In Progress"
    db.commit()
    db.refresh(topic)
    return topic

# ----------------- Python Full Stack Revision -----------------

@app.get("/api/python/topics", response_model=List[PythonTopicResponse])
def get_python_topics(db: Session = Depends(get_db)):
    return db.query(PythonTopic).order_by(PythonTopic.order_index).all()

@app.put("/api/python/topics/{topic_id}", response_model=PythonTopicResponse)
def update_python_topic(topic_id: int, update_in: PythonTopicUpdate, db: Session = Depends(get_db)):
    topic = db.query(PythonTopic).filter(PythonTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Python topic not found")
    for k, v in update_in.model_dump(exclude_unset=True).items():
        setattr(topic, k, v)
    db.commit()
    db.refresh(topic)
    return topic

@app.get("/api/python/logs", response_model=List[PythonDailyLogResponse])
def get_python_daily_logs(date_str: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PythonDailyLog)
    if date_str:
        query = query.filter(PythonDailyLog.date == date_str)
    return query.order_by(PythonDailyLog.id.desc()).all()

@app.post("/api/python/logs", response_model=PythonDailyLogResponse)
def create_python_log(log_in: PythonDailyLogCreate, db: Session = Depends(get_db)):
    log_entry = PythonDailyLog(**log_in.model_dump())
    db.add(log_entry)

    # Update topic last revised date
    if log_entry.topic_id:
        topic = db.query(PythonTopic).filter(PythonTopic.id == log_entry.topic_id).first()
        if topic:
            topic.last_revised_date = log_entry.date
            if topic.status == "Not Started":
                topic.status = "In Progress"

    db.commit()
    db.refresh(log_entry)
    log_audit(db, "PythonDailyLog", log_entry.id, "CREATE", f"Recorded Python FS revision for '{log_entry.topic_name}' ({log_entry.actual_time_minutes}m)")
    return log_entry

# ----------------- Placement Activities, Projects & Applications -----------------

@app.get("/api/placement/activities", response_model=List[PlacementActivityResponse])
def get_placement_activities(date_str: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(PlacementActivity)
    if date_str:
        q = q.filter(PlacementActivity.date == date_str)
    return q.order_by(PlacementActivity.id.desc()).all()

@app.post("/api/placement/activities", response_model=PlacementActivityResponse)
def create_placement_activity(act_in: PlacementActivityCreate, db: Session = Depends(get_db)):
    act = PlacementActivity(**act_in.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    return act

@app.delete("/api/placement/activities/{activity_id}")
def delete_placement_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(PlacementActivity).filter(PlacementActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(act)
    db.commit()
    return {"message": "Activity deleted"}

@app.get("/api/placement/projects", response_model=List[ProjectRecordResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(ProjectRecord).order_by(ProjectRecord.id.desc()).all()

@app.post("/api/placement/projects", response_model=ProjectRecordResponse)
def create_project(proj_in: ProjectRecordCreate, db: Session = Depends(get_db)):
    proj = ProjectRecord(**proj_in.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    log_audit(db, "ProjectRecord", proj.id, "CREATE", f"Created project '{proj.title}'")
    return proj

@app.put("/api/placement/projects/{project_id}", response_model=ProjectRecordResponse)
def update_project(project_id: int, proj_in: ProjectRecordCreate, db: Session = Depends(get_db)):
    proj = db.query(ProjectRecord).filter(ProjectRecord.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in proj_in.model_dump().items():
        setattr(proj, k, v)
    db.commit()
    db.refresh(proj)
    return proj

@app.delete("/api/placement/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(ProjectRecord).filter(ProjectRecord.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"message": "Project deleted"}

@app.get("/api/placement/applications", response_model=List[JobApplicationResponse])
def get_job_applications(db: Session = Depends(get_db)):
    return db.query(JobApplication).order_by(JobApplication.application_date.desc(), JobApplication.id.desc()).all()

@app.post("/api/placement/applications", response_model=JobApplicationResponse)
def create_job_application(app_in: JobApplicationCreate, db: Session = Depends(get_db)):
    job_app = JobApplication(**app_in.model_dump())
    db.add(job_app)
    db.commit()
    db.refresh(job_app)
    log_audit(db, "JobApplication", job_app.id, "CREATE", f"Created application for {job_app.company} - {job_app.role}")
    return job_app

@app.put("/api/placement/applications/{application_id}", response_model=JobApplicationResponse)
def update_job_application(application_id: int, app_in: JobApplicationCreate, db: Session = Depends(get_db)):
    job_app = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Application not found")
    for k, v in app_in.model_dump().items():
        setattr(job_app, k, v)
    db.commit()
    db.refresh(job_app)
    return job_app

@app.delete("/api/placement/applications/{application_id}")
def delete_job_application(application_id: int, db: Session = Depends(get_db)):
    job_app = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(job_app)
    db.commit()
    return {"message": "Job application deleted"}

# ----------------- Reports & Accountability -----------------

@app.get("/api/reports/daily", response_model=Optional[DailyReportResponse])
def get_daily_report(date_str: str, db: Session = Depends(get_db)):
    return db.query(DailyReport).filter(DailyReport.date == date_str).first()

@app.post("/api/reports/daily/close", response_model=DailyReportResponse)
def close_daily_report(report_in: DailyReportCreate, db: Session = Depends(get_db)):
    summary = get_dashboard_summary(db, report_in.date)
    existing = db.query(DailyReport).filter(DailyReport.date == report_in.date).first()

    dsa_min = summary["category_progress"]["DSA Patterns"]["actual_minutes"]
    sql_min = summary["category_progress"]["SQL Revision & Practice"]["actual_minutes"]
    core_min = summary["category_progress"]["Core CS Fundamentals"]["actual_minutes"]
    py_min = summary["category_progress"]["Python Full Stack Revision"]["actual_minutes"]
    place_min = summary["category_progress"]["Placement Preparation"]["actual_minutes"]
    target_met = summary["actual_focused_minutes"] >= summary["daily_target_minutes"]

    if existing:
        existing.target_minutes = summary["daily_target_minutes"]
        existing.actual_minutes = summary["actual_focused_minutes"]
        existing.tasks_total = summary["tasks_total"]
        existing.tasks_completed = summary["tasks_completed"]
        existing.dsa_minutes = dsa_min
        existing.sql_minutes = sql_min
        existing.core_cs_minutes = core_min
        existing.python_minutes = py_min
        existing.placement_minutes = place_min
        existing.reflections = report_in.reflections or ""
        existing.is_target_met = target_met
        db.commit()
        db.refresh(existing)
        return existing

    report = DailyReport(
        date=report_in.date,
        target_minutes=summary["daily_target_minutes"],
        actual_minutes=summary["actual_focused_minutes"],
        tasks_total=summary["tasks_total"],
        tasks_completed=summary["tasks_completed"],
        dsa_minutes=dsa_min,
        sql_minutes=sql_min,
        core_cs_minutes=core_min,
        python_minutes=py_min,
        placement_minutes=place_min,
        reflections=report_in.reflections or "",
        is_target_met=target_met,
        created_at=datetime.now().isoformat()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    log_audit(db, "DailyReport", report.id, "CLOSE_DAY", f"Closed day {report.date} with {report.actual_minutes}m study time, target_met={target_met}")
    return report

@app.get("/api/reports/weekly")
def get_weekly_accountability(
    week_start: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if not week_start:
        # Default to Monday of current week
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        week_start = monday.strftime("%Y-%m-%d")

    start_dt = datetime.strptime(week_start, "%Y-%m-%d").date()
    days = [start_dt + timedelta(days=i) for i in range(7)]
    days_str = [d.strftime("%Y-%m-%d") for d in days]

    settings = db.query(UserSettings).first()
    daily_target = settings.daily_target_minutes if settings else 360

    daily_data = []
    days_target_met = 0
    total_week_minutes = 0
    total_week_tasks_completed = 0
    total_week_tasks = 0

    for d_str in days_str:
        summary = get_dashboard_summary(db, d_str)
        actual = summary["actual_focused_minutes"]
        is_met = actual >= daily_target
        if is_met:
            days_target_met += 1
        total_week_minutes += actual
        total_week_tasks_completed += summary["tasks_completed"]
        total_week_tasks += summary["tasks_total"]

        daily_data.append({
            "date": d_str,
            "day_name": datetime.strptime(d_str, "%Y-%m-%d").strftime("%a"),
            "actual_minutes": actual,
            "target_minutes": daily_target,
            "is_target_met": is_met,
            "tasks_completed": summary["tasks_completed"],
            "tasks_total": summary["tasks_total"]
        })

    consistency_pct = round((days_target_met / 7.0 * 100), 1)

    return {
        "week_start": week_start,
        "week_end": days_str[-1],
        "consistency_pct": consistency_pct,
        "days_target_met": days_target_met,
        "total_days": 7,
        "total_week_minutes": total_week_minutes,
        "target_week_minutes": daily_target * 7,
        "total_week_tasks_completed": total_week_tasks_completed,
        "total_week_tasks": total_week_tasks,
        "days": daily_data
    }

# ----------------- Data Export and Import -----------------

@app.get("/api/data/export")
def export_all_data(db: Session = Depends(get_db)):
    data = {
        "export_date": datetime.now().isoformat(),
        "settings": [s.__dict__ for s in db.query(UserSettings).all()],
        "dsa_patterns": [p.__dict__ for p in db.query(DsaPattern).all()],
        "dsa_subtopics": [s.__dict__ for s in db.query(DsaSubtopic).all()],
        "dsa_problems": [p.__dict__ for p in db.query(DsaProblem).all()],
        "daily_tasks": [t.__dict__ for t in db.query(DailyTask).all()],
        "study_sessions": [s.__dict__ for s in db.query(StudySession).all()],
        "sql_problems": [p.__dict__ for p in db.query(SqlProblem).all()],
        "core_cs_topics": [c.__dict__ for c in db.query(CoreCsTopic).all()],
        "python_topics": [p.__dict__ for p in db.query(PythonTopic).all()],
        "python_daily_logs": [l.__dict__ for l in db.query(PythonDailyLog).all()],
        "placement_activities": [a.__dict__ for a in db.query(PlacementActivity).all()],
        "project_records": [r.__dict__ for r in db.query(ProjectRecord).all()],
        "job_applications": [j.__dict__ for j in db.query(JobApplication).all()],
        "daily_reports": [d.__dict__ for d in db.query(DailyReport).all()]
    }

    # Clean SQLAlchemy state
    cleaned = {}
    for table_name, rows in data.items():
        if isinstance(rows, list):
            cleaned[table_name] = []
            for row in rows:
                row_dict = {k: v for k, v in row.items() if not k.startswith("_sa_")}
                cleaned[table_name].append(row_dict)
        else:
            cleaned[table_name] = rows
    return cleaned

@app.post("/api/data/import")
def import_all_data(payload: Dict[str, Any], db: Session = Depends(get_db)):
    # Restores user data safely
    if "settings" in payload and payload["settings"]:
        for s in payload["settings"]:
            existing = db.query(UserSettings).filter(UserSettings.id == s.get("id", 1)).first()
            if existing:
                for k, v in s.items():
                    setattr(existing, k, v)
    if "dsa_patterns" in payload:
        for p in payload["dsa_patterns"]:
            existing = db.query(DsaPattern).filter(DsaPattern.id == p.get("id")).first()
            if existing:
                for k, v in p.items():
                    setattr(existing, k, v)
    db.commit()
    log_audit(db, "System", None, "IMPORT", "Imported and synchronized database state")
    return {"message": "Data imported successfully"}

@app.get("/api/audit")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()

# Serve built frontend if available
from fastapi.staticfiles import StaticFiles
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

