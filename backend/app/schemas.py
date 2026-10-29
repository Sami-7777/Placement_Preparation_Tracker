from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Settings
class UserSettingsBase(BaseModel):
    target_date: str = "2027-03-30"
    timezone: str = "Asia/Kolkata"
    daily_target_minutes: int = 360
    dsa_target_minutes: int = 150
    sql_target_minutes: int = 60
    core_cs_target_minutes: int = 60
    python_target_minutes: int = 45
    placement_target_minutes: int = 45
    revision_intervals: str = "1,3,7"
    current_dsa_pattern_id: Optional[int] = None
    theme_mode: str = "light"

class UserSettingsResponse(UserSettingsBase):
    id: int
    class Config:
        from_attributes = True

# DSA Pattern & Subtopics
class DsaSubtopicBase(BaseModel):
    title: str
    is_completed: bool = False
    order_index: int = 0
    is_disabled: bool = False

class DsaSubtopicCreate(DsaSubtopicBase):
    pattern_id: int

class DsaSubtopicResponse(DsaSubtopicBase):
    id: int
    pattern_id: int
    class Config:
        from_attributes = True

class DsaProblemBase(BaseModel):
    title: str
    difficulty: str = "Medium"
    source_url: Optional[str] = None
    status: str = "Solved Correct"
    time_spent_minutes: int = 0
    solved_independently: bool = True
    notes: Optional[str] = ""
    date_solved: str

class DsaProblemCreate(DsaProblemBase):
    pattern_id: Optional[int] = None

class DsaProblemResponse(DsaProblemBase):
    id: int
    pattern_id: Optional[int] = None
    class Config:
        from_attributes = True

class DsaPatternBase(BaseModel):
    name: str
    stage: int = 1
    order_index: int = 0
    status: str = "Not Started"
    confidence_rating: int = 1
    date_started: Optional[str] = None
    last_practiced_date: Optional[str] = None
    last_revised_date: Optional[str] = None
    next_revision_date: Optional[str] = None
    recognition_clues: Optional[str] = ""
    when_and_why: Optional[str] = ""
    common_mistakes: Optional[str] = ""
    complexity_notes: Optional[str] = ""
    personal_notes: Optional[str] = ""
    daily_goal: Optional[str] = ""
    revision_schedule: Optional[str] = ""
    can_explain_use: bool = False
    can_implement_core: bool = False
    can_solve_unfamiliar: bool = False
    can_explain_complexity: bool = False
    can_resolve_delayed: bool = False

class DsaPatternUpdate(BaseModel):
    status: Optional[str] = None
    confidence_rating: Optional[int] = None
    date_started: Optional[str] = None
    last_practiced_date: Optional[str] = None
    last_revised_date: Optional[str] = None
    next_revision_date: Optional[str] = None
    recognition_clues: Optional[str] = None
    when_and_why: Optional[str] = None
    common_mistakes: Optional[str] = None
    complexity_notes: Optional[str] = None
    personal_notes: Optional[str] = None
    daily_goal: Optional[str] = None
    revision_schedule: Optional[str] = None
    can_explain_use: Optional[bool] = None
    can_implement_core: Optional[bool] = None
    can_solve_unfamiliar: Optional[bool] = None
    can_explain_complexity: Optional[bool] = None
    can_resolve_delayed: Optional[bool] = None

class DsaPatternResponse(DsaPatternBase):
    id: int
    subtopics: List[DsaSubtopicResponse] = []
    problems: List[DsaProblemResponse] = []
    class Config:
        from_attributes = True

# Daily Tasks
class DailyTaskBase(BaseModel):
    date: str
    title: str
    category: str
    subtask_type: str = ""
    target_duration: int = 0
    actual_duration: int = 0
    is_completed: bool = False
    status: str = "Not Started"
    start_time: Optional[str] = None
    completion_time: Optional[str] = None
    notes: Optional[str] = ""
    is_overdue: bool = False
    was_carried_forward: bool = False
    revision_due_date: Optional[str] = None
    order_index: int = 0

class DailyTaskCreate(DailyTaskBase):
    pass

class DailyTaskUpdate(BaseModel):
    title: Optional[str] = None
    target_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    is_completed: Optional[bool] = None
    status: Optional[str] = None
    start_time: Optional[str] = None
    completion_time: Optional[str] = None
    notes: Optional[str] = None
    is_overdue: Optional[bool] = None
    was_carried_forward: Optional[bool] = None
    revision_due_date: Optional[str] = None

class DailyTaskResponse(DailyTaskBase):
    id: int
    class Config:
        from_attributes = True

# Study Sessions
class StudySessionBase(BaseModel):
    date: str
    task_id: Optional[int] = None
    category: str
    start_time: str
    end_time: str
    duration_minutes: float
    session_type: str = "timer"
    notes: Optional[str] = ""

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionResponse(StudySessionBase):
    id: int
    class Config:
        from_attributes = True

