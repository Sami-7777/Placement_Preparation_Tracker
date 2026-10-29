from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import (
    UserSettings, DsaPattern, DsaSubtopic, DsaProblem, DailyTask, StudySession,
    SqlProblem, CoreCsTopic, PythonTopic, PythonDailyLog, PlacementActivity,
    ProjectRecord, JobApplication, AuditLog, DailyReport
)

def get_day_of_week_core_cs_subject(target_date: str) -> str:
    # Monday: DBMS, Tuesday: DBMS, Wednesday: OOP, Thursday: OS, Friday: OS, Saturday: Networks, Sunday: Mixed
    dt = datetime.strptime(target_date, "%Y-%m-%d")
    weekday = dt.weekday() # 0 = Monday, 6 = Sunday
    mapping = {
        0: "DBMS (Database Management)",
        1: "DBMS (Database Management)",
        2: "OOP (Object-Oriented Programming)",
        3: "OS (Operating Systems)",
        4: "OS (Operating Systems)",
        5: "Networks (Computer Networks)",
        6: "Mixed Revision & Self-Test"
    }
    return mapping.get(weekday, "Core CS")

def ensure_daily_tasks_for_date(db: Session, date_str: str) -> List[DailyTask]:
    existing_tasks = db.query(DailyTask).filter(DailyTask.date == date_str).order_by(DailyTask.order_index).all()
    if existing_tasks:
        return existing_tasks

    # Mark past unfinished tasks as Missed / Overdue
    past_unfinished = db.query(DailyTask).filter(
        DailyTask.date < date_str,
        DailyTask.is_completed == False,
        DailyTask.status != "Missed"
    ).all()
    for task in past_unfinished:
        task.status = "Missed"
        task.is_overdue = True
    if past_unfinished:
        db.commit()

    # Get settings for default durations
    settings = db.query(UserSettings).first()
    core_subject = get_day_of_week_core_cs_subject(date_str)

    # 5 categories, 360 minutes default total
    # Category A: DSA Patterns (150m)
    # Category B: SQL Revision & Practice (60m)
    # Category C: Core CS Fundamentals (60m)
    # Category D: Python Full Stack Revision (45m)
    # Category E: Placement Preparation (45m)
    default_subtasks = [
        # DSA (150m)
        {
            "category": "DSA Patterns",
            "title": "DSA: Revise previous pattern & mistakes",
            "subtask_type": "dsa_revise",
            "target_duration": 20,
            "order_index": 1
        },
        {
            "category": "DSA Patterns",
            "title": "DSA: Practise current pattern concepts & mechanics",
            "subtask_type": "dsa_practice",
            "target_duration": 60,
            "order_index": 2
        },
        {
            "category": "DSA Patterns",
            "title": "DSA: Solve problems independently",
            "subtask_type": "dsa_solve",
            "target_duration": 40,
            "order_index": 3
        },
        {
            "category": "DSA Patterns",
            "title": "DSA: Analyse time/space complexity & review mistakes",
            "subtask_type": "dsa_complexity",
            "target_duration": 20,
            "order_index": 4
        },
        {
            "category": "DSA Patterns",
            "title": "DSA: Update notes & schedule revisions",
            "subtask_type": "dsa_notes",
            "target_duration": 10,
            "order_index": 5
        },
        # SQL (60m)
        {
            "category": "SQL Revision & Practice",
            "title": "SQL: Revise concepts, queries & past mistakes",
            "subtask_type": "sql_revision",
            "target_duration": 15,
            "order_index": 6
        },
        {
            "category": "SQL Revision & Practice",
            "title": "SQL: Solve practice problems (2–4 questions)",
            "subtask_type": "sql_problems",
            "target_duration": 45,
            "order_index": 7
        },
        # Core CS (60m)
        {
            "category": "Core CS Fundamentals",
            "title": f"Core CS: Scheduled rotation — {core_subject}",
            "subtask_type": "core_cs_rotation",
            "target_duration": 60,
            "order_index": 8
        },
        # Python Full Stack (45m)
        {
            "category": "Python Full Stack Revision",
            "title": "Python FS: Revise training-centre class topics",
            "subtask_type": "python_revise_class",
            "target_duration": 15,
            "order_index": 9
        },
        {
            "category": "Python Full Stack Revision",
            "title": "Python FS: Implement code & exercises independently",
            "subtask_type": "python_implement",
            "target_duration": 25,
            "order_index": 10
        },
        {
            "category": "Python Full Stack Revision",
            "title": "Python FS: Record doubts, syntax hurdles & errors",
            "subtask_type": "python_doubts",
            "target_duration": 5,
            "order_index": 11
        },
        # Placement Prep (45m)
        {
            "category": "Placement Preparation",
            "title": "Placement: Aptitude, reasoning, project or applications",
            "subtask_type": "placement_activity",
            "target_duration": 45,
            "order_index": 12
        }
    ]

    new_tasks = []
    for item in default_subtasks:
        task = DailyTask(
            date=date_str,
            title=item["title"],
            category=item["category"],
            subtask_type=item["subtask_type"],
            target_duration=item["target_duration"],
            actual_duration=0,
            is_completed=False,
            status="Not Started",
            notes="",
            is_overdue=False,
            was_carried_forward=False,
            order_index=item["order_index"]
        )
        db.add(task)
        new_tasks.append(task)
    db.commit()

    return db.query(DailyTask).filter(DailyTask.date == date_str).order_by(DailyTask.order_index).all()

