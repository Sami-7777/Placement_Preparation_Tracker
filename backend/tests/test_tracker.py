import pytest
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models import (
    UserSettings, DsaPattern, DailyTask, StudySession, SqlProblem, CoreCsTopic, PythonTopic
)

client = TestClient(app)

def test_settings_retrieval():
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["target_date"] == "2027-03-30"
    assert data["daily_target_minutes"] == 360
    assert data["dsa_target_minutes"] == 150
    assert data["sql_target_minutes"] == 60
    assert data["core_cs_target_minutes"] == 60
    assert data["python_target_minutes"] == 45
    assert data["placement_target_minutes"] == 45

def test_settings_validation_sum():
    # Category targets must sum to daily target
    invalid_settings = {
        "target_date": "2027-03-30",
        "timezone": "Asia/Kolkata",
        "daily_target_minutes": 360,
        "dsa_target_minutes": 100, # sum will be 310 != 360
        "sql_target_minutes": 60,
        "core_cs_target_minutes": 60,
        "python_target_minutes": 45,
        "placement_target_minutes": 45,
        "revision_intervals": "1,3,7",
        "theme_mode": "light"
    }
    response = client.put("/api/settings", json=invalid_settings)
    assert response.status_code == 400
    assert "Category targets sum to 310 minutes" in response.json()["detail"]

def test_16_dsa_patterns_seeded():
    response = client.get("/api/patterns")
    assert response.status_code == 200
    patterns = response.json()
    assert len(patterns) == 16
    pattern_names = [p["name"] for p in patterns]
    expected_16 = [
        "Two Pointers", "Fast & Slow Pointers", "Sliding Window", "Kadane's Algorithm",
        "Prefix Sum", "Merge Intervals", "In-place Reversal of a Linked List", "Stack",
        "Hash Maps", "Binary Search", "Heap / Priority Queue", "Recursion and Backtracking",
        "Tree Patterns", "Graph Patterns", "Dynamic Programming", "Greedy Algorithms"
    ]
    for expected in expected_16:
        assert expected in pattern_names

def test_old_programming_sections_absent():
    response = client.get("/api/patterns")
    patterns = response.json()
    pattern_names = [p["name"].lower() for p in patterns]
    forbidden = ["data types", "if else", "loops", "array traversal", "string traversal", "sets", "maps"]
    for f in forbidden:
        assert f not in pattern_names

def test_daily_tasks_generation_and_strict_time_rule():
    today_str = "2026-10-29"
    response = client.get(f"/api/tasks?date={today_str}")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 12
    total_target = sum(t["target_duration"] for t in tasks if not t.get("was_carried_forward"))
    assert total_target == 360

    # Pick a task and toggle completion
    test_task = tasks[0]
    initial_actual = test_task["actual_duration"]

    toggle_res = client.patch(f"/api/tasks/{test_task['id']}/toggle")
    assert toggle_res.status_code == 200
    toggled = toggle_res.json()
    assert toggled["is_completed"] is True
    # Strict rule: Task checkbox must NOT invent study minutes!
    assert toggled["actual_duration"] == initial_actual

def test_study_session_records_accurate_time():
    today_str = "2026-10-29"
    tasks_res = client.get(f"/api/tasks?date={today_str}")
    task_id = tasks_res.json()[0]["id"]

    session_payload = {
        "date": today_str,
        "task_id": task_id,
        "category": "DSA Patterns",
        "start_time": "10:00:00",
        "end_time": "10:35:00",
        "duration_minutes": 35.0,
        "session_type": "timer",
        "notes": "Focused Two Pointers practice"
    }
    res = client.post("/api/sessions", json=session_payload)
    assert res.status_code == 200
    session_data = res.json()
    assert session_data["duration_minutes"] == 35.0

    # Verify task updated actual_duration
    task_check = client.get(f"/api/tasks?date={today_str}").json()
    updated_task = next(t for t in task_check if t["id"] == task_id)
    assert updated_task["actual_duration"] >= 35

