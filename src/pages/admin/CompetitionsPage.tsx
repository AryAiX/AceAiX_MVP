import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, Plus, Check, X, ChevronDown, ChevronUp,
  Globe, Filter, Edit2, AlertTriangle, Trophy, CheckCircle,
  XCircle, Loader2, Layers, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Competition {
  id: string;
  name: string;
  sport: string;
  structure_type: string;
  type: string;
  country: string;
  country_code: string | null;
  flag_url: string | null;
  logo_url: string | null;
  governing_body: string | null;
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
  sport: string;
  status: string;
  inserted: number;
  total: number;
  started_at: string;
  finished_at: string | null;
  error_msg: string | null;
}

interface Filters {
  sport: string;
  structure_type: string;
  tier: string;
  gender: string;
  dataSource: string;
  status: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STRUCTURE_META: Record<string, { label: string; color: string }> = {
  league:       { label: 'League',       color: '#2F80ED' },
  cup:          { label: 'Cup',          color: '#EF5350' },
  tour_circuit: { label: 'Tour/Circuit', color: '#B8F135' },
  championship: { label: 'Championship', color: '#F5A623' },
  tournament:   { label: 'Tournament',   color: '#1FB57A' },
  friendly:     { label: 'Friendly',     color: '#7C8DA6' },
  other:        { label: 'Other',        color: '#7C8DA6' },
};

const TIER_COLORS: Record<string, string> = {
  professional: '#B8F135', semi_pro: '#2F80ED', amateur: '#1FB57A',
  college: '#F5A623', youth_academy: '#EF5350', grassroots: '#64B5F6',
};

const SOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  licensed:  { label: 'Licensed',  color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' },
  community: { label: 'Community', color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  none:      { label: 'Manual',    color: '#7C8DA6', bg: 'rgba(124,141,166,0.12)' },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Approved', color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' },
  pending:  { label: 'Pending',  color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  rejected: { label: 'Rejected', color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
};

const SYNCABLE_SPORTS = [
  { value: 'football',   label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'baseball',   label: 'Baseball' },
  { value: 'hockey',     label: 'Ice Hockey' },
  { value: 'rugby',      label: 'Rugby' },
  { value: 'handball',   label: 'Handball' },
  { value: 'formula_1',  label: 'Formula 1' },
  { value: 'all_seed',   label: 'All Seed Data (tennis, golf, athletics, etc.)' },
];

const ALL_SPORTS = [
  'football', 'basketball', 'volleyball', 'baseball', 'hockey', 'rugby',
  'handball', 'tennis', 'golf', 'athletics', 'swimming', 'cycling',
  'boxing', 'mma', 'motorsport', 'formula_1', 'polo', 'esports',
];

const PAGE_SIZE = 50;

// ── Micro-components ──────────────────────────────────────────────────────────

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

function StructureChip({ type }: { type: string }) {
  const m = STRUCTURE_META[type] ?? STRUCTURE_META.other;
  return <Chip label={m.label} color={m.color} bg={`${m.color}18`} />;
}

function TierChip({ tier }: { tier: string | null }) {
  if (!tier) return <span style={{ color: '#4A5568', fontSize: 11 }}>—</span>;
  const color = TIER_COLORS[tier] ?? '#7C8DA6';
  const short: Record<string, string> = {
    professional: 'Pro', semi_pro: 'Semi', amateur: 'Amt',
    college: 'Col', youth_academy: 'Youth', grassroots: 'Grass', recreational: 'Rec',
  };
  return <Chip label={short[tier] ?? tier} color={color} bg={`${color}20`} />;
}

function CompLogo({ url, name, size = 26 }: { url?: string | null; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return <img src={url} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />;
  }
  return (
    <div className="flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0"
      style={{ width: size, height: size, background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>
      {name.charAt(0)}
    </div>
  );
}

function FlagImg({ url, code }: { url?: string | null; code?: string | null }) {
  if (url) return <img src={url} alt={code ?? ''} style={{ width: 18, height: 13, objectFit: 'contain', borderRadius: 2, flexShrink: 0 }} />;
  return <Globe size={14} style={{ color: '#7C8DA6', flexShrink: 0 }} />;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ comp, onClose, onSave }: {
  comp: Competition;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Competition>) => Promise<void>;
}) {
  const [f, setF] = useState({
    tier: comp.tier ?? '',
    structure_type: comp.structure_type,
    gender: comp.gender,
    status: comp.verification_status,
    governing_body: comp.governing_body ?? '',
  });
  const [saving, setSaving] = useState(false);

  const sel = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await onSave(comp.id, {
      tier: f.tier || null,
      structure_type: f.structure_type,
      gender: f.gender,
      verification_status: f.status,
      governing_body: f.governing_body || null,
    });
    setSaving(false);
    onClose();
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', borderRadius: 12, padding: '7px 10px', fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}><X size={14} /></button>

        <div className="flex items-center gap-3 mb-5">
          <CompLogo url={comp.logo_url} name={comp.name} size={36} />
          <div>
            <p className="font-bold text-white text-sm">{comp.name}</p>
            <p className="text-[11px]" style={{ color: '#7C8DA6' }}>{comp.sport} · {comp.country}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Structure Type', key: 'structure_type', type: 'select',
              opts: [['league','League'],['cup','Cup'],['tour_circuit','Tour / Circuit'],['championship','Championship'],['tournament','Tournament'],['friendly','Friendly'],['other','Other']],
            },
            {
              label: 'Tier', key: 'tier', type: 'select',
              opts: [['','— Not set'],['professional','Professional'],['semi_pro','Semi-Pro'],['amateur','Amateur'],['college','College'],['youth_academy','Youth'],['school','School'],['grassroots','Grassroots'],['recreational','Recreational']],
            },
            {
              label: 'Gender', key: 'gender', type: 'select',
              opts: [['open','Open'],['men','Men'],['women','Women'],['mixed','Mixed']],
            },
            {
              label: 'Status', key: 'status', type: 'select',
              opts: [['approved','Approved'],['pending','Pending'],['rejected','Rejected']],
            },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>{label}</label>
              <select value={f[key as keyof typeof f]} onChange={sel(key as keyof typeof f)} style={{ ...inputStyle, appearance: 'none' }}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Governing Body</label>
            <input value={f.governing_body} onChange={sel('governing_body')} placeholder="e.g. FIFA, World Athletics…" style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: '#2F80ED', color: 'white' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Competition Modal ─────────────────────────────────────────────────────

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [f, setF] = useState({
    name: '', sport: 'football', structure_type: 'league', country: '',
    country_code: '', gender: 'men', tier: '', governing_body: '', logo_url: '',
  });
  const [dupes, setDupes] = useState<Competition[]>([]);
  const [saving, setSaving] = useState(false);

  const field = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  async function checkDupes() {
    if (!f.name.trim()) return;
    const { data } = await supabase.from('competitions')
      .select('id,name,country,logo_url,sport,structure_type')
      .ilike('name', `%${f.name.trim()}%`).limit(5);
    setDupes((data as Competition[]) ?? []);
  }

  async function submit() {
    setSaving(true);
    await supabase.from('competitions').insert({
      name: f.name.trim(), sport: f.sport, structure_type: f.structure_type,
      country: f.country, country_code: f.country_code || null,
      gender: f.gender, tier: f.tier || null,
      governing_body: f.governing_body || null,
      logo_url: f.logo_url || null,
      data_source: 'none', verification_status: 'approved', provider: 'community',
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  const iStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', borderRadius: 12, padding: '7px 10px', fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 relative my-8"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}><X size={14} /></button>
        <h3 className="font-bold text-white mb-5">Add Competition</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Name *</label>
            <input value={f.name} onChange={field('name')} onBlur={checkDupes} placeholder="e.g. Premier League" style={iStyle} />
          </div>

          {dupes.length > 0 && (
            <div className="col-span-2 rounded-xl p-3" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={12} style={{ color: '#F5A623' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#F5A623' }}>Possible duplicates</span>
              </div>
              {dupes.map(d => (
                <div key={d.id} className="flex items-center gap-2 py-0.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <CompLogo url={d.logo_url} name={d.name} size={16} />
                  {d.name} — {d.country} ({d.sport})
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Sport</label>
            <select value={f.sport} onChange={field('sport')} style={{ ...iStyle, appearance: 'none' }}>
              {ALL_SPORTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Structure Type</label>
            <select value={f.structure_type} onChange={field('structure_type')} style={{ ...iStyle, appearance: 'none' }}>
              {Object.entries(STRUCTURE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Country</label>
            <input value={f.country} onChange={field('country')} placeholder="England" style={iStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Code</label>
            <input value={f.country_code} onChange={field('country_code')} placeholder="GB" maxLength={2} style={iStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Gender</label>
            <select value={f.gender} onChange={field('gender')} style={{ ...iStyle, appearance: 'none' }}>
              {[['men','Men'],['women','Women'],['mixed','Mixed'],['open','Open']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Tier</label>
            <select value={f.tier} onChange={field('tier')} style={{ ...iStyle, appearance: 'none' }}>
              {[['','— Not set'],['professional','Professional'],['semi_pro','Semi-Pro'],['amateur','Amateur'],['college','College'],['youth_academy','Youth'],['grassroots','Grassroots'],['recreational','Recreational']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Governing Body</label>
            <input value={f.governing_body} onChange={field('governing_body')} placeholder="FIFA, World Athletics, UCI…" style={iStyle} />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>Logo URL (optional)</label>
            <input value={f.logo_url} onChange={field('logo_url')} placeholder="https://…" style={iStyle} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
          <button onClick={submit} disabled={saving || !f.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#B8F135', color: '#0C1A2B' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sync Panel ────────────────────────────────────────────────────────────────

function SyncPanel({ onDone }: { onDone: () => void }) {
  const [sport, setSport] = useState('football');
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('sync_log').select('*')
      .order('started_at', { ascending: false }).limit(8)
      .then(({ data }) => setLogs((data as SyncLog[]) ?? []));
  }, []);

  async function triggerSync() {
    setSyncing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke(`sync-competitions?sport=${sport}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (res.error) throw new Error(res.error.message);
      const { data: newLogs } = await supabase.from('sync_log').select('*')
        .order('started_at', { ascending: false }).limit(8);
      setLogs((newLogs as SyncLog[]) ?? []);
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.15)' }}>
            <RefreshCw size={13} style={{ color: '#2F80ED' }} />
          </div>
          <p className="text-xs font-bold text-white">Sync Competitions</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={sport} onChange={e => setSport(e.target.value)}
            className="rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
            {SYNCABLE_SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={triggerSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Sync Now
          </button>
        </div>
      </div>

      {error && (
        <p className="text-[11px] px-2 py-1.5 rounded-lg" style={{ background: 'rgba(239,83,80,0.1)', color: '#EF5350' }}>{error}</p>
      )}

      {logs.length > 0 && (
        <div className="space-y-1">
          {logs.slice(0, 4).map(log => {
            const icon = log.status === 'success'
              ? <CheckCircle size={11} style={{ color: '#1FB57A' }} />
              : log.status === 'error'
              ? <XCircle size={11} style={{ color: '#EF5350' }} />
              : <Loader2 size={11} className="animate-spin" style={{ color: '#F5A623' }} />;
            return (
              <div key={log.id} className="flex items-center gap-2 text-[10px]" style={{ color: '#7C8DA6' }}>
                {icon}
                <span className="font-semibold capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{log.sport}</span>
                <span>·</span>
                <span>{log.total > 0 ? `${log.total.toLocaleString()} competitions` : log.error_msg?.slice(0, 50) ?? '—'}</span>
                <span className="ml-auto">{new Date(log.started_at).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const active = Object.values(filters).filter(Boolean).length;

  const sel = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [k]: e.target.value });

  const sStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: 10, padding: '6px 10px', fontSize: 12, outline: 'none',
  };

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-white/10"
        style={{ border: '1px solid rgba(255,255,255,0.12)', color: active > 0 ? '#2F80ED' : 'rgba(255,255,255,0.5)' }}>
        <Filter size={12} />
        Filters
        {active > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold" style={{ background: '#2F80ED', color: 'white' }}>
            {active}
          </span>
        )}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {open && (
        <div className="mt-2 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { label: 'Sport',     key: 'sport',     opts: [['', 'All Sports'], ...ALL_SPORTS.map(s => [s, s.replace('_',' ')])] },
            { label: 'Type',      key: 'structure_type', opts: [['', 'All Types'], ...Object.entries(STRUCTURE_META).map(([v,m]) => [v,m.label])] },
            { label: 'Tier',      key: 'tier',      opts: [['','All Tiers'],['professional','Professional'],['semi_pro','Semi-Pro'],['amateur','Amateur'],['college','College'],['youth_academy','Youth']] },
            { label: 'Gender',    key: 'gender',    opts: [['','All'],['men','Men'],['women','Women'],['mixed','Mixed']] },
            { label: 'Source',    key: 'dataSource',opts: [['','All Sources'],['licensed','Licensed'],['community','Community'],['none','Manual']] },
            { label: 'Status',    key: 'status',    opts: [['','All'],['approved','Approved'],['pending','Pending'],['rejected','Rejected']] },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold mb-1" style={{ color: '#7C8DA6' }}>{label}</label>
              <select value={filters[key as keyof Filters]} onChange={sel(key as keyof Filters)} style={sStyle}>
                {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex justify-end">
            <button onClick={() => onChange({ sport:'', structure_type:'', tier:'', gender:'', dataSource:'', status:'' })}
              className="text-xs font-semibold hover:text-white" style={{ color: '#7C8DA6' }}>
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompetitionsPage() {
  const [comps, setComps] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [dbQuery, setDbQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ sport:'', structure_type:'', tier:'', gender:'', dataSource:'', status:'' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editComp, setEditComp] = useState<Competition | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDbQuery(query); setPage(0); }, 300);
  }, [query]);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('competitions').select('*', { count: 'exact' });
    if (dbQuery) q = q.or(`name.ilike.%${dbQuery}%,country.ilike.%${dbQuery}%,governing_body.ilike.%${dbQuery}%`);
    if (filters.sport)          q = q.eq('sport', filters.sport);
    if (filters.structure_type) q = q.eq('structure_type', filters.structure_type);
    if (filters.tier)           q = q.eq('tier', filters.tier);
    if (filters.gender)         q = q.eq('gender', filters.gender);
    if (filters.dataSource)     q = q.eq('data_source', filters.dataSource);
    if (filters.status)         q = q.eq('verification_status', filters.status);
    q = q.order('sport').order('name').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, count } = await q;
    setComps((data as Competition[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [dbQuery, filters, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(0); }, [filters]);

  async function saveComp(id: string, patch: Partial<Competition>) {
    await supabase.from('competitions').update(patch).eq('id', id);
    fetch();
  }

  async function applyBulk() {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    const patches: Record<string, Partial<Competition>> = {
      approve:      { verification_status: 'approved' },
      reject:       { verification_status: 'rejected' },
      professional: { tier: 'professional' },
      semi_pro:     { tier: 'semi_pro' },
      amateur:      { tier: 'amateur' },
    };
    if (patches[bulkAction]) {
      await supabase.from('competitions').update(patches[bulkAction]).in('id', ids);
    }
    setSelected(new Set()); setBulkAction(''); setBulkLoading(false);
    fetch();
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected(selected.size === comps.length ? new Set() : new Set(comps.map(c => c.id)));
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = comps.filter(c => c.verification_status === 'pending').length;

  const COLS = '32px 32px 1fr 90px 110px 110px 80px 70px 80px 80px 90px 72px';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Competition Catalog</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7C8DA6' }}>
            {total.toLocaleString()} competitions across all sports · {pendingCount} pending
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: '#B8F135', color: '#0C1A2B' }}>
          <Plus size={14} /> Add Competition
        </button>
      </div>

      {/* Sync */}
      <SyncPanel onDone={fetch} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: total.toLocaleString(),                                             color: '#2F80ED' },
          { label: 'Sports',    value: [...new Set(comps.map(c => c.sport))].length.toString(),            color: '#B8F135' },
          { label: 'Verified',  value: comps.filter(c => c.verification_status === 'approved').length.toLocaleString(), color: '#1FB57A' },
          { label: 'Pending',   value: pendingCount.toLocaleString(),                                      color: '#F5A623' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#7C8DA6' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search competitions, countries, governing bodies…"
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
        </div>
        <FilterBar filters={filters} onChange={f => { setFilters(f); setPage(0); }} />
      </div>

      {/* Bulk */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.22)' }}>
          <span className="text-xs font-bold text-white">{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
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
            {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Apply
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest overflow-x-auto"
          style={{ background: '#0A1828', color: '#7C8DA6', gridTemplateColumns: COLS, minWidth: 900 }}>
          <input type="checkbox" checked={selected.size === comps.length && comps.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 accent-azure" />
          <span></span>
          <span>Name</span>
          <span>Sport</span>
          <span>Type</span>
          <span>Country</span>
          <span>Gov. Body</span>
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
        ) : comps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ background: '#0D1A2B' }}>
            <Layers size={28} style={{ color: '#7C8DA6' }} />
            <p className="text-sm" style={{ color: '#7C8DA6' }}>No competitions found</p>
          </div>
        ) : (
          comps.map((c, idx) => {
            const src = SOURCE_META[c.data_source] ?? SOURCE_META.none;
            const st = STATUS_META[c.verification_status] ?? STATUS_META.pending;
            return (
              <div key={c.id}
                className="grid items-center px-4 py-3 text-xs transition-colors"
                style={{
                  gridTemplateColumns: COLS, minWidth: 900,
                  background: idx % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(47,128,237,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)')}
              >
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                  className="w-3.5 h-3.5 accent-azure" onClick={e => e.stopPropagation()} />
                <CompLogo url={c.logo_url} name={c.name} />
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-white truncate text-xs leading-snug">{c.name}</p>
                  {c.season && <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{c.season}{c.is_current ? ' · Current' : ''}</p>}
                </div>
                <span className="capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.sport.replace('_',' ')}</span>
                <StructureChip type={c.structure_type} />
                <div className="flex items-center gap-1.5 min-w-0">
                  <FlagImg url={c.flag_url} code={c.country_code} />
                  <span className="truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.country}</span>
                </div>
                <span className="truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.governing_body ?? '—'}</span>
                <TierChip tier={c.tier} />
                <span className="capitalize text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.gender}</span>
                <Chip label={src.label} color={src.color} bg={src.bg} />
                <Chip label={st.label} color={st.color} bg={st.bg} />
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditComp(c)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10"
                    title="Edit" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Edit2 size={11} />
                  </button>
                  {c.verification_status === 'pending' && (<>
                    <button onClick={() => saveComp(c.id, { verification_status: 'approved' })}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-emerald-500/20" title="Approve" style={{ color: '#1FB57A' }}>
                      <Check size={11} />
                    </button>
                    <button onClick={() => saveComp(c.id, { verification_status: 'rejected' })}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20" title="Reject" style={{ color: '#EF5350' }}>
                      <X size={11} />
                    </button>
                  </>)}
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
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 hover:bg-white/10 transition-colors flex items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ChevronLeft size={11} /> Prev
            </button>
            <span className="px-3 text-xs" style={{ color: '#7C8DA6' }}>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 hover:bg-white/10 transition-colors flex items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Next <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}

      {editComp && <EditModal comp={editComp} onClose={() => setEditComp(null)} onSave={saveComp} />}
      {showAdd  && <AddModal onClose={() => setShowAdd(false)} onAdded={fetch} />}
    </div>
  );
}
