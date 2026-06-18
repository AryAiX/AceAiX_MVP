import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Check, X, Loader2, Edit3,
  Globe, ShieldCheck, AlertCircle, RefreshCw,
  Activity, ChevronDown, ChevronUp, Zap, Users,
  BarChart3, ArrowUpRight, Layers,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TIER_COLORS } from '../../context/LocaleContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Sport {
  id: string;
  name: string;
  type: 'team' | 'individual';
  icon: string;
  category: string;
  stat_schema: Array<{ key: string; label: string; type: string }>;
  display_order: number;
  active: boolean;
  created_at: string;
}

interface Suggestion {
  id: string;
  entity_type: string;
  name: string;
  sport?: string;
  country?: string;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
  suggested_by?: string;
}

// ── Category color map ────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  'Team Sports':          { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)'  },
  'Individual':           { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  'Racket Sports':        { color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
  'Combat Sports':        { color: '#EF5350', bg: 'rgba(239,83,80,0.12)'   },
  'Water Sports':         { color: '#2F80ED', bg: 'rgba(47,128,237,0.10)'  },
  'Winter Sports':        { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' },
  'Action Sports':        { color: '#B8F135', bg: 'rgba(184,241,53,0.10)'  },
  'Mind Sports':          { color: '#9DB0C6', bg: 'rgba(157,176,198,0.10)' },
  'Strength':             { color: '#EF5350', bg: 'rgba(239,83,80,0.10)'   },
  'Para Sports':          { color: '#2F80ED', bg: 'rgba(47,128,237,0.10)'  },
  'Equestrian & Country': { color: '#F5A623', bg: 'rgba(245,166,35,0.10)'  },
  'Other':                { color: '#9DB0C6', bg: 'rgba(157,176,198,0.08)' },
};

function getCatStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? { color: '#9DB0C6', bg: 'rgba(157,176,198,0.08)' };
}

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
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

// ── Schema editor ─────────────────────────────────────────────────────────────

function SchemaEditor({ schema, onChange }: { schema: Array<{ key: string; label: string; type: string }>; onChange: (s: typeof schema) => void }) {
  return (
    <div className="space-y-2">
      {schema.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2">
          <input
            className="px-2.5 py-1.5 rounded-lg text-xs text-white outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="key" value={f.key}
            onChange={e => onChange(schema.map((ff, idx) => idx === i ? { ...ff, key: e.target.value } : ff))}
          />
          <input
            className="px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="Label" value={f.label}
            onChange={e => onChange(schema.map((ff, idx) => idx === i ? { ...ff, label: e.target.value } : ff))}
          />
          <select
            className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
            value={f.type}
            onChange={e => onChange(schema.map((ff, idx) => idx === i ? { ...ff, type: e.target.value } : ff))}>
            <option value="int">Int</option>
            <option value="dec">Dec</option>
            <option value="pct">Pct</option>
            <option value="str">Str</option>
          </select>
          <button onClick={() => onChange(schema.filter((_, idx) => idx !== i))}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...schema, { key: '', label: '', type: 'int' }])}
        className="flex items-center gap-1.5 text-[11px] transition-colors hover:opacity-80"
        style={{ color: '#2F80ED' }}>
        <Plus size={11} /> Add stat field
      </button>
    </div>
  );
}

// ── Add sport modal ───────────────────────────────────────────────────────────

const CATEGORIES = ['Team Sports', 'Individual', 'Racket Sports', 'Combat Sports', 'Water Sports', 'Winter Sports', 'Action Sports', 'Mind Sports', 'Strength', 'Para Sports', 'Equestrian & Country', 'Other'];

function AddSportModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'team' | 'individual'>('team');
  const [category, setCategory] = useState('Team Sports');
  const [schema, setSchema] = useState<Array<{ key: string; label: string; type: string }>>([]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from('sports').insert({ name: name.trim(), type, category, stat_schema: schema });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,15,28,0.90)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.15s ease' }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(160deg, #0F1E32, #0A1626)',
          border: '1px solid rgba(184,241,53,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(184,241,53,0.04)',
          maxHeight: '90vh',
          animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184,241,53,0.12)', color: '#B8F135' }}>
              <Plus size={14} />
            </div>
            <h3 className="text-sm font-bold text-white">Add New Sport</h3>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9DB0C6' }}>Name</label>
            <input
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              placeholder="Sport name" value={name} onChange={e => setName(e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'rgba(184,241,53,0.4)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9DB0C6' }}>Type</label>
              <div className="flex gap-2">
                {(['team', 'individual'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                    style={{
                      background: type === t ? 'rgba(47,128,237,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${type === t ? 'rgba(47,128,237,0.4)' : 'rgba(255,255,255,0.09)'}`,
                      color: type === t ? '#2F80ED' : 'rgba(255,255,255,0.4)',
                      transform: type === t ? 'scale(1.03)' : 'scale(1)',
                    }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9DB0C6' }}>Category</label>
              <select
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
                value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9DB0C6' }}>Stat Schema</label>
            <SchemaEditor schema={schema} onChange={setSchema} />
          </div>
        </div>
        <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button disabled={!name.trim() || saving} onClick={handleSave}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:scale-[1.02] active:scale-[0.97]"
            style={{ background: '#B8F135', color: '#0C1A2B', boxShadow: '0 0 24px rgba(184,241,53,0.25)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Add Sport
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sport card ────────────────────────────────────────────────────────────────

function SportCard({
  sport, index, expanded, onToggleExpand, onToggleActive, saving,
}: {
  sport: Sport; index: number; expanded: boolean;
  onToggleExpand: () => void; onToggleActive: () => void; saving: boolean;
}) {
  const catStyle = getCatStyle(sport.category);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 40 + index * 35); }, [index]);

  return (
    <div className="rounded-2xl overflow-hidden group transition-all"
      style={{
        background: sport.active ? '#0F1E32' : 'rgba(255,255,255,0.02)',
        border: expanded
          ? `1px solid ${catStyle.color}35`
          : sport.active ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
        boxShadow: expanded ? `0 0 24px ${catStyle.color}08` : 'none',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.35s ease ${index * 0.03}s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.03}s, border-color 0.2s ease, box-shadow 0.2s ease`,
      }}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: sport.active ? catStyle.bg : 'rgba(255,255,255,0.04)',
            color: sport.active ? catStyle.color : 'rgba(255,255,255,0.2)',
            boxShadow: expanded ? `0 0 14px ${catStyle.color}30` : 'none',
          }}>
          <Activity size={15} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{sport.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
              style={{
                background: sport.type === 'team' ? 'rgba(47,128,237,0.12)' : 'rgba(31,181,122,0.12)',
                color: sport.type === 'team' ? '#2F80ED' : '#1FB57A',
                border: `1px solid ${sport.type === 'team' ? 'rgba(47,128,237,0.25)' : 'rgba(31,181,122,0.25)'}`,
              }}>
              {sport.type === 'team' ? 'TEAM' : 'INDIV'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
              style={{ background: catStyle.bg, color: catStyle.color }}>
              {sport.category}
            </span>
            {!sport.active && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: 'rgba(239,83,80,0.10)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.20)' }}>
                INACTIVE
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: '#9DB0C6' }}>
            {sport.stat_schema.length} stat field{sport.stat_schema.length !== 1 ? 's' : ''}
            {sport.stat_schema.length > 0 && (
              <span> · {sport.stat_schema.slice(0, 3).map(f => f.label).join(', ')}{sport.stat_schema.length > 3 ? `…` : ''}</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onToggleActive}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.04] active:scale-[0.96]"
            style={{
              background: sport.active ? 'rgba(239,83,80,0.10)' : 'rgba(31,181,122,0.10)',
              border: `1px solid ${sport.active ? 'rgba(239,83,80,0.28)' : 'rgba(31,181,122,0.28)'}`,
              color: sport.active ? '#EF5350' : '#1FB57A',
            }}>
            {saving ? <Loader2 size={10} className="animate-spin" /> : sport.active ? 'Disable' : 'Enable'}
          </button>
          <button onClick={onToggleExpand}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.07]"
            style={{ color: expanded ? catStyle.color : 'rgba(255,255,255,0.3)' }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded schema */}
      {expanded && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: `1px solid ${catStyle.color}18`, background: `${catStyle.color}04` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: catStyle.color }}>
            Stat Schema · {sport.stat_schema.length} fields
          </p>
          {sport.stat_schema.length === 0 ? (
            <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.25)' }}>No stat fields defined yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sport.stat_schema.map((f, i) => (
                <span key={i}
                  className="text-[10px] px-2.5 py-1 rounded-lg"
                  style={{
                    background: `${catStyle.color}12`,
                    border: `1px solid ${catStyle.color}22`,
                    color: 'rgba(255,255,255,0.7)',
                    animation: `fadeIn 0.2s ease ${i * 0.04}s both`,
                  }}>
                  {f.label}
                  <span className="ml-1" style={{ color: catStyle.color, opacity: 0.7 }}>({f.type})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Community competitions ────────────────────────────────────────────────────

function CommunityCompetitionsPanel() {
  const [items, setItems] = useState<Array<{
    id: string; name: string; sport: string; tier: string;
    country?: string; verification_status: string; created_at: string;
  }>>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    supabase.from('competitions').select('id, name, sport, tier, country, verification_status, created_at')
      .eq('verification_status', 'pending').order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => { setItems(data ?? []); setTimeout(() => setMounted(true), 50); });
  }, []);

  async function approve(id: string) {
    setSaving(id);
    await supabase.from('competitions').update({ verification_status: 'approved' }).eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setSaving(null);
  }
  async function reject(id: string) {
    setSaving(id);
    await supabase.from('competitions').update({ verification_status: 'rejected' }).eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setSaving(null);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A' }}>
          <Check size={24} />
        </div>
        <p className="text-sm font-semibold text-white mb-1">All clear</p>
        <p className="text-xs" style={{ color: '#9DB0C6' }}>No pending community competitions</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((comp, i) => {
        const tierColor = TIER_COLORS[comp.tier] ?? '#7C8DA6';
        return (
          <div key={comp.id}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
            style={{
              background: 'rgba(47,128,237,0.04)',
              border: '1px solid rgba(47,128,237,0.14)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
              transition: `opacity 0.35s ease ${i * 0.04}s, transform 0.4s cubic-bezier(0.19,1,0.22,1) ${i * 0.04}s`,
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(47,128,237,0.12)', color: '#2F80ED' }}>
              <Globe size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white">{comp.name}</span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${tierColor}18`, color: tierColor }}>
                  {comp.tier}
                </span>
                <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{comp.sport}</span>
                {comp.country && <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{comp.country}</span>}
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => approve(comp.id)} disabled={saving === comp.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.04] active:scale-[0.96]"
                style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.28)', color: '#1FB57A' }}>
                {saving === comp.id ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} /> Approve</>}
              </button>
              <button onClick={() => reject(comp.id)} disabled={saving === comp.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.04] active:scale-[0.96]"
                style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.22)', color: '#EF5350' }}>
                <X size={10} /> Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSportsPage() {
  const [tab, setTab] = useState<'sports' | 'suggestions' | 'competitions'>('sports');
  const [sports, setSports] = useState<Sport[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'team' | 'individual'>('all');
  const [showAddSport, setShowAddSport] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const loadSports = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('sports').select('*').order('display_order');
    setSports((data as Sport[]) ?? []);
    setLoading(false);
  }, []);

  const loadSuggestions = useCallback(async () => {
    const { data } = await supabase.from('entity_suggestions').select('*').order('created_at', { ascending: false }).limit(50);
    setSuggestions((data as Suggestion[]) ?? []);
  }, []);

  useEffect(() => { loadSports(); loadSuggestions(); }, [loadSports, loadSuggestions]);

  async function toggleActive(sport: Sport) {
    setSaving(sport.id);
    await supabase.from('sports').update({ active: !sport.active }).eq('id', sport.id);
    setSports(prev => prev.map(s => s.id === sport.id ? { ...s, active: !s.active } : s));
    setSaving(null);
  }

  async function reviewSuggestion(id: string, status: 'approved' | 'rejected') {
    setSaving(id);
    await supabase.from('entity_suggestions').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id);
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setSaving(null);
  }

  const filteredSports = sports.filter(s => {
    if (q && !s.name.toLowerCase().includes(q.toLowerCase()) && !s.category.toLowerCase().includes(q.toLowerCase())) return false;
    if (catFilter !== 'All' && s.category !== catFilter) return false;
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    return true;
  });

  const activeSports     = sports.filter(s => s.active);
  const teamSports       = sports.filter(s => s.type === 'team');
  const pendingSugg      = suggestions.filter(s => s.status === 'pending');
  const reviewedSugg     = suggestions.filter(s => s.status !== 'pending');

  // unique categories present in data
  const categories = ['All', ...Array.from(new Set(sports.map(s => s.category)))];

  const totalSports  = useCountUp(sports.length);
  const totalActive  = useCountUp(activeSports.length);
  const totalTeam    = useCountUp(teamSports.length);
  const totalPending = useCountUp(pendingSugg.length);

  const TAB_CONFIG = {
    sports:       { color: '#B8F135', label: 'Sports Catalog' },
    suggestions:  { color: '#F5A623', label: 'Suggestions' },
    competitions: { color: '#2F80ED', label: 'Competitions' },
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn  { from { opacity: 0; transform: scale(0.92) translateY(-10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes pulseDot { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>

      {showAddSport && <AddSportModal onClose={() => setShowAddSport(false)} onSaved={loadSports} />}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Sports Catalog</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Manage sports, stat schemas &amp; community suggestions · Live Supabase
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadSports(); loadSuggestions(); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/[0.07]"
              style={{ color: loading ? '#B8F135' : '#9DB0C6', border: '1px solid rgba(255,255,255,0.08)' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowAddSport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: '#B8F135', color: '#0C1A2B', boxShadow: '0 0 20px rgba(184,241,53,0.25)' }}>
              <Plus size={14} /> Add Sport
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Sports',  value: totalSports,  color: '#B8F135', icon: Activity   },
            { label: 'Active',        value: totalActive,  color: '#1FB57A', icon: Zap         },
            { label: 'Team Sports',   value: totalTeam,    color: '#2F80ED', icon: Users       },
            { label: 'Suggestions',   value: totalPending, color: '#F5A623', icon: AlertCircle, pulse: totalPending > 0 },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 relative overflow-hidden group cursor-default"
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
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.color, animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-bold relative" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category visual strip */}
        {sports.length > 0 && (
          <div className="rounded-2xl px-4 py-3"
            style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9DB0C6' }}>Sports by category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== 'All').map(cat => {
                const count = sports.filter(s => s.category === cat).length;
                if (count === 0) return null;
                const style = getCatStyle(cat);
                return (
                  <button key={cat}
                    onClick={() => { setCatFilter(cat === catFilter ? 'All' : cat); setTab('sports'); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:scale-[1.04]"
                    style={{
                      background: catFilter === cat ? style.bg : 'rgba(255,255,255,0.04)',
                      color: catFilter === cat ? style.color : '#9DB0C6',
                      border: catFilter === cat ? `1px solid ${style.color}35` : '1px solid rgba(255,255,255,0.07)',
                    }}>
                    {cat}
                    <span className="text-[10px] font-bold px-1 py-0.5 rounded" style={{ background: `${style.color}20`, color: style.color }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['sports', 'suggestions', 'competitions'] as const).map(t => {
            const cfg = TAB_CONFIG[t];
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)}
                className="relative px-5 py-3 text-sm font-semibold transition-all"
                style={{ color: active ? cfg.color : 'rgba(255,255,255,0.35)' }}>
                <span className="flex items-center gap-1.5">
                  {t === 'sports' ? 'Sports Catalog' : t === 'suggestions' ? 'Suggestions' : 'Competitions'}
                  {t === 'suggestions' && pendingSugg.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,166,35,0.18)', color: '#F5A623', animation: 'pulseDot 2s ease-in-out infinite' }}>
                      {pendingSugg.length}
                    </span>
                  )}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Sports tab ── */}
        {tab === 'sports' && (
          <div className="space-y-4">
            {/* Search + type filter */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9DB0C6' }} />
                <input
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                  placeholder="Search sports or categories…" value={q} onChange={e => setQ(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'rgba(184,241,53,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
              </div>
              <div className="flex gap-1">
                {(['all', 'team', 'individual'] as const).map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                    style={{
                      background: typeFilter === t
                        ? t === 'team' ? 'rgba(47,128,237,0.15)' : t === 'individual' ? 'rgba(31,181,122,0.15)' : 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.04)',
                      color: typeFilter === t
                        ? t === 'team' ? '#2F80ED' : t === 'individual' ? '#1FB57A' : 'white'
                        : '#9DB0C6',
                      border: typeFilter === t
                        ? t === 'team' ? '1px solid rgba(47,128,237,0.35)' : t === 'individual' ? '1px solid rgba(31,181,122,0.35)' : '1px solid rgba(255,255,255,0.2)'
                        : '1px solid rgba(255,255,255,0.06)',
                      transform: typeFilter === t ? 'scale(1.04)' : 'scale(1)',
                    }}>
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px]" style={{ color: '#9DB0C6' }}>
              Showing <strong className="text-white">{filteredSports.length}</strong> sports
              {catFilter !== 'All' && <> in <span style={{ color: getCatStyle(catFilter).color }}>{catFilter}</span></>}
            </p>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-14 rounded-2xl overflow-hidden" style={{ background: '#0F1E32' }}>
                    <div className="h-full rounded-2xl"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }} />
                  </div>
                ))}
              </div>
            ) : filteredSports.length === 0 ? (
              <div className="rounded-2xl py-14 text-center"
                style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Activity size={28} className="mx-auto mb-3 opacity-20 text-white" />
                <p className="text-sm" style={{ color: '#9DB0C6' }}>No sports match your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSports.map((sport, i) => (
                  <SportCard
                    key={sport.id}
                    sport={sport}
                    index={i}
                    expanded={expanded === sport.id}
                    onToggleExpand={() => setExpanded(expanded === sport.id ? null : sport.id)}
                    onToggleActive={() => toggleActive(sport)}
                    saving={saving === sport.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Suggestions tab ── */}
        {tab === 'suggestions' && (
          <div className="space-y-5">
            {pendingSugg.length === 0 && reviewedSugg.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
                style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A' }}>
                  <ShieldCheck size={24} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">No community suggestions yet</p>
                <p className="text-xs" style={{ color: '#9DB0C6' }}>They'll appear here when users submit new sport or competition requests</p>
              </div>
            ) : (
              <>
                {pendingSugg.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#F5A623' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623', animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                      Pending Review ({pendingSugg.length})
                    </p>
                    {pendingSugg.map((sug, i) => (
                      <div key={sug.id}
                        className="flex items-start gap-3 px-4 py-3.5 rounded-2xl transition-all"
                        style={{
                          background: 'rgba(245,166,35,0.05)',
                          border: '1px solid rgba(245,166,35,0.18)',
                          opacity: 1,
                          animation: `fadeIn 0.3s ease ${i * 0.06}s both`,
                        }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                          <AlertCircle size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{sug.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold capitalize"
                              style={{ background: 'rgba(255,255,255,0.07)', color: '#9DB0C6' }}>
                              {sug.entity_type}
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: '#9DB0C6' }}>
                            {[sug.sport, sug.country].filter(Boolean).join(' · ')} · {new Date(sug.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => reviewSuggestion(sug.id, 'approved')} disabled={saving === sug.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.04]"
                            style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.28)', color: '#1FB57A' }}>
                            {saving === sug.id ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} /> Approve</>}
                          </button>
                          <button onClick={() => reviewSuggestion(sug.id, 'rejected')} disabled={saving === sug.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.04]"
                            style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.22)', color: '#EF5350' }}>
                            <X size={10} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {reviewedSugg.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9DB0C6' }}>
                      Recently Reviewed ({reviewedSugg.length})
                    </p>
                    {reviewedSugg.slice(0, 10).map(sug => (
                      <div key={sug.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: sug.status === 'approved' ? 'rgba(31,181,122,0.15)' : 'rgba(239,83,80,0.12)' }}>
                          {sug.status === 'approved'
                            ? <Check size={9} style={{ color: '#1FB57A' }} />
                            : <X size={9} style={{ color: '#EF5350' }} />}
                        </div>
                        <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{sug.name}</span>
                        <span className="text-[10px] capitalize" style={{ color: '#9DB0C6' }}>{sug.entity_type}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={sug.status === 'approved'
                            ? { background: 'rgba(31,181,122,0.10)', color: '#1FB57A' }
                            : { background: 'rgba(239,83,80,0.10)', color: '#EF5350' }}>
                          {sug.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Competitions tab ── */}
        {tab === 'competitions' && <CommunityCompetitionsPanel />}

      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </>
  );
}
