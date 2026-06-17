import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, CheckCircle2, TrendingUp, AlertTriangle,
  ChevronRight, Activity, Award, Bone, CalendarDays, Inbox,
  ArrowUpRight, FileText,
} from 'lucide-react';

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { value, ref };
}

const KPIS = [
  { label: 'Pending Requests',    target: 5,      format: (v: number) => String(v),               color: '#F5A623', icon: Clock,         bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.18)' },
  { label: 'Completed This Month',target: 34,     format: (v: number) => String(v),               color: '#1FB57A', icon: CheckCircle2,  bg: 'rgba(31,181,122,0.08)',  border: 'rgba(31,181,122,0.18)' },
  { label: 'Active Clearances',   target: 127,    format: (v: number) => String(v),               color: '#2F80ED', icon: Award,         bg: 'rgba(47,128,237,0.08)',  border: 'rgba(47,128,237,0.18)' },
  { label: 'Commission (AED)',     target: 18750,  format: (v: number) => v.toLocaleString(),      color: '#1FB57A', icon: TrendingUp,    bg: 'rgba(31,181,122,0.08)',  border: 'rgba(31,181,122,0.18)' },
];

function KpiCard({ kpi, i }: { kpi: typeof KPIS[0]; i: number }) {
  const { value, ref } = useCountUp(kpi.target);
  const Icon = kpi.icon;
  return (
    <div ref={ref} className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background: '#0D1C2E',
        border: `1px solid ${kpi.border}`,
        boxShadow: `0 0 0 0 ${kpi.color}`,
        animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both`,
      }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}>
          <Icon size={18} style={{ color: kpi.color }} />
        </div>
        <ArrowUpRight size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
      <div>
        <p className="text-2xl font-black text-white tabular-nums">{kpi.format(value)}</p>
        <p className="text-xs mt-1" style={{ color: '#7C8DA6' }}>{kpi.label}</p>
      </div>
    </div>
  );
}

const RECENT_ACTIVITY = [
  { id: 'r1', text: 'Physical assessment completed for Khalid Al-Rashidi', time: '12m ago', type: 'completed', link: '/partner/inbox/r1' },
  { id: 'r2', text: 'Clearance issued — Omar Al-Farsi (Al Wasl SC)',       time: '1h ago',  type: 'cleared',   link: '/partner/clearances' },
  { id: 'r3', text: 'New cardiac screening request — Yusuf Al-Kaabi',      time: '2h ago',  type: 'new',       link: '/partner/inbox/r3' },
  { id: 'r4', text: 'Injury update recorded — Sara Al-Hashemi (MCL)',      time: '3h ago',  type: 'injury',    link: '/partner/injuries' },
  { id: 'r5', text: 'Lab results anchored & provenance confirmed',          time: '5h ago',  type: 'anchored',  link: '/partner/records' },
  { id: 'r6', text: 'Commission payout AED 3,200 processed',               time: '1d ago',  type: 'payout',    link: '/partner/bookings' },
];

const ACTIVITY_COLORS: Record<string, string> = {
  completed: '#1FB57A', cleared: '#1FB57A', new: '#F5A623',
  injury: '#EF5350', anchored: '#2F80ED', payout: '#1FB57A',
};

const ALERTS = [
  { text: '3 clearances expiring within 14 days',    color: '#F5A623', icon: AlertTriangle, link: '/partner/clearances' },
  { text: 'Payout AED 4,800 pending review',          color: '#2F80ED', icon: TrendingUp,    link: '/partner/bookings' },
  { text: '2 identity verifications awaiting action', color: '#EF5350', icon: ShieldCheck,   link: '/partner/inbox' },
];

const QUICK_ACTIONS = [
  { label: 'New Request',     icon: Inbox,        color: '#1FB57A', path: '/partner/inbox' },
  { label: 'Issue Clearance', icon: Award,        color: '#2F80ED', path: '/partner/clearances' },
  { label: 'Log Injury',      icon: Bone,         color: '#F5A623', path: '/partner/injuries' },
  { label: 'View Analytics',  icon: Activity,     color: '#7C8DA6', path: '/partner/analytics' },
];

export default function PartnerDashboardPage() {
  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampIn {
          0%   { opacity: 0; transform: scale(0.7); }
          70%  { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <div>
          <h1 className="text-xl font-black text-white">Medical Partner Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>Dubai Sports Medicine Centre · Season 2025–26</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(31,181,122,0.08)', border: '1px solid rgba(31,181,122,0.25)' }}>
          <ShieldCheck size={14} style={{ color: '#1FB57A' }} />
          <span className="text-xs font-bold" style={{ color: '#1FB57A' }}>Verified Partner</span>
          <span className="text-[10px]" style={{ color: 'rgba(31,181,122,0.55)' }}>· Renewal Jul 2027</span>
        </div>
      </div>

      {/* Alerts strip */}
      <div className="space-y-2" style={{ animation: 'fadeSlideUp 0.4s 0.05s ease both' }}>
        {ALERTS.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link key={i} to={a.link}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group"
              style={{ background: `${a.color}08`, border: `1px solid ${a.color}22` }}
              onMouseEnter={e => (e.currentTarget.style.background = `${a.color}12`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${a.color}08`)}>
              <Icon size={13} style={{ color: a.color, flexShrink: 0 }} />
              <p className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{a.text}</p>
              <ChevronRight size={12} style={{ color: a.color, flexShrink: 0 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, i) => <KpiCard key={kpi.label} kpi={kpi} i={i} />)}
      </div>

      {/* Accreditation card + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Accreditation */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: '#0D1C2E', border: '1px solid rgba(31,181,122,0.2)' }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: '#7C8DA6' }}>Verification Status</p>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(31,181,122,0.12)', border: '1.5px solid rgba(31,181,122,0.35)', boxShadow: '0 0 20px rgba(31,181,122,0.15)' }}>
              <ShieldCheck size={26} style={{ color: '#1FB57A' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-black text-white">Dubai Sports Medicine Centre</p>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(31,181,122,0.15)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.3)', animation: 'stampIn 0.5s 0.6s ease both' }}>
                  Verified Partner
                </span>
              </div>
              <p className="text-xs mb-3" style={{ color: '#7C8DA6' }}>UAE Sports Medicine Federation · License DSM-2024-0047</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Partner Since', value: 'Jan 2024' },
                  { label: 'License Renewal', value: 'Jul 2027' },
                  { label: 'Tests Accredited', value: '12 types' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-bold text-white">{item.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl p-5"
          style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: '#7C8DA6' }}>Quick Actions</p>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${action.color}0D`; (e.currentTarget as HTMLElement).style.borderColor = `${action.color}25`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}>
                    <Icon size={13} style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-semibold text-white flex-1">{action.label}</span>
                  <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold text-white">Recent Activity</p>
          <Link to="/partner/inbox" className="text-xs font-semibold transition-colors"
            style={{ color: '#2F80ED' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#5fa0f5')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#2F80ED')}>
            View all
          </Link>
        </div>
        <div>
          {RECENT_ACTIVITY.map((item, i) => {
            const color = ACTIVITY_COLORS[item.type] ?? '#7C8DA6';
            return (
              <Link key={item.id} to={item.link}
                className="flex items-start gap-3 px-5 py-3.5 transition-all group"
                style={{
                  borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  animation: `fadeSlideUp 0.35s ease ${0.4 + i * 0.05}s both`,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <p className="text-xs flex-1 leading-relaxed" style={{ color: 'rgba(244,248,252,0.65)' }}>{item.text}</p>
                <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#7C8DA6' }}>{item.time}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
