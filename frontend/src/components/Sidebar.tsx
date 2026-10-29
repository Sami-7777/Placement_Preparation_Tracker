import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Database,
  Cpu,
  Code2,
  Briefcase,
  BarChart3,
  AlertCircle,
  Calculator
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'daily_plan'
  | 'dsa_patterns'
  | 'sql_practice'
  | 'core_cs'
  | 'aptitude'
  | 'python_fs'
  | 'placement'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  overdueCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, overdueCount }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'daily_plan',
      label: 'Daily 6h Plan',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: overdueCount > 0 ? overdueCount : undefined
    },
    { id: 'dsa_patterns', label: 'DSA Patterns (16)', icon: <Layers className="w-4 h-4" /> },
    { id: 'sql_practice', label: 'SQL Practice', icon: <Database className="w-4 h-4" /> },
    { id: 'core_cs', label: 'Core CS Rotation', icon: <Cpu className="w-4 h-4" /> },
    { id: 'aptitude', label: 'Aptitude & Reasoning', icon: <Calculator className="w-4 h-4" /> },
    { id: 'python_fs', label: 'Python Full Stack', icon: <Code2 className="w-4 h-4" /> },
    { id: 'placement', label: 'Placement & Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'reports', label: 'Weekly Accountability', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors font-medium ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-l-2 border-[var(--color-ember-orange)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[var(--color-ember-orange)]' : 'text-[var(--text-muted)]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 tag-pill bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-mono">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footnote */}
      <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] px-3 text-xs text-[var(--text-muted)] space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine Status</span>
          <span className="text-[var(--color-brass)] font-mono">Active</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Daily Quota</span>
          <span className="font-mono">360 min (6h)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Verification</span>
          <span className="font-mono">Persistent</span>
        </div>
      </div>
    </aside>
  );
};

