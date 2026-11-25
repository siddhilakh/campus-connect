import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Calendar,
  ThumbsUp,
  Clock,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Send,
  CheckCircle,
  ExternalLink,
  Layers,
  Target,
  Sparkles,
  Award
} from 'lucide-react';
import { api } from '../api/client';
import { InterviewExperience } from '../types';

export const ExperienceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exp, setExp] = useState<InterviewExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Question form state
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);
  const [qSuccess, setQSuccess] = useState('');
  const [qError, setQError] = useState('');

  const loadExperience = async () => {
    if (!id) return;
    try {
      const res = await api.getExperience(id);
      if (res.success) {
        setExp(res.experience);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load interview experience.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperience();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!exp) return;
    try {
      const res = await api.toggleBookmark(exp.id);
      if (res.success) {
        setExp({
          ...exp,
          isBookmarked: res.isBookmarked,
          _count: {
            questions: exp._count?.questions || 0,
            bookmarks: res.bookmarkCount ?? (exp._count?.bookmarks || 0) + (res.isBookmarked ? 1 : -1),
            helpfulVotes: exp._count?.helpfulVotes
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHelpful = async () => {
    if (!exp) return;
    try {
      const res = await api.toggleHelpful(exp.id);
      if (res.success) {
        setExp({
          ...exp,
          isHelpful: res.isHelpful,
          helpfulCount: res.helpfulCount
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exp || !questionTitle.trim() || !questionContent.trim()) {
      setQError('Please enter both a subject and your question.');
      return;
    }

    setSubmittingQ(true);
    setQError('');
    setQSuccess('');
    try {
      const res = await api.askQuestion({
        seniorId: exp.authorId,
        title: questionTitle,
        content: questionContent,
        experienceId: exp.id
      });
      if (res.success) {
        setQSuccess('Your question was sent to the senior!');
        setQuestionTitle('');
        setQuestionContent('');
        loadExperience();
      }
    } catch (err: any) {
      setQError(err.message || 'Failed to send question.');
    } finally {
      setSubmittingQ(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Loading full interview rounds...</p>
        </div>
      </div>
    );
  }

  if (error || !exp) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <p className="text-rose-400 font-bold">{error || 'Interview experience not found.'}</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/senior-connect')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Senior Connect
        </motion.button>
      </div>
    );
  }

  const topicsList = exp.topicsCovered
    ? exp.topicsCovered.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/senior-connect')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Senior Connect</span>
        </motion.button>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleHelpful}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              exp.isHelpful
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${exp.isHelpful ? 'fill-current' : ''}`} />
            <span>Helpful ({exp.helpfulCount || 0})</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleBookmark}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              exp.isBookmarked
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 shadow-md shadow-brand-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${exp.isBookmarked ? 'fill-current' : ''}`} />
            <span>{exp.isBookmarked ? 'Bookmarked' : 'Bookmark'} ({exp._count?.bookmarks || 0})</span>
          </motion.button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                {exp.interviewType || 'On-Campus'}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                exp.difficulty === 'Hard'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : exp.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {exp.difficulty} Difficulty
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {exp.outcome}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {exp.company?.name} · {exp.role}
            </h1>
            <p className="text-xs text-slate-400">
              Batch {exp.batch} {exp.packageLpa ? `· Offered Package: ₹${exp.packageLpa} LPA` : ''}
            </p>
          </div>

          {exp.packageLpa && (
            <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Package Offered
              </span>
              <span className="text-xl font-black text-white font-mono">₹{exp.packageLpa} LPA</span>
            </div>
          )}
        </div>

        {/* Credibility & Author Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={exp.author?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
              alt={exp.author?.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{exp.author?.name}</span>
                {exp.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified Senior
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {exp.author?.seniorProfile?.currentCompany
                  ? `${exp.author.seniorProfile.jobRole} at ${exp.author.seniorProfile.currentCompany}`
                  : exp.author?.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Posted {new Date(exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-brand-400" />
              {exp._count?.bookmarks || 0} students bookmarked
            </span>
            {exp.author?.seniorProfile?.linkedinUrl && (
              <a
                href={exp.author.seniorProfile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
              >
                LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Overall Summary & Topics Tested */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>Overall Experience Summary</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {exp.overallSummary}
          </p>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span>Topics Tested</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {topicsList.map((topic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700/80 text-xs font-semibold text-slate-200"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Round-wise Interview Breakdown */}
      <div className="p-6 lg:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <span>Round-Wise Interview Breakdown ({exp.rounds?.length || 0} Rounds)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed progression, actual questions asked, and round-specific tips
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {exp.rounds?.map((round, idx) => (
            <motion.div
              key={round.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-5 rounded-2xl bg-slate-850/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-300 font-bold text-xs flex items-center justify-center">
                    {round.roundNumber}
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base">{round.roundName}</h3>
                </div>
                {round.durationMinutes && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {round.durationMinutes} mins
                  </span>
                )}
              </div>

              {round.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {round.description}
                </p>
              )}

              {round.questionsAsked && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block">
                    Actual Questions Asked
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {round.questionsAsked}
                  </p>
                </div>
              )}

              {round.tips && (
                <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Round Tip:</strong> {round.tips}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preparation Strategy & Senior's Advice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Preparation Strategy</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {exp.preparationStrategy}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Senior's Advice for Juniors</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {exp.tipsAndAdvice}
          </p>
        </div>
      </div>

      {/* Q&A Discussion Thread & Ask Form */}
      <div className="p-6 lg:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <span>Questions & Discussion ({exp.questions?.length || 0})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask {exp.author?.name} a question directly about this {exp.company?.name} interview
          </p>
        </div>

        {/* Ask form */}
        <form onSubmit={handleAskQuestion} className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3 text-xs">
          {qSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{qSuccess}</span>
            </div>
          )}
          {qError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {qError}
            </div>
          )}
          <input
            type="text"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            placeholder={`Ask ${exp.author?.name} a question (e.g. "How did you prepare for Round 2?")`}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
          />
          <textarea
            rows={2}
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            placeholder="Add context about your preparation or specific doubt..."
            className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-brand-500 resize-none"
          />
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={submittingQ}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingQ ? 'Sending...' : 'Ask Senior'}</span>
            </motion.button>
          </div>
        </form>

        {/* Thread list */}
        <div className="space-y-3">
          {exp.questions && exp.questions.length > 0 ? (
            exp.questions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-850/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{q.title}</span>
                  <span className="text-[10px] text-slate-400">
                    Asked by {q.student?.name}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{q.content}</p>
                {q.answers && q.answers.length > 0 && (
                  <div className="mt-2 pl-3.5 border-l-2 border-brand-500/50 space-y-2">
                    {q.answers.map((a) => (
                      <div key={a.id} className="text-xs">
                        <span className="font-bold text-brand-300">{a.author?.name}: </span>
                        <span className="text-slate-200">{a.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              No questions yet on this experience. Be the first to ask!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
