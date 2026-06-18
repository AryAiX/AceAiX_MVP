import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Check, X, Loader2, Edit3,
  Globe, ShieldCheck, AlertCircle, RefreshCw,
  Activity, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TIER_COLORS } from '../../context/LocaleContext';

// ── Types ─────────────────────────────────────────────────────
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

const TAB_COLORS: Record<string, string> = {
  sports: '#B8F135',
  suggestions: '#F5A623',
  competitions: '#2F80ED',
};

// ── Schema field editor ───────────────────────────────────────
function SchemaEditor({ schema, onChange }: { schema: Array<{ key: string; label: string; type: string }>; onChange: (s: typeof schema) => void }) {
  function addField() {
    onChange([...schema, { key: '', label: '', type: 'int' }]);
  }
  function removeField(i: number) {
    onChange(schema.filter((_, idx) => idx !== i));
  }
  function updateField(i: number, field: Partial<{ key: string; label: string; type: string }>) {
    onChange(schema.map((f, idx) => idx === i ? { ...f, ...field } : f));
  }

  return (
    <div className="space-y-2">
      {schema.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2">
          <input className="px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="key" value={f.key} onChange={e => updateField(i, { key: e.target.value })} />
          <input className="px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="Label" value={f.label} onChange={e => updateField(i, { label: e.target.value })} />
          <select className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
            value={f.type} onChange={e => updateField(i, { type: e.target.value })}>
            <option value="int">Int</option>
            <option value="dec">Dec</option>
            <option value="pct">Pct</option>
            <option value="str">Str</option>
          </select>
          <button onClick={() => removeField(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-coral transition-colors">
            <X size={12} />
          </button>
        </div>
      ))}
      <button onClick={addField}
        className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-azure transition-colors">
        <Plus size={11} /> Add stat field
      </button>
    </div>
  );
}

