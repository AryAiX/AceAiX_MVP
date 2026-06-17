import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Eye, EyeOff, Save, Check,
  Camera, Lock, Globe, Zap, ChevronRight, ShieldCheck,
  Smartphone, AlertTriangle, LogOut, Trash2, KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── Color map ──────────────────────────────────────────── */
const TAB_META = {
  profile:       { color: '#2F80ED', bg: 'rgba(47,128,237,0.1)',   border: 'rgba(47,128,237,0.25)'  },
  notifications: { color: '#B8F135', bg: 'rgba(184,241,53,0.1)',  border: 'rgba(184,241,53,0.25)'  },
  privacy:       { color: '#1FB57A', bg: 'rgba(31,181,122,0.1)',  border: 'rgba(31,181,122,0.25)'  },
  security:      { color: '#EF5350', bg: 'rgba(239,83,80,0.1)',   border: 'rgba(239,83,80,0.25)'   },
} as const;

type TabId = keyof typeof TAB_META;

const TABS = [
  { id: 'profile'       as TabId, label: 'Profile',       icon: <User size={15} />      },
  { id: 'notifications' as TabId, label: 'Notifications', icon: <Bell size={15} />      },
  { id: 'privacy'       as TabId, label: 'Privacy',       icon: <Globe size={15} />     },
  { id: 'security'      as TabId, label: 'Security',      icon: <Shield size={15} />    },
];

/* ─── Toggle switch ──────────────────────────────────────── */
function Toggle({ on, onChange, color }: { on: boolean; onChange: () => void; color: string }) {
  return (
    <div onClick={onChange}
      className="relative flex-shrink-0 cursor-pointer rounded-full transition-all duration-300"
      style={{
        width: 44, height: 24,
        background: on ? color : 'rgba(255,255,255,0.08)',
        border: `1px solid ${on ? color : 'rgba(255,255,255,0.12)'}`,
        boxShadow: on ? `0 0 12px ${color}40` : 'none',
      }}>
      <div className="absolute top-0.5 rounded-full transition-all duration-300"
        style={{
          width: 19, height: 19,
          background: on ? 'white' : 'rgba(255,255,255,0.35)',
          left: on ? 22 : 2,
          boxShadow: on ? `0 2px 6px ${color}60` : 'none',
        }} />
    </div>
  );
}

/* ─── Row for toggle settings ────────────────────────────── */
function ToggleRow({
  label, desc, defaultOn, color, icon,
}: { label: string; desc: string; defaultOn: boolean; color: string; icon?: React.ReactNode }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3.5 group"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
            style={{ background: on ? `${color}15` : 'rgba(255,255,255,0.04)', color: on ? color : 'rgba(255,255,255,0.3)' }}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        <Toggle on={on} onChange={() => setOn(!on)} color={color} />
      </div>
    </div>
  );
}

/* ─── Styled input ───────────────────────────────────────── */
function Field({
  label, defaultValue = '', type = 'text', placeholder = '', color, rows,
}: { label: string; defaultValue?: string; type?: string; placeholder?: string; color: string; rows?: number }) {
  const [focused, setFocused] = useState(false);
  const props = {
    defaultValue, type, placeholder,
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    style: {
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${focused ? color : 'rgba(255,255,255,0.08)'}`,
      color: 'white',
      outline: 'none',
      borderRadius: 12,
      padding: rows ? '10px 14px' : '9px 14px',
      fontSize: 13,
      width: '100%',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: focused ? `0 0 0 3px ${color}15` : 'none',
      resize: 'none' as const,
    },
  };
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</label>
      {rows
        ? <textarea rows={rows} {...props} />
        : <input {...props} />
      }
    </div>
  );
}

/* ─── Password field ─────────────────────────────────────── */
function PasswordField({ label, placeholder, color }: { label: string; placeholder: string; color: string }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? color : 'rgba(255,255,255,0.08)'}`,
            color: 'white',
            outline: 'none',
            borderRadius: 12,
            padding: '9px 40px 9px 14px',
            fontSize: 13,
            width: '100%',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? `0 0 0 3px ${color}15` : 'none',
          }} />
        <button onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: show ? color : 'rgba(255,255,255,0.3)' }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Save button ────────────────────────────────────────── */
function SaveBtn({ onClick, saved, color, label = 'Save Changes', savedLabel = 'Saved!' }: {
  onClick: () => void; saved: boolean; color: string; label?: string; savedLabel?: string;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
      style={{
        background: saved ? 'rgba(31,181,122,0.15)' : color,
        color: saved ? '#1FB57A' : (color === '#B8F135' ? '#0C1A2B' : 'white'),
        border: saved ? '1px solid rgba(31,181,122,0.3)' : 'none',
        boxShadow: saved ? 'none' : `0 4px 16px ${color}40`,
      }}>
      {saved ? <Check size={14} /> : <Save size={14} />}
      {saved ? savedLabel : label}
    </button>
  );
}

