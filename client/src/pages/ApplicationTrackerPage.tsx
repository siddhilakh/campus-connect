import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  CheckCircle
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

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Interested: 'bg-slate-800 text-slate-300 border-slate-700',
  Applied: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  Assessment: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  Interview: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Selected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/25'
};

export const ApplicationTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<PlacementApplication | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Interested');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [packageLpa, setPackageLpa] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      const res = await api.getApplications({ search, status: statusFilter });
      if (res.success) setApplications(res.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [search, statusFilter]);

  const openCreateModal = () => {
    setEditingApp(null);
    setCompanyName('');
    setRole('');
    setStatus('Interested');
    setApplicationDate(new Date().toISOString().split('T')[0]);
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

    try {
      if (editingApp) {
        await api.updateApplication(editingApp.id, {
          companyName,
          role,
          status,
          applicationDate,
          packageLpa: packageLpa ? parseFloat(packageLpa) : null,
          notes
        });
        setFeedbackMsg('Application updated successfully.');
      } else {
        await api.createApplication({
          companyName,
          role,
          status,
          applicationDate,
          packageLpa: packageLpa ? parseFloat(packageLpa) : null,
          notes
        });
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
    try {
      await api.updateApplication(id, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteApplication(deleteTargetId);
      setDeleteTargetId(null);
      loadApplications();
    } catch (err) {
      console.error(err);
    }
  };

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
            Track your campus drives from Interested to Selected with Kanban & Table views.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </motion.button>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
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
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-850 border border-slate-800">
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

      {/* Content */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <Briefcase className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
          <p className="text-sm font-bold text-white">No placement applications tracked yet</p>
          <p className="text-xs text-slate-400">Click "Add Application" to start tracking your campus drives.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATUSES.map((colStatus) => {
            const colApps = applications.filter((a) => a.status === colStatus);
            return (
              <div key={colStatus} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3 min-h-[260px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[colStatus]}`}>
                    {colStatus}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{colApps.length}</span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colApps.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      whileHover={{ y: -2 }}
                      className="p-3 rounded-xl bg-slate-850 border border-slate-800 hover:border-brand-500/40 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="font-bold text-white leading-tight">{app.companyName}</h4>
                          <p className="text-[11px] text-brand-400 font-medium">{app.role}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal(app)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(app.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {app.packageLpa && (
                        <span className="inline-block text-[10px] font-mono font-bold text-emerald-400">
                          ₹{app.packageLpa} LPA
                        </span>
                      )}

                      {app.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {app.notes}
                        </p>
                      )}

                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(app.applicationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-200 px-1.5 py-0.5 focus:outline-none"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Application Date</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{app.companyName}</div>
                      <span className="text-[11px] text-brand-400">{app.role}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {app.packageLpa ? `₹${app.packageLpa} LPA` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(app.applicationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-900 focus:outline-none ${STATUS_STYLES[app.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{app.notes || '—'}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(app.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingApp ? 'Edit Application' : 'Add Placement Application'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Keep track of your deadlines, rounds, and recruiter notes.
            </p>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SDE-1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    placeholder="12.0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes & Next Steps</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Online test link, interview topics, recruiter contact..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none resize-none"
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
