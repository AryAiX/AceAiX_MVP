import React, { useState, useEffect, useRef } from 'react';
import PublicHeader from '../components/PublicHeader';
import {
  ShieldCheck, Users, Trophy, Globe, ChevronRight,
  Search, MapPin, Zap, Star, ArrowRight, TrendingUp, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Data ───────────────────────────────────────────────── */
const CLUBS = [
  {
    id: 'alwasl',
    name: 'Al Wasl SC',
    shortName: 'Al Wasl',
    initials: 'AW',
    league: 'UAE Pro League',
    country: 'UAE',
    city: 'Dubai',
    founded: 1945,
    athletes: 28,
    verified: true,
    color: '#F5A623',
    followers: '124K',
    score: 94,
    openTrials: 2,
    image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'Champions',
  },
  {
    id: 'alain',
    name: 'Al Ain FC',
    shortName: 'Al Ain',
    initials: 'AA',
    league: 'UAE Pro League',
    country: 'UAE',
    city: 'Al Ain',
    founded: 1968,
    athletes: 28,
    verified: true,
    color: '#2F80ED',
    followers: '98K',
    score: 91,
    openTrials: 3,
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'AFC Champions League',
  },
  {
    id: 'alhilal',
    name: 'Al Hilal',
    shortName: 'Al Hilal',
    initials: 'AH',
    league: 'Saudi Pro League',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    founded: 1957,
    athletes: 34,
    verified: true,
    color: '#1FB57A',
    followers: '312K',
    score: 97,
    openTrials: 1,
    image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'Most Decorated',
  },
  {
    id: 'wydad',
    name: 'Wydad AC',
    shortName: 'Wydad',
    initials: 'WY',
    league: 'Botola Pro',
    country: 'Morocco',
    city: 'Casablanca',
    founded: 1937,
    athletes: 31,
    verified: true,
    color: '#EF5350',
    followers: '178K',
    score: 89,
    openTrials: 4,
    image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'CAF Champions League',
  },
  {
    id: 'aljazira',
    name: 'Al Jazira FC',
    shortName: 'Al Jazira',
    initials: 'AJ',
    league: 'UAE Pro League',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 1974,
    athletes: 25,
    verified: true,
    color: '#8B5CF6',
    followers: '87K',
    score: 86,
    openTrials: 2,
    image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'Rising',
  },
  {
    id: 'sharjah',
    name: 'Sharjah FC',
    shortName: 'Sharjah',
    initials: 'SH',
    league: 'UAE Pro League',
    country: 'UAE',
    city: 'Sharjah',
    founded: 1966,
    athletes: 22,
    verified: false,
    color: '#F5A623',
    followers: '62K',
    score: 81,
    openTrials: 0,
    image: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: '',
  },
];

const LEAGUES = ['All Leagues', 'UAE Pro League', 'Saudi Pro League', 'Botola Pro'];

const PLATFORM_STATS = [
  { value: '850+', label: 'Clubs Registered',  color: '#2F80ED', icon: <Users size={20} />     },
  { value: '24',   label: 'Countries',          color: '#B8F135', icon: <Globe size={20} />     },
  { value: '12K+', label: 'Athletes Listed',    color: '#1FB57A', icon: <Zap size={20} />       },
  { value: '98%',  label: 'Satisfaction Rate',  color: '#F5A623', icon: <Star size={20} />      },
];

/* ─── Animated counter ───────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const steps = 40;
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + to / steps, to);
          setVal(Math.round(cur));
          if (cur >= to) clearInterval(t);
        }, 800 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Club card ──────────────────────────────────────────── */
function ClubCard({ club, index }: { club: typeof CLUBS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/clubs/${club.id}`}
      className="group relative block rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${hovered ? club.color + '40' : 'rgba(255,255,255,0.07)'}`,
        background: '#0D1F33',
        transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 48px ${club.color}18` : '0 4px 16px rgba(0,0,0,0.3)',
        animation: `fadeSlideUp 0.45s ${index * 0.06}s ease both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Cover image */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img src={club.image} alt={club.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,31,51,0.1) 0%, rgba(13,31,51,0.75) 100%)' }} />
        {/* Color accent glow */}
        <div className="absolute inset-0 transition-opacity duration-300"
          style={{ background: `radial-gradient(ellipse at 50% 100%, ${club.color}18, transparent 70%)`, opacity: hovered ? 1 : 0 }} />

        {/* Tag chip */}
        {club.tag && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: `${club.color}20`, border: `1px solid ${club.color}40`, color: club.color, backdropFilter: 'blur(8px)' }}>
            {club.tag}
          </div>
        )}

        {/* Trial badge */}
        {club.openTrials > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(184,241,53,0.15)', border: '1px solid rgba(184,241,53,0.3)', backdropFilter: 'blur(8px)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-volt" style={{ animation: 'liveFlash 1.5s infinite' }} />
            <span className="text-[9px] font-bold text-volt">{club.openTrials} trial{club.openTrials > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Club logo badge */}
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl flex items-center justify-center font-black text-base z-10"
          style={{
            background: `linear-gradient(135deg, ${club.color}25, ${club.color}10)`,
            border: `1.5px solid ${club.color}50`,
            color: club.color,
            boxShadow: `0 4px 16px ${club.color}30`,
          }}>
          {club.initials}
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pt-7 pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-black text-white">{club.name}</h3>
            {club.verified && (
              <ShieldCheck size={13} style={{ color: '#1FB57A', filter: 'drop-shadow(0 0 4px rgba(31,181,122,0.5))' }} />
            )}
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${club.color}12`, border: `1px solid ${club.color}25` }}>
            <Zap size={9} style={{ color: club.color }} />
            <span className="text-[10px] font-black" style={{ color: club.color }}>{club.score}</span>
          </div>
        </div>

        <p className="text-xs font-semibold mb-0.5" style={{ color: club.color }}>{club.league}</p>

        <div className="flex items-center gap-1 text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <MapPin size={9} />
          <span>{club.city}, {club.country}</span>
          <span className="mx-1">·</span>
          <span>Est. {club.founded}</span>
        </div>

        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{club.athletes} players</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{club.followers}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold transition-all"
            style={{ color: hovered ? club.color : 'rgba(255,255,255,0.4)' }}>
            View <ArrowRight size={10} />
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${club.color}, transparent)`,
          opacity: hovered ? 1 : 0,
        }} />
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ClubsPage() {
  const [search,  setSearch]  = useState('');
  const [league,  setLeague]  = useState('All Leagues');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = CLUBS.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchLeague = league === 'All Leagues' || c.league === league;
    return matchSearch && matchLeague;
  });

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes liveFlash   { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes pulseOrb    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.08);opacity:0.9} }
        @keyframes gradShift   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes shimmer     { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
      `}</style>

      <div className="min-h-screen" style={{ background: '#080F1A' }}>
        <PublicHeader />

        {/* ── Hero ──────────────────────────────────── */}
        <div className={`relative overflow-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Background layers */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0A1825 0%,#0D2035 50%,#080F1A 100%)' }} />
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(47,128,237,0.1) 0%,transparent 70%)', animation: 'pulseOrb 8s ease-in-out infinite' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(184,241,53,0.06) 0%,transparent 70%)', animation: 'pulseOrb 10s 3s ease-in-out infinite' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20 text-center">
            {/* Pill label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-azure" style={{ animation: 'liveFlash 2s infinite' }} />
              <span className="text-xs font-bold text-azure tracking-widest uppercase">Club Network</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 leading-none">
              Clubs &
              <span className="block" style={{ background: 'linear-gradient(135deg,#2F80ED,#B8F135)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%', animation: 'gradShift 4s ease infinite' }}>
                Organizations
              </span>
            </h1>
            <p className="text-base max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Connect with top football clubs, federations, and academies across the Middle East and North Africa — all verified on the AceAiX platform.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clubs, cities..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${search ? 'rgba(47,128,237,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: search ? '0 0 0 3px rgba(47,128,237,0.1)' : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Stats band ────────────────────────────── */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PLATFORM_STATS.map((s, i) => (
                <div key={s.label}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{
                    background: `${s.color}08`,
                    border: `1px solid ${s.color}15`,
                    animation: `fadeSlideUp 0.4s ${i * 0.07}s ease both`,
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}15`, color: s.color, boxShadow: `0 0 12px ${s.color}20` }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ──────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 pb-20">

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-lg font-black text-white">{league === 'All Leagues' ? 'All Clubs' : league}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {filtered.length} club{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEAGUES.map(l => (
                <button key={l} onClick={() => setLeague(l)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: league === l ? 'rgba(47,128,237,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${league === l ? 'rgba(47,128,237,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color: league === l ? '#2F80ED' : 'rgba(255,255,255,0.4)',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Club grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {filtered.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.15)' }}>
                  <Search size={24} style={{ color: 'rgba(47,128,237,0.5)' }} />
                </div>
                <p className="text-sm font-bold text-white mb-1">No clubs found</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Featured trial spots */}
          <div className="rounded-3xl overflow-hidden mb-10"
            style={{
              background: 'linear-gradient(135deg,rgba(184,241,53,0.06) 0%,rgba(47,128,237,0.08) 100%)',
              border: '1px solid rgba(184,241,53,0.15)',
            }}>
            <div className="p-8 flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-volt" style={{ animation: 'liveFlash 1.5s infinite' }} />
                  <span className="text-xs font-bold text-volt uppercase tracking-widest">Live Trials</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Open Positions Right Now</h2>
                <p className="text-sm leading-relaxed mb-0" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <strong className="text-volt">12 clubs</strong> have active trial openings across {' '}
                  <strong className="text-azure">24 positions</strong>. Create an AceAiX profile to apply instantly.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-auto">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { value: '12', label: 'Clubs hiring',  color: '#2F80ED' },
                    { value: '24', label: 'Open roles',    color: '#B8F135' },
                    { value: '4d', label: 'Avg deadline',  color: '#1FB57A' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3"
                      style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                      <p className="text-xl font-black leading-none" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <Link to="/auth/register"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#B8F135,#8fd600)', color: '#0C1A2B', boxShadow: '0 4px 20px rgba(184,241,53,0.3)' }}>
                  <Zap size={15} /> Apply to Trials
                </Link>
              </div>
            </div>
          </div>

          {/* Register CTA */}
          <div className="relative overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(135deg,#0D2035,#0A1825)',
              border: '1px solid rgba(47,128,237,0.2)',
            }}>
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(47,128,237,0.1) 0%,transparent 70%)', animation: 'pulseOrb 6s ease-in-out infinite' }} />
            <div className="relative z-10 p-10 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.25)', boxShadow: '0 0 30px rgba(47,128,237,0.15)' }}>
                <Trophy size={28} style={{ color: '#2F80ED' }} />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Register Your Club</h2>
              <p className="text-sm leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 440, margin: '0 auto 28px' }}>
                Join AceAiX to discover verified talent, manage recruitment pipelines, and connect with athletes across the region. Free for clubs to get started.
              </p>
              <Link to="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#2F80ED,#1a5fc4)', boxShadow: '0 6px 24px rgba(47,128,237,0.35)', color: 'white' }}>
                Register Your Club <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
