import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, AlertCircle, CheckCircle, X, FileText, Clock,
  Building2, Heart, Globe, Users, ArrowRight, Eye, Download,
  ChevronDown, ChevronUp, Zap, Timer, AlertTriangle, Star,
  MessageSquare, RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type VerifStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
type OrgType     = 'Club' | 'Medical Partner' | 'Federation' | 'Scout Agency';

interface VerifItem {
  id: string;
  name: string;
  type: OrgType;
  submitted: string;
  status: VerifStatus;
  contact: string;
  email: string;
  country: string;
  priority: 'high' | 'medium' | 'low';
  slaHours: number;
  documents: { name: string; verified: boolean }[];
  notes?: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const QUEUE: VerifItem[] = [
  {
    id: 'v1',
    name: 'FC Barcelona Academy',
    type: 'Club',
    submitted: '2026-06-16',
    status: 'in_review',
    contact: 'Jordi Cruyff',
    email: 'academy@fcbarcelona.cat',
    country: 'Spain',
    priority: 'high',
    slaHours: 6,
    documents: [
      { name: 'Club Registration',    verified: true  },
      { name: 'UEFA Affiliation Cert', verified: true  },
      { name: 'Board Resolution',      verified: true  },
      { name: 'Financial Audit 2025',  verified: false },
      { name: 'Insurance Policy',      verified: false },
    ],
  },
  {
    id: 'v2',
    name: 'MedTech Sports Clinic',
    type: 'Medical Partner',
    submitted: '2026-06-15',
    status: 'pending',
    contact: 'Dr. Amara Diallo',
    email: 'admin@medtech.fr',
    country: 'France',
    priority: 'high',
    slaHours: 14,
    documents: [
      { name: 'Medical License',         verified: true  },
      { name: 'Facility Certification',  verified: false },
      { name: 'ISO 9001 Certificate',    verified: false },
      { name: 'Staff Credentials',       verified: false },
      { name: 'Liability Insurance',     verified: false },
    ],
  },
  {
    id: 'v3',
    name: 'World Athletics Federation',
    type: 'Federation',
    submitted: '2026-06-14',
    status: 'pending',
    contact: 'Sebastian Coe',
    email: 's.coe@worldathletics.org',
    country: 'UK',
    priority: 'medium',
    slaHours: 26,
    documents: [
      { name: 'World Athletics Charter',   verified: true  },
      { name: 'Articles of Association',   verified: true  },
      { name: 'Board Members Register',    verified: true  },
      { name: 'Financial Audit 2024-25',   verified: false },
      { name: 'Stadium / Venue Docs',      verified: false },
      { name: 'Anti-Doping Policy',        verified: false },
      { name: 'Insurance Certificate',     verified: false },
    ],
  },
  {
    id: 'v4',
    name: 'ScoutNet Global Ltd',
    type: 'Scout Agency',
    submitted: '2026-06-13',
    status: 'pending',
    contact: 'Emma Johnson',
    email: 'emma@scoutnet.io',
    country: 'England',
    priority: 'low',
    slaHours: 38,
    documents: [
      { name: 'Company Registration',  verified: false },
      { name: 'Agent Licenses',        verified: false },
      { name: 'Professional Indemnity',verified: false },
    ],
  },
  {
    id: 'v5',
    name: 'Ajax Youth Development',
    type: 'Club',
    submitted: '2026-06-18',
    status: 'approved',
    contact: 'Edwin van der Sar',
    email: 'youth@ajax.nl',
    country: 'Netherlands',
    priority: 'medium',
    slaHours: 0,
    documents: [
      { name: 'Club Registration',    verified: true },
      { name: 'KNVB Affiliation',     verified: true },
      { name: 'Financial Audit',      verified: true },
    ],
  },
];

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<OrgType, { color: string; bg: string; icon: React.ElementType }> = {
  'Club':           { color: '#2F80ED', bg: 'rgba(47,128,237,0.15)',  icon: Building2 },
  'Medical Partner':{ color: '#1FB57A', bg: 'rgba(31,181,122,0.15)',  icon: Heart     },
  'Federation':     { color: '#B8F135', bg: 'rgba(184,241,53,0.12)',  icon: Globe     },
  'Scout Agency':   { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', icon: Users     },
};

const STATUS_CONFIG: Record<VerifStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
  in_review: { label: 'In Review', color: '#2F80ED', bg: 'rgba(47,128,237,0.12)'  },
  approved:  { label: 'Approved',  color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  rejected:  { label: 'Rejected',  color: '#EF5350', bg: 'rgba(239,83,80,0.12)'   },
};

const PRIORITY_CONFIG = {
  high:   { color: '#EF5350', label: 'High'   },
  medium: { color: '#F5A623', label: 'Medium' },
  low:    { color: '#9DB0C6', label: 'Low'    },
};

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

// ── SLA timer ─────────────────────────────────────────────────────────────────

function SlaTimer({ hours }: { hours: number }) {
  const urgent = hours > 24;
  const color  = hours > 36 ? '#EF5350' : hours > 20 ? '#F5A623' : '#1FB57A';
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold"
      style={{ color }}>
      <Timer size={10} />
      {hours}h
    </span>
  );
}

// ── Doc row ───────────────────────────────────────────────────────────────────

function DocRow({ doc, index }: { doc: { name: string; verified: boolean }; index: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60 + index * 50); }, [index]);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
      style={{
        background: doc.verified ? 'rgba(31,181,122,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${doc.verified ? 'rgba(31,181,122,0.15)' : 'rgba(255,255,255,0.06)'}`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-8px)',
        transition: `opacity 0.3s ease, transform 0.3s ease, background 0.2s ease`,
      }}>
      <FileText size={12} style={{ color: doc.verified ? '#1FB57A' : '#9DB0C6', flexShrink: 0 }} />
      <p className="text-xs flex-1" style={{ color: doc.verified ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)' }}>
        {doc.name}
      </p>
      {doc.verified
        ? <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: '#1FB57A' }}><CheckCircle size={10} />OK</span>
        : <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: '#F5A623' }}><Clock size={10} />Pending</span>}
      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold px-2 py-0.5 rounded-lg"
        style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>
        <Eye size={10} />
      </button>
    </div>
  );
}

