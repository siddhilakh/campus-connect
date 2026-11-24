import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Archive,
  BarChart2
} from 'lucide-react';
import { api } from '../api/client';
import { Company, PlacementRecord, InterviewExperience } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const PlacementAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'records' | 'companies' | 'moderation'>('records');
  const [records, setRecords] = useState<PlacementRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [moderationQueue, setModerationQueue] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [recordSearch, setRecordSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');

  // Modals
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'record' | 'company'; id: string } | null>(null);

  // Add Record Form State
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [batch, setBatch] = useState('2025');
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [recordError, setRecordError] = useState('');

  // Add Company Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & IT Services');
  const [tier, setTier] = useState('Tier 1');
  const [rolesOffered, setRolesOffered] = useState('');
  const [eligibility, setEligibility] = useState('B.Tech 60%+ aggregate');
  const [pkgRange, setPkgRange] = useState('₹4.5 - ₹8.0 LPA');
  const [compError, setCompError] = useState('');

  const loadData = async () => {
    try {
      const [recRes, compRes, modRes] = await Promise.all([
        api.getPlacementRecords({ batch: batchFilter, search: recordSearch }),
        api.getCompanies(),
        api.getModerationQueue()
      ]);

      if (recRes.success) setRecords(recRes.records);
      if (compRes.success) {
        setCompanies(compRes.companies);
        if (compRes.companies.length > 0 && !companyId) {
          setCompanyId(compRes.companies[0].id);
        }
      }
      if (modRes.success) setModerationQueue(modRes.experiences);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [batchFilter, recordSearch]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError('');

    if (!studentName || !rollNumber || !companyId || !role || !packageLpa) {
      setRecordError('Please provide all mandatory fields.');
      return;
    }

    try {
      const res = await api.createPlacementRecord({
        studentName,
        rollNumber,
        department,
        batch,
        companyId,
        role,
        packageLpa: parseFloat(packageLpa),
        source: 'Official Campus Recruitment Cell'
      });

      if (res.success) {
        setIsAddRecordOpen(false);
        setStudentName('');
        setRollNumber('');
        setRole('');
        setPackageLpa('');
        loadData();
      }
    } catch (err: any) {
      setRecordError(err.message || 'Failed to add record.');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompError('');

    if (!companyName || !rolesOffered || !pkgRange) {
      setCompError('Please enter company name, roles offered, and package range.');
      return;
    }

    try {
      const res = await api.createCompany({
        name: companyName,
        industry,
        tier,
        rolesOffered,
        eligibilityCriteria: eligibility,
        packageRange: pkgRange
      });

      if (res.success) {
        setIsAddCompanyOpen(false);
        setCompanyName('');
        setRolesOffered('');
        loadData();
      }
    } catch (err: any) {
      setCompError(err.message || 'Failed to create company.');
    }
  };

  const handleVerifyRecord = async (id: string) => {
    try {
      await api.verifyPlacementRecord(id);
      loadData();
    } catch (err) {
      console.error('Verify failed:', err);
    }
  };

  const handleModerateExperience = async (id: string, status: string) => {
    try {
      await api.moderateExperience(id, status);
      loadData();
    } catch (err) {
      console.error('Moderation error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'record') {
        await api.deletePlacementRecord(deleteTarget.id);
      } else {
        await api.deleteCompany(deleteTarget.id);
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            Official Placement Administrator
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Training & Placement Cell Operations
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage official placement records, visiting companies, and content moderation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddRecordOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Placement Offer</span>
          </button>
          <button
            onClick={() => setIsAddCompanyOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'records'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Placement Records ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'companies'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Visiting Companies ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'moderation'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Experience Moderation Queue ({moderationQueue.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student, roll number, or role..."
                value={recordSearch}
                onChange={(e) => setRecordSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold">Batch:</span>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none"
              >
                <option value="ALL">All Batches</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role & Batch</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{r.studentName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{r.rollNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{r.company?.name}</div>
                      <span className="text-[10px] text-brand-400">{r.company?.tier}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{r.role}</div>
                      <span className="text-[10px] text-slate-400">Batch {r.batch}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{r.packageLpa} LPA
                    </td>
                    <td className="py-3 px-4">
                      {r.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyRecord(r.id)}
                          className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                        >
                          Verify Now
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteTarget({ type: 'record', id: r.id })}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{c.name}</h4>
                  <span className="text-[10px] font-semibold text-brand-400">{c.tier}</span>
                </div>
                <button
                  onClick={() => setDeleteTarget({ type: 'company', id: c.id })}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">{c.description}</p>
              <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Package:</span>
                  <span className="text-emerald-400 font-mono font-bold">{c.packageRange}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Roles:</span>
                  <span className="text-slate-200 truncate max-w-[180px]">{c.rolesOffered}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {moderationQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No interview experiences pending moderation. All contributions are up to date!
            </div>
          ) : (
            moderationQueue.map((exp) => (
              <div key={exp.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{exp.company?.name} · {exp.role}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        exp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Submitted by: {exp.author?.name} {exp.author?.email ? `(${exp.author.email})` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModerateExperience(exp.id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => handleModerateExperience(exp.id, 'HIDDEN')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Hide
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{exp.overallSummary}</p>
                <div className="text-[11px] text-slate-400">
                  <span>Strategy: {exp.preparationStrategy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Placement Record Modal */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Verified Placement Record</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter official placement offer details into the institutional database.
            </p>

            {recordError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {recordError}
              </div>
            )}

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Shweta Kumari"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll / Enrollment No</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="EN24CS3010995"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Graduation Batch</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    placeholder="7.5"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRecordOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Save Placement Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Register Visiting Company</h3>
            <p className="text-xs text-slate-400 mb-4">
              Publish a new recruiter and on-campus recruitment drive details.
            </p>

            {compError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {compError}
              </div>
            )}

            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Cisco Systems"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Super Dream">Super Dream (₹15+ LPA)</option>
                    <option value="Dream">Dream (₹8 - 15 LPA)</option>
                    <option value="Tier 1">Tier 1 (₹4 - 8 LPA)</option>
                    <option value="Core Engineering">Core Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Roles Offered</label>
                <input
                  type="text"
                  value={rolesOffered}
                  onChange={(e) => setRolesOffered(e.target.value)}
                  placeholder="Software Engineer, Cloud Analyst"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Package Range</label>
                <input
                  type="text"
                  value={pkgRange}
                  onChange={(e) => setPkgRange(e.target.value)}
                  placeholder="₹14.0 - ₹24.0 LPA"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'record' ? 'Placement Record' : 'Company'}`}
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Confirm Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
