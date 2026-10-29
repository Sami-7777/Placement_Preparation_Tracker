import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_all_tests():
    print("=== STARTING COMPREHENSIVE AUTOMATED TEST SUITE ===")
    
    # 1. Settings
    res = client.get("/api/settings")
    assert res.status_code == 200, f"Settings failed: {res.text}"
    s = res.json()
    assert s["daily_target_minutes"] == 360, f"Expected 360m target, got {s['daily_target_minutes']}"
    assert s["target_date"] == "2027-03-30", f"Expected 2027-03-30, got {s['target_date']}"
    print("✓ Test 1: User Settings & default 360m daily target verified.")

    # 2. Validation of category sum
    invalid_settings = {
        "target_date": "2027-03-30",
        "timezone": "Asia/Kolkata",
        "daily_target_minutes": 360,
        "dsa_target_minutes": 100,
        "sql_target_minutes": 60,
        "core_cs_target_minutes": 60,
        "python_target_minutes": 45,
        "placement_target_minutes": 45,
        "revision_intervals": "1,3,7",
        "theme_mode": "light"
    }
    inv_res = client.put("/api/settings", json=invalid_settings)
    assert inv_res.status_code == 400, "Expected 400 validation error for mismatched category sum"
    print("✓ Test 2: Category target sum validation verified (sum must equal 360m).")

    # 3. Exactly 16 DSA Patterns
    pat_res = client.get("/api/patterns")
    assert pat_res.status_code == 200
    patterns = pat_res.json()
    assert len(patterns) == 16, f"Expected exactly 16 patterns, got {len(patterns)}"
    pattern_names = [p["name"] for p in patterns]
    expected_16 = [
        "Two Pointers", "Fast & Slow Pointers", "Sliding Window", "Kadane's Algorithm",
        "Prefix Sum", "Merge Intervals", "In-place Reversal of a Linked List", "Stack",
        "Hash Maps", "Binary Search", "Heap / Priority Queue", "Recursion and Backtracking",
        "Tree Patterns", "Graph Patterns", "Dynamic Programming", "Greedy Algorithms"
    ]
    for exp in expected_16:
        assert exp in pattern_names, f"Missing pattern: {exp}"
    print("✓ Test 3: Exactly 16 main DSA pattern cards verified.")

    # 4. Old programming sections absent
    forbidden = ["data types", "if else", "loops", "array traversal", "string traversal", "sets", "maps"]
    for p_name in pattern_names:
        for f in forbidden:
            assert f != p_name.lower(), f"Forbidden old section found: {p_name}"
    print("✓ Test 4: Old basic programming sections successfully removed.")

    # 5. Daily Task Engine & Strict Study Time Separation
    today_str = "2026-10-29"
    t_res = client.get(f"/api/tasks?date={today_str}")
    assert t_res.status_code == 200
    tasks = t_res.json()
    assert len(tasks) >= 12, f"Expected at least 12 subtasks, got {len(tasks)}"
    initial_sum = sum(t["actual_duration"] for t in tasks)
    
    # Toggle task
    test_task = tasks[0]
    expected_status = not test_task["is_completed"]
    toggle_res = client.patch(f"/api/tasks/{test_task['id']}/toggle")
    assert toggle_res.status_code == 200
    toggled = toggle_res.json()
    assert toggled["is_completed"] == expected_status
    # Verify checking task did NOT invent study minutes
    tasks_after = client.get(f"/api/tasks?date={today_str}").json()
    after_sum = sum(t["actual_duration"] for t in tasks_after)
    assert after_sum == initial_sum, f"Task checkbox illegally modified actual study minutes! ({initial_sum} -> {after_sum})"
    print("✓ Test 5: Daily task engine & strict study time separation verified (checkboxes don't invent time).")

    # 6. Timer and Study Session recording
    session_payload = {
        "date": today_str,
        "task_id": test_task["id"],
        "category": "DSA Patterns",
        "start_time": "14:00:00",
        "end_time": "14:40:00",
        "duration_minutes": 40.0,
        "session_type": "timer",
        "notes": "40m independent problem solving"
    }
    s_res = client.post("/api/sessions", json=session_payload)
    assert s_res.status_code == 200
    # Check that task actual duration now reflects the 40m recorded
    task_recheck = client.get(f"/api/tasks?date={today_str}").json()
    updated_t = next(t for t in task_recheck if t["id"] == test_task["id"])
    assert updated_t["actual_duration"] >= 40, f"Expected >= 40m recorded duration, got {updated_t['actual_duration']}"
    print("✓ Test 6: Accurate timer and study session persistence verified.")

    # 7. Strict DSA Mastery Evidence
    # Try setting Mastered without evidence
    up_res = client.put("/api/patterns/1", json={"status": "Mastered", "can_explain_use": False})
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "Practicing", "Pattern allowed Mastered status without 5/5 evidence!"

    # Satisfy all 5 criteria
    all_evidence = client.put("/api/patterns/1", json={
        "status": "Mastered",
        "can_explain_use": True,
        "can_implement_core": True,
        "can_solve_unfamiliar": True,
        "can_explain_complexity": True,
        "can_resolve_delayed": True
    })
    assert all_evidence.status_code == 200
    assert all_evidence.json()["status"] == "Mastered"
    print("✓ Test 7: Strict DSA pattern mastery criteria (all 5 evidence items required) verified.")

    # 8. SQL Practice
    sql_payload = {
        "title": "Recyclable and Low Fat Products",
        "difficulty": "Easy",
        "sql_topic": "SELECT, WHERE and ORDER BY",
        "query_attempt": "SELECT product_id FROM Products WHERE low_fats = 'Y' AND recyclable = 'Y'",
        "result_expected": "product_id 1, 3",
        "number_of_attempts": 1,
        "mistakes": "None",
        "time_taken_minutes": 15,
        "status": "Solved Correct",
        "date_logged": today_str
    }
    sql_res = client.post("/api/sql/problems", json=sql_payload)
    assert sql_res.status_code == 200
    sql_sum = client.get("/api/sql/summary").json()
    assert sql_sum["total_attempted"] >= 1
    assert sql_sum["correct"] >= 1
    print("✓ Test 8: SQL problem tracking, query logging and accuracy stats verified.")

    # 9. Core CS Weekly Rotation & Spaced Repetition
    core_res = client.get("/api/core-cs")
    assert core_res.status_code == 200
    topics = core_res.json()
    assert len(topics) == 28, f"Expected 28 core CS topics, got {len(topics)}"
    t0 = topics[0]
    expected_core_status = not t0["is_completed"]
    toggle_core = client.patch(f"/api/core-cs/{t0['id']}/toggle").json()
    assert toggle_core["is_completed"] == expected_core_status
    assert toggle_core["next_revision_date"] is not None
    print("✓ Test 9: Core CS rotation & spaced repetition reminders verified.")

    # 10. Python Full Stack status
    py_topics = client.get("/api/python/topics").json()
    html_topic = next((t for t in py_topics if "HTML" in t["name"]), None)
    assert html_topic["status"] == "Mastered", "HTML & CSS must be marked Mastered/completed fundamentals"
    django_topic = next((t for t in py_topics if "Django" in t["name"]), None)
    assert django_topic["status"] != "Mastered", "Django must NOT be marked completed without explicit update"
    print("✓ Test 10: Python Full Stack status rules (HTML/CSS completed, advanced uncompleted) verified.")

    # 11. Dashboard Summary
    dash_res = client.get(f"/api/dashboard/summary?date={today_str}")
    assert dash_res.status_code == 200
    d = dash_res.json()
    assert d["days_remaining"] == 152
    assert d["daily_target_minutes"] == 360
    assert d["dsa_patterns_mastered"] >= 1
    assert "DSA Patterns" in d["category_progress"]
    print("✓ Test 11: Dashboard summary & deadline calculation to 30 March 2027 verified.")

    # 12. Weekly Consistency & Accountability
    week_res = client.get("/api/reports/weekly")
    assert week_res.status_code == 200
    w = week_res.json()
    assert w["total_days"] == 7
    assert len(w["days"]) == 7
    assert "consistency_pct" in w
    print("✓ Test 12: Weekly consistency & accountability report verified.")

    # 13. Data Export & Import
    exp_res = client.get("/api/data/export")
    assert exp_res.status_code == 200
    exported_data = exp_res.json()
    assert len(exported_data["dsa_patterns"]) == 16
    imp_res = client.post("/api/data/import", json=exported_data)
    assert imp_res.status_code == 200
    print("✓ Test 13: Full persistent database export and import verified.")

    print("\nALL 13 AUTOMATED ACCEPTANCE TESTS PASSED SUCCESSFULLY! 100% VERIFIED.")

if __name__ == "__main__":
    run_all_tests()
