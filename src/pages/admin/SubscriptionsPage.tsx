import React, { useState } from 'react';
import {
  CreditCard, Users, Building2, Shield, Star,
  Check, X, Edit2, Plus, ChevronDown, ChevronUp, Globe,
  ArrowUpRight,
} from 'lucide-react';

type Tab = 'tiers' | 'licenses' | 'gates';

const ATHLETE_TIERS = [
  {
    id: 'free', name: 'Free', price: 0,
    color: '#9DB0C6', bg: 'rgba(157,176,198,0.08)', border: 'rgba(157,176,198,0.2)',
    users: 6412,
    features: [
      { label: 'Public profile', enabled: true },
      { label: 'Basic stats', enabled: true },
      { label: 'Media uploads (5)', enabled: true },
      { label: 'Network (50 connections)', enabled: true },
      { label: 'AI Performance Score', enabled: false },
      { label: 'Career Coach AI', enabled: false },
      { label: 'Injury Risk Analyser', enabled: false },
      { label: 'Priority in scout search', enabled: false },
      { label: 'Advanced analytics', enabled: false },
      { label: 'Medical records vault', enabled: false },
    ],
  },
  {
    id: 'pro', name: 'Pro', price: 19,
    color: '#2F80ED', bg: 'rgba(47,128,237,0.1)', border: 'rgba(47,128,237,0.35)',
    users: 2847,
    features: [
      { label: 'Public profile', enabled: true },
      { label: 'Advanced stats & history', enabled: true },
      { label: 'Media uploads (unlimited)', enabled: true },
      { label: 'Network (unlimited)', enabled: true },
      { label: 'AI Performance Score', enabled: true },
      { label: 'Career Coach AI (20/day)', enabled: true },
      { label: 'Injury Risk Analyser', enabled: false },
      { label: 'Priority in scout search', enabled: true },
      { label: 'Advanced analytics', enabled: true },
      { label: 'Medical records vault', enabled: false },
    ],
  },
  {
    id: 'elite', name: 'Elite', price: 49,
    color: '#B8F135', bg: 'rgba(184,241,53,0.08)', border: 'rgba(184,241,53,0.35)',
    users: 562,
    features: [
      { label: 'Public profile', enabled: true },
      { label: 'Advanced stats & history', enabled: true },
      { label: 'Media uploads (unlimited)', enabled: true },
      { label: 'Network (unlimited)', enabled: true },
      { label: 'AI Performance Score', enabled: true },
      { label: 'Career Coach AI (unlimited)', enabled: true },
      { label: 'Injury Risk Analyser', enabled: true },
      { label: 'Priority in scout search (top)', enabled: true },
      { label: 'Advanced analytics', enabled: true },
      { label: 'Medical records vault', enabled: true },
    ],
  },
];

const ORG_LICENSES = [
  { id: 'scout_basic',      name: 'Scout Basic',        orgType: 'Scout',      icon: Users,     color: '#F5A623', price: 99,   seats: 1,   status: 'active', orgs: 384, features: ['Search & filter athletes', 'Watchlist (100 athletes)', '50 contact requests/mo', 'Basic analytics'] },
  { id: 'scout_pro',        name: 'Scout Pro',          orgType: 'Scout',      icon: Users,     color: '#2F80ED', price: 249,  seats: 3,   status: 'active', orgs: 201, features: ['All Basic features', 'Watchlist (unlimited)', '200 contact requests/mo', 'Advanced analytics', 'AI match score'] },
  { id: 'club_starter',     name: 'Club Starter',       orgType: 'Club',       icon: Building2, color: '#1FB57A', price: 299,  seats: 5,   status: 'active', orgs: 218, features: ['Squad management', 'Trial management', 'Player search', 'Basic reporting'] },
  { id: 'club_professional',name: 'Club Professional',  orgType: 'Club',       icon: Building2, color: '#B8F135', price: 799,  seats: 20,  status: 'active', orgs: 89,  features: ['All Starter features', 'Unlimited seats', 'AI match recommender', 'Performance verification', 'API access'] },
  { id: 'federation',       name: 'Federation',         orgType: 'Federation', icon: Globe,     color: '#EF5350', price: 2999, seats: 999, status: 'active', orgs: 12,  features: ['Full platform access', 'Custom integrations', 'Dedicated support', 'White-label options', 'Data export API'] },
];

