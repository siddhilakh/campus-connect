import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  BookOpen,
  Bookmark,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Send,
  X,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import { api } from '../api/client';
import { InterviewExperience, User, Question } from '../types';
import { useAuth } from '../context/AuthContext';

export const SeniorConnectPage: React.FC = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [seniors, setSeniors] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'experiences' | 'seniors'>('experiences');
  const [selectedExp, setSelectedExp] = useState<InterviewExperience | null>(null);

  // Question modal state
  const [askModalSenior, setAskModalSenior] = useState<User | null>(null);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [askSuccessMsg, setAskSuccessMsg] = useState('');
  const [askError, setAskError] = useState('');

  const loadData = async () => {
    try {
      const [expRes, senRes] = await Promise.all([
        api.getExperiences({ search }),
        api.getSeniors({ search })
      ]);
      if (expRes.success) setExperiences(expRes.experiences);
      if (senRes.success) setSeniors(senRes.seniors);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleToggleBookmark = async (expId: string) => {
    try {
      const res = await api.toggleBookmark(expId);
      if (res.success) {
        setExperiences((prev) =>
          prev.map((e) => (e.id === expId ? { ...e, isBookmarked: res.isBookmarked } : e))
        );
        if (selectedExp && selectedExp.id === expId) {
          setSelectedExp({ ...selectedExp, isBookmarked: res.isBookmarked });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenExpDetail = async (id: string) => {
    try {
      const res = await api.getExperience(id);
      if (res.success) setSelectedExp(res.experience);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askModalSenior || !questionTitle || !questionContent) {
      setAskError('Please fill in title and description.');
      return;
    }

    try {
      const res = await api.askQuestion({
        seniorId: askModalSenior.id,
        title: questionTitle,
        content: questionContent,
        experienceId: selectedExp?.id
      });

      if (res.success) {
        setAskSuccessMsg('Your question has been sent to the senior! You will receive an in-app notification when they reply.');
        setTimeout(() => {
          setAskModalSenior(null);
          setQuestionTitle('');
          setQuestionContent('');
          setAskSuccessMsg('');
        }, 2500);
      }
    } catch (err: any) {
      setAskError(err.message || 'Failed to send question.');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Senior Connect & Interview Experience Hub
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Learn directly from placed seniors through detailed round breakdowns, coding questions, and 1-on-1 Q&A.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'experiences'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white bg-slate-850'
            }`}
          >
            Interview Experiences ({experiences.length})
          </button>
          <button
            onClick={() => setActiveTab('seniors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'seniors'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white bg-slate-850'
            }`}
          >
            Senior Mentors Directory ({seniors.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search company, topics, or senior name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Experiences Grid */}
      {activeTab === 'experiences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{exp.company?.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {exp.outcome}
                      </span>
                    </div>
                    <p className="text-xs text-brand-400 font-medium">{exp.role} · Batch {exp.batch}</p>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(exp.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      exp.isBookmarked
                        ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={exp.isBookmarked ? 'Bookmarked' : 'Bookmark this experience'}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                  {exp.overallSummary}
                </p>

                {/* Round overview tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {exp.rounds?.map((r, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-850 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                    >
                      Round {r.roundNumber}: {r.roundName}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Key topics:</span>
                  <span className="truncate">{exp.topicsCovered}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={exp.author?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60'}
                    alt={exp.author?.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-300">{exp.author?.name}</span>
                </div>

                <button
                  onClick={() => handleOpenExpDetail(exp.id)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Read Full Rounds</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seniors Directory */}
      {activeTab === 'seniors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {seniors.map((senior) => (
            <div
              key={senior.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={senior.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt={senior.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{senior.name}</h3>
                    <p className="text-xs font-semibold text-brand-400">
                      {senior.seniorProfile?.currentCompany} · {senior.seniorProfile?.jobRole}
                    </p>
                    <p className="text-[10px] text-slate-400">{senior.department} · Batch {senior.batch}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
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

                <button
                  onClick={() => {
                    setAskModalSenior(senior);
                    setAskError('');
                    setAskSuccessMsg('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience Details Modal with Multi-Round Breakdown */}
      {selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedExp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-white">{selectedExp.company?.name} · {selectedExp.role}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedExp.outcome}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 pb-4 border-b border-slate-800">
              <span>Author: {selectedExp.author?.name}</span>
              <span>•</span>
              <span>Batch: {selectedExp.batch}</span>
              <span>•</span>
              <span>Difficulty: {selectedExp.difficulty}</span>
              {selectedExp.packageLpa && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono font-bold">CTC: ₹{selectedExp.packageLpa} LPA</span>
                </>
              )}
            </div>

            {/* Preparation Strategy */}
            <div className="space-y-4 text-xs text-slate-300 mb-6">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Overall Experience Summary</h4>
                <p className="leading-relaxed bg-slate-850 p-3.5 rounded-xl border border-slate-800">{selectedExp.overallSummary}</p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">Preparation Strategy & Tips</h4>
                <p className="leading-relaxed bg-slate-850 p-3.5 rounded-xl border border-slate-800">{selectedExp.preparationStrategy}</p>
              </div>
            </div>

            {/* Detailed Rounds */}
            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-sm text-white">Interview Rounds Breakdown</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {selectedExp.rounds?.map((r) => (
                  <div key={r.roundNumber} className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-300">Round {r.roundNumber}: {r.roundName}</span>
                      {r.durationMinutes && <span className="text-slate-400">{r.durationMinutes} mins</span>}
                    </div>
                    {r.description && <p className="text-slate-300 leading-relaxed">{r.description}</p>}
                    {r.questionsAsked && (
                      <div className="mt-1 pt-1.5 border-t border-slate-800 text-slate-300">
                        <span className="font-semibold text-slate-400">Questions asked: </span>
                        <span>{r.questionsAsked}</span>
                      </div>
                    )}
                    {r.tips && (
                      <div className="text-amber-400/90 text-[11px]">
                        <span>Tip: </span>{r.tips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Q&A Thread on this Experience */}
            {selectedExp.questions && selectedExp.questions.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h4 className="font-bold text-sm text-white mb-2">Discussion & Questions</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedExp.questions.map((q) => (
                    <div key={q.id} className="p-3 rounded-lg bg-slate-850 text-xs space-y-1">
                      <span className="font-bold text-slate-200">{q.title}</span>
                      <p className="text-slate-400">{q.content}</p>
                      {q.answers?.map((a) => (
                        <div key={a.id} className="pl-3 border-l border-brand-500 text-brand-300 mt-1">
                          {a.content}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ask Question to Senior Modal */}
      {askModalSenior && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAskModalSenior(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Ask {askModalSenior.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Your question will be delivered to the senior's private dashboard.
            </p>

            {askSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{askSuccessMsg}</span>
              </div>
            )}

            {askError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {askError}
              </div>
            )}

            {!askSuccessMsg && (
              <form onSubmit={handleAskQuestionSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Question Topic / Subject</label>
                  <input
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="e.g. How to prepare for Microsoft Codility round?"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detailed Query</label>
                  <textarea
                    rows={4}
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="Provide specific details about your current semester, skills, or what you are struggling with..."
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
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Question</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
