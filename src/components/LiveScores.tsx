import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Types (mirrors the edge-function schema exactly) ─────────
interface Team {
  name: string;
  crest?: string;
  score?: number;
}

interface Match {
  id: string;
  sport: string;
  league: string;
  leagueLogo?: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: number;
  startTime: string;
  home: Team;
  away: Team;
}

interface LiveScoresResponse {
  matches: Match[];
  cachedAt: string;
  provider: string;
  fromCache: boolean;
  error?: string;
}

// ── Colour helpers ───────────────────────────────────────────
const SPORT_COLORS: Record<string, string> = {
  Football:   '#2F80ED',
  Basketball: '#F5A623',
  Tennis:     '#1FB57A',
  Cricket:    '#9B59B6',
  Rugby:      '#EF5350',
};
function sportColor(sport: string) {
  return SPORT_COLORS[sport] ?? '#7C8DA6';
}

// ── Image with initials fallback ─────────────────────────────
function Crest({ src, name, size = 28 }: { src?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const initial = name.replace(/^(FC|AC|SC|AS|Real|Al|Al-)\s+/i, '').charAt(0).toUpperCase();

  if (!src || err) {
    return (
      <span
        className="rounded-full flex items-center justify-center font-black flex-shrink-0"
        style={{
          width: size, height: size, fontSize: size * 0.38,
          background: 'rgba(47,128,237,0.15)', color: '#2F80ED',
          border: '1px solid rgba(47,128,237,0.2)',
        }}
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src} alt={name}
      width={size} height={size}
      className="rounded-full object-contain flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.05)' }}
      onError={() => setErr(true)}
    />
  );
}

// ── Shimmer skeleton card ────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: 272, minHeight: 168,
        background: '#16273B',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <style>{`
        @keyframes shimmerSlide {
          0%   { background-position: -400px 0 }
          100% { background-position:  400px 0 }
        }
        .shimmer {
          background: linear-gradient(90deg, #16273B 0%, #1E3550 50%, #16273B 100%);
          background-size: 400px 100%;
          animation: shimmerSlide 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="shimmer w-4 h-4 rounded-full" />
          <div className="shimmer h-3 w-28 rounded" />
          <div className="shimmer h-3 w-14 rounded ml-auto" />
        </div>
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="shimmer w-6 h-6 rounded-full" />
            <div className="shimmer h-3.5 w-24 rounded" />
            <div className="shimmer h-5 w-6 rounded ml-auto" />
          </div>
          <div className="shimmer h-px w-full rounded opacity-30" />
          <div className="flex items-center gap-2">
            <div className="shimmer w-6 h-6 rounded-full" />
            <div className="shimmer h-3.5 w-20 rounded" />
            <div className="shimmer h-5 w-6 rounded ml-auto" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="shimmer w-2 h-2 rounded-full" />
          <div className="shimmer h-3 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Match card ───────────────────────────────────────────────
function MatchCard({ match, index }: { match: Match; index: number }) {
  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';

  function formatKickoff(iso: string) {
    return new Date(iso).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });
  }

  const hasScore = match.home.score !== undefined || match.away.score !== undefined;
  const sColor = sportColor(match.sport);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 rounded-2xl overflow-hidden relative cursor-default select-none"
      style={{
        width: 272,
        background: 'rgba(22,39,59,0.9)',
        border: `1px solid ${isLive ? 'rgba(239,83,80,0.25)' : 'rgba(255,255,255,0.07)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isLive ? '0 0 0 1px rgba(239,83,80,0.1), 0 8px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.3)',
      }}
      whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${isLive ? 'rgba(239,83,80,0.3)' : 'rgba(47,128,237,0.2)'}` }}
    >
      {/* Azure energy line — live matches only */}
      {isLive && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
          style={{ background: 'linear-gradient(180deg, #2F80ED 0%, #EF5350 50%, #2F80ED 100%)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* League row */}
        <div className="flex items-center gap-2">
          {match.leagueLogo ? (
            <img src={match.leagueLogo} alt="" width={14} height={14}
              className="rounded-sm object-contain opacity-80 flex-shrink-0"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sColor }} />
          )}
          <span className="text-[11px] font-semibold truncate flex-1 leading-none" style={{ color: '#9DB0C6' }}>
            {match.league}
          </span>
          <span
            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}25` }}
          >
            {match.sport}
          </span>
        </div>

        {/* Teams + Scores */}
        <div className="space-y-2">
          {/* Home */}
          <div className="flex items-center gap-2.5">
            <Crest src={match.home.crest} name={match.home.name} size={24} />
            <span className="text-sm font-bold text-white flex-1 truncate leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {match.home.name}
            </span>
            {hasScore && (
              <span
                className="text-lg font-black tabular-nums leading-none"
                style={{ fontFamily: "'Clash Display', sans-serif", color: match.home.score !== undefined && match.away.score !== undefined && match.home.score > match.away.score ? '#F4F8FC' : '#9DB0C6' }}
              >
                {match.home.score ?? '—'}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Away */}
          <div className="flex items-center gap-2.5">
            <Crest src={match.away.crest} name={match.away.name} size={24} />
            <span className="text-sm font-bold text-white flex-1 truncate leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {match.away.name}
            </span>
            {hasScore && (
              <span
                className="text-lg font-black tabular-nums leading-none"
                style={{ fontFamily: "'Clash Display', sans-serif", color: match.away.score !== undefined && match.home.score !== undefined && match.away.score > match.home.score ? '#F4F8FC' : '#9DB0C6' }}
              >
                {match.away.score ?? '—'}
              </span>
            )}
          </div>
        </div>

        {/* Status footer */}
        <div className="flex items-center gap-2 pt-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {isLive ? (
            <>
              <style>{`
                @keyframes livePulse {
                  0%,100% { opacity:1; transform:scale(1); }
                  50%      { opacity:0.4; transform:scale(1.4); }
                }
              `}</style>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#EF5350', animation: 'livePulse 1.4s ease-in-out infinite' }}
              />
              <span className="text-xs font-black tabular-nums" style={{ color: '#EF5350' }}>
                {match.minute !== undefined ? `${match.minute}'` : 'LIVE'}
              </span>
            </>
          ) : isFinished ? (
            <>
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#9DB0C6' }}
              >FT</span>
            </>
          ) : (
            <>
              <Activity size={10} style={{ color: '#2F80ED', flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: '#9DB0C6' }}>
                {formatKickoff(match.startTime)}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Filter chips ─────────────────────────────────────────────
function FilterChip({ label, active, count, color, onClick }: {
  label: string; active: boolean; count: number; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0"
      style={{
        background: active ? `${color}18` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? color + '40' : 'rgba(255,255,255,0.08)'}`,
        color: active ? color : '#9DB0C6',
      }}
    >
      {label}
      <span
        className="px-1 rounded-sm text-[9px] font-black"
        style={{ background: active ? `${color}25` : 'rgba(255,255,255,0.08)', color: active ? color : 'rgba(255,255,255,0.4)' }}
      >
        {count}
      </span>
    </button>
  );
}

// ── Seconds-ago ticker ───────────────────────────────────────
function SecondsAgo({ since }: { since: number }) {
  const [secs, setSecs] = useState(Math.floor((Date.now() - since) / 1000));
  useEffect(() => {
    const id = setInterval(() => setSecs(Math.floor((Date.now() - since) / 1000)), 1000);
    return () => clearInterval(id);
  }, [since]);
  if (secs < 5)  return <span>just now</span>;
  if (secs < 60) return <span>{secs}s ago</span>;
  return <span>{Math.floor(secs / 60)}m ago</span>;
}

// ── Main component ───────────────────────────────────────────
const POLL_MS = 30_000;

export default function LiveScores() {
  const [matches, setMatches]     = useState<Match[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const [sport, setSport]         = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const fetch = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke<LiveScoresResponse>('live-scores');
      if (fnErr) throw new Error(fnErr.message);
      if (!data)  throw new Error('No response');
      setMatches(data.matches ?? []);
      setUpdatedAt(Date.now());
      if (data.error) setError(data.error); else setError(null);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load scores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(() => fetch(), POLL_MS);
    return () => clearInterval(id);
  }, [fetch]);

  // Track scroll arrow visibility
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, [matches, updateArrows]);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  }

  // Derive available sports + counts
  const sportCounts = matches.reduce<Record<string, number>>((acc, m) => {
    acc[m.sport] = (acc[m.sport] ?? 0) + 1;
    return acc;
  }, {});
  const sports = Object.keys(sportCounts);

  const visible = sport === 'All' ? matches : matches.filter(m => m.sport === sport);
  const liveCount = matches.filter(m => m.status === 'live').length;

  // Reset sport filter if it no longer exists
  useEffect(() => {
    if (sport !== 'All' && !sports.includes(sport)) setSport('All');
  }, [sports, sport]);

  return (
    <section
      className="py-14 border-b"
      style={{ background: '#0A1628', borderColor: 'rgba(255,255,255,0.06)' }}
      aria-label="Live & Upcoming Scores"
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .shimmer, [style*="livePulse"], [style*="animation"] { animation: none !important; }
        }
        .scores-scroll::-webkit-scrollbar { display: none; }
        .scores-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h2
              className="text-2xl lg:text-3xl font-bold leading-none"
              style={{ fontFamily: "'Clash Display', sans-serif", color: '#F4F8FC' }}
            >
              Live &amp; Upcoming
            </h2>

            {/* LIVE pill */}
            {liveCount > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.25)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#EF5350', animation: 'livePulse 1.4s ease-in-out infinite' }}
                />
                {liveCount} Live
              </motion.span>
            )}

            {/* Sport filter chips */}
            {!loading && sports.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <FilterChip
                  label="All" active={sport === 'All'} count={matches.length}
                  color="#2F80ED" onClick={() => setSport('All')}
                />
                {sports.map(s => (
                  <FilterChip
                    key={s} label={s} active={sport === s} count={sportCounts[s]}
                    color={sportColor(s)} onClick={() => setSport(s)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Error badge */}
            {error && (
              <div className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{ background: 'rgba(239,83,80,0.08)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.2)' }}>
                <WifiOff size={10} /> Stale data
              </div>
            )}

            {/* Last updated */}
            {!loading && (
              <span className="text-[11px]" style={{ color: '#9DB0C6' }}>
                <Wifi size={9} className="inline mr-1 opacity-50" />
                Updated <SecondsAgo since={updatedAt} />
              </span>
            )}

            {/* Manual refresh */}
            <button
              onClick={() => fetch(true)}
              disabled={refreshing}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#9DB0C6' }}
              aria-label="Refresh scores"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Carousel ───────────────────────────────────── */}
        <div className="relative">
          {/* Left arrow */}
          <AnimatePresence>
            {canLeft && (
              <motion.button
                key="left-arrow"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center hidden lg:flex"
                style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '4px 0 16px rgba(10,22,40,0.8)' }}
              >
                <ChevronLeft size={16} style={{ color: '#9DB0C6' }} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right arrow */}
          <AnimatePresence>
            {canRight && (
              <motion.button
                key="right-arrow"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center hidden lg:flex"
                style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '-4px 0 16px rgba(10,22,40,0.8)' }}
              >
                <ChevronRight size={16} style={{ color: '#9DB0C6' }} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Fade edge gradients */}
          {canLeft  && <div className="absolute left-0 top-0 bottom-0 w-12 z-[5] pointer-events-none hidden lg:block" style={{ background: 'linear-gradient(90deg,#0A1628,transparent)' }} />}
          {canRight && <div className="absolute right-0 top-0 bottom-0 w-12 z-[5] pointer-events-none hidden lg:block" style={{ background: 'linear-gradient(270deg,#0A1628,transparent)' }} />}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="scores-scroll flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {loading ? (
              // Shimmer skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ scrollSnapAlign: 'start' }}>
                  <SkeletonCard />
                </div>
              ))
            ) : visible.length === 0 ? (
              // Empty state
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl px-12 py-10 w-full"
                style={{ minHeight: 168, background: 'rgba(22,39,59,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.2)' }}>
                  <Activity size={22} style={{ color: '#2F80ED' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#F4F8FC' }}>
                  No live matches right now
                </p>
                <p className="text-xs text-center max-w-xs" style={{ color: '#9DB0C6' }}>
                  Upcoming fixtures will appear here. Check back soon.
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {visible.map((match, i) => (
                  <div key={match.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                    <MatchCard match={match} index={i} />
                  </div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Legend ─────────────────────────────────────── */}
        {!loading && visible.length > 0 && (
          <div className="flex items-center gap-4 mt-4">
            {[
              { dot: '#EF5350', label: 'Live' },
              { dot: '#2F80ED', label: 'Upcoming' },
              { dot: '#9DB0C6', label: 'Finished' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                <span className="text-[10px] font-medium" style={{ color: '#9DB0C6' }}>{label}</span>
              </div>
            ))}
            {error && (
              <div className="flex items-center gap-1.5 ml-auto">
                <AlertCircle size={10} style={{ color: '#EF5350' }} />
                <span className="text-[10px]" style={{ color: '#EF5350' }}>Live feed unavailable — showing last known scores</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