const GATES = [
  { id: 'g1',  feature: 'AI Performance Score',     free: false, pro: true,  elite: true,  scout: true,  club: true  },
  { id: 'g2',  feature: 'Career Coach AI',           free: false, pro: true,  elite: true,  scout: false, club: false },
  { id: 'g3',  feature: 'Injury Risk Analyser',      free: false, pro: false, elite: true,  scout: true,  club: true  },
  { id: 'g4',  feature: 'Medical Records Vault',     free: false, pro: false, elite: true,  scout: false, club: false },
  { id: 'g5',  feature: 'Priority Scout Search',     free: false, pro: true,  elite: true,  scout: false, club: false },
  { id: 'g6',  feature: 'Advanced Analytics',        free: false, pro: true,  elite: true,  scout: true,  club: true  },
  { id: 'g7',  feature: 'Highlight Tagging AI',      free: false, pro: true,  elite: true,  scout: false, club: false },
  { id: 'g8',  feature: 'AI Match Recommender',      free: false, pro: false, elite: false, scout: true,  club: true  },
  { id: 'g9',  feature: 'API Access',                free: false, pro: false, elite: false, scout: false, club: true  },
  { id: 'g10', feature: 'Performance Verification',  free: false, pro: false, elite: false, scout: false, club: true  },
];

