import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import { Play, Clock, Eye, Tag, ShieldCheck, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLIPS = [
  {
    id: '1',
    title: 'Khalid Al-Rashidi — Hattrick vs. Al Jazira',
    athlete: 'Khalid Al-Rashidi',
    position: 'Striker',
    duration: '4:32',
    views: '12.4K',
    tags: ['Goal', 'Positioning', 'Speed'],
    verified: true,
    thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
    score: 9.2,
  },
  {
    id: '2',
    title: 'Tariq Hassan — Complete Midfield Performance',
    athlete: 'Tariq Hassan',
    position: 'Midfielder',
    duration: '6:15',
    views: '8.7K',
    tags: ['Passing', 'Vision', 'Press Resistance'],
    verified: true,
    thumbnail: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600',
    score: 8.8,
  },
  {
    id: '3',
    title: 'Noura Al-Mansoori — National Championships 100m',
    athlete: 'Noura Al-Mansoori',
    position: 'Sprinter',
    duration: '2:48',
    views: '15.2K',
    tags: ['Speed', 'Technique', 'Reaction'],
    verified: true,
    thumbnail: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600',
    score: 9.0,
  },
  {
    id: '4',
    title: 'Rayan Benali — 5 Key Saves Compilation',
    athlete: 'Rayan Benali',
    position: 'Goalkeeper',
    duration: '3:55',
    views: '6.1K',
    tags: ['Reflexes', 'Command', 'Distribution'],
    verified: true,
    thumbnail: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=600',
    score: 8.7,
  },
  {
    id: '5',
    title: 'Amir Karimi — Defensive Masterclass vs. Persepolis',
    athlete: 'Amir Karimi',
    position: 'Center-Back',
    duration: '5:10',
    views: '4.3K',
    tags: ['Aerial', 'Tackling', 'Ball-Playing'],
    verified: true,
    thumbnail: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600',
    score: 8.5,
  },
  {
    id: '6',
    title: 'Yusuf Al-Kaabi — Winger Dribbling Highlights',
    athlete: 'Yusuf Al-Kaabi',
    position: 'Winger',
    duration: '3:20',
    views: '3.8K',
    tags: ['Dribbling', 'Pace', 'Creativity'],
    verified: false,
    thumbnail: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=600',
    score: 8.3,
  },
];

export default function HighlightsPage() {
  const [featured] = useState(CLIPS[0]);

  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />

      <div className="border-b border-slate-700/50 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">AI-Tagged Clips</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Athlete Highlights</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Every clip is AI-analyzed for key attributes. Tags, performance metrics, and verified provenance — all in one place.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-400" />
            <p className="text-sm font-semibold text-white">Featured Clip</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
            <img src={featured.thumbnail} alt={featured.title} className="w-full h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Link to="/auth/register" className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all group-hover:scale-110">
                <Play size={24} className="text-white ml-1" fill="white" />
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex gap-2 mb-2">
                {featured.tags.map((t) => (
                  <span key={t} className="bg-blue-600/30 border border-blue-600/40 text-blue-300 text-xs px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{featured.title}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {featured.duration}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {featured.views} views</span>
                {featured.verified && <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck size={12} /> Verified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CLIPS.slice(1).map((clip) => (
            <Link to="/auth/register" key={clip.id} className="card-hover group p-0 overflow-hidden block">
              <div className="relative">
                <img src={clip.thumbnail} alt={clip.title} className="w-full h-44 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900/40">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                    <Play size={16} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-navy-900/80 text-xs text-white px-2 py-0.5 rounded">{clip.duration}</div>
                {clip.verified && (
                  <div className="absolute top-2 left-2 bg-emerald-500/20 border border-emerald-500/40 p-1 rounded">
                    <ShieldCheck size={10} className="text-emerald-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">{clip.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{clip.athlete} · {clip.position}</p>
                <div className="flex flex-wrap gap-1">
                  {clip.tags.map((t) => (
                    <span key={t} className="badge badge-slate text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">Upload your own highlights and get instant AI analysis with automatic performance tagging.</p>
          <Link to="/auth/register" className="btn-primary">Upload Your Highlights</Link>
        </div>
      </div>
    </div>
  );
}
