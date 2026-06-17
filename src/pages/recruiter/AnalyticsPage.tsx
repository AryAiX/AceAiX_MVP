import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Users, BarChart3, Star, Search, Eye, MessageSquare,
  ArrowUpRight, Zap, Target, Activity, Globe, ChevronRight,
  BrainCircuit, Filter, Download,
} from 'lucide-react';

/* ── palette (matches scout portal) ──────────────────────────── */
const C = {
  blue:   '#2F80ED',
  green:  '#1FB57A',
  amber:  '#F5A623',
  lime:   '#B8F135',
  red:    '#EF5350',
  purple: '#9B59B6',
};

/* ── data ─────────────────────────────────────────────────────── */
const KPI = [
  { label: 'Total Searches',      value: 4218, display: '4,218', delta: '+12%', up: true,  color: C.blue,  icon: Search   },
  { label: 'Athletes Contacted',  value: 89,   display: '89',    delta: '+5',   up: true,  color: C.green, icon: MessageSquare },
  { label: 'Watchlist Athletes',  value: 34,   display: '34',    delta: '+8',   up: true,  color: C.amber, icon: Star     },
  { label: 'Avg AI Match Score',  value: 87,   display: '87.4',  delta: '+2.1', up: true,  color: C.lime,  icon: Zap      },
  { label: 'Profile Views',       value: 312,  display: '312',   delta: '+24',  up: true,  color: C.purple,icon: Eye      },
  { label: 'Conversion Rate',     value: 18,   display: '18%',   delta: '-2%',  up: false, color: C.red,   icon: Target   },
];

const WEEKLY = [52, 68, 45, 78, 91, 63, 84];
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHLY = [
  { month: 'Jan', searches: 180, contacted: 22 },
  { month: 'Feb', searches: 220, contacted: 28 },
  { month: 'Mar', searches: 195, contacted: 19 },
  { month: 'Apr', searches: 310, contacted: 41 },
  { month: 'May', searches: 275, contacted: 35 },
  { month: 'Jun', searches: 380, contacted: 52 },
];

const TOP_ATHLETES = [
  { name: 'Khalid Al-Rashidi', position: 'Striker',    views: 14, score: 9.2, match: 97, image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Tariq Hassan',      position: 'Midfielder', views: 11, score: 8.8, match: 91, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Rayan Benali',      position: 'Goalkeeper', views: 9,  score: 8.7, match: 88, image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Noura Al-Mansoori', position: 'Sprinter',   views: 7,  score: 9.0, match: 94, image: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Yusuf Al-Kaabi',    position: 'Winger',     views: 6,  score: 8.5, match: 85, image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=100' },
];

const FUNNEL = [
  { stage: 'Searched',   count: 4218, color: C.blue   },
  { stage: 'Viewed',     count: 312,  color: C.purple },
  { stage: 'Saved',      count: 89,   color: C.amber  },
  { stage: 'Contacted',  count: 34,   color: C.green  },
  { stage: 'Offer Sent', count: 6,    color: C.lime   },
];

const SPORT_DIST = [
  { sport: 'Football',    pct: 58, color: C.blue   },
  { sport: 'Athletics',   pct: 18, color: C.lime   },
  { sport: 'Basketball',  pct: 12, color: C.amber  },
  { sport: 'Swimming',    pct: 8,  color: C.green  },
  { sport: 'Other',       pct: 4,  color: C.purple },
];

/* ── helpers ──────────────────────────────────────────────────── */
function useVisible(delay = 0) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return v;
}

function Counter({ target, delay = 0 }: { target: number; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 32));
      const id = setInterval(() => {
        cur = Math.min(cur + step, target);
        setVal(cur);
        if (cur >= target) clearInterval(id);
      }, 24);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <>{val}</>;
}

