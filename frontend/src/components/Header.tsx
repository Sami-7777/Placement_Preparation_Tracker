import React from 'react';
import { Sun, Moon, Flame, Calendar, Clock, PlusCircle } from 'lucide-react';
import { DashboardSummary } from '../types';

interface HeaderProps {
  summary: DashboardSummary | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  timerActive: boolean;
  timerSeconds: number;
  timerCategory: string;
  onToggleTimer: () => void;
  onFinishTimer: () => void;
  onOpenManualModal: () => void;
  onOpenCloseDayModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  selectedDate,
  onDateChange,
  themeMode,
  onToggleTheme,
  timerActive,
  timerSeconds,
  timerCategory,
  onToggleTimer,
  onFinishTimer,
  onOpenManualModal,
  onOpenCloseDayModal,
}) => {
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-4 sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Deadline */}
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-ember-orange)]"></span>
              <h1 className="text-xl font-heading tracking-tight font-normal text-[var(--text-primary)]">
                PLACEMENT TRACKER
              </h1>
              <span className="text-xs px-2 py-0.5 tag-pill bg-[var(--bg-surface)] text-[var(--color-brass)] border border-[var(--border-subtle)] font-mono">
                CSBS 2027
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Goal Deadline: <span className="text-[var(--color-ember-orange)] font-medium">30 March 2027</span>
              {summary && ` • ${summary.days_remaining} calendar days remaining`}
            </p>
          </div>

          {/* Streak pill */}
          {summary && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 nav-pill bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
              <Flame className="w-4 h-4 text-[var(--color-ember-orange)] fill-current" />
              <span>
                Streak: <strong className="font-semibold">{summary.current_streak} days</strong>
                <span className="text-[var(--text-muted)] ml-1">(best: {summary.longest_streak}d)</span>
              </span>
            </div>
          )}
        </div>

        {/* Timer Bar & Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Active study timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] asymmetric-card">
            <Clock className={`w-4 h-4 ${timerActive ? 'text-[var(--color-ember-orange)] animate-pulse' : 'text-[var(--text-muted)]'}`} />
            <div className="text-xs">
              <span className="font-mono font-medium text-[var(--text-primary)]">{formatTimer(timerSeconds)}</span>
              <span className="text-[var(--text-muted)] ml-1.5 hidden md:inline">({timerCategory})</span>
            </div>
            <button
              onClick={onToggleTimer}
              className={`text-xs px-2.5 py-1 btn-sharp font-medium transition-colors ${
                timerActive
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90'
              }`}
            >
              {timerActive ? 'Pause' : timerSeconds > 0 ? 'Resume' : 'Start Timer'}
            </button>
            {timerSeconds > 0 && (
              <button
                onClick={onFinishTimer}
                className="text-xs px-2.5 py-1 btn-sharp bg-[var(--color-ember-orange)] text-white hover:opacity-90 transition-opacity"
              >
                Log Session
              </button>
            )}
          </div>

          {/* Manual Offline Time */}
          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 text-xs px-3 py-2 btn-sharp border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            title="Log offline study time"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[var(--color-brass)]" />
            <span className="hidden sm:inline">Offline Study</span>
          </button>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] text-xs focus:outline-none font-mono"
            />
          </div>

          {/* Close Day Button */}
          <button
            onClick={onOpenCloseDayModal}
            className="text-xs px-3 py-2 btn-sharp border border-[var(--color-brass)] text-[var(--color-brass)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            Close Day
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-8 h-8 btn-sharp border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {themeMode === 'light' ? (
              <Moon className="w-4 h-4 text-[var(--color-graphite)]" />
            ) : (
              <Sun className="w-4 h-4 text-[var(--color-ember-orange)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
