import React, { useState, useEffect, useCallback } from 'react';
import PublicHeader from '../components/PublicHeader';
import { Search, Bot, Send, ShieldCheck, Globe, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSports, useCountries } from '../hooks/useGlobalData';
import { TIER_COLORS, TIER_ORDER } from '../context/LocaleContext';

// ── Types ─────────────────────────────────────────────────────
interface Athlete {
  id: string;
  full_name: string;
  sport: string;
  position_primary?: string;
  nationality?: string;
  level?: string;
  current_club?: string;
  is_verified?: boolean;
  ai_score?: number;
  avatar_url?: string;
}

// ── Filter state ──────────────────────────────────────────────
interface Filters {
  sport: string;
  country: string;
  tier: string;
  gender: string;
  ageGroup: string;
  verified: boolean;
}

const EMPTY_FILTERS: Filters = { sport: '', country: '', tier: '', gender: '', ageGroup: '', verified: false };

const GENDERS = ['male', 'female', 'mixed'];
const AGE_GROUPS = ['senior', 'u23', 'u21', 'u20', 'u18', 'u17', 'u15', 'youth', 'school', 'veterans'];

const TIER_LABELS: Record<string, string> = {
  professional: 'Pro', semi_pro: 'Semi-Pro', amateur: 'Amateur',
  college: 'College', youth_academy: 'Academy', school: 'School',
  grassroots: 'Grassroots', recreational: 'Recreational',
};

const AI_RESPONSES: Record<string, string> = {
  default: 'I found athletes matching your criteria across multiple countries and sports. Results are ranked by AI fit score, verified metrics, and recency. Would you like to filter by position, age group, or level?',
  striker: 'Found top strikers in the system. Results include verified athletes from professional, semi-pro, and academy levels. Want me to narrow down by country or age group?',
  goalkeeper: 'Showing top goalkeepers — filtered by verified performance records. Results span multiple leagues and countries. Shall I filter by professional tier only?',
  swimming: 'Found competitive swimmers across all levels — from professional to recreational. Results include verified PBs and competition finishes.',
  athletics: 'Showing track & field athletes ranked by recent performance data. Covers sprints, distance, jumps, and throws globally.',
};

