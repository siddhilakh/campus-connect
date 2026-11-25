import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  Edit3,
  Calendar,
  X,
  CheckCircle,
  MoreVertical,
  ChevronDown,
  Check,
  ExternalLink,
  Clock,
  Award,
  Layers,
  BellRing,
  Eye,
  GripVertical
} from 'lucide-react';
import { api } from '../api/client';
import { PlacementApplication, ApplicationStatus } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

const STATUSES: ApplicationStatus[] = [
  'Interested',
  'Applied',
  'Assessment',
  'Interview',
  'Selected',
  'Rejected'
];

const STATUS_META: Record<
  ApplicationStatus,
  { pill: string; dot: string; colBorder: string }
> = {
  Interested: {
    pill: 'bg-slate-800/90 text-slate-200 border-slate-700',
    dot: 'bg-slate-400',
    colBorder: 'border-slate-800'
  },
  Applied: {
    pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    colBorder: 'border-blue-500/20'
  },
  Assessment: {
    pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    colBorder: 'border-purple-500/20'
  },
  Interview: {
    pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    colBorder: 'border-amber-500/20'
  },
  Selected: {
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    colBorder: 'border-emerald-500/20'
  },
  Rejected: {
    pill: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    colBorder: 'border-rose-500/20'
  }
};

