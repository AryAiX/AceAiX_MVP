import React, { useState } from 'react';
import {
  Flag, Link2, ShieldCheck, Eye, EyeOff,
  RefreshCw, AlertTriangle, Settings,
  Cpu, Globe, MessageSquare, Activity,
  ToggleLeft, ToggleRight, CheckCircle, XCircle,
} from 'lucide-react';

type Tab = 'flags' | 'integrations' | 'environment';

const FLAGS = [
  { id: 'ai_career_coach',      label: 'AI Career Coach',        description: 'Enable AI career advice for Pro/Elite athletes', env: 'production', enabled: true,  rollout: 100 },
  { id: 'minor_safeguarding',   label: 'Minor Safeguarding',     description: 'Extra review gates for under-18 accounts',       env: 'production', enabled: true,  rollout: 100 },
  { id: 'rtl_arabic',           label: 'RTL Arabic UI',          description: 'RTL layout for AR-locale users',                 env: 'production', enabled: true,  rollout: 100 },
  { id: 'live_scores',          label: 'Live Match Scores',       description: 'Ingest and surface live score overlays',        env: 'production', enabled: true,  rollout: 50  },
  { id: 'injury_risk_ai',       label: 'Injury Risk AI',         description: 'MedLLM-v1 injury probability scoring',          env: 'production', enabled: false, rollout: 0   },
  { id: 'subscription_billing', label: 'Subscription Billing',   description: 'Stripe payment & subscription management',      env: 'production', enabled: true,  rollout: 100 },
  { id: 'highlight_tagging',    label: 'Highlight Auto-Tagging', description: 'Vision AI auto-tags uploaded highlight reels',  env: 'production', enabled: true,  rollout: 75  },
  { id: 'federation_api',       label: 'Federation API',         description: 'Expose read API for federation partners',       env: 'staging',    enabled: false, rollout: 0   },
  { id: 'competition_search',   label: 'Competition Search',     description: 'Multi-sport competition catalog search UI',     env: 'production', enabled: true,  rollout: 100 },
  { id: 'new_onboarding',       label: 'New Onboarding Flow',    description: 'Redesigned 5-step athlete onboarding',         env: 'staging',    enabled: true,  rollout: 20  },
];

const INTEGRATIONS = [
  {
    category: 'Sports Data', icon: Activity, color: '#2F80ED',
    providers: [
      { id: 'api_football',   name: 'API-Football',   status: 'connected', latency: '280ms', keyHint: 'sk-af…c3d9', lastSync: '2h ago' },
      { id: 'api_basketball', name: 'API-Basketball', status: 'connected', latency: '310ms', keyHint: 'sk-ab…7f12', lastSync: '3h ago' },
      { id: 'api_cricket',    name: 'API-Cricket',    status: 'error',     latency: '—',     keyHint: 'sk-ac…e501', lastSync: '2d ago' },
    ],
  },
  {
    category: 'AI Providers', icon: Cpu, color: '#B8F135',
    providers: [
      { id: 'openai',    name: 'OpenAI (GPT-4o)',   status: 'connected', latency: '320ms', keyHint: 'sk-…a8e2', lastSync: 'live'  },
      { id: 'anthropic', name: 'Anthropic (Claude)',status: 'connected', latency: '480ms', keyHint: 'sk-…9f34', lastSync: 'live'  },
      { id: 'medllm',    name: 'MedLLM-v1',         status: 'suspended', latency: '—',     keyHint: 'ml-…1bc0', lastSync: '5d ago'},
    ],
  },
  {
    category: 'Payments', icon: ShieldCheck, color: '#1FB57A',
    providers: [
      { id: 'stripe', name: 'Stripe', status: 'connected', latency: '190ms', keyHint: 'sk_live_…4d88', lastSync: 'live' },
    ],
  },
  {
    category: 'Messaging', icon: MessageSquare, color: '#F5A623',
    providers: [
      { id: 'sendgrid', name: 'SendGrid (Email)', status: 'connected', latency: '120ms', keyHint: 'SG.…b92c',  lastSync: 'live' },
      { id: 'twilio',   name: 'Twilio (SMS)',     status: 'connected', latency: '210ms', keyHint: 'AC…3e11',   lastSync: 'live' },
      { id: 'firebase', name: 'Firebase (Push)',  status: 'connected', latency: '95ms',  keyHint: '…json',     lastSync: 'live' },
    ],
  },
];

