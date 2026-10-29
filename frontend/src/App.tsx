import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { DailyTasksView } from './views/DailyTasksView';
import { DsaPatternsView } from './views/DsaPatternsView';
import { SqlPracticeView } from './views/SqlPracticeView';
import { CoreCsView } from './views/CoreCsView';
import { PythonRevisionView } from './views/PythonRevisionView';
import { PlacementView } from './views/PlacementView';
import { ReportsView } from './views/ReportsView';
import { ManualTimeModal } from './components/ManualTimeModal';
import { FinishSessionModal } from './components/FinishSessionModal';
import { DailyClosingModal } from './components/DailyClosingModal';
import { api } from './api';
import {
  DashboardSummary,
  DailyTask,
  DsaPattern,
  SqlProblem,
  CoreCsTopic,
  PythonTopic,
  PythonDailyLog,
  PlacementActivity,
  ProjectRecord,
  JobApplication
} from './types';

export function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme_mode') as 'light' | 'dark') || 'light';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Core Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [patterns, setPatterns] = useState<DsaPattern[]>([]);
  const [sqlProblems, setSqlProblems] = useState<SqlProblem[]>([]);
  const [sqlSummary, setSqlSummary] = useState<any>(null);
  const [coreCsTopics, setCoreCsTopics] = useState<CoreCsTopic[]>([]);
  const [pythonTopics, setPythonTopics] = useState<PythonTopic[]>([]);
  const [pythonLogs, setPythonLogs] = useState<PythonDailyLog[]>([]);
  const [placementActivities, setPlacementActivities] = useState<PlacementActivity[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isFinishSessionModalOpen, setIsFinishSessionModalOpen] = useState(false);
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);

  // Timer State (Persisted in localStorage across refreshes)
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    const saved = localStorage.getItem('study_timer_seconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [timerCategory, setTimerCategory] = useState<string>(() => {
    return localStorage.getItem('study_timer_category') || 'DSA Patterns';
  });

  const timerIntervalRef = useRef<any>(null);

  // Apply Theme Mode class to root element
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Timer Tick Effect
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          localStorage.setItem('study_timer_seconds', next.toString());
          return next;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  // Load All Data for Current Date
  const loadData = async (dateStr: string) => {
    try {
      const [
        sum,
        tsks,
        patts,
        sqlProbs,
        sqlSum,
        coreTopics,
        pyTopics,
        pyLogs,
        placeActs,
        projs,
        apps
      ] = await Promise.all([
        api.getSummary(dateStr),
        api.getTasks(dateStr),
        api.getPatterns(),
        api.getSqlProblems(),
        api.getSqlSummary(),
        api.getCoreCsTopics(),
        api.getPythonTopics(),
        api.getPythonLogs(dateStr),
        api.getPlacementActivities(dateStr),
        api.getProjects(),
        api.getJobApplications(),
      ]);

      setSummary(sum);
      setTasks(tsks);
      setPatterns(patts);
      setSqlProblems(sqlProbs);
      setSqlSummary(sqlSum);
      setCoreCsTopics(coreTopics);
      setPythonTopics(pyTopics);
      setPythonLogs(pyLogs);
      setPlacementActivities(placeActs);
      setProjects(projs);
      setJobApplications(apps);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  // Timer Toggle Handler
  const handleToggleTimer = () => {
    setTimerActive((prev) => !prev);
  };

  // Open Finish Timer Modal
  const handleFinishTimer = () => {
    setTimerActive(false);
    setIsFinishSessionModalOpen(true);
  };

  // Commit Timer Session
  const handleCommitTimerSession = async (
    category: string,
    minutes: number,
    notes: string,
    taskId?: number
  ) => {
    const now = new Date();
    const startTimeStr = new Date(now.getTime() - minutes * 60000).toTimeString().split(' ')[0];
    const endTimeStr = now.toTimeString().split(' ')[0];

    await api.createSession({
      date: selectedDate,
      category,
      duration_minutes: minutes,
      session_type: 'timer',
      notes,
      task_id: taskId,
      start_time: startTimeStr,
      end_time: endTimeStr,
    });

    setTimerSeconds(0);
    localStorage.removeItem('study_timer_seconds');
    await loadData(selectedDate);
  };

  // Manual Offline Time Save
  const handleSaveManualTime = async (
    category: string,
    minutes: number,
    notes: string,
    taskId?: number
  ) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    await api.createSession({
      date: selectedDate,
      category,
      duration_minutes: minutes,
      session_type: 'manual',
      notes,
      task_id: taskId,
      start_time: timeStr,
      end_time: timeStr,
    });

    await loadData(selectedDate);
  };

  // Daily Closing Report Save
  const handleSaveDailyReport = async (dateStr: string, reflections: string) => {
    await api.closeDailyReport(dateStr, reflections);
    await loadData(selectedDate);
  };

  // Task Handlers
  const handleToggleTask = async (taskId: number) => {
    await api.toggleTask(taskId);
    await loadData(selectedDate);
  };

  const handleUpdateTaskDuration = async (taskId: number, actualMinutes: number, notes?: string) => {
    await api.updateTask(taskId, {
      actual_duration: actualMinutes,
      notes: notes,
    });
    await loadData(selectedDate);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Delete this task?')) return;
    await api.deleteTask(taskId);
    await loadData(selectedDate);
  };

  const handleAddTask = async (newTask: Partial<DailyTask>) => {
    await api.createTask(newTask);
    await loadData(selectedDate);
  };

  const handleRescheduleTask = async (taskId: number) => {
    await api.rescheduleTask(taskId, selectedDate);
    await loadData(selectedDate);
  };

  // DSA Pattern Handlers
  const handleUpdatePattern = async (id: number, data: Partial<DsaPattern>) => {
    await api.updatePattern(id, data);
    await loadData(selectedDate);
  };

  const handleToggleSubtopic = async (subtopicId: number) => {
    await api.toggleSubtopic(subtopicId);
    await loadData(selectedDate);
  };

  const handleAddSubtopic = async (patternId: number, title: string, orderIndex: number) => {
    await api.addSubtopic(patternId, { title, order_index: orderIndex });
    await loadData(selectedDate);
  };

  const handleDeleteSubtopic = async (subtopicId: number) => {
    await api.deleteSubtopic(subtopicId);
    await loadData(selectedDate);
  };

  const handleAddProblem = async (patternId: number, problem: any) => {
    await api.addPatternProblem(patternId, problem);
    await loadData(selectedDate);
  };

  const handleDeleteProblem = async (problemId: number) => {
    await api.deleteProblem(problemId);
    await loadData(selectedDate);
  };

  // SQL Handlers
  const handleAddSqlProblem = async (prob: Partial<SqlProblem>) => {
    await api.createSqlProblem(prob);
    await loadData(selectedDate);
  };

  const handleDeleteSqlProblem = async (id: number) => {
    await api.deleteSqlProblem(id);
    await loadData(selectedDate);
  };

  // Core CS Handlers
  const handleToggleCoreCs = async (id: number) => {
    await api.toggleCoreCsTopic(id);
    await loadData(selectedDate);
  };

  const handleUpdateCoreCs = async (id: number, data: Partial<CoreCsTopic>) => {
    await api.updateCoreCsTopic(id, data);
    await loadData(selectedDate);
  };

  // Python FS Handlers
  const handleUpdatePythonTopic = async (id: number, data: Partial<PythonTopic>) => {
    await api.updatePythonTopic(id, data);
    await loadData(selectedDate);
  };

  const handleAddPythonLog = async (logData: Partial<PythonDailyLog>) => {
    await api.createPythonLog(logData);
    await loadData(selectedDate);
  };

  // Placement Handlers
  const handleAddPlacementActivity = async (act: Partial<PlacementActivity>) => {
    await api.createPlacementActivity(act);
    await loadData(selectedDate);
  };

  const handleDeletePlacementActivity = async (id: number) => {
    await api.deletePlacementActivity(id);
    await loadData(selectedDate);
  };

  const handleAddProject = async (proj: Partial<ProjectRecord>) => {
    await api.createProject(proj);
    await loadData(selectedDate);
  };

  const handleUpdateProject = async (id: number, proj: Partial<ProjectRecord>) => {
    await api.updateProject(id, proj);
    await loadData(selectedDate);
  };

  const handleDeleteProject = async (id: number) => {
    await api.deleteProject(id);
    await loadData(selectedDate);
  };

  const handleAddJobApplication = async (appData: Partial<JobApplication>) => {
    await api.createJobApplication(appData);
    await loadData(selectedDate);
  };

  const handleUpdateJobApplication = async (id: number, appData: Partial<JobApplication>) => {
    await api.updateJobApplication(id, appData);
    await loadData(selectedDate);
  };

  const handleDeleteJobApplication = async (id: number) => {
    await api.deleteJobApplication(id);
    await loadData(selectedDate);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* Header with Dark/Light Toggle, Deadline Countdown, and Focus Timer */}
      <Header
        summary={summary}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        timerActive={timerActive}
        timerSeconds={timerSeconds}
        timerCategory={timerCategory}
        onToggleTimer={handleToggleTimer}
        onFinishTimer={handleFinishTimer}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenCloseDayModal={() => setIsCloseDayModalOpen(true)}
      />

      {/* Main Layout: Sidebar & Content View */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          overdueCount={summary?.overdue_tasks_count || 0}
        />

        <main className="flex-1 p-6 md:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              tasks={tasks}
              onNavigate={setCurrentTab}
              onRescheduleTask={handleRescheduleTask}
            />
          )}

          {currentTab === 'daily_plan' && (
            <DailyTasksView
              tasks={tasks}
              selectedDate={selectedDate}
              onToggleTask={handleToggleTask}
              onUpdateTaskDuration={handleUpdateTaskDuration}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onRescheduleTask={handleRescheduleTask}
            />
          )}

          {currentTab === 'dsa_patterns' && (
            <DsaPatternsView
              patterns={patterns}
              onUpdatePattern={handleUpdatePattern}
              onToggleSubtopic={handleToggleSubtopic}
              onAddSubtopic={handleAddSubtopic}
              onDeleteSubtopic={handleDeleteSubtopic}
              onAddProblem={handleAddProblem}
              onDeleteProblem={handleDeleteProblem}
            />
          )}

          {currentTab === 'sql_practice' && (
            <SqlPracticeView
              problems={sqlProblems}
              summaryData={sqlSummary}
              onAddProblem={handleAddSqlProblem}
              onDeleteProblem={handleDeleteSqlProblem}
            />
          )}

          {currentTab === 'core_cs' && (
            <CoreCsView
              topics={coreCsTopics}
              selectedDate={selectedDate}
              onToggleTopic={handleToggleCoreCs}
              onUpdateTopic={handleUpdateCoreCs}
            />
          )}

          {currentTab === 'python_fs' && (
            <PythonRevisionView
              topics={pythonTopics}
              logs={pythonLogs}
              selectedDate={selectedDate}
              onUpdateTopic={handleUpdatePythonTopic}
              onAddLog={handleAddPythonLog}
            />
          )}

          {currentTab === 'placement' && (
            <PlacementView
              activities={placementActivities}
              projects={projects}
              applications={jobApplications}
              selectedDate={selectedDate}
              onAddActivity={handleAddPlacementActivity}
              onDeleteActivity={handleDeletePlacementActivity}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onAddApplication={handleAddJobApplication}
              onUpdateApplication={handleUpdateJobApplication}
              onDeleteApplication={handleDeleteJobApplication}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView selectedDate={selectedDate} />
          )}
        </main>
      </div>

      {/* Modals */}
      <ManualTimeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        selectedDate={selectedDate}
        tasks={tasks}
        onSave={handleSaveManualTime}
      />

      <FinishSessionModal
        isOpen={isFinishSessionModalOpen}
        onClose={() => setIsFinishSessionModalOpen(false)}
        timerSeconds={timerSeconds}
        timerCategory={timerCategory}
        tasks={tasks}
        onCommit={handleCommitTimerSession}
      />

      <DailyClosingModal
        isOpen={isCloseDayModalOpen}
        onClose={() => setIsCloseDayModalOpen(false)}
        summary={summary}
        onSaveReport={handleSaveDailyReport}
      />
    </div>
  );
}

export default App;
