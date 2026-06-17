import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Filter, Users, TrendingUp, ArrowUpRight, Zap } from 'lucide-react';

const POSITION_COLORS: Record<string, string> = {
  GK: '#F5A623', CB: '#2F80ED', LB: '#2F80ED', RB: '#2F80ED',
  CDM: '#1FB57A', CM: '#1FB57A', CAM: '#B8F135', LW: '#B8F135',
  RW: '#B8F135', ST: '#EF5350', CF: '#EF5350',
};

const SQUAD = [
  { id: 'p1', name: 'Karim Al-Hassan',  pos: 'ST',  num: 9,  age: 21, nat: 'UAE',    score: 92, trend: '+2', up: true,  verified: true,  image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p2', name: 'Omar Al-Farsi',    pos: 'CAM', num: 10, age: 24, nat: 'UAE',    score: 87, trend: '+1', up: true,  verified: true,  image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p3', name: 'Sergio Mendes',    pos: 'LB',  num: 3,  age: 28, nat: 'Brazil', score: 84, trend: '-1', up: false, verified: false, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p4', name: 'James Crawford',   pos: 'CB',  num: 5,  age: 30, nat: 'England',score: 88, trend: '+0', up: true,  verified: true,  image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p5', name: 'Ali Hassan',       pos: 'GK',  num: 1,  age: 26, nat: 'UAE',    score: 85, trend: '+1', up: true,  verified: true,  image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p6', name: 'Fabrizio Moretti', pos: 'CM',  num: 8,  age: 27, nat: 'Italy',  score: 82, trend: '+2', up: true,  verified: false, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p7', name: 'Yousuf Al-Kindi',  pos: 'RW',  num: 7,  age: 22, nat: 'UAE',    score: 79, trend: '+3', up: true,  verified: true,  image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'p8', name: 'Rashid Salem',     pos: 'CDM', num: 6,  age: 29, nat: 'UAE',    score: 81, trend: '-1', up: false, verified: false, image: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const POSITIONS = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];

export default function ClubSquadPage() {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All');

  const filtered = SQUAD.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const mp = posFilter === 'All' || p.pos === posFilter;
    return ms && mp;
  });

  const avgScore = Math.round(SQUAD.reduce((s, p) => s + p.score, 0) / SQUAD.length);

  return (
    <div className="max-w-5xl space-y-5 pb-10">

      {/* Header */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-black text-white mb-0.5">Current Squad</h1>
            <p className="text-xs text-white/40">{SQUAD.length} registered players · Season 2024–25</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Avg AI Score', value: String(avgScore), color: '#B8F135' },
              { label: 'Verified',     value: `${SQUAD.filter(p => p.verified).length}/${SQUAD.length}`, color: '#1FB57A' },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-2 rounded-xl"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
          </div>
          <div className="flex flex-wrap gap-1">
            {POSITIONS.map(p => (
              <button key={p} onClick={() => setPosFilter(p)}
                className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={{
                  background: posFilter === p ? `${POSITION_COLORS[p] ?? '#2F80ED'}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${posFilter === p ? `${POSITION_COLORS[p] ?? '#2F80ED'}35` : 'rgba(255,255,255,0.08)'}`,
                  color: posFilter === p ? (POSITION_COLORS[p] ?? '#2F80ED') : 'rgba(255,255,255,0.4)',
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Squad table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-wider"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
          <span className="w-10" />
          <span>Player</span>
          <span className="w-12 text-center">Pos</span>
          <span className="w-10 text-center hidden sm:block">Age</span>
          <span className="w-16 text-center hidden md:block">Nation</span>
          <span className="w-14 text-center">Score</span>
          <span className="w-8" />
        </div>

        {filtered.map((player, i) => {
          const pc = POSITION_COLORS[player.pos] ?? '#2F80ED';
          const tc = player.up ? '#1FB57A' : '#EF5350';
          return (
            <Link key={player.id} to={`/athletes/${player.id}`}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center gap-3 px-5 py-3 transition-all group"
              style={{
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                animation: `slideUp 0.3s ease ${i * 0.04}s both`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {/* Avatar */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <img src={player.image} alt={player.name} className="w-10 h-10 rounded-xl object-cover"
                  style={{ border: `1.5px solid ${pc}25` }} />
                {player.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#1FB57A', border: '1.5px solid #080F1C', boxShadow: '0 0 6px rgba(31,181,122,0.5)' }}>
                    <ShieldCheck size={8} className="text-white" />
                  </div>
                )}
              </div>

              {/* Name + number */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0"
                    style={{ background: `${pc}18`, color: pc }}>
                    {player.num}
                  </span>
                  <p className="text-sm font-bold text-white truncate group-hover:text-azure transition-colors">{player.name}</p>
                </div>
                <p className="text-[10px] ml-7" style={{ color: 'rgba(255,255,255,0.3)' }}>{player.nat}</p>
              </div>

              {/* Position badge */}
              <div className="w-12 flex justify-center">
                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black"
                  style={{ background: `${pc}18`, color: pc, border: `1px solid ${pc}28` }}>
                  {player.pos}
                </span>
              </div>

              {/* Age */}
              <div className="w-10 text-center hidden sm:block">
                <p className="text-xs font-semibold text-white">{player.age}</p>
              </div>

              {/* Nationality */}
              <div className="w-16 text-center hidden md:block">
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{player.nat}</p>
              </div>

              {/* Score */}
              <div className="w-14 text-center">
                <p className="text-base font-black" style={{ color: '#B8F135' }}>{player.score}</p>
                <p className="text-[9px] font-bold flex items-center justify-center gap-0.5" style={{ color: tc }}>
                  <TrendingUp size={8} style={{ transform: player.up ? 'none' : 'rotate(180deg)' }} />
                  {player.trend}
                </p>
              </div>

              {/* Actions */}
              <div className="w-8 flex justify-end">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.25)', color: '#2F80ED' }}>
                  <ArrowUpRight size={11} />
                </div>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-white/30">No players match your filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
