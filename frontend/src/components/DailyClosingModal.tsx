import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { DashboardSummary } from '../types';

interface DailyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DashboardSummary | null;
  onSaveReport: (date: string, reflections: string) => Promise<void>;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  isOpen,
  onClose,
  summary,
  onSaveReport,
}) => {
  const [reflections, setReflections] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !summary) return null;

  const isTargetMet = summary.actual_focused_minutes >= summary.daily_target_minutes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveReport(summary.date, reflections);
      alert('Daily accountability report closed and permanently saved.');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving daily report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 asymmetric-card shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-brass)]" />
            <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
              Daily Closing Accountability Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Date</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">{summary.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Daily Quota Met</span>
            <span className="flex items-center gap-1 font-medium">
              {isTargetMet ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Yes (360 min achieved)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Deficit ({summary.remaining_minutes} min short)
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Actual Focused Study</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {summary.actual_focused_minutes} / {summary.daily_target_minutes} minutes
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Tasks Completed</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {summary.tasks_completed} of {summary.tasks_total} ({summary.task_completion_pct}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">SQL Questions Solved Today</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {summary.sql_solved_today}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              End-of-Day Reflections, Hurdles & Tomorrow's Priority
            </label>
            <textarea
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              rows={4}
              required
              placeholder="What went well today? What caused hesitation or mistakes? Which pattern or topic needs revision tomorrow?"
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs btn-sharp border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 transition-opacity"
            >
              {saving ? 'Closing Day...' : 'Commit Daily Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
