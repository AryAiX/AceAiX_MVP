import React, { useState } from 'react';
import {
  Bot, Zap, AlertTriangle, CheckCircle, Eye,
  BarChart3, ToggleLeft, ToggleRight, RefreshCw,
  Activity, ArrowUpRight,
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
  { id: 'f1', type: 'AI Score',     athlete: 'Marcus Silva',  value: '9.8/10',        reason: 'Score exceeds verified performance baseline',   time: '2h ago',  risk: 'high'   },
  { id: 'f2', type: 'Career Advice',athlete: 'Aisha Mensah',  value: 'Output text',   reason: 'Advice references unlicensed agents',           time: '5h ago',  risk: 'medium' },
  { id: 'f3', type: 'Match Stats',  athlete: 'Jin-ho Park',   value: '47 goals/season',reason: 'Statistical outlier vs. league average',       time: '1d ago',  risk: 'high'   },
  { id: 'f4', type: 'AI Score',     athlete: 'Priya Nair',    value: '6.1/10',        reason: 'Unexplained score drop (>2 pts) in 24h',        time: '1d ago',  risk: 'medium' },
];

const MODELS = [
  { id: 'perf',   name: 'Performance Scorer',     model: 'GPT-4o',       status: 'active',    latency: '320ms', accuracy: '96.2%', advisory: true  },
  { id: 'career', name: 'Career Coach',           model: 'Claude 3.5',   status: 'active',    latency: '480ms', accuracy: '94.8%', advisory: true  },
  { id: 'tag',    name: 'Highlight Tagger',       model: 'Vision-GPT4',  status: 'active',    latency: '1.2s',  accuracy: '91.4%', advisory: false },
  { id: 'scout',  name: 'Scout Match Recommender',model: 'Custom (v2)',  status: 'active',    latency: '290ms', accuracy: '88.7%', advisory: true  },
  { id: 'injury', name: 'Injury Risk Analyser',   model: 'MedLLM-v1',    status: 'suspended', latency: '—',     accuracy: '—',     advisory: true  },
];

const RATE_LIMITS = [
  { name: 'Career Coach (per user/day)',     used: 8,    limit: 20,   color: '#2F80ED' },
  { name: 'Performance Analysis (per user)', used: 3,    limit: 5,    color: '#1FB57A' },
  { name: 'Global API calls (per minute)',   used: 340,  limit: 500,  color: '#F5A623' },
  { name: 'AI Media Tagging (per day)',      used: 1240, limit: 2000, color: '#B8F135' },
];

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

