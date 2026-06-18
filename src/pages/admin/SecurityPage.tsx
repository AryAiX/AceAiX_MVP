import React, { useState } from 'react';
import {
  Shield, Search, AlertTriangle, Lock, FileText, Download,
  Eye, CheckCircle, XCircle, Clock, Heart, Database,
  Globe, UserX, Trash2, Filter,
} from 'lucide-react';

type Tab = 'audit' | 'alerts' | 'consent' | 'gdpr';

// ── Audit log entries ─────────────────────────────────────────────────────────

const AUDIT = [
  { id: 'al1', actor: 'admin@aceaix.com',  action: 'user.suspend',         entity: 'user:u_demo_4',            reason: 'Repeated TOS violation',        ip: '10.0.1.12',  time: '2026-06-18 14:32', sensitive: false },
  { id: 'al2', actor: 'admin@aceaix.com',  action: 'verification.approve', entity: 'org:fc_madrid_academy',    reason: 'Documents verified',             ip: '10.0.1.12',  time: '2026-06-18 14:28', sensitive: false },
  { id: 'al3', actor: 'system',            action: 'medical.record.view',  entity: 'athlete:a_marcus',         reason: 'Partner clearance request',      ip: 'system',     time: '2026-06-18 13:55', sensitive: true  },
  { id: 'al4', actor: 'admin@aceaix.com',  action: 'feature_flag.update',  entity: 'flag:live_scores',         reason: 'Rollout to 50%',                 ip: '10.0.1.12',  time: '2026-06-18 12:44', sensitive: false },
  { id: 'al5', actor: 'admin2@aceaix.com', action: 'refund.issue',         entity: 'payment:pay_3812',         reason: 'Customer dispute',               ip: '10.0.1.34',  time: '2026-06-18 11:10', sensitive: false },
  { id: 'al6', actor: 'system',            action: 'medical.record.export',entity: 'athlete:a_priya',          reason: 'GDPR data export request',       ip: 'system',     time: '2026-06-18 10:05', sensitive: true  },
  { id: 'al7', actor: 'admin@aceaix.com',  action: 'user.delete',          entity: 'user:u_test_999',          reason: 'GDPR erasure request',           ip: '10.0.1.12',  time: '2026-06-17 16:50', sensitive: false },
  { id: 'al8', actor: 'admin2@aceaix.com', action: 'payout.approve',       entity: 'payout:po_scoutnet',       reason: 'Monthly commission cycle',       ip: '10.0.1.34',  time: '2026-06-17 14:20', sensitive: false },
  { id: 'al9', actor: 'system',            action: 'league.sync',          entity: 'provider:api-football',    reason: 'Scheduled sync job',             ip: 'system',     time: '2026-06-17 12:00', sensitive: false },
  { id: 'al10', actor: 'admin@aceaix.com', action: 'scope.change',         entity: 'staff:admin2@aceaix.com',  reason: 'Granted finance scope',          ip: '10.0.1.12',  time: '2026-06-17 09:30', sensitive: true  },
];

const SECURITY_ALERTS = [
  { id: 'sa1', severity: 'critical', title: '3 failed login attempts from unknown IP',         detail: 'IP: 185.220.101.42 · admin@aceaix.com · Jun 18 14:55', time: '5m ago'  },
  { id: 'sa2', severity: 'high',     title: 'Medical record accessed outside partner hours',   detail: 'actor: partner:medtech_p3 · athlete: a_carlos · 02:14 UTC', time: '3h ago' },
  { id: 'sa3', severity: 'medium',   title: 'Unusual bulk export from scout account',          detail: '1,200 athlete records exported in 4 min · user: u_scout_88', time: '6h ago' },
  { id: 'sa4', severity: 'low',      title: 'New admin staff account created',                 detail: 'actor: admin@aceaix.com · new: admin3@aceaix.com',         time: '1d ago' },
];

