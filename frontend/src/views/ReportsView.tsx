import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  History,
  FileSpreadsheet,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api } from '../api';

interface ReportsViewProps {
  selectedDate: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ selectedDate }) => {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [weekly, audit] = await Promise.all([
        api.getWeeklyReport(),
        api.getAuditLogs(),
      ]);
      setWeeklyData(weekly);
      setAuditLogs(audit);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDate]);

  const handleExportJson = async () => {
    try {
      const data = await api.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `placement_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error exporting data');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await api.importData(parsed);
      alert('Data successfully imported and synchronized.');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Error importing JSON backup');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)] font-mono">
        Calculating weekly accountability metrics...
      </div>
    );
  }

  const daysChartData = weeklyData?.days || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                Audited Analytics
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                [{weeklyData?.week_start} to {weeklyData?.week_end}]
              </span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Weekly Accountability & Consistency
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Strict mathematical derivation: Consistency is the percentage of days meeting the 360-minute quota. Unbiased objective evaluation.
            </p>
          </div>

          {/* Export / Backup Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium hover:opacity-90"
              title="Download complete database state as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 text-xs btn-sharp border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[var(--color-brass)]" />
              <span>{importing ? 'Importing...' : 'Restore Backup'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Weekly Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block">Weekly Consistency</span>
            <span className="font-mono text-2xl font-normal text-[var(--color-ember-orange)]">
              {weeklyData?.consistency_pct || 0}%
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
              {weeklyData?.days_target_met || 0} of 7 days target met
            </span>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block">Total Focused Hours</span>
            <span className="font-mono text-2xl font-normal text-[var(--text-primary)]">
              {((weeklyData?.total_week_minutes || 0) / 60).toFixed(1)}h
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
              of 42.0h target quota
            </span>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block">Tasks Completed</span>
            <span className="font-mono text-2xl font-normal text-[var(--text-primary)]">
              {weeklyData?.total_week_tasks_completed || 0}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
              of {weeklyData?.total_week_tasks || 0} scheduled
            </span>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block">Accountability Status</span>
            <span className="font-mono text-base font-medium">
              {weeklyData?.consistency_pct >= 85 ? (
                <span className="text-emerald-600 dark:text-emerald-400">High Discipline</span>
              ) : weeklyData?.consistency_pct >= 50 ? (
                <span className="text-amber-600 dark:text-amber-400">Moderate Variance</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Discipline Deficit</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Consistency Bar Chart */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-heading font-medium text-[var(--text-primary)]">
              Daily Focused Minutes vs 360-Minute Target
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Green represents days where the 360-minute requirement was met.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-brass)]">Target: 360 min/day</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daysChartData}>
              <XAxis dataKey="day_name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis unit="m" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={(val: any) => [`${val} min focused`]}
              />
              <Bar dataKey="actual_minutes" radius={[2, 2, 0, 0]}>
                {daysChartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.is_target_met ? '#10b981' : entry.actual_minutes > 0 ? 'var(--color-ember-orange)' : 'var(--border-subtle)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit History Log */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card overflow-hidden">
        <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-brass)]" />
            <span className="font-heading font-medium text-xs text-[var(--text-primary)]">
              Immutable Audit History Log ({auditLogs.length})
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            Tracks all task edits, session logs & state changes
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] text-xs max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-[var(--bg-surface)]/50 transition-colors flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-semibold text-[var(--color-ember-orange)]">
                      [{log.action}]
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {log.details}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
