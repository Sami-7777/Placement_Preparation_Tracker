export interface UserSettings {
  id: number;
  target_date: string;
  timezone: string;
  daily_target_minutes: number;
  dsa_target_minutes: number;
  sql_target_minutes: number;
  core_cs_target_minutes: number;
  python_target_minutes: number;
  placement_target_minutes: number;
  revision_intervals: string;
  current_dsa_pattern_id?: number | null;
  theme_mode: string;
}

export interface DsaSubtopic {
  id: number;
  pattern_id: number;
  title: string;
  is_completed: boolean;
  order_index: number;
  is_disabled: boolean;
}

export interface DsaProblem {
  id: number;
  pattern_id?: number | null;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  source_url?: string | null;
  status: 'Attempted' | 'Solved Correct' | 'Hint Required' | 'Incorrect';
  time_spent_minutes: number;
  solved_independently: boolean;
  notes?: string;
  date_solved: string;
}

export interface DsaPattern {
  id: number;
  name: string;
  stage: number;
  order_index: number;
  status: 'Not Started' | 'Learning' | 'Practicing' | 'Revision Required' | 'Mastered';
  confidence_rating: number;
  date_started?: string | null;
  last_practiced_date?: string | null;
  last_revised_date?: string | null;
  next_revision_date?: string | null;
  recognition_clues: string;
  when_and_why: string;
  common_mistakes: string;
  complexity_notes: string;
  personal_notes: string;
  daily_goal: string;
  revision_schedule: string;
  can_explain_use: boolean;
  can_implement_core: boolean;
  can_solve_unfamiliar: boolean;
  can_explain_complexity: boolean;
  can_resolve_delayed: boolean;
  subtopics: DsaSubtopic[];
  problems: DsaProblem[];
}

export interface DailyTask {
  id: number;
  date: string;
  title: string;
  category: string;
  subtask_type: string;
  target_duration: number;
  actual_duration: number;
  is_completed: boolean;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Missed';
  start_time?: string | null;
  completion_time?: string | null;
  notes: string;
  is_overdue: boolean;
  was_carried_forward: boolean;
  revision_due_date?: string | null;
  order_index: number;
}

export interface StudySession {
  id: number;
  date: string;
  task_id?: number | null;
  category: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_type: 'timer' | 'manual';
  notes?: string;
}

export interface SqlProblem {
  id: number;
  title: string;
  source_url?: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sql_topic: string;
  query_attempt: string;
  result_expected: string;
  number_of_attempts: number;
  mistakes: string;
  time_taken_minutes: number;
  status: 'Attempted' | 'Solved Correct' | 'Hint Required' | 'Incorrect';
  next_revision_date?: string | null;
  date_logged: string;
}

export interface CoreCsTopic {
  id: number;
  subject: string;
  topic_name: string;
  status: 'Not Started' | 'In Progress' | 'Revised' | 'Mastered';
  confidence_rating: number;
  notes: string;
  interview_questions: string;
  practice_questions: string;
  is_completed: boolean;
  last_revised_date?: string | null;
  next_revision_date?: string | null;
  order_index: number;
}

export interface PythonTopic {
  id: number;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Revised' | 'Mastered';
  notes: string;
  code_snippets: string;
  doubts: string;
  is_active: boolean;
  last_revised_date?: string | null;
  order_index: number;
}

export interface PythonDailyLog {
  id: number;
  date: string;
  topic_id?: number | null;
  topic_name: string;
  actual_time_minutes: number;
  code_written: string;
  doubts: string;
  notes: string;
  is_completed: boolean;
}

export interface PlacementActivity {
  id: number;
  date: string;
  activity_type: string;
  title: string;
  score_or_result?: string | null;
  time_spent_minutes: number;
  notes: string;
  key_takeaways: string;
}

export interface ProjectRecord {
  id: number;
  title: string;
  tech_stack: string;
  github_url: string;
  status: 'Idea' | 'In Progress' | 'MVP Complete' | 'Production Ready';
  technical_doubts: string;
  interview_readiness_notes: string;
  tasks_todo: string;
}

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  job_url: string;
  eligibility_criteria: string;
  application_date: string;
  status: 'Interested' | 'To Apply' | 'Applied' | 'Assessment Scheduled' | 'Interview Scheduled' | 'Rejected' | 'Selected' | 'Offer Received';
  assessment_date?: string | null;
  interview_dates?: string | null;
  follow_up_date?: string | null;
  notes: string;
}

export interface DailyReport {
  id: number;
  date: string;
  target_minutes: number;
  actual_minutes: number;
  tasks_total: number;
  tasks_completed: number;
  dsa_minutes: number;
  sql_minutes: number;
  core_cs_minutes: number;
  python_minutes: number;
  placement_minutes: number;
  reflections: string;
  is_target_met: boolean;
  created_at: string;
}

export interface DashboardSummary {
  date: string;
  days_remaining: number;
  target_date: string;
  daily_target_minutes: number;
  actual_focused_minutes: number;
  remaining_minutes: number;
  tasks_total: number;
  tasks_completed: number;
  task_completion_pct: number;
  study_time_pct: number;
  extra_study_minutes: number;
  current_streak: number;
  longest_streak: number;
  category_progress: Record<string, {
    target_minutes: number;
    actual_minutes: number;
    tasks_total: number;
    tasks_completed: number;
    is_complete: boolean;
  }>;
  dsa_patterns_in_progress: number;
  dsa_patterns_mastered: number;
  dsa_patterns_revision_req: number;
  dsa_patterns_not_started: number;
  sql_solved_today: number;
  sql_accuracy_pct: number;
  core_cs_today_subject: string;
  python_status_summary: string;
  placement_activities_count: number;
  overdue_tasks_count: number;
  missed_tasks_count: number;
  top_overdue_tasks: DailyTask[];
}