/* ─── Section wrapper ────────────────────────────────────── */
function Section({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{
        background: '#0F2133',
        border: `1px solid ${color}18`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.25)`,
        animation: 'fadeSlideIn 0.35s ease both',
      }}>
      <div className="flex items-center gap-2 pb-1"
        style={{ borderBottom: `1px solid ${color}15` }}>
        <div className="w-1 h-4 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function SettingsPage() {
  const { profile } = useAuth();
  const [tab, setTab]         = useState<TabId>('profile');
  const [saved, setSaved]     = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  const meta = TAB_META[tab];

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseOrb    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.1);opacity:0.9} }
      `}</style>

      <div className={`max-w-3xl space-y-5 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* ── Hero header ──────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg,#0D1F33 0%,#132A44 60%,#0A1825 100%)',
            border: `1px solid ${meta.color}25`,
            transition: 'border-color 0.4s',
            animation: 'fadeSlideIn 0.4s ease both',
          }}>
          {/* animated bg orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle,${meta.color}18 0%,transparent 70%)`, animation: 'pulseOrb 5s ease-in-out infinite', transition: 'background 0.4s' }} />
          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ background: `${meta.color}15`, border: `1.5px solid ${meta.color}30`, boxShadow: `0 0 20px ${meta.color}20` }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="text-xl font-black" style={{ color: meta.color }}>{profile?.full_name?.charAt(0) ?? '?'}</span>
                  }
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}60` }}>
                  <Camera size={10} style={{ color: meta.color === '#B8F135' ? '#0C1A2B' : 'white' }} />
                </button>
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-none mb-0.5">{profile?.full_name ?? 'Your Name'}</h1>
                <p className="text-xs capitalize font-semibold" style={{ color: meta.color }}>{profile?.role ?? 'Athlete'}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{profile?.email}</p>
              </div>
            </div>
            {/* Verification chip */}
            {profile?.is_verified && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(31,181,122,0.1)', border: '1px solid rgba(31,181,122,0.25)' }}>
                <ShieldCheck size={13} style={{ color: '#1FB57A' }} />
                <span className="text-xs font-bold" style={{ color: '#1FB57A' }}>Verified</span>
              </div>
            )}
          </div>
          {/* Gradient sweep */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(90deg,transparent,${meta.color}04,transparent)`, backgroundSize: '400% 100%', animation: 'gradShift 6s ease infinite', transition: 'background 0.4s' }} />
        </div>

        {/* ── Tab bar ──────────────────────────────── */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(t => {
            const m = TAB_META[t.id];
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? m.bg : 'transparent',
                  color: active ? m.color : 'rgba(255,255,255,0.3)',
                  border: active ? `1px solid ${m.border}` : '1px solid transparent',
                  boxShadow: active ? `0 2px 12px ${m.color}20` : 'none',
                }}>
                <span style={{ color: active ? m.color : 'rgba(255,255,255,0.3)' }}>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Profile tab ──────────────────────────── */}
        {tab === 'profile' && (
          <div className="space-y-4" style={{ animation: 'fadeSlideIn 0.35s ease both' }}>
            <Section title="Profile Information" color={meta.color}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"  defaultValue={profile?.full_name ?? ''}  color={meta.color} />
                <Field label="Email"      defaultValue={profile?.email ?? ''}       color={meta.color} type="email" />
                <Field label="Phone"      placeholder="+971 50 000 0000"            color={meta.color} />
                <Field label="City"       defaultValue={profile?.city ?? ''}        color={meta.color} />
              </div>
              <Field label="Bio" defaultValue={profile?.bio ?? ''} placeholder="Tell scouts about yourself..." color={meta.color} rows={3} />
              <div className="flex justify-end pt-1">
                <SaveBtn onClick={handleSave} saved={saved} color={meta.color} />
              </div>
            </Section>

            {/* Profile completeness */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(47,128,237,0.05)', border: '1px solid rgba(47,128,237,0.15)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: '#B8F135' }} />
                  <span className="text-xs font-bold text-white">Profile Completeness</span>
                </div>
                <span className="text-xs font-black" style={{ color: '#B8F135' }}>65%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg,#2F80ED,#B8F135)', boxShadow: '0 0 8px rgba(184,241,53,0.4)' }} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: 'Medical badge', done: false },
                  { label: 'Highlights uploaded', done: true },
                  { label: 'Coach endorsement', done: false },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[10px]"
                    style={{ color: item.done ? '#1FB57A' : 'rgba(255,255,255,0.3)' }}>
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: item.done ? 'rgba(31,181,122,0.2)' : 'rgba(255,255,255,0.05)' }}>
                      {item.done ? <Check size={8} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Notifications tab ────────────────────── */}
        {tab === 'notifications' && (
          <div style={{ animation: 'fadeSlideIn 0.35s ease both' }}>
            <Section title="Notification Preferences" color={meta.color}>
              {[
                { label: 'Scout views your profile',     desc: 'Get notified when a recruiter visits your profile',          defaultOn: true,  icon: <Eye size={13} />      },
                { label: 'New contact request',          desc: 'Receive alerts for incoming scout messages',                 defaultOn: true,  icon: <Bell size={13} />     },
                { label: 'AI score updated',             desc: 'When your AI performance score changes significantly',       defaultOn: true,  icon: <Zap size={13} />      },
                { label: 'Medical record verified',      desc: 'Confirmation when a partner verifies your records',         defaultOn: true,  icon: <ShieldCheck size={13} /> },
                { label: 'New opportunities',            desc: 'Trials, contracts, and scholarships matching your profile',  defaultOn: false, icon: <ChevronRight size={13} /> },
                { label: 'Weekly digest',                desc: 'A summary of your profile activity each week',              defaultOn: false, icon: <Globe size={13} />    },
              ].map(item => (
                <ToggleRow key={item.label} {...item} color={meta.color} />
              ))}
              <div className="flex justify-end pt-2">
                <SaveBtn onClick={handleSave} saved={saved} color={meta.color} label="Save Preferences" />
              </div>
            </Section>
          </div>
        )}

        {/* ── Privacy tab ──────────────────────────── */}
        {tab === 'privacy' && (
          <div style={{ animation: 'fadeSlideIn 0.35s ease both' }}>
            <Section title="Privacy Controls" color={meta.color}>
              {[
                { label: 'Public profile discovery',     desc: 'Allow your profile to appear in the public Discover page',      defaultOn: true,  icon: <Globe size={13} />      },
                { label: 'Show AI score publicly',       desc: 'Display your AI performance score on your public profile',      defaultOn: true,  icon: <Zap size={13} />        },
                { label: 'Allow scout contact',          desc: 'Let verified platform scouts send you messages',                defaultOn: true,  icon: <Bell size={13} />       },
                { label: 'Medical clearance badge',      desc: 'Display your verified clearance badge on your profile',        defaultOn: false, icon: <ShieldCheck size={13} /> },
                { label: 'Show club affiliation',        desc: 'Display your current club on your public profile',             defaultOn: true,  icon: <User size={13} />       },
              ].map(item => (
                <ToggleRow key={item.label} {...item} color={meta.color} />
              ))}
              <div className="flex justify-end pt-2">
                <SaveBtn onClick={handleSave} saved={saved} color={meta.color} label="Save Privacy Settings" />
              </div>
            </Section>
          </div>
        )}

        {/* ── Security tab ─────────────────────────── */}
        {tab === 'security' && (
          <div className="space-y-4" style={{ animation: 'fadeSlideIn 0.35s ease both' }}>
            <Section title="Change Password" color={meta.color}>
              <div className="space-y-4">
                <PasswordField label="Current Password"     placeholder="Enter current password"  color={meta.color} />
                <PasswordField label="New Password"         placeholder="Minimum 8 characters"    color={meta.color} />
                <PasswordField label="Confirm New Password" placeholder="Re-enter new password"   color={meta.color} />
              </div>
              <div className="flex justify-end pt-1">
                <SaveBtn onClick={handleSave} saved={saved} color={meta.color} label="Update Password" savedLabel="Updated!" />
              </div>
            </Section>

            {/* Active sessions */}
            <Section title="Active Sessions" color={meta.color}>
              {[
                { device: 'iPhone 15 Pro · Safari',       location: 'Dubai, UAE',   current: true  },
                { device: 'MacBook Pro · Chrome',         location: 'Dubai, UAE',   current: false },
                { device: 'Samsung Galaxy · Chrome',      location: 'Abu Dhabi, UAE', current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: s.current ? `${meta.color}15` : 'rgba(255,255,255,0.05)', color: s.current ? meta.color : 'rgba(255,255,255,0.3)' }}>
                      <Smartphone size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{s.device}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.location}</p>
                    </div>
                  </div>
                  {s.current
                    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}>Current</span>
                    : <button className="text-[10px] font-semibold transition-colors"
                        style={{ color: 'rgba(239,83,80,0.7)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#EF5350')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,83,80,0.7)')}>
                        <LogOut size={13} />
                      </button>
                  }
                </div>
              ))}
            </Section>

            {/* Danger zone */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(239,83,80,0.05)', border: '1px solid rgba(239,83,80,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={15} style={{ color: '#EF5350' }} />
                <h2 className="text-sm font-bold" style={{ color: '#EF5350' }}>Danger Zone</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
                  <KeyRound size={13} /> Reset All Sessions
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
                  <Trash2 size={13} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
