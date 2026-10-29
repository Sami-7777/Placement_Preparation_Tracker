import React, { useState } from 'react';
import {
  Cpu,
  Calendar,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  Star,
  BookOpen,
  HelpCircle,
  Edit2
} from 'lucide-react';
import { CoreCsTopic } from '../types';

interface CoreCsViewProps {
  topics: CoreCsTopic[];
  selectedDate: string;
  onToggleTopic: (id: number) => Promise<void>;
  onUpdateTopic: (id: number, data: Partial<CoreCsTopic>) => Promise<void>;
}

export const CoreCsView: React.FC<CoreCsViewProps> = ({
  topics,
  selectedDate,
  onToggleTopic,
  onUpdateTopic,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'DBMS' | 'OOP' | 'OS' | 'Networks'>('All');
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editQuestions, setEditQuestions] = useState('');

  // Weekly schedule calculation
  const dateObj = new Date(selectedDate);
  const dayIndex = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
  const scheduleRotation: Record<number, string> = {
    1: 'DBMS (Database Management)',
    2: 'DBMS (Database Management)',
    3: 'OOP (Object-Oriented Programming)',
    4: 'Operating Systems (Processes, Threads & Memory)',
    5: 'Operating Systems (CPU Scheduling & Deadlocks)',
    6: 'Computer Networks (OSI, TCP/IP, Protocols)',
    0: 'Mixed Revision & Self-Test',
  };
  const todayRotation = scheduleRotation[dayIndex] || 'Core CS Revision';

  const subjects = ['All', 'DBMS', 'OOP', 'OS', 'Networks'];

  const filteredTopics = selectedSubject === 'All'
    ? topics
    : topics.filter((t) => t.subject === selectedSubject);

  const startEditing = (topic: CoreCsTopic) => {
    setEditingTopicId(topic.id);
    setEditNotes(topic.notes || '');
    setEditQuestions(topic.interview_questions || '');
  };

  const saveEditing = async (topicId: number) => {
    await onUpdateTopic(topicId, {
      notes: editNotes,
      interview_questions: editQuestions,
    });
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
    alert(`Spaced revision scheduled for ${dateStr} (+${days} days).`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Today's Weekly Rotation */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                Core CS Engineering
              </span>
              <span className="text-xs font-mono text-[var(--color-ember-orange)]">
                [Weekly Rotation System]
              </span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Today's Scheduled Subject: {todayRotation}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Strict 60-minute daily block rotating through DBMS, OOP, OS, and Computer Networks. Spaced repetition prompts revision after 1, 3, and 7 days. Topics are never marked mastered solely from reading once.
            </p>
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub as any)}
                className={`text-xs px-3 py-1.5 btn-sharp transition-colors ${
                  selectedSubject === sub
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Rotation Legend */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-7 gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 1 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Mon: DBMS
          </div>
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 2 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Tue: DBMS
          </div>
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 3 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Wed: OOP
          </div>
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 4 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Thu: OS
          </div>
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 5 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Fri: OS
          </div>
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 6 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Sat: Networks
          </div>
          <div className={`p-1.5 border border-[var(--border-subtle)] ${dayIndex === 0 ? 'bg-[var(--bg-surface)] font-bold text-[var(--color-ember-orange)]' : ''}`}>
            Sun: Mixed Self-Test
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const isEditing = editingTopicId === topic.id;

          return (
            <div
              key={topic.id}
              className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => onToggleTopic(topic.id)}
                    className="mt-0.5 text-[var(--color-graphite)] hover:text-[var(--color-ember-orange)]"
                    title={topic.is_completed ? 'Mark unrevised' : 'Mark revised today'}
                  >
                    {topic.is_completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>

                  <div>
                    <span className="text-[10px] font-mono text-[var(--color-brass)] uppercase">
                      {topic.subject}
                    </span>
                    <h3 className="text-sm font-heading font-medium text-[var(--text-primary)]">
                      {topic.topic_name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={topic.status}
                    onChange={(e) => onUpdateTopic(topic.id, { status: e.target.value as any })}
                    className="px-2 py-0.5 text-[11px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Revised">Revised</option>
                    <option value="Mastered">Mastered</option>
                  </select>

                  <button
                    onClick={() => startEditing(topic)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    title="Edit topic notes & questions"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notes */}
              <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)]">
                {topic.notes}
              </p>

              {topic.interview_questions && (
                <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px]">
                  <span className="font-medium text-[var(--color-brass)] block mb-0.5">
                    Interview Focus:
                  </span>
                  <p className="text-[var(--text-primary)]">{topic.interview_questions}</p>
                </div>
              )}

              {/* Confidence Rating & Spaced Repetition Triggers */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[var(--text-muted)] mr-1">Confidence:</span>
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

                {/* Spaced Repetition Buttons */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="text-[var(--text-muted)] mr-1">Recall in:</span>
                  <button
                    onClick={() => scheduleNextRevision(topic.id, 1)}
                    className="px-1.5 py-0.5 btn-sharp border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                    title="Remind in 1 day"
                  >
                    +1d
                  </button>
                  <button
                    onClick={() => scheduleNextRevision(topic.id, 3)}
                    className="px-1.5 py-0.5 btn-sharp border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                    title="Remind in 3 days"
                  >
                    +3d
                  </button>
                  <button
                    onClick={() => scheduleNextRevision(topic.id, 7)}
                    className="px-1.5 py-0.5 btn-sharp border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                    title="Remind in 7 days"
                  >
                    +7d
                  </button>
                </div>
              </div>

              {topic.next_revision_date && (
                <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                  <span>Last revised: {topic.last_revised_date || 'Never'}</span>
                  <span className="text-[var(--color-ember-orange)]">
                    Next Due: {topic.next_revision_date}
                  </span>
                </div>
              )}

              {/* Inline Editor */}
              {isEditing && (
                <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                  <div>
                    <label className="block text-[10px] text-[var(--text-muted)]">
                      Topic Summary & Personal Notes
                    </label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-muted)]">
                      Frequent Technical Interview Questions
                    </label>
                    <input
                      type="text"
                      value={editQuestions}
                      onChange={(e) => setEditQuestions(e.target.value)}
                      placeholder="E.g., What is the difference between clustered and non-clustered indexes?"
                      className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingTopicId(null)}
                      className="px-2 py-1 btn-sharp border border-[var(--border-subtle)] text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEditing(topic.id)}
                      className="px-2 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-[11px]"
                    >
                      Save Topic
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
};
