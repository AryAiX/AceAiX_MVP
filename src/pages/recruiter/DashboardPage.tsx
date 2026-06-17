import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Star, Eye, MessageSquare, ChevronRight, Zap,
  ShieldCheck, TrendingUp, BrainCircuit, Bell, ArrowUpRight,
  Flame, Clock, ArrowRight, UserCircle,
} from 'lucide-react';

/* ── data ─────────────────────────────────────────────────── */
const STATS = [
  { label: 'Saved Searches',     value: 5,   delta: '+2',  up: true,  color: '#2F80ED', icon: Search        },
  { label: 'Watchlist Athletes', value: 18,  delta: '+3',  up: true,  color: '#F5A623', icon: Star          },
  { label: 'Active Outreach',    value: 7,   delta: '-1',  up: false, color: '#1FB57A', icon: MessageSquare },
  { label: 'Profile Views',      value: 142, delta: '+24', up: true,  color: '#B8F135', icon: Eye           },
];

const RECOMMENDED = [
  { id: 'a1', name: 'Khalid Al-Rashidi', position: 'Striker',    club: 'Al Ain FC', score: 9.2, match: 97, goals: 18, assists: 7,  age: 22, verified: true,  hot: true,  image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'a1', name: 'Tariq Hassan',      position: 'Midfielder', club: 'Al Hilal',  score: 8.8, match: 91, goals: 9,  assists: 14, age: 24, verified: true,  hot: false, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'a1', name: 'Yusuf Al-Kaabi',    position: 'Winger',     club: 'Shabab FC', score: 8.5, match: 88, goals: 11, assists: 9,  age: 20, verified: false, hot: true,  image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

const ACTIVITY = [
  { action: 'Viewed profile',       name: 'Khalid Al-Rashidi', time: '2h ago', color: '#2F80ED', icon: Eye           },
  { action: 'Added to watchlist',   name: 'Tariq Hassan',      time: '4h ago', color: '#F5A623', icon: Star          },
  { action: 'Sent contact request', name: 'Amir Karimi',       time: '1d ago', color: '#1FB57A', icon: MessageSquare },
  { action: 'AI match alert',       name: 'Noura Al-Mansoori', time: '1d ago', color: '#B8F135', icon: Zap           },
];

const WATCHLIST = [
  { id: 'a1', name: 'Khalid Al-Rashidi', position: 'Striker',    score: 9.2, trend: '+0.3', up: true,  image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 'a1', name: 'Tariq Hassan',      position: 'Midfielder', score: 8.8, trend: '+0.1', up: true,  image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 'a1', name: 'Yusuf Al-Kaabi',    position: 'Winger',     score: 8.5, trend: '-0.2', up: false, image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 'a1', name: 'Rayan Benali',      position: 'Goalkeeper', score: 8.7, trend: '+0.5', up: true,  image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=80' },
];

const PIPELINE = [
  { stage: 'Scouted',    count: 24, color: '#2F80ED' },
  { stage: 'Contacted',  count: 11, color: '#1FB57A' },
  { stage: 'In Trial',   count: 4,  color: '#F5A623' },
  { stage: 'Offer Sent', count: 2,  color: '#B8F135' },
];
const PIPE_TOTAL = PIPELINE.reduce((s, p) => s + p.count, 0);

/* ── counter ──────────────────────────────────────────────── */
function Counter({ target, delay = 0 }: { target: number; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 28));
      const id = setInterval(() => {
        cur = Math.min(cur + step, target);
        setVal(cur);
        if (cur >= target) clearInterval(id);
      }, 28);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <>{val}</>;
}

/* ── animated bar ─────────────────────────────────────────── */
function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay + 400);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${w}%`, background: `linear-gradient(90deg,${color}60,${color})`, boxShadow: `0 0 8px ${color}55`, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

/* ── stat card ────────────────────────────────────────────── */
function StatCard({ s, idx }: { s: typeof STATS[0]; idx: number }) {
  const [vis, setVis]   = useState(false);
  const [hov, setHov]   = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100 + idx * 75); return () => clearTimeout(t); }, [idx]);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-2xl p-5 cursor-default"
      style={{
        background: hov ? `${s.color}0E` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? s.color + '38' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hov ? `0 8px 32px ${s.color}18` : 'none',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
        transition: 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}>
          <s.icon size={17} style={{ color: s.color }} />
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{
            background: s.up ? 'rgba(31,181,122,0.12)' : 'rgba(239,83,80,0.12)',
            color: s.up ? '#1FB57A' : '#EF5350',
            border: `1px solid ${s.up ? 'rgba(31,181,122,0.28)' : 'rgba(239,83,80,0.28)'}`,
          }}>
          <TrendingUp size={9} style={{ transform: s.up ? 'none' : 'rotate(180deg)' }} />
          {s.delta}
        </span>
      </div>
      <p className="text-3xl font-display font-bold text-white tabular mb-0.5">
        <Counter target={s.value} delay={100 + idx * 75} />
      </p>
      <p className="text-[12px] text-white/40">{s.label}</p>
    </div>
  );
}

/* ── athlete card ─────────────────────────────────────────── */
function AthleteCard({ a, delay }: { a: typeof RECOMMENDED[0]; delay: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  const mc = a.match >= 95 ? '#B8F135' : a.match >= 90 ? '#1FB57A' : '#2F80ED';
  return (
    <Link to={`/athletes/${a.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="block rounded-2xl overflow-hidden"
      style={{
        background: hov ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.40)' : 'none',
        opacity: vis ? 1 : 0,
        transform: vis ? `translateY(${hov ? '-3px' : '0px'})` : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}>
      <div className="relative h-32 overflow-hidden">
        <img src={a.image} alt={a.name} className="w-full h-full object-cover object-top"
          style={{ transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 25%,rgba(11,23,40,0.97))' }} />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {a.verified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(31,181,122,0.90)', color: '#fff', backdropFilter: 'blur(4px)' }}>
              <ShieldCheck size={8} /> Verified
            </span>
          )}
          {a.hot && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(245,166,35,0.90)', color: '#0C1A2B', backdropFilter: 'blur(4px)' }}>
              <Flame size={8} /> Hot
            </span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl font-display font-bold text-sm"
          style={{ background: 'rgba(11,23,40,0.82)', color: '#fff', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.14)' }}>
          {a.score}
        </div>
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="text-sm font-bold text-white leading-tight">{a.name}</p>
          <p className="text-[10px] text-white/45">{a.position} · {a.club}</p>
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">AI Match</span>
          <span className="text-[11px] font-bold" style={{ color: mc }}>{a.match}%</span>
        </div>
        <Bar pct={a.match} color={mc} delay={delay} />

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex gap-3.5">
            {[{ v: a.goals, l: 'Goals' }, { v: a.assists, l: 'Ast' }, { v: a.age, l: 'Age' }].map(x => (
              <div key={x.l} className="text-center">
                <p className="text-sm font-bold text-white">{x.v}</p>
                <p className="text-[9px] text-white/30">{x.l}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {[{ c: '#F5A623', I: Star }, { c: '#2F80ED', I: MessageSquare }].map(({ c, I }) => (
              <button key={c} onClick={e => e.preventDefault()}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: `${c}12`, border: `1px solid ${c}25`, color: c }}>
                <I size={11} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── main ─────────────────────────────────────────────────── */
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  return (
    <div className="max-w-7xl space-y-5 pb-10">

      {/* HERO */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0B1728 0%,#0F1E2E 55%,#0B1F17 100%)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.19,1,0.22,1)',
        }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(47,128,237,0.18) 0%,transparent 68%)' }} />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(31,181,122,0.10) 0%,transparent 68%)' }} />

        <div className="relative px-6 sm:px-8 pt-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(47,128,237,0.13)', border: '1px solid rgba(47,128,237,0.32)', boxShadow: '0 0 30px rgba(47,128,237,0.20)' }}>
              <BrainCircuit size={22} style={{ color: '#2F80ED' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Recruiter Dashboard</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(47,128,237,0.13)', border: '1px solid rgba(47,128,237,0.30)', color: '#2F80ED' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2F80ED' }} />
                  Live
                </span>
              </div>
              <p className="text-white/40 text-sm">AI-powered talent intelligence</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <Link to="/scouts/s1"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.28)', color: '#1FB57A' }}>
              <UserCircle size={14} /> View Profile
            </Link>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}>
              <Bell size={14} />
              Alerts
              <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#EF5350', color: '#fff' }}>3</span>
            </button>
            <Link to="/recruiter/search"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
              style={{ background: '#2F80ED', color: '#fff', boxShadow: '0 4px 20px rgba(47,128,237,0.45)' }}>
              <Search size={14} /> Search Athletes
            </Link>
          </div>
        </div>

        <div className="mx-6 sm:mx-8 mt-5 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(47,128,237,0.55) 35%,rgba(31,181,122,0.38) 65%,transparent)' }} />

        <div className="relative px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">Recruitment Pipeline</p>
            <p className="text-[11px] text-white/25">{PIPE_TOTAL} athletes total</p>
          </div>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
            {PIPELINE.map((p, i) => (
              <div key={p.stage}
                style={{
                  width: mounted ? `${(p.count / PIPE_TOTAL) * 100}%` : '0%',
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}65`,
                  borderRadius: '9999px',
                  transition: `width 0.9s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.1}s`,
                }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            {PIPELINE.map(p => (
              <div key={p.stage} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[11px] text-white/40">{p.stage}</span>
                <span className="text-[11px] font-bold" style={{ color: p.color }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} s={s} idx={i} />)}
      </div>

      {/* AI RECOMMENDATIONS */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.5s ease 0.3s both' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(47,128,237,0.13)', border: '1px solid rgba(47,128,237,0.28)' }}>
              <Zap size={14} style={{ color: '#2F80ED' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Recommendations</h2>
              <p className="text-[11px] text-white/30">Matched to your scouting criteria</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(47,128,237,0.13)', border: '1px solid rgba(47,128,237,0.28)', color: '#2F80ED' }}>
              For You
            </span>
          </div>
          <Link to="/recruiter/search" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#2F80ED' }}>
            View all <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDED.map((a, i) => <AthleteCard key={a.name} a={a} delay={380 + i * 90} />)}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* activity */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.5s ease 0.4s both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,166,35,0.13)', border: '1px solid rgba(245,166,35,0.26)' }}>
                <Clock size={12} style={{ color: '#F5A623' }} />
              </div>
              <h2 className="text-sm font-bold text-white">Recent Activity</h2>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#1FB57A' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1FB57A' }} />
              Live
            </span>
          </div>
          <div className="space-y-0.5">
            {ACTIVITY.map((item, i) => (
              <div key={i}
                onClick={() => navigate('/athletes/a1')}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.03]"
                style={{ animation: `slideUp 0.35s ease ${0.44 + i * 0.07}s both` }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}13`, border: `1px solid ${item.color}25` }}>
                  <item.icon size={11} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/50 leading-snug">{item.action}</p>
                  <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                </div>
                <span className="text-[10px] text-white/22 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* watchlist */}
        <div className="rounded-2xl p-5 lg:col-span-2"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.5s ease 0.46s both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,166,35,0.13)', border: '1px solid rgba(245,166,35,0.26)' }}>
                <Star size={12} style={{ color: '#F5A623' }} />
              </div>
              <h2 className="text-sm font-bold text-white">Watchlist Highlights</h2>
            </div>
            <Link to="/recruiter/watchlists" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#2F80ED' }}>
              View all <ChevronRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {WATCHLIST.map((w, i) => {
              const tc = w.up ? '#1FB57A' : '#EF5350';
              return (
                <div key={w.name}
                  onClick={() => navigate(`/athletes/${w.id}`)}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', animation: `slideUp 0.35s ease ${0.48 + i * 0.07}s both` }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.045)'; el.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.02)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <img src={w.image} alt={w.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    style={{ border: '1.5px solid rgba(255,255,255,0.10)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{w.name}</p>
                    <p className="text-[11px] text-white/35">{w.position}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: tc }}>
                      <TrendingUp size={9} style={{ transform: w.up ? 'none' : 'rotate(180deg)' }} />
                      {w.trend}
                    </span>
                    <div className="text-right">
                      <p className="text-base font-display font-bold text-white tabular">{w.score}</p>
                      <p className="text-[9px] text-white/25">score</p>
                    </div>
                    <button className="w-7 h-7 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
                      style={{ background: 'rgba(47,128,237,0.09)', border: '1px solid rgba(47,128,237,0.22)', color: '#2F80ED' }}>
                      <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        style={{ animation: 'slideUp 0.5s ease 0.54s both' }}>
        {[
          { label: 'Search Athletes', icon: Search,        color: '#2F80ED', to: '/recruiter/search'     },
          { label: 'My Watchlists',   icon: Star,          color: '#F5A623', to: '/recruiter/watchlists' },
          { label: 'Messages',        icon: MessageSquare, color: '#1FB57A', to: '/recruiter/messages'   },
          { label: 'Analytics',       icon: TrendingUp,    color: '#B8F135', to: '/recruiter/analytics'  },
          { label: 'Public Profile',  icon: UserCircle,    color: '#9B59B6', to: '/scouts/s1'            },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group"
            style={{ background: `${a.color}09`, border: `1px solid ${a.color}1A` }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${a.color}14`; el.style.borderColor = `${a.color}35`; el.style.boxShadow = `0 4px 22px ${a.color}16`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${a.color}09`; el.style.borderColor = `${a.color}1A`; el.style.boxShadow = 'none'; }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}15`, border: `1px solid ${a.color}28` }}>
              <a.icon size={14} style={{ color: a.color }} />
            </div>
            <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors truncate">{a.label}</span>
            <ChevronRight size={12} className="ml-auto flex-shrink-0 text-white/18 group-hover:text-white/45 transition-colors" />
          </Link>
        ))}
      </div>

    </div>
  );
}
