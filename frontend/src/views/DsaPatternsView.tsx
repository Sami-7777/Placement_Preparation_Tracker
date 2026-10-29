import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  CheckSquare,
  Square,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react';
import { DsaPattern, DsaProblem } from '../types';

interface DsaPatternsViewProps {
  patterns: DsaPattern[];
  onUpdatePattern: (id: number, data: Partial<DsaPattern>) => Promise<void>;
  onToggleSubtopic: (subtopicId: number) => Promise<void>;
  onAddSubtopic: (patternId: number, title: string, orderIndex: number) => Promise<void>;
  onDeleteSubtopic: (subtopicId: number) => Promise<void>;
  onAddProblem: (patternId: number, problem: Partial<DsaProblem>) => Promise<void>;
  onDeleteProblem: (problemId: number) => Promise<void>;
}

export const DsaPatternsView: React.FC<DsaPatternsViewProps> = ({
  patterns,
  onUpdatePattern,
  onToggleSubtopic,
  onAddSubtopic,
  onDeleteSubtopic,
  onAddProblem,
  onDeleteProblem,
}) => {
  const [selectedStage, setSelectedStage] = useState<number | 'all'>('all');
  const [expandedPatternId, setExpandedPatternId] = useState<number | null>(1); // Default first pattern open

  // Subtopic adding state
  const [addingSubtopicPatternId, setAddingSubtopicPatternId] = useState<number | null>(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');

  // Problem adding state
  const [addingProblemPatternId, setAddingProblemPatternId] = useState<number | null>(null);
  const [probTitle, setProbTitle] = useState('');
  const [probDifficulty, setProbDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [probStatus, setProbStatus] = useState<'Solved Correct' | 'Hint Required' | 'Incorrect' | 'Attempted'>('Solved Correct');
  const [probUrl, setProbUrl] = useState('');
  const [probTime, setProbTime] = useState(30);
  const [probIndep, setProbIndep] = useState(true);
  const [probNotes, setProbNotes] = useState('');

  const filteredPatterns = selectedStage === 'all'
    ? patterns
    : patterns.filter((p) => p.stage === selectedStage);

  const statusColors: Record<string, string> = {
    'Not Started': 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
    'Learning': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    'Practicing': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    'Revision Required': 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
    'Mastered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  };

  const stages = [
    { id: 'all', label: 'All 16 Patterns' },
    { id: 1, label: 'Stage 1 — Arrays & Strings' },
    { id: 2, label: 'Stage 2 — Searching & Data Structures' },
    { id: 3, label: 'Stage 3 — Recursion & Advanced DP' },
  ];

  const handleAddSubtopicSubmit = async (patternId: number, currentCount: number) => {
    if (!newSubtopicTitle.trim()) return;
    await onAddSubtopic(patternId, newSubtopicTitle.trim(), currentCount + 1);
    setNewSubtopicTitle('');
    setAddingSubtopicPatternId(null);
  };

  const handleAddProblemSubmit = async (patternId: number) => {
    if (!probTitle.trim()) return;
    await onAddProblem(patternId, {
      title: probTitle.trim(),
      difficulty: probDifficulty,
      status: probStatus,
      source_url: probUrl.trim() || undefined,
      time_spent_minutes: probTime,
      solved_independently: probIndep,
      notes: probNotes.trim(),
      date_solved: new Date().toISOString().split('T')[0],
    });
    setProbTitle('');
    setProbUrl('');
    setProbNotes('');
    setAddingProblemPatternId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-ember-orange)] font-medium">
                DSA Architecture
              </span>
              <span className="text-xs font-mono text-[var(--color-brass)]">[16 Core Patterns]</span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Pattern-Based Mastery Roadmap
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Based on the 16 core patterns. Old fundamental basic programming sections (loops, array traversal) have been completely removed. Patterns require 5 verified criteria to achieve Mastered status.
            </p>
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {stages.map((st) => (
              <button
                key={st.id.toString()}
                onClick={() => setSelectedStage(st.id as any)}
                className={`text-xs px-3 py-1.5 btn-sharp transition-colors ${
                  selectedStage === st.id
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 16 Pattern Cards Accordion / List */}
      <div className="space-y-4">
        {filteredPatterns.map((pattern) => {
          const isExpanded = expandedPatternId === pattern.id;
          const completedSubtopics = pattern.subtopics.filter((s) => s.is_completed).length;
          const totalSubtopics = pattern.subtopics.length;
          const masteryEvidenceMet = [
            pattern.can_explain_use,
            pattern.can_implement_core,
            pattern.can_solve_unfamiliar,
            pattern.can_explain_complexity,
            pattern.can_resolve_delayed,
          ].filter(Boolean).length;

          return (
            <div
              key={pattern.id}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card overflow-hidden"
            >
              {/* Pattern Card Header */}
              <div
                onClick={() => setExpandedPatternId(isExpanded ? null : pattern.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bg-surface)]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-muted)]">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        #{pattern.order_index}
                      </span>
                      <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
                        {pattern.name}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 tag-pill font-mono font-medium ${
                          statusColors[pattern.status] || ''
                        }`}
                      >
                        {pattern.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mt-1">
                      <span>Stage {pattern.stage}</span>
                      <span>•</span>
                      <span>
                        Subtopics: {completedSubtopics}/{totalSubtopics}
                      </span>
                      <span>•</span>
                      <span>
                        Mastery Evidence: <strong>{masteryEvidenceMet}/5</strong>
                      </span>
                      {pattern.last_practiced_date && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[var(--text-muted)]">
                            Last Practiced: {pattern.last_practiced_date}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Rating & Confidence */}
                <div className="flex items-center gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[var(--text-muted)] mr-1">Confidence:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onUpdatePattern(pattern.id, { confidence_rating: star })}
                        className="text-amber-500 hover:scale-110 transition-transform"
                        title={`Confidence: ${star}/5`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= pattern.confidence_rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-[var(--border-subtle)]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={pattern.status}
                    onChange={(e) => onUpdatePattern(pattern.id, { status: e.target.value as any })}
                    className="px-2.5 py-1 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Learning">Learning</option>
                    <option value="Practicing">Practicing</option>
                    <option value="Revision Required">Revision Required</option>
                    <option value="Mastered" disabled={masteryEvidenceMet < 5}>
                      Mastered {masteryEvidenceMet < 5 ? '(Requires 5/5 evidence)' : ''}
                    </option>
                  </select>
                </div>
              </div>

              {/* Expanded Pattern Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-[var(--border-subtle)] space-y-6 text-xs">
                  {/* Recognition, When & Why, Mistakes & Complexity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                      <div>
                        <span className="font-medium text-[var(--color-brass)] block uppercase text-[10px] tracking-wider">
                          Recognition Clues
                        </span>
                        <p className="text-[var(--text-primary)] mt-0.5 leading-relaxed">
                          {pattern.recognition_clues}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-brass)] block uppercase text-[10px] tracking-wider">
                          When & Why to Use
                        </span>
                        <p className="text-[var(--text-primary)] mt-0.5 leading-relaxed">
                          {pattern.when_and_why}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                      <div>
                        <span className="font-medium text-red-600 dark:text-red-400 block uppercase text-[10px] tracking-wider">
                          Common Pitfalls & Mistakes
                        </span>
                        <p className="text-[var(--text-primary)] mt-0.5 leading-relaxed">
                          {pattern.common_mistakes}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-brass)] block uppercase text-[10px] tracking-wider">
                          Time & Space Complexity Notes
                        </span>
                        <p className="font-mono text-[var(--text-primary)] mt-0.5">
                          {pattern.complexity_notes}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strict Mastery Evidence Checklist */}
                  <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Strict Mastery Verification (All 5 Required for 'Mastered' status)
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {masteryEvidenceMet} of 5 verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-3">
                      <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={pattern.can_explain_use}
                          onChange={(e) =>
                            onUpdatePattern(pattern.id, { can_explain_use: e.target.checked })
                          }
                          className="rounded-xs"
                        />
                        <span>Explain when to use without prompt</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={pattern.can_implement_core}
                          onChange={(e) =>
                            onUpdatePattern(pattern.id, { can_implement_core: e.target.checked })
                          }
                          className="rounded-xs"
                        />
                        <span>Implement core approach without copying</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={pattern.can_solve_unfamiliar}
                          onChange={(e) =>
                            onUpdatePattern(pattern.id, { can_solve_unfamiliar: e.target.checked })
                          }
                          className="rounded-xs"
                        />
                        <span>Solve unfamiliar problems independently</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={pattern.can_explain_complexity}
                          onChange={(e) =>
                            onUpdatePattern(pattern.id, { can_explain_complexity: e.target.checked })
                          }
                          className="rounded-xs"
                        />
                        <span>Explain time and space complexity</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={pattern.can_resolve_delayed}
                          onChange={(e) =>
                            onUpdatePattern(pattern.id, { can_resolve_delayed: e.target.checked })
                          }
                          className="rounded-xs"
                        />
                        <span>Re-solve problems after a delay (spaced repetition)</span>
                      </label>
                    </div>
                  </div>

                  {/* Subtopics Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--text-primary)]">
                        Pattern Subtopics ({pattern.subtopics.length})
                      </span>
                      <button
                        onClick={() => setAddingSubtopicPatternId(pattern.id)}
                        className="text-[11px] text-[var(--color-ember-orange)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subtopic</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {pattern.subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                            <input
                              type="checkbox"
                              checked={sub.is_completed}
                              onChange={() => onToggleSubtopic(sub.id)}
                              className="rounded-xs text-[var(--color-ember-orange)]"
                            />
                            <span
                              className={`truncate ${
                                sub.is_completed
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)]'
                              }`}
                            >
                              {sub.title}
                            </span>
                          </label>
                          <button
                            onClick={() => onDeleteSubtopic(sub.id)}
                            className="text-[var(--text-muted)] hover:text-red-500"
                            title="Delete subtopic"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {addingSubtopicPatternId === pattern.id && (
                      <div className="mt-2 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
                        <input
                          type="text"
                          value={newSubtopicTitle}
                          onChange={(e) => setNewSubtopicTitle(e.target.value)}
                          placeholder="Subtopic title..."
                          className="flex-1 px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                        />
                        <button
                          onClick={() => handleAddSubtopicSubmit(pattern.id, pattern.subtopics.length)}
                          className="px-3 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setAddingSubtopicPatternId(null)}
                          className="px-2 py-1 btn-sharp border border-[var(--border-subtle)] text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Problems Logged under Pattern */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--text-primary)]">
                        Logged Practice Problems ({pattern.problems.length})
                      </span>
                      <button
                        onClick={() => setAddingProblemPatternId(pattern.id)}
                        className="text-[11px] text-[var(--color-ember-orange)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log Practice Problem</span>
                      </button>
                    </div>

                    {pattern.problems.length === 0 ? (
                      <p className="text-[11px] text-[var(--text-muted)] italic">
                        No individual practice problems logged yet. Keep roadmap compact; add specific problems when solved.
                      </p>
                    ) : (
                      <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)]">
                        {pattern.problems.map((prob) => (
                          <div
                            key={prob.id}
                            className="p-3 bg-[var(--bg-surface)] flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--text-primary)]">
                                  {prob.title}
                                </span>
                                <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">
                                  {prob.difficulty}
                                </span>
                                <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-mono">
                                  {prob.status}
                                </span>
                                {prob.solved_independently && (
                                  <span className="text-[10px] text-[var(--color-brass)] font-mono">
                                    [Solved Independently]
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                Solved on {prob.date_solved} • {prob.time_spent_minutes} minutes
                                {prob.notes && ` • Notes: ${prob.notes}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {prob.source_url && (
                                <a
                                  href={prob.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() => onDeleteProblem(prob.id)}
                                className="text-[var(--text-muted)] hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addingProblemPatternId === pattern.id && (
                      <div className="mt-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-[var(--text-muted)]">
                              Problem Title
                            </label>
                            <input
                              type="text"
                              value={probTitle}
                              onChange={(e) => setProbTitle(e.target.value)}
                              placeholder="E.g., 3Sum / Minimum Window Substring"
                              className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[var(--text-muted)]">
                              Difficulty
                            </label>
                            <select
                              value={probDifficulty}
                              onChange={(e) => setProbDifficulty(e.target.value as any)}
                              className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-[var(--text-muted)]">
                              Result Status
                            </label>
                            <select
                              value={probStatus}
                              onChange={(e) => setProbStatus(e.target.value as any)}
                              className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                            >
                              <option value="Solved Correct">Solved Correct</option>
                              <option value="Hint Required">Hint Required</option>
                              <option value="Incorrect">Incorrect</option>
                              <option value="Attempted">Attempted</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-[var(--text-muted)]">
                              Time Taken (min)
                            </label>
                            <input
                              type="number"
                              value={probTime}
                              onChange={(e) => setProbTime(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[var(--text-muted)]">
                              Source URL (Optional)
                            </label>
                            <input
                              type="text"
                              value={probUrl}
                              onChange={(e) => setProbUrl(e.target.value)}
                              placeholder="https://leetcode.com/..."
                              className="w-full px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={probIndep}
                            onChange={(e) => setProbIndep(e.target.checked)}
                            id="probIndep"
                          />
                          <label htmlFor="probIndep" className="text-xs text-[var(--text-secondary)]">
                            Solved independently without looking at solutions
                          </label>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setAddingProblemPatternId(null)}
                            className="px-3 py-1 btn-sharp border border-[var(--border-subtle)] text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddProblemSubmit(pattern.id)}
                            className="px-3 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-medium"
                          >
                            Save Problem
                          </button>
                        </div>
                      </div>
                    )}
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
