import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, AlertTriangle, X, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CompetitionOption {
  id: string;
  name: string;
  sport: string;
  structure_type: string;
  country: string;
  country_code: string | null;
  flag_url: string | null;
  logo_url: string | null;
  tier: string | null;
  governing_body: string | null;
  gender: string;
  season: number | null;
  verification_status: string;
}

interface Props {
  sport?: string;
  structureType?: string;
  countryCode?: string;
  value?: CompetitionOption | null;
  onChange: (c: CompetitionOption | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// ── Display constants ─────────────────────────────────────────────────────────

const STRUCTURE_COLORS: Record<string, string> = {
  league:       '#2F80ED',
  cup:          '#EF5350',
  tour_circuit: '#B8F135',
  championship: '#F5A623',
  tournament:   '#1FB57A',
  friendly:     '#7C8DA6',
};

const STRUCTURE_LABELS: Record<string, string> = {
  league: 'League', cup: 'Cup', tour_circuit: 'Tour', championship: 'Championship',
  tournament: 'Tournament', friendly: 'Friendly', other: 'Other',
};

const TIER_COLORS: Record<string, string> = {
  professional: '#B8F135', semi_pro: '#2F80ED', amateur: '#1FB57A',
  college: '#F5A623', youth_academy: '#EF5350', grassroots: '#64B5F6',
};

// ── Micro-components ──────────────────────────────────────────────────────────

function StructureBadge({ type }: { type: string }) {
  const color = STRUCTURE_COLORS[type] ?? '#7C8DA6';
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ background: `${color}20`, color }}>
      {STRUCTURE_LABELS[type] ?? type}
    </span>
  );
}

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return null;
  const color = TIER_COLORS[tier] ?? '#7C8DA6';
  const short: Record<string, string> = {
    professional: 'PRO', semi_pro: 'SEMI', amateur: 'AMT',
    college: 'COL', youth_academy: 'YOUTH', grassroots: 'GRASS',
  };
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ background: `${color}20`, color }}>
      {short[tier] ?? tier.slice(0, 4).toUpperCase()}
    </span>
  );
}

