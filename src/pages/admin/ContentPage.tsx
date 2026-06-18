import React, { useState } from 'react';
import {
  FileText, Globe, Bell, Mail, Calendar, Eye, EyeOff,
  Plus, Edit2, Trash2, ChevronRight, BookOpen, Star,
} from 'lucide-react';

type Tab = 'stories' | 'resources' | 'templates' | 'notifications';

const STORIES = [
  { id: 's1', title: 'From Academy to Pro: Carlos Mendoza\'s Journey', author: 'Editorial', status: 'published', lang: 'EN', featured: true, date: '2026-06-10' },
  { id: 's2', title: 'Aisha Mensah Breaks Continental Record',           author: 'Editorial', status: 'published', lang: 'EN', featured: false, date: '2026-06-07' },
  { id: 's3', title: 'كيف استخدمت الذكاء الاصطناعي للوصول إلى الاحتراف', author: 'محرر',   status: 'draft',     lang: 'AR', featured: false, date: '2026-06-15' },
  { id: 's4', title: 'Club vs. Country: Navigating Dual Ambitions',      author: 'Editorial', status: 'scheduled', lang: 'EN', featured: false, date: '2026-06-20' },
];

const RESOURCES = [
  { id: 'r1', title: 'Complete Guide to Your Athlete Profile',    category: 'Onboarding', status: 'published', views: 4820, lang: 'EN' },
  { id: 'r2', title: 'Understanding Your AI Performance Score',  category: 'Analytics',  status: 'published', views: 3240, lang: 'EN' },
  { id: 'r3', title: 'Medical Records & Clearance Walkthrough',  category: 'Medical',    status: 'published', views: 2100, lang: 'EN' },
  { id: 'r4', title: 'دليل المجنّد: البحث والتواصل مع الرياضيين', category: 'Scouts',    status: 'draft',     views: 0,    lang: 'AR' },
];

const TEMPLATES = [
  { id: 't1', name: 'Welcome Email',                trigger: 'user.signup',       status: 'active', langs: ['EN','AR'] },
  { id: 't2', name: 'Verification Approved',        trigger: 'org.verified',      status: 'active', langs: ['EN','AR'] },
  { id: 't3', name: 'Subscription Reminder',        trigger: 'sub.expiry_7d',     status: 'active', langs: ['EN'] },
  { id: 't4', name: 'AI Score Updated',             trigger: 'athlete.score',     status: 'draft',  langs: ['EN'] },
  { id: 't5', name: 'Medical Clearance Issued',     trigger: 'medical.clearance', status: 'active', langs: ['EN','AR'] },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  published:  { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' },
  draft:      { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' },
  scheduled:  { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)' },
  active:     { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)' },
  inactive:   { color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
};

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'stories',       label: 'Success Stories', icon: Star },
  { key: 'resources',     label: 'Resources',       icon: BookOpen },
  { key: 'templates',     label: 'Email Templates', icon: Mail },
  { key: 'notifications', label: 'Notifications',   icon: Bell },
];

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('stories');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>Success stories, resources, templates · EN / AR (RTL)</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: '#B8F135', color: '#0C1A2B' }}>
          <Plus size={14} /> New Content
        </button>
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

      {/* Stories */}
      {tab === 'stories' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 80px 80px 70px 80px 80px' }}>
            <span>Title</span><span>Author</span><span>Status</span><span>Lang</span><span>Date</span><span>Actions</span>
          </div>
          {STORIES.map((s, i) => (
            <div key={s.id} className="grid px-4 py-3 items-center text-xs transition-colors"
              style={{
                gridTemplateColumns: '1fr 80px 80px 70px 80px 80px',
                background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
              <div className="flex items-center gap-2 min-w-0">
                {s.featured && <Star size={11} className="flex-shrink-0" style={{ color: '#F5A623' }} fill="#F5A623" />}
                <span className="text-white truncate">{s.title}</span>
              </div>
              <span style={{ color: '#9DB0C6' }}>{s.author}</span>
              <Chip label={s.status} {...(STATUS_STYLE[s.status] ?? { color: '#9DB0C6', bg: 'rgba(157,176,198,0.12)' })} />
              <span className="font-mono text-[11px]" style={{ color: s.lang === 'AR' ? '#F5A623' : '#9DB0C6' }}>{s.lang}</span>
              <span style={{ color: '#9DB0C6' }}>{s.date}</span>
              <div className="flex items-center gap-1">
                <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10" style={{ color: '#9DB0C6' }}><Eye size={11} /></button>
                <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10" style={{ color: '#9DB0C6' }}><Edit2 size={11} /></button>
                <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20" style={{ color: '#EF5350' }}><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resources */}
      {tab === 'resources' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 100px 80px 60px 70px 80px' }}>
            <span>Title</span><span>Category</span><span>Status</span><span>Views</span><span>Lang</span><span>Actions</span>
          </div>
          {RESOURCES.map((r, i) => (
            <div key={r.id} className="grid px-4 py-3 items-center text-xs transition-colors"
              style={{
                gridTemplateColumns: '1fr 100px 80px 60px 70px 80px',
                background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
              <span className="text-white truncate">{r.title}</span>
              <span className="text-[11px]" style={{ color: '#9DB0C6' }}>{r.category}</span>
              <Chip label={r.status} {...(STATUS_STYLE[r.status] ?? { color: '#9DB0C6', bg: '' })} />
              <span style={{ color: '#9DB0C6' }}>{r.views > 0 ? r.views.toLocaleString() : '—'}</span>
              <span className="font-mono text-[11px]" style={{ color: r.lang === 'AR' ? '#F5A623' : '#9DB0C6' }}>{r.lang}</span>
              <div className="flex gap-1">
                <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10" style={{ color: '#9DB0C6' }}><Edit2 size={11} /></button>
                <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10" style={{ color: '#9DB0C6' }}>
                  {r.status === 'published' ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {tab === 'templates' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: '#0A1828', color: '#9DB0C6', gridTemplateColumns: '1fr 180px 80px 80px 80px' }}>
            <span>Template</span><span>Trigger</span><span>Status</span><span>Languages</span><span>Actions</span>
          </div>
          {TEMPLATES.map((t, i) => (
            <div key={t.id} className="grid px-4 py-3 items-center text-xs"
              style={{
                gridTemplateColumns: '1fr 180px 80px 80px 80px',
                background: i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
              <span className="text-white font-medium">{t.name}</span>
              <code className="text-[10px] font-mono" style={{ color: '#9DB0C6' }}>{t.trigger}</code>
              <Chip label={t.status} {...(STATUS_STYLE[t.status] ?? { color: '#9DB0C6', bg: '' })} />
              <div className="flex gap-1">
                {t.langs.map(l => (
                  <span key={l} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>{l}</span>
                ))}
              </div>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10" style={{ color: '#9DB0C6' }}><Edit2 size={11} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="rounded-2xl p-6" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Bell size={18} style={{ color: '#2F80ED' }} />
            <p className="text-sm font-bold text-white">Push / In-App Notification Broadcast</p>
          </div>
          <div className="space-y-4 max-w-lg">
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
              <textarea rows={3} placeholder="Notification body…" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#9DB0C6' }}>Schedule</label>
              <input type="datetime-local" className="rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
            </div>
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: '#2F80ED', color: 'white' }}>
              Schedule Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