const CONSENT = [
  { id: 'c1', user: 'Marcus Silva',  type: 'Medical Data',    granted: true,  date: '2026-01-15', guardian: false },
  { id: 'c2', user: 'Aisha Mensah',  type: 'Medical Data',    granted: true,  date: '2026-02-20', guardian: false },
  { id: 'c3', user: 'Lena Fischer',  type: 'Medical Data',    granted: false, date: '2026-03-10', guardian: false },
  { id: 'c4', user: 'Jin-ho Park',   type: 'AI Analysis',     granted: true,  date: '2026-04-05', guardian: false },
  { id: 'c5', user: 'Priya Nair',    type: 'Marketing',       granted: false, date: '2026-03-01', guardian: false },
  { id: 'c6', user: 'Kai Nakamura',  type: 'Medical Data',    granted: true,  date: '2026-05-12', guardian: true  },
];

const GDPR_REQUESTS = [
  { id: 'g1', user: 'user_legacy_44',  type: 'Export',    status: 'completed', submitted: '2026-06-10', completed: '2026-06-12', hasMedical: false },
  { id: 'g2', user: 'u_test_999',      type: 'Erasure',   status: 'completed', submitted: '2026-06-14', completed: '2026-06-17', hasMedical: false },
  { id: 'g3', user: 'athlete_5512',    type: 'Export',    status: 'pending',   submitted: '2026-06-16', completed: null,         hasMedical: true  },
  { id: 'g4', user: 'scout_org_28',    type: 'Erasure',   status: 'reviewing', submitted: '2026-06-17', completed: null,         hasMedical: false },
];

