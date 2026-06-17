import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, TrendingUp, Users, Eye, MapPin, Star,
  ShieldCheck, Activity, Zap, Globe, Clock, ArrowUpRight,
  ChevronUp, ChevronDown, Flame,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────── */
const WEEKLY_VIEWS = [320, 280, 415, 390, 510, 480, 620];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VIEWS = Math.max(...WEEKLY_VIEWS);

const MONTHLY_VIEWS = [
  980, 1050, 870, 1120, 1380, 1200, 1540, 1480, 1720, 1600, 1840, 1920,
];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MAX_MONTHLY = Math.max(...MONTHLY_VIEWS);

const TOP_LOCATIONS = [
  { city: 'Dubai',       country: 'UAE',          pct: 38, color: '#2F80ED' },
  { city: 'Abu Dhabi',   country: 'UAE',          pct: 25, color: '#B8F135' },
  { city: 'Riyadh',      country: 'Saudi Arabia', pct: 18, color: '#1FB57A' },
  { city: 'Doha',        country: 'Qatar',        pct: 11, color: '#F5A623' },
  { city: 'Casablanca',  country: 'Morocco',      pct:  8, color: '#EF5350' },
];

const RECENT_VIEWS = [
  { viewer: 'Head Scout',          org: 'Al Ain FC',       time: '2h ago',     verified: true,  initials: 'AA', color: '#2F80ED' },
  { viewer: 'Technical Director',  org: 'UAE Academy',     time: '5h ago',     verified: true,  initials: 'UA', color: '#1FB57A' },
  { viewer: 'Recruiter',           org: 'Al Hilal',        time: 'Yesterday',  verified: true,  initials: 'AH', color: '#B8F135' },
  { viewer: 'Senior Scout',        org: 'Wydad AC',        time: 'Yesterday',  verified: false, initials: 'WY', color: '#F5A623' },
  { viewer: 'Agent',               org: 'Unverified',      time: '2 days ago', verified: false, initials: 'AG', color: '#7C8DA6' },
];

const ENGAGEMENT = [
  { label: 'Avg dwell time',  value: '3m 12s', sub: 'vs 1m platform avg',  color: '#B8F135', icon: <Clock size={14} />,    good: true  },
  { label: 'Section read',    value: '78%',    sub: 'career section',       color: '#2F80ED', icon: <Eye size={14} />,      good: true  },
  { label: 'Return visitors', value: '42%',    sub: 'viewed twice+',        color: '#1FB57A', icon: <Activity size={14} />, good: true  },
  { label: 'Msg rate',        value: '22%',    sub: 'of viewers contact',   color: '#F5A623', icon: <Zap size={14} />,      good: true  },
];

/* ─── Animated count-up ─────────────────────────────────── */
function Counter({ to, prefix = '', suffix = '', duration = 900 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const steps = 40;
        const step = to / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + step, to);
          setVal(Math.round(cur));
          if (cur >= to) clearInterval(t);
        }, duration / steps);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ─── Animated bar ──────────────────────────────────────── */
function AnimBar({ pct, color, height, delay = 0 }: { pct: number; color: string; height: number; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setW(pct), delay);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} className="rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${w}%`, background: color, boxShadow: `0 0 8px ${color}50`, transitionDelay: `${delay}ms` }} />
    </div>
  );
}

