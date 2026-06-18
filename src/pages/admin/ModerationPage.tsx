import React, { useState } from 'react';
import {
  AlertTriangle, Shield, Clock, ChevronDown, ChevronUp,
  User, CheckCircle, XCircle, AlertCircle, Flag as FlagIcon, Lock,
  ArrowUpRight,
} from 'lucide-react';

type Tab = 'reports' | 'minors' | 'flagged';

interface Report {
  id: string;
  reporter: string;
  entityType: string;
  target: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'reviewing' | 'resolved' | 'escalated';
  isMinor: boolean;
  time: string;
}

const REPORTS: Report[] = [
  { id: 'r1', reporter: 'u_anon_1', entityType: 'User',    target: 'u_demo_8',    reason: 'Suspicious contact with minor account',   severity: 'critical', status: 'open',      isMinor: true,  time: '1h ago'  },
  { id: 'r2', reporter: 'u_anon_2', entityType: 'Profile', target: 'Marcus Silva', reason: 'Misleading performance statistics',        severity: 'medium',   status: 'reviewing', isMinor: false, time: '3h ago'  },
  { id: 'r3', reporter: 'u_anon_3', entityType: 'Content', target: 'media_3821',  reason: 'Inappropriate media content',              severity: 'high',     status: 'open',      isMinor: false, time: '5h ago'  },
  { id: 'r4', reporter: 'u_anon_4', entityType: 'User',    target: 'u_spam_99',   reason: 'Spam / automated profile',                 severity: 'low',      status: 'resolved',  isMinor: false, time: '2d ago'  },
];

const MINOR_FLAGS = [
  { id: 'm1', name: 'Jamie T.',  age: 16, guardian: 'Verified', contactFlags: 2, status: 'flagged', note: '2 adults sent unsolicited messages' },
  { id: 'm2', name: 'Hana Y.',   age: 15, guardian: 'Pending',  contactFlags: 0, status: 'pending', note: 'Guardian consent not yet confirmed' },
  { id: 'm3', name: 'Alex R.',   age: 17, guardian: 'Verified', contactFlags: 0, status: 'clear',   note: 'All safeguarding checks passed' },
];

const SEV_STYLE: Record<string, { color: string; bg: string }> = {
  critical: { color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
  high:     { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  medium:   { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)' },
  low:      { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  open:      { color: '#EF5350', bg: 'rgba(239,83,80,0.1)'   },
  reviewing: { color: '#F5A623', bg: 'rgba(245,166,35,0.1)'  },
  resolved:  { color: '#1FB57A', bg: 'rgba(31,181,122,0.1)'  },
  escalated: { color: '#B8F135', bg: 'rgba(184,241,53,0.1)'  },
};

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'reports', label: 'Reports Queue',       icon: FlagIcon,      color: '#EF5350' },
  { key: 'minors',  label: 'Minor Safeguarding',  icon: Shield,        color: '#F5A623' },
  { key: 'flagged', label: 'Flagged Profiles',    icon: AlertCircle,   color: '#9DB0C6' },
];

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: bg, color }}>{label}</span>;
}

