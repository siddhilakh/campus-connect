import React from 'react';
import { ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface DemoAccount {
  role: string;
  roleKey: string;
  email: string;
  pass: string;
  name: string;
  desc: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Student / Junior',
    roleKey: 'STUDENT',
    email: 'student@test.com',
    pass: 'student123',
    name: 'Aarav Sharma',
    desc: 'Explore stats, bookmark experiences, ask questions to seniors',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    role: 'Senior / Alumni',
    roleKey: 'SENIOR',
    email: 'senior@test.com',
    pass: 'senior123',
    name: 'Priya Mehta (Microsoft SDE-1)',
    desc: 'Manage profile, share interview rounds, answer junior queries',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    role: 'Placement Admin',
    roleKey: 'PLACEMENT_ADMIN',
    email: 'admin@test.com',
    pass: 'admin123',
    name: 'Dr. Rajesh Verma (TPO)',
    desc: 'Publish companies, verify placement records, review experiences',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  {
    role: 'System Admin',
    roleKey: 'SYSTEM_ADMIN',
    email: 'superadmin@test.com',
    pass: 'superadmin123',
    name: 'Institutional ERP Admin',
    desc: 'Manage users, assign roles, configure college information',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
];

interface DemoAccountHelperProps {
  onSelect: (email: string, pass: string) => void;
}

export const DemoAccountHelper: React.FC<DemoAccountHelperProps> = ({ onSelect }) => {
  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>One-Click Demo Access</span>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
          <Sparkles className="w-3 h-3" />
          Predefined B.Tech Evaluator
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.roleKey}
            type="button"
            onClick={() => onSelect(acc.email, acc.pass)}
            className="flex flex-col text-left p-2.5 rounded-lg border border-slate-800/80 bg-slate-850/50 hover:bg-slate-800 hover:border-brand-500/40 transition-all duration-150 group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                {acc.role}
              </span>
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-brand-300 flex items-center gap-1">
                Fill <UserCheck className="w-3 h-3" />
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
              {acc.name}
            </span>
            <span className="text-[11px] text-slate-400 truncate font-mono">
              {acc.email}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] text-slate-400 text-center">
        Clicking any account above autofills verified demo credentials for testing.
      </p>
    </div>
  );
};
