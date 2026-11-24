import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DemoAccountHelper } from '../components/DemoAccountHelper';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const targetRoute = getDefaultRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please select one of the demo accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans">
      {/* Left Hero Section (60% on desktop) */}
      <section className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 p-12 flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-brand-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
              Campus<span className="text-brand-400">Connect</span>
            </div>
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-400" />
              <span>Medi-Caps University Central Placement Platform</span>
            </div>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="my-auto max-w-xl relative z-10 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Centralized Student Opportunity & Career Enhancement
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            Bridge the gap from <br />
            <span className="bg-gradient-to-r from-brand-300 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              campus to career.
            </span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed mb-8">
            Access verified placement statistics, real interview rounds from seniors who made it to Microsoft & Amazon, and college recruitment drives in one unified SaaS portal.
          </p>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-brand-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">Highest Package</span>
              </div>
              <p className="text-2xl font-black text-white">₹44.0 LPA</p>
              <p className="text-[11px] text-slate-400">Microsoft Azure SDE</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-semibold">Average Package</span>
              </div>
              <p className="text-2xl font-black text-white">₹7.45 LPA</p>
              <p className="text-[11px] text-slate-400">Current 2025-26 Batch</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold">Placed Students</span>
              </div>
              <p className="text-2xl font-black text-white">685+</p>
              <p className="text-[11px] text-slate-400">Across 68 Companies</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>SRS Experiment No. 02 · Medi-Caps University</span>
          <span>B.Tech CSE Capstone Project</span>
        </div>
      </section>

      {/* Right Login Form (40% on desktop) */}
      <section className="col-span-1 lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-10 bg-slate-950">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Brand */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-xl text-white">
                Campus<span className="text-brand-400">Connect</span>
              </div>
              <div className="text-xs text-slate-400">Medi-Caps University</div>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              Secure Institutional Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Sign in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select one of the demo roles below or enter your credentials.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@test.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Demo Account Helper Selector */}
          <DemoAccountHelper onSelect={handleDemoSelect} />
        </div>
      </section>
    </div>
  );
};
