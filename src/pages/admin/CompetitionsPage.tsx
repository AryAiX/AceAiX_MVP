import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, Plus, Check, X, ChevronDown, ChevronUp,
  Globe, Filter, Edit2, AlertTriangle, Trophy, CheckCircle,
  XCircle, Loader2, Layers, ChevronLeft, ChevronRight, Zap,
  ArrowUpRight, Activity, ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Competition {
  id: string; name: string; sport: string; structure_type: string; type: string;
  country: string; country_code: string | null; flag_url: string | null;
  logo_url: string | null; governing_body: string | null; tier: string | null;
  gender: string; season: number | null; is_current: boolean;
  data_source: string; verification_status: string; provider: string;
  external_id: string | null; last_synced_at: string | null; created_at: string;
}

interface SyncLog {
  id: string; sport: string; status: string; inserted: number; total: number;
  started_at: string; finished_at: string | null; error_msg: string | null;
}

interface Filters {
  sport: string; structure_type: string; tier: string;
  gender: string; dataSource: string; status: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STRUCTURE_META: Record<string, { label: string; color: string }> = {
  league:       { label: 'League',       color: '#2F80ED' },
  cup:          { label: 'Cup',          color: '#EF5350' },
  tour_circuit: { label: 'Tour/Circuit', color: '#B8F135' },
  championship: { label: 'Champ.',       color: '#F5A623' },
  tournament:   { label: 'Tournament',   color: '#1FB57A' },
  friendly:     { label: 'Friendly',     color: '#7C8DA6' },
  other:        { label: 'Other',        color: '#7C8DA6' },
};

const TIER_COLORS: Record<string, string> = {
  professional: '#B8F135', semi_pro: '#2F80ED', amateur: '#1FB57A',
  college: '#F5A623', youth_academy: '#EF5350', grassroots: '#64B5F6',
};

const SOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  licensed:  { label: 'Licensed',  color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  community: { label: 'Community', color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
  none:      { label: 'Manual',    color: '#9DB0C6', bg: 'rgba(157,176,198,0.10)' },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Approved', color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  pending:  { label: 'Pending',  color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
  rejected: { label: 'Rejected', color: '#EF5350', bg: 'rgba(239,83,80,0.12)'   },
};

const SYNCABLE_SPORTS = [
  { value: 'football',   label: 'Football'    },
  { value: 'basketball', label: 'Basketball'  },
  { value: 'volleyball', label: 'Volleyball'  },
  { value: 'baseball',   label: 'Baseball'    },
  { value: 'hockey',     label: 'Ice Hockey'  },
  { value: 'rugby',      label: 'Rugby'       },
  { value: 'handball',   label: 'Handball'    },
  { value: 'formula_1',  label: 'Formula 1'   },
  { value: 'all_seed',   label: 'All Seed Data'},
];

const ALL_SPORTS = [
  'football','basketball','volleyball','baseball','hockey','rugby',
  'handball','tennis','golf','athletics','swimming','cycling',
  'boxing','mma','motorsport','formula_1','polo','esports',
];

const PAGE_SIZE = 50;

// ── Count-up ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ── Micro-chips ───────────────────────────────────────────────────────────────

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
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
  const strColor = STRUCTURE_META.league.color;
  return (
    <div className="flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0"
      style={{ width: size, height: size, background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>
      {name.charAt(0)}
    </div>
  );
}

function FlagImg({ url, code }: { url?: string | null; code?: string | null }) {
  if (url) return <img src={url} alt={code ?? ''} style={{ width: 18, height: 13, objectFit: 'contain', borderRadius: 2, flexShrink: 0 }} />;
  return <Globe size={12} style={{ color: '#9DB0C6', flexShrink: 0 }} />;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ comp, onClose, onSave }: {
  comp: Competition; onClose: () => void;
  onSave: (id: string, patch: Partial<Competition>) => Promise<void>;
}) {
  const [f, setF] = useState({
    tier: comp.tier ?? '', structure_type: comp.structure_type,
    gender: comp.gender, status: comp.verification_status,
    governing_body: comp.governing_body ?? '',
  });
  const [saving, setSaving] = useState(false);
  const sel = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await onSave(comp.id, {
      tier: f.tier || null, structure_type: f.structure_type,
      gender: f.gender, verification_status: f.status,
      governing_body: f.governing_body || null,
    });
    setSaving(false);
    onClose();
  }

  const iStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', borderRadius: 12, padding: '7px 10px',
    fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,15,28,0.90)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.15s ease' }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: 'linear-gradient(160deg,#0F1E32,#0A1626)',
          border: '1px solid rgba(47,128,237,0.25)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(47,128,237,0.05)',
          animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <X size={14} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <CompLogo url={comp.logo_url} name={comp.name} size={36} />
          <div>
            <p className="font-bold text-white text-sm">{comp.name}</p>
            <p className="text-[11px]" style={{ color: '#9DB0C6' }}>{comp.sport} · {comp.country}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Structure Type', key: 'structure_type', opts: [['league','League'],['cup','Cup'],['tour_circuit','Tour/Circuit'],['championship','Championship'],['tournament','Tournament'],['friendly','Friendly'],['other','Other']] },
            { label: 'Tier',           key: 'tier',           opts: [['','— Not set'],['professional','Professional'],['semi_pro','Semi-Pro'],['amateur','Amateur'],['college','College'],['youth_academy','Youth'],['grassroots','Grassroots'],['recreational','Recreational']] },
            { label: 'Gender',         key: 'gender',         opts: [['open','Open'],['men','Men'],['women','Women'],['mixed','Mixed']] },
            { label: 'Status',         key: 'status',         opts: [['approved','Approved'],['pending','Pending'],['rejected','Rejected']] },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>{label}</label>
              <select value={f[key as keyof typeof f]} onChange={sel(key as keyof typeof f)} style={{ ...iStyle, appearance: 'none' }}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Governing Body</label>
            <input value={f.governing_body} onChange={sel('governing_body')} placeholder="e.g. FIFA, World Athletics…" style={iStyle} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/[0.07] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-[1.02]"
            style={{ background: '#2F80ED', color: 'white', boxShadow: '0 0 16px rgba(47,128,237,0.3)' }}>
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
      .select('id,name,country,logo_url,sport,structure_type').ilike('name', `%${f.name.trim()}%`).limit(5);
    setDupes((data as Competition[]) ?? []);
  }