const GATE_COLS: { key: keyof typeof GATES[0]; label: string; color: string }[] = [
  { key: 'free',  label: 'Free',  color: '#9DB0C6' },
  { key: 'pro',   label: 'Pro',   color: '#2F80ED' },
  { key: 'elite', label: 'Elite', color: '#B8F135' },
  { key: 'scout', label: 'Scout', color: '#F5A623' },
  { key: 'club',  label: 'Club',  color: '#1FB57A' },
];

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'tiers',    label: 'Athlete Tiers', icon: Star,     color: '#B8F135' },
  { key: 'licenses', label: 'Org Licenses',  icon: Building2,color: '#2F80ED' },
  { key: 'gates',    label: 'Feature Gates', icon: Shield,   color: '#1FB57A' },
];

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<Tab>('tiers');
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        .card-in { animation: cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .row-in { animation: rowSlideIn 0.3s ease both; }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions & Licensing</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Athlete tiers · Scout/club/federation licenses · Feature gate matrix
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#B8F135', color: '#0C1A2B' }}>
            <Plus size={14} />New Plan
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Free Athletes',  value: '6,412', color: '#9DB0C6', trend: null    },
            { label: 'Pro Athletes',   value: '2,847', color: '#2F80ED', trend: '+12%'  },
            { label: 'Elite Athletes', value: '562',   color: '#B8F135', trend: '+8%'   },
            { label: 'Org Licenses',   value: '904',   color: '#1FB57A', trend: '+5%'   },
          ].map((s, i) => (
            <div key={s.label} className="rounded-xl p-4 row-in" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.07}s` }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#9DB0C6' }}>{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              {s.trend && (
                <p className="text-[11px] mt-0.5 flex items-center gap-0.5" style={{ color: '#1FB57A' }}>
                  <ArrowUpRight size={10} />{s.trend}
                </p>
              )}
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

        {/* Athlete Tiers */}
        {tab === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ animation: 'fadeIn 0.3s ease' }}>
            {ATHLETE_TIERS.map((tier, i) => (
              <div key={tier.id}
                className="rounded-2xl overflow-hidden flex flex-col card-in group cursor-default"
                style={{
                  background: '#0F1E32',
                  border: `1px solid ${tier.border}`,
                  animationDelay: `${i * 0.1}s`,
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${tier.color}18`}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
              >
                <div className="px-5 py-5" style={{ background: tier.bg, borderBottom: `1px solid ${tier.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tier.color}20` }}>
                        <Star size={14} style={{ color: tier.color }} fill={tier.id === 'elite' ? tier.color : 'none'} />
                      </div>
                      <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</p>
                    </div>
                    <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}>
                      <Edit2 size={11} />
                    </button>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    {tier.price > 0 && <span className="text-sm font-normal ml-1" style={{ color: '#9DB0C6' }}>/mo</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: tier.color }} />
                    <p className="text-xs" style={{ color: '#9DB0C6' }}>{tier.users.toLocaleString()} active subscribers</p>
                  </div>
                </div>
                <div className="px-5 py-4 flex-1 space-y-2.5">
                  {tier.features.map(f => (
                    <div key={f.label} className="flex items-center gap-2.5 text-xs">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: f.enabled ? `${tier.color}20` : 'rgba(255,255,255,0.04)' }}>
                        {f.enabled
                          ? <Check size={9} style={{ color: tier.color }} />
                          : <X size={9} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                      </div>
                      <span style={{ color: f.enabled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Org Licenses */}
        {tab === 'licenses' && (
          <div className="space-y-3" style={{ animation: 'fadeIn 0.3s ease' }}>
            {ORG_LICENSES.map((lic, i) => {
              const open = expanded === lic.id;
              return (
                <div key={lic.id} className="rounded-2xl overflow-hidden row-in"
                  style={{ background: '#0F1E32', border: open ? `1px solid ${lic.color}30` : '1px solid rgba(255,255,255,0.08)', animationDelay: `${i * 0.06}s`, transition: 'border-color 0.2s' }}>
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    onClick={() => setExpanded(open ? null : lic.id)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: `${lic.color}18`, color: lic.color, boxShadow: open ? `0 0 16px ${lic.color}30` : 'none' }}>
                      <lic.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white">{lic.name}</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ background: `${lic.color}18`, color: lic.color }}>{lic.orgType}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>
                        ${lic.price}/mo · {lic.seats === 999 ? 'Unlimited' : lic.seats} seat{lic.seats !== 1 ? 's' : ''} ·{' '}
                        <span style={{ color: lic.color }}>{lic.orgs} active orgs</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-xl font-bold text-white">${lic.price}</p>
                      <span className="text-xs" style={{ color: '#9DB0C6' }}>/mo</span>
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: '#9DB0C6' }}>
                        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </div>
                    </div>
                  </button>
                  {open && (
                    <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeIn 0.2s ease' }}>
                      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {lic.features.map(f => (
                          <div key={f} className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${lic.color}18` }}>
                              <Check size={9} style={{ color: lic.color }} />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-blue-500/20"
                          style={{ background: 'rgba(47,128,237,0.1)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
                          <Edit2 size={11} />Edit Plan
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-emerald-500/20"
                          style={{ background: 'rgba(31,181,122,0.08)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
                          <CreditCard size={11} />View Subscribers
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Gates */}
        {tab === 'gates' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 70px 70px 70px 70px 70px' }}>
              <span>Feature</span>
              {GATE_COLS.map(c => (
                <span key={c.key} className="text-center" style={{ color: c.color }}>{c.label}</span>
              ))}
            </div>
            {GATES.map((g, i) => (
              <div key={g.id} className="group grid px-4 py-3.5 items-center text-xs row-in"
                style={{
                  gridTemplateColumns: '1fr 70px 70px 70px 70px 70px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.03}s`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)'}
              >
                <span className="text-white font-medium">{g.feature}</span>
                {GATE_COLS.map(c => {
                  const enabled = g[c.key as keyof typeof g] as boolean;
                  return (
                    <div key={c.key} className="flex justify-center">
                      {enabled
                        ? <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${c.color}20` }}>
                            <Check size={10} style={{ color: c.color }} />
                          </div>
                        : <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <X size={10} style={{ color: 'rgba(255,255,255,0.15)' }} />
                          </div>}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="px-4 py-2.5 text-[11px] flex items-center gap-1.5" style={{ background: '#0A1828', color: '#9DB0C6', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Shield size={10} style={{ color: '#1FB57A' }} />
              Gate changes take effect within 5 minutes via feature flag evaluation.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
