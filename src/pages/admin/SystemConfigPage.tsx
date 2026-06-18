import React, { useState } from 'react';
import {
  Flag, Zap, Link2, ShieldCheck, Eye, EyeOff,
  RefreshCw, CheckCircle, XCircle, AlertTriangle, Settings,
  Cpu, Globe, MessageSquare, Activity,
  ToggleLeft, ToggleRight, Sliders,
} from 'lucide-react';

type Tab = 'flags' | 'integrations' | 'environment';

// ── Feature flags ─────────────────────────────────────────────────────────────

const FLAGS = [
  { id: 'ai_career_coach',      label: 'AI Career Coach',         description: 'Enable AI career advice for Pro/Elite athletes', env: 'production', enabled: true,  rollout: 100 },
  { id: 'minor_safeguarding',   label: 'Minor Safeguarding',      description: 'Extra review gates for under-18 accounts',       env: 'production', enabled: true,  rollout: 100 },
  { id: 'rtl_arabic',           label: 'RTL Arabic UI',           description: 'RTL layout for AR-locale users',                 env: 'production', enabled: true,  rollout: 100 },
  { id: 'live_scores',          label: 'Live Match Scores',        description: 'Ingest and surface live score overlays',        env: 'production', enabled: true,  rollout: 50  },
  { id: 'injury_risk_ai',       label: 'Injury Risk AI',          description: 'MedLLM-v1 injury probability scoring',          env: 'production', enabled: false, rollout: 0   },
  { id: 'subscription_billing', label: 'Subscription Billing',    description: 'Stripe payment & subscription management',      env: 'production', enabled: true,  rollout: 100 },
  { id: 'highlight_tagging',    label: 'Highlight Auto-Tagging',  description: 'Vision AI auto-tags uploaded highlight reels',  env: 'production', enabled: true,  rollout: 75  },
  { id: 'federation_api',       label: 'Federation API',          description: 'Expose read API for federation partners',       env: 'staging',    enabled: false, rollout: 0   },
  { id: 'competition_search',   label: 'Competition Search',      description: 'Multi-sport competition catalog search UI',     env: 'production', enabled: true,  rollout: 100 },
  { id: 'new_onboarding',       label: 'New Onboarding Flow',     description: 'Redesigned 5-step athlete onboarding',         env: 'staging',    enabled: true,  rollout: 20  },
];

// ── Integrations ──────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  {
    category: 'Sports Data',
    icon: Activity,
    color: '#2F80ED',
    providers: [
      { id: 'api_football',  name: 'API-Football',     status: 'connected', latency: '280ms', keyHint: 'sk-af…c3d9', lastSync: '2h ago'  },
      { id: 'api_basketball',name: 'API-Basketball',   status: 'connected', latency: '310ms', keyHint: 'sk-ab…7f12', lastSync: '3h ago'  },
      { id: 'api_cricket',   name: 'API-Cricket',      status: 'error',     latency: '—',     keyHint: 'sk-ac…e501', lastSync: '2d ago'  },
    ],
  },
  {
    category: 'AI Providers',
    icon: Cpu,
    color: '#B8F135',
    providers: [
      { id: 'openai',   name: 'OpenAI (GPT-4o)',   status: 'connected', latency: '320ms', keyHint: 'sk-…a8e2', lastSync: 'live' },
      { id: 'anthropic',name: 'Anthropic (Claude)', status: 'connected', latency: '480ms', keyHint: 'sk-…9f34', lastSync: 'live' },
      { id: 'medllm',   name: 'MedLLM-v1',         status: 'suspended', latency: '—',     keyHint: 'ml-…1bc0', lastSync: '5d ago' },
    ],
  },
  {
    category: 'Payments',
    icon: ShieldCheck,
    color: '#1FB57A',
    providers: [
      { id: 'stripe', name: 'Stripe', status: 'connected', latency: '190ms', keyHint: 'sk_live_…4d88', lastSync: 'live' },
    ],
  },
  {
    category: 'Messaging',
    icon: MessageSquare,
    color: '#F5A623',
    providers: [
      { id: 'sendgrid', name: 'SendGrid (Email)', status: 'connected', latency: '120ms', keyHint: 'SG.…b92c', lastSync: 'live'   },
      { id: 'twilio',   name: 'Twilio (SMS)',     status: 'connected', latency: '210ms', keyHint: 'AC…3e11', lastSync: 'live'   },
      { id: 'firebase', name: 'Firebase (Push)',  status: 'connected', latency: '95ms',  keyHint: '…json', lastSync: 'live'   },
    ],
  },
];

// ── Env settings ──────────────────────────────────────────────────────────────

