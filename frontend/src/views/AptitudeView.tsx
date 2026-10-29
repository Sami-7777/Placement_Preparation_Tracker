import React, { useState } from 'react';
import { CheckSquare, Square, BookOpen, Calculator, Brain, Clock, TrendingUp, Lightbulb, Star } from 'lucide-react';

const APTITUDE_SECTIONS = [
  {
    key: 'quantitative',
    label: 'Quantitative Aptitude',
    icon: <Calculator className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    accent: 'border-blue-300 dark:border-blue-700',
    topics: [
      { id: 'q1', name: 'Number System & Divisibility', tips: 'HCF, LCM, remainders, factors, cyclicity of units digit.' },
      { id: 'q2', name: 'Percentages', tips: 'Population, profit/loss, successive %, reverse %. Master shortcuts.' },
      { id: 'q3', name: 'Profit, Loss & Discount', tips: 'CP, SP, MP, marked price, trade discounts, equivalent discount.' },
      { id: 'q4', name: 'Simple & Compound Interest', tips: 'SI formula, CI formula, effective rate, difference CI-SI.' },
      { id: 'q5', name: 'Ratio, Proportion & Variation', tips: 'Compound ratios, proportionality, partnership sharing.' },
      { id: 'q6', name: 'Ages Problems', tips: 'Present, past, future ages; fractions-based age equations.' },
      { id: 'q7', name: 'Averages & Mixtures', tips: 'Weighted average, alligation method, replacement problems.' },
      { id: 'q8', name: 'Time & Work', tips: 'Efficiency, pipes & cisterns, work equivalence, combined rates.' },
      { id: 'q9', name: 'Time, Speed & Distance', tips: 'Relative speed, trains crossing, boats & streams, circular motion.' },
      { id: 'q10', name: 'Permutations & Combinations', tips: 'nPr, nCr, circular arrangements, word arrangement with restrictions.' },
      { id: 'q11', name: 'Probability', tips: 'Classical probability, events, independent/mutually exclusive, Bayes.' },
      { id: 'q12', name: 'Algebra & Equations', tips: 'Quadratics, simultaneous equations, inequalities, surds & indices.' },
      { id: 'q13', name: 'Geometry & Mensuration', tips: 'Area/perimeter/volume of 2D & 3D shapes, co-ordinate geometry basics.' },
      { id: 'q14', name: 'Data Interpretation (DI)', tips: 'Bar charts, pie charts, tables, line graphs — calculate fast.' },
    ],
  },
  {
    key: 'logical',
    label: 'Logical Reasoning',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    accent: 'border-violet-300 dark:border-violet-700',
    topics: [
      { id: 'l1', name: 'Series & Sequences', tips: 'Number series, letter series, alphanumeric mixed, missing term.' },
      { id: 'l2', name: 'Coding-Decoding', tips: 'Letter shift, reversal, number code, symbol code patterns.' },
      { id: 'l3', name: 'Blood Relations', tips: 'Draw family tree; left/right gender conventions; coded relations.' },
      { id: 'l4', name: 'Direction Sense', tips: 'Draw displacement diagram; final direction; shortest distance.' },
      { id: 'l5', name: 'Seating Arrangements', tips: 'Linear, circular, parallel rows; constraints; definite placement first.' },
      { id: 'l6', name: 'Puzzles & Scheduling', tips: 'Floor puzzles, box puzzles, month-year scheduling, grid puzzles.' },
      { id: 'l7', name: 'Syllogisms', tips: 'Venn diagram method; All/Some/No combinations; possibility cases.' },
      { id: 'l8', name: 'Input-Output', tips: 'Pattern shift per step; ascending/descending rearrangements.' },
      { id: 'l9', name: 'Analogies & Odd One Out', tips: 'Number analogies, letter analogies, meaningful word relationship.' },
      { id: 'l10', name: 'Clocks & Calendars', tips: 'Angle between hands, time difference, day of week formula.' },
      { id: 'l11', name: 'Cubes & Dice', tips: 'Open-net folding, faces opposite each other, painted cube cuts.' },
      { id: 'l12', name: 'Data Sufficiency', tips: 'Two-statement format: analyse each statement alone, then together.' },
    ],
  },
  {
    key: 'verbal',
    label: 'Verbal Ability & English',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    accent: 'border-emerald-300 dark:border-emerald-700',
    topics: [
      { id: 'v1', name: 'Reading Comprehension (RC)', tips: 'Skim for main idea; read questions first; eliminate extremes.' },
      { id: 'v2', name: 'Vocabulary — Synonyms & Antonyms', tips: 'Learn roots (Greek/Latin); learn 10 new words/day from word lists.' },
      { id: 'v3', name: 'Fill in the Blanks', tips: 'Contextual meaning, preposition idioms, article (a/an/the) rules.' },
      { id: 'v4', name: 'Sentence Correction (Grammar)', tips: 'Subject-verb agreement, tenses, parallel structure, modifiers.' },
      { id: 'v5', name: 'Para Jumbles & Sentence Ordering', tips: 'Find mandatory first/last; link pronouns to antecedents; contrast connectors.' },
      { id: 'v6', name: 'Error Spotting', tips: 'Parts A/B/C/D; identify the underlined error; no error option.' },
      { id: 'v7', name: 'Idioms & Phrases', tips: 'Common idioms used in TCS, Infosys, Wipro English tests — memorise 50.' },
    ],
  },
  {
    key: 'technical_aptitude',
    label: 'Technical Aptitude & Programming MCQs',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    accent: 'border-amber-300 dark:border-amber-700',
    topics: [
      { id: 't1', name: 'C / C++ Output-Based MCQs', tips: 'Pointer arithmetic, arrays, function calls, operator precedence.' },
      { id: 't2', name: 'Python Output Tracing', tips: 'List slicing, comprehensions, default args, *args/**kwargs, generators.' },
      { id: 't3', name: 'Time & Space Complexity MCQs', tips: 'Big-O for common algorithms; best/worst/average cases; sorting comparison.' },
      { id: 't4', name: 'Bit Manipulation', tips: 'AND/OR/XOR/NOT, shifts, set/clear/toggle bit, count set bits.' },
      { id: 't5', name: 'Computer Organisation Basics', tips: 'Cache, pipeline, registers, cache hit/miss, instruction cycle.' },
      { id: 't6', name: 'Database SQL MCQs', tips: 'NULL handling, GROUP BY, HAVING, JOIN type selection, normalization forms.' },
      { id: 't7', name: 'Searching & Sorting MCQs', tips: 'Stability, in-place, best-case performance, merge vs. quick vs. heap.' },
      { id: 't8', name: 'Number Systems (Binary/Octal/Hex)', tips: "Conversion, 2's complement, arithmetic in non-decimal bases." },
    ],
  },
];