function RiskChip({ risk }: { risk: string }) {
  const c = risk === 'high'
    ? { color: '#EF5350', bg: 'rgba(239,83,80,0.12)' }
    : risk === 'medium'
    ? { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' }
    : { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' };
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={c}>{risk}</span>;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview'        },
  { key: 'flagged',  label: 'Flagged Outputs' },
  { key: 'models',   label: 'Models'          },
  { key: 'usage',    label: 'Usage & Quotas'  },
];

export default function AiManagementPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [toggled, setToggled] = useState<Record<string, boolean>>({
    perf: true, career: true, tag: true, scout: true, injury: false,
  });

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(31,181,122,0); } 50% { box-shadow: 0 0 12px 2px rgba(31,181,122,0.2); } }
        .row-in { animation: rowSlideIn 0.3s ease both; }
        .model-card:hover { border-color: rgba(47,128,237,0.35) !important; box-shadow: 0 0 20px rgba(47,128,237,0.08); }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Management</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Performance monitoring, flagged outputs, model controls · All outputs marked advisory
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)', animation: 'pulseGlow 3s infinite' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            4 / 5 MODELS ACTIVE
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Requests Today', value: '3,840',  color: '#2F80ED', icon: Zap,          delta: '+22%'  },
            { label: 'Avg Latency',    value: '412ms',  color: '#1FB57A', icon: Activity,      delta: '-8ms'  },
            { label: 'Flagged (7d)',   value: '63',     color: '#F5A623', icon: AlertTriangle, delta: null    },
            { label: 'Models Active',  value: '4 / 5',  color: '#B8F135', icon: Bot,           delta: null    },
          ].map((s, i) => (
            <div key={s.label} className="rounded-xl p-4 row-in group cursor-default overflow-hidden relative"
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
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={13} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              {s.delta && (
                <p className="text-[11px] mt-0.5 flex items-center gap-0.5" style={{ color: '#1FB57A' }}>
                  <ArrowUpRight size={11} />{s.delta}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Advisory banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.2)' }}>
          <CheckCircle size={14} style={{ color: '#2F80ED', flexShrink: 0 }} />
          <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
            All AI-generated scores, recommendations, and analyses are marked <strong className="text-white">advisory only</strong> and subject to human review. Medical AI outputs require partner verification before surfacing to users.
          </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.15)' }}>
                  <BarChart3 size={13} style={{ color: '#2F80ED' }} />
                </div>
                <p className="text-sm font-bold text-white">Request Volume (7d)</p>
                <div className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#2F80ED' }}>
                    <span className="w-2 h-0.5 inline-block rounded" style={{ background: '#2F80ED' }} />Requests
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#F5A623' }}>
                    <span className="w-2 h-0.5 inline-block rounded" style={{ background: '#F5A623' }} />Flagged
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={usageData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="requests" stroke="#2F80ED" strokeWidth={2.5} dot={false} name="Requests" />
                  <Line type="monotone" dataKey="flagged"  stroke="#F5A623" strokeWidth={2}   dot={false} name="Flagged" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,241,53,0.12)' }}>
                  <Bot size={13} style={{ color: '#B8F135' }} />
                </div>
                <p className="text-sm font-bold text-white">Model Health</p>
              </div>
              <div className="space-y-3">
                {MODELS.map((m, i) => {
                  const on = toggled[m.id] ?? m.status === 'active';
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl row-in transition-colors"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 0.06}s` }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: on ? '#1FB57A' : '#EF5350', boxShadow: on ? '0 0 6px #1FB57A80' : 'none' }} />
                        <div>
                          <p className="text-xs font-semibold text-white">{m.name}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#9DB0C6' }}>{m.model} · {m.latency} · {m.accuracy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.advisory && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>ADVISORY</span>}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={on ? { background: 'rgba(31,181,122,0.12)', color: '#1FB57A' } : { background: 'rgba(239,83,80,0.12)', color: '#EF5350' }}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Flagged Outputs */}
        {tab === 'flagged' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '90px 1fr 1fr 110px 70px 110px' }}>
              <span>Type</span><span>Athlete</span><span>Reason</span><span>Value</span><span>Risk</span><span>Actions</span>
            </div>
            {FLAGGED.map((f, i) => (
              <div key={f.id} className="group grid px-4 py-3.5 items-center text-xs row-in"
                style={{
                  gridTemplateColumns: '90px 1fr 1fr 110px 70px 110px',
                  background: f.risk === 'high' ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: f.risk === 'high' ? '2px solid rgba(239,83,80,0.5)' : '2px solid transparent',
                  animationDelay: `${i * 0.07}s`,
                }}>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(47,128,237,0.1)', color: '#2F80ED' }}>{f.type}</span>
                <span className="text-white font-medium">{f.athlete}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{f.reason}</span>
                <code className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>{f.value}</code>
                <RiskChip risk={f.risk} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-emerald-500/20" style={{ color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)' }}>Approve</button>
                  <button className="px-2 py-1 rounded text-[10px] font-semibold transition-colors hover:bg-red-500/20" style={{ color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Models */}
        {tab === 'models' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 130px 80px 90px 80px 80px' }}>
              <span>Model</span><span>Provider</span><span>Latency</span><span>Accuracy</span><span>Advisory</span><span>Toggle</span>
            </div>
            {MODELS.map((m, i) => {
              const on = toggled[m.id] ?? m.status === 'active';
              return (
                <div key={m.id} className="group grid px-4 py-3.5 items-center text-xs row-in"
                  style={{
                    gridTemplateColumns: '1fr 130px 80px 90px 80px 80px',
                    background: !on ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    animationDelay: `${i * 0.06}s`,
                  }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: on ? '#1FB57A' : '#EF5350' }} />
                    <span className="text-white font-medium">{m.name}</span>
                  </div>
                  <code className="text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#9DB0C6' }}>{m.model}</code>
                  <span style={{ color: on ? '#9DB0C6' : 'rgba(255,255,255,0.3)' }}>{m.latency}</span>
                  <span style={{ color: on ? '#1FB57A' : 'rgba(255,255,255,0.3)' }}>{m.accuracy}</span>
                  {m.advisory
                    ? <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>YES</span>
                    : <span style={{ color: '#9DB0C6' }}>—</span>}
                  <button
                    onClick={() => setToggled(p => ({ ...p, [m.id]: !on }))}
                    className="transition-all"
                    style={{ color: on ? '#1FB57A' : '#EF5350', filter: on ? 'drop-shadow(0 0 4px #1FB57A80)' : 'none' }}
                  >
                    {on ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Usage */}
        {tab === 'usage' && (
          <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.15)' }}>
                  <BarChart3 size={13} style={{ color: '#2F80ED' }} />
                </div>
                <p className="text-sm font-bold text-white">Rate Limits & Quotas</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: '#2F80ED', border: '1px solid rgba(47,128,237,0.2)' }}>
                <RefreshCw size={11} />Refresh
              </button>
            </div>
            <div className="space-y-5">
              {RATE_LIMITS.map((r, i) => {
                const pct = Math.round((r.used / r.limit) * 100);
                const isHigh = pct >= 80;
                return (
                  <div key={r.name} className="row-in" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{r.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: r.color }}>{r.used.toLocaleString()}</span>
                        <span style={{ color: '#9DB0C6' }}>/ {r.limit.toLocaleString()}</span>
                        <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: isHigh ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.06)', color: isHigh ? '#F5A623' : '#9DB0C6' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: r.color,
                          boxShadow: `0 0 8px ${r.color}80`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