const ENV_VARS = [
  { key: 'SUPABASE_URL',            value: 'https://*****.supabase.co', masked: true,  category: 'Database'  },
  { key: 'SUPABASE_ANON_KEY',       value: 'eyJ…[masked]',             masked: true,  category: 'Database'  },
  { key: 'SPORTS_API_KEY',          value: 'sk-af…[masked]',           masked: true,  category: 'Sports'    },
  { key: 'OPENAI_API_KEY',          value: 'sk-…[masked]',             masked: true,  category: 'AI'        },
  { key: 'ANTHROPIC_API_KEY',       value: 'sk-ant-…[masked]',         masked: true,  category: 'AI'        },
  { key: 'STRIPE_SECRET_KEY',       value: 'sk_live_…[masked]',        masked: true,  category: 'Payments'  },
  { key: 'SENDGRID_API_KEY',        value: 'SG.…[masked]',             masked: true,  category: 'Messaging' },
  { key: 'APP_ENV',                 value: 'production',               masked: false, category: 'Config'    },
  { key: 'MAX_AI_REQUESTS_PER_MIN', value: '500',                      masked: false, category: 'Config'    },
  { key: 'MINOR_AGE_THRESHOLD',     value: '18',                       masked: false, category: 'Config'    },
];

const STATUS_DOT: Record<string, string> = {
  connected: '#1FB57A', error: '#EF5350', suspended: '#F5A623',
};

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'flags',        label: 'Feature Flags', icon: Flag,     color: '#2F80ED' },
  { key: 'integrations', label: 'Integrations',  icon: Link2,    color: '#1FB57A' },
  { key: 'environment',  label: 'Environment',   icon: Settings, color: '#F5A623' },
];

