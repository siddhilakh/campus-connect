import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  BookOpen,
  Bookmark,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Send,
  X,
  CheckCircle,
  BadgeCheck,
  Calendar,
  ThumbsUp,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../api/client';
import { InterviewExperience, User, Company, Question } from '../types';

export const SeniorConnectPage: React.FC = () => {
  const navigate = useNavigate();

  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [seniors, setSeniors] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'experiences' | 'seniors' | 'ask'>('experiences');

  // Search & Advanced Filters
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [interviewTypeFilter, setInterviewTypeFilter] = useState('ALL');

  // Ask a Senior Modal (for Mentors tab)
  const [askModalSenior, setAskModalSenior] = useState<User | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Ask a Senior Tab Form
  const [tabSeniorId, setTabSeniorId] = useState('');
  const [tabTitle, setTabTitle] = useState('');
  const [tabContent, setTabContent] = useState('');
  const [tabSubmitting, setTabSubmitting] = useState(false);
  const [tabSuccess, setTabSuccess] = useState('');
  const [tabError, setTabError] = useState('');

  const loadData = async () => {
    try {
      const [expRes, senRes, compRes, qRes] = await Promise.all([
        api.getExperiences({
          search,
          companyId: companyFilter,
          batch: batchFilter,
          role: roleFilter,
          difficulty: difficultyFilter,
          interviewType: interviewTypeFilter
        }),
        api.getSeniors({ search }),
        api.getCompanies(),
        api.getQuestions()
      ]);

      if (expRes.success) setExperiences(expRes.experiences);
      if (senRes.success) {
        setSeniors(senRes.seniors);
        if (senRes.seniors.length > 0 && !tabSeniorId) {
          setTabSeniorId(senRes.seniors[0].id);
        }
      }
      if (compRes.success) setCompanies(compRes.companies);
      if (qRes.success) setQuestions(qRes.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, companyFilter, batchFilter, roleFilter, difficultyFilter, interviewTypeFilter]);

  const resetFilters = () => {
    setSearch('');
    setCompanyFilter('ALL');
    setBatchFilter('ALL');
    setRoleFilter('ALL');
    setDifficultyFilter('ALL');
    setInterviewTypeFilter('ALL');
  };

  const hasActiveFilters =
    search !== '' ||
    companyFilter !== 'ALL' ||
    batchFilter !== 'ALL' ||
    roleFilter !== 'ALL' ||
    difficultyFilter !== 'ALL' ||
    interviewTypeFilter !== 'ALL';

  const handleToggleBookmark = async (expId: string) => {
    try {
      const res = await api.toggleBookmark(expId);
      if (res.success) {
        setExperiences((prev) =>
          prev.map((e) =>
            e.id === expId
              ? {
                  ...e,
                  isBookmarked: res.isBookmarked,
                  _count: {
                    questions: e._count?.questions || 0,
                    bookmarks: res.bookmarkCount ?? (e._count?.bookmarks || 0) + (res.isBookmarked ? 1 : -1),
                    helpfulVotes: e._count?.helpfulVotes
                  }
                }
              : e
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHelpful = async (expId: string) => {
    try {
      const res = await api.toggleHelpful(expId);
      if (res.success) {
        setExperiences((prev) =>
          prev.map((e) =>
            e.id === expId
              ? {
                  ...e,
                  isHelpful: res.isHelpful,
                  helpfulCount: res.helpfulCount
                }
              : e
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askModalSenior || !modalTitle.trim() || !modalContent.trim()) {
      setModalError('Please fill in both title and question details.');
      return;
    }

    try {
      const res = await api.askQuestion({
        seniorId: askModalSenior.id,
        title: modalTitle,
        content: modalContent
      });
      if (res.success) {
        setModalSuccess('Your question has been sent! You will be notified when they reply.');
        loadData();
        setTimeout(() => {
          setAskModalSenior(null);
          setModalTitle('');
          setModalContent('');
          setModalSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to send question.');
    }
  };

  const handleTabAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabSeniorId || !tabTitle.trim() || !tabContent.trim()) {
      setTabError('Please select a senior and fill in your question.');
      return;
    }

    setTabSubmitting(true);
    setTabError('');
    setTabSuccess('');
    try {
      const res = await api.askQuestion({
        seniorId: tabSeniorId,
        title: tabTitle,
        content: tabContent
      });
      if (res.success) {
        setTabSuccess('Question posted! The senior has been notified and will respond soon.');
        setTabTitle('');
        setTabContent('');
        loadData();
      }
    } catch (err: any) {
      setTabError(err.message || 'Failed to post question.');
    } finally {
      setTabSubmitting(false);
    }
  };

  const tabs = [
    {
      id: 'experiences' as const,
      label: 'Interview Experiences',
      count: experiences.length,
      icon: BookOpen,
      hint: 'Round-by-round stories'
    },
    {
      id: 'seniors' as const,
      label: 'Senior Mentors',
      count: seniors.length,
      icon: Users,
      hint: 'Placed alumni directory'
    },
    {
      id: 'ask' as const,
      label: 'Ask a Senior',
      count: questions.length,
      icon: MessageSquare,
      hint: 'Interactive Q&A hub'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peer-Verified Placement Intelligence</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Senior Connect & Interview Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Filter verified interview breakdowns by company, role, batch, difficulty, or connect 1-on-1 with placed seniors.
          </p>
        </div>
      </div>

      {/* Informative Interactive Tabs + Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* 3 Informative Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 rounded-xl text-left transition-colors flex items-center gap-3 border ${
                    isActive
                      ? 'text-white border-brand-500/50'
                      : 'text-slate-400 hover:text-white bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="seniorConnectActiveTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl shadow-lg shadow-brand-600/25"
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                          {tab.count}
                        </span>
                      </div>
                      <span className={`text-[10px] block ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {tab.hint}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Search & Filter Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search company, topics, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {activeTab === 'experiences' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  showFilters
                    ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                    : 'bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Advanced Multi-Faceted Filters Bar */}
        <AnimatePresence>
          {activeTab === 'experiences' && showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Company Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Company
                  </label>
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="ALL">All Companies</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch / Year Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Batch / Year
                  </label>
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="ALL">All Batches</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2024">2024 Batch</option>
                    <option value="2023">2023 Batch</option>
                    <option value="2022">2022 Batch</option>
                  </select>
                </div>

                {/* Job Role Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Job Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="Software">Software / SDE</option>
                    <option value="Digital">TCS Digital / Prime</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Cloud">Cloud Engineer</option>
                  </select>
                </div>

                {/* Difficulty Level Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Interview Type Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Interview Type
                  </label>
                  <select
                    value={interviewTypeFilter}
                    onChange={(e) => setInterviewTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="ALL">All Types</option>
                    <option value="On-Campus">On-Campus</option>
                    <option value="Off-Campus">Off-Campus</option>
                    <option value="PPO">PPO</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className="w-full py-2 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TAB 1: INTERVIEW EXPERIENCES */}
      {activeTab === 'experiences' && (
        <>
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : experiences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3"
            >
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
              <p className="text-sm font-bold text-white">No interview experiences match your filters</p>
              <p className="text-xs text-slate-400">Try clearing some filters or searching a different keyword.</p>
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Reset All Filters
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 flex flex-col justify-between transition-colors shadow-lg space-y-4"
                >
                  <div>
                    {/* Top Row: Company + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{exp.company?.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {exp.outcome}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-850 text-slate-300 border border-slate-700">
                            {exp.interviewType || 'On-Campus'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            exp.difficulty === 'Hard'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : exp.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {exp.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-brand-400 font-semibold mt-0.5">
                          {exp.role} · Batch {exp.batch} {exp.packageLpa ? `· ₹${exp.packageLpa} LPA` : ''}
                        </p>
                      </div>

                      {/* Bookmark Button with Count */}
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleBookmark(exp.id)}
                        className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors shrink-0 ${
                          exp.isBookmarked
                            ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                            : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={exp.isBookmarked ? 'Bookmarked' : 'Bookmark this experience'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${exp.isBookmarked ? 'fill-current' : ''}`} />
                        <span>{exp._count?.bookmarks || 0}</span>
                      </motion.button>
                    </div>

                    {/* Preview Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                      {exp.overallSummary}
                    </p>

                    {/* Round overview pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {exp.rounds?.map((r, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-850 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                        >
                          R{r.roundNumber}: {r.roundName}
                        </span>
                      ))}
                    </div>

                    {/* Topics Tested (Clean wrap, readable) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Topics:</span>
                      {exp.topicsCovered.split(',').slice(0, 4).map((t, i) => (
                        <span key={i} className="bg-slate-850/90 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {t.trim()}
                        </span>
                      ))}
                      {exp.topicsCovered.split(',').length > 4 && (
                        <span className="text-brand-400 font-semibold">
                          +{exp.topicsCovered.split(',').length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Credibility Footer */}
                  <div className="pt-3.5 border-t border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <img
                          src={exp.author?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60'}
                          alt={exp.author?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-200">{exp.author?.name}</span>
                        {exp.isVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full border border-sky-500/20">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Helpful Vote Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleToggleHelpful(exp.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          exp.isHelpful
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${exp.isHelpful ? 'fill-current' : ''}`} />
                        <span>Helpful ({exp.helpfulCount || 0})</span>
                      </motion.button>

                      {/* Read Full Rounds -> Dedicated Page */}
                      <motion.button
                        whileHover={{ scale: 1.04, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/senior-connect/experiences/${exp.id}`)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all"
                      >
                        <span>Read Full Rounds</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SENIOR MENTORS */}
      {activeTab === 'seniors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {seniors.map((senior, idx) => (
            <motion.div
              key={senior.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 flex flex-col justify-between transition-colors space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={senior.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt={senior.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-base">{senior.name}</h3>
                      <BadgeCheck className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-xs font-semibold text-brand-400">
                      {senior.seniorProfile?.currentCompany} · {senior.seniorProfile?.jobRole}
                    </p>
                    <p className="text-[10px] text-slate-400">{senior.department} · Batch {senior.batch}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {senior.seniorProfile?.bio}
                </p>

                <div className="text-[11px] text-slate-400 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-0.5">Mentorship Areas:</span>
                  <span>{senior.seniorProfile?.expertiseTopics}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {senior.seniorProfile?.linkedinUrl ? (
                  <a
                    href={senior.seniorProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Verified Mentor</span>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setAskModalSenior(senior);
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Question</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* TAB 3: ASK A SENIOR (Interactive Q&A Hub) */}
      {activeTab === 'ask' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ask Form (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 h-fit"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-400" />
                <span>Ask a Placed Senior</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send a direct question about interviews, resumes, or preparation strategy.
              </p>
            </div>

            {tabSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{tabSuccess}</span>
              </div>
            )}
            {tabError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {tabError}
              </div>
            )}

            <form onSubmit={handleTabAskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Senior Mentor</label>
                <select
                  value={tabSeniorId}
                  onChange={(e) => setTabSeniorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                >
                  {seniors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.seniorProfile?.currentCompany} · {s.seniorProfile?.jobRole})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Title</label>
                <input
                  type="text"
                  value={tabTitle}
                  onChange={(e) => setTabTitle(e.target.value)}
                  placeholder="e.g. How to balance DSA and semester exams?"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Question</label>
                <textarea
                  rows={4}
                  value={tabContent}
                  onChange={(e) => setTabContent(e.target.value)}
                  placeholder="Share your current background and specific doubt..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={tabSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{tabSubmitting ? 'Sending...' : 'Submit Question to Senior'}</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Right: Community Q&A Feed (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Recent Senior–Junior Q&A Threads ({questions.length})
              </h3>
            </div>

            {questions.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No questions posted yet. Use the form on the left to ask the first question!
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{q.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Asked by <span className="text-slate-200 font-semibold">{q.student?.name}</span> to{' '}
                          <span className="text-brand-400 font-semibold">{q.senior?.name}</span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        q.isAnswered
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {q.isAnswered ? 'Answered' : 'Awaiting Reply'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{q.content}</p>

                    {q.answers && q.answers.length > 0 && (
                      <div className="pt-2 pl-4 border-l-2 border-brand-500/50 space-y-2">
                        {q.answers.map((a) => (
                          <div key={a.id} className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 text-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-bold text-brand-300">{a.author?.name}</span>
                              <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                            </div>
                            <p className="text-slate-200 leading-relaxed">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ask Question Modal (triggered from Senior Mentors tab) */}
      {askModalSenior && (
        <div
          onClick={() => setAskModalSenior(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setAskModalSenior(null)}
              aria-label="Close"
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Ask {askModalSenior.name}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Your question will be delivered to {askModalSenior.name}'s Senior Dashboard.
            </p>

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{modalSuccess}</span>
              </div>
            )}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            {!modalSuccess && (
              <form onSubmit={handleAskModalSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Question Subject</label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. How to prepare for Codility online round?"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detailed Query</label>
                  <textarea
                    rows={4}
                    value={modalContent}
                    onChange={(e) => setModalContent(e.target.value)}
                    placeholder="Describe your current preparation or specific doubt..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAskModalSenior(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Question</span>
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
