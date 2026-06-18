import React, { useState } from 'react';
import {
  FileText, Globe, Bell, Mail, Calendar, Eye, EyeOff,
  Plus, Edit2, Trash2, BookOpen, Star, CheckCircle,
  Users, Send, BarChart3,
} from 'lucide-react';

type Tab = 'stories' | 'resources' | 'templates' | 'notifications';

const STORIES = [
  { id: 's1', title: "From Academy to Pro: Carlos Mendoza's Journey", author: 'Editorial', status: 'published', lang: 'EN', featured: true,  date: '2026-06-10', views: 8240 },
  { id: 's2', title: 'Aisha Mensah Breaks Continental Record',          author: 'Editorial', status: 'published', lang: 'EN', featured: false, date: '2026-06-07', views: 5820 },
  { id: 's3', title: 'كيف استخدمت الذكاء الاصطناعي للوصول إلى الاحتراف', author: 'محرر',  status: 'draft',     lang: 'AR', featured: false, date: '2026-06-15', views: 0    },
  { id: 's4', title: 'Club vs. Country: Navigating Dual Ambitions',    author: 'Editorial', status: 'scheduled', lang: 'EN', featured: false, date: '2026-06-20', views: 0    },
];

const RESOURCES = [
  { id: 'r1', title: 'Complete Guide to Your Athlete Profile',    category: 'Onboarding', status: 'published', views: 4820, lang: 'EN' },
  { id: 'r2', title: 'Understanding Your AI Performance Score',  category: 'Analytics',  status: 'published', views: 3240, lang: 'EN' },
  { id: 'r3', title: 'Medical Records & Clearance Walkthrough',  category: 'Medical',    status: 'published', views: 2100, lang: 'EN' },
  { id: 'r4', title: 'دليل المجنّد: البحث والتواصل مع الرياضيين', category: 'Scouts',    status: 'draft',     views: 0,    lang: 'AR' },
];

