import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronRight, ChevronLeft, Search, Check, Loader2,
  Swords, Trophy, MapPin, User, Clock, ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────
interface Competition {
  id: string;
  name: string;
  sport: string;
  tier: string;
  region: string;
}

interface Fixture {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string | null;
  competition_id: string;
}

interface FormState {
  sport: string;
  competitionId: string;
  competitionName: string;
  fixtureId: string | null;
  opponentName: string;
  matchDate: string;
  venue: string;
  position: string;
  minutesPlayed: number;
  isStarter: boolean;
  jerseyNumber: string;
}

// ── Constants ─────────────────────────────────────────────────
const SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Athletics', 'Swimming',
  'Cricket', 'Rugby', 'Volleyball', 'Boxing', 'Cycling',
  'Golf', 'Polo', 'Chess', 'Wrestling', 'Martial Arts',
  'Handball', 'Baseball', 'American Football', 'Ice Hockey',
  'Field Hockey', 'Badminton', 'Table Tennis', 'Rowing', 'Sailing',
];

const POSITIONS: Record<string, string[]> = {
  Football: ['Goalkeeper', 'Right Back', 'Left Back', 'Centre Back', 'Sweeper',
    'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
    'Right Winger', 'Left Winger', 'Centre Forward', 'Second Striker'],
  Basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  Rugby: ['Prop', 'Hooker', 'Lock', 'Flanker', 'No. 8', 'Scrum Half', 'Fly Half',
    'Centre', 'Wing', 'Full Back'],
  Volleyball: ['Setter', 'Outside Hitter', 'Opposite Hitter', 'Middle Blocker', 'Libero'],
  Handball: ['Goalkeeper', 'Left Back', 'Right Back', 'Centre Back', 'Left Wing', 'Right Wing', 'Pivot'],
};

const MINUTE_PRESETS = [45, 60, 75, 90];

// ── Sub-components ────────────────────────────────────────────
function StepDot({ n, current, done }: { n: number; current: number; done: boolean }) {
  const active = n === current;
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
      style={{
        background: done ? '#1FB57A' : active ? '#B8F135' : 'rgba(255,255,255,0.08)',
        color: done || active ? '#0C1A2B' : 'rgba(255,255,255,0.30)',
        boxShadow: active ? '0 0 16px rgba(184,241,53,0.45)' : done ? '0 0 12px rgba(31,181,122,0.35)' : 'none',
        transform: active ? 'scale(1.12)' : 'scale(1)',
      }}
    >
      {done ? <Check size={12} /> : n}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
      {children}
    </label>
  );
}

function inputStyle(extra = '') {
  return `w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all ${extra}`;
}