# SQL
class SqlProblemBase(BaseModel):
    title: str
    source_url: Optional[str] = None
    difficulty: str = "Medium"
    sql_topic: str
    query_attempt: Optional[str] = ""
    result_expected: Optional[str] = ""
    number_of_attempts: int = 1
    mistakes: Optional[str] = ""
    time_taken_minutes: int = 0
    status: str = "Solved Correct"
    next_revision_date: Optional[str] = None
    date_logged: str

class SqlProblemCreate(SqlProblemBase):
    pass

class SqlProblemResponse(SqlProblemBase):
    id: int
    class Config:
        from_attributes = True

# Core CS
class CoreCsTopicBase(BaseModel):
    subject: str
    topic_name: str
    status: str = "Not Started"
    confidence_rating: int = 1
    notes: Optional[str] = ""
    interview_questions: Optional[str] = ""
    practice_questions: Optional[str] = ""
    is_completed: bool = False
    last_revised_date: Optional[str] = None
    next_revision_date: Optional[str] = None
    order_index: int = 0

class CoreCsTopicUpdate(BaseModel):
    status: Optional[str] = None
    confidence_rating: Optional[int] = None
    notes: Optional[str] = None
    interview_questions: Optional[str] = None
    practice_questions: Optional[str] = None
    is_completed: Optional[bool] = None
    last_revised_date: Optional[str] = None
    next_revision_date: Optional[str] = None

class CoreCsTopicResponse(CoreCsTopicBase):
    id: int
    class Config:
        from_attributes = True

# Python Topics & Logs
class PythonTopicBase(BaseModel):
    name: str
    status: str = "Not Started"
    notes: Optional[str] = ""
    code_snippets: Optional[str] = ""
    doubts: Optional[str] = ""
    is_active: bool = False
    last_revised_date: Optional[str] = None
    order_index: int = 0

class PythonTopicUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    code_snippets: Optional[str] = None
    doubts: Optional[str] = None
    is_active: Optional[bool] = None
    last_revised_date: Optional[str] = None

class PythonTopicResponse(PythonTopicBase):
    id: int
    class Config:
        from_attributes = True

class PythonDailyLogCreate(BaseModel):
    date: str
    topic_id: Optional[int] = None
    topic_name: str
    actual_time_minutes: int = 0
    code_written: Optional[str] = ""
    doubts: Optional[str] = ""
    notes: Optional[str] = ""
    is_completed: bool = False

class PythonDailyLogResponse(PythonDailyLogCreate):
    id: int
    class Config:
        from_attributes = True

# Placement Activities
class PlacementActivityCreate(BaseModel):
    date: str
    activity_type: str = "Aptitude"
    title: str
    score_or_result: Optional[str] = None
    time_spent_minutes: int = 0
    notes: Optional[str] = ""
    key_takeaways: Optional[str] = ""

class PlacementActivityResponse(PlacementActivityCreate):
    id: int
    class Config:
        from_attributes = True

# Projects
class ProjectRecordBase(BaseModel):
    title: str
    tech_stack: Optional[str] = ""
    github_url: Optional[str] = ""
    status: str = "In Progress"
    technical_doubts: Optional[str] = ""
    interview_readiness_notes: Optional[str] = ""
    tasks_todo: Optional[str] = ""

class ProjectRecordCreate(ProjectRecordBase):
    pass

class ProjectRecordResponse(ProjectRecordBase):
    id: int
    class Config:
        from_attributes = True

# Job Applications
class JobApplicationBase(BaseModel):
    company: str
    role: str
    job_url: Optional[str] = ""
    eligibility_criteria: Optional[str] = ""
    application_date: str
    status: str = "To Apply"
    assessment_date: Optional[str] = None
    interview_dates: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = ""

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationResponse(JobApplicationBase):
    id: int
    class Config:
        from_attributes = True

# Daily Report
class DailyReportCreate(BaseModel):
    date: str
    reflections: Optional[str] = ""

class DailyReportResponse(BaseModel):
    id: int
    date: str
    target_minutes: int
    actual_minutes: int
    tasks_total: int
    tasks_completed: int
    dsa_minutes: int
    sql_minutes: int
    core_cs_minutes: int
    python_minutes: int
    placement_minutes: int
    reflections: Optional[str]
    is_target_met: bool
    created_at: str
    class Config:
        from_attributes = True

# Dashboard Summary Response
class DashboardSummary(BaseModel):
    date: str
    days_remaining: int
    target_date: str
    daily_target_minutes: int
    actual_focused_minutes: int
    remaining_minutes: int
    tasks_total: int
    tasks_completed: int
    task_completion_pct: float
    study_time_pct: float
    extra_study_minutes: int
    current_streak: int
    longest_streak: int
    # Category Breakdowns
    category_progress: Dict[str, Dict[str, Any]]
    dsa_patterns_in_progress: int
    dsa_patterns_mastered: int
    dsa_patterns_revision_req: int
    dsa_patterns_not_started: int
    sql_solved_today: int
    sql_accuracy_pct: float
    core_cs_today_subject: str
    python_status_summary: str
    placement_activities_count: int
    overdue_tasks_count: int
    missed_tasks_count: int
    top_overdue_tasks: List[DailyTaskResponse]