function ConfirmDialog({ action, target, onConfirm, onCancel }: {
  action: string; target: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.15)' }}>
            <AlertTriangle size={14} style={{ color: '#F5A623' }} />
          </div>
          <p className="font-bold text-white text-sm">{action}: {target}</p>
        </div>
        <p className="text-xs mb-3" style={{ color: '#9DB0C6' }}>This action will be logged to the immutable audit trail.</p>
        <label className="block text-[10px] font-semibold mb-1" style={{ color: '#9DB0C6' }}>Reason (required)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
          placeholder="Provide a clear reason for this action…"
          className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none resize-none mb-4"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-xs font-semibold hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#9DB0C6' }}>Cancel</button>
          <button onClick={() => reason.trim() && onConfirm(reason)} disabled={!reason.trim()}
            className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: '#EF5350', color: 'white' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>('reports');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: string; target: string } | null>(null);

  const openReports = REPORTS.filter(r => r.status === 'open' || r.status === 'reviewing').length;
  const minorFlags  = MINOR_FLAGS.filter(m => m.status === 'flagged' || m.status === 'pending').length;

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes modalIn  { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        @keyframes pulseBadge { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.15); } }
        .row-in { animation: rowSlideIn 0.3s ease both; }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Moderation & Safeguarding</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Reports queue · Minor safeguarding · All actions logged to audit trail
            </p>
          </div>
          {openReports > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)', animation: 'pulseBadge 2s infinite' }}>
              <AlertTriangle size={12} />
              {openReports} OPEN REPORT{openReports > 1 ? 'S' : ''}
            </div>
          )}
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open Reports',  value: openReports, color: '#EF5350', icon: FlagIcon,     bg: 'rgba(239,83,80,0.1)' },
            { label: 'Minor Flags',   value: minorFlags,  color: '#F5A623', icon: Shield,       bg: 'rgba(245,166,35,0.1)' },
            { label: 'Resolved (7d)', value: 24,          color: '#1FB57A', icon: CheckCircle,  bg: 'rgba(31,181,122,0.1)' },
            { label: 'Escalated',     value: 2,           color: '#B8F135', icon: AlertCircle,  bg: 'rgba(184,241,53,0.1)' },
          ].map((s, i) => (
            <div key={s.label} className="rounded-xl p-4 row-in" style={{ background: '#0F1E32', border: `1px solid rgba(255,255,255,0.07)`, animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={13} style={{ color: s.color }} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Minor safeguarding notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,83,80,0.06)', border: '1px solid rgba(239,83,80,0.2)' }}>
          <Lock size={14} style={{ color: '#EF5350', flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <strong className="text-white">Minor Safeguarding:</strong> All accounts with age &lt; 18 require verified guardian consent. Any unsolicited adult↔minor contact is flagged for immediate review. Medical data access by minors is restricted.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center"
              style={{
                background: tab === t.key ? '#0F1E32' : 'transparent',
                color: tab === t.key ? t.color : '#9DB0C6',
                boxShadow: tab === t.key ? '0 1px 8px rgba(0,0,0,0.3)' : 'none',
              }}>
              <t.icon size={13} />{t.label}
            </button>
          ))}
        </div>

        {/* Reports tab */}
        {tab === 'reports' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '80px 1fr 1fr 80px 90px 80px 130px' }}>
              <span>Type</span><span>Target</span><span>Reason</span><span>Severity</span><span>Status</span><span>Time</span><span>Actions</span>
            </div>
            {REPORTS.map((r, i) => (
              <React.Fragment key={r.id}>
                <div
                  className="grid px-4 py-3.5 items-center text-xs cursor-pointer group row-in"
                  style={{
                    gridTemplateColumns: '80px 1fr 1fr 80px 90px 80px 130px',
                    background: r.isMinor ? 'rgba(239,83,80,0.06)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: r.severity === 'critical' ? '3px solid #EF5350' : r.severity === 'high' ? '3px solid #F5A623' : '3px solid transparent',
                    animationDelay: `${i * 0.04}s`,
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = r.isMinor ? 'rgba(239,83,80,0.06)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)'; }}
                >
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: '#9DB0C6' }}>{r.entityType}</span>
                    {r.isMinor && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(239,83,80,0.15)', color: '#EF5350' }}>
                        <Shield size={8} />MINOR
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium truncate">{r.target}</span>
                  <span className="truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.reason}</span>
                  <Chip label={r.severity} {...SEV_STYLE[r.severity]} />
                  <Chip label={r.status} {...STATUS_STYLE[r.status]} />
                  <span style={{ color: '#9DB0C6' }}>{r.time}</span>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setConfirm({ action: 'Warn', target: r.target })}
                      className="px-2 py-1 rounded text-[10px] font-semibold hover:bg-amber-500/20 transition-colors"
                      style={{ color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>Warn</button>
                    <button onClick={() => setConfirm({ action: 'Suspend', target: r.target })}
                      className="px-2 py-1 rounded text-[10px] font-semibold hover:bg-red-500/20 transition-colors"
                      style={{ color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}>Suspend</button>
                    {expanded === r.id ? <ChevronUp size={12} style={{ color: '#9DB0C6' }} /> : <ChevronDown size={12} style={{ color: '#9DB0C6' }} />}
                  </div>
                </div>
                {expanded === r.id && (
                  <div className="px-6 py-4 text-xs" style={{ background: 'rgba(47,128,237,0.04)', borderTop: '1px solid rgba(255,255,255,0.04)', animation: 'fadeIn 0.2s ease' }}>
                    <div className="flex items-center gap-4 mb-3">
                      <p style={{ color: '#9DB0C6' }}>Reporter: <span className="text-white font-medium">{r.reporter}</span></p>
                      <p style={{ color: '#9DB0C6' }}>Time: <span className="text-white">{r.time}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors" style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Resolve</button>
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-amber-500/20 transition-colors" style={{ color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>Request More Info</button>
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-blue-500/20 transition-colors" style={{ color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>Escalate</button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Minors tab */}
        {tab === 'minors' && (
          <div className="space-y-3" style={{ animation: 'fadeIn 0.3s ease' }}>
            {MINOR_FLAGS.map((m, i) => {
              const borderColor = m.status === 'flagged' ? '#EF5350' : m.status === 'pending' ? '#F5A623' : 'rgba(255,255,255,0.07)';
              const accentColor = m.status === 'flagged' ? '#EF5350' : m.status === 'pending' ? '#F5A623' : '#1FB57A';
              return (
                <div key={m.id}
                  className="rounded-2xl p-4 row-in"
                  style={{ background: '#0F1E32', border: `1px solid ${borderColor}`, borderLeft: `3px solid ${accentColor}`, animationDelay: `${i * 0.07}s` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: m.status === 'flagged' ? 'rgba(239,83,80,0.15)' : m.status === 'pending' ? 'rgba(245,166,35,0.12)' : 'rgba(31,181,122,0.12)' }}>
                        <User size={16} style={{ color: accentColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {m.name}{' '}
                          <span className="text-[11px] font-normal px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#9DB0C6' }}>Age {m.age}</span>
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>
                          Guardian: <span style={{ color: m.guardian === 'Verified' ? '#1FB57A' : '#F5A623' }}>{m.guardian}</span>
                          {' · '}Contact flags: <span style={{ color: m.contactFlags > 0 ? '#EF5350' : '#1FB57A', fontWeight: 600 }}>{m.contactFlags}</span>
                        </p>
                      </div>
                    </div>
                    <Chip
                      label={m.status}
                      color={m.status === 'flagged' ? '#EF5350' : m.status === 'pending' ? '#F5A623' : '#1FB57A'}
                      bg={m.status === 'flagged' ? 'rgba(239,83,80,0.12)' : m.status === 'pending' ? 'rgba(245,166,35,0.12)' : 'rgba(31,181,122,0.12)'}
                    />
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.note}</p>
                  {m.status !== 'clear' && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors" style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Review & Clear</button>
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-red-500/20 transition-colors" style={{ color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}>Restrict Account</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Flagged profiles tab */}
        {tab === 'flagged' && (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.3s ease' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(157,176,198,0.1)' }}>
              <AlertCircle size={22} style={{ color: '#9DB0C6' }} />
            </div>
            <p className="text-sm text-white font-semibold mb-1">No Flagged Profiles</p>
            <p className="text-xs" style={{ color: '#9DB0C6' }}>No profiles currently flagged for content violations.</p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px]" style={{ color: '#1FB57A' }}>
              <CheckCircle size={11} />All clear
              <ArrowUpRight size={11} />
            </div>
          </div>
        )}

        {confirm && (
          <ConfirmDialog
            action={confirm.action}
            target={confirm.target}
            onConfirm={(reason) => { console.log('Action:', confirm.action, 'Reason:', reason); setConfirm(null); }}
            onCancel={() => setConfirm(null)}
          />
        )}
      </div>
    </>
  );
}
