import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, TrendingUp, BarChart3, Target, Zap,
  Flame, Award, Calendar, ChevronRight, Clock, Star,
  Swords, ShieldCheck, AlertCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AddMatchFlow from '../../components/match/AddMatchFlow';
import MatchStatPanel from '../../components/match/MatchStatPanel';
import SourceBadge from '../../components/match/SourceBadge';

// ── Types ─────────────────────────────────────────────────────
interface Participation {
  id: string;
  sport: string;
  competition_name: string;
  match_date: string;
  opponent_name: string;
  venue: string | null;
  position: string;
  minutes_played: number;
  is_starter: boolean;
  jersey_number: number | null;
  status: 'pending_verification' | 'verified' | 'rejected' | 'unmatched';
  performances?: Performance[];
}

interface Performance {
  id: string;
  source: string;
  source_display: string;
  verified_at: string;
  verified_by: string | null;
  verifier_name: string | null;
  stats: Record<string, number | string>;
  sport: string;
}

// ── Static mock data for charts/percentiles (demo) ───────────
const SEASON_STATS = [
  { label: 'Matches',  value: '—',  icon: Calendar, color: '#1FB57A', pct: 0 },
  { label: 'Minutes',  value: '—',  icon: Clock,    color: '#A78BFA', pct: 0 },
  { label: 'Verified', value: '—',  icon: ShieldCheck, color: '#2F80ED', pct: 0 },
  { label: 'Pending',  value: '—',  icon: AlertCircle, color: '#F5A623', pct: 0 },
];

const PERCENTILES = [
  { metric: 'Goal Rate',       percentile: 84, benchmark: 'UAE Strikers',        color: '#B8F135' },
  { metric: 'Sprint Speed',    percentile: 78, benchmark: 'Arabian Gulf League', color: '#2F80ED' },
  { metric: 'Pass Accuracy',   percentile: 71, benchmark: 'All Forwards',        color: '#1FB57A' },
  { metric: 'Shots on Target', percentile: 88, benchmark: 'UAE U-23',            color: '#F5A623' },
  { metric: 'Duel Success',    percentile: 65, benchmark: 'League Average',      color: '#A78BFA' },
];

const STATUS_STYLE: Record<string, [string, string]> = {
  verified:             ['#1FB57A', 'rgba(31,181,122,0.12)'],
  pending_verification: ['#F5A623', 'rgba(245,166,35,0.12)'],
  rejected:             ['#EF5350', 'rgba(239,83,80,0.12)'],
  unmatched:            ['#A78BFA', 'rgba(167,139,250,0.12)'],
};

function statusLabel(s: string) {
  if (s === 'pending_verification') return 'Pending';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Animated progress ─────────────────────────────────────────
function ProgressBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 200); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}bb, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
          transition: `width 1s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
        }} />
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────
function StatTile({ label, value, icon: Icon, color, delay }: {
  label: string; value: string; icon: React.ElementType; color: string; delay: number;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2.5"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}20`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold tabular leading-none" style={{ color }}>{value}</p>
        <p className="text-[11px] text-white/35 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// ── Participation row expanded panel ──────────────────────────
