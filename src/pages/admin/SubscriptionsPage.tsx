import React, { useState } from 'react';
import {
  CreditCard, Users, Building2, Shield, Star, Zap,
  Check, X, Edit2, Plus, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Globe,
} from 'lucide-react';

type Tab = 'tiers' | 'licenses' | 'gates';

// ── Athlete tiers ─────────────────────────────────────────────────────────────

const ATHLETE_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    color: '#9DB0C6',
    bg: 'rgba(157,176,198,0.1)',
    border: 'rgba(157,176,198,0.2)',
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
    id: 'pro',
    name: 'Pro',
    price: 19,
    color: '#2F80ED',
    bg: 'rgba(47,128,237,0.1)',
    border: 'rgba(47,128,237,0.3)',
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
    id: 'elite',
    name: 'Elite',
    price: 49,
    color: '#B8F135',
    bg: 'rgba(184,241,53,0.08)',
    border: 'rgba(184,241,53,0.3)',
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

// ── Org licenses ──────────────────────────────────────────────────────────────

const ORG_LICENSES = [
  {
    id: 'scout_basic',
    name: 'Scout Basic',
    orgType: 'Scout',
    icon: Users,
    color: '#F5A623',
    price: 99,
    seats: 1,
    status: 'active',
    orgs: 384,
    features: ['Search & filter athletes', 'Watchlist (100 athletes)', '50 contact requests/mo', 'Basic analytics'],
  },
  {
    id: 'scout_pro',
    name: 'Scout Pro',
    orgType: 'Scout',
    icon: Users,
    color: '#2F80ED',
    price: 249,
    seats: 3,
    status: 'active',
    orgs: 201,
    features: ['All Basic features', 'Watchlist (unlimited)', '200 contact requests/mo', 'Advanced analytics', 'AI match score'],
  },
  {
    id: 'club_starter',
    name: 'Club Starter',
    orgType: 'Club',
    icon: Building2,
    color: '#1FB57A',
    price: 299,
    seats: 5,
    status: 'active',
    orgs: 218,
    features: ['Squad management', 'Trial management', 'Player search', 'Basic reporting'],
  },
  {
    id: 'club_professional',
    name: 'Club Professional',
    orgType: 'Club',
    icon: Building2,
    color: '#B8F135',
    price: 799,
    seats: 20,
    status: 'active',
    orgs: 89,
    features: ['All Starter features', 'Unlimited seats', 'AI match recommender', 'Performance verification', 'API access'],
  },
  {
    id: 'federation',
    name: 'Federation',
    orgType: 'Federation',
    icon: Globe,
    color: '#EF5350',
    price: 2999,
    seats: 999,
    status: 'active',
    orgs: 12,
    features: ['Full platform access', 'Custom integrations', 'Dedicated support', 'White-label options', 'Data export API'],
  },
];

// ── Feature gates ─────────────────────────────────────────────────────────────

const GATES = [
  { id: 'g1', feature: 'AI Performance Score',     free: false, pro: true,  elite: true,  scout: true,  club: true  },
  { id: 'g2', feature: 'Career Coach AI',           free: false, pro: true,  elite: true,  scout: false, club: false },
  { id: 'g3', feature: 'Injury Risk Analyser',      free: false, pro: false, elite: true,  scout: true,  club: true  },
  { id: 'g4', feature: 'Medical Records Vault',     free: false, pro: false, elite: true,  scout: false, club: false },
  { id: 'g5', feature: 'Priority Scout Search',     free: false, pro: true,  elite: true,  scout: false, club: false },
  { id: 'g6', feature: 'Advanced Analytics',        free: false, pro: true,  elite: true,  scout: true,  club: true  },
  { id: 'g7', feature: 'Highlight Tagging AI',      free: false, pro: true,  elite: true,  scout: false, club: false },
  { id: 'g8', feature: 'AI Match Recommender',      free: false, pro: false, elite: false, scout: true,  club: true  },
  { id: 'g9', feature: 'API Access',                free: false, pro: false, elite: false, scout: false, club: true  },
  { id: 'g10', feature: 'Performance Verification', free: false, pro: false, elite: false, scout: false, club: true  },
];

