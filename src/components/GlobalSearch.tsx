import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Globe, Loader2, ChevronDown, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSports, useCountries } from '../hooks/useGlobalData';
import { TIER_COLORS, TIER_ORDER } from '../context/LocaleContext';

// ── Types ─────────────────────────────────────────────────────
type ResultType = 'athlete' | 'competition' | 'team';

interface SearchResult {
  id: string;
  type: ResultType;
  name: string;
  subtitle: string;
  flag?: string;
  tag?: string;
  tagColor?: string;
  verified?: boolean;
}

const TIER_LABELS: Record<string, string> = {
  professional: 'Pro', semi_pro: 'Semi-Pro', amateur: 'Amateur',
  college: 'College', youth_academy: 'Academy', school: 'School',
  grassroots: 'Grassroots', recreational: 'Recreational',
  continental: 'Continental', international: 'International', friendly: 'Friendly',
};

// ── Filter chip ───────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all"
      style={{
        background: active ? 'rgba(47,128,237,0.18)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? 'rgba(47,128,237,0.40)' : 'rgba(255,255,255,0.10)'}`,
        color: active ? '#2F80ED' : 'rgba(255,255,255,0.45)',
      }}
    >
      {label}
    </button>
  );
}

// ── Result row ────────────────────────────────────────────────
function ResultRow({ r, onSelect }: { r: SearchResult; onSelect: (r: SearchResult) => void }) {
  const TYPE_ICON: Record<ResultType, string> = { athlete: '👤', competition: '🏆', team: '🛡️' };
  return (
    <button
      onClick={() => onSelect(r)}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left"
    >
      <span className="text-base flex-shrink-0">{r.flag ?? TYPE_ICON[r.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{r.name}</span>
          {r.verified && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
              style={{ background: 'rgba(31,181,122,0.15)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
              ✓
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/35 truncate mt-0.5">{r.subtitle}</p>
      </div>
      {r.tag && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
          style={{
            background: `${r.tagColor ?? '#2F80ED'}18`,
            border: `1px solid ${r.tagColor ?? '#2F80ED'}30`,
            color: r.tagColor ?? '#2F80ED',
          }}>
          {r.tag}
        </span>
      )}
    </button>
  );
}

// ── Main GlobalSearch ─────────────────────────────────────────
interface GlobalSearchProps {
  placeholder?: string;
  onSelect?: (result: SearchResult) => void;
  className?: string;
  compact?: boolean;
}

export default function GlobalSearch({ placeholder = 'Search athletes, teams, competitions…', onSelect, className = '', compact = false }: GlobalSearchProps) {
  const { sports, byCategory } = useSports();
  const { byRegion } = useCountries();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [sportFilter, setSportFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResultType | ''>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const runSearch = useCallback(async () => {
    if (!query.trim() && !sportFilter && !countryFilter && !tierFilter) {
      setResults([]);
      return;
    }
    setLoading(true);
    const combined: SearchResult[] = [];

    // Search athletes
    if (!typeFilter || typeFilter === 'athlete') {
      let q = supabase.from('user_profiles').select('id, full_name, nationality, sport, is_verified').eq('role', 'athlete');
      if (query.trim()) q = q.ilike('full_name', `%${query}%`);
      if (sportFilter) q = q.ilike('sport', `%${sportFilter}%`);
      const { data } = await q.limit(6);
      (data ?? []).forEach((a: Record<string, unknown>) => combined.push({
        id: String(a.id), type: 'athlete',
        name: String(a.full_name ?? ''),
        subtitle: [a.sport, a.nationality].filter(Boolean).join(' · '),
        verified: Boolean(a.is_verified),
      }));
    }

    // Search competitions
    if (!typeFilter || typeFilter === 'competition') {
      let q = supabase.from('competitions').select('id, name, sport, tier, country, region').eq('verification_status', 'approved');
      if (query.trim()) q = q.ilike('name', `%${query}%`);
      if (sportFilter) q = q.or(`sport.ilike.%${sportFilter}%,sport_id.eq.${sportFilter}`);
      if (countryFilter) q = q.or(`country.ilike.%${countryFilter}%,country_id.eq.${countryFilter}`);
      if (tierFilter) q = q.eq('tier', tierFilter);
      const { data } = await q.limit(6);
      (data ?? []).forEach((c: Record<string, unknown>) => combined.push({
        id: String(c.id), type: 'competition',
        name: String(c.name ?? ''),
        subtitle: [c.sport, c.country ?? c.region].filter(Boolean).join(' · '),
        tag: TIER_LABELS[String(c.tier)] ?? String(c.tier),
        tagColor: TIER_COLORS[String(c.tier)],
        verified: true,
      }));
    }

    // Search teams
    if (!typeFilter || typeFilter === 'team') {
      let q = supabase.from('teams').select('id, name, city, country_id, short_name').eq('verification_status', 'approved');
      if (query.trim()) q = q.ilike('name', `%${query}%`);
      if (sportFilter) q = q.eq('sport_id', sportFilter);
      if (countryFilter) q = q.eq('country_id', countryFilter);
      const { data } = await q.limit(5);
      (data ?? []).forEach((t: Record<string, unknown>) => combined.push({
        id: String(t.id), type: 'team',
        name: String(t.name ?? ''),
        subtitle: [t.city, t.country_id].filter(Boolean).join(', '),
        verified: true,
      }));
    }

    setResults(combined);
    setLoading(false);
  }, [query, sportFilter, countryFilter, tierFilter, typeFilter]);

  useEffect(() => {
    const t = setTimeout(runSearch, 280);
    return () => clearTimeout(t);
  }, [runSearch]);

  const hasFilters = sportFilter || countryFilter || tierFilter || typeFilter;
  const showDropdown = open && (results.length > 0 || loading || (query.length > 0));

  // Flat lists for filter selects
  const allSports = sports.slice(0, 30);
  const topCountries = ['US', 'GB', 'DE', 'FR', 'ES', 'BR', 'AR', 'AE', 'SA', 'QA', 'IN', 'CN', 'JP', 'NG', 'ZA', 'EG', 'MA', 'AU', 'IT', 'PT'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3.5 rounded-2xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(47,128,237,0.40)' : 'rgba(255,255,255,0.10)'}`,
          boxShadow: open ? '0 0 0 3px rgba(47,128,237,0.10)' : 'none',
          height: compact ? 36 : 44,
        }}
      >
        <Globe size={14} className="text-white/25 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />
        {loading && <Loader2 size={13} className="animate-spin text-white/25 flex-shrink-0" />}
        {(query || hasFilters) && (
          <button onClick={() => { setQuery(''); setSportFilter(''); setCountryFilter(''); setTierFilter(''); setTypeFilter(''); }} className="text-white/25 hover:text-white/60 flex-shrink-0">
            <X size={13} />
          </button>
        )}
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex-shrink-0 transition-colors"
          style={{ color: hasFilters ? '#2F80ED' : 'rgba(255,255,255,0.25)' }}
        >
          <Filter size={13} />
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="mt-2 flex flex-wrap gap-1.5 items-center p-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Type filter */}
          <div className="flex gap-1">
            {(['athlete', 'competition', 'team'] as ResultType[]).map(t => (
              <Chip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)}
                active={typeFilter === t}
                onClick={() => setTypeFilter(typeFilter === t ? '' : t)} />
            ))}
          </div>

          {/* Sport filter */}
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="text-[11px] rounded-lg px-2 py-1 outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: sportFilter ? '#2F80ED' : 'rgba(255,255,255,0.45)' }}
          >
            <option value="">All Sports</option>
            {allSports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Tier filter */}
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="text-[11px] rounded-lg px-2 py-1 outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: tierFilter ? '#2F80ED' : 'rgba(255,255,255,0.45)' }}
          >
            <option value="">All Tiers</option>
            {TIER_ORDER.map(t => <option key={t} value={t}>{TIER_LABELS[t] ?? t}</option>)}
          </select>

          {/* Country filter */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="text-[11px] rounded-lg px-2 py-1 outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: countryFilter ? '#2F80ED' : 'rgba(255,255,255,0.45)' }}
          >
            <option value="">All Countries</option>
            {topCountries.map(iso => (
              <option key={iso} value={iso}>{iso}</option>
            ))}
          </select>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
          style={{
            background: '#16273B',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.70)',
            maxHeight: 380,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.10) transparent',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-white/25" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-white/35">No results found</p>
              <p className="text-[11px] text-white/20 mt-1">Try a different search or suggest a missing entity</p>
            </div>
          ) : (
            <>
              {(['athlete', 'competition', 'team'] as ResultType[]).map(type => {
                const group = results.filter(r => r.type === type);
                if (group.length === 0) return null;
                const LABELS: Record<ResultType, string> = { athlete: 'Athletes', competition: 'Competitions', team: 'Teams' };
                return (
                  <div key={type}>
                    <div className="px-4 py-1.5 sticky top-0"
                      style={{ background: 'rgba(22,39,59,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{LABELS[type]}</span>
                    </div>
                    {group.map(r => (
                      <ResultRow key={r.id} r={r} onSelect={r => { setOpen(false); onSelect?.(r); }} />
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
