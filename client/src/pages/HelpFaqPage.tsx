import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Users,
  Briefcase,
  Target,
  BrainCircuit,
  Search,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

export const HelpFaqPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const guides = [
    {
      title: 'Placement Analytics & Companies',
      desc: 'Explore verified campus recruitment drives, eligibility criteria, CTC brackets, and batch-wise placement trends.',
      icon: Briefcase,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20'
    },
    {
      title: 'Senior Connect & Mentorship',
      desc: 'Read round-by-round interview experiences, ask questions, bookmark helpful stories, and request 1-on-1 mentorship.',
      icon: Users,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Readiness & Application Trackers',
      desc: 'Monitor your preparation across core pillars and manage your job applications across every hiring stage.',
      icon: Target,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Practice Zone & Resources',
      desc: 'Practice Aptitude, Technical MCQs, SQL, and DSA with instant explanations and curated study roadmaps.',
      icon: BrainCircuit,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    }
  ];

  const faqs = [
    {
      q: 'What is CampusConnect?',
      a: 'CampusConnect is a centralized career and placement intelligence platform designed to bring together verified placement statistics, company drive details, senior interview experiences, mentorship, and preparation tools in one workspace.'
    },
    {
      q: 'How does Senior Connect work?',
      a: 'Students can browse verified interview experiences with round-by-round breakdowns, filter by company, role, batch, or difficulty, vote on helpful stories, bookmark them, ask questions directly to seniors, and send mentorship requests.'
    },
    {
      q: 'How do I track my job applications and interview dates?',
      a: 'Open the Application Tracker from the sidebar. You can add companies, drag and drop cards across stages (Interested, Applied, Assessment, Interview, Selected, Rejected), set upcoming interview dates, and view reminders on your dashboard.'
    },
    {
      q: 'How is my Placement Readiness Score calculated?',
      a: 'Your overall readiness percentage is averaged across five pillars: Quantitative Aptitude, DSA, Core CS Subjects, Communication & HR, and Resume & Portfolio. You can update each pillar anytime in the Readiness Tracker.'
    },
    {
      q: 'What can Placement Administrators do?',
      a: 'Placement Administrators can register visiting companies, add and verify official student placement records, and review or moderate submitted interview experiences from the Placement Cell Portal.'
    },
    {
      q: 'How is account security handled?',
      a: 'All passwords are encrypted using bcrypt hashing, and every API request is authenticated using signed JWT tokens with strict role-based access control.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
          Support Center
        </span>
        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
          Help & Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Everything you need to know about navigating CampusConnect, tracking placements, and connecting with mentors.
        </p>
      </div>

      {/* Quick Feature Guides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${g.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{g.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredFaqs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No matching help articles found. Try a different search term.
            </p>
          ) : (
            filteredFaqs.map((f, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  className="rounded-xl bg-slate-850/80 border border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-bold text-white text-xs sm:text-sm">{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-brand-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security & Support Note */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Need institutional account assistance? Contact your Campus Placement Cell administrator.</span>
        </div>
        <span className="text-slate-500 whitespace-nowrap">CampusConnect Platform</span>
      </div>
    </div>
  );
};