const TEMPLATES = [
  { id: 't1', name: 'Welcome Email',           trigger: 'user.signup',       status: 'active', langs: ['EN','AR'], sent: 12483 },
  { id: 't2', name: 'Verification Approved',   trigger: 'org.verified',      status: 'active', langs: ['EN','AR'], sent: 1240  },
  { id: 't3', name: 'Subscription Reminder',   trigger: 'sub.expiry_7d',     status: 'active', langs: ['EN'],      sent: 892   },
  { id: 't4', name: 'AI Score Updated',        trigger: 'athlete.score',     status: 'draft',  langs: ['EN'],      sent: 0     },
  { id: 't5', name: 'Medical Clearance Issued',trigger: 'medical.clearance', status: 'active', langs: ['EN','AR'], sent: 412   },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  published: { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  draft:     { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' },
  scheduled: { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)'  },
  active:    { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)'  },
  inactive:  { color: '#EF5350', bg: 'rgba(239,83,80,0.12)'   },
};

const CAT_COLORS: Record<string, string> = {
  Onboarding: '#2F80ED', Analytics: '#B8F135', Medical: '#EF5350', Scouts: '#F5A623',
};

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: bg, color }}>{label}</span>;
}

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'stories',       label: 'Success Stories', icon: Star,     color: '#F5A623' },
  { key: 'resources',     label: 'Resources',       icon: BookOpen, color: '#2F80ED' },
  { key: 'templates',     label: 'Email Templates', icon: Mail,     color: '#1FB57A' },
  { key: 'notifications', label: 'Broadcast',       icon: Bell,     color: '#B8F135' },
];

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('stories');

  const pubStories = STORIES.filter(s => s.status === 'published').length;
  const pubResources = RESOURCES.filter(r => r.status === 'published').length;
  const activeTemplates = TEMPLATES.filter(t => t.status === 'active').length;

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
            <h1 className="text-2xl font-bold text-white">Content Management</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>Success stories, resources, templates · EN / AR (RTL)</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#B8F135', color: '#0C1A2B' }}>
            <Plus size={14} />New Content
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Published Stories',  value: pubStories,      color: '#F5A623', icon: Star,         suffix: '' },
            { label: 'Published Resources',value: pubResources,     color: '#2F80ED', icon: BookOpen,      suffix: '' },
            { label: 'Active Templates',   value: activeTemplates,  color: '#1FB57A', icon: Mail,          suffix: '' },
            { label: 'Total Story Views',  value: 14060,            color: '#B8F135', icon: BarChart3,     suffix: '' },
          ].map((s, i) => (
            <div key={s.label} className="rounded-xl p-4 row-in" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={13} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9DB0C6' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center"
              style={{
                background: tab === t.key ? '#0F1E32' : 'transparent',
                color: tab === t.key ? t.color : '#9DB0C6',
                boxShadow: tab === t.key ? '0 1px 8px rgba(0,0,0,0.3)' : 'none',
              }}>
              <t.icon size={13} />{t.label}
            </button>
          ))}
        </div>

        {/* Stories */}
        {tab === 'stories' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 80px 80px 70px 80px 70px 80px' }}>
              <span>Title</span><span>Author</span><span>Status</span><span>Lang</span><span>Date</span><span>Views</span><span>Actions</span>
            </div>
            {STORIES.map((s, i) => (
              <div key={s.id} className="grid px-4 py-3.5 items-center text-xs group row-in"
                style={{
                  gridTemplateColumns: '1fr 80px 80px 70px 80px 70px 80px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.04}s`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)'}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {s.featured && (
                    <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,166,35,0.15)' }}>
                      <Star size={10} style={{ color: '#F5A623' }} fill="#F5A623" />
                    </span>
                  )}
                  <span className="text-white truncate">{s.title}</span>
                </div>
                <span style={{ color: '#9DB0C6' }}>{s.author}</span>
                <Chip label={s.status} {...(STATUS_STYLE[s.status] ?? { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' })} />
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ color: s.lang === 'AR' ? '#F5A623' : '#9DB0C6', background: s.lang === 'AR' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)' }}>{s.lang}</span>
                <span style={{ color: '#9DB0C6' }}>{s.date}</span>
                <span style={{ color: s.views > 0 ? '#9DB0C6' : 'rgba(255,255,255,0.2)' }}>{s.views > 0 ? s.views.toLocaleString() : '—'}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}><Eye size={11} /></button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}><Edit2 size={11} /></button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 transition-colors" style={{ color: '#EF5350' }}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resources */}
        {tab === 'resources' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 110px 80px 60px 70px 80px' }}>
              <span>Title</span><span>Category</span><span>Status</span><span>Views</span><span>Lang</span><span>Actions</span>
            </div>
            {RESOURCES.map((r, i) => (
              <div key={r.id} className="grid px-4 py-3.5 items-center text-xs group row-in"
                style={{
                  gridTemplateColumns: '1fr 110px 80px 60px 70px 80px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <span className="text-white truncate pr-2">{r.title}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex"
                  style={{ background: `${CAT_COLORS[r.category] ?? '#9DB0C6'}18`, color: CAT_COLORS[r.category] ?? '#9DB0C6' }}>
                  {r.category}
                </span>
                <Chip label={r.status} {...(STATUS_STYLE[r.status] ?? { color: '#9DB0C6', bg: '' })} />
                <span style={{ color: '#9DB0C6' }}>{r.views > 0 ? r.views.toLocaleString() : '—'}</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ color: r.lang === 'AR' ? '#F5A623' : '#9DB0C6', background: r.lang === 'AR' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)' }}>{r.lang}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}><Edit2 size={11} /></button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}>
                    {r.status === 'published' ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates */}
        {tab === 'templates' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn 0.3s ease' }}>
            <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 180px 80px 90px 70px 80px' }}>
              <span>Template</span><span>Trigger</span><span>Status</span><span>Sent</span><span>Languages</span><span>Actions</span>
            </div>
            {TEMPLATES.map((t, i) => (
              <div key={t.id} className="grid px-4 py-3.5 items-center text-xs group row-in"
                style={{
                  gridTemplateColumns: '1fr 180px 80px 90px 70px 80px',
                  background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${i * 0.04}s`,
                  borderLeft: t.status === 'active' ? '2px solid rgba(31,181,122,0.5)' : '2px solid transparent',
                }}>
                <span className="text-white font-medium">{t.name}</span>
                <code className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(47,128,237,0.1)', color: '#2F80ED' }}>{t.trigger}</code>
                <Chip label={t.status} {...(STATUS_STYLE[t.status] ?? { color: '#9DB0C6', bg: '' })} />
                <span style={{ color: '#9DB0C6' }}>{t.sent > 0 ? t.sent.toLocaleString() : '—'}</span>
                <div className="flex gap-1">
                  {t.langs.map(l => (
                    <span key={l} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: l === 'AR' ? 'rgba(245,166,35,0.15)' : 'rgba(47,128,237,0.15)', color: l === 'AR' ? '#F5A623' : '#2F80ED' }}>{l}</span>
                  ))}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}><Edit2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Compose panel */}
            <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.15)' }}>
                  <Bell size={15} style={{ color: '#2F80ED' }} />
                </div>
                <p className="text-sm font-bold text-white">Push / In-App Broadcast</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9DB0C6' }}>Target Audience</label>
                  <select className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
                    <option>All Users</option>
                    <option>Athletes Only</option>
                    <option>Scouts & Clubs</option>
                    <option>Unverified Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9DB0C6' }}>Message (EN)</label>
                  <textarea rows={3} placeholder="Notification body…"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9DB0C6' }}>Schedule</label>
                  <input type="datetime-local"
                    className="rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: '#2F80ED', color: 'white' }}>
                  <Send size={13} />Schedule Notification
                </button>
              </div>
            </div>
            {/* Audience breakdown */}
            <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184,241,53,0.12)' }}>
                  <Users size={15} style={{ color: '#B8F135' }} />
                </div>
                <p className="text-sm font-bold text-white">Audience Segments</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'All Users',          count: 12483, color: '#2F80ED', pct: 100 },
                  { label: 'Athletes',           count: 9821,  color: '#1FB57A', pct: 79  },
                  { label: 'Scouts & Clubs',     count: 2132,  color: '#F5A623', pct: 17  },
                  { label: 'Unverified',         count: 1402,  color: '#EF5350', pct: 11  },
                ].map(seg => (
                  <div key={seg.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{seg.label}</span>
                      <span className="font-semibold" style={{ color: seg.color }}>{seg.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${seg.pct}%`, background: seg.color, boxShadow: `0 0 6px ${seg.color}60` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Globe size={13} style={{ color: '#9DB0C6' }} />
                <p className="text-xs" style={{ color: '#9DB0C6' }}>Arabic (AR) users: <strong className="text-white">38%</strong> — notifications auto-translated</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
