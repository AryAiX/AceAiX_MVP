import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Building2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

type Tab = 'overview' | 'subscriptions' | 'payouts' | 'refunds';

const MRR_DATA = [
  { month: 'Jan', mrr: 38000, new: 4200, churn: 1100 },
  { month: 'Feb', mrr: 41000, new: 4800, churn: 1200 },
  { month: 'Mar', mrr: 44000, new: 5100, churn: 1400 },
  { month: 'Apr', mrr: 49000, new: 6200, churn: 1100 },
  { month: 'May', mrr: 54000, new: 6900, churn: 1200 },
  { month: 'Jun', mrr: 62000, new: 8400, churn: 900  },
  { month: 'Jul', mrr: 70400, new: 9800, churn: 1400 },
];

const REVENUE_BY_PLAN = [
  { plan: 'Pro',          revenue: 54093 },
  { plan: 'Elite',        revenue: 27538 },
  { plan: 'Scout Pro',    revenue: 50049 },
  { plan: 'Scout Basic',  revenue: 38016 },
  { plan: 'Club Starter', revenue: 65082 },
  { plan: 'Club Pro',     revenue: 71111 },
  { plan: 'Federation',   revenue: 35988 },
];

const SUBSCRIPTIONS = [
  { id: 'sub1', org: 'FC Barcelona Academy', type: 'Club Professional', amount: 799,  status: 'active',   next: '2026-07-15', seats: 20  },
  { id: 'sub2', org: 'Marcus Silva',          type: 'Elite',             amount: 49,   status: 'active',   next: '2026-07-01', seats: 1   },
  { id: 'sub3', org: 'SportSync Recruitment', type: 'Scout Pro',         amount: 249,  status: 'active',   next: '2026-07-08', seats: 3   },
  { id: 'sub4', org: 'World Athletics Fed.',  type: 'Federation',        amount: 2999, status: 'active',   next: '2026-09-01', seats: 999 },
  { id: 'sub5', org: 'Aisha Mensah',          type: 'Pro',               amount: 19,   status: 'past_due', next: '2026-06-28', seats: 1   },
  { id: 'sub6', org: 'Ajax Youth Academy',    type: 'Club Starter',      amount: 299,  status: 'active',   next: '2026-07-20', seats: 5   },
];

const PAYOUTS = [
  { id: 'p1', partner: 'SportSync Recruitment', type: 'Commission', amount: 3840, period: 'Jun 2026', status: 'pending',  due: '2026-06-30' },
  { id: 'p2', partner: 'MedTech Partners',       type: 'Referral',   amount: 1200, period: 'Jun 2026', status: 'pending',  due: '2026-06-30' },
  { id: 'p3', partner: 'ScoutNet Global',         type: 'Commission', amount: 4760, period: 'Jun 2026', status: 'approved', due: '2026-06-30' },
  { id: 'p4', partner: 'AcademyPro Ltd',          type: 'Affiliate',  amount: 600,  period: 'Jun 2026', status: 'paid',     due: '2026-06-15' },
  { id: 'p5', partner: 'EliteSport Agency',       type: 'Commission', amount: 2200, period: 'May 2026', status: 'paid',     due: '2026-05-31' },
];