function ParticipationRow({ part, expanded, onToggle }: {
  part: Participation;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [color, bg] = STATUS_STYLE[part.status] ?? ['#A78BFA', 'rgba(167,139,250,0.12)'];
  const perf = part.performances?.[0];
  const date = new Date(part.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer group"
        style={{
          borderBottom: expanded ? 'none' : '1px solid rgba(255,255,255,0.05)',
          background: expanded ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <td className="py-3 text-white/35 font-medium pr-4 whitespace-nowrap text-xs">{date}</td>
        <td className="py-3 font-semibold text-white pr-4 whitespace-nowrap text-sm">{part.opponent_name}</td>
        <td className="py-3 text-white/40 hidden sm:table-cell pr-4 text-xs">{part.competition_name}</td>
        <td className="py-3 text-white/40 hidden md:table-cell pr-4 text-xs">{part.position}</td>
        <td className="py-3 pr-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: bg, border: `1px solid ${color}30`, color }}>
            {statusLabel(part.status)}
          </span>
        </td>
        <td className="py-3 pr-3 text-right text-white/35 text-xs">{part.minutes_played}'</td>
        <td className="py-3 text-right">
          <ChevronRight size={13} className="ml-auto text-white/20 group-hover:text-white/50 transition-all"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </td>
      </tr>

      {expanded && (
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <td colSpan={7} className="pb-4 px-2">
            {perf ? (
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <MatchStatPanel
                  stats={perf.stats}
                  source={perf.source}
                  sourceDisplay={perf.source_display}
                  verifierName={perf.verifier_name}
                  sport={part.sport}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.18)' }}>
                <AlertCircle size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
                <div>
                  <p className="text-xs font-semibold text-white/70">Awaiting verified statistics</p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {part.status === 'pending_verification'
                      ? 'Stats are being requested from your club or an official data source.'
                      : 'No performance data available for this match.'}
                  </p>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function PerformancePage() {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('participations')
      .select(`
        id, sport, competition_name, match_date, opponent_name, venue,
        position, minutes_played, is_starter, jersey_number, status,
        performances (id, source, source_display, verified_at, verified_by, verifier_name, stats, sport)
      `)
      .eq('athlete_id', user.id)
      .order('match_date', { ascending: false })
      .limit(50);

    setParticipations((data as Participation[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Derived KPIs
  const totalMatches  = participations.length;
  const verified      = participations.filter(p => p.status === 'verified').length;
  const pending       = participations.filter(p => p.status === 'pending_verification').length;
  const totalMinutes  = participations.reduce((s, p) => s + p.minutes_played, 0);

  const tiles = [
    { label: 'Matches',  value: String(totalMatches), icon: Calendar,    color: '#1FB57A' },
    { label: 'Minutes',  value: totalMinutes ? totalMinutes.toLocaleString() : '—', icon: Clock, color: '#A78BFA' },
    { label: 'Verified', value: String(verified),      icon: ShieldCheck, color: '#2F80ED' },
    { label: 'Pending',  value: String(pending),        icon: AlertCircle, color: '#F5A623' },
  ];

  return (
    <>
      {showAdd && (
        <AddMatchFlow
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); loadData(); }}
        />
      )}

      <div className="max-w-6xl space-y-6 pb-10">

        {/* ── HERO ────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0C1A2B 0%, #16273B 50%, #0A2040 100%)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
            transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.19,1,0.22,1)',
          }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(31,181,122,0.10) 0%, transparent 70%)', transform: 'translate(35%,-35%)' }} />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.22)', boxShadow: '0 0 28px rgba(31,181,122,0.12)' }}>
                <BarChart3 size={22} style={{ color: '#1FB57A' }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Performance</h1>
                <p className="text-white/40 text-sm mt-0.5">Verified match records &amp; AI insights</p>
              </div>
            </div>

            <div className="flex gap-6 flex-shrink-0">
              {[
                { label: 'Matches',  val: String(totalMatches), color: '#1FB57A' },
                { label: 'Verified', val: String(verified),     color: '#2F80ED' },
                { label: 'Pending',  val: String(pending),       color: '#F5A623' },
              ].map(k => (
                <div key={k.label} className="text-center">
                  <p className="text-xl font-display font-bold tabular" style={{ color: k.color }}>{k.val}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-all active:scale-95"
              style={{ background: '#1FB57A', color: '#fff', boxShadow: '0 4px 20px rgba(31,181,122,0.35)' }}
            >
              <Plus size={15} /> Add Match
            </button>
          </div>

          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(31,181,122,0.45) 40%, rgba(47,128,237,0.30) 70%, transparent)' }} />

          <div className="px-6 sm:px-8 py-3 flex items-center gap-3">
            <ShieldCheck size={12} style={{ color: '#2F80ED' }} />
            <span className="text-[11px] text-white/30 font-medium">
              Stats are automatically fetched from official data providers. Athletes cannot self-report scores.
            </span>
          </div>
        </div>

        {/* ── STAT TILES ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tiles.map((t, i) => <StatTile key={t.label} {...t} delay={i * 60} />)}
        </div>

        {/* ── PERCENTILE RANKINGS ──────────────────────────── */}
        <div className="card p-6"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
          }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.22)' }}>
              <Target size={14} className="text-azure" />
            </div>
            <h2 className="text-sm font-bold text-white">AI Percentile Rankings</h2>
            <span className="ml-auto badge-azure text-[10px]">Demo</span>
          </div>
          <div className="space-y-4">
            {PERCENTILES.map((p, i) => (
              <div key={p.metric}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white/70">{p.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25">{p.benchmark}</span>
                    <span className="text-xs font-bold tabular" style={{ color: p.color }}>{p.percentile}<span className="text-[9px]">th</span></span>
                  </div>
                </div>
                <ProgressBar pct={p.percentile} color={p.color} delay={300 + i * 70} />
              </div>
            ))}
          </div>
        </div>

        {/* ── MATCH LOG ───────────────────────────────────── */}
        <div className="card p-5"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s',
          }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.20)' }}>
                <Swords size={14} style={{ color: '#1FB57A' }} />
              </div>
              <h2 className="text-sm font-bold text-white">Match Log</h2>
              {!loading && (
                <span className="text-[11px] text-white/25">{totalMatches} match{totalMatches !== 1 ? 'es' : ''}</span>
              )}
            </div>
            <button
              onClick={loadData}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/08 transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.05)', animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : participations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <Swords size={20} className="text-white/20" />
              </div>
              <div className="text-center">
                <p className="text-white/50 text-sm font-medium">No matches yet</p>
                <p className="text-white/25 text-xs mt-1">Declare your first participation to get started</p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
                style={{ background: '#1FB57A', color: '#fff', boxShadow: '0 4px 18px rgba(31,181,122,0.30)' }}
              >
                <Plus size={14} /> Add Match
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Date', 'Opponent', 'Competition', 'Position', 'Status', 'Min', ''].map((h, i) => (
                      <th key={h + i}
                        className={`pb-2.5 font-semibold text-white/30 uppercase tracking-wider text-[10px] ${i >= 5 ? 'text-right' : 'text-left'} ${h === 'Competition' ? 'hidden sm:table-cell' : ''} ${h === 'Position' ? 'hidden md:table-cell' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participations.map(part => (
                    <ParticipationRow
                      key={part.id}
                      part={part}
                      expanded={expandedId === part.id}
                      onToggle={() => setExpandedId(expandedId === part.id ? null : part.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
