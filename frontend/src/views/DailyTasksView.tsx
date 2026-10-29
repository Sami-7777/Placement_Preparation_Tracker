import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  AlertCircle,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { DailyTask } from '../types';

interface DailyTasksViewProps {
  tasks: DailyTask[];
  selectedDate: string;
  onToggleTask: (taskId: number) => Promise<void>;
  onUpdateTaskDuration: (taskId: number, actualMinutes: number, notes?: string) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onAddTask: (newTask: Partial<DailyTask>) => Promise<void>;
  onRescheduleTask: (taskId: number) => Promise<void>;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  tasks,
  selectedDate,
  onToggleTask,
  onUpdateTaskDuration,
  onDeleteTask,
  onAddTask,
  onRescheduleTask,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editDuration, setEditDuration] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('DSA Patterns');
  const [newTargetDuration, setNewTargetDuration] = useState(30);

  const categories = [
    'DSA Patterns',
    'SQL Revision & Practice',
    'Core CS Fundamentals',
    'Python Full Stack Revision',
    'Placement Preparation',
  ];

  const totalTargetMinutes = tasks.reduce((sum, t) => sum + t.target_duration, 0);
  const totalActualMinutes = tasks.reduce((sum, t) => sum + t.actual_duration, 0);
  const completedTasksCount = tasks.filter((t) => t.is_completed).length;

  const startEditing = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setEditDuration(task.actual_duration);
    setEditNotes(task.notes || '');
  };

  const saveEditing = async (taskId: number) => {
    await onUpdateTaskDuration(taskId, editDuration, editNotes);
    setEditingTaskId(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddTask({
      date: selectedDate,
      title: newTitle,
      category: newCategory,
      target_duration: newTargetDuration,
      actual_duration: 0,
      is_completed: false,
      status: 'Not Started',
      notes: '',
    });
    setNewTitle('');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Quotas and Strict Rules */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-ember-orange)] font-medium">
                Daily Execution Engine
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">[{selectedDate}]</span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Daily Six-Hour Study Plan
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Strict Rule: Task completion does NOT artificially invent study minutes. Actual study time is recorded via timer or explicit offline duration.
            </p>
          </div>

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Task</span>
          </button>
        </div>

        {/* Progress summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block">Target Quota</span>
            <span className="font-mono text-base font-medium text-[var(--text-primary)]">
              {totalTargetMinutes} min
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Actual Recorded</span>
            <span className="font-mono text-base font-medium text-[var(--color-ember-orange)]">
              {totalActualMinutes} min
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Tasks Completed</span>
            <span className="font-mono text-base font-medium text-[var(--text-primary)]">
              {completedTasksCount} / {tasks.length}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Daily Quota Status</span>
            <span className="font-mono text-base font-medium">
              {totalActualMinutes >= totalTargetMinutes ? (
                <span className="text-emerald-600 dark:text-emerald-400">Quota Achieved</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  {Math.max(0, totalTargetMinutes - totalActualMinutes)}m remaining
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Add Task Modal / Form */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] asymmetric-card space-y-4 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <span className="font-medium text-[var(--text-primary)]">Add Custom Study Task</span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.g., Practice 3 Hard problems on Binary Search"
                required
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="w-48">
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Target Minutes
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={newTargetDuration}
                onChange={(e) => setNewTargetDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 btn-sharp border border-[var(--border-subtle)] text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categorized Task Backlog */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryTasks = tasks.filter((t) => t.category === cat);
          if (categoryTasks.length === 0) return null;

          const catTarget = categoryTasks.reduce((s, t) => s + t.target_duration, 0);
          const catActual = categoryTasks.reduce((s, t) => s + t.actual_duration, 0);
          const catDone = categoryTasks.filter((t) => t.is_completed).length;

          return (
            <div
              key={cat}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card overflow-hidden"
            >
              {/* Category Header */}
              <div className="px-5 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-heading font-medium text-[var(--text-primary)]">
                    {cat}
                  </h3>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    Target: {catTarget}m • Actual Recorded: {catActual}m
                  </span>
                </div>
                <div className="text-xs font-mono">
                  {catDone === categoryTasks.length ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      All {categoryTasks.length} Completed
                    </span>
                  ) : (
                    <span className="text-[var(--text-secondary)]">
                      {catDone} of {categoryTasks.length} Done
                    </span>
                  )}
                </div>
              </div>

              {/* Category Tasks List */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {categoryTasks.map((task) => {
                  const isEditing = editingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 transition-colors ${
                        task.is_completed ? 'bg-[var(--bg-card)]/60' : 'hover:bg-[var(--bg-surface)]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox & Details */}
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="mt-0.5 text-[var(--color-graphite)] hover:text-[var(--color-ember-orange)] transition-colors"
                            title={task.is_completed ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {task.is_completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-medium ${
                                  task.is_completed
                                    ? 'line-through text-[var(--text-muted)]'
                                    : 'text-[var(--text-primary)]'
                                }`}
                              >
                                {task.title}
                              </span>

                              {task.was_carried_forward && (
                                <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 font-mono">
                                  Carried Forward
                                </span>
                              )}

                              {task.is_overdue && (
                                <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400 font-mono">
                                  Overdue
                                </span>
                              )}

                              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                Target: {task.target_duration}m
                              </span>
                            </div>

                            {/* Recorded Time Indicator */}
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-[var(--color-brass)]" />
                                Recorded time: <strong>{task.actual_duration} min</strong>
                              </span>

                              {task.notes && (
                                <span className="text-[var(--text-muted)] italic truncate max-w-md">
                                  — {task.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEditing(task)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            title="Edit recorded minutes or notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {task.is_overdue && (
                            <button
                              onClick={() => onRescheduleTask(task.id)}
                              className="p-1 text-amber-600 dark:text-amber-400 hover:opacity-80"
                              title="Carry forward to today"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-red-500"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Duration & Notes Editor */}
                      {isEditing && (
                        <div className="mt-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-32">
                              <label className="block text-[10px] text-[var(--text-muted)]">
                                Actual Minutes
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="360"
                                value={editDuration}
                                onChange={(e) => setEditDuration(Number(e.target.value))}
                                className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)]"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] text-[var(--text-muted)]">
                                Reflection / Notes
                              </label>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Notes on performance or difficulties encountered"
                                className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="px-2.5 py-1 btn-sharp border border-[var(--border-subtle)] text-[11px]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditing(task.id)}
                              className="px-2.5 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-[11px] font-medium"
                            >
                              Save Recorded Time
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