function Bar({ pct, color, delay = 0, height = 'h-1.5' }: { pct: number; color: string; delay?: number; height?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay + 500);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className={`${height} rounded-full overflow-hidden`} style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${w}%`,
          background: `linear-gradient(90deg,${color}70,${color})`,
          boxShadow: `0 0 10px ${color}55`,
          transitionTimingFunction: 'cubic-bezier(0.34,1.2,0.64,1)',
        }} />
    </div>
  );
}

/* ── KPI card ─────────────────────────────────────────────────── */
function KpiCard({ k, idx }: { k: typeof KPI[0]; idx: number }) {
  const vis = useVisible(80 + idx * 60);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-2xl p-5 cursor-default"
      style={{
        background: hov ? `${k.color}0D` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? k.color + '38' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hov ? `0 8px 36px ${k.color}20` : 'none',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
        transition: 'opacity 0.42s ease, transform 0.48s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s, box-shadow 0.25s',
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${k.color}16`, border: `1px solid ${k.color}2A` }}>
          <k.icon size={17} style={{ color: k.color }} />
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{
            background: k.up ? 'rgba(31,181,122,0.12)' : 'rgba(239,83,80,0.12)',
            color: k.up ? C.green : C.red,
            border: `1px solid ${k.up ? 'rgba(31,181,122,0.28)' : 'rgba(239,83,80,0.28)'}`,
          }}>
          <TrendingUp size={8} style={{ transform: k.up ? 'none' : 'rotate(180deg)' }} />
          {k.delta}
        </span>
      </div>
      <p className="text-3xl font-display font-bold text-white tabular-nums mb-0.5">
        {k.display.includes('%') || k.display.includes('.')
          ? k.display
          : <><Counter target={k.value} delay={80 + idx * 60} /></>}
      </p>
      <p className="text-[11px] text-white/38">{k.label}</p>
    </div>
  );
}

/* ── bar chart (weekly) ──────────────────────────────────────── */
/* ── weekly bar ──────────────────────────────────────────────── */
function WeeklyBar({ v, i, max, mounted }: { v: number; i: number; max: number; mounted: boolean }) {
  const isMax = v === max;
  const [h, setH] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setH((v / max) * 100), 600 + i * 60);
    return () => clearTimeout(t);
  }, [mounted]);
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      <p className="text-[10px] font-bold" style={{ color: isMax ? C.lime : 'rgba(255,255,255,0.25)', opacity: h > 0 ? 1 : 0, transition: 'opacity 0.3s' }}>{v}</p>
      <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: '96px', background: 'rgba(255,255,255,0.05)' }}>
        <div className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700"
          style={{
            height: `${h}%`,
            background: isMax ? `linear-gradient(to top,${C.lime}60,${C.lime})` : `linear-gradient(to top,${C.blue}40,${C.blue}80)`,
            boxShadow: isMax ? `0 0 14px ${C.lime}55` : `0 0 8px ${C.blue}40`,
            transitionTimingFunction: 'cubic-bezier(0.34,1.4,0.64,1)',
            transitionDelay: `${i * 60}ms`,
          }} />
      </div>
      <p className="text-[10px] text-white/30">{DAYS[i]}</p>
    </div>
  );
}

function WeeklyChart({ mounted }: { mounted: boolean }) {
  const max = Math.max(...WEEKLY);
  return (
    <div className="flex items-end gap-2 sm:gap-3 h-36 pt-2">
      {WEEKLY.map((v, i) => <WeeklyBar key={i} v={v} i={i} max={max} mounted={mounted} />)}
    </div>
  );
}

/* ── monthly row ──────────────────────────────────────────────── */
function MonthlyRow({ m, i, maxS, mounted }: { m: typeof MONTHLY[0]; i: number; maxS: number; mounted: boolean }) {
  const [ws, setWs] = useState(0);
  const [wc, setWc] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => { setWs((m.searches / maxS) * 100); setWc((m.contacted / maxS) * 100); }, 500 + i * 70);
    return () => clearTimeout(t);
  }, [mounted]);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/35 w-8 flex-shrink-0">{m.month}</span>
      <div className="flex-1 space-y-1">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full"
            style={{ width: `${ws}%`, background: `linear-gradient(90deg,${C.blue}60,${C.blue})`, boxShadow: `0 0 8px ${C.blue}45`, transition: `width 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 70}ms` }} />
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full"
            style={{ width: `${wc}%`, background: `linear-gradient(90deg,${C.green}60,${C.green})`, boxShadow: `0 0 6px ${C.green}40`, transition: `width 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 70 + 100}ms` }} />
        </div>
      </div>
      <div className="text-right flex-shrink-0 w-12">
        <p className="text-[11px] font-bold text-white">{m.searches}</p>
        <p className="text-[10px]" style={{ color: C.green }}>{m.contacted}</p>
      </div>
    </div>
  );
}

function MonthlyChart({ mounted }: { mounted: boolean }) {
  const maxS = Math.max(...MONTHLY.map(m => m.searches));
  return (
    <div className="space-y-3 mt-2">
      {MONTHLY.map((m, i) => <MonthlyRow key={m.month} m={m} i={i} maxS={maxS} mounted={mounted} />)}
    </div>
  );
}

