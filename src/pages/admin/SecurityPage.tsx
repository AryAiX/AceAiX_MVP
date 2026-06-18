import React, { useState } from 'react';
import {
  Shield, Search, AlertTriangle, Lock, FileText, Download,
  Eye, CheckCircle, XCircle, Heart, Database,
  Globe, Trash2,
} from 'lucide-react';

type Tab = 'audit' | 'alerts' | 'consent' | 'gdpr';

const AUDIT = [
  { id: 'al1',  actor: 'admin@aceaix.com',  action: 'user.suspend',          entity: 'user:u_demo_4',           reason: 'Repeated TOS violation',     ip: '10.0.1.12',  time: '2026-06-18 14:32', sensitive: false },
  { id: 'al2',  actor: 'admin@aceaix.com',  action: 'verification.approve',  entity: 'org:fc_madrid_academy',   reason: 'Documents verified',          ip: '10.0.1.12',  time: '2026-06-18 14:28', sensitive: false },
  { id: 'al3',  actor: 'system',            action: 'medical.record.view',   entity: 'athlete:a_marcus',        reason: 'Partner clearance request',   ip: 'system',     time: '2026-06-18 13:55', sensitive: true  },
  { id: 'al4',  actor: 'admin@aceaix.com',  action: 'feature_flag.update',   entity: 'flag:live_scores',        reason: 'Rollout to 50%',              ip: '10.0.1.12',  time: '2026-06-18 12:44', sensitive: false },
  { id: 'al5',  actor: 'admin2@aceaix.com', action: 'refund.issue',          entity: 'payment:pay_3812',        reason: 'Customer dispute',            ip: '10.0.1.34',  time: '2026-06-18 11:10', sensitive: false },
  { id: 'al6',  actor: 'system',            action: 'medical.record.export', entity: 'athlete:a_priya',         reason: 'GDPR data export request',    ip: 'system',     time: '2026-06-18 10:05', sensitive: true  },
  { id: 'al7',  actor: 'admin@aceaix.com',  action: 'user.delete',           entity: 'user:u_test_999',         reason: 'GDPR erasure request',        ip: '10.0.1.12',  time: '2026-06-17 16:50', sensitive: false },
  { id: 'al8',  actor: 'admin2@aceaix.com', action: 'payout.approve',        entity: 'payout:po_scoutnet',      reason: 'Monthly commission cycle',    ip: '10.0.1.34',  time: '2026-06-17 14:20', sensitive: false },
  { id: 'al9',  actor: 'system',            action: 'league.sync',           entity: 'provider:api-football',   reason: 'Scheduled sync job',          ip: 'system',     time: '2026-06-17 12:00', sensitive: false },
  { id: 'al10', actor: 'admin@aceaix.com',  action: 'scope.change',          entity: 'staff:admin2@aceaix.com', reason: 'Granted finance scope',       ip: '10.0.1.12',  time: '2026-06-17 09:30', sensitive: true  },
];

const SECURITY_ALERTS = [
  { id: 'sa1', severity: 'critical', title: '3 failed login attempts from unknown IP',       detail: 'IP: 185.220.101.42 · admin@aceaix.com · Jun 18 14:55',           time: '5m ago' },
  { id: 'sa2', severity: 'high',     title: 'Medical record accessed outside partner hours', detail: 'actor: partner:medtech_p3 · athlete: a_carlos · 02:14 UTC',      time: '3h ago' },
  { id: 'sa3', severity: 'medium',   title: 'Unusual bulk export from scout account',        detail: '1,200 athlete records exported in 4 min · user: u_scout_88',     time: '6h ago' },
  { id: 'sa4', severity: 'low',      title: 'New admin staff account created',               detail: 'actor: admin@aceaix.com · new: admin3@aceaix.com',               time: '1d ago' },
];

const CONSENT = [
  { id: 'c1', user: 'Marcus Silva', type: 'Medical Data', granted: true,  date: '2026-01-15', guardian: false },
  { id: 'c2', user: 'Aisha Mensah', type: 'Medical Data', granted: true,  date: '2026-02-20', guardian: false },
  { id: 'c3', user: 'Lena Fischer', type: 'Medical Data', granted: false, date: '2026-03-10', guardian: false },
  { id: 'c4', user: 'Jin-ho Park',  type: 'AI Analysis',  granted: true,  date: '2026-04-05', guardian: false },
  { id: 'c5', user: 'Priya Nair',   type: 'Marketing',    granted: false, date: '2026-03-01', guardian: false },
  { id: 'c6', user: 'Kai Nakamura', type: 'Medical Data', granted: true,  date: '2026-05-12', guardian: true  },
];