function CompLogo({ url, name, size = 22 }: { url?: string | null; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return <img src={url} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />;
  }
  return (
    <div className="flex items-center justify-center rounded text-[9px] font-bold flex-shrink-0"
      style={{ width: size, height: size, background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>
      {name.charAt(0)}
    </div>
  );
}

function FlagImg({ url, code }: { url?: string | null; code?: string | null }) {
  if (url) return <img src={url} alt={code ?? ''} style={{ width: 18, height: 13, objectFit: 'contain', borderRadius: 2, flexShrink: 0 }} />;
  return null;
}

// ── Request Modal ──────────────────────────────────────────────────────────────

function RequestModal({
  initialName, sport, onClose,
}: {
  initialName: string; sport: string; onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [country, setCountry] = useState('');
  const [structureType, setStructureType] = useState('league');
  const [dupes, setDupes] = useState<CompetitionOption[]>([]);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function checkDupes() {
    if (!name.trim()) return;
    const { data } = await supabase.from('competitions')
      .select('id,name,country,logo_url,flag_url,tier,structure_type,sport,country_code,governing_body,gender,season,verification_status')
      .ilike('name', `%${name.trim()}%`).limit(4);
    setDupes((data as CompetitionOption[]) ?? []);
    setChecked(true);
  }

  async function submit() {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('competitions').insert({
      name: name.trim(), sport, structure_type: structureType,
      country: country.trim() || 'Unknown',
      data_source: 'community', verification_status: 'pending',
      provider: 'community', created_by: user?.id ?? null,
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5 relative"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}><X size={13} /></button>

        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(31,181,122,0.15)' }}>
              <span style={{ color: '#1FB57A', fontSize: 22 }}>✓</span>
            </div>
            <p className="font-bold text-white text-sm">Request submitted!</p>
            <p className="text-xs mt-1" style={{ color: '#7C8DA6' }}>An admin will review and approve it shortly.</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-white text-sm mb-1">Request missing competition</h3>
            <p className="text-[11px] mb-4 leading-relaxed" style={{ color: '#7C8DA6' }}>
              Community submissions go to pending review. Admins verify and add them to the catalog.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Competition Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} onBlur={checkDupes}
                  placeholder="e.g. ATP Tour, Premier League…"
                  className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
              </div>

              {checked && dupes.length > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle size={11} style={{ color: '#F5A623' }} />
                    <span className="text-[10px] font-semibold" style={{ color: '#F5A623' }}>Similar entries already exist</span>
                  </div>
                  {dupes.map(d => (
                    <div key={d.id} className="flex items-center gap-1.5 py-0.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <CompLogo url={d.logo_url} name={d.name} size={16} />
                      {d.name} — {d.country} ({d.sport})
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Type</label>
                <select value={structureType} onChange={e => setStructureType(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
                  <option value="league">League</option>
                  <option value="cup">Cup</option>
                  <option value="tour_circuit">Tour / Circuit</option>
                  <option value="championship">Championship</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Country / Region</label>
                <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. France, World…"
                  className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }}>Cancel</button>
              <button onClick={submit} disabled={submitting || !name.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#2F80ED', color: 'white' }}>
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main CompetitionPicker ────────────────────────────────────────────────────

export default function CompetitionPicker({
  sport,
  structureType,
  countryCode,
  value,
  onChange,
  placeholder = 'Search leagues, tours, championships…',
  className = '',
  disabled = false,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompetitionOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    let req = supabase
      .from('competitions')
      .select('id,name,sport,structure_type,country,country_code,flag_url,logo_url,tier,governing_body,gender,season,verification_status')
      .eq('verification_status', 'approved');

    if (q.trim()) {
      req = req.or(`name.ilike.%${q}%,country.ilike.%${q}%,governing_body.ilike.%${q}%`);
    } else {
      req = req.eq('is_current', true);
    }

    if (sport)         req = req.eq('sport', sport);
    if (structureType) req = req.eq('structure_type', structureType);
    if (countryCode)   req = req.eq('country_code', countryCode);

    req = req.order('name').limit(14);
    const { data } = await req;
    setResults((data as CompetitionOption[]) ?? []);
    setLoading(false);
  }, [sport, structureType, countryCode]);

  useEffect(() => {
    if (!open) return;
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => search(query), 280);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [query, open, search]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
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

  function select(c: CompetitionOption) { onChange(c); setOpen(false); setQuery(''); }
  function clear(e: React.MouseEvent) { e.stopPropagation(); onChange(null); setQuery(''); }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(47,128,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        {value ? (
          <>
            <CompLogo url={value.logo_url} name={value.name} />
            <FlagImg url={value.flag_url} code={value.country_code} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-none">{value.name}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: '#7C8DA6' }}>
                {value.country} · {value.sport}
              </p>
            </div>
            <StructureBadge type={value.structure_type} />
            <TierBadge tier={value.tier} />
            <button onClick={clear} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.35)' }}><X size={11} /></button>
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
        <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl z-40 overflow-hidden"
          style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Type to search…"
                className="w-full rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }} />
            </div>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin" style={{ color: '#2F80ED' }} />
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-xs" style={{ color: '#7C8DA6' }}>No competitions found</p>
              </div>
            ) : (
              results.map(c => (
                <div key={c.id} onClick={() => select(c)}
                  className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(47,128,237,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <CompLogo url={c.logo_url} name={c.name} />
                  <FlagImg url={c.flag_url} code={c.country_code} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                    <p className="text-[10px] truncate" style={{ color: '#7C8DA6' }}>
                      {c.country}
                      {c.governing_body ? ` · ${c.governing_body}` : ''}
                    </p>
                  </div>
                  <StructureBadge type={c.structure_type} />
                  <TierBadge tier={c.tier} />
                </div>
              ))
            )}
          </div>

          {/* Request missing */}
          <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            onClick={() => { setOpen(false); setShowRequest(true); }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.15)' }}>
              <Plus size={10} style={{ color: '#F5A623' }} />
            </div>
            <span className="text-xs" style={{ color: '#F5A623' }}>
              My competition isn't listed — request to add
            </span>
          </div>
        </div>
      )}

      {showRequest && (
        <RequestModal
          initialName={query}
          sport={sport ?? 'football'}
          onClose={() => setShowRequest(false)}
        />
      )}
    </div>
  );
}
