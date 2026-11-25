import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  BookOpen,
  Award,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { Company } from '../types';
import { Link } from 'react-router-dom';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await api.getCompanies({
        search,
        tier: tierFilter,
        status: statusFilter
      });
      if (res.success) setCompanies(res.companies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, tierFilter, statusFilter]);

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await api.getCompany(id);
      if (res.success) setSelectedCompany(res.company);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Visiting Companies & Recruitment Drives</h2>
        <p className="text-xs text-slate-300 mt-1">
          Explore campus recruiters, eligibility criteria, CTC package brackets, and past placement milestones.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search company name, roles, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="Super Dream">Super Dream (₹15+ LPA)</option>
              <option value="Dream">Dream (₹8 - 15 LPA)</option>
              <option value="Tier 1">Tier 1 (₹4 - 8 LPA)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Drives</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          <Building2 className="w-12 h-12 mx-auto text-slate-600 mb-3 opacity-40" />
          <p className="text-sm font-bold text-white">No matching companies found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                      alt={c.name}
                      className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{c.industry}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    c.tier === 'Super Dream' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    c.tier === 'Dream' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {c.tier}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {c.description}
                </p>

                <div className="space-y-2 text-xs pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Package CTC:</span>
                    <span className="text-emerald-400 font-mono font-bold">{c.packageRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Roles:</span>
                    <span className="text-slate-200 truncate max-w-[160px] font-medium">{c.rolesOffered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Eligibility:</span>
                    <span className="text-slate-200 truncate max-w-[160px]">{c.eligibilityCriteria}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {c._count?.experiences || 0} Senior Stories
                </span>
                <button
                  onClick={() => handleOpenDetail(c.id)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600/10 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Company Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div
          onClick={() => setSelectedCompany(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCompany.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                  alt={selectedCompany.name}
                  className="w-14 h-14 rounded-2xl object-contain bg-white p-1.5 border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedCompany.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {selectedCompany.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedCompany.industry} · Batch {selectedCompany.batch}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                aria-label="Close modal"
                title="Close"
                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {selectedCompany.description}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs mb-6">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Package Bracket</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{selectedCompany.packageRange}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Eligibility Criteria</span>
                <span className="text-slate-200 font-medium">{selectedCompany.eligibilityCriteria}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Eligible Branches</span>
                <span className="text-slate-200">{selectedCompany.allowedBranches}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Minimum CGPA</span>
                <span className="text-slate-200">{selectedCompany.minCgpa || 6.0}</span>
              </div>
            </div>

            {/* Senior Interview Experiences for this Company */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  <span>Senior Interview Experiences ({selectedCompany.experiences?.length || 0})</span>
                </h4>
                <Link
                  to="/senior-connect"
                  onClick={() => setSelectedCompany(null)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  View in Senior Connect <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {selectedCompany.experiences && selectedCompany.experiences.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {selectedCompany.experiences.map((exp) => (
                    <div key={exp.id} className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{exp.role}</span>
                        <span className="text-emerald-400 font-bold">{exp.outcome}</span>
                      </div>
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">{exp.overallSummary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No interview experiences posted yet for this recruiter.
                </p>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