const STUDY_TIPS = [
  { icon: <Clock className="w-3.5 h-3.5" />, text: 'Practice 5 quantitative problems every day — 25 min block.' },
  { icon: <Clock className="w-3.5 h-3.5" />, text: 'Spend 20 min on 1 logical puzzle type each day (rotate types weekly).' },
  { icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Learn formulas with derivation, not rote — you will apply them under pressure.' },
  { icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Time yourself: each MCQ should take ≤ 60 seconds in company tests.' },
  { icon: <TrendingUp className="w-3.5 h-3.5" />, text: 'Use IndiaBix, PrepInsta & PreviousPaper for company-specific question sets.' },
];

interface TopicState {
  checked: boolean;
  confidence: number;
}

export const AptitudeView: React.FC = () => {
  const savedRaw = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('aptitude_state') || '{}')
    : {};

  const [topicStates, setTopicStates] = useState<Record<string, TopicState>>(() => savedRaw);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(APTITUDE_SECTIONS.map((s) => s.key))
  );

  const persist = (state: Record<string, TopicState>) => {
    localStorage.setItem('aptitude_state', JSON.stringify(state));
  };

  const toggleTopic = (id: string) => {
    setTopicStates((prev) => {
      const current = prev[id] || { checked: false, confidence: 0 };
      const next = { ...prev, [id]: { ...current, checked: !current.checked } };
      persist(next);
      return next;
    });
  };

  const setConfidence = (id: string, val: number) => {
    setTopicStates((prev) => {
      const current = prev[id] || { checked: false, confidence: 0 };
      const next = { ...prev, [id]: { ...current, confidence: val } };
      persist(next);
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalTopics = APTITUDE_SECTIONS.reduce((s, sec) => s + sec.topics.length, 0);
  const doneTopics = Object.values(topicStates).filter((s) => s.checked).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[var(--color-brass)]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                Aptitude & Reasoning
              </span>
            </div>
            <h2 className="text-xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Complete Aptitude Master Sheet
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              All important topics across Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Technical MCQs.
              Tick each topic once you have studied + practised it.
            </p>
          </div>
          <div className="flex gap-3 text-center shrink-0">
            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-xl font-mono font-medium text-emerald-600 dark:text-emerald-400">{doneTopics}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Completed</div>
            </div>
            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-xl font-mono font-medium text-[var(--text-primary)]">{totalTopics - doneTopics}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Remaining</div>
            </div>
            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-xl font-mono font-medium text-[var(--color-ember-orange)]">
                {totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0}%
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Progress</div>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-ember-orange)] transition-all duration-700"
            style={{ width: `${totalTopics > 0 ? (doneTopics / totalTopics) * 100 : 0}%` }}
          />
        </div>

        {/* Study Tips */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {STUDY_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="shrink-0 mt-0.5 text-[var(--color-ember-orange)]">{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      {APTITUDE_SECTIONS.map((section) => {
        const sectionDone = section.topics.filter((t) => topicStates[t.id]?.checked).length;
        const isExpanded = expandedSections.has(section.key);

        return (
          <div
            key={section.key}
            className={`bg-[var(--bg-card)] border asymmetric-card overflow-hidden ${section.accent}`}
          >
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.key)}
              className={`w-full flex items-center justify-between px-5 py-4 ${section.bg} border-b border-[var(--border-subtle)] hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <span className={section.color}>{section.icon}</span>
                <div className="text-left">
                  <span className={`font-heading font-semibold text-sm ${section.color}`}>
                    {section.label}
                  </span>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">
                    {sectionDone} / {section.topics.length} topics completed
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block w-24 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-ember-orange)] transition-all duration-500"
                    style={{ width: `${(sectionDone / section.topics.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {Math.round((sectionDone / section.topics.length) * 100)}%
                </span>
                <span className="text-[var(--text-muted)] text-lg leading-none">{isExpanded ? '▾' : '▸'}</span>
              </div>
            </button>

            {/* Topics list */}
            {isExpanded && (
              <div className="divide-y divide-[var(--border-subtle)]">
                {section.topics.map((topic) => {
                  const state = topicStates[topic.id] || { checked: false, confidence: 0 };
                  return (
                    <div
                      key={topic.id}
                      className={`px-5 py-3.5 flex items-start gap-3 transition-colors ${
                        state.checked ? 'bg-[var(--bg-surface)]/50' : 'hover:bg-[var(--bg-surface)]/30'
                      }`}
                    >
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                      >
                        {state.checked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-[var(--text-muted)]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${
                            state.checked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                          }`}>
                            {topic.name}
                          </span>

                          {/* Star confidence */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setConfidence(topic.id, star)}>
                                <Star
                                  className={`w-3 h-3 ${
                                    star <= state.confidence
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-[var(--border-subtle)]'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                          {topic.tips}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
