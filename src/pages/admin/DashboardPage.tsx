import React, { useState, useEffect, useRef } from 'react';
import {
  Users, ShieldCheck, TrendingUp, DollarSign, AlertTriangle,
  Bot, Globe, ArrowUpRight, Clock, Zap, Activity, CheckCircle,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const growthData = [
  { month: 'Jan', users: 7200, revenue: 38000 },
  { month: 'Feb', users: 7900, revenue: 41000 },
  { month: 'Mar', users: 8700, revenue: 44000 },
  { month: 'Apr', users: 9400, revenue: 49000 },
  { month: 'May', users: 10200, revenue: 54000 },
  { month: 'Jun', users: 11100, revenue: 62000 },
  { month: 'Jul', users: 12483, revenue: 70400 },
];

const roleData = [
  { name: 'Athletes', value: 9821, color: '#2F80ED' },
  { name: 'Scouts',   value: 1240, color: '#B8F135' },
  { name: 'Clubs',    value: 892,  color: '#1FB57A' },
  { name: 'Partners', value: 317,  color: '#F5A623' },
  { name: 'Admins',   value: 14,   color: '#EF5350' },
];

const countryData = [
  { country: 'Brazil',  users: 1840 },
  { country: 'England', users: 1620 },
  { country: 'Germany', users: 1340 },
  { country: 'France',  users: 1180 },
  { country: 'Spain',   users: 980 },
  { country: 'Nigeria', users: 820 },
  { country: 'Japan',   users: 710 },
];

const ALERTS = [
  { id: 'a1', icon: AlertTriangle, msg: '3 critical moderation reports awaiting review', color: '#EF5350', bg: 'rgba(239,83,80,0.08)' },
  { id: 'a2', icon: Clock,         msg: '7 verification requests pending > 48h SLA',    color: '#F5A623', bg: 'rgba(245,166,35,0.08)' },
  { id: 'a3', icon: DollarSign,    msg: '4 partner payouts awaiting approval ($12,400)', color: '#2F80ED', bg: 'rgba(47,128,237,0.08)' },
  { id: 'a4', icon: Bot,           msg: '12 AI outputs flagged for review this week',   color: '#F5A623', bg: 'rgba(245,166,35,0.08)' },
];

const RECENT = [
  { id: 1, who: 'admin@aceaix.com', action: 'Approved verification', target: 'FC Madrid Academy', time: '4m ago',  color: '#1FB57A' },
  { id: 2, who: 'admin@aceaix.com', action: 'Suspended user',        target: 'u_demo_4',          time: '22m ago', color: '#EF5350' },
  { id: 3, who: 'system',           action: 'Synced competitions',   target: 'football (1,142)',  time: '1h ago',  color: '#2F80ED' },
  { id: 4, who: 'admin@aceaix.com', action: 'Updated feature flag',  target: 'live_scores → 50%',time: '2h ago',  color: '#9DB0C6' },
  { id: 5, who: 'admin@aceaix.com', action: 'Issued refund',         target: '$49 · user_3812',  time: '3h ago',  color: '#F5A623' },
];

// ── KPI tile ──────────────────────────────────────────────────────────────────

function KpiTile({ label, target, prefix = '', suffix = '', color, icon: Icon, delta, format }: {
  label: string; target: number; prefix?: string; suffix?: string;
  color: string; icon: React.ElementType; delta?: string;
  format?: (n: number) => string;
}) {
  const val = useCountUp(target);
  const display = format ? format(val) : `${prefix}${val.toLocaleString()}${suffix}`;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={17} />
        </div>
        {delta && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: '#1FB57A' }}>
            <ArrowUpRight size={11} />{delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none tracking-tight">{display}</p>
        <p className="text-[11px] mt-1" style={{ color: '#9DB0C6' }}>{label}</p>
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>)}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [chart, setChart] = useState<'users' | 'revenue'>('users');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE · PRODUCTION
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {ALERTS.map(a => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:brightness-110 transition-all"
            style={{ background: a.bg, border: `1px solid ${a.color}22` }}>
            <a.icon size={14} style={{ color: a.color, flexShrink: 0 }} />
            <p className="text-xs leading-snug flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{a.msg}</p>
            <ChevronRight size={12} style={{ color: a.color, flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* KPIs row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Total Users"       target={12483} color="#2F80ED" icon={Users}       delta="+8.4%" />
        <KpiTile label="Verified Athletes" target={9821}  color="#1FB57A" icon={ShieldCheck}  delta="+5.1%" />
        <KpiTile label="MRR (USD)"         target={70400} color="#B8F135" icon={DollarSign}   delta="+13.2%" format={n => `$${(n / 1000).toFixed(1)}k`} />
        <KpiTile label="AI Requests / Day" target={3840}  color="#F5A623" icon={Bot}          delta="+22%" />
      </div>

      {/* KPIs row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="New Signups (7d)"     target={342}   color="#2F80ED" icon={Activity} />
        <KpiTile label="Active Clubs"         target={892}   color="#1FB57A" icon={Globe} />
        <KpiTile label="Verified Records"     target={34102} color="#F5A623" icon={CheckCircle} />
        <KpiTile label="Recruitment Outcomes" target={1847}  color="#B8F135" icon={TrendingUp} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Platform Growth</p>
            <div className="flex gap-1">
              {(['users', 'revenue'] as const).map(k => (
                <button key={k} onClick={() => setChart(k)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize"
                  style={{
                    background: chart === k ? 'rgba(47,128,237,0.2)' : 'transparent',
                    color: chart === k ? '#2F80ED' : '#9DB0C6',
                    border: chart === k ? '1px solid rgba(47,128,237,0.3)' : '1px solid transparent',
                  }}>
                  {k === 'users' ? 'Users' : 'Revenue'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2F80ED" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVolt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#B8F135" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#B8F135" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              {chart === 'users'
                ? <Area type="monotone" dataKey="users"   stroke="#2F80ED" strokeWidth={2} fill="url(#gBlue)" name="Users" />
                : <Area type="monotone" dataKey="revenue" stroke="#B8F135" strokeWidth={2} fill="url(#gVolt)" name="Revenue" />
              }
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-bold text-white mb-4">Users by Role</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" innerRadius={36} outerRadius={55} dataKey="value" strokeWidth={0}>
                {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {roleData.map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span style={{ color: '#9DB0C6' }}>{r.name}</span>
                </div>
                <span className="font-semibold text-white">{r.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-bold text-white mb-4">Top Countries</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#9DB0C6', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="country" type="category" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="users" fill="#2F80ED" radius={[0, 4, 4, 0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Recent Activity</p>
            <a href="/admin/security" className="text-[11px] font-semibold" style={{ color: '#2F80ED' }}>Full audit log →</a>
          </div>
          <div className="space-y-2.5">
            {RECENT.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ color: '#9DB0C6' }}>{a.who}</span> · {a.action} ·{' '}
                    <span style={{ color: a.color }}>{a.target}</span>
                  </p>
                </div>
                <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#9DB0C6' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
