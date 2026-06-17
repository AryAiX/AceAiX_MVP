import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Clock, CheckCircle2, Activity, ChevronRight,
  ShieldCheck, AlertTriangle, User,
} from 'lucide-react';

const TEST_TYPES = ['All', 'Physical Assessment', 'Medical Clearance', 'Blood / Lab', 'Cardiac Screening', 'MRI / Imaging', 'Drug Test'];
const STATUSES   = ['all', 'pending', 'in_progress', 'completed'];

const REQUESTS = [
  { id: 'r1',  athlete: 'Khalid Al-Rashidi', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80',  requestedBy: 'Athlete',    type: 'Physical Assessment',  date: '17 Jun 2026', status: 'pending',     urgency: 'high'   },
  { id: 'r2',  athlete: 'Yusuf Al-Kaabi',    avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=80',    requestedBy: 'Al Wasl SC', type: 'Medical Clearance',    date: '16 Jun 2026', status: 'in_progress', urgency: 'high'   },
  { id: 'r3',  athlete: 'Omar Al-Farsi',      avatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=80',      requestedBy: 'Athlete',    type: 'Cardiac Screening',    date: '15 Jun 2026', status: 'in_progress', urgency: 'medium' },
  { id: 'r4',  athlete: 'Sara Al-Hashemi',    avatar: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=80',    requestedBy: 'Al Ain FC',  type: 'Blood / Lab',          date: '14 Jun 2026', status: 'pending',     urgency: 'medium' },
  { id: 'r5',  athlete: 'James Crawford',     avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=80',      requestedBy: 'Al Ain FC',  type: 'MRI / Imaging',        date: '13 Jun 2026', status: 'pending',     urgency: 'low'    },
  { id: 'r6',  athlete: 'Fabrizio Moretti',   avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=80',    requestedBy: 'Athlete',    type: 'Drug Test',            date: '12 Jun 2026', status: 'completed',   urgency: 'low'    },
  { id: 'r7',  athlete: 'Karim Al-Hassan',    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80',    requestedBy: 'Wydad AC',   type: 'Physical Assessment',  date: '11 Jun 2026', status: 'completed',   urgency: 'medium' },
  { id: 'r8',  athlete: 'Rashid Salem',       avatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=80',    requestedBy: 'Athlete',    type: 'Blood / Lab',          date: '10 Jun 2026', status: 'completed',   urgency: 'low'    },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:     { label: 'Pending',     color: '#F5A623', bg: 'rgba(245,166,35,0.12)',  icon: Clock         },
  in_progress: { label: 'In Progress', color: '#2F80ED', bg: 'rgba(47,128,237,0.12)', icon: Activity      },
  completed:   { label: 'Completed',   color: '#1FB57A', bg: 'rgba(31,181,122,0.12)', icon: CheckCircle2  },
};

const URGENCY_COLOR: Record<string, string> = { high: '#EF5350', medium: '#F5A623', low: '#7C8DA6' };

function StatusChip({ status }: { status: string }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}30` }}>
      <Icon size={9} /> {m.label}
    </span>
  );
}

export default function VerificationInboxPage() {
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatus]   = useState('all');

  const filtered = REQUESTS.filter(r => {
    const ms = !search || r.athlete.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === 'All' || r.type === typeFilter;
    const mv = statusFilter === 'all' || r.status === statusFilter;
    return ms && mt && mv;
  });

  const pending = REQUESTS.filter(r => r.status === 'pending').length;
  const inProg  = REQUESTS.filter(r => r.status === 'in_progress').length;

  return (
    <div className="max-w-5xl space-y-5 pb-10">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <div>
          <h1 className="text-xl font-black text-white">Verification Inbox</h1>
          <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>
            {pending} pending · {inProg} in progress · {REQUESTS.filter(r => r.status === 'completed').length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', color: '#F5A623' }}>
              <AlertTriangle size={11} /> {pending} Pending action
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s 0.05s ease both' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7C8DA6' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search athlete..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(31,181,122,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>
          <div className="flex gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: statusFilter === s ? (STATUS_META[s]?.bg ?? 'rgba(31,181,122,0.12)') : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${statusFilter === s ? (STATUS_META[s]?.color ?? '#1FB57A') + '40' : 'rgba(255,255,255,0.08)'}`,
                  color: statusFilter === s ? (STATUS_META[s]?.color ?? '#1FB57A') : '#7C8DA6',
                }}>
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TEST_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: typeFilter === t ? 'rgba(31,181,122,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${typeFilter === t ? 'rgba(31,181,122,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: typeFilter === t ? '#1FB57A' : '#7C8DA6',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Table head */}
        <div className="hidden sm:grid px-5 py-3 text-[10px] font-black uppercase tracking-wider"
          style={{
            gridTemplateColumns: '1fr auto auto auto auto',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            color: '#7C8DA6',
          }}>
          <span>Athlete</span>
          <span className="w-36 text-left">Test Type</span>
          <span className="w-28 text-left">Requested By</span>
          <span className="w-28 text-left">Date</span>
          <span className="w-24 text-right">Status</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: '#7C8DA6' }}>No requests match your filters.</p>
          </div>
        )}

        {filtered.map((req, i) => {
          const uc = URGENCY_COLOR[req.urgency];
          return (
            <Link key={req.id} to={`/partner/inbox/${req.id}`}
              className="group flex sm:grid items-center gap-3 px-5 py-4 transition-all"
              style={{
                gridTemplateColumns: '1fr auto auto auto auto',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {/* Athlete */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img src={req.avatar} alt={req.athlete} className="w-9 h-9 rounded-xl object-cover"
                    style={{ border: `1.5px solid ${uc}30` }} />
                  {req.status === 'pending' && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
                      style={{ background: '#F5A623', border: '1.5px solid #0D1C2E', boxShadow: '0 0 6px rgba(245,166,35,0.7)' }} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-white">{req.athlete}</p>
                  <div className="flex items-center gap-1 mt-0.5 sm:hidden">
                    <span className="text-[10px]" style={{ color: '#7C8DA6' }}>{req.type}</span>
                    <span className="text-[10px]" style={{ color: '#7C8DA6' }}>· {req.date}</span>
                  </div>
                </div>
              </div>

              {/* Type */}
              <div className="w-36 hidden sm:block">
                <p className="text-xs" style={{ color: 'rgba(244,248,252,0.65)' }}>{req.type}</p>
              </div>

              {/* Requested by */}
              <div className="w-28 hidden sm:flex items-center gap-1.5">
                <User size={10} style={{ color: '#7C8DA6', flexShrink: 0 }} />
                <p className="text-[11px]" style={{ color: '#7C8DA6' }}>{req.requestedBy}</p>
              </div>

              {/* Date */}
              <div className="w-28 hidden sm:block">
                <p className="text-[11px]" style={{ color: '#7C8DA6' }}>{req.date}</p>
              </div>

              {/* Status */}
              <div className="w-24 flex items-center justify-end gap-2 flex-shrink-0">
                <StatusChip status={req.status} />
                <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
