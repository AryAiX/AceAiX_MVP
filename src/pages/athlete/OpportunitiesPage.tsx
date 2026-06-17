import { useState, useEffect, useRef } from 'react';
import {
  Briefcase, MapPin, Clock, Star, ShieldCheck,
  Bookmark, BookmarkCheck, Zap, ArrowRight, Filter,
  TrendingUp, CheckCircle, ChevronDown, Flame, Target,
  Award, Globe, DollarSign, Bell, X, Send,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────── */
const OPPORTUNITIES = [
  {
    id: '1', type: 'trial', title: 'First-Team Trial', club: 'Al Ain FC',
    logo: 'https://images.pexels.com/photos/47343/the-ball-stadion-football-the-pitch-47343.jpeg?auto=compress&cs=tinysrgb&w=80',
    location: 'Abu Dhabi, UAE', sport: 'Football', position: 'Striker',
    deadline: '2026-06-30', salary: 'AED 15,000–25,000/mo', verified: true, aiMatch: 94, featured: true,
    description: 'Al Ain FC is conducting trials for their U23 squad ahead of the 2026/27 season. Looking for technically gifted strikers with proven goal-scoring record.',
    tags: ['U23', 'Full-Time', 'Top Flight'],
    accentColor: '#B8F135', bgGrad: 'from-[#B8F135]/10 via-[#2F80ED]/6 to-transparent',
    views: 142, applicants: 18,
  },
  {
    id: '2', type: 'contract', title: 'Professional Contract', club: 'Al Wahda FC',
    logo: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=80',
    location: 'Abu Dhabi, UAE', sport: 'Football', position: 'Midfielder',
    deadline: '2026-07-15', salary: 'AED 22,000/mo', verified: true, aiMatch: 78, featured: false,
    description: 'Seeking a creative midfielder with strong passing range and pressing work-rate for their first-team squad.',
    tags: ['Senior', 'Full-Time'],
    accentColor: '#1FB57A', bgGrad: 'from-[#1FB57A]/10 via-[#2F80ED]/4 to-transparent',
    views: 98, applicants: 11,
  },
  {
    id: '3', type: 'scholarship', title: 'UAE Sports Scholarship', club: 'UAE Athletics Federation',
    logo: 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&w=80',
    location: 'Dubai, UAE', sport: 'Athletics', position: 'All Positions',
    deadline: '2026-08-01', salary: 'Full scholarship + stipend', verified: true, aiMatch: 82, featured: false,
    description: 'Merit-based scholarship program covering training, travel, and monthly allowance for elite athletics prospects.',
    tags: ['Scholarship', 'All Sports'],
    accentColor: '#2F80ED', bgGrad: 'from-[#2F80ED]/10 via-[#B8F135]/4 to-transparent',
    views: 203, applicants: 34,
  },
  {
    id: '4', type: 'trial', title: 'Youth Academy Trial', club: 'Shabab FC',
    logo: 'https://images.pexels.com/photos/186239/pexels-photo-186239.jpeg?auto=compress&cs=tinysrgb&w=80',
    location: 'Dubai, UAE', sport: 'Football', position: 'Winger / Forward',
    deadline: '2026-06-25', salary: 'TBD', verified: false, aiMatch: 71, featured: false,
    description: 'Open trial for the youth academy U21 team. Both local and regional talent welcome.',
    tags: ['U21', 'Academy'],
    accentColor: '#F5A623', bgGrad: 'from-[#F5A623]/10 via-[#EF5350]/4 to-transparent',
    views: 67, applicants: 9,
  },
  {
    id: '5', type: 'contract', title: 'National Team Camp', club: 'Saudi Football Federation',
    logo: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=80',
    location: 'Riyadh, Saudi Arabia', sport: 'Football', position: 'All Positions',
    deadline: '2026-07-05', salary: 'Per diem + bonuses', verified: true, aiMatch: 65, featured: false,
    description: 'Selection camp for the Saudi U23 national team ahead of the 2026 GCC Games.',
    tags: ['National Team', 'U23'],
    accentColor: '#EF5350', bgGrad: 'from-[#EF5350]/10 via-[#F5A623]/4 to-transparent',
    views: 311, applicants: 52,
  },
];

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  trial:       { label: 'Trial',       color: '#F2C94C', bg: 'rgba(242,201,76,0.15)',   icon: <Target size={10} />  },
  contract:    { label: 'Contract',    color: '#1FB17A', bg: 'rgba(31,177,122,0.15)',   icon: <Award size={10} />   },
  scholarship: { label: 'Scholarship', color: '#2F80ED', bg: 'rgba(47,128,237,0.15)',   icon: <Globe size={10} />   },
};

