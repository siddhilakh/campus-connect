import React from 'react';
import {
  HelpCircle,
  GraduationCap,
  ShieldCheck,
  Users,
  Building,
  CheckCircle2,
  FileText,
  Sparkles
} from 'lucide-react';

export const HelpFaqPage: React.FC = () => {
  const teamMembers = [
    { name: 'Shweta Kumari', roll: 'EN24CS3010995', role: 'Project Lead & Full-Stack Integration' },
    { name: 'Siddhi Jain', roll: 'EN24CS3010997', role: 'Frontend & UI/UX Design System' },
    { name: 'Siddhi Lakhotia', roll: 'EN24CS3010998', role: 'Database Architecture & Prisma Schema' },
    { name: 'Shubhi Rajoliya', roll: 'EN24CS3010994', role: 'Backend REST APIs & Quality Assurance' }
  ];

  const faqs = [
    {
      q: 'What is CampusConnect?',
      a: 'CampusConnect is a centralized student opportunity and career enhancement platform designed specifically for institutional placement ecosystems, solving the problem of scattered WhatsApp groups, hearsay interview prep, and unofficial statistics.'
    },
    {
      q: 'Which college is configured in this release?',
      a: 'The platform is initialized for Medi-Caps University, Indore (MCU-IND), with multi-college database isolation support built directly into the schema.'
    },
    {
      q: 'How are passwords and roles secured?',
      a: 'All passwords are automatically salted and hashed with bcryptjs in the database. Client communication uses JWT Bearer tokens with role-based API middleware (RBAC).'
    },
    {
      q: 'How does Senior Connect work?',
      a: 'Juniors can view verified senior interview experiences with round-by-round breakdown (aptitude, technical, LLD, HR). They can bookmark experiences and directly submit questions to seniors, which are delivered to the senior’s private dashboard.'
    },
    {
      q: 'What can Placement Administrators do?',
      a: 'Placement Admins can add and verify official placement offers, register visiting companies, moderate user-submitted interview stories (Approve/Reject/Hide), and maintain statistics.'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
          SRS Experiment No. 02 Compliance
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-1">
          Platform Documentation & Academic Project Guide
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Centralized Student Opportunity and Career Enhancement Platform specifications.
        </p>
      </div>

      {/* Project Group Credits Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Medi-Caps University Project Team</h3>
            <p className="text-xs text-slate-400">Department of Computer Science & Engineering</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {teamMembers.map((m) => (
            <div key={m.roll} className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
              <span className="font-bold text-white text-xs block">{m.name}</span>
              <span className="text-[11px] text-brand-400 font-mono block mt-0.5">{m.roll}</span>
              <span className="text-[10px] text-slate-400 mt-1 block leading-tight">{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SRS Feature Mapping */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>SRS Requirement Traceability Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <span className="font-bold text-brand-300">Feature 1: Placement & Opportunity Intelligence</span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>REQ-1 to 5: Placement statistics, packages, visiting recruiters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>REQ-6 to 9: Search, filtering, admin validation, currency dates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>REQ-12: Privacy-protected charts with Recharts</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <span className="font-bold text-brand-300">Feature 2: Senior Connect & Knowledge Base</span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>REQ-13 to 15: Senior profiles, multi-round interview experiences</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>REQ-16 to 19: Searchable experiences, Q&A discussion threads</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>REQ-20 to 22: Content moderation queue & curated resources</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs">
              <h4 className="font-bold text-white mb-1">{f.q}</h4>
              <p className="text-slate-300 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
