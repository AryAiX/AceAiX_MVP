import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import { ShieldCheck, Search, Filter, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SPORTS = ['All', 'Football', 'Athletics', 'Basketball', 'Swimming', 'Tennis', 'Boxing'];

const ATHLETES = [
  { id: 'a1', name: 'Khalid Al-Rashidi', position: 'Striker', sport: 'Football', club: 'Al Ain FC', nationality: 'UAE', age: 22, score: 9.2, verified: true, image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Tariq Hassan', position: 'Midfielder', sport: 'Football', club: 'Al Hilal', nationality: 'Saudi Arabia', age: 24, score: 8.8, verified: true, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Noura Al-Mansoori', position: 'Sprinter', sport: 'Athletics', club: 'UAE National', nationality: 'UAE', age: 21, score: 9.0, verified: true, image: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Rayan Benali', position: 'Goalkeeper', sport: 'Football', club: 'Wydad AC', nationality: 'Morocco', age: 25, score: 8.7, verified: true, image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Amir Karimi', position: 'Center-Back', sport: 'Football', club: 'Esteghlal FC', nationality: 'Iran', age: 26, score: 8.5, verified: true, image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Yusuf Al-Kaabi', position: 'Winger', sport: 'Football', club: 'Shabab FC', nationality: 'UAE', age: 20, score: 8.3, verified: false, image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Omar Al-Farsi', position: 'Left-Back', sport: 'Football', club: 'Al Wahda', nationality: 'UAE', age: 23, score: 8.1, verified: true, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Sara Al-Hashemi', position: 'Long Jump', sport: 'Athletics', club: 'Dubai Club', nationality: 'UAE', age: 20, score: 8.6, verified: true, image: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'a1', name: 'Faisal Mahmoud', position: 'Point Guard', sport: 'Basketball', club: 'Al Riyadi', nationality: 'Lebanon', age: 22, score: 8.4, verified: true, image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export default function AthletesPage() {
  const [sport, setSport] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = ATHLETES.filter((a) => {
    if (sport !== 'All' && a.sport !== sport) return false;
    if (query && !a.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />

      {/* Hero */}
      <div className="border-b border-slate-700/50 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Verified Talent</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Browse Top Athletes</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Explore verified professional and semi-professional athletes across the MENA region. Every profile backed by AI scoring and certified medical records.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search athletes by name..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sport === s ? 'bg-blue-600 text-white' : 'bg-navy-700 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-6">{filtered.length} athletes</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((athlete, idx) => (
            <Link key={`${athlete.name}-${idx}`} to={`/athletes/${athlete.id}`} className="card-hover group block">
              <div className="relative mb-4">
                <img src={athlete.image} alt={athlete.name} className="w-full h-44 object-cover rounded-lg" />
                <div className="absolute top-2 right-2 bg-navy-900/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-white">{athlete.score}</span>
                </div>
                {athlete.verified && (
                  <div className="absolute top-2 left-2 bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Verified</span>
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{athlete.name}</h3>
              <p className="text-sm text-slate-400 mb-1">{athlete.position} · {athlete.sport}</p>
              <p className="text-xs text-slate-500 mb-4">{athlete.club} · {athlete.nationality} · Age {athlete.age}</p>
              <span className="btn-primary w-full justify-center text-sm flex items-center gap-1">
                View Profile
                <ChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">Join AceAiX to unlock full profiles, contact athletes, and use AI-powered discovery.</p>
          <Link to="/auth/register" className="btn-primary">Get Started Free</Link>
        </div>
      </div>
    </div>
  );
}
