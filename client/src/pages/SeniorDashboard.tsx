import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  MessageSquare,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Edit3,
  Award,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InterviewExperience, Question, Company } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SeniorDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [currentCompany, setCurrentCompany] = useState(user?.seniorProfile?.currentCompany || 'Microsoft');
  const [jobRole, setJobRole] = useState(user?.seniorProfile?.jobRole || 'Software Development Engineer I');
  const [pkg, setPkg] = useState(user?.seniorProfile?.packageLpa ? String(user?.seniorProfile?.packageLpa) : '44.0');
  const [gradYear, setGradYear] = useState(user?.seniorProfile?.graduationYear || '2024');
  const [bio, setBio] = useState(user?.seniorProfile?.bio || '');
  const [linkedin, setLinkedin] = useState(user?.seniorProfile?.linkedinUrl || '');
  const [topics, setTopics] = useState(user?.seniorProfile?.expertiseTopics || 'DSA, System Design, Interviews');
  const [profileMsg, setProfileMsg] = useState('');

  // Experience creation modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expBatch, setExpBatch] = useState('2024');
  const [expPkg, setExpPkg] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [outcome, setOutcome] = useState('Selected');
  const [summary, setSummary] = useState('');
  const [prepStrategy, setPrepStrategy] = useState('');
  const [tips, setTips] = useState('');
  const [expTopics, setExpTopics] = useState('DSA, Trees, SQL');
  const [rounds, setRounds] = useState([
    { roundNumber: 1, roundName: 'Online Coding Assessment', durationMinutes: 90, description: '', questionsAsked: '', tips: '' },
    { roundNumber: 2, roundName: 'Technical Interview', durationMinutes: 60, description: '', questionsAsked: '', tips: '' }
  ]);
  const [expError, setExpError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Question answering state
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState('');

  const loadData = async () => {
    try {
      const [expRes, qRes, compRes] = await Promise.all([
        api.getMySubmittedExperiences(),
        api.getReceivedQuestions(),
        api.getCompanies()
      ]);

      if (expRes.success) setExperiences(expRes.experiences);
      if (qRes.success) setQuestions(qRes.questions);
      if (compRes.success && compRes.companies.length > 0) {
        setCompanies(compRes.companies);
        setSelectedCompanyId(compRes.companies[0].id);
      }
    } catch (err) {
      console.error('Failed to load senior data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await api.updateSeniorProfile({
        currentCompany,
        jobRole,
        packageLpa: parseFloat(pkg),
        graduationYear: gradYear,
        bio,
        linkedinUrl: linkedin,
        expertiseTopics: topics
      });

      if (res.success) {
        setProfileMsg('Senior mentorship profile saved successfully!');
        setTimeout(() => setProfileMsg(''), 4000);
      }
    } catch (err: any) {
      setProfileMsg('Error: ' + err.message);
    }
  };

  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    setRounds([
      ...rounds,
      {
        roundNumber: nextNum,
        roundName: `Technical Round ${nextNum}`,
        durationMinutes: 45,
        description: '',
        questionsAsked: '',
        tips: ''
      }
    ]);
  };

  const handleRemoveRound = (index: number) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index: number, field: string, value: any) => {
    const updated = [...rounds];
    updated[index] = { ...updated[index], [field]: value };
    setRounds(updated);
  };

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');

    if (!selectedCompanyId || !expRole || !summary || !prepStrategy) {
      setExpError('Please fill in company, role, summary, and preparation strategy.');
      return;
    }

    try {
      const res = await api.createExperience({
        companyId: selectedCompanyId,
        role: expRole,
        batch: expBatch,
        packageLpa: expPkg ? parseFloat(expPkg) : null,
        difficulty,
        outcome,
        overallSummary: summary,
        preparationStrategy: prepStrategy,
        tipsAndAdvice: tips,
        topicsCovered: expTopics,
        rounds
      });

      if (res.success) {
        setIsExpModalOpen(false);
        // Reset form
        setExpRole('');
        setSummary('');
        setPrepStrategy('');
        setTips('');
        loadData();
      }
    } catch (err: any) {
      setExpError(err.message || 'Failed to submit experience.');
    }
  };

  const handleDeleteExperience = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteExperience(deleteTargetId);
      setDeleteTargetId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerContent.trim()) return;
    try {
      const res = await api.answerQuestion(questionId, answerContent);
      if (res.success) {
        setAnsweringQuestionId(null);
        setAnswerContent('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to answer:', err);
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
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Alumni & Senior Portal
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Senior Dashboard · {user?.name}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Share your campus placement journey, mentor juniors, and answer questions.
          </p>
        </div>
        <button
          onClick={() => setIsExpModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Interview Experience</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mentorship Profile (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Mentorship Profile</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Juniors will see this profile when seeking interview advice.
            </p>

            {profileMsg && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Current Company</label>
                <input
                  type="text"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Job Designation</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Offer (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={pkg}
                    onChange={(e) => setPkg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Graduation Batch</label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Bio / Mentorship Focus</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell juniors how you can help them prepare..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Expertise Topics</label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. DSA, Graphs, LLD, Mock Interviews"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors"
              >
                Save Mentorship Profile
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Submitted Experiences & Received Questions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Questions Received from Students */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  <span>Questions Received ({questions.length})</span>
                </h3>
                <p className="text-xs text-slate-400">Junior students reaching out to you for guidance</p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No questions received yet. Your profile is open for junior questions!
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={q.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                          alt={q.student?.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{q.student?.name}</p>
                          <p className="text-[10px] text-slate-400">{q.student?.department} · Batch {q.student?.batch}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        q.isAnswered ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {q.isAnswered ? 'Answered' : 'Awaiting Reply'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{q.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{q.content}</p>
                    </div>

                    {/* Existing Answers */}
                    {q.answers && q.answers.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-brand-500/40 space-y-2">
                        {q.answers.map((a) => (
                          <div key={a.id} className="text-xs">
                            <span className="font-semibold text-brand-300">Your Answer:</span>
                            <p className="text-slate-300 mt-0.5 leading-relaxed">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer composer toggle */}
                    {answeringQuestionId === q.id ? (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <textarea
                          rows={3}
                          value={answerContent}
                          onChange={(e) => setAnswerContent(e.target.value)}
                          placeholder="Write your mentorship advice for this junior..."
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setAnsweringQuestionId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAnswerSubmit(q.id)}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Answer</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setAnsweringQuestionId(q.id);
                            setAnswerContent('');
                          }}
                          className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{q.isAnswered ? 'Add additional advice' : 'Reply to Junior'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submitted Interview Experiences */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>My Published Experiences ({experiences.length})</span>
                </h3>
                <p className="text-xs text-slate-400">Detailed round-wise stories published to CampusConnect</p>
              </div>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{exp.company?.name}</span>
                      <span className="text-xs text-slate-400">· {exp.role}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {exp.outcome}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {exp.overallSummary}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{exp.rounds.length} Interview Rounds</span>
                      <span>•</span>
                      <span>Difficulty: {exp.difficulty}</span>
                      {exp.packageLpa && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-bold">₹{exp.packageLpa} LPA</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTargetId(exp.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-1">Share Interview Experience</h3>
            <p className="text-xs text-slate-400 mb-4">
              Break down the selection process round by round to help juniors prepare effectively.
            </p>

            {expError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {expError}
              </div>
            )}

            <form onSubmit={handleCreateExperience} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Role</label>
                  <input
                    type="text"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    placeholder="e.g. SDE-1, Cloud Associate"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Offered Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={expPkg}
                    onChange={(e) => setExpPkg(e.target.value)}
                    placeholder="44.0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Overall Summary</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Overview of the selection drive and how many candidates cleared..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preparation Strategy & Key Resources</label>
                <textarea
                  rows={2}
                  value={prepStrategy}
                  onChange={(e) => setPrepStrategy(e.target.value)}
                  placeholder="How did you prepare? (e.g. LeetCode 200 problems, Striver sheet, OS gate smashers)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Dynamic Round-by-Round Breakdown */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-xs">Interview Rounds ({rounds.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddRound}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Round</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {rounds.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-850 border border-slate-750 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-300 text-xs">Round {r.roundNumber}</span>
                        {rounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRound(idx)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={r.roundName}
                          onChange={(e) => handleRoundChange(idx, 'roundName', e.target.value)}
                          placeholder="Round Name (e.g. Technical Round 1)"
                          className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="number"
                          value={r.durationMinutes || ''}
                          onChange={(e) => handleRoundChange(idx, 'durationMinutes', e.target.value)}
                          placeholder="Duration in mins"
                          className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={r.questionsAsked}
                        onChange={(e) => handleRoundChange(idx, 'questionsAsked', e.target.value)}
                        placeholder="Specific questions or coding problems asked in this round..."
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Publish Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        title="Delete Interview Experience"
        message="Are you sure you want to delete this interview experience? This will permanently remove it from the platform."
        confirmText="Delete"
        onConfirm={handleDeleteExperience}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
