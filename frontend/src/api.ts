import {
  UserSettings, DsaPattern, DsaSubtopic, DsaProblem, DailyTask, StudySession,
  SqlProblem, CoreCsTopic, PythonTopic, PythonDailyLog, PlacementActivity,
  ProjectRecord, JobApplication, DailyReport, DashboardSummary
} from './types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    let msg = `Request failed: ${res.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) msg = parsed.detail;
    } catch {
      if (errorText) msg = errorText;
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // Settings
  getSettings: () => fetchJson<UserSettings>('/settings'),
  updateSettings: (data: Partial<UserSettings>) =>
    fetchJson<UserSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard
  getSummary: (date?: string) =>
    fetchJson<DashboardSummary>(`/dashboard/summary${date ? `?date=${date}` : ''}`),

  // Tasks
  getTasks: (date?: string) =>
    fetchJson<DailyTask[]>(`/tasks${date ? `?date=${date}` : ''}`),
  createTask: (data: Partial<DailyTask>) =>
    fetchJson<DailyTask>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: Partial<DailyTask>) =>
    fetchJson<DailyTask>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleTask: (id: number) =>
    fetchJson<DailyTask>(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id: number) =>
    fetchJson<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  rescheduleTask: (id: number, target_date?: string) =>
    fetchJson<DailyTask>(`/tasks/${id}/reschedule${target_date ? `?target_date=${target_date}` : ''}`, { method: 'POST' }),

  // Sessions
  getSessions: (date?: string) =>
    fetchJson<StudySession[]>(`/sessions${date ? `?date=${date}` : ''}`),
  createSession: (data: Partial<StudySession>) =>
    fetchJson<StudySession>('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  deleteSession: (id: number) =>
    fetchJson<{ message: string }>(`/sessions/${id}`, { method: 'DELETE' }),

  // DSA Patterns
  getPatterns: () => fetchJson<DsaPattern[]>('/patterns'),
  getPattern: (id: number) => fetchJson<DsaPattern>(`/patterns/${id}`),
  updatePattern: (id: number, data: Partial<DsaPattern>) =>
    fetchJson<DsaPattern>(`/patterns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addSubtopic: (patternId: number, data: { title: string; order_index: number }) =>
    fetchJson<DsaSubtopic>(`/patterns/${patternId}/subtopics`, { method: 'POST', body: JSON.stringify(data) }),
  toggleSubtopic: (id: number) =>
    fetchJson<DsaSubtopic>(`/subtopics/${id}/toggle`, { method: 'PATCH' }),
  deleteSubtopic: (id: number) =>
    fetchJson<{ message: string }>(`/subtopics/${id}`, { method: 'DELETE' }),
  addPatternProblem: (patternId: number, data: Partial<DsaProblem>) =>
    fetchJson<DsaProblem>(`/patterns/${patternId}/problems`, { method: 'POST', body: JSON.stringify(data) }),
  deleteProblem: (id: number) =>
    fetchJson<{ message: string }>(`/problems/${id}`, { method: 'DELETE' }),

  // SQL
  getSqlProblems: () => fetchJson<SqlProblem[]>('/sql/problems'),
  createSqlProblem: (data: Partial<SqlProblem>) =>
    fetchJson<SqlProblem>('/sql/problems', { method: 'POST', body: JSON.stringify(data) }),
  updateSqlProblem: (id: number, data: Partial<SqlProblem>) =>
    fetchJson<SqlProblem>(`/sql/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSqlProblem: (id: number) =>
    fetchJson<{ message: string }>(`/sql/problems/${id}`, { method: 'DELETE' }),
  getSqlSummary: () => fetchJson<any>('/sql/summary'),

  // Core CS
  getCoreCsTopics: (subject?: string) =>
    fetchJson<CoreCsTopic[]>(`/core-cs${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`),
  updateCoreCsTopic: (id: number, data: Partial<CoreCsTopic>) =>
    fetchJson<CoreCsTopic>(`/core-cs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleCoreCsTopic: (id: number) =>
    fetchJson<CoreCsTopic>(`/core-cs/${id}/toggle`, { method: 'PATCH' }),

  // Python FS
  getPythonTopics: () => fetchJson<PythonTopic[]>('/python/topics'),
  updatePythonTopic: (id: number, data: Partial<PythonTopic>) =>
    fetchJson<PythonTopic>(`/python/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPythonLogs: (date?: string) =>
    fetchJson<PythonDailyLog[]>(`/python/logs${date ? `?date_str=${date}` : ''}`),
  createPythonLog: (data: Partial<PythonDailyLog>) =>
    fetchJson<PythonDailyLog>('/python/logs', { method: 'POST', body: JSON.stringify(data) }),

  // Placement Activities & Jobs & Projects
  getPlacementActivities: (date?: string) =>
    fetchJson<PlacementActivity[]>(`/placement/activities${date ? `?date_str=${date}` : ''}`),
  createPlacementActivity: (data: Partial<PlacementActivity>) =>
    fetchJson<PlacementActivity>('/placement/activities', { method: 'POST', body: JSON.stringify(data) }),
  deletePlacementActivity: (id: number) =>
    fetchJson<{ message: string }>(`/placement/activities/${id}`, { method: 'DELETE' }),

  getProjects: () => fetchJson<ProjectRecord[]>('/placement/projects'),
  createProject: (data: Partial<ProjectRecord>) =>
    fetchJson<ProjectRecord>('/placement/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: Partial<ProjectRecord>) =>
    fetchJson<ProjectRecord>(`/placement/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) =>
    fetchJson<{ message: string }>(`/placement/projects/${id}`, { method: 'DELETE' }),

  getJobApplications: () => fetchJson<JobApplication[]>('/placement/applications'),
  createJobApplication: (data: Partial<JobApplication>) =>
    fetchJson<JobApplication>('/placement/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateJobApplication: (id: number, data: Partial<JobApplication>) =>
    fetchJson<JobApplication>(`/placement/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJobApplication: (id: number) =>
    fetchJson<{ message: string }>(`/placement/applications/${id}`, { method: 'DELETE' }),

  // Reports
  getDailyReport: (date: string) => fetchJson<DailyReport | null>(`/reports/daily?date_str=${date}`),
  closeDailyReport: (date: string, reflections: string) =>
    fetchJson<DailyReport>('/reports/daily/close', { method: 'POST', body: JSON.stringify({ date, reflections }) }),
  getWeeklyReport: (week_start?: string) =>
    fetchJson<any>(`/reports/weekly${week_start ? `?week_start=${week_start}` : ''}`),

  // Export / Import
  exportData: () => fetchJson<any>('/data/export'),
  importData: (data: any) =>
    fetchJson<any>('/data/import', { method: 'POST', body: JSON.stringify(data) }),

  // Audit
  getAuditLogs: () => fetchJson<any[]>('/audit'),
};