/* ─── Animated column chart ─────────────────────────────── */
function BarColumn({ value, max, color, label, animated }: { value: number; max: number; color: string; label: string; animated: boolean }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 group">
      <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors tabular-nums">{value}</span>
      <div className="w-full flex items-end" style={{ height: 100 }}>
        <div className="w-full rounded-t-md overflow-hidden relative"
          style={{ height: animated ? `${pct}%` : '2%', transition: 'height 0.7s cubic-bezier(0.19,1,0.22,1)', background: `${color}25`, border: `1px solid ${color}30`, borderBottom: 'none' }}>
          <div className="absolute inset-0 opacity-60"
            style={{ background: `linear-gradient(to top, ${color}, ${color}80)` }} />
          {/* shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
      </div>
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

/* ─── Sparkline SVG ─────────────────────────────────────── */
function Sparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min)) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <circle cx={pts.split(' ').pop()!.split(',')[0]} cy={pts.split(' ').pop()!.split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ─── Live ticker ───────────────────────────────────────── */
const LIVE_EVENTS = [
  'Al Ain FC scout viewed your profile',
  'Added to 2 recruiter watchlists',
  'New match: 94% from Al Hilal',
  'Visibility score: 82 → 83',
  'Profile views up 23% this week',
];
function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_EVENTS.length); setVis(true); }, 350);
    }, 3800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ animation: 'liveFlash 1.5s infinite' }} />
      <span className="text-xs text-white/45 transition-opacity duration-300 truncate" style={{ opacity: vis ? 1 : 0 }}>{LIVE_EVENTS[idx]}</span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function AthleteAnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [mounted, setMounted] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [liveViews, setLiveViews] = useState(1284);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setChartVisible(true); }, { threshold: 0.2 });
    if (chartRef.current) obs.observe(chartRef.current);
    return () => obs.disconnect();
  }, []);

  // Simulate live view count ticking
  useEffect(() => {
    const t = setInterval(() => {
      setLiveViews(n => n + (Math.random() > 0.55 ? 1 : 0));
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const data   = period === 'weekly' ? WEEKLY_VIEWS : MONTHLY_VIEWS;
  const labels = period === 'weekly' ? DAYS : MONTHS;
  const maxVal = period === 'weekly' ? MAX_VIEWS : MAX_MONTHLY;

  const STATS = [
    { label: 'Profile Views (30d)', value: liveViews,  fmt: liveViews.toLocaleString(), change: '+23%', up: true,  color: '#2F80ED', bg: 'rgba(47,128,237,0.08)',  border: 'rgba(47,128,237,0.2)',  icon: <Eye size={16} />,      spark: WEEKLY_VIEWS },
    { label: 'Scout Contacts',      value: 18,          fmt: '18',                        change: '+6 this week', up: true,  color: '#B8F135', bg: 'rgba(184,241,53,0.08)', border: 'rgba(184,241,53,0.2)',  icon: <Users size={16} />,    spark: [4,6,5,8,10,9,12] },
    { label: 'Watchlist Adds',      value: 34,          fmt: '34',                        change: '+12%', up: true,  color: '#1FB57A', bg: 'rgba(31,181,122,0.08)', border: 'rgba(31,181,122,0.2)',  icon: <Star size={16} />,     spark: [8,10,9,14,16,18,22] },
    { label: 'Avg. Dwell Time',     value: 192,         fmt: '3m 12s',                    change: '3× platform avg', up: true,  color: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)',  icon: <Clock size={16} />,    spark: [60,90,80,110,130,150,192] },
  ];

  return (
    <>
      <style>{`
        @keyframes liveFlash    { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeSlideIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseOrb     { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.08);opacity:1} }
      `}</style>

      <div className={`max-w-5xl space-y-5 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* ── Hero header ────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #0D1F33 0%, #132A44 60%, #0A1825 100%)',
            border: '1px solid rgba(47,128,237,0.2)',
            animation: 'fadeSlideIn 0.45s ease both',
          }}>
          {/* Animated background blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(47,128,237,0.12) 0%, transparent 70%)', animation: 'pulseOrb 5s ease-in-out infinite' }} />
          <div className="absolute -bottom-8 left-20 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(184,241,53,0.08) 0%, transparent 70%)', animation: 'pulseOrb 7s 2s ease-in-out infinite' }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Analytics</h1>
              <p className="text-sm text-white/45">How scouts &amp; clubs engage with your profile</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <LiveTicker />
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Globe size={11} /> 14 countries viewing this week
              </div>
            </div>
          </div>
          {/* shimmer sweep */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent)', backgroundSize: '600px 100%', animation: 'gradShift 5s ease infinite' }} />
        </div>

        {/* ── Stat cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <div key={s.label}
              className="relative overflow-hidden rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] cursor-default"
              style={{
                background: s.bg, border: `1px solid ${s.border}`,
                animation: `fadeSlideIn 0.45s ${i * 0.07}s ease both`,
                boxShadow: `0 4px 16px ${s.color}0a`,
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18`, color: s.color, boxShadow: `0 0 14px ${s.color}30` }}>
                  {s.icon}
                </div>
                <Sparkline data={s.spark} color={s.color} />
              </div>
              <p className="text-2xl font-black text-white leading-none">
                {s.label === 'Profile Views (30d)' ? liveViews.toLocaleString() : s.fmt}
              </p>
              <p className="text-xs text-white/40 mt-0.5 leading-tight">{s.label}</p>
              <div className="flex items-center gap-1 mt-2">
                {s.up ? <ChevronUp size={11} style={{ color: s.color }} /> : <ChevronDown size={11} className="text-red-400" />}
                <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.change}</span>
              </div>
              {/* subtle corner blob */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10 pointer-events-none"
                style={{ background: s.color }} />
            </div>
          ))}
        </div>

        {/* ── Chart + engagement side by side ────────── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Views chart */}
          <div ref={chartRef} className="lg:col-span-2 rounded-2xl p-5"
            style={{
              background: '#0F2133',
              border: '1px solid rgba(47,128,237,0.12)',
              animation: 'fadeSlideIn 0.5s 0.15s ease both',
            }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(47,128,237,0.12)', color: '#2F80ED' }}>
                  <BarChart3 size={15} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Profile Views</p>
                  <p className="text-[10px] text-white/30">Unique visits to your profile</p>
                </div>
              </div>
              {/* Period toggle */}
              <div className="flex items-center rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                {(['weekly', 'monthly'] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className="px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                    style={{
                      background: period === p ? 'rgba(47,128,237,0.2)' : 'transparent',
                      color: period === p ? '#2F80ED' : 'rgba(255,255,255,0.35)',
                      borderRight: p === 'weekly' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-2" style={{ height: 130 }}>
              {data.map((v, i) => (
                <BarColumn key={i} value={v} max={maxVal} color="#2F80ED"
                  label={labels[i]} animated={chartVisible} />
              ))}
            </div>

            {/* Mini trend line below */}
            <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <ArrowUpRight size={13} className="text-emerald-400" />
              <span className="text-xs text-white/40">
                Peak: <strong className="text-white">{Math.max(...data).toLocaleString()}</strong> views —
                <span className="text-emerald-400 font-semibold"> trending up {period === 'weekly' ? '93% vs last week' : '38% vs last month'}</span>
              </span>
            </div>
          </div>

          {/* Engagement panel */}
          <div className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
              background: '#0F2133',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'fadeSlideIn 0.5s 0.2s ease both',
            }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(184,241,53,0.1)', color: '#B8F135' }}>
                <Flame size={15} />
              </div>
              <p className="text-sm font-bold text-white">Engagement</p>
            </div>
            {ENGAGEMENT.map((e, i) => (
              <div key={e.label} style={{ animation: `fadeSlideIn 0.4s ${i * 0.08}s ease both` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5" style={{ color: e.color }}>
                    {e.icon}
                    <span className="text-xs text-white/60">{e.label}</span>
                  </div>
                  <span className="text-sm font-black" style={{ color: e.color }}>{e.value}</span>
                </div>
                <AnimBar pct={parseInt(e.value) || 60} color={e.color} height={4} delay={i * 80} />
                <p className="text-[10px] text-white/25 mt-1">{e.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scout Locations + Recent Views ─────────── */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Locations */}
          <div className="rounded-2xl p-5"
            style={{
              background: '#0F2133',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'fadeSlideIn 0.5s 0.25s ease both',
            }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A' }}>
                <MapPin size={15} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Scout Locations</p>
                <p className="text-[10px] text-white/30">Where viewers are based</p>
              </div>
            </div>
            <div className="space-y-4">
              {TOP_LOCATIONS.map((loc, i) => (
                <div key={loc.city} style={{ animation: `fadeSlideIn 0.4s ${i * 0.07}s ease both` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: loc.color, boxShadow: `0 0 6px ${loc.color}` }} />
                      <span className="text-xs text-white/70">{loc.city}</span>
                      <span className="text-[10px] text-white/30">{loc.country}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: loc.color }}>{loc.pct}%</span>
                  </div>
                  <AnimBar pct={loc.pct} color={loc.color} height={5} delay={i * 70} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent views */}
          <div className="rounded-2xl p-5"
            style={{
              background: '#0F2133',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'fadeSlideIn 0.5s 0.3s ease both',
            }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>
                <Eye size={15} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Recent Views</p>
                <p className="text-[10px] text-white/30">Latest profile visitors</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
                Live
              </span>
            </div>
            <div className="space-y-2">
              {RECENT_VIEWS.map((v, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/[0.03]"
                  style={{
                    border: '1px solid rgba(255,255,255,0.04)',
                    animation: `fadeSlideIn 0.4s ${i * 0.07}s ease both`,
                  }}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ background: `${v.color}18`, color: v.color, border: `1px solid ${v.color}30` }}>
                    {v.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-white truncate">{v.viewer}</p>
                      {v.verified && (
                        <ShieldCheck size={11} className="text-emerald-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(31,181,122,0.6))' }} />
                      )}
                    </div>
                    <p className="text-[10px] text-white/35">{v.org}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-white/30">{v.time}</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: v.color, opacity: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI insight banner ───────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(184,241,53,0.07), rgba(47,128,237,0.07))',
            border: '1px solid rgba(184,241,53,0.2)',
            animation: 'fadeSlideIn 0.5s 0.35s ease both',
          }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(184,241,53,0.12)', color: '#B8F135', boxShadow: '0 0 16px rgba(184,241,53,0.2)' }}>
              <Zap size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-0.5">AI Insight</p>
              <p className="text-xs text-white/55 leading-relaxed">
                Your profile views are up <strong className="text-volt">93%</strong> week-over-week, driven by scout traffic from Dubai and Riyadh.
                Three actions could push your visibility score from <strong className="text-volt">82 → 90+</strong>: add a medical badge,
                upload a highlight clip, and request one coach endorsement.
              </p>
            </div>
            <span className="text-[10px] font-bold text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded-full flex-shrink-0">
              +8 pts possible
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
