import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building,
  Check,
  Search,
  KeyRound,
  Save,
  Server
} from 'lucide-react';
import { api } from '../api/client';
import { User } from '../types';

export const SystemAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [collegeInfo, setCollegeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // College form state
  const [colName, setColName] = useState('');
  const [colAddress, setColAddress] = useState('');
  const [colEmail, setColEmail] = useState('');
  const [colDepts, setColDepts] = useState('');
  const [collegeSavedMsg, setCollegeSavedMsg] = useState('');

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const [uRes, mRes, cRes] = await Promise.all([
        api.getAdminUsers({ role: roleFilter, search: userSearch }),
        api.getAdminMetrics(),
        api.getCollegeInfo()
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (mRes.success) setMetrics(mRes.metrics);
      if (cRes.success && cRes.college) {
        setCollegeInfo(cRes.college);
        setColName(cRes.college.name);
        setColAddress(cRes.college.address);
        setColEmail(cRes.college.placementEmail || '');
        setColDepts(cRes.college.departments);
      }
    } catch (err) {
      console.error('System admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, userSearch]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadData();
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const handleCollegeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollegeSavedMsg('');
    try {
      const res = await api.updateCollegeInfo({
        name: colName,
        address: colAddress,
        placementEmail: colEmail,
        departments: colDepts
      });
      if (res.success) {
        setCollegeSavedMsg('Institutional configuration updated successfully.');
        setTimeout(() => setCollegeSavedMsg(''), 4000);
      }
    } catch (err: any) {
      setCollegeSavedMsg('Error saving college details: ' + err.message);
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
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            System Super Administrator
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Institutional System Control
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Role assignments, multi-college multi-tenancy settings, and platform health.
          </p>
        </div>
      </div>

      {/* System Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.totalUsers || users.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{metrics?.totalStudents || 1} Students · {metrics?.totalSeniors || 2} Seniors</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Active Companies</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.totalCompanies || 6}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Campus drives on platform</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Verified Offers</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.totalVerifiedPlacements || 8}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">In institutional database</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Interview Experiences</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.totalExperiences || 2}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Round breakdowns published</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: User Role Management (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>User Directory & Role Authorization</span>
                </h3>
                <p className="text-xs text-slate-400">Manage demo access, roles, and platform permissions</p>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="SENIOR">Senior</option>
                <option value="PLACEMENT_ADMIN">Placement Admin</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Name & Email</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Role Modifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {u.department || 'General'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.role === 'SYSTEM_ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          u.role === 'PLACEMENT_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          u.role === 'SENIOR' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="SENIOR">SENIOR</option>
                          <option value="PLACEMENT_ADMIN">PLACEMENT_ADMIN</option>
                          <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: College Configuration (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              <span>College Institutional Settings</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure institution profile and departments.
            </p>

            {collegeSavedMsg && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                {collegeSavedMsg}
              </div>
            )}

            <form onSubmit={handleCollegeSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">College Name</label>
                <input
                  type="text"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campus Address</label>
                <textarea
                  rows={2}
                  value={colAddress}
                  onChange={(e) => setColAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Placement Cell Official Email</label>
                <input
                  type="email"
                  value={colEmail}
                  onChange={(e) => setColEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Configured Departments</label>
                <textarea
                  rows={3}
                  value={colDepts}
                  onChange={(e) => setColDepts(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save College Settings</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