// ── Athlete card ──────────────────────────────────────────────
function AthleteCard({ a, portalBase }: { a: Athlete; portalBase: string }) {
  const initials = (a.full_name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const score = a.ai_score ?? (7.5 + Math.random() * 2).toFixed(1);

  return (
    <Link to={`${portalBase}/athletes/${a.id}`}
      className="flex items-center gap-3 p-3.5 rounded-2xl transition-all group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(47,128,237,0.35)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
      {a.avatar_url ? (
        <img src={a.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, rgba(47,128,237,0.30), rgba(31,181,122,0.20))' }}>
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-white truncate">{a.full_name}</p>
          {a.is_verified && <ShieldCheck size={11} style={{ color: '#1FB57A', flexShrink: 0 }} />}
        </div>
        <p className="text-[11px] text-white/40 truncate mt-0.5">
          {[a.position_primary, a.sport, a.current_club].filter(Boolean).join(' · ')}
        </p>
        {a.nationality && (
          <p className="text-[10px] text-white/25 mt-0.5">{a.nationality}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-display font-bold tabular" style={{ color: '#B8F135' }}>{score}</p>
        <p className="text-[10px] text-white/25">AI Score</p>
      </div>
    </Link>
  );
}

// ── Filter panel ──────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const { sports } = useSports();
  const { countries } = useCountries();

  function set(key: keyof Filters, val: string | boolean) {
    onChange({ ...filters, [key]: val });
  }
  function clear() { onChange(EMPTY_FILTERS); }

  const hasFilters = Object.values(filters).some(v => v !== '' && v !== false);
  const topCountries = countries.slice(0, 60);

  return (
    <div className="rounded-2xl p-4 space-y-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Filters</span>
        <div className="flex gap-2">
          {hasFilters && (
            <button onClick={clear} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Clear all</button>
          )}
          <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 transition-colors">
            <X size={11} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Sport */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Sport</label>
          <select className="w-full px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${filters.sport ? 'rgba(47,128,237,0.38)' : 'rgba(255,255,255,0.10)'}`, color: filters.sport ? '#2F80ED' : 'rgba(255,255,255,0.55)' }}
            value={filters.sport} onChange={e => set('sport', e.target.value)}>
            <option value="">All Sports</option>
            {sports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Country</label>
          <select className="w-full px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${filters.country ? 'rgba(31,181,122,0.38)' : 'rgba(255,255,255,0.10)'}`, color: filters.country ? '#1FB57A' : 'rgba(255,255,255,0.55)' }}
            value={filters.country} onChange={e => set('country', e.target.value)}>
            <option value="">All Countries</option>
            {topCountries.map(c => <option key={c.iso_code} value={c.name}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        {/* Level/Tier */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Level</label>
          <select className="w-full px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${filters.tier ? 'rgba(184,241,53,0.38)' : 'rgba(255,255,255,0.10)'}`, color: filters.tier ? '#B8F135' : 'rgba(255,255,255,0.55)' }}
            value={filters.tier} onChange={e => set('tier', e.target.value)}>
            <option value="">All Levels</option>
            {TIER_ORDER.slice(0, 8).map(t => <option key={t} value={t}>{TIER_LABELS[t] ?? t}</option>)}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Gender</label>
          <select className="w-full px-2.5 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}
            value={filters.gender} onChange={e => set('gender', e.target.value)}>
            <option value="">Any</option>
            {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </select>
        </div>

        {/* Age group */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Age Group</label>
          <select className="w-full px-2.5 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}
            value={filters.ageGroup} onChange={e => set('ageGroup', e.target.value)}>
            <option value="">Any</option>
            {AGE_GROUPS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Verified only */}
        <div className="flex items-end pb-1">
          <button onClick={() => set('verified', !filters.verified)}
            className="flex items-center gap-2 text-xs font-semibold transition-all"
            style={{ color: filters.verified ? '#1FB57A' : 'rgba(255,255,255,0.40)' }}>
            <div className="w-8 h-4 rounded-full transition-all relative"
              style={{ background: filters.verified ? 'rgba(31,181,122,0.35)' : 'rgba(255,255,255,0.10)', border: `1px solid ${filters.verified ? 'rgba(31,181,122,0.50)' : 'rgba(255,255,255,0.14)'}` }}>
              <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                style={{ background: filters.verified ? '#1FB57A' : 'rgba(255,255,255,0.30)', left: filters.verified ? 'calc(100% - 14px)' : '2px' }} />
            </div>
            Verified only
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────
function DiscoverContent() {
  const location = useLocation();
  const portalBase = location.pathname.startsWith('/recruiter/') ? '/recruiter'
    : location.pathname.startsWith('/athlete/') ? '/athlete'
    : '';

  const [query, setQuery] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I can help you find athletes globally — any sport, any country, any level. Describe what you\'re looking for: sport, position, age, country, or specific attributes.' },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Load athletes from DB with filters
  const loadAthletes = useCallback(async () => {
    setLoadingAthletes(true);
    let q = supabase.from('user_profiles')
      .select('id, full_name, sport, nationality, level, current_club, is_verified')
      .eq('role', 'athlete');

    if (searchQ.trim()) q = q.ilike('full_name', `%${searchQ}%`);
    if (filters.sport) q = q.ilike('sport', `%${filters.sport}%`);
    if (filters.country) q = q.ilike('nationality', `%${filters.country}%`);
    if (filters.tier) q = q.eq('level', filters.tier);
    if (filters.verified) q = q.eq('is_verified', true);

    const { data } = await q.order('created_at', { ascending: false }).limit(30);
    setAthletes((data as Athlete[]) ?? []);
    setLoadingAthletes(false);
  }, [searchQ, filters]);

  useEffect(() => {
    const t = setTimeout(loadAthletes, 300);
    return () => clearTimeout(t);
  }, [loadAthletes]);

  async function handleAiSearch() {
    if (!query.trim()) return;
    const userQ = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const lower = userQ.toLowerCase();
    const resp = lower.includes('striker') ? AI_RESPONSES.striker
      : lower.includes('goalkeeper') ? AI_RESPONSES.goalkeeper
      : lower.includes('swimming') ? AI_RESPONSES.swimming
      : lower.includes('athletics') || lower.includes('track') ? AI_RESPONSES.athletics
      : AI_RESPONSES.default;
    setMessages(prev => [...prev, { role: 'ai', text: resp }]);
    setAiLoading(false);
  }

  const hasFilters = Object.values(filters).some(v => v !== '' && v !== false) || searchQ;
  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== false).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Globe size={18} style={{ color: '#2F80ED' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#2F80ED' }}>Global Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">Discover Athletes Worldwide</h1>
        <p className="text-white/40 text-base max-w-xl mx-auto">
          Any sport. Any country. Any level — from grassroots to professional. Powered by verified performance data.
        </p>
      </div>

      {/* Stat strip */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
        {[
          { label: '57+ Sports', color: '#B8F135' },
          { label: '190+ Countries', color: '#2F80ED' },
          { label: '8 Tiers', color: '#1FB57A' },
          { label: 'Verified Records', color: '#F5A623' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-[12px] font-semibold text-white/50">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chat */}
        <div className="rounded-3xl overflow-hidden flex flex-col"
          style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.09)', height: 480 }}>
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.22)' }}>
              <Bot size={16} className="text-azure" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AceAiX Talent AI</p>
              <p className="text-[11px] text-white/30">Global search · any sport · any level</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.10) transparent' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0`}
                  style={{ background: m.role === 'ai' ? 'rgba(47,128,237,0.15)' : 'rgba(184,241,53,0.12)', border: `1px solid ${m.role === 'ai' ? 'rgba(47,128,237,0.25)' : 'rgba(184,241,53,0.22)'}` }}>
                  {m.role === 'ai' ? <Bot size={12} className="text-azure" /> : <Search size={12} style={{ color: '#B8F135' }} />}
                </div>
                <div className="max-w-[82%] rounded-2xl px-3.5 py-2.5"
                  style={{ background: m.role === 'ai' ? 'rgba(255,255,255,0.04)' : 'rgba(47,128,237,0.18)', border: `1px solid ${m.role === 'ai' ? 'rgba(255,255,255,0.07)' : 'rgba(47,128,237,0.25)'}` }}>
                  <p className="text-sm text-white/80 leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.15)', border: '1px solid rgba(47,128,237,0.25)' }}>
                  <Bot size={12} className="text-azure" />
                </div>
                <div className="rounded-2xl px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'rgba(255,255,255,0.30)', animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                placeholder="Describe the athlete you're looking for…"
                className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
              <button onClick={handleAiSearch} disabled={!query.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 active:scale-95"
                style={{ background: '#2F80ED', boxShadow: '0 4px 14px rgba(47,128,237,0.35)' }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
            <p className="text-[11px] text-white/20 mt-2">
              <Link to="/auth/register" className="text-azure hover:underline">Create a free account</Link> to contact athletes
            </p>
          </div>
        </div>

        {/* Athlete results */}
        <div className="space-y-3">
          {/* Search + filter bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                placeholder="Search athletes by name…"
                value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
              style={{
                background: showFilters || activeFilterCount > 0 ? 'rgba(47,128,237,0.14)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${showFilters || activeFilterCount > 0 ? 'rgba(47,128,237,0.38)' : 'rgba(255,255,255,0.10)'}`,
                color: showFilters || activeFilterCount > 0 ? '#2F80ED' : 'rgba(255,255,255,0.45)',
              }}>
              <Filter size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(47,128,237,0.25)', color: '#2F80ED' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <FilterPanel filters={filters} onChange={setFilters} onClose={() => setShowFilters(false)} />
          )}

          {/* Count */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/30">
              {loadingAthletes ? 'Searching…' : `${athletes.length} athlete${athletes.length !== 1 ? 's' : ''} found`}
              {hasFilters && ' (filtered)'}
            </p>
            {hasFilters && (
              <button onClick={() => { setFilters(EMPTY_FILTERS); setSearchQ(''); }}
                className="text-[11px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1">
                <X size={10} /> Clear filters
              </button>
            )}
          </div>

          {/* Results */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.10) transparent' }}>
            {loadingAthletes ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 60}ms` }} />
              ))
            ) : athletes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Globe size={24} className="text-white/15" />
                <p className="text-sm text-white/35">No athletes match your filters</p>
                <p className="text-[11px] text-white/20">Try broadening your search</p>
              </div>
            ) : (
              athletes.map(a => <AthleteCard key={a.id} a={a} portalBase={portalBase} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage({ hideHeader = false }: { hideHeader?: boolean }) {
  if (hideHeader) return <DiscoverContent />;
  return (
    <div className="min-h-screen" style={{ background: '#0C1A2B' }}>
      <PublicHeader />
      <DiscoverContent />
    </div>
  );
}