const ENV_VARS = [
  { key: 'SUPABASE_URL',              value: 'https://*****.supabase.co', masked: true,  category: 'Database'  },
  { key: 'SUPABASE_ANON_KEY',         value: 'eyJ…[masked]',             masked: true,  category: 'Database'  },
  { key: 'SPORTS_API_KEY',            value: 'sk-af…[masked]',           masked: true,  category: 'Sports'    },
  { key: 'OPENAI_API_KEY',            value: 'sk-…[masked]',             masked: true,  category: 'AI'        },
  { key: 'ANTHROPIC_API_KEY',         value: 'sk-ant-…[masked]',         masked: true,  category: 'AI'        },
  { key: 'STRIPE_SECRET_KEY',         value: 'sk_live_…[masked]',        masked: true,  category: 'Payments'  },
  { key: 'SENDGRID_API_KEY',          value: 'SG.…[masked]',             masked: true,  category: 'Messaging' },
  { key: 'APP_ENV',                   value: 'production',               masked: false, category: 'Config'    },
  { key: 'MAX_AI_REQUESTS_PER_MIN',   value: '500',                      masked: false, category: 'Config'    },
  { key: 'MINOR_AGE_THRESHOLD',       value: '18',                       masked: false, category: 'Config'    },
];

const STATUS_DOT: Record<string, string> = {
  connected: '#1FB57A',
  error:     '#EF5350',
  suspended: '#F5A623',
};

export default function SystemConfigPage() {
  const [tab, setTab] = useState<Tab>('flags');
  const [flagState, setFlagState] = useState<Record<string, boolean>>(
    Object.fromEntries(FLAGS.map(f => [f.id, f.enabled]))
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'flags',        label: 'Feature Flags',  icon: Flag },
    { key: 'integrations', label: 'Integrations',   icon: Link2 },
    { key: 'environment',  label: 'Environment',    icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
          Feature flags · API integrations & health · Environment variables
        </p>
      </div>

      {/* Env strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Environment',    value: 'Production', color: '#1FB57A' },
          { label: 'App Version',    value: 'v1.4.2',     color: '#2F80ED' },
          { label: 'DB Region',      value: 'EU (fra1)',  color: '#B8F135' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#9DB0C6' }}>{s.label}</p>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center"
            style={{
              background: tab === t.key ? '#0F1E32' : 'transparent',
              color: tab === t.key ? 'white' : '#9DB0C6',
              boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
            }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Feature Flags */}
      {tab === 'flags' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 1fr 80px 90px 60px' }}>
            <span>Flag</span><span>Description</span><span>Env</span><span>Rollout</span><span>Toggle</span>
          </div>
          {FLAGS.map((f, i) => {
            const on = flagState[f.id] ?? f.enabled;
            return (
              <div key={f.id} className="grid px-4 py-3 items-center text-xs"
                style={{
                  gridTemplateColumns: '1fr 1fr 80px 90px 60px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                <div>
                  <p className="text-white font-medium">{f.label}</p>
                  <code className="text-[10px] font-mono" style={{ color: '#9DB0C6' }}>{f.id}</code>
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
                    <div className="h-full rounded-full" style={{ width: `${f.rollout}%`, background: on ? '#2F80ED' : 'rgba(157,176,198,0.3)' }} />
                  </div>
                  <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{f.rollout}%</span>
                </div>
                <button onClick={() => setFlagState(p => ({ ...p, [f.id]: !on }))}
                  style={{ color: on ? '#1FB57A' : '#EF5350' }}>
                  {on ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Integrations */}
      {tab === 'integrations' && (
        <div className="space-y-5">
          {INTEGRATIONS.map(cat => (
            <div key={cat.category}>
              <div className="flex items-center gap-2 mb-3">
                <cat.icon size={14} style={{ color: cat.color }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>{cat.category}</p>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {cat.providers.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3 text-xs"
                    style={{
                      background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[p.status] ?? '#9DB0C6' }} />
                    <span className="text-white font-medium w-44 flex-shrink-0">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                      style={p.status === 'connected'
                        ? { background: 'rgba(31,181,122,0.12)', color: '#1FB57A' }
                        : p.status === 'error'
                        ? { background: 'rgba(239,83,80,0.12)', color: '#EF5350' }
                        : { background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                      {p.status}
                    </span>
                    <span className="ml-2" style={{ color: '#9DB0C6' }}>Latency: {p.latency}</span>
                    <code className="ml-2 text-[11px] font-mono flex-1" style={{ color: '#9DB0C6' }}>{p.keyHint}</code>
                    <span className="text-[10px]" style={{ color: '#9DB0C6' }}>Last: {p.lastSync}</span>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
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
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <AlertTriangle size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Secret values are masked. All reveals are logged to the audit trail with actor, timestamp, and IP.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '220px 80px 1fr 60px' }}>
              <span>Key</span><span>Category</span><span>Value</span><span>Reveal</span>
            </div>
            {ENV_VARS.map((v, i) => (
              <div key={v.key} className="grid px-4 py-3 items-center text-xs"
                style={{
                  gridTemplateColumns: '220px 80px 1fr 60px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                <code className="text-[11px] font-mono text-white">{v.key}</code>
                <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{v.category}</span>
                <code className="text-[11px] font-mono" style={{ color: revealed[v.key] ? '#B8F135' : '#9DB0C6' }}>
                  {revealed[v.key] ? v.value : v.masked ? '••••••••••••••••' : v.value}
                </code>
                {v.masked && (
                  <button
                    onClick={() => setRevealed(p => ({ ...p, [v.key]: !p[v.key] }))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"
                    style={{ color: '#9DB0C6' }}>
                    {revealed[v.key] ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