function formatDateOneLine(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getDaysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Polished Custom Status Selector
interface StatusSelectorProps {
  value: ApplicationStatus;
  onChange: (next: ApplicationStatus) => void;
  compact?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange, compact = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const meta = STATUS_META[value];

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full border font-bold transition-all whitespace-nowrap ${
          compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
        } ${meta.pill} hover:brightness-110`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        <span>{value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1.5 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-40"
          >
            {STATUSES.map((s) => {
              const sMeta = STATUS_META[s];
              const isSelected = s === value;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-brand-600/20 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sMeta.dot}`} />
                    <span>{s}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ApplicationTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Drag & Drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null);

  // Card action menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Detail Panel state
  const [detailApp, setDetailApp] = useState<PlacementApplication | null>(null);

  // Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<PlacementApplication | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Interested');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewDate, setInterviewDate] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      const res = await api.getApplications({ search, status: viewMode === 'table' ? statusFilter : 'ALL' });
      if (res.success) {
        setApplications(res.applications);
        if (detailApp) {
          const refreshed = res.applications.find((a: PlacementApplication) => a.id === detailApp.id);
          if (refreshed) setDetailApp(refreshed);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load placement applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [search, statusFilter, viewMode]);

  useEffect(() => {
    const closeMenus = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener('click', closeMenus);
    return () => document.removeEventListener('click', closeMenus);
  }, [openMenuId]);

  const openCreateModal = (initialStatus: ApplicationStatus = 'Interested') => {
    setEditingApp(null);
    setCompanyName('');
    setRole('');
    setStatus(initialStatus);
    setApplicationDate(new Date().toISOString().split('T')[0]);
    setInterviewDate('');
    setApplicationLink('');
    setPackageLpa('');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: PlacementApplication) => {
    setEditingApp(app);
    setCompanyName(app.companyName);
    setRole(app.role);
    setStatus(app.status);
    setApplicationDate(new Date(app.applicationDate).toISOString().split('T')[0]);
    setInterviewDate(app.interviewDate ? new Date(app.interviewDate).toISOString().split('T')[0] : '');
    setApplicationLink(app.applicationLink || '');
    setPackageLpa(app.packageLpa ? String(app.packageLpa) : '');
    setNotes(app.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim()) {
      setFormError('Company name and role are required.');
      return;
    }

    const payload = {
      companyName,
      role,
      status,
      applicationDate,
      interviewDate: interviewDate || null,
      applicationLink: applicationLink.trim() || null,
      packageLpa: packageLpa ? parseFloat(packageLpa) : null,
      notes
    };

    try {
      if (editingApp) {
        await api.updateApplication(editingApp.id, payload);
        setFeedbackMsg('Application updated successfully.');
      } else {
        await api.createApplication(payload);
        setFeedbackMsg('Application added to tracker.');
      }
      setIsModalOpen(false);
      loadApplications();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save application.');
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const prevApps = [...applications];
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    if (detailApp?.id === id) {
      setDetailApp({ ...detailApp, status: newStatus });
    }
    try {
      await api.updateApplication(id, { status: newStatus });
      setFeedbackMsg(`Moved application to ${newStatus}.`);
      setTimeout(() => setFeedbackMsg(''), 2500);
    } catch (err: any) {
      setApplications(prevApps);
      setErrorMsg(err.message || 'Failed to update status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteApplication(deleteTargetId);
      if (detailApp?.id === deleteTargetId) setDetailApp(null);
      setDeleteTargetId(null);
      setFeedbackMsg('Application removed from tracker.');
      setTimeout(() => setFeedbackMsg(''), 2500);
      loadApplications();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete application.');
    }
  };

  // Summary Metrics
  const totalCount = applications.length;
  const activeCount = applications.filter((a) =>
    ['Applied', 'Assessment', 'Interview'].includes(a.status)
  ).length;
  const interviewsScheduledCount = applications.filter(
    (a) => a.status === 'Interview' || (a.interviewDate && (getDaysUntil(a.interviewDate) ?? -1) >= 0)
  ).length;
  const offersCount = applications.filter((a) => a.status === 'Selected').length;

  // Upcoming Interview Reminders (sorted soonest first)
  const upcomingReminders = applications
    .filter((a) => {
      if (!a.interviewDate || a.status === 'Rejected') return false;
      const days = getDaysUntil(a.interviewDate);
      return days !== null && days >= 0;
    })
    .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Personal Pipeline
          </span>
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
            Placement Application Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Drag and drop applications across stages, inspect details, and stay ahead of upcoming interviews.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openCreateModal('Interested')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </motion.button>
      </div>

      {/* Feedback & Error Alerts */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-rose-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Applications</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all recruitment stages</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Active Applications</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{activeCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Applied, Assessment & Interview</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Interviews Scheduled</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{interviewsScheduledCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active & upcoming rounds</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Offers Received</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{offersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Selected campus offers</p>
        </div>
      </div>

      {/* Upcoming Interview Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>Upcoming Interview & Assessment Reminders ({upcomingReminders.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingReminders.map((rem) => {
              const days = getDaysUntil(rem.interviewDate);
              return (
                <button
                  key={rem.id}
                  type="button"
                  onClick={() => setDetailApp(rem)}
                  className="text-left p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">{rem.companyName}</div>
                    <div className="text-[11px] text-brand-400 truncate">{rem.role}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{formatDateOneLine(rem.interviewDate)}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold whitespace-nowrap shrink-0">
                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search company, role, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {viewMode === 'table' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Stages</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-850 border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'kanban' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Board / Table */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
          {STATUSES.map((colStatus) => {
            const colApps = applications.filter((a) => a.status === colStatus);
            const isDropTarget = dragOverStatus === colStatus;
            const meta = STATUS_META[colStatus];

            return (
              <div
                key={colStatus}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverStatus !== colStatus) setDragOverStatus(colStatus);
                }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStatus(null);
                  const appId = e.dataTransfer.getData('text/plain') || draggingId;
                  setDraggingId(null);
                  if (appId) {
                    const current = applications.find((a) => a.id === appId);
                    if (current && current.status !== colStatus) {
                      handleQuickStatusChange(appId, colStatus);
                    }
                  }
                }}
                className={`min-w-[290px] w-[290px] shrink-0 rounded-2xl p-3.5 flex flex-col gap-3 min-h-[380px] border transition-all ${
                  isDropTarget
                    ? 'bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/40'
                    : `bg-slate-900/90 ${meta.colBorder}`
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className="text-xs font-bold text-white">{colStatus}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-850 text-slate-300 border border-slate-800">
                      {colApps.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => openCreateModal(colStatus)}
                      title={`Add to ${colStatus}`}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Cards or Empty State */}
                <div className="space-y-3 flex-1">
                  {colApps.length === 0 ? (
                    <div className="h-44 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <Briefcase className="w-6 h-6 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-400">
                        No {colStatus.toLowerCase()} applications
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Drag a card here or add a new one
                      </p>
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggingId(app.id);
                          e.dataTransfer.setData('text/plain', app.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverStatus(null);
                        }}
                        onClick={() => setDetailApp(app)}
                        className={`relative p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer space-y-2.5 shadow-sm overflow-visible ${
                          draggingId === app.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        {/* Card Top: Drag handle + Company + Inside Action Menu */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 mt-1 shrink-0 cursor-grab" />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-white text-sm leading-snug truncate">
                                {app.companyName}
                              </h4>
                              <p className="text-xs text-brand-400 font-medium truncate mt-0.5">
                                {app.role}
                              </p>
                            </div>
                          </div>

                          {/* Clean In-Card Action Menu */}
                          <div
                            className="relative shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                              aria-label="Application actions"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenuId === app.id && (
                              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-30">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDetailApp(app);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-brand-400" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openEditModal(app);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeleteTargetId(app.id);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Package & Interview Date */}
                        <div className="flex flex-wrap items-center gap-2">
                          {app.packageLpa && (
                            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
                              ₹{app.packageLpa} LPA
                            </span>
                          )}
                          {app.interviewDate && (
                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{formatDateOneLine(app.interviewDate)}</span>
                            </span>
                          )}
                        </div>

                        {/* Notes Preview */}
                        {app.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {app.notes}
                          </p>
                        )}

                        {/* Card Footer: Single-line Date + Custom Status Selector */}
                        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{formatDateOneLine(app.applicationDate)}</span>
                          </span>

                          <StatusSelector
                            value={app.status}
                            compact
                            onChange={(next) => handleQuickStatusChange(app.id, next)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <Briefcase className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
          <p className="text-sm font-bold text-white">No placement applications match your filter</p>
          <p className="text-xs text-slate-400">Click "Add Application" or clear your search query.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Applied Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Interview Date</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setDetailApp(app)}
                    className="hover:bg-slate-850/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{app.companyName}</div>
                      <span className="text-[11px] text-brand-400">{app.role}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {app.packageLpa ? `₹${app.packageLpa} LPA` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {formatDateOneLine(app.applicationDate)}
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 whitespace-nowrap">
                      {app.interviewDate ? formatDateOneLine(app.interviewDate) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusSelector
                        value={app.status}
                        compact
                        onChange={(next) => handleQuickStatusChange(app.id, next)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{app.notes || '—'}</td>
                    <td
                      className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(app.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Application Slide-Over Panel */}
      <AnimatePresence>
        {detailApp && (
          <div
            onClick={() => setDetailApp(null)}
            className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl"
            >
              {/* Panel Header */}
              <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                    Application Details
                  </span>
                  <h3 className="text-xl font-black text-white truncate">{detailApp.companyName}</h3>
                  <p className="text-xs font-semibold text-brand-300 mt-0.5">{detailApp.role}</p>
                </div>
                <button
                  onClick={() => setDetailApp(null)}
                  aria-label="Close panel"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="font-semibold text-slate-400">Current Stage</span>
                  <StatusSelector
                    value={detailApp.status}
                    onChange={(next) => handleQuickStatusChange(detailApp.id, next)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Package (CTC)</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {detailApp.packageLpa ? `₹${detailApp.packageLpa} LPA` : 'Not specified'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Applied On</span>
                    <span className="text-sm font-bold text-white whitespace-nowrap">
                      {formatDateOneLine(detailApp.applicationDate)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Interview / Assessment Date</span>
                  <span className="text-sm font-bold text-amber-300 flex items-center gap-2 whitespace-nowrap">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    {detailApp.interviewDate ? formatDateOneLine(detailApp.interviewDate) : 'Not scheduled yet'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Application / Career Portal Link</span>
                  {detailApp.applicationLink ? (
                    <a
                      href={detailApp.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1.5 break-all"
                    >
                      <span>{detailApp.applicationLink}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-500">No link added</span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Notes & Preparation Reminders</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {detailApp.notes || 'No notes recorded yet.'}
                  </p>
                </div>
              </div>

              {/* Panel Footer Actions */}
              <div className="p-5 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(detailApp.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(detailApp)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Application</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingApp ? 'Edit Application' : 'Add Placement Application'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep track of deadlines, interview dates, and recruiter links.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Role *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SDE-1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stage</label>
                  <StatusSelector value={status} onChange={(next) => setStatus(next)} />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    placeholder="12.0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Application Date</label>
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Upcoming Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application Link (Optional)</label>
                <input
                  type="url"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  placeholder="https://careers.microsoft.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes & Next Steps</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Online test link, interview topics, recruiter contact..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none resize-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  {editingApp ? 'Update Application' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTargetId}
        title="Remove Application"
        message="Are you sure you want to delete this application from your tracker?"
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
