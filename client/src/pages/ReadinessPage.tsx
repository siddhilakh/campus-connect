import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  BrainCircuit,
  Code,
  Cpu,
  MessageSquare,
  FileText,
  Save,
  CheckCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { api } from '../api/client';
import { ReadinessProgress } from '../types';

export const ReadinessPage: React.FC = () => {
  const [readiness, setReadiness] = useState<ReadinessProgress | null>(null);
  const [scores, setScores] = useState({
    aptitude: 65,
    dsa: 55,
    coreCs: 65,
    communication: 75,
    resumePreparation: 70
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getReadiness();
        if (res.success && res.readiness) {
          setReadiness(res.readiness);
          setScores({
            aptitude: res.readiness.aptitude,
            dsa: res.readiness.dsa,
            coreCs: res.readiness.coreCs,
            communication: res.readiness.communication,
            resumePreparation: res.readiness.resumePreparation
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load readiness data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overall = Math.round(
    (scores.aptitude + scores.dsa + scores.coreCs + scores.communication + scores.resumePreparation) / 5
  );

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const res = await api.updateReadiness(scores);
      if (res.success) {
        setReadiness(res.readiness);
        setMsg('Readiness progress saved to your profile!');
        setTimeout(() => setMsg(''), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save readiness progress.');
    } finally {
      setSaving(false);
    }
  };

  const tracks = [
    {
      key: 'aptitude' as const,
      label: 'Quantitative Aptitude & Reasoning',
      desc: 'Speed math, probability, permutations, and logical puzzles for OA screening',
      icon: BrainCircuit,
      color: 'from-blue-500 to-cyan-400',
      badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      key: 'dsa' as const,
      label: 'Data Structures & Algorithms (DSA)',
      desc: 'Arrays, Trees, Graphs, Dynamic Programming, and coding round speed',
      icon: Code,
      color: 'from-brand-500 to-indigo-400',
      badge: 'text-brand-400 bg-brand-500/10 border-brand-500/20'
    },
    {
      key: 'coreCs' as const,
      label: 'Core CS Subjects (DBMS, OS, CN, OOP)',
      desc: 'SQL queries, normalization, deadlocks, memory management, and OOP design',
      icon: Cpu,
      color: 'from-purple-500 to-pink-400',
      badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      key: 'communication' as const,
      label: 'Communication & HR Behavioral',
      desc: 'STAR method storytelling, project walkthroughs, and group discussion clarity',
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-400',
      badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      key: 'resumePreparation' as const,
      label: 'Resume & Project Portfolio',
      desc: 'ATS-friendly formatting, quantified impact bullets, and live project demos',
      icon: FileText,
      color: 'from-amber-500 to-orange-400',
      badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20 mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Personal Placement Readiness</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Placement Readiness Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Adjust your skill milestones across the 5 core placement pillars and save your progress.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/25 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Progress...' : 'Save Progress'}</span>
        </motion.button>
      </div>

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{msg}</span>
        </motion.div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Overall Readiness Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xl">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>Overall Campus Readiness Score</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl lg:text-5xl font-black text-white">{overall}%</span>
            <span className="text-xs font-semibold text-slate-400">
              {overall >= 80
                ? 'Interview-Ready for Super Dream Drives!'
                : overall >= 60
                ? 'Strong Foundation — Keep Practicing DSA & Core CS'
                : 'Building Momentum — Focus on Weakest Pillars'}
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overall}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-brand-500 via-indigo-400 to-emerald-400 rounded-full"
            />
          </div>
        </div>

        <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Recommended Next Step</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {(() => {
              const lowest = tracks.reduce((min, t) => (scores[t.key] < scores[min.key] ? t : min), tracks[0]);
              return `Your lowest score is ${lowest.label} (${scores[lowest.key]}%). Boost this area in the Practice Zone to raise your overall score.`;
            })()}
          </p>
        </div>
      </div>

      {/* 5 Pillars Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tracks.map((track, idx) => {
          const Icon = track.icon;
          const val = scores[track.key];
          return (
            <motion.div
              key={track.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${track.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{track.label}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{track.desc}</p>
                  </div>
                </div>
                <span className="text-lg font-black text-white font-mono shrink-0">{val}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full bg-gradient-to-r ${track.color} rounded-full`}
                />
              </div>

              {/* Interactive Slider + Quick Step Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={val}
                  onChange={(e) => setScores({ ...scores, [track.key]: Number(e.target.value) })}
                  className="flex-1 accent-brand-500 cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setScores({ ...scores, [track.key]: Math.max(0, val - 5) })}
                    className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-bold"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    onClick={() => setScores({ ...scores, [track.key]: Math.min(100, val + 5) })}
                    className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-bold"
                  >
                    +5%
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
