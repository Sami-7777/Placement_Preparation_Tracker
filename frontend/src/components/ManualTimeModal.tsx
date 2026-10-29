import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { DailyTask } from '../types';

interface ManualTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  tasks: DailyTask[];
  onSave: (category: string, minutes: number, notes: string, taskId?: number) => Promise<void>;
}

export const ManualTimeModal: React.FC<ManualTimeModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  tasks,
  onSave,
}) => {
  const [category, setCategory] = useState('DSA Patterns');
  const [minutes, setMinutes] = useState(30);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'DSA Patterns',
    'SQL Revision & Practice',
    'Core CS Fundamentals',
    'Python Full Stack Revision',
    'Placement Preparation',
  ];

  const filteredTasks = tasks.filter((t) => t.category === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) return;
    setSaving(true);
    try {
      await onSave(category, minutes, notes, selectedTaskId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error recording session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 asymmetric-card shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-ember-orange)]" />
            <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
              Log Offline Study Time
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Date
            </label>
            <input
              type="text"
              readOnly
              value={selectedDate}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelectedTaskId(undefined);
              }}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Link to Daily Task (Optional)
            </label>
            <select
              value={selectedTaskId || ''}
              onChange={(e) =>
                setSelectedTaskId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value="">-- General category study (no specific task) --</option>
              {filteredTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.actual_duration}/{t.target_duration}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Actual Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="720"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Notes & Specific Topics Covered
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="E.g., solved 2 medium problems on Two Pointers independently."
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
              {saving ? 'Recording...' : 'Log Time Accurately'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
