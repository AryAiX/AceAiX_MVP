import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Trash2, ShieldCheck, Search, TrendingUp, Flame, X, BarChart2, ArrowUpRight } from 'lucide-react';

/* ── data ─────────────────────────────────────────────────── */
const INITIAL_LISTS = [
  {
    id: '1',
    name: 'Top Prospects 2026',
    description: 'Best performing athletes for summer recruitment',
    color: '#2F80ED',
    athletes: [
      { id: 'a1', name: 'Khalid Al-Rashidi', position: 'Striker',    club: 'Al Ain FC',    score: 9.2, trend: +0.3, verified: true,  hot: true,  match: 97, image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: 'a2', name: 'Tariq Hassan',      position: 'Midfielder', club: 'Al Hilal',     score: 8.8, trend: +0.1, verified: true,  hot: false, match: 91, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: 'a3', name: 'Rayan Benali',      position: 'Goalkeeper', club: 'Wydad AC',     score: 8.7, trend: +0.5, verified: true,  hot: true,  match: 89, image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: 'a4', name: 'Amir Karimi',       position: 'Center-Back',club: 'Esteghlal FC', score: 8.5, trend: -0.2, verified: true,  hot: false, match: 85, image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: 'a5', name: 'Noura Al-Mansoori', position: 'Sprinter',   club: 'UAE National', score: 9.0, trend: +0.2, verified: true,  hot: false, match: 93, image: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=200' },
    ],
  },
  {
    id: '2',
    name: 'Under-21 Talent',
    description: 'Rising youth prospects to monitor closely',
    color: '#1FB57A',
    athletes: [
      { id: 'a6', name: 'Yusuf Al-Kaabi', position: 'Winger', club: 'Shabab FC', score: 8.5, trend: +0.7, verified: false, hot: true, match: 88, image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=200' },
    ],
  },
  {
    id: '3',
    name: 'Transfer Targets',
    description: 'Priority targets for January window',
    color: '#F5A623',
    athletes: [
      { id: 'a2', name: 'Tariq Hassan', position: 'Midfielder', club: 'Al Hilal', score: 8.8, trend: +0.1, verified: true, hot: false, match: 91, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: 'a3', name: 'Rayan Benali', position: 'Goalkeeper', club: 'Wydad AC', score: 8.7, trend: +0.5, verified: true, hot: true,  match: 89, image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200' },
    ],
  },
];

type WL = typeof INITIAL_LISTS[0];
type Athlete = WL['athletes'][0];

function scoreColor(s: number) {
  if (s >= 9)   return '#B8F135';
  if (s >= 8.5) return '#1FB57A';
  return '#2F80ED';
}

/* ── animated score ring ──────────────────────────────────── */
function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  const color = scoreColor(score);
  useEffect(() => { const t = setTimeout(() => setOffset(circ - (score / 10) * circ), 350); return () => clearTimeout(t); }, [score, circ]);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={2.5} stroke="rgba(255,255,255,0.08)" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={2.5}
        stroke={color} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 3px ${color}80)` }}
      />
      <text x={size/2} y={size/2+4} textAnchor="middle"
        style={{ fill: color, fontSize: 10, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  );
}

/* ── athlete row ──────────────────────────────────────────── */
function AthleteRow({ a, idx, accent, onRemove }:
  { a: Athlete; idx: number; accent: string; onRemove: () => void }) {
  const navigate = useNavigate();
  const [vis, setVis]   = useState(false);
  const [hov, setHov]   = useState(false);
  const [conf, setConf] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60 + idx * 65); return () => clearTimeout(t); }, [idx]);
  const tc = a.trend > 0 ? '#1FB57A' : '#EF5350';
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConf(false); }}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
      style={{
        background: hov ? `${accent}08` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? accent + '28' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hov ? `0 4px 20px rgba(0,0,0,0.30)` : 'none',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateX(0)' : 'translateX(-16px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease, background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}>
      {/* avatar */}
      <div className="relative flex-shrink-0">
        <img src={a.image} alt={a.name} className="w-11 h-11 rounded-xl object-cover object-top"
          style={{ border: '1.5px solid rgba(255,255,255,0.10)' }} />
        {a.verified && (
          <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
            style={{ background: '#1FB57A', boxShadow: '0 0 5px rgba(31,181,122,0.55)' }}>
            <ShieldCheck size={8} className="text-white" />
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white truncate">{a.name}</p>
          {a.hot && <Flame size={10} style={{ color: '#F5A623', flexShrink: 0 }} />}
        </div>
        <p className="text-[11px] text-white/38">{a.position} · {a.club}</p>
      </div>

      {/* match */}
      <div className="hidden sm:block text-right flex-shrink-0 w-14">
        <p className="text-[9px] text-white/25 mb-0.5">AI MATCH</p>
        <p className="text-xs font-bold tabular" style={{ color: a.match >= 95 ? '#B8F135' : a.match >= 90 ? '#1FB57A' : '#2F80ED' }}>{a.match}%</p>
      </div>

      {/* trend */}
      <div className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold w-12 justify-end"
        style={{ color: tc }}>
        <TrendingUp size={10} style={{ transform: a.trend < 0 ? 'rotate(180deg)' : 'none' }} />
        {a.trend > 0 ? '+' : ''}{a.trend}
      </div>

      {/* score */}
      <ScoreRing score={a.score} size={44} />

      {/* actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => navigate(`/recruiter/athletes/${a.id}`)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
          style={{ background: 'rgba(47,128,237,0.09)', border: '1px solid rgba(47,128,237,0.22)', color: '#2F80ED' }}>
          <ArrowUpRight size={11} />
        </button>
        {!conf ? (
          <button onClick={() => setConf(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ background: 'rgba(239,83,80,0.09)', border: '1px solid rgba(239,83,80,0.20)', color: '#EF5350' }}>
            <Trash2 size={11} />
          </button>
        ) : (
          <button onClick={onRemove}
            className="px-2 h-7 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all active:scale-[0.94]"
            style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.40)', color: '#EF5350' }}>
            <X size={9} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

/* ── watchlist sidebar card ───────────────────────────────── */
function ListCard({ wl, active, onClick, idx }:
  { wl: WL; active: boolean; onClick: () => void; idx: number }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80 + idx * 70); return () => clearTimeout(t); }, [idx]);
  const avgScore = wl.athletes.length
    ? (wl.athletes.reduce((s, a) => s + a.score, 0) / wl.athletes.length).toFixed(1)
    : '—';
  return (
    <button onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all"
      style={{
        background: active ? `${wl.color}0E` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${active ? wl.color + '38' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: active ? `0 0 24px ${wl.color}18` : 'none',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateX(0)' : 'translateX(-14px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease, background 0.2s, border-color 0.2s, box-shadow 0.25s',
      }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${wl.color}15`, border: `1px solid ${wl.color}30` }}>
            <Star size={13} style={{ color: wl.color }} fill={active ? wl.color : 'none'} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{wl.name}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{wl.athletes.length} athlete{wl.athletes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold tabular flex-shrink-0" style={{ color: wl.color }}>{avgScore}</span>
      </div>
      <p className="text-[11px] text-white/35 mb-3 line-clamp-1">{wl.description}</p>
      <div className="flex -space-x-2">
        {wl.athletes.slice(0, 4).map(a => (
          <img key={a.id} src={a.image} alt={a.name}
            className="w-6 h-6 rounded-full object-cover object-top"
            style={{ border: `1.5px solid ${active ? wl.color + '60' : 'rgba(12,26,43,0.80)'}` }} />
        ))}
        {wl.athletes.length > 4 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: `${wl.color}18`, border: `1.5px solid rgba(12,26,43,0.80)`, color: wl.color }}>
            +{wl.athletes.length - 4}
          </div>
        )}
      </div>
    </button>
  );
}

