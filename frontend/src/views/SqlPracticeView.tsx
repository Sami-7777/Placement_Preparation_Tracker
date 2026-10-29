import React, { useState } from 'react';
import {
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Code2,
  ExternalLink,
  HelpCircle,
  X
} from 'lucide-react';
import { SqlProblem } from '../types';

interface SqlPracticeViewProps {
  problems: SqlProblem[];
  summaryData: any;
  onAddProblem: (problem: Partial<SqlProblem>) => Promise<void>;
  onDeleteProblem: (id: number) => Promise<void>;
}

export const SqlPracticeView: React.FC<SqlPracticeViewProps> = ({
  problems,
  summaryData,
  onAddProblem,
  onDeleteProblem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Window functions');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [sourceUrl, setSourceUrl] = useState('');
  const [queryAttempt, setQueryAttempt] = useState('');
  const [resultExpected, setResultExpected] = useState('');
  const [attempts, setAttempts] = useState(1);
  const [mistakes, setMistakes] = useState('');
  const [timeTaken, setTimeTaken] = useState(20);
  const [status, setStatus] = useState<'Solved Correct' | 'Hint Required' | 'Incorrect' | 'Attempted'>('Solved Correct');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sqlTopics = [
    'SELECT, WHERE and ORDER BY',
    'Aggregate functions',
    'GROUP BY and HAVING',
    'INNER JOIN and LEFT JOIN',
    'Subqueries',
    'Correlated subqueries',
    'CTEs',
    'Window functions',
    'CASE expressions',
    'NULL handling',
    'Date and string functions',
    'Keys and constraints',
    'Normalization',
    'Indexes',
    'Transactions and ACID',
    'Query optimization fundamentals',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddProblem({
      title: title.trim(),
      sql_topic: topic,
      difficulty,
      source_url: sourceUrl.trim() || undefined,
      query_attempt: queryAttempt.trim(),
      result_expected: resultExpected.trim(),
      number_of_attempts: attempts,
      mistakes: mistakes.trim(),
      time_taken_minutes: timeTaken,
      status,
      date_logged: new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setQueryAttempt('');
    setMistakes('');
    setSourceUrl('');
    setIsAdding(false);
  };

  const statusTags: Record<string, string> = {
    'Solved Correct': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400',
    'Hint Required': 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400',
    'Incorrect': 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
    'Attempted': 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                SQL Revision & Practice
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">[Fundamentals Completed]</span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Daily SQL Practice & Query Ledger
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Daily target: 15 minutes revision + 45 minutes problem solving (2–4 problems). Queries are verified by test execution on LeetCode/HackerRank or local verification.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log SQL Problem</span>
          </button>
        </div>

        {/* SQL Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-4 border-t border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block">Total Attempted</span>
            <span className="font-mono text-base font-medium text-[var(--text-primary)]">
              {summaryData?.total_attempted || 0}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Solved Correct</span>
            <span className="font-mono text-base font-medium text-emerald-600 dark:text-emerald-400">
              {summaryData?.correct || 0}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Hint Required</span>
            <span className="font-mono text-base font-medium text-amber-600 dark:text-amber-400">
              {summaryData?.with_hint || 0}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Incorrect Attempts</span>
            <span className="font-mono text-base font-medium text-red-600 dark:text-red-400">
              {summaryData?.incorrect || 0}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block">Accuracy Rate</span>
            <span className="font-mono text-base font-medium text-[var(--color-ember-orange)]">
              {summaryData?.accuracy_pct || 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Weak Topics Callout */}
      {summaryData?.weak_topics && summaryData.weak_topics.length > 0 && (
        <div className="p-4 bg-[var(--bg-surface)] border border-amber-300 dark:border-amber-900/50 asymmetric-card flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-medium text-[var(--text-primary)]">
              Identified Weak SQL Topics (Priority for Revision):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {summaryData.weak_topics.map((t: string) => (
                <span
                  key={t}
                  className="px-2 py-0.5 tag-pill text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Problem Modal */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-4 text-xs shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-heading font-medium text-[var(--text-primary)]">
              Log SQL Problem & Attempt
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Problem Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Department Top Three Salaries"
                required
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                SQL Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                {sqlTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Difficulty
              </label>
              <div className="flex gap-1.5">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1.5 px-2 text-xs font-mono border transition-all ${
                      difficulty === diff
                        ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)] font-medium'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Result Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
              >
                <option value="Solved Correct">✓ Solved Correct</option>
                <option value="Hint Required">⚡ Hint Required</option>
                <option value="Attempted">⏳ Attempted</option>
                <option value="Incorrect">✗ Incorrect</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                Time Taken (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={timeTaken}
                onChange={(e) => setTimeTaken(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[var(--text-primary)] text-xs"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-[var(--color-ember-orange)] font-medium hover:underline flex items-center gap-1.5 py-1"
            >
              <span>{showAdvanced ? '▼ Hide detailed query & notes' : '▶ Add SQL query, link or mistake notes (optional)'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]/60">
              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  Source URL (LeetCode / HackerRank)
                </label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  SQL Query Attempt
                </label>
                <textarea
                  value={queryAttempt}
                  onChange={(e) => setQueryAttempt(e.target.value)}
                  rows={3}
                  placeholder="SELECT name, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) FROM ..."
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  Mistakes / Logic Notes
                </label>
                <input
                  type="text"
                  value={mistakes}
                  onChange={(e) => setMistakes(e.target.value)}
                  placeholder="E.g., Forgot GROUP BY, handling NULL values."
                  className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 btn-sharp border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
            >
              Save Problem Record
            </button>
          </div>
        </form>
      )}

      {/* SQL Problem History Ledger */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card overflow-hidden">
        <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span className="font-heading font-medium text-xs text-[var(--text-primary)]">
            Practice Records ({problems.length})
          </span>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            Chronological Order
          </span>
        </div>

        {problems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">
            No SQL problems logged yet. Click "Log SQL Problem" after your practice session.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] text-xs">
            {problems.map((prob) => (
              <div key={prob.id} className="p-4 hover:bg-[var(--bg-surface)]/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[var(--text-primary)]">{prob.title}</span>
                      <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono">
                        {prob.difficulty}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 tag-pill text-[10px] font-mono ${
                          statusTags[prob.status] || ''
                        }`}
                      >
                        {prob.status}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-brass)]">
                        Topic: {prob.sql_topic}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)]">
                      Logged on {prob.date_logged} • {prob.time_taken_minutes} minutes • {prob.number_of_attempts} attempts
                    </div>

                    {prob.mistakes && (
                      <div className="text-[11px] text-red-600 dark:text-red-400">
                        Mistake Analysis: {prob.mistakes}
                      </div>
                    )}

                    {prob.query_attempt && (
                      <pre className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-primary)] overflow-x-auto mt-2">
                        {prob.query_attempt}
                      </pre>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {prob.source_url && (
                      <a
                        href={prob.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        title="Open problem link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onDeleteProblem(prob.id)}
                      className="text-[var(--text-muted)] hover:text-red-500"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