const FILTERS = [
  { id: 'all',         label: 'All',          count: OPPORTUNITIES.length },
  { id: 'trial',       label: 'Trials',       count: OPPORTUNITIES.filter(o => o.type === 'trial').length },
  { id: 'contract',    label: 'Contracts',    count: OPPORTUNITIES.filter(o => o.type === 'contract').length },
  { id: 'scholarship', label: 'Scholarships', count: OPPORTUNITIES.filter(o => o.type === 'scholarship').length },
];

/* ─── Match Ring with entrance animation ─────────────────── */
function MatchRing({ pct, size = 52 }: { pct: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const dash = animated ? (pct / 100) * c : 0;
  const color = pct >= 85 ? '#B8F135' : pct >= 70 ? '#2F80ED' : '#7C8DA6';
  const glow = pct >= 85 ? '0 0 12px rgba(184,241,53,0.6)' : pct >= 70 ? '0 0 12px rgba(47,128,237,0.6)' : 'none';

  return (
    <div ref={ref} className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(${glow})` }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.19,1,0.22,1)' }} />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
        <span className="text-[7px] text-white/30 font-medium mt-0.5">AI</span>
      </div>
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = to / 30;
        const t = setInterval(() => {
          start = Math.min(start + step, to);
          setVal(Math.round(start));
          if (start >= to) clearInterval(t);
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Deadline urgency bar ───────────────────────────────── */
function DeadlinePill({ deadline }: { deadline: string }) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  const urgent = days <= 7;
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{
        color: urgent ? '#EF5350' : '#7C8DA6',
        background: urgent ? 'rgba(239,83,80,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${urgent ? 'rgba(239,83,80,0.25)' : 'rgba(255,255,255,0.08)'}`,
        animation: urgent ? 'urgentPulse 2s ease-in-out infinite' : 'none',
      }}>
      <Clock size={9} />
      {urgent ? `${days}d left!` : `${days} days`}
    </span>
  );
}