export default function SystemConfigPage() {
  const [tab, setTab] = useState<Tab>('flags');
  const [flagState, setFlagState] = useState<Record<string, boolean>>(
    Object.fromEntries(FLAGS.map(f => [f.id, f.enabled]))
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const enabledCount = Object.values(flagState).filter(Boolean).length;
  const errorCount = INTEGRATIONS.flatMap(c => c.providers).filter(p => p.status === 'error').length;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        @keyframes toggleOn { from { transform: scale(0.8); } to { transform: scale(1); } }
        .row-in { animation: rowSlideIn 0.3s ease both; }
        .toggle-animate { animation: toggleOn 0.2s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">System Configuration</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Feature flags · API integrations & health · Environment variables
            </p>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)' }}>
              <AlertTriangle size={12} />
              {errorCount} INTEGRATION ERROR{errorCount > 1 ? 'S' : ''}
            </div>
          )}
        </div>

        {/* Env strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Environment', value: 'Production', color: '#1FB57A', pulse: true  },
            { label: 'App Version', value: 'v1.4.2',     color: '#2F80ED', pulse: false },
            { label: 'DB Region',   value: 'EU (fra1)',  color: '#B8F135', pulse: false },
            { label: 'Flags Active',value: `${enabledCount} / ${FLAGS.length}`, color: '#F5A623', pulse: false },
          ].map((s, i) => (
            <div key={s.label} className="rounded-xl px-4 py-3 flex items-center gap-3 row-in"
              style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.06}s` }}>
              {s.pulse && <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: s.color }} />}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#9DB0C6' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center"
              style={{
                background: tab === t.key ? '#0F1E32' : 'transparent',
                color: tab === t.key ? t.color : '#9DB0C6',
                boxShadow: tab === t.key ? '0 1px 8px rgba(0,0,0,0.3)' : 'none',
              }}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* Feature Flags */}
        {tab === 'flags' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 1fr 90px 110px 60px' }}>
              <span>Flag</span><span>Description</span><span>Env</span><span>Rollout</span><span>Toggle</span>
            </div>
            {FLAGS.map((f, i) => {
              const on = flagState[f.id] ?? f.enabled;
              return (
                <div key={f.id}
                  className="group grid px-4 py-3.5 items-center text-xs row-in"
                  style={{
                    gridTemplateColumns: '1fr 1fr 90px 110px 60px',
                    background: !on ? 'rgba(239,83,80,0.03)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: on ? '2px solid rgba(31,181,122,0.4)' : '2px solid rgba(239,83,80,0.3)',
                    animationDelay: `${i * 0.03}s`,
                    transition: 'background 0.15s',
                  }}>
                  <div>
                    <p className="text-white font-semibold">{f.label}</p>
                    <code className="text-[10px] font-mono" style={{ color: '#7C8DA6' }}>{f.id}</code>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>{f.description}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase w-fit"
                    style={f.env === 'production'
                      ? { background: 'rgba(31,181,122,0.12)', color: '#1FB57A' }
                      : { background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                    {f.env}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${f.rollout}%`, background: on ? '#2F80ED' : 'rgba(157,176,198,0.3)', boxShadow: on && f.rollout > 0 ? '0 0 6px #2F80ED60' : 'none' }} />
                    </div>
                    <span className="text-[10px] w-7 text-right" style={{ color: '#9DB0C6' }}>{f.rollout}%</span>
                  </div>
                  <button
                    onClick={() => setFlagState(p => ({ ...p, [f.id]: !on }))}
                    className="transition-all"
                    style={{ color: on ? '#1FB57A' : '#EF5350', filter: on ? 'drop-shadow(0 0 4px #1FB57A60)' : 'none' }}>
                    {on ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Integrations */}
        {tab === 'integrations' && (
          <div className="space-y-5" style={{ animation: 'fadeIn 0.3s ease' }}>
            {INTEGRATIONS.map((cat, ci) => (
              <div key={cat.category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}18` }}>
                    <cat.icon size={12} style={{ color: cat.color }} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>{cat.category}</p>
                  <div className="flex-1 h-px" style={{ background: `${cat.color}20` }} />
                  <span className="text-[10px]" style={{ color: '#7C8DA6' }}>
                    {cat.providers.filter(p => p.status === 'connected').length}/{cat.providers.length} healthy
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {cat.providers.map((p, i) => (
                    <div key={p.id}
                      className="flex items-center gap-4 px-4 py-3.5 text-xs group row-in"
                      style={{
                        background: p.status === 'error' ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                        borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        borderLeft: p.status === 'error' ? '2px solid rgba(239,83,80,0.5)' : p.status === 'suspended' ? '2px solid rgba(245,166,35,0.4)' : '2px solid transparent',
                        animationDelay: `${(ci * 3 + i) * 0.04}s`,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = p.status === 'error' ? 'rgba(239,83,80,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)'}
                    >
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="w-2 h-2 rounded-full" style={{ background: STATUS_DOT[p.status] ?? '#9DB0C6', boxShadow: p.status === 'connected' ? '0 0 6px #1FB57A80' : 'none' }} />
                        {p.status === 'connected'
                          ? <CheckCircle size={12} style={{ color: '#1FB57A' }} />
                          : p.status === 'error'
                          ? <XCircle size={12} style={{ color: '#EF5350' }} />
                          : <AlertTriangle size={12} style={{ color: '#F5A623' }} />}
                      </div>
                      <span className="text-white font-semibold w-44 flex-shrink-0">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                        style={p.status === 'connected'
                          ? { background: 'rgba(31,181,122,0.12)', color: '#1FB57A' }
                          : p.status === 'error'
                          ? { background: 'rgba(239,83,80,0.12)', color: '#EF5350' }
                          : { background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                        {p.status}
                      </span>
                      <span className="ml-2" style={{ color: '#9DB0C6' }}>{p.latency}</span>
                      <code className="ml-2 text-[11px] font-mono flex-1" style={{ color: '#7C8DA6' }}>{p.keyHint}</code>
                      <span className="text-[10px] flex-shrink-0" style={{ color: p.lastSync === 'live' ? '#1FB57A' : '#9DB0C6' }}>
                        {p.lastSync === 'live' ? '● live' : `Last: ${p.lastSync}`}
                      </span>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 opacity-0 group-hover:opacity-100"
                        style={{ color: '#2F80ED' }}>
                        <RefreshCw size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Environment */}
        {tab === 'environment' && (
          <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <AlertTriangle size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Secret values are masked. All reveals are logged to the audit trail with actor, timestamp, and IP.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '220px 90px 1fr 50px' }}>
                <span>Key</span><span>Category</span><span>Value</span><span>Reveal</span>
              </div>
              {ENV_VARS.map((v, i) => {
                const catColor = v.category === 'Database' ? '#2F80ED' : v.category === 'AI' ? '#B8F135' : v.category === 'Payments' ? '#1FB57A' : v.category === 'Messaging' ? '#F5A623' : '#9DB0C6';
                return (
                  <div key={v.key} className="group grid px-4 py-3 items-center text-xs row-in"
                    style={{
                      gridTemplateColumns: '220px 90px 1fr 50px',
                      background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      animationDelay: `${i * 0.03}s`,
                    }}>
                    <code className="text-[11px] font-mono font-semibold text-white">{v.key}</code>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md w-fit"
                      style={{ background: `${catColor}15`, color: catColor }}>{v.category}</span>
                    <code className="text-[11px] font-mono" style={{ color: revealed[v.key] ? '#B8F135' : '#7C8DA6' }}>
                      {revealed[v.key] ? v.value : v.masked ? '••••••••••••••••' : v.value}
                    </code>
                    {v.masked ? (
                      <button
                        onClick={() => setRevealed(p => ({ ...p, [v.key]: !p[v.key] }))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: revealed[v.key] ? '#B8F135' : '#9DB0C6' }}>
                        {revealed[v.key] ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                    ) : <span />}
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
