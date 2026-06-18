import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, Plus, Check, X, ChevronDown, ChevronUp,
  Shield, Globe, Filter, Edit2, Merge, AlertTriangle, Clock,
  Trophy, Layers, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface League {
  id: string;
  name: string;
  type: string;
  sport: string;
  country: string;
  country_code: string | null;
  flag_url: string | null;
  logo_url: string | null;
  tier: string | null;
  gender: string;
  season: number | null;
  is_current: boolean;
  data_source: string;
  verification_status: string;
  provider: string;
  external_id: string | null;
  last_synced_at: string | null;
  created_at: string;
}

interface SyncLog {
  id: string;
  status: string;
  inserted: number;
  updated: number;
  total: number;
  started_at: string;
  finished_at: string | null;
  error_msg: string | null;
}

interface Filters {
  sport: string;
  country: string;
  tier: string;
  type: string;
  gender: string;
  dataSource: string;
  status: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  '1': 'Tier 1', '2': 'Tier 2', '3': 'Tier 3', '4': 'Tier 4',
  '5': 'Tier 5+', professional: 'Professional', semi_pro: 'Semi-Pro',
  amateur: 'Amateur', college: 'College', youth_academy: 'Youth',
};

const TIER_COLORS: Record<string, string> = {
  professional: '#B8F135', semi_pro: '#2F80ED', amateur: '#1FB57A',
  college: '#F5A623', youth_academy: '#EF5350', grassroots: '#64B5F6',
  '1': '#B8F135', '2': '#2F80ED', '3': '#1FB57A', '4': '#F5A623',
};

const SOURCE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  licensed:  { bg: 'rgba(31,181,122,0.12)',  color: '#1FB57A', label: 'Licensed' },
  community: { bg: 'rgba(245,166,35,0.12)',  color: '#F5A623', label: 'Community' },
  none:      { bg: 'rgba(124,141,166,0.12)', color: '#7C8DA6', label: 'Manual' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: 'rgba(31,181,122,0.12)',  color: '#1FB57A', label: 'Verified' },
  pending:  { bg: 'rgba(245,166,35,0.12)',  color: '#F5A623', label: 'Pending' },
  rejected: { bg: 'rgba(239,83,80,0.12)',   color: '#EF5350', label: 'Rejected' },
};