const SEV_STYLE: Record<string, { color: string; bg: string }> = {
  critical: { color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
  high:     { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  medium:   { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)' },
  low:      { color: '#9DB0C6', bg: 'rgba(157,176,198,0.1)' },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  completed: { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' },
  pending:   { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  reviewing: { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)' },
};

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

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'audit',   label: 'Audit Log',    icon: FileText },
    { key: 'alerts',  label: 'Alerts',       icon: AlertTriangle },
    { key: 'consent', label: 'Consent',      icon: CheckCircle },
    { key: 'gdpr',    label: 'GDPR',         icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
            Immutable audit log · Security alerts · Consent dashboard · GDPR requests
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
          <Download size={13} /> Export Audit CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Alerts',      value: '3',    color: '#EF5350', icon: AlertTriangle },
          { label: 'Audit Events (7d)', value: '284',  color: '#2F80ED', icon: Shield },
          { label: 'Consent Records',  value: '9,821', color: '#1FB57A', icon: CheckCircle },
          { label: 'GDPR Pending',     value: '2',    color: '#F5A623', icon: Globe },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Medical data notice */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(239,83,80,0.06)', border: '1px solid rgba(239,83,80,0.2)' }}>
        <Heart size={14} style={{ color: '#EF5350', flexShrink: 0 }} />
        <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <strong className="text-white">Medical data guard:</strong> All access to athlete health records is logged with actor, timestamp, and stated purpose. Medical exports require dual admin sign-off and are marked sensitive in audit.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center"
            style={{
              background: tab === t.key ? '#0F1E32' : 'transparent',
              color: tab === t.key ? 'white' : '#9DB0C6',
              boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
            }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Audit Log */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9DB0C6' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter by actor, action, entity..."
              className="w-full rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '130px 160px 180px 1fr 80px 110px' }}>
              <span>Time</span><span>Actor</span><span>Action</span><span>Entity</span><span>Sensitive</span><span>IP</span>
            </div>
            {filteredAudit.map((a, i) => (
              <div key={a.id} className="grid px-4 py-3 items-center text-xs"
                style={{
                  gridTemplateColumns: '130px 160px 180px 1fr 80px 110px',
                  background: a.sensitive
                    ? 'rgba(239,83,80,0.04)'
                    : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: a.sensitive ? '2px solid rgba(239,83,80,0.4)' : '2px solid transparent',
                }}>
                <span style={{ color: '#9DB0C6' }}>{a.time}</span>
                <span className="text-white truncate">{a.actor}</span>
                <code className="text-[10px] font-mono" style={{ color: '#2F80ED' }}>{a.action}</code>
                <span className="truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.entity}</span>
                {a.sensitive
                  ? <span className="flex items-center gap-1 text-[10px]" style={{ color: '#EF5350' }}><Lock size={10} />Sensitive</span>
                  : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                <code className="text-[10px] font-mono" style={{ color: '#9DB0C6' }}>{a.ip}</code>
              </div>
            ))}
            <div className="px-4 py-2 text-[11px]" style={{ background: '#0A1828', color: '#9DB0C6', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              Audit log is append-only. No entry can be modified or deleted.
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts */}
      {tab === 'alerts' && (
        <div className="space-y-3">
          {SECURITY_ALERTS.map(a => {
            const s = SEV_STYLE[a.severity] ?? SEV_STYLE.low;
            return (
              <div key={a.id} className="rounded-2xl p-4"
                style={{ background: s.bg, border: `1px solid ${s.color}22`, borderLeft: `3px solid ${s.color}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p className="text-sm font-semibold text-white">{a.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{a.detail}</p>
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
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 130px 80px 100px 100px' }}>
            <span>User</span><span>Consent Type</span><span>Status</span><span>Date</span><span>Guardian</span>
          </div>
          {CONSENT.map((c, i) => (
            <div key={c.id} className="grid px-4 py-3 items-center text-xs"
              style={{
                gridTemplateColumns: '1fr 130px 80px 100px 100px',
                background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
              <span className="text-white font-medium">{c.user}</span>
              <span style={{ color: '#9DB0C6' }}>{c.type}</span>
              {c.granted
                ? <span className="flex items-center gap-1 text-[11px]" style={{ color: '#1FB57A' }}><CheckCircle size={11} />Granted</span>
                : <span className="flex items-center gap-1 text-[11px]" style={{ color: '#EF5350' }}><XCircle size={11} />Withheld</span>}
              <span style={{ color: '#9DB0C6' }}>{c.date}</span>
              {c.guardian
                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>REQUIRED</span>
                : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
            </div>
          ))}
        </div>
      )}

      {/* GDPR */}
      {tab === 'gdpr' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(47,128,237,0.07)', border: '1px solid rgba(47,128,237,0.2)' }}>
            <Database size={14} style={{ color: '#2F80ED', flexShrink: 0 }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Data residency: <strong className="text-white">EU (Frankfurt)</strong> primary ·
              Retention policy: athlete data 7y post-account deletion, medical records 10y as per applicable law.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 80px 100px 110px 110px 120px' }}>
              <span>User</span><span>Type</span><span>Status</span><span>Submitted</span><span>Completed</span><span>Actions</span>
            </div>
            {GDPR_REQUESTS.map((r, i) => (
              <div key={r.id} className="grid px-4 py-3 items-center text-xs"
                style={{
                  gridTemplateColumns: '1fr 80px 100px 110px 110px 120px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{r.user}</span>
                  {r.hasMedical && <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,83,80,0.12)', color: '#EF5350' }}><Heart size={8} />MEDICAL</span>}
                </div>
                <span className="font-semibold" style={{ color: r.type === 'Erasure' ? '#EF5350' : '#2F80ED' }}>{r.type}</span>
                <StatChip status={r.status} />
                <span style={{ color: '#9DB0C6' }}>{r.submitted}</span>
                <span style={{ color: '#9DB0C6' }}>{r.completed ?? '—'}</span>
                <div className="flex gap-1">
                  {r.status === 'pending' && (
                    <>
                      <button className="px-2 py-1 rounded text-[10px] font-semibold"
                        style={{ color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
                        <Eye size={10} />
                      </button>
                      {r.type === 'Export'
                        ? <button className="px-2 py-1 rounded text-[10px] font-semibold"
                            style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Export</button>
                        : <button className="px-2 py-1 rounded text-[10px] font-semibold"
                            style={{ color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}>Erase</button>}
                    </>
                  )}
                  {r.status === 'reviewing' && (
                    <button className="px-2 py-1 rounded text-[10px] font-semibold"
                      style={{ color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>Review</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
