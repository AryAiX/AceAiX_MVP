import React from 'react';
import PublicHeader from '../components/PublicHeader';
import { BookOpen, FileText, Video, BarChart3, ChevronRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { icon: <BookOpen size={20} />, label: 'Guides', color: 'blue', count: 24 },
  { icon: <Video size={20} />, label: 'Video Tutorials', color: 'emerald', count: 12 },
  { icon: <FileText size={20} />, label: 'Research Papers', color: 'amber', count: 8 },
  { icon: <BarChart3 size={20} />, label: 'Market Reports', color: 'blue', count: 5 },
];

const ARTICLES = [
  {
    category: 'Guide',
    title: 'How to Build a Standout Athlete Profile',
    summary: 'Your profile is your digital scouting dossier. This guide walks through every section, best practices for media, and how the AI scoring system works.',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    category: 'Research',
    title: '2026 MENA Sports Talent Report',
    summary: 'An analysis of 12,000 athlete profiles revealing key performance benchmarks, positional demands, and recruitment trends across the GCC and North Africa.',
    readTime: '15 min read',
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    category: 'Guide',
    title: 'Understanding Your AI Score',
    summary: 'A deep-dive into how AceAiX calculates performance scores, what metrics are weighted, and actionable steps to improve your rating.',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    category: 'Tutorial',
    title: 'Using the AI Talent Discovery Tool',
    summary: 'A step-by-step walkthrough for scouts on how to write effective natural language queries to surface the best-fit athletes.',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    category: 'Guide',
    title: 'Medical Verification — What Athletes Need to Know',
    summary: 'Explains the partner-led medical verification process: what records are needed, data privacy, consent controls, and why verification improves your scout visibility by 3x.',
    readTime: '7 min read',
    image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    category: 'Report',
    title: 'The ROI of AI in Sports Recruitment',
    summary: 'How clubs using AI-assisted recruitment reduce cost-per-signing by 40% while improving retention rates. Case studies from UAE Pro League clubs.',
    readTime: '12 min read',
    image: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const CATEGORY_COLOR: Record<string, string> = {
  Guide: 'badge-blue',
  Research: 'badge-amber',
  Tutorial: 'badge-green',
  Report: 'badge-slate',
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />

      <div className="border-b border-slate-700/50 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Knowledge Base</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Resources & Guides</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Guides, research, and tutorials to help athletes grow their careers and scouts find elite talent faster.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="card-hover text-center py-6">
              <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${cat.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : cat.color === 'amber' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-600/15 text-blue-400'}`}>
                {cat.icon}
              </div>
              <p className="text-sm font-semibold text-white">{cat.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{cat.count} articles</p>
            </div>
          ))}
        </div>

        {/* Featured article */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-blue-400" />
            <p className="text-sm font-semibold text-white">Featured</p>
          </div>
          <div className="card-hover p-0 overflow-hidden flex flex-col md:flex-row">
            <img src={ARTICLES[0].image} alt={ARTICLES[0].title} className="w-full md:w-72 h-48 md:h-auto object-cover flex-shrink-0" />
            <div className="p-6 flex flex-col justify-center">
              <span className={`badge ${CATEGORY_COLOR[ARTICLES[0].category]} text-xs mb-3 self-start`}>{ARTICLES[0].category}</span>
              <h2 className="text-xl font-bold text-white mb-2">{ARTICLES[0].title}</h2>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{ARTICLES[0].summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{ARTICLES[0].readTime}</span>
                <Link to="/auth/register" className="btn-primary text-sm py-1.5">
                  Read Article <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARTICLES.slice(1).map((article) => (
            <div key={article.title} className="card-hover group p-0 overflow-hidden flex flex-col">
              <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <span className={`badge ${CATEGORY_COLOR[article.category]} text-xs mb-3 self-start`}>{article.category}</span>
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{article.title}</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed flex-1">{article.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{article.readTime}</span>
                  <Link to="/auth/register" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                    Read <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
