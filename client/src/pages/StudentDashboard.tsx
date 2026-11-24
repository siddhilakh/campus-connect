import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  TrendingUp,
  Award,
  ArrowUpRight,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PlacementStatistics, PlacementRecord, Company } from '../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlacementStatistics | null>(null);
  const [records, setRecords] = useState<PlacementRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, recordsRes, companiesRes] = await Promise.all([
          api.getPlacementStats(),
          api.getPlacementRecords({ batch: 'ALL' }),
          api.getCompanies({ status: 'ACTIVE' })
        ]);

        if (statsRes.success) setStats(statsRes.statistics);
        if (recordsRes.success) setRecords(recordsRes.records.slice(0, 6));
        if (companiesRes.success) setCompanies(companiesRes.companies.slice(0, 4));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Trend data for batch-wise placement rate
  const batchTrends = [
    { year: '2022', placementPct: 68.5, avgPkg: 5.2 },
    { year: '2023', placementPct: 76.0, avgPkg: 5.8 },
    { year: '2024', placementPct: 84.2, avgPkg: 6.5 },
    { year: '2025', placementPct: 88.2, avgPkg: 6.85 },
    { year: '2026 (Live)', placementPct: 74.45, avgPkg: 7.45 },
  ];

  const pieColors = ['#6366f1', '#38bdf8', '#34d399', '#f59e0b'];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Loading placement insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              Student Career Intelligence
            </span>
            <span className="text-xs text-slate-400">· {user?.department || 'Computer Science & Engineering'}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Explore verified placement statistics, preparation guides, and real interview rounds shared by seniors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/senior-connect"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-colors"
          >
            <span>Ask a Senior</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/companies"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            View Drives
          </Link>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Package */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Highest Package</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats?.highestPackageLpa || 44.0} LPA
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Microsoft Azure · Super Dream Offer
          </p>
        </div>

        {/* Average Package */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Average Package</span>
            <Award className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats?.averagePackageLpa || 7.45} LPA
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ↑ 8.7% higher than previous batch
          </p>
        </div>

        {/* Placed Students */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Students Placed</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.placedStudents || 685}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Out of {stats?.eligibleStudents || 920} eligible candidates ({stats?.placementPercentage || 74.45}%)
          </p>
        </div>

        {/* Visiting Companies */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Recruiting Companies</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.totalCompaniesVisited || 68}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tier 1 & Super Dream on-campus drives
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Rate & Average Package Trends (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Batch Placement Rate & Package Trend</h3>
              <p className="text-xs text-slate-400">Year-on-year placement percentage and compensation growth</p>
            </div>
            <span className="text-[11px] text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20 font-semibold">
              Official TPO Data
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={batchTrends}>
                <defs>
                  <linearGradient id="placementGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[40, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="placementPct"
                  name="Placement %"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#placementGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Placement Breakdown (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Department Wise Placements</h3>
                <p className="text-xs text-slate-400">Placement percentage by branch</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.departmentBreakdown || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
                  <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="percentage" name="Placed %" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Offers + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Verified Placement Activity (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Recent Verified Offers</h3>
              <p className="text-xs text-slate-400">Latest campus recruitment milestones confirmed by the cell</p>
            </div>
            <Link to="/companies" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              View all records <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Company & Tier</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Package</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">
                      <div>{r.studentName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{r.department}</span>
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-white">{r.company?.name || 'Recruiter'}</div>
                      <span className="text-[10px] text-brand-400">{r.company?.tier || 'Tier 1'}</span>
                    </td>
                    <td className="py-3 text-slate-300">{r.role}</td>
                    <td className="py-3 font-bold text-emerald-400 font-mono">
                      ₹{r.packageLpa} LPA
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Career Actions & Resources (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-sm text-white mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                to="/senior-connect"
                className="w-full p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span className="font-semibold">Browse Senior Experiences</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-300 transition-colors" />
              </Link>

              <Link
                to="/companies"
                className="w-full p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold">Visiting Company Directory</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-300 transition-colors" />
              </Link>

              <Link
                to="/resources"
                className="w-full p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">DSA & Aptitude Sheet</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Featured Upcoming Company Drive */}
          {companies.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
                <Building2 className="w-4 h-4" />
                <span>Featured On-Campus Drive</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">{companies[0].name}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                {companies[0].rolesOffered}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">{companies[0].packageRange}</span>
                <Link
                  to="/companies"
                  className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  View criteria <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