  async function submit() {
    setSaving(true);
    await supabase.from('competitions').insert({
      name: f.name.trim(), sport: f.sport, structure_type: f.structure_type,
      country: f.country, country_code: f.country_code || null,
      gender: f.gender, tier: f.tier || null,
      governing_body: f.governing_body || null, logo_url: f.logo_url || null,
      data_source: 'none', verification_status: 'approved', provider: 'community',
    });
    setSaving(false); onAdded(); onClose();
  }

  const iStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', borderRadius: 12, padding: '7px 10px', fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(8,15,28,0.90)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.15s ease' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 relative my-8"
        style={{
          background: 'linear-gradient(160deg,#0F1E32,#0A1626)',
          border: '1px solid rgba(184,241,53,0.2)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(184,241,53,0.04)',
          animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <X size={14} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(184,241,53,0.12)', color: '#B8F135' }}>
            <Trophy size={16} />
          </div>
          <h3 className="font-bold text-white">Add Competition</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Name *</label>
            <input value={f.name} onChange={field('name')} onBlur={checkDupes} placeholder="e.g. Premier League" style={iStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(184,241,53,0.4)')}
              onBlur2={() => {}}
            />
          </div>
          {dupes.length > 0 && (
            <div className="col-span-2 rounded-xl p-3" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={12} style={{ color: '#F5A623' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#F5A623' }}>Possible duplicates found</span>
              </div>
              {dupes.map(d => (
                <div key={d.id} className="flex items-center gap-2 py-0.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <CompLogo url={d.logo_url} name={d.name} size={14} />
                  {d.name} — {d.country} ({d.sport})
                </div>
              ))}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Sport</label>
            <select value={f.sport} onChange={field('sport')} style={{ ...iStyle, appearance: 'none' }}>
              {ALL_SPORTS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Structure Type</label>
            <select value={f.structure_type} onChange={field('structure_type')} style={{ ...iStyle, appearance: 'none' }}>
              {Object.entries(STRUCTURE_META).map(([v,m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Country</label>
            <input value={f.country} onChange={field('country')} placeholder="England" style={iStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Code</label>
            <input value={f.country_code} onChange={field('country_code')} placeholder="GB" maxLength={2} style={iStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Gender</label>
            <select value={f.gender} onChange={field('gender')} style={{ ...iStyle, appearance: 'none' }}>
              {[['men','Men'],['women','Women'],['mixed','Mixed'],['open','Open']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Tier</label>
            <select value={f.tier} onChange={field('tier')} style={{ ...iStyle, appearance: 'none' }}>
              {[['','— Not set'],['professional','Professional'],['semi_pro','Semi-Pro'],['amateur','Amateur'],['college','College'],['youth_academy','Youth'],['grassroots','Grassroots'],['recreational','Recreational']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Governing Body</label>
            <input value={f.governing_body} onChange={field('governing_body')} placeholder="FIFA, World Athletics, UCI…" style={iStyle} />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Logo URL (optional)</label>
            <input value={f.logo_url} onChange={field('logo_url')} placeholder="https://…" style={iStyle} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/[0.07] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving || !f.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:scale-[1.02] transition-all"
            style={{ background: '#B8F135', color: '#0C1A2B', boxShadow: '0 0 20px rgba(184,241,53,0.2)' }}>
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.from('sync_log').select('*')
      .order('started_at', { ascending: false }).limit(6)
      .then(({ data }) => setLogs((data as SyncLog[]) ?? []));
  }, []);

  async function triggerSync() {
    setSyncing(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke(`sync-competitions?sport=${sport}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (res.error) throw new Error(res.error.message);
      const { data: newLogs } = await supabase.from('sync_log').select('*').order('started_at', { ascending: false }).limit(6);
      setLogs((newLogs as SyncLog[]) ?? []);
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally { setSyncing(false); }
  }

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: '#0F1E32',
        border: open ? '1px solid rgba(47,128,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: open ? '0 0 30px rgba(47,128,237,0.06)' : 'none',
      }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Data Sync</p>
            <p className="text-[10px]" style={{ color: '#9DB0C6' }}>
              {logs.length > 0 ? `Last: ${new Date(logs[0].started_at).toLocaleString()}` : 'Never synced'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <select value={sport} onChange={e => setSport(e.target.value)}
            className="rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
            {SYNCABLE_SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={triggerSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] disabled:opacity-50"
            style={{ background: 'rgba(47,128,237,0.18)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.35)', boxShadow: syncing ? '0 0 16px rgba(47,128,237,0.2)' : 'none' }}>
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
          <button onClick={() => setOpen(o => !o)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.07] transition-colors"
            style={{ color: '#9DB0C6' }}>
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-xl text-[11px]"
          style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
          {error}
        </div>
      )}

      {open && logs.length > 0 && (
        <div className="px-4 pb-4 space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9DB0C6' }}>Recent sync logs</p>
          {logs.map((log, i) => {
            const ok      = log.status === 'success';
            const failed  = log.status === 'error';
            const color   = ok ? '#1FB57A' : failed ? '#EF5350' : '#F5A623';
            return (
              <div key={log.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px]"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}18`,
                  opacity: 1,
                  animation: `fadeIn 0.2s ease ${i * 0.04}s both`,
                }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, color }}>
                  {ok ? <CheckCircle size={10} /> : failed ? <XCircle size={10} /> : <Loader2 size={10} className="animate-spin" />}
                </div>
                <span className="font-semibold capitalize text-white">{log.sport.replace('_',' ')}</span>
                <span className="flex-1" style={{ color: '#9DB0C6' }}>
                  {log.total > 0 ? `${log.total.toLocaleString()} competitions` : log.error_msg?.slice(0, 60) ?? '—'}
                </span>
                <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{new Date(log.started_at).toLocaleString()}</span>
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
  const activeCount = Object.values(filters).filter(Boolean).length;
  const sStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: 10, padding: '6px 10px', fontSize: 12, outline: 'none',
  };

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03]"
        style={{
          border: activeCount > 0 ? '1px solid rgba(47,128,237,0.4)' : '1px solid rgba(255,255,255,0.12)',
          background: activeCount > 0 ? 'rgba(47,128,237,0.1)' : 'rgba(255,255,255,0.04)',
          color: activeCount > 0 ? '#2F80ED' : '#9DB0C6',
        }}>
        <Filter size={12} />
        Filters
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
            style={{ background: '#2F80ED', color: 'white' }}>
            {activeCount}
          </span>
        )}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {open && (
        <div className="mt-2 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideDown 0.2s ease' }}>
          {[
            { label: 'Sport',     key: 'sport',          opts: [['','All Sports'], ...ALL_SPORTS.map(s => [s, s.replace('_',' ')])] },
            { label: 'Type',      key: 'structure_type', opts: [['','All Types'], ...Object.entries(STRUCTURE_META).map(([v,m]) => [v,m.label])] },
            { label: 'Tier',      key: 'tier',           opts: [['','All Tiers'],['professional','Professional'],['semi_pro','Semi-Pro'],['amateur','Amateur'],['college','College'],['youth_academy','Youth']] },
            { label: 'Gender',    key: 'gender',         opts: [['','All'],['men','Men'],['women','Women'],['mixed','Mixed']] },
            { label: 'Source',    key: 'dataSource',     opts: [['','All Sources'],['licensed','Licensed'],['community','Community'],['none','Manual']] },
            { label: 'Status',    key: 'status',         opts: [['','All'],['approved','Approved'],['pending','Pending'],['rejected','Rejected']] },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>{label}</label>
              <select
                value={filters[key as keyof Filters]}
                onChange={e => onChange({ ...filters, [key]: e.target.value })}
                style={sStyle}>
                {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex justify-end">
            <button
              onClick={() => onChange({ sport:'', structure_type:'', tier:'', gender:'', dataSource:'', status:'' })}
              className="text-xs font-semibold transition-colors hover:text-white" style={{ color: '#9DB0C6' }}>
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
  const [comps, setComps]       = useState<Competition[]>([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [query, setQuery]       = useState('');
  const [dbQuery, setDbQuery]   = useState('');
  const [filters, setFilters]   = useState<Filters>({ sport:'', structure_type:'', tier:'', gender:'', dataSource:'', status:'' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editComp, setEditComp] = useState<Competition | null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDbQuery(query); setPage(0); }, 300);
  }, [query]);

  const fetchComps = useCallback(async () => {
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

  useEffect(() => { fetchComps(); }, [fetchComps]);
  useEffect(() => { setPage(0); }, [filters]);

  async function saveComp(id: string, patch: Partial<Competition>) {
    await supabase.from('competitions').update(patch).eq('id', id);
    fetchComps();
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
    fetchComps();
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected(selected.size === comps.length ? new Set() : new Set(comps.map(c => c.id)));
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = comps.filter(c => c.verification_status === 'pending').length;
  const approvedCount = comps.filter(c => c.verification_status === 'approved').length;
  const uniqueSports = [...new Set(comps.map(c => c.sport))].length;

  const totalCU   = useCountUp(total);
  const sportsCU  = useCountUp(uniqueSports);
  const approvedCU = useCountUp(approvedCount);
  const pendingCU  = useCountUp(pendingCount);

  const COLS = '32px 28px 1fr 90px 100px 100px 80px 70px 80px 80px 90px 68px';

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn  { from { opacity: 0; transform: scale(0.92) translateY(-8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes slideDown{ from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes rowSlide { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes pulseDot { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
      `}</style>

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Competition Catalog</h1>
            <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: '#9DB0C6' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1FB57A', animation: 'pulseDot 2s ease-in-out infinite', display: 'inline-block' }} />
              Live Supabase · {total.toLocaleString()} competitions
              {pendingCount > 0 && <> · <span style={{ color: '#F5A623' }}>{pendingCount} pending</span></>}
            </p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: '#B8F135', color: '#0C1A2B', boxShadow: '0 0 20px rgba(184,241,53,0.25)' }}>
            <Plus size={14} /> Add Competition
          </button>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: totalCU,    color: '#2F80ED', icon: Trophy,      suffix: '' },
            { label: 'Sports',   value: sportsCU,   color: '#B8F135', icon: Activity,    suffix: '' },
            { label: 'Verified', value: approvedCU, color: '#1FB57A', icon: ShieldCheck, suffix: '' },
            { label: 'Pending',  value: pendingCU,  color: '#F5A623', icon: AlertTriangle,suffix:'', pulse: pendingCU > 0 },
          ].map(s => (
            <div key={s.label}
              className="rounded-2xl p-4 relative overflow-hidden group cursor-default"
              style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${s.color}35`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${s.color}08`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${s.color}07, transparent 60%)` }} />
              <div className="flex items-center gap-2 mb-2 relative">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={13} />
                </div>
                {s.pulse && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-bold relative" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Structure type legend bar */}
        <div className="flex flex-wrap gap-2 px-4 py-3 rounded-2xl"
          style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest w-full mb-1" style={{ color: '#9DB0C6' }}>Structure types</p>
          {Object.entries(STRUCTURE_META).map(([k, m]) => (
            <button key={k}
              onClick={() => {
                const f = filters.structure_type === k ? '' : k;
                setFilters(prev => ({ ...prev, structure_type: f })); setPage(0);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all hover:scale-[1.04]"
              style={{
                background: filters.structure_type === k ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                color: filters.structure_type === k ? m.color : '#9DB0C6',
                border: filters.structure_type === k ? `1px solid ${m.color}35` : '1px solid rgba(255,255,255,0.07)',
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Sync panel */}
        <SyncPanel onDone={fetchComps} />

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9DB0C6' }} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search competitions, countries, governing bodies…"
              className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.5)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <FilterBar filters={filters} onChange={f => { setFilters(f); setPage(0); }} />
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl flex-wrap"
            style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.25)', animation: 'slideDown 0.2s ease' }}>
            <span className="text-xs font-bold" style={{ color: '#2F80ED' }}>{selected.size} selected</span>
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
              className="text-xs rounded-lg px-2 py-1.5 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
              <option value="">Bulk action…</option>
              <option value="approve">Approve all</option>
              <option value="reject">Reject all</option>
              <option value="professional">Set Tier: Professional</option>
              <option value="semi_pro">Set Tier: Semi-Pro</option>
              <option value="amateur">Set Tier: Amateur</option>
            </select>
            <button onClick={applyBulk} disabled={!bulkAction || bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 hover:scale-[1.03] transition-all"
              style={{ background: '#2F80ED', color: 'white' }}>
              {bulkLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Apply
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto" style={{ color: '#9DB0C6' }}>
              <X size={13} />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header */}
          <div className="grid items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: COLS, minWidth: 880 }}>
            <input type="checkbox"
              checked={selected.size === comps.length && comps.length > 0}
              onChange={toggleAll}
              className="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
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
            <span></span>
          </div>

          {/* Body */}
          {loading ? (
            <div className="space-y-0" style={{ background: '#0D1A2B' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-12 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: `shimmer 1.4s infinite ${i * 0.1}s`,
                    }} />
                </div>
              ))}
            </div>
          ) : comps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ background: '#0D1A2B' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(47,128,237,0.08)', color: '#9DB0C6' }}>
                <Layers size={24} />
              </div>
              <p className="text-sm" style={{ color: '#9DB0C6' }}>No competitions found</p>
            </div>
          ) : (
            comps.map((c, idx) => {
              const src = SOURCE_META[c.data_source] ?? SOURCE_META.none;
              const st  = STATUS_META[c.verification_status] ?? STATUS_META.pending;
              const isSelected = selected.has(c.id);
              const structColor = (STRUCTURE_META[c.structure_type] ?? STRUCTURE_META.other).color;

              return (
                <div key={c.id}
                  className="grid items-center px-4 py-3 text-xs cursor-default group"
                  style={{
                    gridTemplateColumns: COLS, minWidth: 880,
                    background: isSelected
                      ? 'rgba(47,128,237,0.07)'
                      : idx % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.012)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: isSelected ? '2px solid rgba(47,128,237,0.5)' : '2px solid transparent',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-4px)',
                    transition: `opacity 0.3s ease ${Math.min(idx, 15) * 0.025}s, transform 0.3s ease ${Math.min(idx, 15) * 0.025}s, background 0.15s ease`,
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(47,128,237,0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.012)';
                  }}
                >
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(c.id)}
                    className="w-3.5 h-3.5 accent-blue-500 cursor-pointer" onClick={e => e.stopPropagation()} />

                  <CompLogo url={c.logo_url} name={c.name} />

                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-white truncate text-xs leading-snug">{c.name}</p>
                    {c.season && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#9DB0C6' }}>
                        {c.season}{c.is_current ? ' · Current' : ''}
                      </p>
                    )}
                  </div>

                  <span className="capitalize text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {c.sport.replace('_',' ')}
                  </span>

                  <StructureChip type={c.structure_type} />

                  <div className="flex items-center gap-1.5 min-w-0">
                    <FlagImg url={c.flag_url} code={c.country_code} />
                    <span className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.country}</span>
                  </div>

                  <span className="truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {c.governing_body ?? '—'}
                  </span>

                  <TierChip tier={c.tier} />

                  <span className="capitalize text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.gender}</span>

                  <Chip label={src.label} color={src.color} bg={src.bg} />

                  <Chip label={st.label} color={st.color} bg={st.bg} />

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditComp(c)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                      title="Edit" style={{ color: '#9DB0C6' }}>
                      <Edit2 size={11} />
                    </button>
                    {c.verification_status === 'pending' && (
                      <>
                        <button onClick={() => saveComp(c.id, { verification_status: 'approved' })}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-emerald-500/20 transition-colors"
                          title="Approve" style={{ color: '#1FB57A' }}>
                          <Check size={11} />
                        </button>
                        <button onClick={() => saveComp(c.id, { verification_status: 'rejected' })}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Reject" style={{ color: '#EF5350' }}>
                          <X size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Footer / pagination */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: '#0A1828', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: '#9DB0C6' }}>
              {total > 0
                ? <>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of <strong className="text-white">{total.toLocaleString()}</strong></>
                : 'No results'}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-colors hover:bg-white/[0.07]"
                  style={{ color: '#9DB0C6', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ChevronLeft size={11} /> Prev
                </button>
                <span className="px-3 text-xs" style={{ color: '#9DB0C6' }}>{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-colors hover:bg-white/[0.07]"
                  style={{ color: '#9DB0C6', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Next <ChevronRight size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      {editComp && <EditModal comp={editComp} onClose={() => setEditComp(null)} onSave={saveComp} />}
      {showAdd  && <AddModal onClose={() => setShowAdd(false)} onAdded={fetchComps} />}
    </>
  );
}
