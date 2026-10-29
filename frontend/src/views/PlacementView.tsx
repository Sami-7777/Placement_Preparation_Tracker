import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  Building2,
  Sparkles,
  X
} from 'lucide-react';
import { PlacementActivity, ProjectRecord, JobApplication } from '../types';

interface PlacementViewProps {
  activities: PlacementActivity[];
  projects: ProjectRecord[];
  applications: JobApplication[];
  selectedDate: string;
  onAddActivity: (data: Partial<PlacementActivity>) => Promise<void>;
  onDeleteActivity: (id: number) => Promise<void>;
  onAddProject: (data: Partial<ProjectRecord>) => Promise<void>;
  onUpdateProject: (id: number, data: Partial<ProjectRecord>) => Promise<void>;
  onDeleteProject: (id: number) => Promise<void>;
  onAddApplication: (data: Partial<JobApplication>) => Promise<void>;
  onUpdateApplication: (id: number, data: Partial<JobApplication>) => Promise<void>;
  onDeleteApplication: (id: number) => Promise<void>;
}

export const PlacementView: React.FC<PlacementViewProps> = ({
  activities,
  projects,
  applications,
  selectedDate,
  onAddActivity,
  onDeleteActivity,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'projects' | 'aptitude'>('applications');

  // Application Modal state
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Developer / Engineer');
  const [jobUrl, setJobUrl] = useState('');
  const [eligibility, setEligibility] = useState('B.Tech CSBS / CSE 2027 Grad');
  const [appStatus, setAppStatus] = useState<any>('Applied');
  const [assessmentDate, setAssessmentDate] = useState('');
  const [interviewDates, setInterviewDates] = useState('');
  const [appNotes, setAppNotes] = useState('');

  // Project Modal state
  const [isAddingProj, setIsAddingProj] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projStack, setProjStack] = useState('Python, FastAPI, SQLite, React');
  const [projGithub, setProjGithub] = useState('');
  const [projStatus, setProjStatus] = useState<any>('In Progress');
  const [projDoubts, setProjDoubts] = useState('');
  const [projReadiness, setProjReadiness] = useState('');

  // Aptitude modal state
  const [isAddingAct, setIsAddingAct] = useState(false);
  const [actType, setActType] = useState('Quantitative Aptitude');
  const [actTitle, setActTitle] = useState('');
  const [actScore, setActScore] = useState('');
  const [actTime, setActTime] = useState(45);
  const [actNotes, setActNotes] = useState('');

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    await onAddApplication({
      company: company.trim(),
      role: role.trim(),
      job_url: jobUrl.trim(),
      eligibility_criteria: eligibility.trim(),
      application_date: selectedDate,
      status: appStatus,
      assessment_date: assessmentDate || undefined,
      interview_dates: interviewDates || undefined,
      notes: appNotes.trim(),
    });
    setCompany('');
    setJobUrl('');
    setAppNotes('');
    setIsAddingApp(false);
  };

  const handleCreateProj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    await onAddProject({
      title: projTitle.trim(),
      tech_stack: projStack.trim(),
      github_url: projGithub.trim(),
      status: projStatus,
      technical_doubts: projDoubts.trim(),
      interview_readiness_notes: projReadiness.trim(),
      tasks_todo: '',
    });
    setProjTitle('');
    setProjGithub('');
    setProjDoubts('');
    setProjReadiness('');
    setIsAddingProj(false);
  };

  const handleCreateAct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;
    await onAddActivity({
      date: selectedDate,
      activity_type: actType,
      title: actTitle.trim(),
      score_or_result: actScore.trim() || undefined,
      time_spent_minutes: actTime,
      notes: actNotes.trim(),
      key_takeaways: '',
    });
    setActTitle('');
    setActScore('');
    setActNotes('');
    setIsAddingAct(false);
  };

  const statusColors: Record<string, string> = {
    'Interested': 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
    'To Apply': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    'Applied': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    'Assessment Scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    'Interview Scheduled': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
    'Selected': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    'Offer Received': 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--color-brass)] font-medium">
                Career Conversion
              </span>
              <span className="text-xs font-mono text-[var(--color-ember-orange)]">[Placement Engine]</span>
            </div>
            <h2 className="text-2xl font-heading font-normal text-[var(--text-primary)] mt-1">
              Job Applications, Projects & Aptitude
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Strict tracking for 2027 Software Developer roles. Log job pipeline stages, technical interview preparation, project GitHub deliverables, and aptitude tests.
            </p>
          </div>

          {/* Module Sub-tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('applications')}
              className={`text-xs px-3 py-1.5 btn-sharp transition-colors ${
                activeTab === 'applications'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              Job Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`text-xs px-3 py-1.5 btn-sharp transition-colors ${
                activeTab === 'projects'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              Portfolio Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('aptitude')}
              className={`text-xs px-3 py-1.5 btn-sharp transition-colors ${
                activeTab === 'aptitude'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              Aptitude & Assessments ({activities.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Job Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-medium text-[var(--text-primary)]">
              Application Pipeline ({applications.length})
            </span>
            <button
              onClick={() => setIsAddingApp(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track Job Application</span>
            </button>
          </div>

          {isAddingApp && (
            <form
              onSubmit={handleCreateApp}
              className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-3 text-xs shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <span className="font-medium text-[var(--text-primary)]">Track New Job Opportunity</span>
                <button
                  type="button"
                  onClick={() => setIsAddingApp(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="E.g., Google / TCS / Infosys / Startup"
                    required
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Status</label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="Interested">Interested</option>
                    <option value="To Apply">To Apply</option>
                    <option value="Applied">Applied</option>
                    <option value="Assessment Scheduled">Assessment Scheduled</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Selected">Selected</option>
                    <option value="Offer Received">Offer Received</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Job URL / Career Link</label>
                  <input
                    type="text"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Upcoming Assessment / Interview Date</label>
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Preparation & Referral Notes</label>
                <input
                  type="text"
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="E.g., Referral request pending with alumni; requires strong OS and Two Pointers DSA."
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddingApp(false)}
                  className="px-3 py-1 btn-sharp border border-[var(--border-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
                >
                  Save Application
                </button>
              </div>
            </form>
          )}

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No job applications recorded yet. Add companies you are targeting for placements.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)] text-xs">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 flex items-start justify-between gap-3 hover:bg-[var(--bg-surface)]/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-medium text-sm text-[var(--text-primary)]">
                          {app.company}
                        </span>
                        <span className="text-[var(--text-muted)]">—</span>
                        <span className="text-[var(--text-secondary)]">{app.role}</span>
                        <span className={`px-1.5 py-0.2 tag-pill text-[10px] font-mono ${statusColors[app.status] || ''}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1">
                        Applied: {app.application_date}
                        {app.assessment_date && ` • Assessment Date: ${app.assessment_date}`}
                        {app.notes && ` • Notes: ${app.notes}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateApplication(app.id, { status: e.target.value as any })}
                        className="text-[11px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-primary)]"
                      >
                        <option value="Interested">Interested</option>
                        <option value="To Apply">To Apply</option>
                        <option value="Applied">Applied</option>
                        <option value="Assessment Scheduled">Assessment Scheduled</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Selected">Selected</option>
                        <option value="Offer Received">Offer Received</option>
                      </select>

                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="text-[var(--text-muted)] hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-medium text-[var(--text-primary)]">
              Portfolio Projects & Interview Readiness ({projects.length})
            </span>
            <button
              onClick={() => setIsAddingProj(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {isAddingProj && (
            <form
              onSubmit={handleCreateProj}
              className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-3 text-xs shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <span className="font-medium text-[var(--text-primary)]">New Portfolio Project</span>
                <button
                  type="button"
                  onClick={() => setIsAddingProj(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Project Title</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="E.g., AI Placement Preparation Tracker"
                    required
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Tech Stack</label>
                  <input
                    type="text"
                    value={projStack}
                    onChange={(e) => setProjStack(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">GitHub Repository Link</label>
                  <input
                    type="text"
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Implementation Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="MVP Complete">MVP Complete</option>
                    <option value="Production Ready">Production Ready</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Interview Readiness & Architectural Decisions</label>
                <textarea
                  value={projReadiness}
                  onChange={(e) => setProjReadiness(e.target.value)}
                  rows={2}
                  placeholder="How do you explain the database choices, concurrency, and trade-offs to a technical interviewer?"
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddingProj(false)}
                  className="px-3 py-1 btn-sharp border border-[var(--border-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
                >
                  Save Project
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card">
                No projects tracked yet. Add your flagship projects to prepare interview explanations.
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-heading font-medium text-sm text-[var(--text-primary)]">
                        {proj.title}
                      </h4>
                      <span className="text-[11px] font-mono text-[var(--color-brass)] block mt-0.5">
                        {proj.tech_stack}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={proj.status}
                        onChange={(e) => onUpdateProject(proj.id, { status: e.target.value as any })}
                        className="text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-primary)]"
                      >
                        <option value="Idea">Idea</option>
                        <option value="In Progress">In Progress</option>
                        <option value="MVP Complete">MVP Complete</option>
                        <option value="Production Ready">Production Ready</option>
                      </select>

                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="text-[var(--text-muted)] hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.interview_readiness_notes && (
                    <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      <span className="font-medium text-[var(--text-secondary)] block text-[10px] uppercase font-mono">
                        Interview Explanation Focus
                      </span>
                      <p className="text-[var(--text-primary)] mt-1">{proj.interview_readiness_notes}</p>
                    </div>
                  )}

                  {proj.github_url && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-ember-orange)] hover:underline truncate"
                      >
                        {proj.github_url}
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Aptitude & Assessments */}
      {activeTab === 'aptitude' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-medium text-[var(--text-primary)]">
              Aptitude & Technical Assessments Log ({activities.length})
            </span>
            <button
              onClick={() => setIsAddingAct(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Assessment / Practice</span>
            </button>
          </div>

          {isAddingAct && (
            <form
              onSubmit={handleCreateAct}
              className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card space-y-3 text-xs shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <span className="font-medium text-[var(--text-primary)]">Log Assessment Activity</span>
                <button
                  type="button"
                  onClick={() => setIsAddingAct(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Type</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                    <option value="Data Interpretation">Data Interpretation</option>
                    <option value="Timed Coding Assessment">Timed Coding Assessment</option>
                    <option value="Mock Interview">Mock Interview</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Test Title / Topic</label>
                  <input
                    type="text"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    placeholder="E.g., Time & Work, Speed Distance, Syllogisms"
                    required
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Score / Result (Optional)</label>
                  <input
                    type="text"
                    value={actScore}
                    onChange={(e) => setActScore(e.target.value)}
                    placeholder="E.g., 22/25 (88%)"
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddingAct(false)}
                  className="px-3 py-1 btn-sharp border border-[var(--border-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 btn-sharp bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium"
                >
                  Save Activity
                </button>
              </div>
            </form>
          )}

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] asymmetric-card overflow-hidden">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No aptitude or interview assessments recorded yet. Use the 45m daily placement block to practice.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)] text-xs">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">{act.title}</span>
                        <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono">
                          {act.activity_type}
                        </span>
                        {act.score_or_result && (
                          <span className="px-1.5 py-0.2 tag-pill text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 font-mono font-medium">
                            Score: {act.score_or_result}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {act.date} • {act.time_spent_minutes} minutes spent
                        {act.notes && ` • ${act.notes}`}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="text-[var(--text-muted)] hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
