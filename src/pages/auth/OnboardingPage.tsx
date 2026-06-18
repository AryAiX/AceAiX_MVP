import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronLeft, Search, Loader2,
  Globe, Trophy, Users, MapPin, AlertCircle, Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useSports, useCountries } from '../../hooks/useGlobalData';
import { TIER_COLORS } from '../../context/LocaleContext';

// ── Positions per sport (extensible subset) ───────────────────
const POSITIONS: Record<string, string[]> = {
  Football:    ['Goalkeeper','Right Back','Left Back','Centre Back','Defensive Midfielder','Central Midfielder','Attacking Midfielder','Right Winger','Left Winger','Striker'],
  Basketball:  ['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'],
  Rugby: ['Prop','Hooker','Lock','Flanker','No. 8','Scrum Half','Fly Half','Centre','Wing','Full Back'],
  Volleyball:  ['Setter','Outside Hitter','Middle Blocker','Libero','Opposite Hitter'],
  Handball:    ['Goalkeeper','Left Back','Right Back','Centre Back','Left Wing','Right Wing','Pivot'],
  Cricket:     ['Batsman','Bowler','All-Rounder','Wicket-Keeper'],
  Baseball:    ['Pitcher','Catcher','First Base','Second Base','Shortstop','Third Base','Outfielder'],
  'Ice Hockey':['Goalie','Defenseman','Center','Left Wing','Right Wing'],
  'Field Hockey':['Goalkeeper','Defender','Midfielder','Forward'],
  Athletics:   ['Sprinter','Middle Distance','Long Distance','Hurdler','High Jumper','Long Jumper','Triple Jumper','Pole Vaulter','Shot Put','Discus','Javelin','Hammer','Decathlete/Heptathlete'],
  Swimming:    ['Freestyle','Backstroke','Breaststroke','Butterfly','Individual Medley','Open Water'],
  Tennis:      ['Singles','Doubles','Singles & Doubles'],
  Cycling:     ['Road','Time Trial','Track','MTB','BMX'],
  Rowing:      ['Single Scull','Double Scull','Quad','Coxed Four','Eight'],
  Boxing:      ['Flyweight','Bantamweight','Featherweight','Lightweight','Welterweight','Middleweight','Light Heavyweight','Heavyweight'],
  Wrestling:   ['Freestyle','Greco-Roman','Folkstyle'],
};

const TIER_LABELS: Record<string, string> = {
  professional: 'Professional', semi_pro: 'Semi-Pro', amateur: 'Amateur',
  college: 'College / University', youth_academy: 'Youth Academy', school: 'School',
  grassroots: 'Grassroots', recreational: 'Recreational',
  continental: 'Continental', international: 'International', friendly: 'Friendly',
};

// ── Components ────────────────────────────────────────────────
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{
            height: 3,
            width: i < step ? 28 : i === step ? 18 : 10,
            background: i < step ? '#1FB57A' : i === step ? '#2F80ED' : 'rgba(255,255,255,0.12)',
          }} />
      ))}
    </div>
  );
}

function SelectBtn({ label, active, onClick, color = '#2F80ED' }: {
  label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button onClick={onClick}
      className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
      style={{
        background: active ? `${color}15` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
        color: active ? color : 'rgba(255,255,255,0.55)',
        boxShadow: active ? `0 0 12px ${color}18` : 'none',
      }}>
      {label}
    </button>
  );
}