const PAGE_SIZE = 50;

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({
  label, color, bg,
}: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

function TierChip({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-[11px]" style={{ color: '#4A5568' }}>—</span>;
  return (
    <Chip
      label={TIER_LABELS[tier] ?? `Tier ${tier}`}
      color={TIER_COLORS[tier] ?? '#7C8DA6'}
      bg={`${TIER_COLORS[tier] ?? '#7C8DA6'}20`}
    />
  );
}

function Flag({ url, code, size = 20 }: { url?: string | null; code?: string | null; size?: number }) {
  if (url) return <img src={url} alt={code ?? ''} style={{ width: size, height: size * 0.7, objectFit: 'contain', borderRadius: 2, flexShrink: 0 }} />;
  if (code) return <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>{code}</span>;
  return <Globe size={size - 2} style={{ color: '#7C8DA6', flexShrink: 0 }} />;
}

function Logo({ url, name, size = 28 }: { url?: string | null; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0"
      style={{ width: size, height: size, background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}
    >
      {name.charAt(0)}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ league, onClose, onSave }: {
  league: League;
  onClose: () => void;
  onSave: (id: string, patch: Partial<League>) => Promise<void>;
}) {
  const [tier, setTier] = useState(league.tier ?? '');
  const [type, setType] = useState(league.type);
  const [gender, setGender] = useState(league.gender);
  const [status, setStatus] = useState(league.verification_status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(league.id, { tier: tier || null, type, gender, verification_status: status });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Logo url={league.logo_url} name={league.name} size={36} />
          <div>
            <p className="font-bold text-white text-sm">{league.name}</p>
            <p className="text-[11px]" style={{ color: '#7C8DA6' }}>{league.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Tier</label>
            <select value={tier} onChange={e => setTier(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
              <option value="">— Not set</option>
              <option value="professional">Professional</option>
              <option value="semi_pro">Semi-Professional</option>
              <option value="amateur">Amateur</option>
              <option value="college">College / University</option>
              <option value="youth_academy">Youth / Academy</option>
              <option value="school">School</option>
              <option value="grassroots">Grassroots</option>
              <option value="recreational">Recreational</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
              <option value="league">League</option>
              <option value="cup">Cup</option>
              <option value="tournament">Tournament</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
              <option value="open">Open</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: '#2F80ED', color: 'white' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add League Modal ──────────────────────────────────────────────────────────

function AddLeagueModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    name: '', sport: 'football', type: 'league', country: '', country_code: '',
    gender: 'open', tier: '', logo_url: '',
  });
  const [dupes, setDupes] = useState<League[]>([]);
  const [saving, setSaving] = useState(false);
  const [dupChecked, setDupChecked] = useState(false);

  async function checkDupes() {
    if (!form.name.trim()) return;
    const { data } = await supabase
      .from('competitions')
      .select('id,name,country,logo_url,tier,verification_status')
      .ilike('name', `%${form.name.trim()}%`)
      .limit(5);
    setDupes((data as League[]) ?? []);
    setDupChecked(true);
  }

  async function submit() {
    setSaving(true);
    await supabase.from('competitions').insert({
      name: form.name.trim(),
      sport: form.sport,
      type: form.type,
      country: form.country,
      country_code: form.country_code || null,
      gender: form.gender,
      tier: form.tier || null,
      logo_url: form.logo_url || null,
      data_source: 'none',
      verification_status: 'approved',
      provider: 'community',
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 relative my-8"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}><X size={14} /></button>

        <h3 className="font-bold text-white mb-6">Add League / Cup</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Name *</label>
            <input value={form.name} onChange={field('name')} onBlur={checkDupes} placeholder="e.g. Premier League" style={inputStyle} />
          </div>

          {dupChecked && dupes.length > 0 && (
            <div className="col-span-2 rounded-xl p-3" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={13} style={{ color: '#F5A623' }} />
                <span className="text-xs font-semibold" style={{ color: '#F5A623' }}>Possible duplicates found</span>
              </div>
              {dupes.map(d => (
                <div key={d.id} className="flex items-center gap-2 text-xs py-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <Logo url={d.logo_url} name={d.name} size={18} />
                  {d.name} — {d.country}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Sport</label>
            <select value={form.sport} onChange={field('sport')} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="rugby">Rugby</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
              <option value="athletics">Athletics</option>
              <option value="swimming">Swimming</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Type</label>
            <select value={form.type} onChange={field('type')} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="league">League</option>
              <option value="cup">Cup</option>
              <option value="tournament">Tournament</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Country</label>
            <input value={form.country} onChange={field('country')} placeholder="England" style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Country Code</label>
            <input value={form.country_code} onChange={field('country_code')} placeholder="GB" maxLength={2} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Gender</label>
            <select value={form.gender} onChange={field('gender')} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="open">Open</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Tier</label>
            <select value={form.tier} onChange={field('tier')} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="">— Not set</option>
              <option value="professional">Professional</option>
              <option value="semi_pro">Semi-Pro</option>
              <option value="amateur">Amateur</option>
              <option value="college">College</option>
              <option value="youth_academy">Youth</option>
              <option value="grassroots">Grassroots</option>
              <option value="recreational">Recreational</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7C8DA6' }}>Logo URL (optional)</label>
            <input value={form.logo_url} onChange={field('logo_url')} placeholder="https://..." style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#B8F135', color: '#0C1A2B' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add League
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sync Panel ────────────────────────────────────────────────────────────────

function SyncPanel({ onSyncDone }: { onSyncDone: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [lastLog, setLastLog] = useState<SyncLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('sync_log')
      .select('*')
      .eq('provider', 'api-football')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setLastLog(data as SyncLog | null));
  }, []);

  async function triggerSync() {
    setSyncing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('sync-leagues', {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      if (res.error) throw new Error(res.error.message);
      // Refresh last log
      const { data } = await supabase
        .from('sync_log')
        .select('*')
        .eq('provider', 'api-football')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastLog(data as SyncLog | null);
      onSyncDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  const statusIcon = lastLog?.status === 'success'
    ? <CheckCircle size={13} style={{ color: '#1FB57A' }} />
    : lastLog?.status === 'error'
    ? <XCircle size={13} style={{ color: '#EF5350' }} />
    : lastLog?.status === 'running'
    ? <Loader2 size={13} className="animate-spin" style={{ color: '#F5A623' }} />
    : null;

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(47,128,237,0.15)' }}>
            <RefreshCw size={13} style={{ color: '#2F80ED' }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">API-Football Sync</p>
            {lastLog ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                {statusIcon}
                <span className="text-[10px]" style={{ color: '#7C8DA6' }}>
                  {lastLog.status === 'success'
                    ? `${lastLog.total.toLocaleString()} leagues · ${new Date(lastLog.started_at).toLocaleDateString()}`
                    : lastLog.status === 'error'
                    ? `Error: ${lastLog.error_msg?.slice(0, 60)}`
                    : 'Syncing…'}
                </span>
              </div>
            ) : (
              <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>Never synced</p>
            )}
          </div>
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}
        >
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Sync Now
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[11px] px-2 py-1.5 rounded-lg" style={{ background: 'rgba(239,83,80,0.1)', color: '#EF5350' }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

function FilterBar({
  filters, onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).filter(v => v && v !== '').length;

  const sel = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  const selectStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 10,
    padding: '6px 10px',
    fontSize: 12,
    outline: 'none',
  };

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-white/10"
        style={{ border: '1px solid rgba(255,255,255,0.12)', color: activeCount > 0 ? '#2F80ED' : 'rgba(255,255,255,0.5)' }}
      >
        <Filter size={12} />
        Filters
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold" style={{ background: '#2F80ED', color: 'white' }}>
            {activeCount}
          </span>
        )}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {open && (
        <div className="mt-2 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.09)' }}>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Sport</label>
            <select value={filters.sport} onChange={sel('sport')} style={selectStyle}>
              <option value="">All Sports</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="rugby">Rugby</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Type</label>
            <select value={filters.type} onChange={sel('type')} style={selectStyle}>
              <option value="">All Types</option>
              <option value="league">League</option>
              <option value="cup">Cup</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Tier</label>
            <select value={filters.tier} onChange={sel('tier')} style={selectStyle}>
              <option value="">All Tiers</option>
              <option value="professional">Professional</option>
              <option value="semi_pro">Semi-Pro</option>
              <option value="amateur">Amateur</option>
              <option value="college">College</option>
              <option value="youth_academy">Youth</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Gender</label>
            <select value={filters.gender} onChange={sel('gender')} style={selectStyle}>
              <option value="">All</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Source</label>
            <select value={filters.dataSource} onChange={sel('dataSource')} style={selectStyle}>
              <option value="">All Sources</option>
              <option value="licensed">Licensed</option>
              <option value="community">Community</option>
              <option value="none">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Status</label>
            <select value={filters.status} onChange={sel('status')} style={selectStyle}>
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex justify-end">
            <button
              onClick={() => onChange({ sport: '', country: '', tier: '', type: '', gender: '', dataSource: '', status: '' })}
              className="text-xs font-semibold transition-colors hover:text-white"
              style={{ color: '#7C8DA6' }}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    sport: '', country: '', tier: '', type: '', gender: '', dataSource: '', status: '',
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editLeague, setEditLeague] = useState<League | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 300);
  }, [query]);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('competitions').select('*', { count: 'exact' });

    if (debouncedQuery) {
      q = q.or(`name.ilike.%${debouncedQuery}%,country.ilike.%${debouncedQuery}%`);
    }
    if (filters.sport)      q = q.eq('sport', filters.sport);
    if (filters.type)       q = q.eq('type', filters.type);
    if (filters.tier)       q = q.eq('tier', filters.tier);
    if (filters.gender)     q = q.eq('gender', filters.gender);
    if (filters.dataSource) q = q.eq('data_source', filters.dataSource);
    if (filters.status)     q = q.eq('verification_status', filters.status);

    q = q.order('name').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count } = await q;
    setLeagues((data as League[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [debouncedQuery, filters, page]);

  useEffect(() => { fetchLeagues(); }, [fetchLeagues]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filters]);

  async function saveLeague(id: string, patch: Partial<League>) {
    await supabase.from('competitions').update(patch).eq('id', id);
    fetchLeagues();
  }

  async function quickApprove(id: string) {
    await supabase.from('competitions').update({ verification_status: 'approved' }).eq('id', id);
    fetchLeagues();
  }

  async function quickReject(id: string) {
    await supabase.from('competitions').update({ verification_status: 'rejected' }).eq('id', id);
    fetchLeagues();
  }

  async function applyBulk() {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    if (bulkAction === 'approve') {
      await supabase.from('competitions').update({ verification_status: 'approved' }).in('id', ids);
    } else if (bulkAction === 'reject') {
      await supabase.from('competitions').update({ verification_status: 'rejected' }).in('id', ids);
    } else if (bulkAction === 'professional' || bulkAction === 'semi_pro' || bulkAction === 'amateur') {
      await supabase.from('competitions').update({ tier: bulkAction }).in('id', ids);
    }
    setSelected(new Set());
    setBulkAction('');
    setBulkLoading(false);
    fetchLeagues();
  }

  function toggleSelect(id: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleAll() {
    if (selected.size === leagues.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leagues.map(l => l.id)));
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = leagues.filter(l => l.verification_status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">League Catalog</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7C8DA6' }}>
            {total.toLocaleString()} competitions · {pendingCount} pending review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#B8F135', color: '#0C1A2B' }}
          >
            <Plus size={14} /> Add League
          </button>
        </div>
      </div>

      {/* Sync panel */}
      <SyncPanel onSyncDone={fetchLeagues} />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total.toLocaleString(), color: '#2F80ED' },
          { label: 'Verified', value: leagues.filter(l => l.verification_status === 'approved').length.toLocaleString(), color: '#1FB57A' },
          { label: 'Pending', value: pendingCount.toLocaleString(), color: '#F5A623' },
          { label: 'Licensed', value: leagues.filter(l => l.data_source === 'licensed').length.toLocaleString(), color: '#B8F135' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3"
            style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#7C8DA6' }}>{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search leagues, cups, countries…"
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <FilterBar filters={filters} onChange={f => { setFilters(f); setPage(0); }} />
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.25)' }}>
          <span className="text-xs font-bold text-white">{selected.size} selected</span>
          <select
            value={bulkAction}
            onChange={e => setBulkAction(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
          >
            <option value="">Bulk action…</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="professional">Set Tier: Professional</option>
            <option value="semi_pro">Set Tier: Semi-Pro</option>
            <option value="amateur">Set Tier: Amateur</option>
          </select>
          <button onClick={applyBulk} disabled={!bulkAction || bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
            style={{ background: '#2F80ED', color: 'white' }}>
            {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            Apply
          </button>
          <button onClick={() => setSelected(new Set())}
            className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Table header */}
        <div className="grid items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: '#0A1828', color: '#7C8DA6', gridTemplateColumns: '32px 40px 1fr 120px 80px 80px 80px 80px 90px 90px 72px' }}>
          <input type="checkbox" checked={selected.size === leagues.length && leagues.length > 0}
            onChange={toggleAll} className="w-3.5 h-3.5 accent-azure" />
          <span></span>
          <span>Name</span>
          <span>Country</span>
          <span>Sport</span>
          <span>Type</span>
          <span>Tier</span>
          <span>Gender</span>
          <span>Source</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ background: '#0D1A2B' }}>
            <Loader2 size={22} className="animate-spin" style={{ color: '#2F80ED' }} />
          </div>
        ) : leagues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ background: '#0D1A2B' }}>
            <Trophy size={28} style={{ color: '#7C8DA6' }} />
            <p className="text-sm" style={{ color: '#7C8DA6' }}>No leagues found</p>
          </div>
        ) : (
          leagues.map((league, idx) => {
            const src = SOURCE_COLORS[league.data_source] ?? SOURCE_COLORS.none;
            const st = STATUS_COLORS[league.verification_status] ?? STATUS_COLORS.pending;
            return (
              <div
                key={league.id}
                className="grid items-center px-4 py-3 text-xs transition-colors cursor-default"
                style={{
                  gridTemplateColumns: '32px 40px 1fr 120px 80px 80px 80px 80px 90px 90px 72px',
                  background: idx % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(47,128,237,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)')}
              >
                <input
                  type="checkbox"
                  checked={selected.has(league.id)}
                  onChange={() => toggleSelect(league.id)}
                  className="w-3.5 h-3.5 accent-azure"
                  onClick={e => e.stopPropagation()}
                />
                <Logo url={league.logo_url} name={league.name} size={26} />
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-white truncate text-xs leading-snug">{league.name}</p>
                  {league.season && (
                    <p className="text-[10px] leading-none mt-0.5" style={{ color: '#7C8DA6' }}>
                      {league.season}{league.is_current ? ' · Current' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Flag url={league.flag_url} code={league.country_code} size={16} />
                  <span className="truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{league.country}</span>
                </div>
                <span className="capitalize" style={{ color: 'rgba(255,255,255,0.55)' }}>{league.sport}</span>
                <span className="capitalize" style={{ color: 'rgba(255,255,255,0.55)' }}>{league.type}</span>
                <TierChip tier={league.tier} />
                <span className="capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{league.gender}</span>
                <Chip label={src.label} color={src.color} bg={src.bg} />
                <Chip label={st.label} color={st.color} bg={st.bg} />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditLeague(league)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                    title="Edit"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    <Edit2 size={11} />
                  </button>
                  {league.verification_status === 'pending' && (
                    <>
                      <button
                        onClick={() => quickApprove(league.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-emerald-500/20"
                        title="Approve"
                        style={{ color: '#1FB57A' }}
                      >
                        <Check size={11} />
                      </button>
                      <button
                        onClick={() => quickReject(league.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/20"
                        title="Reject"
                        style={{ color: '#EF5350' }}
                      >
                        <X size={11} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: '#7C8DA6' }}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Prev
            </button>
            <span className="px-3 text-xs" style={{ color: '#7C8DA6' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editLeague && (
        <EditModal league={editLeague} onClose={() => setEditLeague(null)} onSave={saveLeague} />
      )}
      {showAdd && (
        <AddLeagueModal onClose={() => setShowAdd(false)} onAdded={fetchLeagues} />
      )}
    </div>
  );
}