// ── Step 1: Sport ─────────────────────────────────────────────
function Step1Sport({ form, onChange }: { form: FormState; onChange: (sport: string) => void }) {
  const [q, setQ] = useState('');
  const filtered = SPORTS.filter(s => s.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          className={inputStyle('pl-8')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          placeholder="Search sport…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
        {filtered.map(sport => {
          const active = form.sport === sport;
          return (
            <button
              key={sport}
              onClick={() => onChange(sport)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
              style={{
                background: active ? 'rgba(184,241,53,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(184,241,53,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? '#B8F135' : 'rgba(255,255,255,0.60)',
                boxShadow: active ? '0 0 12px rgba(184,241,53,0.15)' : 'none',
              }}
            >
              {sport}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Competition ───────────────────────────────────────
function Step2Competition({
  form,
  onSelect,
}: {
  form: FormState;
  onSelect: (id: string, name: string) => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('competitions')
      .select('id, name, sport, tier, region')
      .ilike('name', `%${query}%`)
      .eq('sport', form.sport)
      .limit(12);
    setResults(data ?? []);
    setLoading(false);
  }, [form.sport]);

  useEffect(() => {
    const t = setTimeout(() => search(q), 300);
    return () => clearTimeout(t);
  }, [q, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          className={inputStyle('pl-8')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          placeholder={`Search ${form.sport} competitions…`}
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin text-white/30" />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1.5 max-h-52 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
          {results.map(comp => {
            const active = form.competitionId === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => onSelect(comp.id, comp.name)}
                className="w-full text-left px-3.5 py-3 rounded-xl transition-all"
                style={{
                  background: active ? 'rgba(47,128,237,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'rgba(47,128,237,0.35)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{comp.name}</span>
                  {active && <Check size={13} style={{ color: '#2F80ED' }} />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-white/30">{comp.tier}</span>
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-white/30">{comp.region}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Not in list fallback */}
      <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[11px] text-white/30 mb-2">Competition not listed?</p>
        <div className="flex gap-2">
          <input
            className={inputStyle('flex-1')}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="Enter competition name"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />
          <button
            disabled={!customName.trim()}
            onClick={() => { onSelect('', customName.trim()); setCustomName(''); }}
            className="px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
            style={{ background: 'rgba(184,241,53,0.12)', border: '1px solid rgba(184,241,53,0.30)', color: '#B8F135' }}
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Match / Fixture ───────────────────────────────────
function Step3Match({
  form,
  onSelectFixture,
  onManual,
}: {
  form: FormState;
  onSelectFixture: (fixture: Fixture) => void;
  onManual: (opponent: string, date: string, venue: string) => void;
}) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(!form.competitionId);
  const [opponent, setOpponent] = useState(form.opponentName);
  const [matchDate, setMatchDate] = useState(form.matchDate || new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState(form.venue);

  useEffect(() => {
    if (!form.competitionId) return;
    setLoading(true);
    supabase
      .from('fixtures')
      .select('id, home_team, away_team, match_date, venue, competition_id')
      .eq('competition_id', form.competitionId)
      .order('match_date', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setFixtures(data ?? []);
        setLoading(false);
      });
  }, [form.competitionId]);

  const handleManualSave = () => {
    if (!opponent.trim() || !matchDate) return;
    onManual(opponent.trim(), matchDate, venue.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!manual && fixtures.length > 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5 max-h-60 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
          {fixtures.map(fix => {
            const active = form.fixtureId === fix.id;
            const date = new Date(fix.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <button
                key={fix.id}
                onClick={() => onSelectFixture(fix)}
                className="w-full text-left px-3.5 py-3 rounded-xl transition-all"
                style={{
                  background: active ? 'rgba(31,181,122,0.10)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'rgba(31,181,122,0.30)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {fix.home_team} vs {fix.away_team}
                  </span>
                  {active && <Check size={13} style={{ color: '#1FB57A' }} />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-white/35 flex items-center gap-1">
                    <Clock size={9} /> {date}
                  </span>
                  {fix.venue && (
                    <span className="text-[10px] text-white/35 flex items-center gap-1">
                      <MapPin size={9} /> {fix.venue}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setManual(true)}
          className="text-[11px] text-white/30 hover:text-white/50 transition-colors"
        >
          Match not listed? Enter manually
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fixtures.length === 0 && form.competitionId && (
        <p className="text-[11px] text-white/30 py-2">
          No fixtures found in database. Enter match details manually.
        </p>
      )}
      <div>
        <FieldLabel>Opponent</FieldLabel>
        <input
          className={inputStyle()}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          placeholder="e.g. Al Hilal FC"
          value={opponent}
          onChange={e => setOpponent(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Match Date</FieldLabel>
          <input
            type="date"
            className={inputStyle()}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', colorScheme: 'dark' }}
            value={matchDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setMatchDate(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Venue (optional)</FieldLabel>
          <input
            className={inputStyle()}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="Stadium name"
            value={venue}
            onChange={e => setVenue(e.target.value)}
          />
        </div>
      </div>
      <button
        disabled={!opponent.trim() || !matchDate}
        onClick={handleManualSave}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
        style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.30)', color: '#1FB57A' }}
      >
        {form.opponentName ? 'Match confirmed' : 'Confirm Match'}
      </button>
    </div>
  );
}

// ── Step 4: Participation ─────────────────────────────────────
function Step4Participation({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (key: keyof FormState, val: string | number | boolean) => void;
}) {
  const positions = POSITIONS[form.sport] ?? [];

  return (
    <div className="space-y-4">
      {/* integrity notice */}
      <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
        style={{ background: 'rgba(239,83,80,0.07)', border: '1px solid rgba(239,83,80,0.18)' }}>
        <ShieldAlert size={14} style={{ color: '#EF5350', flexShrink: 0, marginTop: 1 }} />
        <p className="text-[11px]" style={{ color: 'rgba(239,83,80,0.85)', lineHeight: 1.5 }}>
          Stats (goals, assists, ratings) are retrieved from official sources only. You declare participation — not results.
        </p>
      </div>

      {/* starter / sub toggle */}
      <div>
        <FieldLabel>Role</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Starter', val: true,  color: '#1FB57A' },
            { label: 'Substitute', val: false, color: '#F5A623' },
          ].map(opt => {
            const active = form.isStarter === opt.val;
            return (
              <button
                key={String(opt.val)}
                onClick={() => onChange('isStarter', opt.val)}
                className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active ? `${opt.color}14` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? `${opt.color}38` : 'rgba(255,255,255,0.08)'}`,
                  color: active ? opt.color : 'rgba(255,255,255,0.40)',
                  boxShadow: active ? `0 0 12px ${opt.color}20` : 'none',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* position */}
      <div>
        <FieldLabel>Position</FieldLabel>
        {positions.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
            {positions.map(pos => {
              const active = form.position === pos;
              return (
                <button
                  key={pos}
                  onClick={() => onChange('position', pos)}
                  className="px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all"
                  style={{
                    background: active ? 'rgba(47,128,237,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(47,128,237,0.32)' : 'rgba(255,255,255,0.07)'}`,
                    color: active ? '#2F80ED' : 'rgba(255,255,255,0.50)',
                  }}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            className={inputStyle()}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
            placeholder="e.g. Striker"
            value={form.position}
            onChange={e => onChange('position', e.target.value)}
          />
        )}
      </div>

      {/* minutes */}
      <div>
        <FieldLabel>Minutes Played</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={120}
            className={inputStyle('w-20 text-center')}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
            value={form.minutesPlayed}
            onChange={e => onChange('minutesPlayed', Math.min(120, Math.max(1, Number(e.target.value))))}
          />
          <div className="flex gap-1.5">
            {MINUTE_PRESETS.map(m => (
              <button
                key={m}
                onClick={() => onChange('minutesPlayed', m)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: form.minutesPlayed === m ? 'rgba(184,241,53,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.minutesPlayed === m ? 'rgba(184,241,53,0.30)' : 'rgba(255,255,255,0.08)'}`,
                  color: form.minutesPlayed === m ? '#B8F135' : 'rgba(255,255,255,0.35)',
                }}
              >
                {m}'
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* jersey number */}
      <div>
        <FieldLabel>Jersey Number (optional)</FieldLabel>
        <input
          type="number"
          min={1}
          max={99}
          className={inputStyle('w-24 text-center')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          placeholder="—"
          value={form.jerseyNumber}
          onChange={e => onChange('jerseyNumber', e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────
interface AddMatchFlowProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMatchFlow({ onClose, onSuccess }: AddMatchFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'verified' | 'pending' | null>(null);

  const [form, setForm] = useState<FormState>({
    sport: '',
    competitionId: '',
    competitionName: '',
    fixtureId: null,
    opponentName: '',
    matchDate: '',
    venue: '',
    position: '',
    minutesPlayed: 90,
    isStarter: true,
    jerseyNumber: '',
  });

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  const canAdvance = [
    form.sport !== '',
    form.competitionName !== '',
    form.opponentName !== '' && form.matchDate !== '',
    form.position !== '' && form.minutesPlayed > 0,
  ][step - 1];

  async function handleSubmit() {
    if (!user) return;
    setSaving(true);
    try {
      // Insert participation record
      const { data: part, error } = await supabase
        .from('participations')
        .insert({
          athlete_id: user.id,
          fixture_id: form.fixtureId || null,
          sport: form.sport,
          competition_name: form.competitionName,
          match_date: form.matchDate,
          opponent_name: form.opponentName,
          venue: form.venue || null,
          position: form.position,
          minutes_played: form.minutesPlayed,
          is_starter: form.isStarter,
          jersey_number: form.jerseyNumber ? parseInt(form.jerseyNumber, 10) : null,
          status: 'pending_verification',
        })
        .select('id')
        .single();

      if (error || !part) throw new Error(error?.message ?? 'Insert failed');

      // Trigger edge function for automated stats ingestion
      const { data: edgeResult } = await supabase.functions.invoke('match-performance', {
        body: { participationId: part.id },
      });

      setSaving(false);
      setSavedStatus(edgeResult?.status === 'verified' ? 'verified' : 'pending');
      setTimeout(() => { onSuccess(); }, 2000);
    } catch (err) {
      console.error('AddMatchFlow error:', err);
      setSaving(false);
    }
  }

  const STEP_LABELS = ['Sport', 'Competition', 'Match', 'Participation'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(12,26,43,0.88)', backdropFilter: 'blur(10px)', animation: 'fadeIn 0.2s ease both' }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: '#16273B',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.22)' }}>
              <Swords size={14} style={{ color: '#1FB57A' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add Match</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Step {step} of 4 — {STEP_LABELS[step - 1]}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/08 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 px-6 py-3" style={{ flexShrink: 0 }}>
          {[1, 2, 3, 4].map(n => (
            <React.Fragment key={n}>
              <StepDot n={n} current={step} done={n < step} />
              {n < 4 && (
                <div className="flex-1 h-px max-w-8 transition-all duration-500"
                  style={{ background: n < step ? '#1FB57A' : 'rgba(255,255,255,0.10)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
          {step === 1 && (
            <Step1Sport form={form} onChange={sport => setField('sport', sport)} />
          )}
          {step === 2 && (
            <Step2Competition
              form={form}
              onSelect={(id, name) => { setField('competitionId', id); setField('competitionName', name); }}
            />
          )}
          {step === 3 && (
            <Step3Match
              form={form}
              onSelectFixture={fix => {
                setField('fixtureId', fix.id);
                setField('opponentName', fix.away_team);
                setField('matchDate', fix.match_date.slice(0, 10));
                setField('venue', fix.venue ?? '');
              }}
              onManual={(opp, date, ven) => {
                setField('fixtureId', null);
                setField('opponentName', opp);
                setField('matchDate', date);
                setField('venue', ven);
              }}
            />
          )}
          {step === 4 && (
            <Step4Participation
              form={form}
              onChange={(key, val) => setField(key, val as FormState[typeof key])}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}

          {step < 4 ? (
            <button
              disabled={!canAdvance}
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: canAdvance ? '#2F80ED' : 'rgba(47,128,237,0.30)',
                color: '#fff',
                boxShadow: canAdvance ? '0 4px 18px rgba(47,128,237,0.35)' : 'none',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              disabled={!canAdvance || saving || !!savedStatus}
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
              style={{
                background: savedStatus === 'verified' ? '#1FB57A' : savedStatus === 'pending' ? '#F5A623' : '#B8F135',
                color: '#0C1A2B',
                opacity: !canAdvance && !saving && !savedStatus ? 0.35 : 1,
                boxShadow: savedStatus
                  ? `0 4px 18px ${savedStatus === 'verified' ? 'rgba(31,181,122,0.40)' : 'rgba(245,166,35,0.35)'}`
                  : '0 4px 18px rgba(184,241,53,0.35)',
              }}
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              ) : savedStatus === 'verified' ? (
                <><Check size={14} /> Verified automatically!</>
              ) : savedStatus === 'pending' ? (
                <><Check size={14} /> Sent for verification</>
              ) : (
                <>Declare Participation</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