// ── Suggestion modal ──────────────────────────────────────────
function SuggestModal({ type, onClose }: { type: 'competition' | 'team'; onClose: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [country, setCountry] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [dupes, setDupes] = useState<string[]>([]);

  // Fuzzy duplicate check
  useEffect(() => {
    if (name.length < 4) { setDupes([]); return; }
    const table = type === 'competition' ? 'competitions' : 'teams';
    supabase.from(table).select('name').ilike('name', `%${name}%`).limit(3)
      .then(({ data }) => setDupes((data ?? []).map((r: Record<string, string>) => r.name)));
  }, [name, type]);

  async function handleSend() {
    if (!name.trim() || !user) return;
    setSending(true);
    await supabase.from('entity_suggestions').insert({
      entity_type: type,
      suggested_by: user.id,
      name: name.trim(),
      sport, country,
      details: {},
    });
    setSending(false);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(12,26,43,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 60px rgba(0,0,0,0.60)' }}>
        {sent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.25)' }}>
              <Check size={20} style={{ color: '#1FB57A' }} />
            </div>
            <p className="text-white font-bold">Suggestion submitted!</p>
            <p className="text-white/40 text-sm">Our admin team will review and add it soon.</p>
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white/90 transition-colors">Close</button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-bold text-white">Suggest a {type}</h3>
              <p className="text-[11px] text-white/35 mt-0.5">We'll review and add it within 24 hours.</p>
            </div>
            {dupes.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.20)' }}>
                <AlertCircle size={12} style={{ color: '#F5A623', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="text-[11px] text-amber-300/80">Did you mean: {dupes.join(', ')}?</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Check existing entries first.</p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Name</label>
                <input className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                  placeholder={`${type === 'competition' ? 'League or tournament name' : 'Club or team name'}`}
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Sport</label>
                  <input className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    placeholder="e.g. Football" value={sport} onChange={e => setSport(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Country</label>
                  <input className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    placeholder="e.g. Brazil" value={country} onChange={e => setCountry(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}>
                Cancel
              </button>
              <button disabled={!name.trim() || sending} onClick={handleSend}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-35"
                style={{ background: '#2F80ED', color: '#fff' }}>
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { profile, refreshProfile, user } = useAuth();
  const navigate = useNavigate();
  const { sports, byCategory } = useSports();
  const { countries, byRegion } = useCountries();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState<'competition' | 'team' | null>(null);

  // Form state
  const [sportId, setSportId] = useState('');
  const [sportName, setSportName] = useState('');
  const [sportType, setSportType] = useState<'team' | 'individual'>('team');
  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [tier, setTier] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [competitionName, setCompetitionName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [position, setPosition] = useState('');

  // Search state
  const [sportQ, setSportQ] = useState('');
  const [countryQ, setCountryQ] = useState('');
  const [compQ, setCompQ] = useState('');
  const [teamQ, setTeamQ] = useState('');
  const [compResults, setCompResults] = useState<Array<{ id: string; name: string; tier: string; country?: string }>>([]);
  const [teamResults, setTeamResults] = useState<Array<{ id: string; name: string; city?: string }>>([]);

  // Competition search
  useEffect(() => {
    if (!sportId) return;
    const t = setTimeout(async () => {
      const q = supabase.from('competitions').select('id, name, tier, country').eq('verification_status', 'approved');
      const filtered = compQ.trim()
        ? q.ilike('name', `%${compQ}%`)
        : q.eq('sport', sportName);
      if (tier) filtered.eq('tier', tier);
      const { data } = await filtered.limit(12);
      setCompResults(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [compQ, sportId, sportName, tier]);

  // Team search
  useEffect(() => {
    if (!sportId || sportType !== 'team') return;
    const t = setTimeout(async () => {
      if (!teamQ.trim()) { setTeamResults([]); return; }
      const { data } = await supabase
        .from('teams')
        .select('id, name, city')
        .eq('verification_status', 'approved')
        .eq('sport_id', sportId)
        .ilike('name', `%${teamQ}%`)
        .limit(10);
      setTeamResults(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [teamQ, sportId, sportType]);

  const TOTAL_STEPS = sportType === 'team' ? 5 : 4;

  const canAdvance = [
    sportId !== '',
    countryId !== '',
    competitionId !== '',
    sportType === 'team' ? (teamId !== '' || teamName !== '') : position !== '',
    true,
  ][step];

  async function handleComplete() {
    if (!user) return;
    setLoading(true);

    // Upsert athlete_profiles with new global data
    await supabase.from('athlete_profiles').upsert({
      user_id: user.id,
      sport: sportName,
      position_primary: position,
      level: tier || 'amateur',
      current_club: teamName || '',
      nationality: countryId,
    });

    // Update user_profiles with sport_id, country_id, locale preferences
    await supabase.from('user_profiles').update({
      sport_id: sportId || null,
      country_id: countryId || null,
    }).eq('id', user.id);

    // If club membership, create athlete_team_membership
    if (teamId) {
      await supabase.from('athlete_team_memberships').upsert({
        athlete_id: user.id,
        team_id: teamId,
        sport_id: sportId || null,
        position,
        is_current: true,
      });
    }

    await refreshProfile();
    setLoading(false);
    navigate('/athlete/dashboard');
  }

  function skipToRole() {
    if (!profile) return;
    if (profile.role === 'scout') navigate('/recruiter/dashboard');
    else if (profile.role === 'club') navigate('/club/dashboard');
    else if (profile.role === 'medical_partner') navigate('/partner/dashboard');
    else if (profile.role === 'admin') navigate('/admin/dashboard');
    else navigate('/athlete/dashboard');
  }

  // ── Filtered lists ─────────────────────────────────────────
  const filteredSports = sports.filter(s =>
    !sportQ || s.name.toLowerCase().includes(sportQ.toLowerCase())
  );
  const sportCategories = Object.keys(byCategory).filter(cat =>
    byCategory[cat].some(s => !sportQ || s.name.toLowerCase().includes(sportQ.toLowerCase()))
  );

  const filteredCountries = countries.filter(c =>
    !countryQ || c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.iso_code.toLowerCase().includes(countryQ.toLowerCase())
  ).slice(0, 60);

  const countryRegions = Object.keys(byRegion).filter(r =>
    byRegion[r].some(c => !countryQ || c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.iso_code.toLowerCase().includes(countryQ.toLowerCase()))
  );

  const positionList = POSITIONS[sportName] ?? [];

  const tierDisplay = [
    { key: 'professional', label: 'Professional', color: '#B8F135' },
    { key: 'semi_pro',     label: 'Semi-Pro',     color: '#2F80ED' },
    { key: 'amateur',      label: 'Amateur',       color: '#1FB57A' },
    { key: 'college',      label: 'College / Uni', color: '#F5A623' },
    { key: 'youth_academy',label: 'Youth Academy', color: '#EF5350' },
    { key: 'school',       label: 'School',        color: '#A78BFA' },
    { key: 'grassroots',   label: 'Grassroots',    color: '#64B5F6' },
    { key: 'recreational', label: 'Recreational',  color: '#7C8DA6' },
  ];

  const STEP_TITLES = ['Pick Your Sport', 'Your Country', 'Your League or Competition', sportType === 'team' ? 'Your Club or Team' : 'Your Discipline / Role', 'You\'re all set'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #0C1A2B 0%, #0A2040 60%, #0C1A2B 100%)' }}>
      {showSuggest && (
        <SuggestModal type={showSuggest} onClose={() => setShowSuggest(null)} />
      )}

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(47,128,237,0.08) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(31,181,122,0.06) 0%, transparent 70%)', transform: 'translate(-25%,25%)' }} />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/AceAiX_logo_transparent%20copy%20copy%20copy.png" alt="AceAiX" style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(47,128,237,0.5))' }} />
          <img src="/AceAiX_logo_transparent2%20copy.png" alt="AceAiX" style={{ height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(47,128,237,0.35))' }} />
        </div>

        <div className="rounded-3xl overflow-hidden"
          style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 32px 80px rgba(0,0,0,0.60)' }}>

          {profile?.role === 'athlete' ? (
            <>
              {/* Header */}
              <div className="px-7 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-3">
                  {step > 0 ? (
                    <button onClick={() => setStep(s => s - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/08 transition-colors">
                      <ChevronLeft size={14} />
                    </button>
                  ) : <div className="w-7" />}
                  <StepIndicator step={step} total={TOTAL_STEPS} />
                  <span className="text-[11px] text-white/25 tabular">{step + 1}/{TOTAL_STEPS}</span>
                </div>
                <h1 className="text-lg font-bold text-white mt-2">{STEP_TITLES[step]}</h1>
                <p className="text-[12px] text-white/35 mt-0.5">
                  {step === 0 && 'Choose from any sport — professional, amateur, school, grassroots, or individual.'}
                  {step === 1 && 'Any country or region in the world.'}
                  {step === 2 && 'Search any league, cup, or competition — at any level, anywhere.'}
                  {step === 3 && sportType === 'team' && 'Find your club or team. Not listed? Suggest it.'}
                  {step === 3 && sportType === 'individual' && 'Select your discipline or event.'}
                  {step === 4 && 'Your profile is ready. You can update any of this anytime.'}
                </p>
              </div>

              {/* Body */}
              <div className="px-7 py-5 min-h-72 max-h-[62vh] overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>

                {/* Step 0: Sport */}
                {step === 0 && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                        placeholder="Search sports…"
                        value={sportQ} onChange={e => setSportQ(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                      {sportCategories.map(cat => (
                        <div key={cat}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">{cat}</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {byCategory[cat].filter(s => !sportQ || s.name.toLowerCase().includes(sportQ.toLowerCase())).map(s => (
                              <button key={s.id} onClick={() => { setSportId(s.id); setSportName(s.name); setSportType(s.type as 'team' | 'individual'); }}
                                className="px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center gap-2 transition-all"
                                style={{
                                  background: sportId === s.id ? 'rgba(47,128,237,0.14)' : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${sportId === s.id ? 'rgba(47,128,237,0.38)' : 'rgba(255,255,255,0.07)'}`,
                                  color: sportId === s.id ? '#2F80ED' : 'rgba(255,255,255,0.55)',
                                }}>
                                <span className="text-[10px] px-1 py-0.5 rounded text-white/30"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontSize: 9 }}>
                                  {s.type === 'team' ? 'TEAM' : 'IND'}
                                </span>
                                {s.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Country */}
                {step === 1 && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                        placeholder="Search countries…"
                        value={countryQ} onChange={e => setCountryQ(e.target.value)} />
                    </div>
                    {countryRegions.map(region => (
                      <div key={region}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2 flex items-center gap-1.5">
                          <Globe size={9} /> {region}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {byRegion[region].filter(c =>
                            !countryQ || c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.iso_code.toLowerCase().includes(countryQ.toLowerCase())
                          ).map(c => (
                            <button key={c.iso_code} onClick={() => { setCountryId(c.iso_code); setCountryName(c.name); }}
                              className="px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center gap-2 transition-all"
                              style={{
                                background: countryId === c.iso_code ? 'rgba(31,181,122,0.12)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${countryId === c.iso_code ? 'rgba(31,181,122,0.35)' : 'rgba(255,255,255,0.07)'}`,
                                color: countryId === c.iso_code ? '#1FB57A' : 'rgba(255,255,255,0.55)',
                              }}>
                              <span className="text-sm">{c.flag}</span>
                              {c.name}
                              {countryId === c.iso_code && <Check size={10} className="ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Competition */}
                {step === 2 && (
                  <div className="space-y-3">
                    {/* Tier filter chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {tierDisplay.map(t => (
                        <button key={t.key} onClick={() => setTier(tier === t.key ? '' : t.key)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                          style={{
                            background: tier === t.key ? `${t.color}18` : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${tier === t.key ? `${t.color}40` : 'rgba(255,255,255,0.08)'}`,
                            color: tier === t.key ? t.color : 'rgba(255,255,255,0.35)',
                          }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                        placeholder={`Search ${sportName} competitions…`}
                        value={compQ} onChange={e => setCompQ(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      {compResults.map(comp => (
                        <button key={comp.id} onClick={() => { setCompetitionId(comp.id); setCompetitionName(comp.name); }}
                          className="w-full text-left px-3.5 py-3 rounded-xl transition-all"
                          style={{
                            background: competitionId === comp.id ? 'rgba(184,241,53,0.08)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${competitionId === comp.id ? 'rgba(184,241,53,0.30)' : 'rgba(255,255,255,0.07)'}`,
                          }}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{comp.name}</span>
                            {competitionId === comp.id && <Check size={12} style={{ color: '#B8F135' }} />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: `${TIER_COLORS[comp.tier] ?? '#7C8DA6'}18`, color: TIER_COLORS[comp.tier] ?? '#7C8DA6', border: `1px solid ${TIER_COLORS[comp.tier] ?? '#7C8DA6'}25` }}>
                              {TIER_LABELS[comp.tier] ?? comp.tier}
                            </span>
                            {comp.country && <span className="text-[10px] text-white/30">{comp.country}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowSuggest('competition')}
                      className="w-full text-[11px] text-white/30 hover:text-azure transition-colors flex items-center justify-center gap-1.5 py-2">
                      <Plus size={11} /> Can't find your competition? Suggest it
                    </button>
                  </div>
                )}

                {/* Step 3: Team (team sports) or Discipline (individual) */}
                {step === 3 && sportType === 'team' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                        placeholder={`Search ${sportName} teams…`}
                        value={teamQ} onChange={e => setTeamQ(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      {teamResults.map(team => (
                        <button key={team.id} onClick={() => { setTeamId(team.id); setTeamName(team.name); }}
                          className="w-full text-left px-3.5 py-3 rounded-xl transition-all"
                          style={{
                            background: teamId === team.id ? 'rgba(47,128,237,0.10)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${teamId === team.id ? 'rgba(47,128,237,0.30)' : 'rgba(255,255,255,0.07)'}`,
                          }}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{team.name}</span>
                            {teamId === team.id && <Check size={12} style={{ color: '#2F80ED' }} />}
                          </div>
                          {team.city && <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1"><MapPin size={9} />{team.city}</p>}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[11px] text-white/30 mb-2">Enter team name manually (not in database yet):</p>
                      <div className="flex gap-2">
                        <input className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                          placeholder="Team name"
                          value={teamId ? '' : teamName}
                          onChange={e => { setTeamId(''); setTeamName(e.target.value); }} />
                      </div>
                    </div>
                    <button onClick={() => setShowSuggest('team')}
                      className="w-full text-[11px] text-white/30 hover:text-azure transition-colors flex items-center justify-center gap-1.5 py-2">
                      <Plus size={11} /> Request to add your team to the database
                    </button>
                  </div>
                )}

                {step === 3 && sportType === 'individual' && (
                  <div className="space-y-3">
                    {positionList.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {positionList.map(p => (
                          <SelectBtn key={p} label={p} active={position === p} onClick={() => setPosition(p)} color="#1FB57A" />
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-white/35">Enter your discipline or event type:</p>
                        <input className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                          placeholder="e.g. 100m Sprint, Épée, Breaststroke"
                          value={position} onChange={e => setPosition(e.target.value)} />
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === TOTAL_STEPS - 1 && (
                  <div className="space-y-3">
                    {[
                      { icon: '🏅', label: 'Sport', val: sportName },
                      { icon: '🌍', label: 'Country', val: countryName },
                      { icon: '🏆', label: 'Competition', val: competitionName || '—' },
                      { icon: sportType === 'team' ? '🛡️' : '⚡', label: sportType === 'team' ? 'Team' : 'Discipline', val: teamName || position || '—' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span className="text-lg">{row.icon}</span>
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">{row.label}</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{row.val}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-[11px] text-white/25 text-center pt-1">
                      You can update this anytime from your profile settings.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 pb-6 pt-4 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {step < TOTAL_STEPS - 1 ? (
                  <>
                    <button onClick={skipToRole}
                      className="text-[12px] text-white/25 hover:text-white/50 transition-colors">
                      Skip
                    </button>
                    <button disabled={!canAdvance} onClick={() => setStep(s => s + 1)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                      style={{ background: canAdvance ? '#2F80ED' : 'rgba(47,128,237,0.20)', color: '#fff', boxShadow: canAdvance ? '0 4px 18px rgba(47,128,237,0.35)' : 'none' }}>
                      Continue <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <button disabled={loading} onClick={handleComplete}
                    className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
                    style={{ background: '#1FB57A', color: '#fff', boxShadow: '0 4px 20px rgba(31,181,122,0.35)' }}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Complete Setup
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="px-7 py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.25)' }}>
                <Check size={22} style={{ color: '#2F80ED' }} />
              </div>
              <p className="text-white font-bold text-lg">Welcome to AceAiX!</p>
              <p className="text-white/40 text-sm">Your account is ready. Complete your profile from the dashboard.</p>
              <button onClick={skipToRole}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: '#2F80ED', color: '#fff', boxShadow: '0 4px 18px rgba(47,128,237,0.35)' }}>
                Go to Dashboard <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Global note */}
        <p className="text-center text-[11px] text-white/20 mt-4 flex items-center justify-center gap-1.5">
          <Globe size={11} /> Covering every sport, every country, every level
        </p>
      </div>
    </div>
  );
}
