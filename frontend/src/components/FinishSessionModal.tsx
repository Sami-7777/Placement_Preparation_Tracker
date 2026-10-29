import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { DailyTask } from '../types';

interface FinishSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerSeconds: number;
  timerCategory: string;
  tasks: DailyTask[];
  onCommit: (category: string, minutes: number, notes: string, taskId?: number) => Promise<void>;
}

export const FinishSessionModal: React.FC<FinishSessionModalProps> = ({
  isOpen,
  onClose,
  timerSeconds,
  timerCategory,
  tasks,
  onCommit,
}) => {
  const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState(timerCategory);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter((t) => t.category === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onCommit(category, elapsedMinutes, notes, selectedTaskId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 asymmetric-card shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[var(--color-ember-orange)]" />
            <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
              Log Active Study Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Elapsed Time</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s ({elapsedMinutes} recorded min)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Active Category</span>
            <span className="font-medium text-[var(--text-primary)]">{category}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Associate with Daily Task
            </label>
            <select
              value={selectedTaskId || ''}
              onChange={(e) =>
                setSelectedTaskId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value="">-- General category time (no specific task) --</option>
              {filteredTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.actual_duration}/{t.target_duration}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Session Focus & Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="E.g., completed 40m problem solving on Sliding Window, analyzed O(N) complexity."
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
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
              {saving ? 'Logging...' : 'Confirm & Save Minutes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
