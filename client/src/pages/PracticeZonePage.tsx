import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Code,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client';
import { PracticeQuestion, PracticeStats } from '../types';

export const PracticeZonePage: React.FC = () => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadQuestions = async () => {
    try {
      const res = await api.getPracticeQuestions({ category, difficulty });
      if (res.success) {
        setQuestions(res.questions);
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category, difficulty]);

  const handleSelectOption = async (questionId: string, idx: number) => {
    setSubmittingId(questionId);
    try {
      const res = await api.submitPracticeAttempt(questionId, idx);
      if (res.success) {
        await loadQuestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Categories', icon: BookOpen },
    { key: 'Aptitude', label: 'Aptitude', icon: BrainCircuit },
    { key: 'Technical MCQ', label: 'Technical MCQ', icon: Cpu },
    { key: 'SQL', label: 'SQL & DBMS', icon: Database },
    { key: 'DSA', label: 'DSA Concepts', icon: Code }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Placement Prep</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
          Practice Zone
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Test your Aptitude, Core CS, SQL, and DSA skills with instant explanations and score tracking.
        </p>
      </div>

      {/* Score & Progress Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Questions Attempted</span>
            <p className="text-2xl font-black text-white mt-1">
              {stats.attemptedCount} <span className="text-sm text-slate-400 font-semibold">/ {stats.totalQuestions}</span>
            </p>
            <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${stats.totalQuestions ? (stats.attemptedCount / stats.totalQuestions) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Correct Answers</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.correctCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Verified across all topics</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Accuracy Rate</span>
            <p className="text-2xl font-black text-white mt-1">{stats.accuracy}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Based on attempted questions</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Category Progress
            </span>
            <div className="mt-2 space-y-1">
              {stats.categoryStats.map((cs) => (
                <div key={cs.category} className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{cs.category}</span>
                  <span className="font-mono text-brand-400 font-bold">
                    {cs.correct}/{cs.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.key;
            return (
              <motion.button
                key={cat.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs focus:outline-none"
        >
          <option value="ALL">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-400">
          No practice questions match the selected filters.
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, qIdx) => {
            const attempted = !!q.userAttempt;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIdx * 0.04 }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {q.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      q.difficulty === 'Hard'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : q.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{q.title}</span>
                  </div>

                  {attempted && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      q.userAttempt?.isCorrect
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    }`}>
                      {q.userAttempt?.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Solved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Needs Review</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt, idx) => {
                    const isSelected = q.userAttempt?.selectedIdx === idx;
                    const isCorrectOpt = q.correctIdx === idx;

                    let btnStyle =
                      'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-brand-500/40 text-slate-200';
                    if (attempted) {
                      if (isCorrectOpt) {
                        btnStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200';
                      } else if (isSelected && !isCorrectOpt) {
                        btnStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-200';
                      } else {
                        btnStyle = 'bg-slate-850/50 border-slate-800/60 text-slate-400';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={submittingId === q.id}
                        onClick={() => handleSelectOption(q.id, idx)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-medium flex items-center gap-3 transition-all ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {attempted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 text-xs space-y-1"
                  >
                    <span className="font-bold text-brand-400 uppercase tracking-wider text-[10px] block">
                      Explanation
                    </span>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
