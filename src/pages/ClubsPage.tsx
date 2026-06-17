import React from 'react';
import PublicHeader from '../components/PublicHeader';
import { ShieldCheck, Users, Trophy, Globe, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLUBS = [
  { id: 'alwasl', name: 'Al Ain FC', league: 'UAE Pro League', country: 'UAE', founded: 1968, athletes: 28, verified: true, image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alwasl', name: 'Al Hilal', league: 'Saudi Pro League', country: 'Saudi Arabia', founded: 1957, athletes: 34, verified: true, image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alwasl', name: 'Wydad AC', league: 'Botola Pro', country: 'Morocco', founded: 1937, athletes: 31, verified: true, image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alwasl', name: 'Esteghlal FC', league: 'Persian Gulf Pro', country: 'Iran', founded: 1945, athletes: 29, verified: true, image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alwasl', name: 'Al Wahda', league: 'UAE Pro League', country: 'UAE', founded: 1974, athletes: 25, verified: true, image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alwasl', name: 'Shabab FC', league: 'UAE Pro League', country: 'UAE', founded: 1974, athletes: 22, verified: false, image: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const STATS = [
  { value: '850+', label: 'Clubs Registered' },
  { value: '24', label: 'Countries' },
  { value: '12K+', label: 'Athletes Listed' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function ClubsPage() {
  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />

      <div className="border-b border-slate-700/50 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Club Network</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Clubs & Organizations</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Connect with top football clubs, federations, and academies across the Middle East and North Africa — all verified on the AceAiX platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CLUBS.map((club) => (
            <Link key={club.name} to={`/clubs/${club.id}`} className="card-hover group overflow-hidden p-0 block">
              <img src={club.image} alt={club.name} className="w-full h-40 object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">{club.name}</h3>
                  {club.verified && <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
                </div>
                <p className="text-sm text-slate-400 mb-1">{club.league}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                  <Globe size={11} />
                  <span>{club.country}</span>
                  <span className="mx-1">·</span>
                  <span>Est. {club.founded}</span>
                  <span className="mx-1">·</span>
                  <Users size={11} />
                  <span>{club.athletes} athletes</span>
                </div>
                <span className="btn-secondary w-full justify-center text-sm flex items-center gap-1">
                  View Club
                  <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="card text-center py-12">
          <Trophy size={40} className="text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Register Your Club</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">Join AceAiX to discover verified talent, manage recruitment pipelines, and connect with athletes across the region. Free for clubs to get started.</p>
          <Link to="/auth/register" className="btn-primary">Register Your Club</Link>
        </div>
      </div>
    </div>
  );
}
