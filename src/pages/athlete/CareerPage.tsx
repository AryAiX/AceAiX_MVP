import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Users, Trophy, ArrowUpRight, Zap,
  MapPin, Clock, ChevronRight, Sparkles, Target,
  BrainCircuit, Star, Flame,
} from 'lucide-react';

/* ── data ──────────────────────────────────────────────────── */
const TRAJECTORY = [
  { year: '2024', level: 'Amateur',      score: 65, projected: false },
  { year: '2025', level: 'Semi-Pro',     score: 74, projected: false },
  { year: '2026', level: 'Semi-Pro',     score: 82, current: true,   projected: false },
  { year: '2027', level: 'Professional', score: 88, projected: true  },
  { year: '2028', level: 'Elite',        score: 92, projected: true  },
];

const COMPARABLES = [
  { name: 'Khalid Al-Rashidi', club: 'Al Ain FC',   similarity: 94, score: 91, avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { name: 'Omar Bin Salem',    club: 'Shabab FC',    similarity: 87, score: 86, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { name: 'Fawzi Hassan',      club: 'Al Wahda',     similarity: 82, score: 84, avatar: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=80' },
];

const OPPORTUNITIES = [
  { title: 'U-23 Trial — Al Ain FC',        type: 'Trial',       deadline: 'Jun 20', location: 'Abu Dhabi', color: '#2F80ED', urgency: 'high'   },
  { title: 'Semi-Pro Contract — Sharjah FC', type: 'Contract',    deadline: 'Jul 1',  location: 'Sharjah',   color: '#1FB57A', urgency: 'medium' },
  { title: 'Academy Scholarship — ASPIRE',   type: 'Scholarship', deadline: 'Jul 15', location: 'Qatar',     color: '#B8F135', urgency: 'low'    },
];

const MILESTONES = [
  { label: 'Professional Move',  pct: 74, color: '#2F80ED', icon: Star    },
  { label: 'Visibility Score',   pct: 82, color: '#B8F135', icon: Zap     },
  { label: 'Career Readiness',   pct: 88, color: '#1FB57A', icon: Target  },
];

/* ── animated progress bar ──────────────────────────────────── */
function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 300); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-full"
        style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 8px ${color}50`, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

/* ── trajectory bar chart ───────────────────────────────────── */
function TrajectoryBars() {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="flex items-end gap-2.5 h-32">
      {TRAJECTORY.map((t, i) => {
        const color = t.current ? '#B8F135' : t.projected ? '#2F80ED' : '#7C8DA6';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            {t.current && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(184,241,53,0.15)', color: '#B8F135', border: '1px solid rgba(184,241,53,0.30)' }}>
                NOW
              </span>
            )}
            {!t.current && <div className="h-[18px]" />}
            <div className="w-full rounded-t-xl relative overflow-hidden"
              style={{
                height: vis ? `${t.score}%` : '0%',
                minHeight: vis ? 8 : 0,
                background: t.projected
                  ? `repeating-linear-gradient(135deg, ${color}30 0px, ${color}30 4px, transparent 4px, transparent 8px)`
                  : `linear-gradient(to top, ${color}cc, ${color}66)`,
                border: t.projected ? `1px dashed ${color}50` : 'none',
                boxShadow: t.current ? `0 0 14px ${color}50` : 'none',
                transition: `height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 90}ms`,
              }} />
            <div className="text-center">
              <p className="text-[10px] font-bold tabular" style={{ color }}>{t.score}</p>
              <p className="text-[9px] text-white/25">{t.year}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── opportunity card ───────────────────────────────────────── */
function OppCard({ opp, delay }: { opp: typeof OPPORTUNITIES[0]; delay: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
      style={{
        background: hov ? `${opp.color}0C` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? opp.color + '30' : 'rgba(255,255,255,0.08)'}`,
        transform: `translateY(${vis ? (hov ? '-2px' : '0') : '12px'}) scale(${vis ? (hov ? 1.01 : 1) : 0.97})`,
        opacity: vis ? 1 : 0,
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s',
        boxShadow: hov ? `0 8px 30px ${opp.color}18` : 'none',
      }}>
      <div className="flex items-start justify-between mb-3">
        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${opp.color}15`, border: `1px solid ${opp.color}28`, color: opp.color }}>
          {opp.type}
        </span>
        <ArrowUpRight size={14} style={{ color: opp.color, opacity: hov ? 1 : 0.3, transition: 'opacity 0.2s' }} />
      </div>
      <h3 className="text-sm font-bold text-white mb-1 leading-snug">{opp.title}</h3>
      <div className="flex items-center gap-1.5 text-white/35 mb-4">
        <MapPin size={10} />
        <span className="text-[11px]">{opp.location}</span>
      </div>
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5 text-white/30">
          <Clock size={10} />
          <span className="text-[10px]">Deadline {opp.deadline}</span>
        </div>
        <button className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95"
          style={{ background: opp.color, color: '#0C1A2B', boxShadow: `0 2px 10px ${opp.color}40` }}>
          Apply
        </button>
      </div>
    </div>
  );
}

/* ── comparable card ────────────────────────────────────────── */
function ComparableCard({ c, delay }: { c: typeof COMPARABLES[0]; delay: number }) {
  const [vis, setVis] = useState(false);
  const [barW, setBarW] = useState(0);
  const [hov, setHov] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setVis(true); setTimeout(() => setBarW(c.similarity), 200); }, delay);
    return () => clearTimeout(t);
  }, [delay, c.similarity]);
  const color = c.similarity >= 90 ? '#B8F135' : c.similarity >= 85 ? '#1FB57A' : '#2F80ED';
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all"
      style={{
        background: hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateX(0)' : 'translateX(-12px)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.19,1,0.22,1), background 0.2s, border-color 0.2s',
      }}>
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
        style={{ border: `2px solid ${color}40`, background: `${color}15` }}>
        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{c.name}</p>
        <p className="text-[11px] text-white/35 mt-0.5">{c.club}</p>
        <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full"
            style={{ width: `${barW}%`, background: color, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-sm font-bold tabular" style={{ color }}>{c.similarity}%</p>
        <p className="text-[10px] text-white/25">match</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-display font-bold text-white tabular">{c.score}</p>
        <p className="text-[10px] text-white/25">score</p>
      </div>
    </div>
  );
}

/* ── main ───────────────────────────────────────────────────── */
export default function CareerPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  return (
    <div className="max-w-6xl space-y-5 pb-10">

      {/* ── HERO HEADER ──────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0C1A2B 0%, #16273B 45%, #0B1E10 100%)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.19,1,0.22,1)',
        }}>
        {/* orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,241,53,0.10) 0%, transparent 70%)', transform: 'translate(40%,-40%)' }} />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(47,128,237,0.07) 0%, transparent 70%)', transform: 'translateY(55%)' }} />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(184,241,53,0.10)', border: '1px solid rgba(184,241,53,0.25)', boxShadow: '0 0 28px rgba(184,241,53,0.12)' }}>
              <BrainCircuit size={22} style={{ color: '#B8F135' }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Career Intelligence</h1>
              <p className="text-white/40 text-sm mt-0.5">AI trajectory forecast &amp; live opportunities</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(184,241,53,0.08)', border: '1px solid rgba(184,241,53,0.22)' }}>
            <Flame size={13} style={{ color: '#B8F135' }} />
            <span className="text-xs font-bold text-volt">On track — Professional move in 12-18 mo</span>
          </div>
        </div>

        {/* energy line */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,241,53,0.45) 40%, rgba(47,128,237,0.30) 70%, transparent)' }} />

        {/* milestone bars */}
        <div className="relative px-6 sm:px-8 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MILESTONES.map((m, i) => (
            <div key={m.label}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.4s ease ${0.1 + i * 0.07}s, transform 0.4s cubic-bezier(0.19,1,0.22,1) ${0.1 + i * 0.07}s`,
              }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <m.icon size={11} style={{ color: m.color }} />
                  <span className="text-[11px] font-semibold text-white/50">{m.label}</span>
                </div>
                <span className="text-[11px] font-bold tabular" style={{ color: m.color }}>{m.pct}%</span>
              </div>
              <Bar pct={m.pct} color={m.color} delay={i * 80} />
            </div>
          ))}
        </div>
      </div>

      {/* ── MID ROW ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* trajectory chart */}
        <div className="card p-6"
          style={{ animation: 'slideUp 0.45s ease 0.15s both' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184,241,53,0.10)', border: '1px solid rgba(184,241,53,0.22)' }}>
              <TrendingUp size={14} style={{ color: '#B8F135' }} />
            </div>
            <h2 className="text-sm font-bold text-white">Trajectory Forecast</h2>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.22)', color: '#2F80ED' }}>
              AI Generated
            </span>
          </div>

          <TrajectoryBars />

          <div className="flex items-center gap-5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Actual',    color: '#7C8DA6', dashed: false },
              { label: 'Current',   color: '#B8F135', dashed: false },
              { label: 'Projected', color: '#2F80ED', dashed: true  },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: l.color }}>
                <span className="w-3 h-2 rounded-sm flex-shrink-0"
                  style={{ background: l.dashed ? 'transparent' : l.color, border: l.dashed ? `1px dashed ${l.color}` : 'none', boxShadow: !l.dashed ? `0 0 5px ${l.color}60` : 'none' }} />
                {l.label}
              </span>
            ))}
          </div>

          {/* AI note */}
          <div className="mt-4 p-4 rounded-xl"
            style={{ background: 'rgba(47,128,237,0.07)', border: '1px solid rgba(47,128,237,0.18)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={11} className="text-azure" />
              <p className="text-[11px] font-bold text-azure">AI Forecast · 74% Confidence</p>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">Based on comparable player progressions and your current trajectory, you're on track for a professional-level move within 12–18 months.</p>
          </div>
        </div>

        {/* comparable players */}
        <div className="card p-6"
          style={{ animation: 'slideUp 0.45s ease 0.22s both' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.22)' }}>
              <Users size={14} style={{ color: '#1FB57A' }} />
            </div>
            <h2 className="text-sm font-bold text-white">Comparable Players</h2>
          </div>
          <div className="space-y-2.5">
            {COMPARABLES.map((c, i) => <ComparableCard key={c.name} c={c} delay={300 + i * 80} />)}
          </div>
          <p className="text-[10px] text-white/20 mt-4">AI-matched on sport, position, age, metrics &amp; progression curves.</p>
        </div>
      </div>

      {/* ── OPPORTUNITIES ────────────────────────────────── */}
      <div className="card p-5"
        style={{ animation: 'slideUp 0.45s ease 0.3s both' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.22)' }}>
              <Trophy size={14} style={{ color: '#F5A623' }} />
            </div>
            <h2 className="text-sm font-bold text-white">Active Opportunities</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold"
              style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', color: '#F5A623' }}>
              {OPPORTUNITIES.length} open
            </span>
            <button className="text-[11px] text-white/30 flex items-center gap-0.5 hover:text-white/60 transition-colors">
              View all <ChevronRight size={11} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {OPPORTUNITIES.map((opp, i) => <OppCard key={opp.title} opp={opp} delay={400 + i * 80} />)}
        </div>
      </div>

    </div>
  );
}
