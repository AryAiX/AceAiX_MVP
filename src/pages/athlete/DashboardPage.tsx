import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Bot, Eye, Briefcase, ArrowRight, Flame, Trophy,
  MapPin, Calendar, Send, Activity, Heart, Zap, ChevronRight,
  Clock, Target,
} from 'lucide-react';
import ScoreRing from '../../components/ui/ScoreRing';
import StatTile from '../../components/ui/StatTile';
import StatusChip from '../../components/ui/StatusChip';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { AthleteProfile } from '../../types';

const RADAR_ATTRS = [
  { attr: 'Pace',      value: 82 },
  { attr: 'Shooting',  value: 89 },
  { attr: 'Passing',   value: 74 },
  { attr: 'Dribbling', value: 86 },
  { attr: 'Defending', value: 48 },
  { attr: 'Physical',  value: 78 },
];

const TRAJECTORY = [
  { year: '21', score: 6.1 },
  { year: '22', score: 6.8 },
  { year: '23', score: 7.4 },
  { year: '24', score: 8.1 },
  { year: '25', score: 8.7 },
  { year: '26', score: 9.2 },
  { year: '27', score: 9.5 },
  { year: '28', score: 9.7 },
];

const SCOUT_INTEREST = [
  { org: 'Al Ain FC',   initials: 'AA', role: 'Head Scout',         time: '2h ago',     verified: true,  color: '#2F80ED' },
  { org: 'Al Hilal',    initials: 'AH', role: 'Technical Director',  time: '5h ago',     verified: true,  color: '#1FB57A' },
  { org: 'UAE Academy', initials: 'UA', role: 'Development Coach',   time: 'Yesterday',  verified: true,  color: '#B8F135' },
  { org: 'Shabab FC',   initials: 'SF', role: 'Senior Scout',        time: '2 days ago', verified: false, color: '#F5A623' },
];

const OPPORTUNITIES = [
  { title: 'Attacking Midfielder', org: 'Al Jazira Club', location: 'Abu Dhabi, UAE', salary: '€45k–60k', deadline: 'Jul 15', tag: 'Hot Match' },
  { title: 'Forward / Striker',    org: 'Sharjah FC',     location: 'Sharjah, UAE',   salary: '€30k–40k', deadline: 'Jul 22', tag: 'New'       },
  { title: 'Winger (Right)',       org: 'Ajman Club',     location: 'Ajman, UAE',     salary: '€20k–28k', deadline: 'Aug 1',  tag: null        },
];

const AI_MESSAGES = [
  { role: 'assistant', text: "Your off-ball movement score improved 12% over the last 3 matches — you're trending into the top 15% for strikers in the UAE Pro League." },
];

const CHECKLIST = [
  { label: 'Complete profile info',  done: true  },
  { label: 'Upload highlight clips', done: true  },
  { label: 'Medical verification',   done: true  },
  { label: 'Add 3 match records',    done: false },
  { label: 'Get 2 endorsements',     done: false },
];
const completePct = Math.round((CHECKLIST.filter(c => c.done).length / CHECKLIST.length) * 100);

const FORM = [
  { match: 'vs. Emirates FC', result: 'W', score: '8.4', goals: 2, assists: 1 },
  { match: 'vs. Al Dhafra',   result: 'D', score: '7.1', goals: 0, assists: 1 },
  { match: 'vs. Baniyas SC',  result: 'W', score: '9.0', goals: 1, assists: 2 },
  { match: 'vs. Hatta Club',  result: 'L', score: '6.2', goals: 0, assists: 0 },
  { match: 'vs. Fujairah FC', result: 'W', score: '8.7', goals: 2, assists: 0 },
];

