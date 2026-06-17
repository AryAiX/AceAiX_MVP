import React from 'react';
import { ShieldCheck, FileText, TrendingUp, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const REQUESTS = [
  { id: '1', athlete: 'Khalid Al-Rashidi', type: 'Physical Assessment', requested: '2026-06-01', status: 'pending'     },
  { id: '2', athlete: 'Yusuf Al-Kaabi',    type: 'Medical Clearance',   requested: '2026-05-28', status: 'in_progress' },
  { id: '3', athlete: 'Fatima Hassan',     type: 'Blood Test',          requested: '2026-05-25', status: 'completed'   },
];

const STAT_ITEMS = [
  { label: 'Pending Requests',     value: '3',      icon: <Clock size={18} />,       color: '#F5A623', bg: 'rgba(245,166,35,0.08)'  },
  { label: 'Completed This Month', value: '18',     icon: <CheckCircle size={18} />,  color: '#1FB57A', bg: 'rgba(31,181,122,0.08)'  },
  { label: 'Active Athletes',      value: '42',     icon: <FileText size={18} />,     color: '#2F80ED', bg: 'rgba(47,128,237,0.08)'  },
  { label: 'Revenue (AED)',        value: '24,500', icon: <TrendingUp size={18} />,   color: '#2F80ED', bg: 'rgba(47,128,237,0.08)'  },
];

const STATUS_STYLE: Record<string, { bg: string; icon: React.ReactNode; badgeClass: string }> = {
  completed:   { bg: 'rgba(31,181,122,0.08)',  icon: <CheckCircle size={18} className="text-emerald" />,  badgeClass: 'badge-emerald' },
  in_progress: { bg: 'rgba(47,128,237,0.08)',  icon: <Clock size={18} className="text-azure" />,          badgeClass: 'badge-azure'   },
  pending:     { bg: 'rgba(245,166,35,0.08)',  icon: <AlertCircle size={18} className="text-amber" />,    badgeClass: 'badge-amber'   },
};

export default function PartnerDashboard() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink font-display">Medical Partner Dashboard</h1>
          <p className="text-sm text-slate mt-0.5">Dubai Sports Medicine Centre · Verified Partner</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald/8 border border-emerald/20 rounded-full px-3 py-1.5">
          <ShieldCheck size={13} className="text-emerald" />
          <span className="text-xs text-emerald font-semibold">Verified Partner</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_ITEMS.map(s => (
          <div key={s.label} className="card p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-ink tabular font-display">{s.value}</p>
            <p className="text-sm text-slate mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Requests */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Verification Requests</h2>
          <button className="btn-primary text-sm">
            <Plus size={14} /> Upload Record
          </button>
        </div>
        <div className="space-y-3">
          {REQUESTS.map(req => {
            const st = STATUS_STYLE[req.status];
            return (
              <div key={req.id} className="flex items-center gap-4 p-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: st.bg }}>
                  {st.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{req.athlete}</p>
                  <p className="text-xs text-slate">{req.type} · Requested {req.requested}</p>
                </div>
                <span className={`${st.badgeClass} text-xs`}>{req.status.replace('_', ' ')}</span>
                {req.status !== 'completed' && (
                  <button className="btn-primary text-xs py-1.5 px-3 ml-2 flex-shrink-0">Process</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
