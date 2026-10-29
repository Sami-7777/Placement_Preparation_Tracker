import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Database,
  Cpu,
  Code2,
  Briefcase,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DashboardSummary, DailyTask } from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  tasks: DailyTask[];
  onNavigate: (tab: NavTab) => void;
  onRescheduleTask: (taskId: number) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  tasks,
  onNavigate,
  onRescheduleTask,
}) => {
  if (!summary) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)] font-mono">
        Loading placement observatory data...
      </div>
    );
  }

  // Chart data: 5 study categories actual vs target
  const categoryChartData = Object.entries(summary.category_progress).map(([name, data]) => ({
    name: name.replace(' Revision & Practice', '').replace(' Fundamentals', '').replace(' Revision', ''),
    target: data.target_minutes,
    actual: data.actual_minutes,
  }));

  const chartColors = {
    target: 'var(--color-mist)',
    actual: 'var(--color-ember-orange)',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Date, Deadline Countdown & Strict Rule Notice */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
              Daily Mission Control
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">[{summary.date}]</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-normal text-[var(--text-primary)] mt-1">
            {summary.days_remaining} Days to Placement Deadline
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
            Target: <strong className="text-[var(--text-primary)] font-semibold">30 March 2027</strong>. 
            Strict accountability mode: Daily target is 360 minutes (6 hours). Task checkboxes do not inflate study time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('daily_plan')}
            className="flex items-center gap-2 px-4 py-2.5 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <span>Open Daily 6h Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 10 Required Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* 1. Today's Overall Progress */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Overall Tasks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-brass)]" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.tasks_completed}/{summary.tasks_total}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {summary.task_completion_pct}% completed
          </div>
        </div>

        {/* 2. Actual Focused Minutes vs Target */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Focused Time</span>
            <Clock className="w-3.5 h-3.5 text-[var(--color-ember-orange)]" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.actual_focused_minutes} <span className="text-xs font-normal text-[var(--text-muted)]">/ 360m</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {summary.remaining_minutes > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">{summary.remaining_minutes}m to quota</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Quota met (+{summary.extra_study_minutes}m)</span>
            )}
          </div>
        </div>

        {/* 3. DSA In Progress */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>DSA Active</span>
            <Layers className="w-3.5 h-3.5 text-[var(--color-ember-orange)]" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.dsa_patterns_in_progress}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {summary.dsa_patterns_not_started} not started
          </div>
        </div>

        {/* 4. DSA Mastered */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>DSA Mastered</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.dsa_patterns_mastered} <span className="text-xs font-normal text-[var(--text-muted)]">/ 16</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {summary.dsa_patterns_revision_req} revision due
          </div>
        </div>

        {/* 5. SQL Solved Today */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>SQL Today</span>
            <Database className="w-3.5 h-3.5 text-[var(--color-brass)]" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.sql_solved_today}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            Accuracy: {summary.sql_accuracy_pct}%
          </div>
        </div>

        {/* 6. Core CS Revision Status */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Core CS Rotation</span>
            <Cpu className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-sm font-medium text-[var(--text-primary)] truncate mt-1">
            {summary.core_cs_today_subject}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            60m rotation block
          </div>
        </div>

        {/* 7. Python Full Stack Status */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Python FS</span>
            <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-sm font-medium text-[var(--text-primary)] truncate mt-1">
            {summary.python_status_summary}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            45m revision target
          </div>
        </div>

        {/* 8. Placement Preparation Status */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Placement Prep</span>
            <Briefcase className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.placement_activities_count}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            Logged activities today
          </div>
        </div>

        {/* 9. Overdue Tasks */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Overdue Tasks</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-heading font-normal text-red-600 dark:text-red-400">
            {summary.overdue_tasks_count}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {summary.missed_tasks_count} missed past days
          </div>
        </div>

        {/* 10. Study Streak */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Consistency Streak</span>
            <Flame className="w-3.5 h-3.5 text-[var(--color-ember-orange)] fill-current" />
          </div>
          <div className="text-2xl font-heading font-normal text-[var(--text-primary)]">
            {summary.current_streak} <span className="text-xs font-normal text-[var(--text-muted)]">days</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            Record: {summary.longest_streak} days
          </div>
        </div>
      </div>

      {/* Main Analytics: Study Time Bar Chart & Category Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Study Target vs Actual Minutes Chart */}
        <div className="lg:col-span-2 p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
                Today's Category Study Minutes
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Target allocation (360m) vs actual recorded time
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--color-mist)] inline-block"></span>
                <span className="text-[var(--text-secondary)]">Target</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--color-ember-orange)] inline-block"></span>
                <span className="text-[var(--text-secondary)]">Actual Focused</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis unit="m" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(val: any) => [`${val} min`]}
                />
                <Bar dataKey="target" name="Target (min)" fill={chartColors.target} radius={[2, 2, 0, 0]} />
                <Bar dataKey="actual" name="Actual (min)" fill={chartColors.actual} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Priority Overdue & Missed Tasks (Strict Accountability) */}
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
                  Top Overdue Priorities
                </h3>
              </div>
              <span className="text-xs font-mono text-red-500">
                {summary.overdue_tasks_count} pending
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Unfinished tasks are preserved and never silently deleted. Reschedule to carry forward.
            </p>

            <div className="mt-4 space-y-2.5">
              {summary.top_overdue_tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  No overdue or missed tasks. You are on track!
                </div>
              ) : (
                summary.top_overdue_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-[var(--bg-surface)] border border-red-200 dark:border-red-950/50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-red-600 dark:text-red-400 uppercase">
                        Due {task.date} • {task.category}
                      </div>
                      <div className="text-xs font-medium text-[var(--text-primary)] mt-0.5 line-clamp-1">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Target: {task.target_duration}m • Recorded: {task.actual_duration}m
                      </div>
                    </div>
                    <button
                      onClick={() => onRescheduleTask(task.id)}
                      className="px-2 py-1 text-[11px] btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 shrink-0"
                      title="Reschedule to today"
                    >
                      Carry Forward
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('daily_plan')}
            className="w-full mt-4 py-2 text-xs text-center btn-sharp border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            View Complete Task Backlog →
          </button>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <h3 className="text-base font-heading font-medium text-[var(--text-primary)] mb-3">
          Daily Category Breakdown (6-Hour Plan)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                <th className="pb-2 font-normal">Category</th>
                <th className="pb-2 font-normal">Target</th>
                <th className="pb-2 font-normal">Actual Focused</th>
                <th className="pb-2 font-normal">Deficit / Surplus</th>
                <th className="pb-2 font-normal">Tasks Done</th>
                <th className="pb-2 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {Object.entries(summary.category_progress).map(([name, cat]) => {
                const diff = cat.actual_minutes - cat.target_minutes;
                return (
                  <tr key={name} className="hover:bg-[var(--bg-surface)]">
                    <td className="py-2.5 font-medium text-[var(--text-primary)]">{name}</td>
                    <td className="py-2.5 font-mono">{cat.target_minutes}m</td>
                    <td className="py-2.5 font-mono font-medium">{cat.actual_minutes}m</td>
                    <td className="py-2.5 font-mono">
                      {diff >= 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">+{diff}m</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">{diff}m</span>
                      )}
                    </td>
                    <td className="py-2.5 font-mono">
                      {cat.tasks_completed} / {cat.tasks_total}
                    </td>
                    <td className="py-2.5 text-right">
                      {cat.is_complete ? (
                        <span className="px-2 py-0.5 text-[10px] tag-pill bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] tag-pill bg-[var(--bg-surface)] text-[var(--text-muted)]">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