function GateCheck({ enabled }: { enabled: boolean }) {
  return enabled
    ? <Check size={13} style={{ color: '#1FB57A' }} />
    : <X size={13} style={{ color: 'rgba(255,255,255,0.15)' }} />;
}

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<Tab>('tiers');
  const [expanded, setExpanded] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'tiers',    label: 'Athlete Tiers',    icon: Star },
    { key: 'licenses', label: 'Org Licenses',     icon: Building2 },
    { key: 'gates',    label: 'Feature Gates',    icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions & Licensing</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
            Athlete tiers · Scout/club/federation licenses · Feature gate matrix
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: '#B8F135', color: '#0C1A2B' }}>
          <Plus size={14} /> New Plan
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Free Athletes',  value: '6,412', color: '#9DB0C6' },
          { label: 'Pro Athletes',   value: '2,847', color: '#2F80ED' },
          { label: 'Elite Athletes', value: '562',   color: '#B8F135' },
          { label: 'Org Licenses',   value: '904',   color: '#1FB57A' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#9DB0C6' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
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

      {/* Athlete Tiers */}
      {tab === 'tiers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ATHLETE_TIERS.map(tier => (
            <div key={tier.id} className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: '#0F1E32', border: `1px solid ${tier.border}` }}>
              <div className="px-5 py-4" style={{ background: tier.bg, borderBottom: `1px solid ${tier.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-bold" style={{ color: tier.color }}>{tier.name}</p>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10" style={{ color: '#9DB0C6' }}>
                    <Edit2 size={12} />
                  </button>
                </div>
                <p className="text-2xl font-bold text-white">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                  {tier.price > 0 && <span className="text-xs font-normal ml-1" style={{ color: '#9DB0C6' }}>/mo</span>}
                </p>
                <p className="text-xs mt-1" style={{ color: '#9DB0C6' }}>
                  {tier.users.toLocaleString()} active subscribers
                </p>
              </div>
              <div className="px-5 py-4 flex-1 space-y-2">
                {tier.features.map(f => (
                  <div key={f.label} className="flex items-center gap-2 text-xs">
                    {f.enabled
                      ? <Check size={13} style={{ color: tier.color, flexShrink: 0 }} />
                      : <X size={13} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />}
                    <span style={{ color: f.enabled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Org Licenses */}
      {tab === 'licenses' && (
        <div className="space-y-3">
          {ORG_LICENSES.map(lic => {
            const open = expanded === lic.id;
            return (
              <div key={lic.id} className="rounded-2xl overflow-hidden"
                style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => setExpanded(open ? null : lic.id)}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${lic.color}18`, color: lic.color }}>
                    <lic.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white">{lic.name}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ background: `${lic.color}18`, color: lic.color }}>{lic.orgType}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>
                      ${lic.price}/mo · {lic.seats === 999 ? 'Unlimited' : lic.seats} seat{lic.seats !== 1 ? 's' : ''} · {lic.orgs} active orgs
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">${lic.price}</span>
                    <span className="text-xs" style={{ color: '#9DB0C6' }}>/mo</span>
                    {open ? <ChevronUp size={14} style={{ color: '#9DB0C6' }} /> : <ChevronDown size={14} style={{ color: '#9DB0C6' }} />}
                  </div>
                </button>
                {open && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {lic.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs">
                          <Check size={12} style={{ color: lic.color, flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.3)' }}>
                        <Edit2 size={11} /> Edit Plan
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
                        <CreditCard size={11} /> View Subscribers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Gate Matrix */}
      {tab === 'gates' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 60px 60px 60px 60px 60px' }}>
            <span>Feature</span>
            <span className="text-center" style={{ color: '#9DB0C6' }}>Free</span>
            <span className="text-center" style={{ color: '#2F80ED' }}>Pro</span>
            <span className="text-center" style={{ color: '#B8F135' }}>Elite</span>
            <span className="text-center" style={{ color: '#F5A623' }}>Scout</span>
            <span className="text-center" style={{ color: '#1FB57A' }}>Club</span>
          </div>
          {GATES.map((g, i) => (
            <div key={g.id} className="grid px-4 py-3 items-center text-xs"
              style={{
                gridTemplateColumns: '1fr 60px 60px 60px 60px 60px',
                background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
              <span className="text-white">{g.feature}</span>
              {(['free', 'pro', 'elite', 'scout', 'club'] as const).map(k => (
                <div key={k} className="flex justify-center">
                  <GateCheck enabled={g[k]} />
                </div>
              ))}
            </div>
          ))}
          <div className="px-4 py-3 text-[11px]" style={{ background: '#0A1828', color: '#9DB0C6', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Gate changes take effect within 5 minutes via feature flag evaluation.
          </div>
        </div>
      )}
    </div>
  );
}
