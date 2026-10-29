import React, { useState } from 'react';
import {
  Cpu,
  CheckSquare,
  Square,
  Star,
  Edit2,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { CoreCsTopic } from '../types';

interface CoreCsViewProps {
  topics: CoreCsTopic[];
  selectedDate: string;
  onToggleTopic: (id: number) => Promise<void>;
  onUpdateTopic: (id: number, data: Partial<CoreCsTopic>) => Promise<void>;
}

const SUBJECTS = [
  {
    key: 'DBMS',
    label: 'Database Management Systems (DBMS)',
    emoji: '🗄️',
    color: 'text-blue-600 dark:text-blue-400',
    accent: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    schedule: 'Mon & Tue',
  },
  {
    key: 'OOP',
    label: 'Object-Oriented Programming (OOP)',
    emoji: '🧩',
    color: 'text-violet-600 dark:text-violet-400',
    accent: 'border-violet-300 dark:border-violet-700',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    schedule: 'Wed',
  },
  {
    key: 'OS',
    label: 'Operating Systems (OS)',
    emoji: '⚙️',
    color: 'text-amber-600 dark:text-amber-400',
    accent: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    schedule: 'Thu & Fri',
  },
  {
    key: 'Networks',
    label: 'Computer Networks',
    emoji: '🌐',
    color: 'text-emerald-600 dark:text-emerald-400',
    accent: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    schedule: 'Sat',
  },
];

export const CoreCsView: React.FC<CoreCsViewProps> = ({
  topics,
  selectedDate,
  onToggleTopic,
  onUpdateTopic,
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(SUBJECTS.map((s) => s.key))
  );
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editQuestions, setEditQuestions] = useState('');
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  const dateObj = new Date(selectedDate);
  const dayIndex = dateObj.getDay();
  const scheduleRotation: Record<number, string> = {
    1: 'DBMS', 2: 'DBMS', 3: 'OOP', 4: 'OS', 5: 'OS', 6: 'Networks', 0: 'Mixed',
  };
  const todaySubject = scheduleRotation[dayIndex] || 'Mixed';

  const toggleSubject = (key: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleToggle = async (topicId: number) => {
    if (toggling.has(topicId)) return;
    setToggling((prev) => new Set(prev).add(topicId));
    try {
      await onToggleTopic(topicId);
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  };

  const startEditing = (topic: CoreCsTopic) => {
    setEditingTopicId(topic.id);
    setEditNotes(topic.notes || '');
    setEditQuestions(topic.interview_questions || '');
  };

  const saveEditing = async (topicId: number) => {
    await onUpdateTopic(topicId, { notes: editNotes, interview_questions: editQuestions });
    setEditingTopicId(null);
  };

  const scheduleNextRevision = async (topicId: number, days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    const dateStr = nextDate.toISOString().split('T')[0];
    await onUpdateTopic(topicId, {
      next_revision_date: dateStr,
      last_revised_date: new Date().toISOString().split('T')[0],
      status: 'Revised',
    });
  };

  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.is_completed).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--color-brass)]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                Core CS Fundamentals
              </span>
              <span className="text-xs font-mono text-[var(--color-ember-orange)]">
                [{todaySubject === 'Mixed' ? 'Mixed Revision Day' : `Today: ${todaySubject}`}]
              </span>
            </div>
            <h2 className="text-xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Weekly Rotation — 4 Subjects, Separate Tracks
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              60 min/day rotating through DBMS, OOP, OS, and Networks. Each subject is isolated below.
              Spaced repetition buttons schedule the next revision at +1, +3, or +7 days.
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-xl font-mono font-medium text-[var(--text-primary)]">{completedTopics}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Revised Today</div>
            </div>
            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-xl font-mono font-medium text-[var(--text-primary)]">{totalTopics - completedTopics}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Remaining</div>
            </div>
          </div>
        </div>

        {/* Weekly schedule pill row */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono">
          {[
            { day: 'Mon', sub: 'DBMS', idx: 1 },
            { day: 'Tue', sub: 'DBMS', idx: 2 },
            { day: 'Wed', sub: 'OOP', idx: 3 },
            { day: 'Thu', sub: 'OS', idx: 4 },
            { day: 'Fri', sub: 'OS', idx: 5 },
            { day: 'Sat', sub: 'Networks', idx: 6 },
            { day: 'Sun', sub: 'Mixed', idx: 0 },
          ].map(({ day, sub, idx }) => (
            <span
              key={day}
              className={`px-2.5 py-1 border rounded-full transition-all ${
                dayIndex === idx
                  ? 'bg-[var(--color-ember-orange)] text-white border-[var(--color-ember-orange)] font-bold'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {day}: {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Subject Sections */}
      {SUBJECTS.map((subject) => {
        const subjectTopics = topics.filter((t) => t.subject === subject.key);
        const subDone = subjectTopics.filter((t) => t.is_completed).length;
        const isExpanded = expandedSubjects.has(subject.key);
        const isToday = todaySubject === subject.key;

        return (
          <div
            key={subject.key}
            className={`bg-[var(--bg-card)] border asymmetric-card overflow-hidden ${
              isToday ? `${subject.accent} ring-1 ring-[var(--color-ember-orange)]/20` : 'border-[var(--border-subtle)]'
            }`}
          >
            {/* Section Header — clickable to expand/collapse */}
            <button
              onClick={() => toggleSubject(subject.key)}
              className={`w-full flex items-center justify-between px-5 py-4 ${subject.bg} border-b border-[var(--border-subtle)] hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{subject.emoji}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-heading font-semibold text-sm ${subject.color}`}>
                      {subject.label}
                    </span>
                    {isToday && (
                      <span className="text-[10px] px-2 py-0.5 bg-[var(--color-ember-orange)] text-white font-mono uppercase tracking-wider rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    Schedule: {subject.schedule} • {subDone}/{subjectTopics.length} revised
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="hidden sm:block w-24 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-ember-orange)] transition-all duration-500"
                    style={{ width: `${subjectTopics.length > 0 ? (subDone / subjectTopics.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {subjectTopics.length > 0 ? Math.round((subDone / subjectTopics.length) * 100) : 0}%
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </div>
            </button>

            {/* Topics Grid inside this subject */}
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
                {subjectTopics.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-sm text-[var(--text-muted)]">
                    No topics seeded for {subject.key} yet.
                  </div>
                ) : (
                  subjectTopics.map((topic, idx) => {
                    const isEditing = editingTopicId === topic.id;
                    const isToggling = toggling.has(topic.id);

                    return (
                      <div
                        key={topic.id}
                        className={`p-4 text-sm space-y-2.5 ${
                          idx % 2 === 0 ? 'border-b border-[var(--border-subtle)]' : 'border-b border-[var(--border-subtle)]'
                        } ${topic.is_completed ? 'bg-[var(--bg-surface)]/40' : ''}`}
                      >
                        {/* Topic header row */}
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleToggle(topic.id)}
                            disabled={isToggling}
                            className={`mt-0.5 shrink-0 transition-all ${isToggling ? 'opacity-50' : 'hover:scale-110'}`}
                            title={topic.is_completed ? 'Mark unrevised' : 'Mark as revised today'}
                          >
                            {topic.is_completed ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-5 h-5 text-[var(--text-muted)]" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h3 className={`font-medium text-sm leading-snug ${
                                topic.is_completed
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)]'
                              }`}>
                                {topic.topic_name}
                              </h3>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <select
                                  value={topic.status}
                                  onChange={(e) => onUpdateTopic(topic.id, { status: e.target.value as any })}
                                  className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Revised">Revised</option>
                                  <option value="Mastered">Mastered</option>
                                </select>
                                <button
                                  onClick={() => startEditing(topic)}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                  title="Edit notes"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Notes */}
                            {topic.notes && !isEditing && (
                              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                                {topic.notes}
                              </p>
                            )}

                            {/* Interview questions */}
                            {topic.interview_questions && !isEditing && (
                              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
                                <BookOpen className="w-3 h-3 mt-0.5 shrink-0 text-[var(--color-brass)]" />
                                <span>{topic.interview_questions}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Confidence + Spaced Repetition */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--border-subtle)]/60">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[var(--text-muted)] mr-0.5">Confidence:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => onUpdateTopic(topic.id, { confidence_rating: star })}
                              >
                                <Star
                                  className={`w-3 h-3 ${
                                    star <= topic.confidence_rating
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-[var(--border-subtle)]'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            <span className="text-[var(--text-muted)]">Recall in:</span>
                            {[1, 3, 7].map((d) => (
                              <button
                                key={d}
                                onClick={() => scheduleNextRevision(topic.id, d)}
                                className="px-1.5 py-0.5 border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:border-[var(--color-ember-orange)] transition-colors"
                                title={`Schedule review in ${d} day${d > 1 ? 's' : ''}`}
                              >
                                +{d}d
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Revision dates */}
                        {topic.next_revision_date && (
                          <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                            <span>Last: {topic.last_revised_date || 'Never'}</span>
                            <span className="text-[var(--color-ember-orange)]">
                              Next due: {topic.next_revision_date}
                            </span>
                          </div>
                        )}

                        {/* Inline editor */}
                        {isEditing && (
                          <div className="mt-2 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 text-xs">
                            <div>
                              <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                                Personal Notes / Summary
                              </label>
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={2}
                                className="w-full px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                                Interview Questions to Practice
                              </label>
                              <input
                                type="text"
                                value={editQuestions}
                                onChange={(e) => setEditQuestions(e.target.value)}
                                placeholder="E.g., Difference between clustered and non-clustered index?"
                                className="w-full px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingTopicId(null)}
                                className="px-2.5 py-1 border border-[var(--border-subtle)] text-[11px] hover:bg-[var(--bg-card)]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditing(topic.id)}
                                className="px-2.5 py-1 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-[11px]"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
