import React from 'react';
import { Users, ShieldCheck, AlertCircle, Activity } from 'lucide-react';

const PLATFORM_STATS = [
  { label: 'Total Users',      value: '12,483',   change: '+234 this week', color: '#2F80ED', bg: 'rgba(47,128,237,0.08)'  },
  { label: 'Active Athletes',  value: '9,821',    change: '+5.2%',          color: '#1FB57A', bg: 'rgba(31,181,122,0.08)'  },
  { label: 'Verified Records', value: '34,102',   change: '+412 today',     color: '#2F80ED', bg: 'rgba(47,128,237,0.08)'  },
  { label: 'Monthly Revenue',  value: 'AED 182K', change: '+18%',           color: '#F5A623', bg: 'rgba(245,166,35,0.08)'  },
];

const PENDING_VERIFICATIONS = [
  { name: 'Al Nasr Football Club',   type: 'Club',            submitted: '2026-06-05', docs: 3 },
  { name: 'Dubai Sports Medicine',   type: 'Medical Partner', submitted: '2026-06-04', docs: 5 },
  { name: 'UAE Football Federation', type: 'Federation',      submitted: '2026-06-03', docs: 7 },
];

const RECENT_USERS = [
  { name: 'Khalid Al-Rashidi', role: 'Athlete',        sport: 'Football', joined: '2026-06-08' },
  { name: 'Ahmed Al-Muhairi',  role: 'Scout',           org: 'Al Ain FC',  joined: '2026-06-07' },
  { name: 'Dr. Sarah Williams',role: 'Medical Partner', org: 'Dubai SC',   joined: '2026-06-06' },
  { name: 'Tariq Hassan',      role: 'Athlete',         sport: 'Football', joined: '2026-06-06' },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink font-display">Platform Overview</h1>
          <p className="text-sm text-slate mt-0.5">AceAiX Super Admin · AryAiX Internal</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald/8 border border-emerald/20 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
          <span className="text-xs text-emerald font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORM_STATS.map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold text-ink tabular font-display">{s.value}</p>
            <p className="text-sm text-slate mt-0.5">{s.label}</p>
            <p className="text-xs mt-2 font-medium" style={{ color: s.color }}>{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={18} className="text-amber" />
            <h2 className="text-base font-semibold text-ink">Pending Verifications</h2>
            <span className="badge-amber">{PENDING_VERIFICATIONS.length}</span>
          </div>
          <div className="space-y-3">
            {PENDING_VERIFICATIONS.map(item => (
              <div key={item.name} className="flex items-center gap-4 p-3 bg-page rounded-xl border border-rim">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber/8">
                  <AlertCircle size={18} className="text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-slate">{item.type} · {item.docs} documents · {item.submitted}</p>
                </div>
                <button className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">Review</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-azure" />
            <h2 className="text-base font-semibold text-ink">Recent Signups</h2>
          </div>
          <div className="space-y-1">
            {RECENT_USERS.map(user => (
              <div key={user.name} className="flex items-center gap-3 py-2.5 border-b border-rim last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-azure/8 text-azure border border-azure/15">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{user.name}</p>
                  <p className="text-xs text-slate">
                    {user.role}{(user as any).sport ? ` · ${(user as any).sport}` : (user as any).org ? ` · ${(user as any).org}` : ''}
                  </p>
                </div>
                <p className="text-xs text-slate flex-shrink-0">{user.joined}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Performance */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-azure" />
          <h2 className="text-base font-semibold text-ink">AI System Performance</h2>
          <span className="badge-emerald ml-auto">Healthy</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'AI Chat Sessions Today', value: '1,204' },
            { label: 'Avg Response Time',       value: '0.8s'  },
            { label: 'Clip Tags Generated',     value: '342'   },
            { label: 'Profile Analyses',        value: '89'    },
          ].map(metric => (
            <div key={metric.label} className="p-4 bg-page border border-rim rounded-xl text-center">
              <p className="text-xl font-bold text-ink tabular font-display">{metric.value}</p>
              <p className="text-xs text-slate mt-1">{metric.label}</p>
              <div className="mt-2 flex justify-center">
                <div className="w-2 h-2 bg-emerald rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
