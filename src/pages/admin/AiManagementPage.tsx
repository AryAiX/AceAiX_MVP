import React, { useState } from 'react';
import {
  Bot, Zap, AlertTriangle, CheckCircle, XCircle, Eye,
  BarChart3, Sliders, ToggleLeft, ToggleRight, RefreshCw, Loader2,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Tab = 'overview' | 'flagged' | 'models' | 'usage';

const usageData = [
  { day: 'Mon', requests: 3100, flagged: 12 },
  { day: 'Tue', requests: 3450, flagged: 9  },
  { day: 'Wed', requests: 2980, flagged: 14 },
  { day: 'Thu', requests: 3840, flagged: 12 },
  { day: 'Fri', requests: 4200, flagged: 7  },
  { day: 'Sat', requests: 2600, flagged: 5  },
  { day: 'Sun', requests: 2200, flagged: 4  },
];

const FLAGGED = [
  { id: 'f1', type: 'AI Score',    athlete: 'Marcus Silva',  value: '9.8/10', reason: 'Score exceeds verified performance baseline', time: '2h ago',  risk: 'high' },
  { id: 'f2', type: 'Career Advice', athlete: 'Aisha Mensah', value: 'Output text', reason: 'Advice references unlicensed agents',       time: '5h ago',  risk: 'medium' },
  { id: 'f3', type: 'Match Stats', athlete: 'Jin-ho Park',   value: '47 goals/season', reason: 'Statistical outlier vs. league average', time: '1d ago',  risk: 'high' },
  { id: 'f4', type: 'AI Score',    athlete: 'Priya Nair',    value: '6.1/10', reason: 'Unexplained score drop (>2 pts) in 24h',         time: '1d ago',  risk: 'medium' },
];

const MODELS = [
  { id: 'm1', name: 'Performance Scorer',      model: 'GPT-4o',        status: 'active',    latency: '320ms', accuracy: '96.2%', advisory: true  },
  { id: 'm2', name: 'Career Coach',            model: 'Claude 3.5',    status: 'active',    latency: '480ms', accuracy: '94.8%', advisory: true  },
  { id: 'm3', name: 'Highlight Tagger',        model: 'Vision-GPT4',   status: 'active',    latency: '1.2s',  accuracy: '91.4%', advisory: false },
  { id: 'm4', name: 'Scout Match Recommender', model: 'Custom (v2)',   status: 'active',    latency: '290ms', accuracy: '88.7%', advisory: true  },
  { id: 'm5', name: 'Injury Risk Analyser',    model: 'MedLLM-v1',     status: 'suspended', latency: '—',     accuracy: '—',     advisory: true  },
];

function RiskChip({ risk }: { risk: string }) {
  const c = risk === 'high' ? { color: '#EF5350', bg: 'rgba(239,83,80,0.12)' }
          : risk === 'medium' ? { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' }
          : { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' };
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={c}>{risk}</span>;
}

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AiManagementPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [toggled, setToggled] = useState<Record<string, boolean>>({ perf: true, career: true, tag: true, scout: true, injury: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Management</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
          Performance monitoring, flagged outputs, model controls · All outputs marked advisory/human-reviewed
        </p>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Requests Today',  value: '3,840',  color: '#2F80ED', icon: Zap },
          { label: 'Avg Latency',     value: '412ms',  color: '#1FB57A', icon: BarChart3 },
          { label: 'Flagged (7d)',    value: '63',     color: '#F5A623', icon: AlertTriangle },
          { label: 'Models Active',   value: '4 / 5',  color: '#B8F135', icon: Bot },
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

      {/* Advisory banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.2)' }}>
        <CheckCircle size={14} style={{ color: '#2F80ED', flexShrink: 0 }} />
        <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
          All AI-generated scores, recommendations, and analyses are marked <strong className="text-white">advisory only</strong> and subject to human review. Medical AI outputs require partner verification before being surfaced to users.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['overview','flagged','models','usage'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={{
              background: tab === t ? 'rgba(47,128,237,0.15)' : 'transparent',
              color: tab === t ? '#2F80ED' : '#9DB0C6',
              border: tab === t ? '1px solid rgba(47,128,237,0.3)' : '1px solid transparent',
            }}>
            {t === 'flagged' ? 'Flagged Outputs' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-bold text-white mb-4">Request Volume (7d)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={usageData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="requests" stroke="#2F80ED" strokeWidth={2} dot={false} name="Requests" />
                <Line type="monotone" dataKey="flagged"  stroke="#F5A623" strokeWidth={2} dot={false} name="Flagged" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl p-5 space-y-3" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-bold text-white">Model Health</p>
            {MODELS.map(m => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-white font-medium">{m.name}</p>
                  <p style={{ color: '#9DB0C6' }}>{m.model} · {m.latency} · {m.accuracy}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m.advisory && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>ADVISORY</span>}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={m.status === 'active' ? { background: 'rgba(31,181,122,0.12)', color: '#1FB57A' } : { background: 'rgba(239,83,80,0.12)', color: '#EF5350' }}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'flagged' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '80px 1fr 1fr 100px 80px 100px' }}>
            <span>Type</span><span>Athlete</span><span>Reason</span><span>Value</span><span>Risk</span><span>Actions</span>
          </div>
          {FLAGGED.map((f, i) => (
            <div key={f.id} className="grid px-4 py-3 items-center text-xs"
              style={{
                gridTemplateColumns: '80px 1fr 1fr 100px 80px 100px',
                background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
              <span style={{ color: '#9DB0C6' }}>{f.type}</span>
              <span className="text-white font-medium">{f.athlete}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{f.reason}</span>
              <code className="text-[10px] font-mono" style={{ color: '#F5A623' }}>{f.value}</code>
              <RiskChip risk={f.risk} />
              <div className="flex gap-1">
                <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-emerald-500/20" style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Approve</button>
                <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-red-500/20" style={{ color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'models' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 120px 80px 80px 80px 80px' }}>
            <span>Model</span><span>Provider</span><span>Latency</span><span>Accuracy</span><span>Advisory</span><span>Toggle</span>
          </div>
          {MODELS.map((m, i) => {
            const on = toggled[m.id] ?? m.status === 'active';
            return (
              <div key={m.id} className="grid px-4 py-3 items-center text-xs"
                style={{
                  gridTemplateColumns: '1fr 120px 80px 80px 80px 80px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                <span className="text-white font-medium">{m.name}</span>
                <code className="text-[11px] font-mono" style={{ color: '#9DB0C6' }}>{m.model}</code>
                <span style={{ color: '#9DB0C6' }}>{m.latency}</span>
                <span style={{ color: '#1FB57A' }}>{m.accuracy}</span>
                {m.advisory
                  ? <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>YES</span>
                  : <span style={{ color: '#9DB0C6' }}>—</span>}
                <button onClick={() => setToggled(p => ({ ...p, [m.id]: !on }))}
                  style={{ color: on ? '#1FB57A' : '#EF5350' }}>
                  {on ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'usage' && (
        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Rate Limits & Quotas</p>
            <button className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#2F80ED' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Career Coach (per user/day)',    used: 8, limit: 20, color: '#2F80ED' },
              { name: 'Performance Analysis (per user)', used: 3, limit: 5, color: '#1FB57A' },
              { name: 'Global API calls (per minute)',   used: 340, limit: 500, color: '#F5A623' },
              { name: 'AI Media Tagging (per day)',      used: 1240, limit: 2000, color: '#B8F135' },
            ].map(r => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span style={{ color: '#9DB0C6' }}>{r.name}</span>
                  <span style={{ color: r.color }}>{r.used.toLocaleString()} / {r.limit.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(r.used / r.limit) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