// ── Queue card ────────────────────────────────────────────────────────────────

function QueueCard({
  item, active, index, onClick,
}: {
  item: VerifItem; active: boolean; index: number; onClick: () => void;
}) {
  const typeCfg   = TYPE_CONFIG[item.type];
  const statusCfg = STATUS_CONFIG[item.status];
  const priCfg    = PRIORITY_CONFIG[item.priority];
  const TypeIcon  = typeCfg.icon;
  const docsVerified = item.documents.filter(d => d.verified).length;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60 + index * 70); }, [index]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all group relative overflow-hidden"
      style={{
        background: active ? `linear-gradient(135deg, ${typeCfg.color}0F, rgba(255,255,255,0.01))` : '#0F1E32',
        border: active ? `1px solid ${typeCfg.color}40` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: active ? `0 0 30px ${typeCfg.color}0F` : 'none',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.4s ease ${index * 0.07}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.07}s, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease`,
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.borderColor = `${typeCfg.color}25`;
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      {/* Active left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full transition-all duration-300"
        style={{ background: active ? typeCfg.color : 'transparent', boxShadow: active ? `0 0 12px ${typeCfg.color}` : 'none' }} />

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeCfg.bg, color: typeCfg.color }}>
          <TypeIcon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white truncate">{item.name}</p>
            {item.status === 'pending' && item.priority === 'high' && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: 'rgba(239,83,80,0.15)', color: '#EF5350' }}>
                <Zap size={8} />URGENT
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: '#9DB0C6' }}>
            {item.type} · {item.country} · {item.contact}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={statusCfg}>
              {statusCfg.label}
            </span>
            {item.status !== 'approved' && item.status !== 'rejected' && (
              <SlaTimer hours={item.slaHours} />
            )}
            {/* Doc progress */}
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(docsVerified / item.documents.length) * 100}%`,
                    background: typeCfg.color,
                  }} />
              </div>
              <span className="text-[10px]" style={{ color: '#9DB0C6' }}>
                {docsVerified}/{item.documents.length} docs
              </span>
            </div>
          </div>
        </div>
        <ArrowRight size={14} className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
          style={{ color: active ? typeCfg.color : '#9DB0C6' }} />
      </div>
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({ item, onClose }: { item: VerifItem; onClose: () => void }) {
  const typeCfg   = TYPE_CONFIG[item.type];
  const statusCfg = STATUS_CONFIG[item.status];
  const TypeIcon  = typeCfg.icon;
  const [notes, setNotes] = useState(item.notes ?? '');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const docsVerified = item.documents.filter(d => d.verified).length;
  const pct = Math.round((docsVerified / item.documents.length) * 100);

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        background: '#0F1E32',
        border: `1px solid ${typeCfg.color}30`,
        boxShadow: `0 0 40px ${typeCfg.color}08`,
        animation: 'panelIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-4 flex-shrink-0"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.07)`, background: `linear-gradient(135deg, ${typeCfg.color}08, transparent)` }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeCfg.bg, color: typeCfg.color, boxShadow: `0 0 20px ${typeCfg.color}20` }}>
          <TypeIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white leading-tight">{item.name}</h2>
          <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>
            {item.type} · {item.country} · Submitted {item.submitted}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={statusCfg}>{statusCfg.label}</span>
            {item.status !== 'approved' && item.status !== 'rejected' && <SlaTimer hours={item.slaHours} />}
            <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{item.email}</span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          style={{ color: '#9DB0C6' }}>
          <X size={14} />
        </button>
      </div>

      {/* Doc progress ring */}
      <div className="px-5 py-4 flex items-center gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
            <circle cx="28" cy="28" r="22" fill="none" stroke={typeCfg.color} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 4px ${typeCfg.color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{docsVerified} of {item.documents.length} documents verified</p>
          <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>
            {item.documents.length - docsVerified > 0
              ? `${item.documents.length - docsVerified} still awaiting verification`
              : 'All documents verified'}
          </p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Documents */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9DB0C6' }}>
            Documents
          </p>
          <div className="space-y-1.5">
            {item.documents.map((doc, i) => <DocRow key={doc.name} doc={doc} index={i} />)}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl px-3 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9DB0C6' }}>Contact</p>
          <p className="text-sm font-semibold text-white">{item.contact}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>{item.email}</p>
        </div>

        {/* Review notes */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9DB0C6' }}>Review Notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Add internal notes for this verification..."
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e  => (e.target.style.borderColor = `${typeCfg.color}60`)}
            onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
      </div>

      {/* Action footer */}
      {(item.status === 'pending' || item.status === 'in_review') && (
        <div className="px-5 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setDecision('approve')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: decision === 'approve'
                ? '#1FB57A'
                : 'rgba(31,181,122,0.15)',
              color: decision === 'approve' ? '#fff' : '#1FB57A',
              border: '1px solid rgba(31,181,122,0.3)',
              boxShadow: decision === 'approve' ? '0 0 20px rgba(31,181,122,0.3)' : 'none',
            }}>
            <CheckCircle size={15} />
            {decision === 'approve' ? 'Confirm Approval' : 'Approve'}
          </button>
          <button
            onClick={() => setDecision('reject')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: decision === 'reject'
                ? '#EF5350'
                : 'rgba(239,83,80,0.12)',
              color: decision === 'reject' ? '#fff' : '#EF5350',
              border: '1px solid rgba(239,83,80,0.3)',
              boxShadow: decision === 'reject' ? '0 0 20px rgba(239,83,80,0.3)' : 'none',
            }}>
            <X size={15} />
            {decision === 'reject' ? 'Confirm Rejection' : 'Reject'}
          </button>
        </div>
      )}

      {item.status === 'approved' && (
        <div className="px-5 py-4 flex items-center gap-2 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(31,181,122,0.05)' }}>
          <CheckCircle size={14} style={{ color: '#1FB57A' }} />
          <span className="text-sm font-semibold" style={{ color: '#1FB57A' }}>Verification approved</span>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminVerificationPage() {
  const [selected, setSelected] = useState<VerifItem | null>(QUEUE[0]);
  const [filter, setFilter] = useState<VerifStatus | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const pending   = useCountUp(QUEUE.filter(q => q.status === 'pending').length);
  const inReview  = useCountUp(QUEUE.filter(q => q.status === 'in_review').length);
  const approved  = useCountUp(QUEUE.filter(q => q.status === 'approved').length);
  const urgent    = useCountUp(QUEUE.filter(q => q.priority === 'high' && q.status !== 'approved').length);

  const filtered = filter === 'all' ? QUEUE : QUEUE.filter(q => q.status === filter);

  return (
    <>
      <style>{`
        @keyframes panelIn {
          0%   { opacity: 0; transform: translateX(12px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes pulseUrgent {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,83,80,0.5); }
          50%     { box-shadow: 0 0 0 5px rgba(239,83,80,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Review and approve organizations · SLA tracked in real time
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
            style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending',      value: pending,  color: '#F5A623', icon: Clock,          pulse: false },
            { label: 'In Review',    value: inReview, color: '#2F80ED', icon: Eye,            pulse: false },
            { label: 'Approved',     value: approved, color: '#1FB57A', icon: CheckCircle,    pulse: false },
            { label: 'Urgent (>24h)',value: urgent,   color: '#EF5350', icon: AlertTriangle,  pulse: urgent > 0 },
          ].map(s => (
            <div key={s.label}
              className="rounded-2xl p-4 relative overflow-hidden cursor-default"
              style={{
                background: '#0F1E32',
                border: `1px solid rgba(255,255,255,0.07)`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${s.color}18`,
                    color: s.color,
                    animation: s.pulse ? 'pulseUrgent 2s ease-in-out infinite' : 'none',
                  }}>
                  <s.icon size={13} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* SLA urgency bar */}
        <div className="rounded-2xl px-4 py-3 flex items-center gap-4 flex-wrap"
          style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold text-white flex-shrink-0">SLA Breakdown</p>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {QUEUE.filter(q => q.status !== 'approved' && q.status !== 'rejected').map(q => {
              const pct = Math.min(q.slaHours / 48, 1);
              const color = q.slaHours > 36 ? '#EF5350' : q.slaHours > 20 ? '#F5A623' : '#1FB57A';
              return (
                <div key={q.id} title={`${q.name} — ${q.slaHours}h`} className="flex-1 min-w-0">
                  <p className="text-[9px] truncate mb-1" style={{ color: '#9DB0C6' }}>{q.name}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
                  </div>
                  <p className="text-[9px] mt-0.5 font-semibold" style={{ color }}>{q.slaHours}h</p>
                </div>
              );
            })}
          </div>
          <span className="text-[10px]" style={{ color: '#9DB0C6' }}>48h SLA limit</span>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map(f => {
            const active = filter === f;
            const cfg = f !== 'all' ? STATUS_CONFIG[f] : null;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: active ? (cfg?.bg ?? 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.04)',
                  color: active ? (cfg?.color ?? 'white') : '#9DB0C6',
                  border: active ? `1px solid ${cfg?.color ?? 'rgba(255,255,255,0.2)'}40` : '1px solid rgba(255,255,255,0.06)',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                }}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
              </button>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

          {/* Queue list */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl py-12 text-center"
                style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ShieldCheck size={28} className="mx-auto mb-3 opacity-20 text-white" />
                <p className="text-sm" style={{ color: '#9DB0C6' }}>No items in this filter</p>
              </div>
            ) : (
              filtered.map((item, i) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  index={i}
                  active={selected?.id === item.id}
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}
                />
              ))
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3" style={{ minHeight: 520 }}>
            {selected ? (
              <DetailPanel key={selected.id} item={selected} onClose={() => setSelected(null)} />
            ) : (
              <div className="rounded-2xl flex flex-col items-center justify-center py-20"
                style={{
                  background: '#0F1E32',
                  border: '1px solid rgba(255,255,255,0.07)',
                  opacity: mounted ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(47,128,237,0.1)', color: '#2F80ED' }}>
                  <ShieldCheck size={28} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">Select an item to review</p>
                <p className="text-xs" style={{ color: '#9DB0C6' }}>Click any request from the queue on the left</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
