import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Globe, Lock, MapPin, Clock, Users, Calendar,
  ChevronRight, ChevronLeft, X, Check, Swords, Dumbbell, Trophy,
  PartyPopper, Heart, GraduationCap, Tent, Search,
  UserPlus, AlertCircle, CheckCircle2, HelpCircle,
  Loader2, Trash2, Share2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

/* ── global Maps type shim ───────────────────────────────── */
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: { types?: string[]; fields?: string[] }
          ) => {
            addListener: (event: string, cb: () => void) => void;
            getPlace: () => { formatted_address?: string; name?: string };
          };
        };
      };
    };
    initGoogleMaps?: () => void;
  }
}

/* ── types ───────────────────────────────────────────────── */
interface DbEvent {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  sport_type: string;
  activity_type: string;
  is_public: boolean;
  location: string | null;
  event_date: string;
  duration_mins: number;
  max_attendees: number | null;
  cover_color: string;
  created_at: string;
  creator?: { full_name: string; avatar_url: string | null };
  attendee_count?: number;
  my_rsvp?: string | null;
}

/* ── constants ───────────────────────────────────────────── */
const ACTIVITY_TYPES = [
  { value: 'match',      label: 'Match',      icon: Swords,        color: '#EF5350' },
  { value: 'training',   label: 'Training',   icon: Dumbbell,      color: '#2F80ED' },
  { value: 'tournament', label: 'Tournament', icon: Trophy,        color: '#F5A623' },
  { value: 'trial',      label: 'Trial',      icon: UserPlus,      color: '#1FB57A' },
  { value: 'social',     label: 'Social',     icon: PartyPopper,   color: '#B8F135' },
  { value: 'charity',    label: 'Charity',    icon: Heart,         color: '#E056A0' },
  { value: 'clinic',     label: 'Clinic',     icon: GraduationCap, color: '#1FB57A' },
  { value: 'camp',       label: 'Camp',       icon: Tent,          color: '#F5A623' },
  { value: 'other',      label: 'Other',      icon: Calendar,      color: '#7C8DA6' },
];

const SPORTS_BY_CATEGORY: Record<string, string[]> = {
  'Team Sports': [
    'Football', 'Basketball', 'Volleyball', 'Cricket', 'Rugby Union', 'Rugby League',
    'American Football', 'Baseball', 'Softball', 'Handball', 'Field Hockey',
    'Ice Hockey', 'Water Polo', 'Lacrosse', 'Netball',
  ],
  'Racket Sports': ['Tennis', 'Badminton', 'Table Tennis', 'Squash', 'Padel', 'Pickleball'],
  'Individual & Combat': [
    'Swimming', 'Athletics / Track & Field', 'Cycling', 'Boxing',
    'Wrestling', 'Judo', 'Taekwondo', 'Karate', 'MMA', 'Gymnastics',
    'Diving', 'Weightlifting', 'Powerlifting', 'CrossFit', 'Triathlon',
  ],
  'Mind Sports': ['Chess', 'Billiards / Snooker', 'Darts', 'Esports'],
  'Equestrian & Country': ['Golf', 'Polo', 'Equestrian', 'Archery', 'Fencing', 'Shooting'],
  'Water Sports': ['Surfing', 'Sailing', 'Rowing', 'Kayaking', 'Wakeboarding', 'Kitesurfing'],
  'Winter Sports': ['Skiing', 'Snowboarding', 'Ice Skating', 'Curling'],
  'Racquet & Stick': ['Squash', 'Racquetball'],
  'Fitness & Dance': ['Yoga', 'Pilates', 'Dance', 'Parkour'],
  'Other': ['Other'],
};

const ALL_SPORTS = Object.values(SPORTS_BY_CATEGORY).flat();

const COVER_COLORS = [
  '#2F80ED', '#1FB57A', '#EF5350', '#F5A623',
  '#E056A0', '#B8F135', '#9B59B6', '#1ABC9C',
];

const RSVP_META: Record<string, { label: string; color: string; icon: typeof Check }> = {
  going:     { label: 'Going',     color: '#1FB57A', icon: CheckCircle2 },
  maybe:     { label: 'Maybe',     color: '#F5A623', icon: HelpCircle   },
  not_going: { label: 'Not Going', color: '#EF5350', icon: X            },
  pending:   { label: 'Invited',   color: '#2F80ED', icon: AlertCircle  },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function activityMeta(type: string) {
  return ACTIVITY_TYPES.find(a => a.value === type) ?? ACTIVITY_TYPES[8];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });
}