const GDPR_REQUESTS = [
  { id: 'g1', user: 'user_legacy_44', type: 'Export',  status: 'completed', submitted: '2026-06-10', completed: '2026-06-12', hasMedical: false },
  { id: 'g2', user: 'u_test_999',     type: 'Erasure', status: 'completed', submitted: '2026-06-14', completed: '2026-06-17', hasMedical: false },
  { id: 'g3', user: 'athlete_5512',   type: 'Export',  status: 'pending',   submitted: '2026-06-16', completed: null,         hasMedical: true  },
  { id: 'g4', user: 'scout_org_28',   type: 'Erasure', status: 'reviewing', submitted: '2026-06-17', completed: null,         hasMedical: false },
];

const SEV_STYLE: Record<string, { color: string; bg: string }> = {
  critical: { color: '#EF5350', bg: 'rgba(239,83,80,0.12)'  },
  high:     { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  medium:   { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)' },
  low:      { color: '#9DB0C6', bg: 'rgba(157,176,198,0.1)' },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  completed: { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' },
  pending:   { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  reviewing: { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)' },
};

const ACTION_COLORS: Record<string, string> = {
  'user.suspend':          '#EF5350',
  'verification.approve':  '#1FB57A',
  'medical.record.view':   '#F5A623',
  'medical.record.export': '#EF5350',
  'feature_flag.update':   '#2F80ED',
  'refund.issue':          '#F5A623',
  'user.delete':           '#EF5350',
  'payout.approve':        '#1FB57A',
  'scope.change':          '#B8F135',
  'league.sync':           '#2F80ED',
};

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'audit',   label: 'Audit Log',  icon: FileText,     color: '#2F80ED' },
  { key: 'alerts',  label: 'Alerts',     icon: AlertTriangle,color: '#EF5350' },
  { key: 'consent', label: 'Consent',    icon: CheckCircle,  color: '#1FB57A' },
  { key: 'gdpr',    label: 'GDPR',       icon: Globe,        color: '#F5A623' },
];

function SevChip({ sev }: { sev: string }) {
  const s = SEV_STYLE[sev] ?? SEV_STYLE.low;
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={s}>{sev}</span>;
}

function StatChip({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { color: '#9DB0C6', bg: 'rgba(157,176,198,0.1)' };
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={s}>{status}</span>;
}

export default function SecurityPage() {
  const [tab, setTab] = useState<Tab>('audit');
  const [query, setQuery] = useState('');

  const filteredAudit = AUDIT.filter(a =>
    !query || a.actor.includes(query) || a.action.includes(query) || a.entity.includes(query)
  );

  const criticalAlerts = SECURITY_ALERTS.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        @keyframes pulseBadge { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        .row-in { animation: rowSlideIn 0.3s ease both; }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Immutable audit log · Security alerts · Consent dashboard · GDPR requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            {criticalAlerts > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)', animation: 'pulseBadge 2s infinite' }}>
                <AlertTriangle size={12} />{criticalAlerts} CRITICAL
              </div>
            )}
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
              <Download size={13} />Export Audit CSV
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open Alerts',       value: '3',     color: '#EF5350', icon: AlertTriangle },
            { label: 'Audit Events (7d)', value: '284',   color: '#2F80ED', icon: Shield        },
            { label: 'Consent Records',   value: '9,821', color: '#1FB57A', icon: CheckCircle   },
            { label: 'GDPR Pending',      value: '2',     color: '#F5A623', icon: Globe         },
          ].map((s, i) => (
            <div key={s.label} className="rounded-xl p-4 row-in" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={13} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Medical guard notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,83,80,0.06)', border: '1px solid rgba(239,83,80,0.2)' }}>
          <Heart size={14} style={{ color: '#EF5350', flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <strong className="text-white">Medical data guard:</strong> All access to athlete health records is logged with actor, timestamp, and stated purpose. Medical exports require dual admin sign-off and are marked sensitive in audit.
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

        {/* Audit Log */}
        {tab === 'audit' && (
          <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="relative max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9DB0C6' }} />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Filter by actor, action, entity..."
                className="w-full rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '130px 160px 190px 1fr 80px 110px' }}>
                <span>Time</span><span>Actor</span><span>Action</span><span>Entity</span><span>Sensitive</span><span>IP</span>
              </div>
              {filteredAudit.map((a, i) => (
                <div key={a.id} className="group grid px-4 py-3 items-center text-xs row-in"
                  style={{
                    gridTemplateColumns: '130px 160px 190px 1fr 80px 110px',
                    background: a.sensitive ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: a.sensitive ? '2px solid rgba(239,83,80,0.5)' : '2px solid transparent',
                    animationDelay: `${i * 0.025}s`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = a.sensitive ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)'}
                >
                  <span style={{ color: '#9DB0C6' }}>{a.time}</span>
                  <span className="text-white truncate font-medium">{a.actor}</span>
                  <code className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: `${ACTION_COLORS[a.action] ?? '#2F80ED'}15`, color: ACTION_COLORS[a.action] ?? '#2F80ED' }}>
                    {a.action}
                  </code>
                  <span className="truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.entity}</span>
                  {a.sensitive
                    ? <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#EF5350' }}><Lock size={10} />Sensitive</span>
                    : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                  <code className="text-[10px] font-mono" style={{ color: '#9DB0C6' }}>{a.ip}</code>
                </div>
              ))}
              <div className="px-4 py-2 text-[11px] flex items-center gap-1.5" style={{ background: '#0A1828', color: '#9DB0C6', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Lock size={10} style={{ color: '#2F80ED' }} />
                Audit log is append-only. No entry can be modified or deleted.
              </div>
            </div>
          </div>
        )}

        {/* Security Alerts */}
        {tab === 'alerts' && (
          <div className="space-y-3" style={{ animation: 'fadeIn 0.3s ease' }}>
            {SECURITY_ALERTS.map((a, i) => {
              const s = SEV_STYLE[a.severity] ?? SEV_STYLE.low;
              return (
                <div key={a.id} className="rounded-2xl p-4 row-in group cursor-default"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.color}22`,
                    borderLeft: `3px solid ${s.color}`,
                    animationDelay: `${i * 0.07}s`,
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${s.color}18`}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${s.color}20` }}>
                        <AlertTriangle size={13} style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{a.title}</p>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{a.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SevChip sev={a.severity} />
                      <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{a.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Consent */}
        {tab === 'consent' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 140px 90px 110px 110px' }}>
              <span>User</span><span>Consent Type</span><span>Status</span><span>Date</span><span>Guardian</span>
            </div>
            {CONSENT.map((c, i) => (
              <div key={c.id} className="grid px-4 py-3.5 items-center text-xs row-in"
                style={{
                  gridTemplateColumns: '1fr 140px 90px 110px 110px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <span className="text-white font-medium">{c.user}</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold inline-flex"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#9DB0C6' }}>{c.type}</span>
                {c.granted
                  ? <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#1FB57A' }}><CheckCircle size={11} />Granted</span>
                  : <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#EF5350' }}><XCircle size={11} />Withheld</span>}
                <span style={{ color: '#9DB0C6' }}>{c.date}</span>
                {c.guardian
                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                      <Shield size={9} />REQUIRED
                    </span>
                  : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
              </div>
            ))}
          </div>
        )}

        {/* GDPR */}
        {tab === 'gdpr' && (
          <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(47,128,237,0.07)', border: '1px solid rgba(47,128,237,0.2)' }}>
              <Database size={14} style={{ color: '#2F80ED', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Data residency: <strong className="text-white">EU (Frankfurt)</strong> primary ·
                Retention: athlete data 7y post-deletion, medical records 10y as per applicable law.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 80px 100px 110px 110px 130px' }}>
                <span>User</span><span>Type</span><span>Status</span><span>Submitted</span><span>Completed</span><span>Actions</span>
              </div>
              {GDPR_REQUESTS.map((r, i) => (
                <div key={r.id} className="grid px-4 py-3.5 items-center text-xs row-in"
                  style={{
                    gridTemplateColumns: '1fr 80px 100px 110px 110px 130px',
                    background: r.status === 'pending' ? 'rgba(245,166,35,0.03)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    animationDelay: `${i * 0.07}s`,
                  }}>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{r.user}</span>
                    {r.hasMedical && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,83,80,0.12)', color: '#EF5350' }}>
                        <Heart size={8} />MEDICAL
                      </span>
                    )}
                  </div>
                  <span className="font-semibold" style={{ color: r.type === 'Erasure' ? '#EF5350' : '#2F80ED' }}>{r.type}</span>
                  <StatChip status={r.status} />
                  <span style={{ color: '#9DB0C6' }}>{r.submitted}</span>
                  <span style={{ color: '#9DB0C6' }}>{r.completed ?? '—'}</span>
                  <div className="flex gap-1">
                    {r.status === 'pending' && (
                      <>
                        <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-blue-500/20"
                          style={{ color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
                          <Eye size={10} />
                        </button>
                        {r.type === 'Export'
                          ? <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-emerald-500/20"
                              style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Export</button>
                          : <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-red-500/20 flex items-center gap-1"
                              style={{ color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}><Trash2 size={9} />Erase</button>}
                      </>
                    )}
                    {r.status === 'reviewing' && (
                      <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-amber-500/20"
                        style={{ color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>Review</button>
                    )}
                    {r.status === 'completed' && (
                      <span className="text-[10px]" style={{ color: '#1FB57A' }}>Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
