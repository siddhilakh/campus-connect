import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Compass,
  Briefcase,
  ShieldAlert,
  HelpCircle,
  User,
  LogOut,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const isStudent = user.role === 'STUDENT';
  const isSenior = user.role === 'SENIOR';
  const isPlacementAdmin = user.role === 'PLACEMENT_ADMIN';
  const isSystemAdmin = user.role === 'SYSTEM_ADMIN';

  const roleBadge = () => {
    switch (user.role) {
      case 'STUDENT':
        return { label: 'Student', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'SENIOR':
        return { label: 'Senior Mentor', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'PLACEMENT_ADMIN':
        return { label: 'Placement Cell', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'SYSTEM_ADMIN':
        return { label: 'System Admin', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: user.role, color: 'bg-slate-800 text-slate-300' };
    }
  };

  const badge = roleBadge();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-30 select-none">
      {/* College & Brand Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight text-white font-sans">
              Campus<span className="text-brand-400">Connect</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              <span>Medi-Caps University</span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Dashboards */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </span>
          <div className="mt-2 space-y-1">
            {isStudent && (
              <NavLink
                to="/student-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Student Overview</span>
              </NavLink>
            )}

            {isSenior && (
              <NavLink
                to="/senior-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Senior Dashboard</span>
              </NavLink>
            )}

            {(isPlacementAdmin || isSystemAdmin) && (
              <NavLink
                to="/admin/manage-placements"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Briefcase className="w-4 h-4" />
                <span>Placement Cell Portal</span>
              </NavLink>
            )}

            {isSystemAdmin && (
              <NavLink
                to="/admin/system"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4" />
                <span>System Administration</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Discovery & Opportunities */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Opportunities & Prep
          </span>
          <div className="mt-2 space-y-1">
            <NavLink
              to="/companies"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              <span>Companies & Drives</span>
            </NavLink>

            <NavLink
              to="/senior-connect"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Senior Connect & Experiences</span>
            </NavLink>

            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>Preparation Resources</span>
            </NavLink>
          </div>
        </div>

        {/* Account & Help */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account & Support
          </span>
          <div className="mt-2 space-y-1">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </NavLink>

            <NavLink
              to="/help"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & SRS Specs</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Bottom Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