const REFUNDS = [
  { id: 'r1', user: 'Jin-ho Park',    plan: 'Elite',        amount: 49,  date: '2026-06-15', reason: 'Accidental upgrade',  status: 'approved'  },
  { id: 'r2', user: 'Priya Nair',     plan: 'Pro',          amount: 19,  date: '2026-06-12', reason: 'Duplicate charge',    status: 'processed' },
  { id: 'r3', user: 'Carlos Mendoza', plan: 'Scout Pro',    amount: 249, date: '2026-06-10', reason: 'Service issue',       status: 'pending'   },
  { id: 'r4', user: 'Lena Fischer',   plan: 'Club Starter', amount: 299, date: '2026-06-08', reason: 'Account dispute',     status: 'rejected'  },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:    { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  past_due:  { color: '#EF5350', bg: 'rgba(239,83,80,0.12)'   },
  pending:   { color: '#F5A623', bg: 'rgba(245,166,35,0.12)'  },
  approved:  { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)'  },
  paid:      { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  processed: { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  rejected:  { color: '#EF5350', bg: 'rgba(239,83,80,0.12)'   },
};

function Chip({ label }: { label: string }) {
  const s = STATUS_STYLE[label] ?? { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' };
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={s}>{label.replace('_', ' ')}</span>;
}

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: ${p.value.toLocaleString()}</p>)}
    </div>
  );
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',      label: 'Overview'       },
  { key: 'subscriptions', label: 'Subscriptions'  },
  { key: 'payouts',       label: 'Payouts'        },
  { key: 'refunds',       label: 'Refunds'        },
];

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        .row-in { animation: rowSlideIn 0.3s ease both; }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Finance & Billing</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>Revenue, subscriptions, partner payouts, refunds</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
            <Download size={13} />Export CSV
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'MRR',              value: '$70.4k', delta: '+13.2%', up: true,  color: '#B8F135', icon: DollarSign },
            { label: 'ARR',              value: '$845k',  delta: '+18.4%', up: true,  color: '#2F80ED', icon: TrendingUp },
            { label: 'Pending Payouts',  value: '$9,800', delta: '3 partners', up: false, color: '#F5A623', icon: CreditCard },
            { label: 'Refund Rate',      value: '0.8%',   delta: '-0.2%',  up: true,  color: '#1FB57A', icon: RefreshCw  },
          ].map((s, i) => (
            <div key={s.label}
              className="rounded-xl p-4 row-in group cursor-default overflow-hidden relative"
              style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.07}s`, transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${s.color}40`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${s.color}12`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                style={{ background: `radial-gradient(ellipse at top left, ${s.color}08 0%, transparent 70%)` }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={14} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] mt-0.5 flex items-center gap-0.5" style={{ color: s.up ? '#1FB57A' : '#F5A623' }}>
                {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{s.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: tab === t.key ? 'rgba(47,128,237,0.15)' : 'transparent',
                color: tab === t.key ? '#2F80ED' : '#9DB0C6',
                border: tab === t.key ? '1px solid rgba(47,128,237,0.3)' : '1px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-5" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-bold text-white mb-4">MRR Growth (7mo)</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={MRR_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gVolt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#B8F135" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#B8F135" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="mrr" stroke="#B8F135" strokeWidth={2.5} fill="url(#gVolt)" name="MRR" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-bold text-white mb-4">Revenue by Plan</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={REVENUE_BY_PLAN} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="plan" tick={{ fill: '#9DB0C6', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="revenue" fill="#2F80ED" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { label: 'New MRR (Jun)', value: '$9,800',  color: '#1FB57A', bg: 'rgba(31,181,122,0.08)' },
                { label: 'Churned MRR',  value: '$1,400',  color: '#EF5350', bg: 'rgba(239,83,80,0.08)'  },
                { label: 'Net New MRR',  value: '+$8,400', color: '#B8F135', bg: 'rgba(184,241,53,0.08)' },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-4 text-center row-in"
                  style={{ background: m.bg, border: `1px solid ${m.color}25` }}>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{m.label}</p>
                  <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {tab === 'subscriptions' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 140px 90px 80px 100px 60px' }}>
              <span>Organization</span><span>Plan</span><span>Amount</span><span>Status</span><span>Next Billing</span><span>Seats</span>
            </div>
            {SUBSCRIPTIONS.map((s, i) => (
              <div key={s.id} className="grid px-4 py-3.5 items-center text-xs group row-in"
                style={{
                  gridTemplateColumns: '1fr 140px 90px 80px 100px 60px',
                  background: s.status === 'past_due' ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: s.status === 'past_due' ? '2px solid #EF5350' : '2px solid transparent',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(47,128,237,0.15)' }}>
                    <Building2 size={11} style={{ color: '#2F80ED' }} />
                  </div>
                  <span className="text-white font-medium truncate">{s.org}</span>
                </div>
                <span style={{ color: '#9DB0C6' }}>{s.type}</span>
                <span className="font-bold" style={{ color: '#B8F135' }}>${s.amount}/mo</span>
                <Chip label={s.status} />
                <span style={{ color: '#9DB0C6' }}>{s.next}</span>
                <span style={{ color: '#9DB0C6' }}>{s.seats === 999 ? '∞' : s.seats}</span>
              </div>
            ))}
          </div>
        )}

        {/* Payouts */}
        {tab === 'payouts' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 100px 90px 80px 100px 120px' }}>
              <span>Partner</span><span>Type</span><span>Amount</span><span>Status</span><span>Due</span><span>Actions</span>
            </div>
            {PAYOUTS.map((p, i) => (
              <div key={p.id} className="grid px-4 py-3.5 items-center text-xs group row-in"
                style={{
                  gridTemplateColumns: '1fr 100px 90px 80px 100px 120px',
                  background: p.status === 'pending' ? 'rgba(245,166,35,0.03)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: p.status === 'pending' ? '2px solid rgba(245,166,35,0.5)' : '2px solid transparent',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <span className="text-white font-medium">{p.partner}</span>
                <span style={{ color: '#9DB0C6' }}>{p.type}</span>
                <span className="font-bold" style={{ color: '#B8F135' }}>${p.amount.toLocaleString()}</span>
                <Chip label={p.status} />
                <span style={{ color: '#9DB0C6' }}>{p.due}</span>
                <div className="flex gap-1">
                  {p.status === 'pending' && (
                    <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-blue-500/20"
                      style={{ color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>Approve</button>
                  )}
                  {p.status === 'approved' && (
                    <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-emerald-500/20"
                      style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Mark Paid</button>
                  )}
                  {p.status === 'paid' && (
                    <span className="px-2 py-1 text-[10px]" style={{ color: '#9DB0C6' }}>Paid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refunds */}
        {tab === 'refunds' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 120px 90px 100px 1fr 100px' }}>
              <span>User</span><span>Plan</span><span>Amount</span><span>Date</span><span>Reason</span><span>Status</span>
            </div>
            {REFUNDS.map((r, i) => (
              <div key={r.id} className="grid px-4 py-3.5 items-center text-xs row-in"
                style={{
                  gridTemplateColumns: '1fr 120px 90px 100px 1fr 100px',
                  background: r.status === 'pending' ? 'rgba(245,166,35,0.03)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <span className="text-white font-medium">{r.user}</span>
                <span style={{ color: '#9DB0C6' }}>{r.plan}</span>
                <span className="font-semibold" style={{ color: '#EF5350' }}>-${r.amount}</span>
                <span style={{ color: '#9DB0C6' }}>{r.date}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{r.reason}</span>
                <Chip label={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