def calculate_streaks(db: Session, target_date_str: str) -> tuple[int, int]:
    # A day counts towards streak if actual study duration >= 30 min or at least 1 task completed
    # Fetch distinct dates with activity
    active_dates_set = set()
    # From sessions
    sessions = db.query(StudySession.date, func.sum(StudySession.duration_minutes)).group_by(StudySession.date).all()
    for s_date, dur in sessions:
        if dur and dur >= 15:
            active_dates_set.add(s_date)

    # From tasks completed
    tasks_done = db.query(DailyTask.date).filter(DailyTask.is_completed == True).distinct().all()
    for t_date in tasks_done:
        active_dates_set.add(t_date[0])

    if not active_dates_set:
        return 0, 0

    sorted_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in active_dates_set])
    
    # Calculate longest streak
    longest = 0
    current_run = 0
    prev_d = None
    for d in sorted_dates:
        if prev_d is None:
            current_run = 1
        elif d == prev_d + timedelta(days=1):
            current_run += 1
        else:
            current_run = 1
        if current_run > longest:
            longest = current_run
        prev_d = d

    # Calculate current streak ending at target_date_str or target_date_str - 1 day
    target_dt = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    curr_streak = 0
    check_dt = target_dt
    
    # If target_dt is not in set, check if yesterday was
    if check_dt not in active_dates_set:
        check_dt = target_dt - timedelta(days=1)
    
    while check_dt in active_dates_set:
        curr_streak += 1
        check_dt -= timedelta(days=1)

    return curr_streak, longest

