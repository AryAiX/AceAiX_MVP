import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Eye, EyeOff, Save, Search, Star,
  BrainCircuit, Globe, MapPin, Briefcase, ChevronRight,
  ShieldCheck, Zap, CheckCircle2, Lock, Trash2, LogOut,
  Smartphone, Mail, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ── palette ──────────────────────────────────────────────────── */
const C = {
  blue:   '#2F80ED',
  green:  '#1FB57A',
  amber:  '#F5A623',
  lime:   '#B8F135',
  red:    '#EF5350',
  purple: '#9B59B6',
};

/* ── types ────────────────────────────────────────────────────── */
type Tab = 'profile' | 'scouting' | 'notifications' | 'privacy' | 'security';

/* ── toggle ───────────────────────────────────────────────────── */
function Toggle({ on, onChange, color = C.blue }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0 ml-4"
      style={{ width: 44, height: 24 }}
      aria-checked={on}
      role="switch">
      <div className="absolute inset-0 rounded-full transition-all duration-250"
        style={{
          background: on ? color : 'rgba(255,255,255,0.10)',
          border: `1px solid ${on ? color + '60' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: on ? `0 0 10px ${color}45` : 'none',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
        }} />
      <div className="absolute top-0.5 rounded-full transition-transform duration-200"
        style={{
          width: 20, height: 20,
          background: on ? '#fff' : 'rgba(255,255,255,0.45)',
          left: on ? 22 : 2,
          boxShadow: on ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
          transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.15s',
        }} />
    </button>
  );
}

/* ── toggle row ──────────────────────────────────────────────── */
function ToggleRow({
  label, desc, defaultOn, color = C.blue, icon: Icon, delay = 0,
}: {
  label: string; desc: string; defaultOn: boolean; color?: string;
  icon?: React.ElementType; delay?: number;
}) {
  const [on, setOn] = useState(defaultOn);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="flex items-center justify-between py-3.5"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
            <Icon size={13} style={{ color }} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
        </div>
      </div>
      <Toggle on={on} onChange={setOn} color={color} />
    </div>
  );
}

/* ── section card ────────────────────────────────────────────── */
function SectionCard({ title, icon: Icon, color = C.blue, children, delay = 0 }: {
  title: string; icon: React.ElementType; color?: string; children: React.ReactNode; delay?: number;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.45s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: `linear-gradient(90deg,${color}08,transparent)` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}16`, border: `1px solid ${color}28` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </div>
  );
}

/* ── input field ─────────────────────────────────────────────── */
function Field({ label, color = C.blue, children }: { label: string; color?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ color = C.blue, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { color?: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      {...props}
      onFocus={e => { setFocus(true); props.onFocus?.(e); }}
      onBlur={e => { setFocus(false); props.onBlur?.(e); }}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${focus ? color + '55' : 'rgba(255,255,255,0.10)'}`,
        color: 'rgba(255,255,255,0.88)',
        boxShadow: focus ? `0 0 0 3px ${color}14` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...props.style,
      }}
    />
  );
}

function Textarea({ color = C.blue, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { color?: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea
      {...props}
      onFocus={e => { setFocus(true); props.onFocus?.(e); }}
      onBlur={e => { setFocus(false); props.onBlur?.(e); }}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${focus ? color + '55' : 'rgba(255,255,255,0.10)'}`,
        color: 'rgba(255,255,255,0.88)',
        boxShadow: focus ? `0 0 0 3px ${color}14` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    />
  );
}

function Select({ color = C.blue, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { color?: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <select
      {...props}
      onFocus={e => { setFocus(true); props.onFocus?.(e); }}
      onBlur={e => { setFocus(false); props.onBlur?.(e); }}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${focus ? color + '55' : 'rgba(255,255,255,0.10)'}`,
        color: 'rgba(255,255,255,0.88)',
        boxShadow: focus ? `0 0 0 3px ${color}14` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
      {children}
    </select>
  );
}

/* ── save button ─────────────────────────────────────────────── */
function SaveButton({ saved, onClick, color = C.blue }: { saved: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
      style={{
        background: saved ? C.green : color,
        color: '#fff',
        boxShadow: `0 4px 18px ${saved ? C.green : color}45`,
        transition: 'background 0.3s, box-shadow 0.3s',
      }}>
      {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
      {saved ? 'Saved!' : 'Save Changes'}
    </button>
  );
}

/* ── profile tab ─────────────────────────────────────────────── */
function ProfileTab({ saved, setSaved }: { saved: boolean; setSaved: (v: boolean) => void }) {
  const { profile } = useAuth();
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  return (
    <div className="space-y-5">
      {/* avatar + identity */}
      <SectionCard title="Identity" icon={User} color={C.blue} delay={80}>
        <div className="flex items-center gap-5 mt-4 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-bold"
              style={{ background: `${C.blue}16`, border: `2px solid ${C.blue}38`, color: C.blue }}>
              {profile?.full_name?.charAt(0) ?? 'S'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: C.blue, border: '2px solid #0C1A2B' }}>
              <ShieldCheck size={11} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{profile?.full_name ?? 'Scout User'}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Scout · Verified Account</p>
            <button className="mt-2 text-[11px] font-semibold px-3 py-1 rounded-lg transition-all"
              style={{ background: `${C.blue}14`, border: `1px solid ${C.blue}28`, color: C.blue }}>
              Upload Photo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name"><Input defaultValue={profile?.full_name ?? ''} placeholder="Your full name" /></Field>
          <Field label="Email"><Input defaultValue={profile?.email ?? ''} type="email" placeholder="email@example.com" /></Field>
          <Field label="Phone"><Input placeholder="+971 50 000 0000" /></Field>
          <Field label="City / Location"><Input defaultValue={profile?.city ?? ''} placeholder="Dubai, UAE" /></Field>
        </div>
        <div className="mt-4">
          <Field label="Bio">
            <Textarea rows={3} defaultValue={profile?.bio ?? ''} placeholder="Brief professional background as a scout..." />
          </Field>
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton saved={saved} onClick={save} color={C.blue} />
        </div>
      </SectionCard>

      {/* organization */}
      <SectionCard title="Organization" icon={Briefcase} color={C.amber} delay={160}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Club / Organization"><Input placeholder="Al Ain FC" color={C.amber} /></Field>
          <Field label="Role / Title"><Input placeholder="Head of Recruitment" color={C.amber} /></Field>
          <Field label="Region"><Input placeholder="UAE / GCC" color={C.amber} /></Field>
          <Field label="Website"><Input placeholder="https://club.com" color={C.amber} /></Field>
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton saved={saved} onClick={save} color={C.amber} />
        </div>
      </SectionCard>
    </div>
  );
}

/* ── scouting preferences tab ────────────────────────────────── */
function ScoutingTab({ saved, setSaved }: { saved: boolean; setSaved: (v: boolean) => void }) {
  const [minAge, setMinAge] = useState(16);
  const [maxAge, setMaxAge] = useState(28);
  const [minScore, setMinScore] = useState(7);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t); }, []);
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  const SPORTS = ['Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 'Rugby', 'Handball'];
  const POSITIONS = ['Striker', 'Midfielder', 'Winger', 'Defender', 'Goalkeeper', 'Full-back', 'Playmaker'];
  const [selSports, setSelSports] = useState<string[]>(['Football']);
  const [selPos, setSelPos] = useState<string[]>(['Striker', 'Midfielder']);

  function toggleChip(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Target Sports" icon={Search} color={C.lime} delay={80}>
        <div className="flex flex-wrap gap-2 mt-4">
          {SPORTS.map(s => {
            const active = selSports.includes(s);
            return (
              <button key={s} onClick={() => toggleChip(selSports, setSelSports, s)}
                className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                style={{
                  background: active ? `${C.lime}18` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? C.lime + '45' : 'rgba(255,255,255,0.10)'}`,
                  color: active ? C.lime : 'rgba(255,255,255,0.45)',
                  boxShadow: active ? `0 0 10px ${C.lime}25` : 'none',
                }}>
                {s}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Preferred Positions" icon={Activity} color={C.blue} delay={140}>
        <div className="flex flex-wrap gap-2 mt-4">
          {POSITIONS.map(p => {
            const active = selPos.includes(p);
            return (
              <button key={p} onClick={() => toggleChip(selPos, setSelPos, p)}
                className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                style={{
                  background: active ? `${C.blue}18` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? C.blue + '45' : 'rgba(255,255,255,0.10)'}`,
                  color: active ? C.blue : 'rgba(255,255,255,0.45)',
                  boxShadow: active ? `0 0 10px ${C.blue}25` : 'none',
                }}>
                {p}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Age & Score Thresholds" icon={BrainCircuit} color={C.green} delay={200}>
        <div className="mt-4 space-y-6">
          {/* Age range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Age Range</label>
              <span className="text-[12px] font-bold" style={{ color: C.green }}>{minAge}–{maxAge} yrs</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input type="range" min={14} max={40} value={minAge} onChange={e => setMinAge(+e.target.value)}
                  className="w-full accent-green-500 h-1.5 rounded-full" />
              </div>
              <div className="flex-1">
                <input type="range" min={14} max={40} value={maxAge} onChange={e => setMaxAge(+e.target.value)}
                  className="w-full accent-green-500 h-1.5 rounded-full" />
              </div>
            </div>
            {/* visual bar */}
            <div className="relative h-2 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="absolute top-0 bottom-0 rounded-full"
                style={{
                  left: `${((minAge - 14) / 26) * 100}%`,
                  right: `${100 - ((maxAge - 14) / 26) * 100}%`,
                  background: `linear-gradient(90deg,${C.green}70,${C.green})`,
                  boxShadow: `0 0 8px ${C.green}50`,
                  transition: 'left 0.15s, right 0.15s',
                }} />
            </div>
          </div>

          {/* Min score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Minimum AI Score</label>
              <span className="text-[12px] font-bold" style={{ color: C.lime }}>{minScore}.0+</span>
            </div>
            <input type="range" min={5} max={10} step={0.5} value={minScore} onChange={e => setMinScore(+e.target.value)}
              className="w-full accent-lime-500 h-1.5 rounded-full" />
            <div className="relative h-2 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="absolute top-0 bottom-0 left-0 rounded-full"
                style={{
                  width: mounted ? `${((minScore - 5) / 5) * 100}%` : '0%',
                  background: `linear-gradient(90deg,${C.lime}60,${C.lime})`,
                  boxShadow: `0 0 8px ${C.lime}50`,
                  transition: 'width 0.15s',
                }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Field label="Target Region" color={C.green}>
            <Select color={C.green}>
              <option style={{ background: '#0C1A2B' }}>GCC</option>
              <option style={{ background: '#0C1A2B' }}>MENA</option>
              <option style={{ background: '#0C1A2B' }}>Africa</option>
              <option style={{ background: '#0C1A2B' }}>Europe</option>
              <option style={{ background: '#0C1A2B' }}>Global</option>
            </Select>
          </Field>
          <Field label="Nationality Preference" color={C.green}>
            <Select color={C.green}>
              <option style={{ background: '#0C1A2B' }}>Any</option>
              <option style={{ background: '#0C1A2B' }}>UAE National</option>
              <option style={{ background: '#0C1A2B' }}>GCC National</option>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton saved={saved} onClick={save} color={C.green} />
        </div>
      </SectionCard>

      <SectionCard title="AI Recommendations" icon={Zap} color={C.purple} delay={260}>
        <div className="space-y-0.5 mt-2">
          {[
            { label: 'Daily AI Match Digest',         desc: 'Receive a daily list of top matches based on your criteria',    color: C.purple, defaultOn: true  },
            { label: 'Instant High-Match Alerts',     desc: 'Get notified the moment a 90%+ match athlete is added',         color: C.lime,   defaultOn: true  },
            { label: 'Rising Talent Alerts',          desc: 'Athletes showing rapid performance improvement',                color: C.green,  defaultOn: false },
            { label: 'Auto-add to Watchlist',         desc: 'Automatically save 95%+ AI match athletes to watchlist',        color: C.amber,  defaultOn: false },
          ].map((r, i) => (
            <ToggleRow key={r.label} {...r} icon={Zap} delay={80 + i * 50} />
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton saved={saved} onClick={save} color={C.purple} />
        </div>
      </SectionCard>
    </div>
  );
}

/* ── notifications tab ───────────────────────────────────────── */
function NotificationsTab() {
  const groups = [
    {
      title: 'Athlete Activity', icon: Activity, color: C.blue,
      items: [
        { label: 'Profile View Confirmation', desc: 'Logged when you view an athlete profile',           color: C.blue,   defaultOn: true,  icon: Eye        },
        { label: 'Athlete Responds',           desc: 'When a contacted athlete replies',                  color: C.green,  defaultOn: true,  icon: Mail       },
        { label: 'Watchlist Score Change',     desc: 'AI score changes on your watchlisted athletes',     color: C.amber,  defaultOn: true,  icon: Star       },
        { label: 'Athlete Goes Unavailable',   desc: "When a watchlisted athlete's status changes",       color: C.red,    defaultOn: true,  icon: ShieldCheck },
      ],
    },
    {
      title: 'Platform Updates', icon: Bell, color: C.amber,
      items: [
        { label: 'New Athletes in Region',     desc: 'When verified athletes matching your region join', color: C.lime,   defaultOn: true,  icon: Globe      },
        { label: 'Weekly Scouting Digest',     desc: 'Summary of your weekly scouting activity',         color: C.blue,   defaultOn: true,  icon: Activity   },
        { label: 'Platform Announcements',     desc: 'Feature releases and platform news',                color: C.purple, defaultOn: false, icon: Zap        },
        { label: 'Promotional Offers',         desc: 'Upgrades, trials and partner deals',               color: C.amber,  defaultOn: false, icon: Star       },
      ],
    },
    {
      title: 'Delivery', icon: Smartphone, color: C.green,
      items: [
        { label: 'Push Notifications',         desc: 'In-app and browser push alerts',                   color: C.green,  defaultOn: true,  icon: Smartphone },
        { label: 'Email Notifications',        desc: 'Receive alerts via email',                         color: C.blue,   defaultOn: true,  icon: Mail       },
        { label: 'SMS Alerts',                 desc: 'Critical alerts sent via SMS (charges may apply)',  color: C.amber,  defaultOn: false, icon: Smartphone },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {groups.map((g, gi) => (
        <SectionCard key={g.title} title={g.title} icon={g.icon} color={g.color} delay={80 + gi * 80}>
          <div className="space-y-0.5 mt-2">
            {g.items.map((item, i) => (
              <ToggleRow key={item.label} {...item} delay={100 + gi * 80 + i * 45} />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

/* ── privacy tab ─────────────────────────────────────────────── */
function PrivacyTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Profile Visibility" icon={Eye} color={C.blue} delay={80}>
        <div className="space-y-0.5 mt-2">
          {[
            { label: 'Show Organization',      desc: 'Display your club name on your scout profile',          color: C.blue,  defaultOn: true,  icon: Briefcase  },
            { label: 'Show in Scout Directory', desc: 'Let athletes see you in the verified scouts list',      color: C.green, defaultOn: true,  icon: Globe      },
            { label: 'Show Active Status',      desc: 'Display online indicator to athletes you\'ve contacted',color: C.amber, defaultOn: false, icon: Activity   },
          ].map((r, i) => <ToggleRow key={r.label} {...r} delay={100 + i * 55} />)}
        </div>
      </SectionCard>

      <SectionCard title="Data & Tracking" icon={Shield} color={C.purple} delay={160}>
        <div className="space-y-0.5 mt-2">
          {[
            { label: 'Anonymous View Mode',    desc: 'Athletes won\'t see your name when you view profiles',  color: C.purple, defaultOn: false, icon: Eye        },
            { label: 'Analytics Tracking',     desc: 'Allow us to improve recommendations using your data',   color: C.blue,   defaultOn: true,  icon: Activity   },
            { label: 'Share Activity Reports', desc: 'Send weekly reports to your organization admin',        color: C.green,  defaultOn: false, icon: Globe      },
          ].map((r, i) => <ToggleRow key={r.label} {...r} delay={180 + i * 55} />)}
        </div>
      </SectionCard>
    </div>
  );
}

/* ── security tab ────────────────────────────────────────────── */
function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [vis, setVis]                 = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  const SESSIONS = [
    { device: 'Chrome · Windows 11',        location: 'Dubai, UAE',         time: 'Active now',   current: true  },
    { device: 'Safari · iPhone 15 Pro',     location: 'Abu Dhabi, UAE',     time: '2 hours ago',  current: false },
    { device: 'Chrome · MacBook Pro',       location: 'Riyadh, KSA',        time: '3 days ago',   current: false },
  ];

  return (
    <div className="space-y-5">
      {/* password */}
      <SectionCard title="Change Password" icon={Lock} color={C.blue} delay={80}>
        <div className="space-y-4 mt-4">
          <Field label="Current Password">
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" />
              <button onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="New Password">
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} placeholder="Minimum 8 characters" />
              <button onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password">
            <Input type="password" placeholder="Confirm new password" />
          </Field>
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton saved={saved} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} color={C.blue} />
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Two-Factor Authentication" icon={ShieldCheck} color={C.green} delay={160}>
        <div className="flex items-start gap-4 mt-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${C.green}14`, border: `1px solid ${C.green}28` }}>
            <Smartphone size={20} style={{ color: C.green }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Authenticator App</p>
            <p className="text-[11px] mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Add an extra layer of security with Google Authenticator or Authy
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95"
              style={{ background: `${C.green}14`, border: `1px solid ${C.green}30`, color: C.green }}>
              <ShieldCheck size={13} /> Enable 2FA
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </SectionCard>

      {/* active sessions */}
      <SectionCard title="Active Sessions" icon={Globe} color={C.amber} delay={240}>
        <div className="space-y-2 mt-4">
          {SESSIONS.map((s, i) => (
            <div key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: s.current ? `${C.amber}0C` : 'rgba(255,255,255,0.025)',
                border: `1px solid ${s.current ? C.amber + '28' : 'rgba(255,255,255,0.07)'}`,
                opacity: vis ? 1 : 0,
                transform: vis ? 'translateX(0)' : 'translateX(-8px)',
                transition: `opacity 0.4s ease ${0.28 + i * 0.07}s, transform 0.4s ease ${0.28 + i * 0.07}s`,
              }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.current ? `${C.amber}16` : 'rgba(255,255,255,0.05)', border: `1px solid ${s.current ? C.amber + '30' : 'rgba(255,255,255,0.09)'}` }}>
                <Smartphone size={13} style={{ color: s.current ? C.amber : 'rgba(255,255,255,0.35)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">{s.device}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.location} · {s.time}</p>
              </div>
              {s.current ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${C.green}14`, color: C.green, border: `1px solid ${C.green}28` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                  Current
                </span>
              ) : (
                <button className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: 'rgba(239,83,80,0.10)', border: '1px solid rgba(239,83,80,0.25)', color: C.red }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* danger zone */}
      <div className="rounded-2xl p-5"
        style={{
          background: 'rgba(239,83,80,0.06)',
          border: `1px solid rgba(239,83,80,0.20)`,
          opacity: vis ? 1 : 0,
          transform: vis ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.45s ease 0.36s, transform 0.5s ease 0.36s',
        }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: C.red }}>Danger Zone</h3>
        <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.38)' }}>These actions are irreversible. Proceed with care.</p>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
            style={{ background: 'rgba(239,83,80,0.10)', border: '1px solid rgba(239,83,80,0.28)', color: C.red }}>
            <LogOut size={13} /> Sign Out All Devices
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
            style={{ background: 'rgba(239,83,80,0.10)', border: '1px solid rgba(239,83,80,0.28)', color: C.red }}>
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main ─────────────────────────────────────────────────────── */
export default function RecruiterSettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const TABS: { id: Tab; label: string; icon: React.ElementType; color: string; badge?: string }[] = [
    { id: 'profile',       label: 'Profile',       icon: User,         color: C.blue   },
    { id: 'scouting',      label: 'Scouting',      icon: Search,       color: C.lime,  badge: 'New' },
    { id: 'notifications', label: 'Notifications', icon: Bell,         color: C.amber  },
    { id: 'privacy',       label: 'Privacy',       icon: Eye,          color: C.purple },
    { id: 'security',      label: 'Security',      icon: Shield,       color: C.green  },
  ];

  const activeColor = TABS.find(t => t.id === tab)?.color ?? C.blue;

  return (
    <div className="max-w-3xl space-y-5 pb-12">

      {/* ── hero header ──────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0B1728 0%,#0F1E2E 55%,#0B1F17 100%)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.19,1,0.22,1)',
        }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${activeColor}16 0%,transparent 68%)`, transition: 'background 0.4s' }} />
        <div className="px-6 sm:px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${activeColor}14`, border: `1px solid ${activeColor}30`, boxShadow: `0 0 24px ${activeColor}20`, transition: 'all 0.3s' }}>
            {(() => { const T = TABS.find(t => t.id === tab)!; return <T.icon size={20} style={{ color: activeColor }} />; })()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${C.green}14`, border: `1px solid ${C.green}30`, color: C.green }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                Scout Portal
              </span>
            </div>
            <p className="text-[12px] mt-0.5 transition-colors" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Manage your account, preferences, and scouting setup
            </p>
          </div>
        </div>
        <div className="mx-6 sm:mx-8 h-px"
          style={{ background: `linear-gradient(90deg,transparent,${activeColor}50 40%,transparent)`, transition: 'background 0.4s' }} />
        {/* tab bar inside hero */}
        <div className="px-6 sm:px-8 py-3 flex gap-1 overflow-x-auto scrollbar-hidden">
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all flex-shrink-0 relative"
                style={{
                  background: active ? `${t.color}18` : 'transparent',
                  border: `1px solid ${active ? t.color + '40' : 'transparent'}`,
                  color: active ? t.color : 'rgba(255,255,255,0.40)',
                  boxShadow: active ? `0 0 14px ${t.color}22` : 'none',
                }}>
                <t.icon size={13} />
                <span className="hidden sm:inline">{t.label}</span>
                {t.badge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full text-[8px] font-bold"
                    style={{ background: t.color, color: '#0C1A2B', lineHeight: 1.2 }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── tab content ──────────────────────────────────────── */}
      <div key={tab} style={{ animation: 'fadeSlideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) both' }}>
        <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
        {tab === 'profile'       && <ProfileTab saved={saved} setSaved={setSaved} />}
        {tab === 'scouting'      && <ScoutingTab saved={saved} setSaved={setSaved} />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'privacy'       && <PrivacyTab />}
        {tab === 'security'      && <SecurityTab />}
      </div>

    </div>
  );
}
