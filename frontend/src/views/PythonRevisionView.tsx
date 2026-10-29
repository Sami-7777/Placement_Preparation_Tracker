import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  Clock,
  Plus,
  HelpCircle,
  FileCode,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PythonTopic, PythonDailyLog } from '../types';

interface PythonRevisionViewProps {
  topics: PythonTopic[];
  logs: PythonDailyLog[];
  selectedDate: string;
  onUpdateTopic: (id: number, data: Partial<PythonTopic>) => Promise<void>;
  onAddLog: (data: Partial<PythonDailyLog>) => Promise<void>;
}

export const PythonRevisionView: React.FC<PythonRevisionViewProps> = ({
  topics,
  logs,
  selectedDate,
  onUpdateTopic,
  onAddLog,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<number>(3); // Default 'Functions and collections'
  const [actualMinutes, setActualMinutes] = useState(45);
  const [codeWritten, setCodeWritten] = useState('');
  const [doubts, setDoubts] = useState('');
  const [notes, setNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    setSavingLog(true);
    try {
      await onAddLog({
        date: selectedDate,
        topic_id: selectedTopic.id,
        topic_name: selectedTopic.name,
        actual_time_minutes: actualMinutes,
        code_written: codeWritten,
        doubts: doubts,
        notes: notes,
        is_completed: true,
      });
      alert('Python Full Stack revision session recorded successfully.');
      setCodeWritten('');
      setDoubts('');
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Error recording log');
    } finally {
      setSavingLog(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Not Started': 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    'Revised': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    'Mastered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                Python Full Stack Revision
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">[Training-Centre Syllabus Alignment]</span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              45-Minute Daily Class Revision
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              15 min revise class topics • 25 min implement code independently • 5 min record errors and doubts. This is a focused revision block, not a separate full-time course.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Syllabus Progression & Activation */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-heading font-medium text-[var(--text-primary)]">
              Full Stack Technologies ({topics.length})
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Activate topics as you progress in classes. HTML & CSS are completed at fundamentals.
            </p>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {topics.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTopicId(t.id)}
                className={`p-3 border cursor-pointer transition-colors text-xs ${
                  selectedTopicId === t.id
                    ? 'bg-[var(--bg-surface)] border-[var(--color-ember-orange)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">{t.name}</span>
                  <span
                    className={`px-1.5 py-0.2 tag-pill text-[10px] font-mono ${
                      statusColors[t.status] || ''
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>{t.is_active ? 'Active in syllabus' : 'Upcoming'}</span>
                  {t.last_revised_date && <span>Revised: {t.last_revised_date}</span>}
                </div>

                {/* Status selector */}
                <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <select
                    value={t.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onUpdateTopic(t.id, {
                        status: e.target.value as any,
                        is_active: e.target.value !== 'Not Started',
                      })
                    }
                    className="text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-primary)]"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Revised">Revised</option>
                    <option value="Mastered">Mastered</option>
                  </select>

                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={t.is_active}
                      onChange={(e) => onUpdateTopic(t.id, { is_active: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Daily Revision Logger */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleLogSubmit}
            className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-heading font-medium text-[var(--text-primary)]">
                  Log Today's 45-Minute Revision: {selectedTopic?.name}
                </h3>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  Date: {selectedDate}
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--color-brass)]">
                Default: 45 min
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  Revision Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  Actual Time Spent (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={actualMinutes}
                  onChange={(e) => setActualMinutes(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Independent Code Implemented (25 min block)
              </label>
              <textarea
                value={codeWritten}
                onChange={(e) => setCodeWritten(e.target.value)}
                rows={4}
                placeholder="Paste or describe the code snippet or exercise implemented independently without copying."
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Errors, Hurdles & Technical Doubts (5 min block)
              </label>
              <textarea
                value={doubts}
                onChange={(e) => setDoubts(e.target.value)}
                rows={2}
                placeholder="What syntax errors or conceptual doubts came up during practice to ask your instructor?"
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="submit"
                disabled={savingLog}
                className="px-4 py-2 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium hover:opacity-90 transition-opacity"
              >
                {savingLog ? 'Recording...' : 'Commit Revision Log'}
              </button>
            </div>
          </form>

          {/* Revision Logs History */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card p-5">
            <h3 className="text-sm font-heading font-medium text-[var(--text-primary)] mb-3">
              Revision Log History ({logs.length})
            </h3>

            {logs.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                No class revisions logged yet. Submit the form above after your daily 45m session.
              </p>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)] text-xs space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--text-primary)]">
                        {log.topic_name}
                      </span>
                      <span className="font-mono text-[var(--color-brass)] text-[11px]">
                        {log.date} • {log.actual_time_minutes} min
                      </span>
                    </div>

                    {log.code_written && (
                      <pre className="mt-2 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[11px] overflow-x-auto text-[var(--text-primary)]">
                        {log.code_written}
                      </pre>
                    )}

                    {log.doubts && (
                      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                        <strong>Doubt:</strong> {log.doubts}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