function isPast(iso: string) {
  return new Date(iso) < new Date();
}

/* ── Google Maps script loader hook ─────────────────────── */
function useGoogleMaps() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) return;
    if (window.google?.maps) { setReady(true); return; }
    window.initGoogleMaps = () => setReady(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { delete window.initGoogleMaps; };
  }, []);
  return ready;
}

/* ── CalendarPicker ──────────────────────────────────────── */
function CalendarPicker({ value, onChange, accentColor, onClose }: {
  value: string; onChange: (d: string) => void; accentColor: string; onClose: () => void;
}) {
  const today = new Date();
  const init = value ? new Date(value + 'T12:00:00') : today;
  const [month, setMonth] = useState(init.getMonth());
  const [year,  setYear]  = useState(init.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedD = value ? new Date(value + 'T12:00:00') : null;

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  function selectDay(day: number) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${year}-${mm}-${dd}`);
    onClose();
  }

  return (
    <div ref={ref} className="absolute z-50 top-full left-0 mt-1.5 rounded-2xl overflow-hidden"
      style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', width: 280, animation: 'slideDown 0.18s ease both' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9DB0C6' }}>
          <ChevronLeft size={13} />
        </button>
        <span className="text-sm font-bold text-white">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9DB0C6' }}>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold py-1" style={{ color: '#7C8DA6' }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const cellDate = new Date(year, month, day);
          const isToday = cellDate.toDateString() === today.toDateString();
          const isSelected = selectedD && cellDate.toDateString() === selectedD.toDateString();
          const isPastDay = cellDate < new Date(today.toDateString());
          return (
            <button key={i} onClick={() => !isPastDay && selectDay(day)} disabled={isPastDay}
              className="w-8 h-8 mx-auto rounded-xl text-xs font-semibold transition-all flex items-center justify-center"
              style={{
                background: isSelected ? accentColor : isToday ? `${accentColor}18` : 'transparent',
                color: isSelected ? 'white' : isPastDay ? '#3A4A5C' : isToday ? accentColor : '#D4E0EE',
                fontWeight: isToday || isSelected ? 700 : 500,
                cursor: isPastDay ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!isSelected && !isPastDay) (e.currentTarget as HTMLElement).style.background = `${accentColor}18`; }}
              onMouseLeave={e => { if (!isSelected && !isPastDay) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {day}
              {isToday && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: accentColor }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── LocationInput (Google Maps Autocomplete) ────────────── */
function LocationInput({ value, onChange, accentColor }: {
  value: string; onChange: (v: string) => void; accentColor: string;
}) {
  const mapsReady = useGoogleMaps();
  const inputRef  = useRef<HTMLInputElement>(null);
  const hasKey    = !!(import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined);

  useEffect(() => {
    if (!mapsReady || !inputRef.current || !window.google?.maps?.places) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      fields: ['formatted_address', 'name'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      onChange(place.formatted_address ?? place.name ?? value);
    });
  }, [mapsReady]);

  return (
    <div className="relative">
      <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={hasKey ? 'Search for a venue or address…' : 'Stadium, venue, or address'}
        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
        style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
        onFocus={e => (e.target.style.borderColor = `${accentColor}50`)}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
      {hasKey && !mapsReady && (
        <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: '#7C8DA6' }} />
      )}
      {hasKey && mapsReady && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(31,181,122,0.12)', color: '#1FB57A' }}>Maps</span>
      )}
      {!hasKey && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px]" style={{ color: '#7C8DA6' }} title="Add VITE_GOOGLE_MAPS_API_KEY to .env to enable autocomplete">
          Manual
        </span>
      )}
    </div>
  );
}

/* ── SportSelect ─────────────────────────────────────────── */
function SportSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState('');
  const ref             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = q
    ? ALL_SPORTS.filter(s => s.toLowerCase().includes(q.toLowerCase()))
    : null;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-all"
        style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: value ? 'white' : '#7C8DA6' }}>
        <span>{value || 'Select sport…'}</span>
        <ChevronRight size={12} style={{ color: '#7C8DA6', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-2xl overflow-hidden"
          style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', maxHeight: 320, animation: 'slideDown 0.15s ease both' }}>
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search sports…"
                className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                autoFocus />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
            {filtered ? (
              filtered.map(sport => (
                <button key={sport} onClick={() => { onChange(sport); setOpen(false); setQ(''); }}
                  className="w-full text-left px-3 py-2 text-sm transition-colors"
                  style={{ color: sport === value ? '#2F80ED' : '#D4E0EE', background: sport === value ? 'rgba(47,128,237,0.08)' : 'transparent' }}
                  onMouseEnter={e => { if (sport !== value) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (sport !== value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  {sport}
                </button>
              ))
            ) : (
              Object.entries(SPORTS_BY_CATEGORY).map(([cat, sports]) => (
                <div key={cat}>
                  <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider"
                    style={{ color: '#4A5E72', background: 'rgba(255,255,255,0.02)' }}>{cat}</p>
                  {sports.map(sport => (
                    <button key={sport} onClick={() => { onChange(sport); setOpen(false); setQ(''); }}
                      className="w-full text-left px-4 py-1.5 text-[12px] transition-colors"
                      style={{ color: sport === value ? '#2F80ED' : '#D4E0EE', background: sport === value ? 'rgba(47,128,237,0.08)' : 'transparent' }}
                      onMouseEnter={e => { if (sport !== value) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (sport !== value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      {sport}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── EventCard ───────────────────────────────────────────── */
function EventCard({ event, userId, onSelect, onRsvp }: {
  event: DbEvent; userId: string | undefined;
  onSelect: (e: DbEvent) => void; onRsvp: (id: string, status: string) => void;
}) {
  const meta    = activityMeta(event.activity_type);
  const Icon    = meta.icon;
  const past    = isPast(event.event_date);
  const isOwner = event.creator_id === userId;
  const rsvpM   = event.my_rsvp ? RSVP_META[event.my_rsvp] : null;

  return (
    <div className="group rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col"
      style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${event.cover_color}35`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
      onClick={() => onSelect(event)}>
      <div className="h-1.5 w-full" style={{ background: event.cover_color, opacity: past ? 0.4 : 1 }} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
            <Icon size={16} style={{ color: past ? '#7C8DA6' : meta.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">{event.title}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{event.sport_type} · {meta.label}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {event.is_public ? <Globe size={11} style={{ color: '#7C8DA6' }} /> : <Lock size={11} style={{ color: '#F5A623' }} />}
            {isOwner && <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>You</span>}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px]" style={{ color: '#9DB0C6' }}>
            <Calendar size={10} className="flex-shrink-0" />
            {formatDate(event.event_date)} at {formatTime(event.event_date)}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-[11px]" style={{ color: '#9DB0C6' }}>
              <MapPin size={10} className="flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px]" style={{ color: '#9DB0C6' }}>
            <Users size={10} className="flex-shrink-0" />
            {event.attendee_count ?? 0} attending{event.max_attendees ? ` · ${event.max_attendees} max` : ''}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: `${event.cover_color}20`, color: event.cover_color }}>
              {event.creator?.full_name?.charAt(0) ?? '?'}
            </div>
            <span className="text-[10px]" style={{ color: '#7C8DA6' }}>
              {isOwner ? 'By you' : event.creator?.full_name}
            </span>
          </div>
          {past ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,141,166,0.12)', color: '#7C8DA6' }}>Past</span>
          ) : rsvpM ? (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${rsvpM.color}12`, color: rsvpM.color, border: `1px solid ${rsvpM.color}25` }}>
              <rsvpM.icon size={9} /> {rsvpM.label}
            </span>
          ) : !isOwner ? (
            <button onClick={e => { e.stopPropagation(); onRsvp(event.id, 'going'); }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(31,181,122,0.12)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
              Join
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── CreateEventModal ────────────────────────────────────── */
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [step, setStep]         = useState<1 | 2>(1);
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [sport, setSport]       = useState('Football');
  const [actType, setActType]   = useState('social');
  const [isPublic, setPublic]   = useState(true);
  const [location, setLocation] = useState('');
  const [date, setDate]         = useState('');
  const [time, setTime]         = useState('18:00');
  const [duration, setDuration] = useState(90);
  const [maxAtt, setMaxAtt]     = useState('');
  const [color, setColor]       = useState(COVER_COLORS[0]);
  const [showCal, setShowCal]   = useState(false);
  const [inviteQ, setInviteQ]   = useState('');
  const [inviteRes, setInviteRes] = useState<Array<{ id: string; full_name: string; avatar_url: string | null }>>([]);
  const [invitees, setInvitees] = useState<Array<{ id: string; full_name: string }>>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const dateRef = useRef<HTMLDivElement>(null);

  async function searchUsers(q: string) {
    if (q.length < 2) { setInviteRes([]); return; }
    const { data } = await supabase.from('user_profiles').select('id, full_name, avatar_url')
      .ilike('full_name', `%${q}%`).neq('id', user?.id ?? '').limit(8);
    setInviteRes(data ?? []);
  }

  function addInvitee(u: { id: string; full_name: string }) {
    if (!invitees.find(i => i.id === u.id)) setInvitees(p => [...p, u]);
    setInviteQ(''); setInviteRes([]);
  }

  async function handleSave() {
    if (!user || !title.trim() || !date) return;
    setSaving(true); setError('');
    try {
      const eventDate = new Date(`${date}T${time}`).toISOString();
      const { data: ev, error: evErr } = await supabase.from('events').insert({
        creator_id: user.id, title: title.trim(), description: desc.trim() || null,
        sport_type: sport, activity_type: actType, is_public: isPublic,
        location: location.trim() || null, event_date: eventDate,
        duration_mins: duration, max_attendees: maxAtt ? Number(maxAtt) : null, cover_color: color,
      }).select('id').single();
      if (evErr) throw evErr;
      if (invitees.length > 0) {
        await supabase.from('event_attendees').insert(
          invitees.map(i => ({ event_id: ev.id, user_id: i.id, rsvp_status: 'pending', invited_by: user.id }))
        );
      }
      onCreated();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  const canProceed = title.trim().length > 0 && !!date;
  const meta = activityMeta(actType);

  // Format display date
  const displayDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.15s ease' }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: '#0D1C2E', border: `1px solid ${color}35`, boxShadow: `0 24px 80px rgba(0,0,0,0.6)`, animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="h-1.5" style={{ background: color }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-base font-black text-white">Create Event</h2>
            <p className="text-[11px]" style={{ color: '#7C8DA6' }}>
              Step {step} of 2 · {step === 1 ? 'Event details' : 'Invites & visibility'}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#7C8DA6' }}>
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {/* ── Step 1 ────────────────────────────────── */}
          {step === 1 && (
            <div className="px-6 py-5 space-y-5">
              {/* Activity type */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#7C8DA6' }}>Activity Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVITY_TYPES.map(a => (
                    <button key={a.value} onClick={() => setActType(a.value)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: actType === a.value ? `${a.color}12` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${actType === a.value ? a.color + '40' : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      <a.icon size={13} style={{ color: actType === a.value ? a.color : '#7C8DA6', flexShrink: 0 }} />
                      <span className="text-[11px] font-semibold" style={{ color: actType === a.value ? a.color : '#7C8DA6' }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Event Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 5-a-side Friday night match"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  onFocus={e => (e.target.style.borderColor = `${color}50`)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>

              {/* Sport */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Sport</label>
                <SportSelect value={sport} onChange={setSport} />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                {/* Custom calendar date picker */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Date *</label>
                  <div ref={dateRef} className="relative">
                    <button type="button" onClick={() => setShowCal(c => !c)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                      style={{
                        background: '#0A1622',
                        border: `1px solid ${showCal ? color + '60' : date ? color + '40' : 'rgba(255,255,255,0.1)'}`,
                        color: date ? 'white' : '#7C8DA6',
                      }}>
                      <Calendar size={13} style={{ color: date ? color : '#7C8DA6', flexShrink: 0 }} />
                      <span className="truncate text-xs">{displayDate || 'Pick a date…'}</span>
                    </button>
                    {showCal && (
                      <CalendarPicker
                        value={date}
                        onChange={d => { setDate(d); setShowCal(false); }}
                        accentColor={color}
                        onClose={() => setShowCal(false)}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Time</label>
                  <div className="relative">
                    <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
                    <input type="time" value={time} onChange={e => setTime(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Duration (minutes)</label>
                  <div className="flex gap-2">
                    {[30, 60, 90, 120].map(d => (
                      <button key={d} onClick={() => setDuration(d)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: duration === d ? `${color}15` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${duration === d ? color + '40' : 'rgba(255,255,255,0.08)'}`,
                          color: duration === d ? color : '#7C8DA6',
                        }}>{d}m</button>
                    ))}
                    <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={15} max={480}
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none text-center"
                      style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Location</label>
                <LocationInput value={location} onChange={setLocation} accentColor={color} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                  placeholder="What's the event about? Rules, gear needed, level required…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>

              {/* Cover colour */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#7C8DA6' }}>Cover Colour</label>
                <div className="flex gap-2">
                  {COVER_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-lg transition-all"
                      style={{ background: c, border: color === c ? '2.5px solid white' : '2px solid transparent', transform: color === c ? 'scale(1.2)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 ────────────────────────────────── */}
          {step === 2 && (
            <div className="px-6 py-5 space-y-5">
              {/* Visibility */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#7C8DA6' }}>Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: true,  label: 'Public',  sub: 'Anyone can discover & join', icon: Globe, color: '#1FB57A' },
                    { val: false, label: 'Private', sub: 'Invite only — hidden from others', icon: Lock, color: '#F5A623' },
                  ].map(opt => (
                    <button key={String(opt.val)} onClick={() => setPublic(opt.val)}
                      className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isPublic === opt.val ? `${opt.color}10` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isPublic === opt.val ? opt.color + '40' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <opt.icon size={16} style={{ color: isPublic === opt.val ? opt.color : '#7C8DA6', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: isPublic === opt.val ? opt.color : 'white' }}>{opt.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max attendees */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Max Attendees (optional)</label>
                <div className="relative">
                  <Users size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
                  <input type="number" value={maxAtt} onChange={e => setMaxAtt(e.target.value)} min={1}
                    placeholder="Leave blank for unlimited"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
              </div>

              {/* Invite */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Invite Athletes / Connections</label>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
                  <input value={inviteQ} onChange={e => { setInviteQ(e.target.value); searchUsers(e.target.value); }}
                    placeholder="Search by name…"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                {inviteRes.length > 0 && (
                  <div className="mt-1.5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#0A1622' }}>
                    {inviteRes.map(u => (
                      <button key={u.id} onClick={() => addInvitee(u)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${color}20`, color }}>
                          {u.full_name.charAt(0)}
                        </div>
                        <p className="text-sm text-white flex-1">{u.full_name}</p>
                        <UserPlus size={12} style={{ color: '#1FB57A' }} />
                      </button>
                    ))}
                  </div>
                )}
                {invitees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {invitees.map(i => (
                      <div key={i.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                        {i.full_name}
                        <button onClick={() => setInvitees(p => p.filter(x => x.id !== i.id))}><X size={9} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: '#7C8DA6' }}>Preview</p>
                <div className="h-1 rounded-full mb-3" style={{ background: color }} />
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                    <meta.icon size={16} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{title || 'Your event title'}</p>
                    <p className="text-[10px]" style={{ color: '#7C8DA6' }}>{sport} · {meta.label} · {isPublic ? 'Public' : 'Private'}</p>
                  </div>
                </div>
                {date && <p className="text-xs flex items-center gap-1.5" style={{ color: '#9DB0C6' }}><Calendar size={10} /> {displayDate} at {time}</p>}
                {location && <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#9DB0C6' }}><MapPin size={10} /> {location}</p>}
              </div>

              {error && (
                <p className="text-xs flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.25)', color: '#EF5350' }}>
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {step === 2
            ? <button onClick={() => setStep(1)} className="text-sm font-semibold" style={{ color: '#7C8DA6' }}>Back</button>
            : <button onClick={onClose} className="text-sm font-semibold" style={{ color: '#7C8DA6' }}>Cancel</button>}
          {step === 1
            ? <button onClick={() => setStep(2)} disabled={!canProceed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: color, color: 'white', boxShadow: canProceed ? `0 4px 16px ${color}40` : 'none' }}>
                Next <ChevronRight size={14} />
              </button>
            : <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: color, color: 'white', boxShadow: `0 4px 16px ${color}40` }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? 'Creating…' : 'Create Event'}
              </button>}
        </div>
      </div>
    </div>
  );
}

/* ── EventDetailModal ────────────────────────────────────── */
function EventDetailModal({ event, userId, onClose, onRsvp, onDelete }: {
  event: DbEvent; userId: string | undefined;
  onClose: () => void; onRsvp: (id: string, s: string) => void; onDelete: (id: string) => void;
}) {
  const [attendees, setAttendees] = useState<Array<{ user_id: string; rsvp_status: string; full_name: string }>>([]);
  const meta    = activityMeta(event.activity_type);
  const isOwner = event.creator_id === userId;
  const past    = isPast(event.event_date);

  useEffect(() => {
    supabase.from('event_attendees').select('user_id, rsvp_status, user_profiles(full_name)').eq('event_id', event.id)
      .then(({ data }) => {
        setAttendees((data ?? []).map((r: { user_id: string; rsvp_status: string; user_profiles: { full_name: string } | null }) => ({
          user_id: r.user_id, rsvp_status: r.rsvp_status, full_name: r.user_profiles?.full_name ?? 'Unknown',
        })));
      });
  }, [event.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.15s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#0D1C2E', border: `1px solid ${event.cover_color}35`, animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="h-1.5" style={{ background: event.cover_color }} />
        <div className="px-6 py-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
              <meta.icon size={20} style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-black text-white leading-tight">{event.title}</h3>
                {event.is_public ? <Globe size={12} style={{ color: '#7C8DA6' }} /> : <Lock size={12} style={{ color: '#F5A623' }} />}
              </div>
              <p className="text-xs" style={{ color: '#7C8DA6' }}>{event.sport_type} · {meta.label}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#7C8DA6' }}>
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-sm" style={{ color: '#9DB0C6' }}>
              <Calendar size={13} style={{ flexShrink: 0 }} />
              {formatDate(event.event_date)} at {formatTime(event.event_date)} · {event.duration_mins} min
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-sm" style={{ color: '#9DB0C6' }}>
                <MapPin size={13} style={{ flexShrink: 0 }} /> {event.location}
              </div>
            )}
            {event.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,248,252,0.6)' }}>{event.description}</p>
            )}
          </div>

          {attendees.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#7C8DA6' }}>
                Attendees ({attendees.length}{event.max_attendees ? ` / ${event.max_attendees}` : ''})
              </p>
              <div className="flex flex-wrap gap-2">
                {attendees.map(a => {
                  const rm = RSVP_META[a.rsvp_status];
                  return (
                    <div key={a.user_id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                      style={{ background: `${rm?.color ?? '#7C8DA6'}10`, border: `1px solid ${rm?.color ?? '#7C8DA6'}25`, color: rm?.color ?? '#7C8DA6' }}>
                      {a.full_name} <span className="text-[9px] opacity-60">{rm?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isOwner && !past && (
              ['going', 'maybe', 'not_going'].map(s => {
                const rm = RSVP_META[s]; const active = event.my_rsvp === s;
                return (
                  <button key={s} onClick={() => onRsvp(event.id, s)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-1 justify-center transition-all"
                    style={{ background: active ? `${rm.color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? rm.color + '40' : 'rgba(255,255,255,0.08)'}`, color: active ? rm.color : '#7C8DA6' }}>
                    <rm.icon size={11} /> {rm.label}
                  </button>
                );
              })
            )}
            {isOwner && (
              <>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#7C8DA6' }}>
                  <Share2 size={11} /> Share
                </button>
                <button onClick={() => { onDelete(event.id); onClose(); }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
                  <Trash2 size={11} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main EventsPage ──────────────────────────────────────── */
const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'mine',     label: 'My Events' },
  { id: 'invited',  label: 'Invited'   },
  { id: 'past',     label: 'Past'      },
] as const;
type Tab = typeof TABS[number]['id'];

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents]     = useState<DbEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('upcoming');
  const [search, setSearch]     = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<DbEvent | null>(null);

  const loadEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: evData } = await supabase
      .from('events')
      .select('*, creator:user_profiles!events_creator_id_fkey(full_name, avatar_url)')
      .order('event_date', { ascending: true });
    if (!evData) { setLoading(false); return; }

    const eventIds = evData.map(e => e.id);
    const { data: attData } = await supabase
      .from('event_attendees').select('event_id, user_id, rsvp_status').in('event_id', eventIds);

    const attMap: Record<string, { count: number; myRsvp: string | null }> = {};
    (attData ?? []).forEach(a => {
      if (!attMap[a.event_id]) attMap[a.event_id] = { count: 0, myRsvp: null };
      attMap[a.event_id].count++;
      if (a.user_id === user.id) attMap[a.event_id].myRsvp = a.rsvp_status;
    });

    setEvents(evData.map(e => ({
      ...e,
      creator: Array.isArray(e.creator) ? e.creator[0] : e.creator,
      attendee_count: attMap[e.id]?.count ?? 0,
      my_rsvp: attMap[e.id]?.myRsvp ?? null,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  async function handleRsvp(eventId: string, status: string) {
    if (!user) return;
    await supabase.from('event_attendees')
      .upsert({ event_id: eventId, user_id: user.id, rsvp_status: status }, { onConflict: 'event_id,user_id' });
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, my_rsvp: status, attendee_count: (e.attendee_count ?? 0) + (e.my_rsvp ? 0 : 1) } : e
    ));
    if (selected?.id === eventId) setSelected(p => p ? { ...p, my_rsvp: status } : p);
  }

  async function handleDelete(eventId: string) {
    await supabase.from('events').delete().eq('id', eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }

  const now = new Date();
  const filtered = events.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === 'upcoming') return new Date(e.event_date) >= now;
    if (tab === 'mine')     return e.creator_id === user?.id;
    if (tab === 'invited')  return e.my_rsvp === 'pending' && e.creator_id !== user?.id;
    if (tab === 'past')     return new Date(e.event_date) < now;
    return true;
  });

  const upcomingCount = events.filter(e => new Date(e.event_date) >= now).length;
  const invitedCount  = events.filter(e => e.my_rsvp === 'pending' && e.creator_id !== user?.id).length;

  return (
    <div className="max-w-5xl space-y-5 pb-10">
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes slideUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .pac-container { background:#0A1622!important; border:1px solid rgba(255,255,255,0.12)!important; border-radius:12px!important; box-shadow:0 8px 32px rgba(0,0,0,0.5)!important; margin-top:4px!important; }
        .pac-item { color:#D4E0EE!important; border-top:1px solid rgba(255,255,255,0.05)!important; padding:8px 12px!important; cursor:pointer!important; }
        .pac-item:hover { background:rgba(47,128,237,0.08)!important; }
        .pac-item-query { color:#ffffff!important; }
        .pac-matched { color:#2F80ED!important; }
        .pac-icon { display:none!important; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <div>
          <h1 className="text-xl font-black text-white">Events</h1>
          <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>
            {upcomingCount} upcoming{invitedCount > 0 ? ` · ${invitedCount} invite${invitedCount > 1 ? 's' : ''} pending` : ''} · Join, create & invite people to sports activities
          </p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg,#2F80ED,#1a5bbf)', color: 'white', boxShadow: '0 4px 16px rgba(47,128,237,0.35)' }}>
          <Plus size={14} /> Create Event
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ animation: 'fadeSlideUp 0.35s 0.05s ease both' }}>
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
        </div>
        <div className="flex gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: tab === t.id ? 'rgba(47,128,237,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${tab === t.id ? 'rgba(47,128,237,0.35)' : 'rgba(255,255,255,0.07)'}`,
                color: tab === t.id ? '#2F80ED' : '#7C8DA6',
              }}>
              {t.label}
              {t.id === 'invited' && invitedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center"
                  style={{ background: '#2F80ED', color: 'white' }}>{invitedCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: '#2F80ED' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3"
          style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.2)' }}>
            <Calendar size={24} style={{ color: '#2F80ED' }} />
          </div>
          <p className="text-sm font-semibold text-white">
            {tab === 'upcoming' ? 'No upcoming events' : tab === 'mine' ? "You haven't created any events yet" : tab === 'invited' ? 'No pending invites' : 'No past events'}
          </p>
          <p className="text-xs text-center max-w-xs" style={{ color: '#7C8DA6' }}>
            {(tab === 'upcoming' || tab === 'mine') ? 'Create your first event and invite your network.' : 'Events you\'re invited to will appear here.'}
          </p>
          {(tab === 'upcoming' || tab === 'mine') && (
            <button onClick={() => setCreating(true)}
              className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.3)', color: '#2F80ED' }}>
              <Plus size={13} /> Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event, i) => (
            <div key={event.id} style={{ animation: `fadeSlideUp 0.3s ease ${i * 0.05}s both` }}>
              <EventCard event={event} userId={user?.id} onSelect={setSelected} onRsvp={handleRsvp} />
            </div>
          ))}
        </div>
      )}

      {creating && (
        <CreateEventModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); loadEvents(); }} />
      )}
      {selected && (
        <EventDetailModal event={selected} userId={user?.id} onClose={() => setSelected(null)} onRsvp={handleRsvp} onDelete={handleDelete} />
      )}
    </div>
  );
}