def get_dashboard_summary(db: Session, date_str: str) -> Dict[str, Any]:
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        db.commit()

    tasks = ensure_daily_tasks_for_date(db, date_str)

    # Calculate days remaining to 30 March 2027
    target_deadline = datetime.strptime(settings.target_date, "%Y-%m-%d").date()
    current_dt = datetime.strptime(date_str, "%Y-%m-%d").date()
    days_remaining = max(0, (target_deadline - current_dt).days)

    # Task metrics
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.is_completed)
    task_completion_pct = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # Actual study time from sessions on date_str
    session_minutes = db.query(func.sum(StudySession.duration_minutes)).filter(StudySession.date == date_str).scalar() or 0.0
    # Also sum actual_duration directly logged in tasks
    task_logged_minutes = sum(t.actual_duration for t in tasks)
    actual_focused_minutes = int(max(session_minutes, task_logged_minutes))

    daily_target = settings.daily_target_minutes
    remaining_minutes = max(0, daily_target - actual_focused_minutes)
    extra_minutes = max(0, actual_focused_minutes - daily_target)
    study_time_pct = min(100.0, round((actual_focused_minutes / daily_target * 100), 1)) if daily_target > 0 else 0.0

    # Category breakdown
    categories = [
        "DSA Patterns",
        "SQL Revision & Practice",
        "Core CS Fundamentals",
        "Python Full Stack Revision",
        "Placement Preparation"
    ]
    category_progress = {}
    for cat in categories:
        cat_tasks = [t for t in tasks if t.category == cat]
        target_m = sum(t.target_duration for t in cat_tasks)
        actual_m = sum(t.actual_duration for t in cat_tasks)
        cat_done = sum(1 for t in cat_tasks if t.is_completed)
        cat_total = len(cat_tasks)
        category_progress[cat] = {
            "target_minutes": target_m,
            "actual_minutes": actual_m,
            "tasks_total": cat_total,
            "tasks_completed": cat_done,
            "is_complete": (cat_done == cat_total and cat_total > 0)
        }

    # DSA Patterns counts
    dsa_patterns = db.query(DsaPattern).all()
    in_progress = sum(1 for p in dsa_patterns if p.status in ["Learning", "Practicing"])
    mastered = sum(1 for p in dsa_patterns if p.status == "Mastered")
    rev_req = sum(1 for p in dsa_patterns if p.status == "Revision Required")
    not_started = sum(1 for p in dsa_patterns if p.status == "Not Started")

    # SQL Solved Today & Accuracy
    sql_today_count = db.query(SqlProblem).filter(SqlProblem.date_logged == date_str).count()
    all_sql_problems = db.query(SqlProblem).all()
    correct_sql = sum(1 for p in all_sql_problems if p.status == "Solved Correct")
    total_sql = len(all_sql_problems)
    sql_accuracy = round((correct_sql / total_sql * 100), 1) if total_sql > 0 else 100.0

    # Streaks
    curr_streak, longest_streak = calculate_streaks(db, date_str)

    # Core CS subject for today
    core_subject = get_day_of_week_core_cs_subject(date_str)

    # Python summary
    active_py = db.query(PythonTopic).filter(PythonTopic.status == "In Progress").first()
    python_summary = f"Active: {active_py.name}" if active_py else "Fundamentals completed. Classes in progress."

    # Placement activities count
    placement_count = db.query(PlacementActivity).filter(PlacementActivity.date == date_str).count()

    # Overdue & Missed tasks
    overdue_tasks = db.query(DailyTask).filter(
        DailyTask.is_completed == False,
        (DailyTask.is_overdue == True) | (DailyTask.status == "Missed")
    ).order_by(DailyTask.date.desc()).all()

    top_3_overdue = overdue_tasks[:3]

    return {
        "date": date_str,
        "days_remaining": days_remaining,
        "target_date": settings.target_date,
        "daily_target_minutes": daily_target,
        "actual_focused_minutes": actual_focused_minutes,
        "remaining_minutes": remaining_minutes,
        "tasks_total": total_tasks,
        "tasks_completed": completed_tasks,
        "task_completion_pct": task_completion_pct,
        "study_time_pct": study_time_pct,
        "extra_study_minutes": extra_minutes,
        "current_streak": curr_streak,
        "longest_streak": longest_streak,
        "category_progress": category_progress,
        "dsa_patterns_in_progress": in_progress,
        "dsa_patterns_mastered": mastered,
        "dsa_patterns_revision_req": rev_req,
        "dsa_patterns_not_started": not_started,
        "sql_solved_today": sql_today_count,
        "sql_accuracy_pct": sql_accuracy,
        "core_cs_today_subject": core_subject,
        "python_status_summary": python_summary,
        "placement_activities_count": placement_count,
        "overdue_tasks_count": len(overdue_tasks),
        "missed_tasks_count": sum(1 for t in overdue_tasks if t.status == "Missed"),
        "top_overdue_tasks": top_3_overdue
    }

def log_audit(db: Session, entity_type: str, entity_id: Optional[int], action: str, details: str):
    timestamp_str = datetime.now().isoformat()
    audit = AuditLog(
        timestamp=timestamp_str,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        details=details
    )
    db.add(audit)
    db.commit()