/* ── main ─────────────────────────────────────────────────── */
export default function WatchlistsPage() {
  const [lists,     setLists]     = useState(INITIAL_LISTS);
  const [selected,  setSelected]  = useState<WL>(INITIAL_LISTS[0]);
  const [showNew,   setShowNew]   = useState(false);
  const [newName,   setNewName]   = useState('');
  const [newDesc,   setNewDesc]   = useState('');
  const [search,    setSearch]    = useState('');
  const [mounted,   setMounted]   = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const current = lists.find(l => l.id === selected.id) ?? lists[0];
  const filteredAthletes = current.athletes.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase())
  );

  function createList() {
    if (!newName.trim()) return;
    const COLORS = ['#2F80ED', '#1FB57A', '#F5A623', '#B8F135', '#EF5350'];
    const newList: WL = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDesc.trim() || 'My new watchlist',
      color: COLORS[lists.length % COLORS.length],
      athletes: [],
    };
    setLists(prev => [...prev, newList]);
    setSelected(newList);
    setNewName(''); setNewDesc(''); setShowNew(false);
  }

  function removeAthlete(athleteId: string) {
    setLists(prev => prev.map(l =>
      l.id === current.id ? { ...l, athletes: l.athletes.filter(a => a.id !== athleteId) } : l
    ));
  }

  const avgScore = current.athletes.length
    ? (current.athletes.reduce((s, a) => s + a.score, 0) / current.athletes.length).toFixed(1)
    : '—';
  const verifiedCount = current.athletes.filter(a => a.verified).length;
  const topScore = current.athletes.length
    ? Math.max(...current.athletes.map(a => a.score))
    : 0;

  return (
    <div className="max-w-7xl space-y-5 pb-10">

      {/* HEADER */}
      <div className="relative rounded-3xl overflow-hidden px-6 sm:px-8 py-6"
        style={{
          background: 'linear-gradient(135deg,#0B1728 0%,#0F1E2E 55%,#0B1F14 100%)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.19,1,0.22,1)',
        }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(245,166,35,0.14) 0%,transparent 65%)' }} />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(47,128,237,0.09) 0%,transparent 65%)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">My Watchlists</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.30)', color: '#F5A623' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F5A623' }} />
                {lists.length} Lists · {lists.reduce((s, l) => s + l.athletes.length, 0)} Athletes
              </span>
            </div>
            <p className="text-white/40 text-sm">Organize and track your top prospects</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all active:scale-[0.97]"
            style={{ background: '#F5A623', color: '#0C1A2B', boxShadow: '0 4px 18px rgba(245,166,35,0.38)' }}>
            <Plus size={15} /> New Watchlist
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(245,166,35,0.55) 35%,rgba(47,128,237,0.38) 65%,transparent)' }} />
      </div>

      {/* NEW WATCHLIST FORM */}
      {showNew && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.28)', animation: 'slideUp 0.3s ease both' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Create New Watchlist</p>
            <button onClick={() => setShowNew(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)' }}>
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createList()}
              placeholder="Watchlist name…" autoFocus
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="Description (optional)…"
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={createList}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
              style={{ background: '#F5A623', color: '#0C1A2B' }}>
              <Plus size={13} /> Create
            </button>
            <button onClick={() => setShowNew(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* SIDEBAR */}
        <div className="space-y-3">
          {lists.map((wl, i) => (
            <ListCard key={wl.id} wl={wl} idx={i} active={current.id === wl.id}
              onClick={() => { setSelected(wl); setSearch(''); }} />
          ))}

          {/* quick add CTA */}
          <button onClick={() => setShowNew(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(245,166,35,0.35)'; el.style.color = '#F5A623'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.14)'; el.style.color = 'rgba(255,255,255,0.35)'; }}>
            <Plus size={14} /> New Watchlist
          </button>
        </div>

        {/* DETAIL PANEL */}
        <div className="lg:col-span-2 space-y-4">

          {/* panel header */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(135deg,${current.color}0A,rgba(22,39,59,0.95))`, border: `1px solid ${current.color}28`, animation: 'slideUp 0.4s ease 0.12s both' }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${current.color}15`, border: `1px solid ${current.color}30` }}>
                      <Star size={15} style={{ color: current.color }} fill={current.color} />
                    </div>
                    <h2 className="text-lg font-display font-bold text-white">{current.name}</h2>
                  </div>
                  <p className="text-[12px] text-white/40 ml-11">{current.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: `${current.color}10`, border: `1px solid ${current.color}25`, color: current.color }}>
                    <BarChart2 size={11} /> Compare
                  </button>
                </div>
              </div>

              {/* stats strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Athletes',  value: current.athletes.length.toString(), color: current.color },
                  { label: 'Avg Score', value: avgScore, color: scoreColor(parseFloat(avgScore) || 0) },
                  { label: 'Verified',  value: `${verifiedCount}/${current.athletes.length}`, color: '#1FB57A' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl px-3 py-2.5 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-base font-display font-bold tabular" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* search + list */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(22,39,59,0.92)', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideUp 0.4s ease 0.2s both' }}>
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/28" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Filter athletes…"
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#fff' }} />
              </div>
              <span className="text-[11px] text-white/35 flex-shrink-0 tabular">
                {filteredAthletes.length} / {current.athletes.length}
              </span>
            </div>

            <div className="p-4 space-y-2.5">
              {filteredAthletes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Star size={20} style={{ color: 'rgba(255,255,255,0.22)' }} />
                  </div>
                  <p className="text-white/35 text-sm">
                    {current.athletes.length === 0 ? 'No athletes yet' : 'No athletes match your search'}
                  </p>
                <button onClick={() => navigate('/recruiter/search')}
                  className="flex items-center gap-1.5 text-[10px] px-4 py-2 rounded-xl transition-all"
                  style={{ background: `${current.color}10`, border: `1px solid ${current.color}28`, color: current.color }}>
                  <Plus size={11} /> Add from Search
                </button>
                </div>
              ) : (
                filteredAthletes.map((a, i) => (
                  <AthleteRow key={a.id} a={a} idx={i} accent={current.color}
                    onRemove={() => removeAthlete(a.id)} />
                ))
              )}
            </div>

            {/* footer add */}
            {current.athletes.length > 0 && (
              <div className="px-5 pb-4">
                <button className="flex items-center gap-2 text-xs font-semibold transition-all"
                  style={{ color: current.color }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                  <Plus size={13} /> Add athletes from search
                </button>
              </div>
            )}
          </div>

          {/* top performer card */}
          {topScore > 0 && (() => {
            const top = current.athletes.find(a => a.score === topScore)!;
            return (
              <div className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: `linear-gradient(135deg,${current.color}0A,rgba(22,39,59,0.95))`, border: `1px solid ${current.color}22`, animation: 'slideUp 0.4s ease 0.28s both' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${current.color}15`, border: `1px solid ${current.color}28` }}>
                  <Flame size={14} style={{ color: current.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: current.color }}>Top Performer</p>
                  <p className="text-sm font-bold text-white truncate">{top.name}</p>
                  <p className="text-[11px] text-white/35">{top.position}</p>
                </div>
                <img src={top.image} alt={top.name} className="w-12 h-12 rounded-xl object-cover object-top flex-shrink-0"
                  style={{ border: `1.5px solid ${current.color}40` }} />
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-display font-bold tabular" style={{ color: scoreColor(top.score) }}>{top.score}</p>
                  <p className="text-[9px] text-white/25">score</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