def test_pattern_mastery_requires_all_evidence():
    # Pattern 1
    p_res = client.get("/api/patterns/1")
    pattern = p_res.json()

    # Try setting Mastered without evidence
    update_res = client.put("/api/patterns/1", json={
        "status": "Mastered",
        "can_explain_use": False
    })
    assert update_res.status_code == 200
    # Must fallback to Practicing because criteria incomplete
    assert update_res.json()["status"] == "Practicing"

    # Now satisfy all 5 criteria
    all_evidence_res = client.put("/api/patterns/1", json={
        "status": "Mastered",
        "can_explain_use": True,
        "can_implement_core": True,
        "can_solve_unfamiliar": True,
        "can_explain_complexity": True,
        "can_resolve_delayed": True
    })
    assert all_evidence_res.status_code == 200
    assert all_evidence_res.json()["status"] == "Mastered"

def test_sql_practice_tracking():
    prob_payload = {
        "title": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "sql_topic": "SELECT, WHERE and ORDER BY",
        "query_attempt": "SELECT product_id FROM Products WHERE low_fats = 'Y' AND recyclable = 'Y'",
        "result_expected": "product_id 1, 3",
        "number_of_attempts": 1,
        "mistakes": "None",
        "time_taken_minutes": 10,
        "status": "Solved Correct",
        "date_logged": "2026-10-29"
    }
    res = client.post("/api/sql/problems", json=prob_payload)
    assert res.status_code == 200
    assert res.json()["status"] == "Solved Correct"

    # Check SQL summary
    sum_res = client.get("/api/sql/summary")
    assert sum_res.status_code == 200
    sql_summary = sum_res.json()
    assert sql_summary["total_attempted"] >= 1
    assert sql_summary["correct"] >= 1

def test_core_cs_spaced_repetition():
    topics_res = client.get("/api/core-cs")
    assert topics_res.status_code == 200
    topics = topics_res.json()
    assert len(topics) >= 28

    # Toggle first topic
    topic_id = topics[0]["id"]
    toggle_res = client.patch(f"/api/core-cs/{topic_id}/toggle")
    assert toggle_res.status_code == 200
    toggled = toggle_res.json()
    assert toggled["is_completed"] is True
    assert toggled["status"] == "Revised"
    assert toggled["next_revision_date"] is not None

def test_python_full_stack_status():
    py_res = client.get("/api/python/topics")
    assert py_res.status_code == 200
    topics = py_res.json()
    html_topic = next((t for t in topics if "HTML" in t["name"]), None)
    assert html_topic is not None
    assert html_topic["status"] == "Mastered"

    # Django and FastAPI must NOT be Mastered by default
    django_topic = next((t for t in topics if "Django" in t["name"]), None)
    assert django_topic is not None
    assert django_topic["status"] != "Mastered"

def test_dashboard_summary_calculations():
    res = client.get("/api/dashboard/summary?date=2026-10-29")
    assert res.status_code == 200
    data = res.json()
    assert data["daily_target_minutes"] == 360
    assert data["days_remaining"] == 152
    assert "DSA Patterns" in data["category_progress"]
    assert "SQL Revision & Practice" in data["category_progress"]
    assert "Core CS Fundamentals" in data["category_progress"]
    assert "Python Full Stack Revision" in data["category_progress"]
    assert "Placement Preparation" in data["category_progress"]

def test_weekly_report_calculation():
    res = client.get("/api/reports/weekly")
    assert res.status_code == 200
    data = res.json()
    assert data["total_days"] == 7
    assert len(data["days"]) == 7
    assert "consistency_pct" in data

def test_export_import_data():
    res = client.get("/api/data/export")
    assert res.status_code == 200
    exported = res.json()
    assert "dsa_patterns" in exported
    assert "daily_tasks" in exported
    assert len(exported["dsa_patterns"]) == 16

    # Test import
    imp_res = client.post("/api/data/import", json=exported)
    assert imp_res.status_code == 200
    assert imp_res.json()["message"] == "Data imported successfully"
