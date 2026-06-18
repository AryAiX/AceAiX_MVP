import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, AlertTriangle, X, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LeagueOption {
  id: string;
  name: string;
  country: string;
  country_code: string | null;
  flag_url: string | null;
  logo_url: string | null;
  tier: string | null;
  type: string;
  sport: string;
  verification_status: string;
}

interface Props {
  sport?: string;
  countryCode?: string;
  value?: LeagueOption | null;
  onChange: (league: LeagueOption | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  professional: '#B8F135', semi_pro: '#2F80ED', amateur: '#1FB57A',
  college: '#F5A623', youth_academy: '#EF5350', grassroots: '#64B5F6',
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return null;
  const color = TIER_COLORS[tier] ?? '#7C8DA6';
  const labels: Record<string, string> = {
    professional: 'PRO', semi_pro: 'SEMI', amateur: 'AMT',
    college: 'COL', youth_academy: 'YOUTH', grassroots: 'GRASS',
    recreational: 'REC',
  };
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ background: `${color}20`, color }}
    >
      {labels[tier] ?? tier.toUpperCase().slice(0, 4)}
    </span>
  );
}

function Flag({ url, code }: { url?: string | null; code?: string | null }) {
  if (url) return <img src={url} alt={code ?? ''} style={{ width: 18, height: 13, objectFit: 'contain', borderRadius: 2, flexShrink: 0 }} />;
  return null;
}

function LeagueLogo({ url, name }: { url?: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return (
      <img src={url} alt={name} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
        onError={() => setErr(true)} />
    );
  }
  return (
    <div className="flex items-center justify-center rounded text-[9px] font-bold flex-shrink-0"
      style={{ width: 22, height: 22, background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>
      {name.charAt(0)}
    </div>
  );
}

// ── Request Modal ──────────────────────────────────────────────────────────────

function RequestModal({
  initialName,
  sport,
  onClose,
  onRequested,
}: {
  initialName: string;
  sport: string;
  onClose: () => void;
  onRequested: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [country, setCountry] = useState('');
  const [type, setType] = useState('league');
  const [dupes, setDupes] = useState<LeagueOption[]>([]);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function checkDupes() {
    if (!name.trim()) return;
    const { data } = await supabase
      .from('competitions')
      .select('id,name,country,logo_url,flag_url,tier,type,sport,country_code,verification_status')
      .ilike('name', `%${name.trim()}%`)
      .limit(4);
    setDupes((data as LeagueOption[]) ?? []);
    setChecked(true);
  }

  async function submit() {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('competitions').insert({
      name: name.trim(),
      sport,
      type,
      country: country.trim() || 'Unknown',
      data_source: 'community',
      verification_status: 'pending',
      provider: 'community',
      created_by: user?.id ?? null,
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => { onRequested(); onClose(); }, 1200);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5 relative"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>

        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}><X size={13} /></button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(31,181,122,0.2)' }}>
              <span style={{ color: '#1FB57A', fontSize: 20 }}>✓</span>
            </div>
            <p className="font-bold text-white text-sm">Request submitted!</p>
            <p className="text-xs mt-1" style={{ color: '#7C8DA6' }}>An admin will review and approve it.</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-white text-sm mb-4">Request missing league</h3>
            <p className="text-[11px] mb-4 leading-relaxed" style={{ color: '#7C8DA6' }}>
              Your request goes to pending review. Admins will verify and add it to the catalog.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>League / Cup Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={checkDupes}
                  placeholder="e.g. Premier League"
                  className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                />
              </div>

              {checked && dupes.length > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle size={11} style={{ color: '#F5A623' }} />
                    <span className="text-[10px] font-semibold" style={{ color: '#F5A623' }}>Similar leagues already exist</span>
                  </div>
                  {dupes.map(d => (
                    <div key={d.id} className="flex items-center gap-1.5 py-0.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <LeagueLogo url={d.logo_url} name={d.name} />
                      {d.name} — {d.country}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Country</label>
                <input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="e.g. France"
                  className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
                  <option value="league">League</option>
                  <option value="cup">Cup</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }}>
                Cancel
              </button>
              <button onClick={submit} disabled={submitting || !name.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#2F80ED', color: 'white' }}>
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main LeaguePicker ──────────────────────────────────────────────────────────

export default function LeaguePicker({
  sport = 'football',
  countryCode,
  value,
  onChange,
  placeholder = 'Search leagues & cups…',
  className = '',
  disabled = false,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LeagueOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    let req = supabase
      .from('competitions')
      .select('id,name,country,country_code,flag_url,logo_url,tier,type,sport,verification_status')
      .eq('verification_status', 'approved');

    if (q.trim()) {
      req = req.or(`name.ilike.%${q}%,country.ilike.%${q}%`);
    } else {
      // Show popular/current leagues by default
      req = req.eq('is_current', true);
    }

    if (sport) req = req.eq('sport', sport);
    if (countryCode) req = req.eq('country_code', countryCode);

    req = req.order('name').limit(12);
    const { data } = await req;
    setResults((data as LeagueOption[]) ?? []);
    setLoading(false);
  }, [sport, countryCode]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, open, search]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleOpen() {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
    search(query);
  }

  function select(league: LeagueOption) {
    onChange(league);
    setOpen(false);
    setQuery('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setQuery('');
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(47,128,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {value ? (
          <>
            <LeagueLogo url={value.logo_url} name={value.name} />
            <Flag url={value.flag_url} code={value.country_code} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-none">{value.name}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: '#7C8DA6' }}>{value.country}</p>
            </div>
            <TierBadge tier={value.tier} />
            <button onClick={clear} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              <X size={11} />
            </button>
          </>
        ) : (
          <>
            <Search size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span className="flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{placeholder}</span>
            <ChevronDown size={13} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          </>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 rounded-xl z-40 overflow-hidden"
          style={{
            background: '#0F1E32',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type to search…"
                className="w-full rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
              />
            </div>
          </div>

          {/* Results */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin" style={{ color: '#2F80ED' }} />
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-xs" style={{ color: '#7C8DA6' }}>No leagues found</p>
              </div>
            ) : (
              results.map(league => (
                <div
                  key={league.id}
                  onClick={() => select(league)}
                  className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(47,128,237,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LeagueLogo url={league.logo_url} name={league.name} />
                  <Flag url={league.flag_url} code={league.country_code} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{league.name}</p>
                    <p className="text-[10px] truncate" style={{ color: '#7C8DA6' }}>
                      {league.country} · {league.type}
                    </p>
                  </div>
                  <TierBadge tier={league.tier} />
                </div>
              ))
            )}
          </div>

          {/* Request missing */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            onClick={() => { setOpen(false); setShowRequest(true); }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.15)' }}>
              <Plus size={10} style={{ color: '#F5A623' }} />
            </div>
            <span className="text-xs" style={{ color: '#F5A623' }}>
              My league isn't listed — request to add
            </span>
          </div>
        </div>
      )}

      {/* Request modal */}
      {showRequest && (
        <RequestModal
          initialName={query}
          sport={sport}
          onClose={() => setShowRequest(false)}
          onRequested={() => {}}
        />
      )}
    </div>
  );
}
