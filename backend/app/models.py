from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    target_date = Column(String, default="2027-03-30")
    timezone = Column(String, default="Asia/Kolkata")
    daily_target_minutes = Column(Integer, default=360)
    dsa_target_minutes = Column(Integer, default=150)
    sql_target_minutes = Column(Integer, default=60)
    core_cs_target_minutes = Column(Integer, default=60)
    python_target_minutes = Column(Integer, default=45)
    placement_target_minutes = Column(Integer, default=45)
    revision_intervals = Column(String, default="1,3,7")
    current_dsa_pattern_id = Column(Integer, nullable=True)
    theme_mode = Column(String, default="light")


class DsaPattern(Base):
    __tablename__ = "dsa_patterns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    stage = Column(Integer, default=1)
    order_index = Column(Integer, default=0)
    status = Column(String, default="Not Started")  # Not Started, Learning, Practicing, Revision Required, Mastered
    confidence_rating = Column(Integer, default=1)  # 1-5
    date_started = Column(String, nullable=True)
    last_practiced_date = Column(String, nullable=True)
    last_revised_date = Column(String, nullable=True)
    next_revision_date = Column(String, nullable=True)
    recognition_clues = Column(Text, default="")
    when_and_why = Column(Text, default="")
    common_mistakes = Column(Text, default="")
    complexity_notes = Column(Text, default="")
    personal_notes = Column(Text, default="")
    daily_goal = Column(Text, default="")
    revision_schedule = Column(Text, default="")
    # Mastery Evidence Checklist
    can_explain_use = Column(Boolean, default=False)
    can_implement_core = Column(Boolean, default=False)
    can_solve_unfamiliar = Column(Boolean, default=False)
    can_explain_complexity = Column(Boolean, default=False)
    can_resolve_delayed = Column(Boolean, default=False)

    subtopics = relationship("DsaSubtopic", back_populates="pattern", cascade="all, delete-orphan", order_by="DsaSubtopic.order_index")
    problems = relationship("DsaProblem", back_populates="pattern", cascade="all, delete-orphan")


class DsaSubtopic(Base):
    __tablename__ = "dsa_subtopics"

    id = Column(Integer, primary_key=True, index=True)
    pattern_id = Column(Integer, ForeignKey("dsa_patterns.id"), nullable=False)
    title = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    is_disabled = Column(Boolean, default=False)

    pattern = relationship("DsaPattern", back_populates="subtopics")


class DsaProblem(Base):
    __tablename__ = "dsa_problems"

    id = Column(Integer, primary_key=True, index=True)
    pattern_id = Column(Integer, ForeignKey("dsa_patterns.id"), nullable=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    source_url = Column(String, nullable=True)
    status = Column(String, default="Attempted")  # Attempted, Solved Correct, Hint Required, Incorrect
    time_spent_minutes = Column(Integer, default=0)
    solved_independently = Column(Boolean, default=True)
    notes = Column(Text, default="")
    date_solved = Column(String, nullable=False)

    pattern = relationship("DsaPattern", back_populates="problems")


class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # DSA Patterns, SQL Revision & Practice, Core CS Fundamentals, Python Full Stack Revision, Placement Preparation
    subtask_type = Column(String, default="")
    target_duration = Column(Integer, default=0)  # in minutes
    actual_duration = Column(Integer, default=0)  # in minutes (from timer or explicit input)
    is_completed = Column(Boolean, default=False)
    status = Column(String, default="Not Started")  # Not Started, In Progress, Completed, Missed
    start_time = Column(String, nullable=True)
    completion_time = Column(String, nullable=True)
    notes = Column(Text, default="")
    is_overdue = Column(Boolean, default=False)
    was_carried_forward = Column(Boolean, default=False)
    revision_due_date = Column(String, nullable=True)
    order_index = Column(Integer, default=0)


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("daily_tasks.id"), nullable=True)
    category = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    duration_minutes = Column(Float, nullable=False)
    session_type = Column(String, default="timer")  # timer, manual
    notes = Column(Text, default="")


