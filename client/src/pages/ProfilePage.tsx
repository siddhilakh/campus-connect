import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Building,
  Phone,
  Bookmark,
  Shield,
  Save,
  CheckCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InterviewExperience } from '../types';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bookmarks, setBookmarks] = useState<InterviewExperience[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.getMyBookmarks();
        if (res.success) setBookmarks(res.bookmarks);
      } catch (e) {}
    };
    fetchBookmarks();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await api.updateProfile({ name, phone, department });
      if (res.success) {
        updateUser(res.user);
        setMsg('Profile updated successfully.');
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err: any) {
      setMsg('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Account & Profile Settings</h2>
        <p className="text-xs text-slate-300 mt-1">
          Manage your personal details and view your bookmarked interview preparation stories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700"
              />
              <div>
                <h3 className="font-bold text-lg text-white">{user.name}</h3>
                <span className="text-xs font-semibold text-brand-400">{user.role}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Medi-Caps University</p>
              </div>
            </div>

            {msg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{msg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-850/60 border border-slate-800 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="font-mono">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Bookmarked Experiences (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-brand-400" />
              <span>Bookmarked Interview Experiences ({bookmarks.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Saved rounds and advice for offline review before your campus drives.
            </p>

            {bookmarks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Bookmark className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-40" />
                <p>No experiences bookmarked yet.</p>
                <p className="mt-1">
                  Visit the{' '}
                  <Link to="/senior-connect" className="text-brand-400 hover:underline">
                    Senior Connect
                  </Link>{' '}
                  page to bookmark helpful stories.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{exp.company?.name}</span>
                        <span className="text-xs text-slate-400">· {exp.role}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {exp.overallSummary}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{exp.rounds?.length || 0} Rounds</span>
                        <span>•</span>
                        <span>Author: {exp.author?.name}</span>
                      </div>
                    </div>

                    <Link
                      to="/senior-connect"
                      className="px-3 py-1.5 rounded-lg bg-brand-600/10 text-brand-300 hover:bg-brand-600 hover:text-white border border-brand-500/20 text-xs font-bold transition-colors shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