/* ── funnel row ──────────────────────────────────────────────── */
function FunnelRow({ f, i, max, mounted }: { f: typeof FUNNEL[0]; i: number; max: number; mounted: boolean }) {
  const pct = (f.count / max) * 100;
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 550 + i * 100);
    return () => clearTimeout(t);
  }, [mounted]);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/50">{f.stage}</span>
        <span className="text-[11px] font-bold" style={{ color: f.color }}>{f.count.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full"
          style={{ width: `${w}%`, background: `linear-gradient(90deg,${f.color}55,${f.color})`, boxShadow: `0 0 10px ${f.color}50`, transition: `width 1s cubic-bezier(0.34,1.2,0.64,1) ${i * 100}ms` }} />
      </div>
    </div>
  );
}

/* ── funnel ──────────────────────────────────────────────────── */
function Funnel({ mounted }: { mounted: boolean }) {
  const max = FUNNEL[0].count;
  return (
    <div className="space-y-3 mt-2">
      {FUNNEL.map((f, i) => <FunnelRow key={f.stage} f={f} i={i} max={max} mounted={mounted} />)}
    </div>
  );
}

/* ── sparkline (inline SVG) ──────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 64, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={pts.split(' ').at(-1)!.split(',')[0]} cy={pts.split(' ').at(-1)!.split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ── top athlete row ─────────────────────────────────────────── */
type Athlete = typeof TOP_ATHLETES[0];
function TopAthleteRow({ a, i, mounted, matchColor }: { a: Athlete; i: number; mounted: boolean; matchColor: (m: number) => string }) {
  const [hov, setHov] = useState(false);
  const mc = matchColor(a.match);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all"
      style={{
        background: hov ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'background 0.15s, border-color 0.15s, opacity 0.4s ease, transform 0.45s ease',
        transitionDelay: `${0.5 + i * 0.06}s`,
      }}>
      <span className="text-sm font-bold w-5 text-center flex-shrink-0"
        style={{ color: i === 0 ? C.amber : i === 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.22)' }}>
        #{i + 1}
      </span>
      <img src={a.image} alt={a.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
        style={{ border: '1.5px solid rgba(255,255,255,0.10)' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{a.name}</p>
        <p className="text-[11px] text-white/35">{a.position}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: mc }}>{a.match}%</p>
          <p className="text-[9px] text-white/25">match</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">{a.score}</p>
          <p className="text-[9px] text-white/25">score</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: C.blue }}>{a.views}</p>
          <p className="text-[9px] text-white/25">views</p>
        </div>
        <Sparkline data={WEEKLY.slice().sort(() => 0.5 - Math.random())} color={mc} />
      </div>
    </div>
  );
}

