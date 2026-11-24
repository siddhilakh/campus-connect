import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Code,
  Cpu,
  Layers,
  BrainCircuit,
  MessageCircleQuestion,
  Tag
} from 'lucide-react';
import { api } from '../api/client';
import { Resource } from '../types';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const categories = [
    { label: 'All Resources', key: 'ALL', icon: BookOpen },
    { label: 'DSA & Coding', key: 'DSA & Coding', icon: Code },
    { label: 'System Design', key: 'System Design', icon: Layers },
    { label: 'Core CS (OS/DBMS/CN)', key: 'Core CS', icon: Cpu },
    { label: 'Aptitude & Reasoning', key: 'Aptitude & Reasoning', icon: BrainCircuit },
    { label: 'HR & Behavioral', key: 'HR & Behavioral', icon: MessageCircleQuestion }
  ];

  const fetchResources = async () => {
    try {
      const res = await api.getResources({
        search,
        category: selectedCategory
      });
      if (res.success) setResources(res.resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, selectedCategory]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Placement Preparation Resources</h2>
        <p className="text-xs text-slate-300 mt-1">
          Handpicked practice roadmaps, core computer science review guides, and interview cheatsheets.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search resources, topics, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-40" />
          <p className="text-sm font-bold text-white">No resources found</p>
          <p className="text-xs text-slate-400">Try selecting another topic category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-750 transition-all space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {res.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    res.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                    res.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {res.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5 mb-3">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {res.tags?.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-800"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {res.resourceType}
                </span>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-brand-600/10 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