class SqlProblem(Base):
    __tablename__ = "sql_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    difficulty = Column(String, default="Medium")
    sql_topic = Column(String, nullable=False)
    query_attempt = Column(Text, default="")
    result_expected = Column(Text, default="")
    number_of_attempts = Column(Integer, default=1)
    mistakes = Column(Text, default="")
    time_taken_minutes = Column(Integer, default=0)
    status = Column(String, default="Solved Correct")  # Solved Correct, Hint Required, Incorrect, Attempted
    next_revision_date = Column(String, nullable=True)
    date_logged = Column(String, nullable=False, index=True)


class CoreCsTopic(Base):
    __tablename__ = "core_cs_topics"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)  # DBMS, OOP, Operating Systems, Computer Networks
    topic_name = Column(String, nullable=False)
    status = Column(String, default="Not Started")  # Not Started, In Progress, Revised, Mastered
    confidence_rating = Column(Integer, default=1)
    notes = Column(Text, default="")
    interview_questions = Column(Text, default="")
    practice_questions = Column(Text, default="")
    is_completed = Column(Boolean, default=False)
    last_revised_date = Column(String, nullable=True)
    next_revision_date = Column(String, nullable=True)
    order_index = Column(Integer, default=0)


class PythonTopic(Base):
    __tablename__ = "python_topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="Not Started")  # Not Started, In Progress, Revised, Mastered
    notes = Column(Text, default="")
    code_snippets = Column(Text, default="")
    doubts = Column(Text, default="")
    is_active = Column(Boolean, default=False)
    last_revised_date = Column(String, nullable=True)
    order_index = Column(Integer, default=0)


class PythonDailyLog(Base):
    __tablename__ = "python_daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("python_topics.id"), nullable=True)
    topic_name = Column(String, nullable=False)
    actual_time_minutes = Column(Integer, default=0)
    code_written = Column(Text, default="")
    doubts = Column(Text, default="")
    notes = Column(Text, default="")
    is_completed = Column(Boolean, default=False)


class PlacementActivity(Base):
    __tablename__ = "placement_activities"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, index=True)
    activity_type = Column(String, default="Aptitude")  # Aptitude, Reasoning, Mock Interview, Coding Assessment, Resume Work, Project Work, Other
    title = Column(String, nullable=False)
    score_or_result = Column(String, nullable=True)
    time_spent_minutes = Column(Integer, default=0)
    notes = Column(Text, default="")
    key_takeaways = Column(Text, default="")


class ProjectRecord(Base):
    __tablename__ = "project_records"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    tech_stack = Column(String, default="")
    github_url = Column(String, default="")
    status = Column(String, default="In Progress")  # Idea, In Progress, MVP Complete, Production Ready
    technical_doubts = Column(Text, default="")
    interview_readiness_notes = Column(Text, default="")
    tasks_todo = Column(Text, default="")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    job_url = Column(String, default="")
    eligibility_criteria = Column(String, default="")
    application_date = Column(String, nullable=False)
    status = Column(String, default="To Apply")  # Interested, To Apply, Applied, Assessment Scheduled, Interview Scheduled, Rejected, Selected, Offer Received
    assessment_date = Column(String, nullable=True)
    interview_dates = Column(String, nullable=True)
    follow_up_date = Column(String, nullable=True)
    notes = Column(Text, default="")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, default="")


class DailyReport(Base):
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, nullable=False, index=True)
    target_minutes = Column(Integer, default=360)
    actual_minutes = Column(Integer, default=0)
    tasks_total = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    dsa_minutes = Column(Integer, default=0)
    sql_minutes = Column(Integer, default=0)
    core_cs_minutes = Column(Integer, default=0)
    python_minutes = Column(Integer, default=0)
    placement_minutes = Column(Integer, default=0)
    reflections = Column(Text, default="")
    is_target_met = Column(Boolean, default=False)
    created_at = Column(String, nullable=False)