// ── New sport modal ───────────────────────────────────────────
function AddSportModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'team' | 'individual'>('team');
  const [category, setCategory] = useState('Team Sports');
  const [schema, setSchema] = useState<Array<{ key: string; label: string; type: string }>>([]);
  const [saving, setSaving] = useState(false);

  const CATEGORIES = ['Team Sports', 'Individual', 'Racket Sports', 'Combat Sports', 'Water Sports', 'Winter Sports', 'Action Sports', 'Mind Sports', 'Strength', 'Para Sports', 'Equestrian & Country', 'Other'];

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from('sports').insert({
      name: name.trim(), type, category, stat_schema: schema,
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(12,26,43,0.88)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 32px 80px rgba(0,0,0,0.70)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white">Add New Sport</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Name</label>
            <input className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              placeholder="Sport name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Type</label>
              <div className="flex gap-2">
                {(['team', 'individual'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                    style={{
                      background: type === t ? 'rgba(47,128,237,0.14)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${type === t ? 'rgba(47,128,237,0.38)' : 'rgba(255,255,255,0.09)'}`,
                      color: type === t ? '#2F80ED' : 'rgba(255,255,255,0.45)',
                    }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Category</label>
              <select className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
                value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Stat Schema</label>
            <SchemaEditor schema={schema} onChange={setSchema} />
          </div>
        </div>
        <div className="px-6 pb-6">
          <button disabled={!name.trim() || saving} onClick={handleSave}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30"
            style={{ background: '#B8F135', color: '#0C1A2B' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Add Sport
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminSportsPage() {
  const [tab, setTab] = useState<'sports' | 'suggestions' | 'competitions'>('sports');
  const [sports, setSports] = useState<Sport[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
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

  const filteredSports = sports.filter(s =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())
  );

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const reviewedSuggestions = suggestions.filter(s => s.status !== 'pending');

  return (
    <div className="max-w-5xl space-y-5 pb-10">
      {showAddSport && <AddSportModal onClose={() => setShowAddSport(false)} onSaved={loadSports} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Sports Catalog</h1>
          <p className="text-white/35 text-sm mt-0.5">Manage sports, stat schemas, and community suggestions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadSports(); loadSuggestions(); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/08 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowAddSport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#B8F135', color: '#0C1A2B', boxShadow: '0 4px 16px rgba(184,241,53,0.30)' }}>
            <Plus size={14} /> Add Sport
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
        {(['sports', 'suggestions', 'competitions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-semibold capitalize transition-all relative"
            style={{ color: tab === t ? TAB_COLORS[t] : 'rgba(255,255,255,0.35)' }}>
            {t}
            {t === 'suggestions' && pendingSuggestions.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(245,166,35,0.18)', color: '#F5A623' }}>
                {pendingSuggestions.length}
              </span>
            )}
            {tab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: TAB_COLORS[t] }} />
            )}
          </button>
        ))}
      </div>

      {/* Sports tab */}
      {tab === 'sports' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              placeholder="Search sports…" value={q} onChange={e => setQ(e.target.value)} />
          </div>

          <div className="flex items-center gap-3 text-[11px] text-white/25">
            <span>{filteredSports.length} sports</span>
            <span>·</span>
            <span>{filteredSports.filter(s => s.type === 'team').length} team</span>
            <span>·</span>
            <span>{filteredSports.filter(s => s.type === 'individual').length} individual</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredSports.map(sport => {
                const isExpanded = expanded === sport.id;
                return (
                  <div key={sport.id} className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: sport.active ? 'rgba(31,181,122,0.10)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sport.active ? 'rgba(31,181,122,0.22)' : 'rgba(255,255,255,0.08)'}` }}>
                        <Activity size={13} style={{ color: sport.active ? '#1FB57A' : 'rgba(255,255,255,0.25)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{sport.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: sport.type === 'team' ? 'rgba(47,128,237,0.12)' : 'rgba(31,181,122,0.12)', color: sport.type === 'team' ? '#2F80ED' : '#1FB57A', border: `1px solid ${sport.type === 'team' ? 'rgba(47,128,237,0.22)' : 'rgba(31,181,122,0.22)'}` }}>
                            {sport.type.toUpperCase()}
                          </span>
                          {!sport.active && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                              style={{ background: 'rgba(239,83,80,0.10)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.20)' }}>
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/30 mt-0.5">{sport.category} · {sport.stat_schema.length} stat fields</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleActive(sport)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                          style={{
                            background: sport.active ? 'rgba(239,83,80,0.10)' : 'rgba(31,181,122,0.10)',
                            border: `1px solid ${sport.active ? 'rgba(239,83,80,0.25)' : 'rgba(31,181,122,0.25)'}`,
                            color: sport.active ? '#EF5350' : '#1FB57A',
                          }}>
                          {saving === sport.id ? <Loader2 size={10} className="animate-spin" /> : sport.active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => setExpanded(isExpanded ? null : sport.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 transition-colors">
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Stat Schema</p>
                        {sport.stat_schema.length === 0 ? (
                          <p className="text-[11px] text-white/30 italic">No stat fields defined</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {sport.stat_schema.map((f, i) => (
                              <span key={i} className="text-[10px] px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}>
                                {f.label} <span className="text-white/25">({f.type})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Suggestions tab */}
      {tab === 'suggestions' && (
        <div className="space-y-4">
          {pendingSuggestions.length === 0 && reviewedSuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <ShieldCheck size={28} className="text-white/15 mb-3" />
              <p className="text-white/35 text-sm">No community suggestions yet</p>
            </div>
          ) : (
            <>
              {pendingSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/70">Pending Review ({pendingSuggestions.length})</p>
                  {pendingSuggestions.map(sug => (
                    <div key={sug.id} className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
                      style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.15)' }}>
                      <AlertCircle size={14} style={{ color: '#F5A623', flexShrink: 0, marginTop: 2 }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{sug.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold capitalize"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                            {sug.entity_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/35 mt-0.5">
                          {[sug.sport, sug.country].filter(Boolean).join(' · ')} · {new Date(sug.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => reviewSuggestion(sug.id, 'approved')}
                          disabled={saving === sug.id}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                          style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.28)', color: '#1FB57A' }}>
                          {saving === sug.id ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        </button>
                        <button onClick={() => reviewSuggestion(sug.id, 'rejected')}
                          disabled={saving === sug.id}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                          style={{ background: 'rgba(239,83,80,0.10)', border: '1px solid rgba(239,83,80,0.25)', color: '#EF5350' }}>
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reviewedSuggestions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/25">Recently Reviewed</p>
                  {reviewedSuggestions.slice(0, 10).map(sug => (
                    <div key={sug.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: sug.status === 'approved' ? 'rgba(31,181,122,0.15)' : 'rgba(239,83,80,0.12)' }}>
                        {sug.status === 'approved' ? <Check size={9} style={{ color: '#1FB57A' }} /> : <X size={9} style={{ color: '#EF5350' }} />}
                      </div>
                      <span className="text-sm text-white/60 flex-1">{sug.name}</span>
                      <span className="text-[10px] text-white/25 capitalize">{sug.entity_type}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Competitions tab — pending verifications */}
      {tab === 'competitions' && (
        <CommunityCompetitionsPanel />
      )}
    </div>
  );
}

// ── Community competitions pending approval ───────────────────
function CommunityCompetitionsPanel() {
  const [items, setItems] = useState<Array<{ id: string; name: string; sport: string; tier: string; country?: string; verification_status: string; created_at: string }>>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('competitions').select('id, name, sport, tier, country, verification_status, created_at')
      .eq('verification_status', 'pending').order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => setItems(data ?? []));
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
      <div className="flex flex-col items-center justify-center py-14">
        <Check size={28} className="text-white/15 mb-3" />
        <p className="text-white/35 text-sm">No pending competitions</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map(comp => (
        <div key={comp.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(47,128,237,0.04)', border: '1px solid rgba(47,128,237,0.14)' }}>
          <Globe size={14} style={{ color: '#2F80ED', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-white">{comp.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${TIER_COLORS[comp.tier] ?? '#7C8DA6'}18`, color: TIER_COLORS[comp.tier] ?? '#7C8DA6' }}>
                {comp.tier}
              </span>
              <span className="text-[10px] text-white/30">{comp.sport}</span>
              {comp.country && <span className="text-[10px] text-white/25">{comp.country}</span>}
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => approve(comp.id)} disabled={saving === comp.id}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
              style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.28)', color: '#1FB57A' }}>
              {saving === comp.id ? <Loader2 size={10} className="animate-spin" /> : 'Approve'}
            </button>
            <button onClick={() => reject(comp.id)} disabled={saving === comp.id}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
              style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.22)', color: '#EF5350' }}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