function RadarChart() {
  const cx = 90, cy = 90, r = 65;
  const n = RADAR_ATTRS.length;
  const pts = RADAR_ATTRS.map((d, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const v = (d.value / 100) * r;
    return {
      x: cx + v * Math.cos(a), y: cy + v * Math.sin(a),
      lx: cx + (r + 22) * Math.cos(a), ly: cy + (r + 22) * Math.sin(a),
      label: d.attr, value: d.value,
    };
  });
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full">
      {[0.25, 0.5, 0.75, 1].map(lvl => {
        const gpts = RADAR_ATTRS.map((_, i) => {
          const a = (i / n) * 2 * Math.PI - Math.PI / 2;
          return `${cx + lvl * r * Math.cos(a)},${cy + lvl * r * Math.sin(a)}`;
        }).join(' ');
        return <polygon key={lvl} points={gpts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {RADAR_ATTRS.map((_, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <defs>
        <linearGradient id="radarFillL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#B8F135" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#radarFillL)" stroke="#2F80ED" strokeWidth="1.5" />
      {pts.map(p => <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#2F80ED" opacity="0.9" />)}
      {pts.map(p => (
        <text key={p.label} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
          fontSize="7.5" fill="#7C8DA6" fontFamily="Inter, sans-serif">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function LineChart() {
  const W = 260, H = 100, padX = 20, padY = 14;
  const minS = 5.5, maxS = 10.2;
  const pts = TRAJECTORY.map((d, i) => ({
    x: padX + (i / (TRAJECTORY.length - 1)) * (W - padX * 2),
    y: H - padY - ((d.score - minS) / (maxS - minS)) * (H - padY * 2),
    year: d.year, score: d.score,
  }));
  const solidPts = pts.slice(0, 5);
  const dashPts  = pts.slice(4);
  const solidPath = solidPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const dPath     = dashPts.map((p, i)  => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath  = `${solidPath} L${solidPts[solidPts.length - 1].x},${H - padY} L${solidPts[0].x},${H - padY} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="areaFillL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2F80ED" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[7, 8, 9].map(v => {
        const y = H - padY - ((v - minS) / (maxS - minS)) * (H - padY * 2);
        return <line key={v} x1={padX} y1={y} x2={W - padX} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
      })}
      <path d={areaPath} fill="url(#areaFillL)" />
      <path d={solidPath} fill="none" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={dPath} fill="none" stroke="#B8F135" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={i === 4 ? 3.5 : 2.5} fill={i >= 5 ? '#B8F135' : '#2F80ED'} />)}
      {pts.map(p => (
        <text key={p.year} x={p.x} y={H - 2} textAnchor="middle" fontSize="6.5" fill="#7C8DA6" fontFamily="Inter, sans-serif">'{p.year}</text>
      ))}
    </svg>
  );
}

function FormDot({ result }: { result: string }) {
  const cls = result === 'W'
    ? 'bg-emerald/15 text-emerald border-emerald/30'
    : result === 'L'
    ? 'bg-coral/15 text-coral border-coral/30'
    : 'bg-amber/15 text-amber border-amber/30';
  return <span className={`w-7 h-7 rounded-full border text-[10px] font-bold flex items-center justify-center ${cls}`}>{result}</span>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AthleteDashboard() {
  const { profile, user } = useAuth();
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [messages, setMessages] = useState(AI_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Athlete';

  useEffect(() => {
    if (!user) return;
    supabase.from('athlete_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setAthleteProfile(data as AthleteProfile); });
  }, [user]);

  function handleSendMessage() {
    const text = aiInput.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'assistant', text: "Great question! Analyzing your performance data now… I'll have a detailed answer for you in a moment." },
    ]);
    setAiInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  const sport    = athleteProfile?.sport            ?? 'Football';
  const position = athleteProfile?.position_primary ?? 'Striker';
  const club     = athleteProfile?.current_club     ?? 'Dubai SC';
  const level    = athleteProfile?.level            ?? 'Semi-Pro';

  return (
    <div className="max-w-7xl space-y-6 animate-in pb-8">

      {/* ── Cinematic hero (dark per Floodlight spec: "cinematic dark moments") ── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0C1A2B 0%, #16273B 40%, #0A2040 70%, #0C1A2B 100%)' }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #2F80ED 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #B8F135 0%, transparent 70%)', transform: 'translate(-50%, 50%)' }} />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl border-2 border-azure/30 overflow-hidden bg-azure/10 flex items-center justify-center">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name ?? ''} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-azure font-display">{firstName.charAt(0).toUpperCase()}</span>}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald rounded-full border-2 border-[#0C1A2B] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-sm mb-0.5">{getGreeting()}</p>
            <h1 className="text-3xl font-display font-bold text-white truncate">{profile?.full_name ?? firstName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-white/50"><Target size={12} className="text-azure" />{position} · {sport}</span>
              <span className="flex items-center gap-1.5 text-xs text-white/50"><MapPin size={12} className="text-azure" />{club}</span>
              <span className="flex items-center gap-1.5 text-xs text-white/50"><Trophy size={12} className="text-volt" />{level}</span>
              {profile?.is_verified && <VerifiedBadge size="sm" />}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 bg-emerald/10 border border-emerald/20 rounded-xl px-3 py-2">
              <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald">Profile Live</span>
            </div>
            <Link to={`/athletes/${user?.id}`} className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5">
              View Public Profile <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        <div className="relative border-t border-white/[0.06] px-6 sm:px-8 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-white/40 font-medium uppercase tracking-widest">Recent Form</span>
          <div className="flex items-center gap-1.5">{FORM.map((f, i) => <FormDot key={i} result={f.result} />)}</div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-xs text-white/40">Last 5 matches</span>
            <span className="flex items-center gap-1 text-xs text-volt font-semibold"><Flame size={11} />Avg 7.9 rating</span>
          </div>
        </div>
      </div>

      {/* ── Scores + profile completeness ── */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Three rings */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* ring 1 — Scout Reach (volt / top-tier) */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative p-1 rounded-full" style={{ background: 'rgba(184,241,53,0.06)', boxShadow: '0 0 28px rgba(184,241,53,0.12)' }}>
                <ScoreRing score={9.2} size={112} strokeWidth={8} sublabel="Visibility" isTopTier animated />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#B8F135' }}>Scout Reach</p>
                <p className="text-[10px] text-white/35 mt-0.5">Top 8% globally</p>
              </div>
            </div>
            {/* divider */}
            <div className="hidden sm:block h-28 w-px bg-white/[0.08]" />
            {/* ring 2 — vs. Peers (azure) */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative p-1 rounded-full" style={{ background: 'rgba(47,128,237,0.06)', boxShadow: '0 0 28px rgba(47,128,237,0.10)' }}>
                <ScoreRing score={8.7} size={112} strokeWidth={8} sublabel="AI Score" animated />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-azure">vs. Peers</p>
                <p className="text-[10px] text-white/35 mt-0.5">UAE Pro League</p>
              </div>
            </div>
            {/* divider */}
            <div className="hidden sm:block h-28 w-px bg-white/[0.08]" />
            {/* ring 3 — Completeness (emerald) */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative p-1 rounded-full" style={{ background: 'rgba(31,181,122,0.06)', boxShadow: '0 0 28px rgba(31,181,122,0.08)' }}>
                <ScoreRing value={completePct} max={100} size={112} strokeWidth={8} sublabel="Profile" color="#1FB57A" animated />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald">Completeness</p>
                <p className="text-[10px] text-white/35 mt-0.5">{completePct}% done</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block w-px self-stretch bg-rim" />
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Profile Strength</p>
              <span className="text-sm font-bold tabular" style={{ color: completePct >= 80 ? '#1FB57A' : '#2F80ED' }}>{completePct}%</span>
            </div>
            <div className="h-1.5 bg-rim rounded-full overflow-hidden mb-5">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completePct}%`, background: 'linear-gradient(90deg, #2F80ED 0%, #B8F135 100%)' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              {CHECKLIST.map(item => (
                <div key={item.label} className="flex items-center gap-2.5 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald/15 text-emerald' : 'bg-rim text-slate'}`}>
                    {item.done ? <ShieldCheck size={9} /> : <span className="w-1.5 h-1.5 bg-slate/40 rounded-full" />}
                  </div>
                  <span className={item.done ? 'text-ink' : 'text-slate line-through'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile value="284"  label="Scout Views"        trend="up"      trendValue="+23% this month"  accent="azure"   delay={0} />
        <StatTile value="18"   label="Endorsements"       trend="up"      trendValue="+3 this month"    accent="azure"   delay={1} />
        <StatTile value="5"    label="Open Opportunities" trend="neutral" trendValue="2 new today"      isVolt           delay={2} />
        <StatTile value="#47"  label="Regional Rank"      trend="up"      trendValue="↑ 12 spots"       accent="emerald" delay={3} />
      </div>

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Radar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-ink">Attribute Breakdown</p>
            <span className="badge-azure">Season 25/26</span>
          </div>
          <p className="text-xs text-slate mb-3">AI-calculated · {sport}</p>
          <div style={{ height: 200 }}><RadarChart /></div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {RADAR_ATTRS.slice(0, 3).map(a => (
              <div key={a.attr} className="text-center">
                <p className="text-[11px] text-slate">{a.attr}</p>
                <p className="text-sm font-bold tabular" style={{ color: a.value >= 80 ? '#2F80ED' : '#5B6B82' }}>{a.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trajectory */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-ink">Career Trajectory</p>
            <span className="badge-volt">Top 15%</span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-slate"><span className="inline-block w-3 h-0.5 bg-azure rounded-full" />Actual</span>
            <span className="flex items-center gap-1.5 text-xs text-slate"><span className="inline-block w-3 rounded-full" style={{ height: 2, borderTop: '2px dashed #B8F135' }} />Forecast</span>
          </div>
          <div style={{ height: 130 }}><LineChart /></div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-azure/6 border border-azure/15 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate mb-0.5">Current</p>
              <p className="text-sm font-bold text-azure tabular">9.2</p>
            </div>
            <div className="bg-volt/8 border border-volt/20 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate mb-0.5">Forecast '28</p>
              <p className="text-sm font-bold text-ink tabular">9.7</p>
            </div>
            <div className="bg-emerald/6 border border-emerald/15 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate mb-0.5">Δ Since '21</p>
              <p className="text-sm font-bold text-emerald tabular">+3.1</p>
            </div>
          </div>
        </div>

        {/* Medical */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Medical Intelligence</p>
            <VerifiedBadge size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <StatusChip status="cleared" />
            <span className="text-xs text-slate">Full clearance active</span>
          </div>
          <div className="p-3 bg-emerald/6 border border-emerald/15 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity size={12} className="text-emerald" />
              <p className="text-xs text-emerald font-semibold">AI Risk Summary</p>
            </div>
            <p className="text-xs text-slate leading-relaxed">No injury flags. Cardiac and musculoskeletal assessments completed. Next review due Sep 2026.</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Last verified',   value: '4 days ago'       },
              { label: 'Partner clinic',  value: 'Dubai Sports Med' },
              { label: 'Records on file', value: '7 documents'      },
              { label: 'Cardiac fitness', value: 'Excellent'        },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center text-xs">
                <span className="text-slate">{row.label}</span>
                <span className="text-ink font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-coral" />
              <span className="text-xs text-slate">Heart rate avg</span>
              <span className="text-xs text-ink font-semibold ml-auto tabular">68 bpm</span>
            </div>
            <div className="mt-2 h-1.5 bg-rim rounded-full overflow-hidden">
              <div className="h-full bg-emerald rounded-full" style={{ width: '72%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Scout interest */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink">Recent Scout Interest</p>
            <span className="badge-azure flex items-center gap-1"><Eye size={10} />{SCOUT_INTEREST.length} views</span>
          </div>
          <div className="space-y-1">
            {SCOUT_INTEREST.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-page transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border"
                  style={{
                    background: `${s.color}14`,
                    borderColor: `${s.color}28`,
                    color: s.color === '#B8F135' ? '#0C1A2B' : s.color,
                  }}>
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-ink font-medium truncate">{s.org}</p>
                    {s.verified && <ShieldCheck size={11} className="text-emerald flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate">{s.role}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} className="text-slate" />
                  <p className="text-[11px] text-slate">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-xs text-azure flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-azure/5 transition-colors">
            View all 28 scouts <ChevronRight size={12} />
          </button>
        </div>

        {/* Opportunities */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink">Matched Opportunities</p>
            <span className="badge-volt flex items-center gap-1"><Zap size={10} />AI Match</span>
          </div>
          <div className="space-y-3">
            {OPPORTUNITIES.map((opp, i) => (
              <div key={i} className="p-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] hover:border-azure/30 rounded-xl transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-ink group-hover:text-azure transition-colors leading-tight">{opp.title}</p>
                  {opp.tag && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${opp.tag === 'Hot Match' ? 'bg-coral/10 text-coral' : 'bg-azure/10 text-azure'}`}>
                      {opp.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-azure font-medium">{opp.org}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-slate"><MapPin size={9} />{opp.location}</span>
                  <span className="text-[11px] text-emerald font-semibold">{opp.salary}</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate ml-auto"><Calendar size={9} />{opp.deadline}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-xs text-azure flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-azure/5 transition-colors">
            Browse all opportunities <ChevronRight size={12} />
          </button>
        </div>

        {/* AI Coach */}
        <div className="card p-5 relative overflow-hidden flex flex-col" style={{ minHeight: 360 }}>
          <div className="relative flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-azure/10 border border-azure/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot size={17} className="text-azure" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">AI Career Coach</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
                  <p className="text-[11px] text-emerald">Online</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hidden mb-3 max-h-48">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-azure text-white rounded-br-sm'
                      : 'bg-page border border-rim text-ink rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {['Improve my score', 'Matching clubs', 'Training plan'].map(q => (
                <button key={q} onClick={() => setAiInput(q)}
                  className="text-[11px] px-2.5 py-1 bg-azure/8 hover:bg-azure/15 border border-azure/15 hover:border-azure/30 text-azure rounded-full transition-all">
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-auto">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your AI coach..." className="input-field flex-1 text-xs py-2.5" />
              <button onClick={handleSendMessage}
                className="w-9 h-9 bg-azure hover:bg-azure/90 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Match table ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink">Last 5 Match Performances</p>
          <button className="text-xs text-azure flex items-center gap-1 hover:text-azure/80 transition-colors">
            Full history <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate border-b border-rim">
                <th className="text-left pb-2.5 font-medium">Match</th>
                <th className="text-center pb-2.5 font-medium">Result</th>
                <th className="text-center pb-2.5 font-medium">Rating</th>
                <th className="text-center pb-2.5 font-medium">Goals</th>
                <th className="text-center pb-2.5 font-medium">Assists</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rim">
              {FORM.map((f, i) => (
                <tr key={i} className="hover:bg-page transition-colors">
                  <td className="py-2.5 text-ink">{f.match}</td>
                  <td className="py-2.5 text-center"><FormDot result={f.result} /></td>
                  <td className="py-2.5 text-center">
                    <span className="font-bold tabular"
                      style={{ color: Number(f.score) >= 8.5 ? '#1FB57A' : Number(f.score) >= 7 ? '#2F80ED' : '#5B6B82' }}>
                      {f.score}
                    </span>
                  </td>
                  <td className="py-2.5 text-center text-ink font-semibold tabular">{f.goals}</td>
                  <td className="py-2.5 text-center text-ink font-semibold tabular">{f.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