/* ─── Floating particles ─────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    color: ['#B8F135', '#2F80ED', '#1FB57A', '#F5A623'][Math.floor(Math.random() * 4)],
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full opacity-20"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.color,
            animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }} />
      ))}
    </div>
  );
}

/* ─── Apply modal ────────────────────────────────────────── */
function ApplyModal({ opp, onClose, onApply }: { opp: typeof OPPORTUNITIES[0]; onClose: () => void; onApply: () => void }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = () => {
    setSending(true);
    setTimeout(() => { onApply(); onClose(); }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.12)', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="relative p-5 pb-4" style={{ background: 'linear-gradient(135deg, rgba(47,128,237,0.12), rgba(184,241,53,0.06))' }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <X size={14} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
              <img src={opp.logo} alt={opp.club} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{opp.title}</h3>
              <p className="text-xs text-white/50">{opp.club} · {opp.location}</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Message (optional)</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
              placeholder="Introduce yourself to the recruiter..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/25 resize-none focus:outline-none focus:border-azure/50 transition-colors" />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(184,241,53,0.06)', border: '1px solid rgba(184,241,53,0.15)' }}>
            <Zap size={13} className="text-volt flex-shrink-0" />
            <p className="text-xs text-white/60">Your AI-verified profile will be shared with the recruiter automatically.</p>
          </div>
          <button onClick={handleSubmit} disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: sending ? 'rgba(184,241,53,0.3)' : '#B8F135', color: '#0C1A2B', transform: sending ? 'scale(0.98)' : 'scale(1)' }}>
            {sending ? <><span className="animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" /> Sending...</> : <><Send size={14} /> Submit Application</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function OpportunitiesPage() {
  const [filter, setFilter]     = useState('all');
  const [sort, setSort]         = useState<'match' | 'deadline'>('match');
  const [saved, setSaved]       = useState<Set<string>>(new Set());
  const [applied, setApplied]   = useState<Set<string>>(new Set());
  const [sortOpen, setSortOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState<typeof OPPORTUNITIES[0] | null>(null);
  const [mounted, setMounted]   = useState(false);
  const [liveCount, setLiveCount] = useState(47);

  useEffect(() => { setMounted(true); }, []);

  // Simulate live applicant count ticking
  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(n => n + (Math.random() > 0.6 ? 1 : 0));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = OPPORTUNITIES
    .filter(o => filter === 'all' || o.type === filter)
    .sort((a, b) => sort === 'match' ? b.aiMatch - a.aiMatch : a.deadline.localeCompare(b.deadline));

  const featured = OPPORTUNITIES.find(o => o.featured && (filter === 'all' || o.type === filter));
  const rest = filtered.filter(o => !o.featured);

  const toggleSave = (id: string) => setSaved(s => { const n = new Set(s); s.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <>
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          33%       { transform: translate(12px, -20px) scale(1.2); opacity: 0.3; }
          66%       { transform: translate(-8px, -12px) scale(0.9); opacity: 0.1; }
        }
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,83,80,0); }
          50%       { box-shadow: 0 0 0 4px rgba(239,83,80,0.2); }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(184,241,53,0.0); }
          50%       { box-shadow: 0 0 0 6px rgba(184,241,53,0.15); }
        }
        @keyframes liveFlash {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      <div className={`max-w-4xl space-y-6 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* ── Hero Header ───────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, #0F2133 0%, #132A42 50%, #0C1A2B 100%)',
            border: '1px solid rgba(47,128,237,0.2)',
            animation: 'fadeSlideIn 0.5s ease both',
          }}>
          <Particles />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: 'liveFlash 1.5s ease-in-out infinite', boxShadow: '0 0 8px #1FB57A' }} />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Board</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Opportunities</h1>
              <p className="text-sm text-white/50">Trials, contracts &amp; scholarships — AI-matched to your profile</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(184,241,53,0.08)', border: '1px solid rgba(184,241,53,0.2)' }}>
                <p className="text-lg font-black text-volt leading-none"><Counter to={filtered.length} /></p>
                <p className="text-[10px] text-white/40 mt-0.5">Matched</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)' }}>
                <p className="text-lg font-black leading-none" style={{ color: '#EF5350' }}>{liveCount}</p>
                <p className="text-[10px] text-white/40 mt-0.5">Viewing</p>
              </div>
            </div>
          </div>

          {/* Subtle shimmer sweep */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
            backgroundSize: '800px 100%',
            animation: 'shimmer 4s linear infinite',
          }} />
        </div>

        {/* ── Stats Strip ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Applied',  value: applied.size, icon: <CheckCircle size={16} />, color: '#1FB57A', glow: 'rgba(31,181,122,0.3)', bg: 'rgba(31,181,122,0.08)',  border: 'rgba(31,181,122,0.2)'  },
            { label: 'Saved',    value: saved.size,   icon: <Bookmark size={16} />,    color: '#2F80ED', glow: 'rgba(47,128,237,0.3)',  bg: 'rgba(47,128,237,0.08)',  border: 'rgba(47,128,237,0.2)'  },
            { label: 'Trending', value: liveCount,    icon: <Flame size={16} />,        color: '#EF5350', glow: 'rgba(239,83,80,0.3)',   bg: 'rgba(239,83,80,0.08)',   border: 'rgba(239,83,80,0.2)'   },
          ].map((s, i) => (
            <div key={s.label}
              className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: s.bg, border: `1px solid ${s.border}`,
                animation: `fadeSlideIn 0.5s ${i * 0.08}s ease both`,
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}20`, color: s.color, boxShadow: `0 0 16px ${s.glow}` }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-black text-white leading-none">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10"
                style={{ background: s.color }} />
            </div>
          ))}
        </div>

        {/* ── Filter + Sort Bar ─────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map((f, i) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  background: filter === f.id ? 'rgba(47,128,237,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${filter === f.id ? 'rgba(47,128,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: filter === f.id ? '#2F80ED' : 'rgba(255,255,255,0.45)',
                  boxShadow: filter === f.id ? '0 0 16px rgba(47,128,237,0.15)' : 'none',
                  animation: `fadeSlideIn 0.4s ${i * 0.05}s ease both`,
                }}>
                {f.label}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: filter === f.id ? 'rgba(47,128,237,0.2)' : 'rgba(255,255,255,0.06)', color: filter === f.id ? '#2F80ED' : 'rgba(255,255,255,0.3)' }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-shrink-0">
            <button onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <Filter size={12} /> Sort <ChevronDown size={11} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-10 w-48 rounded-xl overflow-hidden z-20"
                style={{ background: '#1A2E45', border: '1px solid rgba(255,255,255,0.12)', animation: 'fadeSlideIn 0.15s ease' }}>
                {[{ id: 'match', label: 'Best AI Match', icon: <Zap size={12} /> }, { id: 'deadline', label: 'Earliest Deadline', icon: <Clock size={12} /> }].map(o => (
                  <button key={o.id} onClick={() => { setSort(o.id as any); setSortOpen(false); }}
                    className="w-full flex items-center gap-2 text-left px-4 py-3 text-sm transition-colors"
                    style={{ color: sort === o.id ? '#2F80ED' : 'rgba(255,255,255,0.55)', background: sort === o.id ? 'rgba(47,128,237,0.08)' : 'transparent' }}>
                    <span style={{ color: sort === o.id ? '#2F80ED' : 'rgba(255,255,255,0.3)' }}>{o.icon}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Featured Card ─────────────────────────────── */}
        {featured && (
          <div className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(184,241,53,0.07) 0%, rgba(47,128,237,0.09) 60%, rgba(12,26,43,0.95) 100%)',
              border: '1px solid rgba(184,241,53,0.25)',
              animation: 'fadeSlideIn 0.55s ease both',
              boxShadow: '0 0 40px rgba(184,241,53,0.06), 0 4px 24px rgba(0,0,0,0.4)',
            }}>
            <Particles />

            {/* Top badge row */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-black text-volt bg-volt/15 border border-volt/30 px-2.5 py-1 rounded-full"
                  style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
                  <Zap size={9} fill="currentColor" /> TOP MATCH
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                  <Flame size={9} /> {featured.applicants} applied
                </span>
              </div>
              <DeadlinePill deadline={featured.deadline} />
            </div>

            <div className="relative z-10 p-5 pt-4">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2"
                    style={{ borderColor: 'rgba(184,241,53,0.3)', boxShadow: '0 0 20px rgba(184,241,53,0.15)' }}>
                    <img src={featured.logo} alt={featured.club} className="w-full h-full object-cover" />
                  </div>
                  {featured.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#1FB57A', boxShadow: '0 0 8px rgba(31,181,122,0.6)' }}>
                      <ShieldCheck size={11} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">{featured.title}</h3>
                      <p className="text-sm text-white/50 mt-0.5">{featured.club}</p>
                    </div>
                    <MatchRing pct={featured.aiMatch} size={56} />
                  </div>

                  <p className="text-sm text-white/65 mt-3 leading-relaxed">{featured.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                    {[
                      { icon: <MapPin size={11} />, label: featured.location },
                      { icon: <Briefcase size={11} />, label: featured.position },
                      { icon: <DollarSign size={11} />, label: featured.salary },
                    ].map(m => (
                      <span key={m.label} className="flex items-center gap-1 text-xs text-white/45">{m.icon} {m.label}</span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {featured.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(184,241,53,0.1)', border: '1px solid rgba(184,241,53,0.2)', color: '#B8F135' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => applied.has(featured.id) ? null : setApplyTarget(featured)}
                      disabled={applied.has(featured.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all"
                      style={{
                        background: applied.has(featured.id) ? 'rgba(31,181,122,0.12)' : '#B8F135',
                        color: applied.has(featured.id) ? '#1FB57A' : '#0C1A2B',
                        border: applied.has(featured.id) ? '1px solid rgba(31,181,122,0.3)' : 'none',
                        boxShadow: applied.has(featured.id) ? 'none' : '0 4px 20px rgba(184,241,53,0.35)',
                        cursor: applied.has(featured.id) ? 'default' : 'pointer',
                      }}>
                      {applied.has(featured.id) ? <><CheckCircle size={14} /> Applied</> : <>Apply Now <ArrowRight size={14} /></>}
                    </button>
                    <button onClick={() => toggleSave(featured.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: saved.has(featured.id) ? 'rgba(47,128,237,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${saved.has(featured.id) ? 'rgba(47,128,237,0.35)' : 'rgba(255,255,255,0.1)'}`,
                        color: saved.has(featured.id) ? '#2F80ED' : 'rgba(255,255,255,0.45)',
                      }}>
                      {saved.has(featured.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      {saved.has(featured.id) ? 'Saved' : 'Save'}
                    </button>
                    <button className="ml-auto p-2.5 rounded-xl transition-all hover:bg-white/5"
                      style={{ color: 'rgba(255,255,255,0.25)' }}>
                      <Bell size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* bottom shimmer bar */}
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #B8F135, transparent)' }} />
          </div>
        )}

        {/* ── Cards List ────────────────────────────────── */}
        <div className="space-y-3">
          {(filter === 'all' ? rest : filtered).map((opp, i) => {
            const meta = TYPE_META[opp.type];
            const isApplied = applied.has(opp.id);
            const isSaved   = saved.has(opp.id);
            return (
              <div key={opp.id}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${opp.bgGrad.includes('B8F135') ? 'rgba(184,241,53,0.04)' : opp.bgGrad.includes('1FB57A') ? 'rgba(31,181,122,0.04)' : opp.bgGrad.includes('EF5350') ? 'rgba(239,83,80,0.04)' : opp.bgGrad.includes('F5A623') ? 'rgba(245,166,35,0.04)' : 'rgba(47,128,237,0.04)'}, #13223A)`,
                  border: `1px solid rgba(255,255,255,0.07)`,
                  animation: `fadeSlideIn 0.45s ${i * 0.07}s ease both`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${opp.accentColor}35`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 30px ${opp.accentColor}12`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}>

                {/* Left accent bar */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: opp.accentColor }} />

                <div className="p-5 pl-6">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border"
                        style={{ borderColor: `${opp.accentColor}30` }}>
                        <img src={opp.logo} alt={opp.club} className="w-full h-full object-cover" />
                      </div>
                      {opp.verified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#1FB57A' }}>
                          <ShieldCheck size={9} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">{opp.title}</h3>
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: meta.color, background: meta.bg }}>
                              {meta.icon} {meta.label}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 mt-0.5">{opp.club}</p>
                        </div>
                        <MatchRing pct={opp.aiMatch} size={48} />
                      </div>

                      <p className="text-xs text-white/50 leading-relaxed mb-3">{opp.description}</p>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
                        <span className="flex items-center gap-1 text-xs text-white/40"><MapPin size={10} /> {opp.location}</span>
                        <span className="flex items-center gap-1 text-xs text-white/40"><Briefcase size={10} /> {opp.position}</span>
                        {opp.salary !== 'TBD' && (
                          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: opp.accentColor }}>
                            <DollarSign size={10} /> {opp.salary}
                          </span>
                        )}
                        <DeadlinePill deadline={opp.deadline} />
                        <span className="flex items-center gap-1 text-[10px] text-white/30">
                          <Star size={9} /> {opp.views} views
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {opp.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: `${opp.accentColor}10`, border: `1px solid ${opp.accentColor}20`, color: `${opp.accentColor}` }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action row */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                        <button
                          onClick={() => !isApplied && setApplyTarget(opp)}
                          disabled={isApplied}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: isApplied ? 'rgba(31,181,122,0.1)' : opp.accentColor,
                            color: isApplied ? '#1FB57A' : '#0C1A2B',
                            border: isApplied ? '1px solid rgba(31,181,122,0.25)' : 'none',
                            boxShadow: isApplied ? 'none' : `0 2px 12px ${opp.accentColor}40`,
                            cursor: isApplied ? 'default' : 'pointer',
                          }}>
                          {isApplied ? <><CheckCircle size={12} /> Applied</> : <>Apply <ArrowRight size={12} /></>}
                        </button>
                        <button onClick={() => toggleSave(opp.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: isSaved ? 'rgba(47,128,237,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isSaved ? 'rgba(47,128,237,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            color: isSaved ? '#2F80ED' : 'rgba(255,255,255,0.4)',
                          }}>
                          {isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                        <span className="ml-auto text-[10px] text-white/20 flex items-center gap-1">
                          <TrendingUp size={9} /> {opp.applicants} applicants
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Empty State ───────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.15)' }}>
              <Briefcase size={28} className="text-azure/50" />
            </div>
            <p className="text-base font-bold text-white mb-1">No opportunities found</p>
            <p className="text-sm text-white/35">Try a different filter or check back soon</p>
          </div>
        )}
      </div>

      {/* ── Apply Modal ───────────────────────────────────── */}
      {applyTarget && (
        <ApplyModal
          opp={applyTarget}
          onClose={() => setApplyTarget(null)}
          onApply={() => setApplied(s => new Set([...s, applyTarget.id]))}
        />
      )}
    </>
  );
}