/* ── main ─────────────────────────────────────────────────────── */
export default function RecruiterAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const matchColor = (score: number) => score >= 95 ? C.lime : score >= 90 ? C.green : C.blue;

  return (
    <div className="max-w-7xl space-y-5 pb-12">

      {/* ── HERO ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0B1728 0%,#0D1D2E 50%,#0B1F17 100%)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.19,1,0.22,1)',
        }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${C.blue}1A 0%,transparent 68%)` }} />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${C.lime}10 0%,transparent 68%)` }} />
        <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${C.green}0D 0%,transparent 68%)` }} />

        <div className="relative px-6 sm:px-8 pt-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${C.lime}14`, border: `1px solid ${C.lime}32`, boxShadow: `0 0 28px ${C.lime}20` }}>
              <BarChart3 size={22} style={{ color: C.lime }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Recruitment Analytics</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${C.green}14`, border: `1px solid ${C.green}30`, color: C.green }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                  Live
                </span>
              </div>
              <p className="text-white/40 text-sm">Track your scouting activity and pipeline performance</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}>
              <Filter size={13} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
              style={{ background: C.blue, color: '#fff', boxShadow: `0 4px 20px ${C.blue}45` }}>
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* pipeline strip */}
        <div className="mx-6 sm:mx-8 mt-5 h-px"
          style={{ background: `linear-gradient(90deg,transparent,${C.blue}55 35%,${C.lime}38 65%,transparent)` }} />
        <div className="px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">Recruitment Funnel Overview</p>
            <p className="text-[11px] text-white/25">4,218 total searches this period</p>
          </div>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
            {FUNNEL.map((f, i) => {
              const pct = (f.count / FUNNEL[0].count) * 100;
              return (
                <div key={f.stage}
                  style={{
                    width: mounted ? `${pct / FUNNEL.length}%` : '0%',
                    background: f.color,
                    boxShadow: `0 0 8px ${f.color}65`,
                    borderRadius: '9999px',
                    transition: `width 1s cubic-bezier(0.34,1.4,0.64,1) ${0.3 + i * 0.1}s`,
                  }} />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            {FUNNEL.map(f => (
              <div key={f.stage} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                <span className="text-[11px] text-white/40">{f.stage}</span>
                <span className="text-[11px] font-bold" style={{ color: f.color }}>{f.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI.map((k, i) => <KpiCard key={k.label} k={k} idx={i} />)}
      </div>

      {/* ── CHARTS ROW ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Search Activity Chart */}
        <div className="lg:col-span-3 rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s',
          }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}28` }}>
                <Activity size={14} style={{ color: C.blue }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Search Activity</h2>
                <p className="text-[10px] text-white/30">Scouting volume over time</p>
              </div>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {(['weekly', 'monthly'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: tab === t ? C.blue : 'transparent',
                    color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                    boxShadow: tab === t ? `0 2px 12px ${C.blue}40` : 'none',
                  }}>
                  {t === 'weekly' ? '7D' : '6M'}
                </button>
              ))}
            </div>
          </div>

          {tab === 'weekly' ? (
            <WeeklyChart mounted={mounted} />
          ) : (
            <>
              <div className="flex items-center gap-4 mb-3">
                {[{ label: 'Searches', color: C.blue }, { label: 'Contacted', color: C.green }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                    <span className="text-[10px] text-white/40">{l.label}</span>
                  </div>
                ))}
              </div>
              <MonthlyChart mounted={mounted} />
            </>
          )}
        </div>

        {/* Sport Distribution */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease 0.42s, transform 0.5s ease 0.42s',
          }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${C.purple}15`, border: `1px solid ${C.purple}28` }}>
              <Globe size={14} style={{ color: C.purple }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sport Distribution</h2>
              <p className="text-[10px] text-white/30">Search breakdown by sport</p>
            </div>
          </div>

          {/* donut-style ring */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  const circ = 2 * Math.PI * 30;
                  return SPORT_DIST.map((s, i) => {
                    const dash = (s.pct / 100) * circ;
                    const gap = circ - dash;
                    const el = (
                      <circle key={s.sport} cx="40" cy="40" r="30"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="10"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                        opacity="0.85"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-display font-bold text-white">58%</p>
                <p className="text-[9px] text-white/35">Football</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {SPORT_DIST.map((s, i) => (
              <div key={s.sport} className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[11px] text-white/50 flex-1">{s.sport}</span>
                <Bar pct={s.pct} color={s.color} delay={i * 80} height="h-1" />
                <span className="text-[11px] font-bold flex-shrink-0 w-8 text-right" style={{ color: s.color }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Top Athletes */}
        <div className="lg:col-span-3 rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease 0.48s, transform 0.5s ease 0.48s',
          }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}28` }}>
                <Star size={14} style={{ color: C.amber }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Most Viewed Athletes</h2>
                <p className="text-[10px] text-white/30">Profiles you've engaged with most</p>
              </div>
            </div>
            <Link to="/recruiter/search" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: C.blue }}>
              Search <ChevronRight size={11} />
            </Link>
          </div>

          <div className="space-y-2">
            {TOP_ATHLETES.map((a, i) => (
              <TopAthleteRow key={a.name} a={a} i={i} mounted={mounted} matchColor={matchColor} />
            ))}
          </div>
        </div>

        {/* Funnel + AI Insights */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Funnel detail */}
          <div className="rounded-2xl p-5 flex-1"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease 0.54s, transform 0.5s ease 0.54s',
            }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${C.green}15`, border: `1px solid ${C.green}28` }}>
                <Target size={14} style={{ color: C.green }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Conversion Funnel</h2>
                <p className="text-[10px] text-white/30">Pipeline drop-off stages</p>
              </div>
            </div>
            <Funnel mounted={mounted} />
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg,${C.blue}0C,${C.purple}0A)`,
              border: `1px solid ${C.blue}20`,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s',
            }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${C.blue}16`, border: `1px solid ${C.blue}30` }}>
                <BrainCircuit size={14} style={{ color: C.blue }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Insights</h2>
                <p className="text-[10px] text-white/30">Powered by match intelligence</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { text: 'Striker searches up 34% vs last month', color: C.blue,   icon: TrendingUp  },
                { text: '3 new high-match athletes in your region', color: C.lime,  icon: Zap         },
                { text: 'Response rate improved to 28%',           color: C.green, icon: Users       },
              ].map((ins, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <ins.icon size={12} className="flex-shrink-0 mt-0.5" style={{ color: ins.color }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{ins.text}</p>
                </div>
              ))}
            </div>
            <Link to="/recruiter/search"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-[0.97]"
              style={{ background: C.blue, color: '#fff', boxShadow: `0 4px 18px ${C.blue}40` }}>
              Find Matching Athletes <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
