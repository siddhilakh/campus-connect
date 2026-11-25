import React, { useState, useEffect } from 'react';
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
  Cell,
  Legend
} from 'recharts';
import { BarChart3, Building2, TrendingUp, Briefcase, Info } from 'lucide-react';
import { api } from '../api/client';
import { PlacementAnalytics } from '../types';

const COLORS = ['#6366f1', '#38bdf8', '#34d399', '#f59e0b', '#ec4899', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<PlacementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getPlacementAnalytics();
        if (res.success) setAnalytics(res.analytics);
      } catch (err: any) {
        setError(err.message || 'Failed to load placement analytics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center text-rose-400 text-sm">{error || 'No analytics data available.'}</div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header + Seeded Demo Data Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Institutional Placement Intelligence
          </span>
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
            Placement Analytics & Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Package distribution, multi-year placement trends, company-wise selections, and role compensation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{analytics.dataLabel}</span>
        </div>
      </div>

      {/* Row 1: Placement Trends + Package Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <span>Academic Batch Placement Trends</span>
              </h3>
              <p className="text-xs text-slate-400">Placement % & Average CTC (LPA) across batches</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.placementTrends}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="placementPercentage"
                  name="Placement %"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fill="url(#trendGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="averagePackageLpa"
                  name="Avg Package (LPA)"
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={0.15}
                  fill="#34d399"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Package Distribution (CTC Brackets)</span>
            </h3>
            <p className="text-xs text-slate-400">Student offer distribution across compensation tiers</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.packageDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {analytics.packageDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Company-Wise Selections + Role-Wise Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Company-Wise Selections (Verified Records)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Computed live from {analytics.totalVerifiedOffers} verified placement records
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.companySelections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="company" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
                <Bar dataKey="selections" name="Students Selected" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>Role-Wise Package Statistics (LPA)</span>
            </h3>
            <p className="text-xs text-slate-400">Average & highest offered CTC per job role</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.roleStatistics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} unit=" LPA" />
                <YAxis dataKey="role" type="category" stroke="#cbd5e1" fontSize={10} width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="avgPackageLpa" name="Avg Package (LPA)" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
