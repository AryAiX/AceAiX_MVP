import React from 'react';
import { BarChart3, TrendingUp, Users, Activity, Globe, ArrowUp } from 'lucide-react';

const PLATFORM_DATA = [
  { label: 'New Signups (30d)', value: '1,284', change: '+23%' },
  { label: 'Search Sessions', value: '28,491', change: '+18%' },
  { label: 'AI Chat Messages', value: '94,230', change: '+31%' },
  { label: 'Medical Verifications', value: '412', change: '+9%' },
];

const SPORT_BREAKDOWN = [
  { sport: 'Football', pct: 72, count: '8,913' },
  { sport: 'Athletics', pct: 12, count: '1,486' },
  { sport: 'Basketball', pct: 7, count: '866' },
  { sport: 'Swimming', pct: 5, count: '619' },
  { sport: 'Other', pct: 4, count: '495' },
];

const MONTHLY_DATA = [480, 520, 610, 730, 820, 910, 1080, 1240, 1100, 1380, 1520, 1284];
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const MAX = Math.max(...MONTHLY_DATA);

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="section-title">Platform Analytics</h1>
        <p className="section-subtitle">Usage metrics, growth trends, and system performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORM_DATA.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
            <p className="text-xs mt-2 text-emerald-400 flex items-center gap-1">
              <ArrowUp size={11} /> {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-blue-400" />
          <h2 className="text-base font-semibold text-white">Monthly New Signups</h2>
          <span className="badge badge-green ml-auto">+23% MoM</span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {MONTHLY_DATA.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-blue-600/70 rounded-t-sm" style={{ height: `${(v / MAX) * 100}px` }} />
              <p className="text-xs text-slate-600">{MONTHS[i]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sport breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">Athletes by Sport</h2>
          </div>
          <div className="space-y-4">
            {SPORT_BREAKDOWN.map((s) => (
              <div key={s.sport}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-300">{s.sport}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{s.count}</span>
                    <span className="text-xs font-bold text-white">{s.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">Users by Country</h2>
          </div>
          <div className="space-y-3">
            {[
              { country: 'UAE', users: '4,284', pct: 34 },
              { country: 'Saudi Arabia', users: '2,891', pct: 23 },
              { country: 'Morocco', users: '1,623', pct: 13 },
              { country: 'Egypt', users: '1,248', pct: 10 },
              { country: 'Iran', users: '986', pct: 8 },
              { country: 'Other', users: '1,451', pct: 12 },
            ].map((row) => (
              <div key={row.country} className="flex items-center gap-3">
                <p className="text-sm text-slate-300 w-24 flex-shrink-0">{row.country}</p>
                <div className="flex-1 h-2 bg-navy-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 w-12 text-right flex-shrink-0">{row.users}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
