import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, CheckCircle2, TrendingUp, AlertTriangle,
  ChevronRight, Award, Bone, CalendarDays, Inbox,
  ArrowUpRight, DollarSign, Activity, XCircle, User, Hash,
  MoreHorizontal, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

/* ── count-up hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 1300) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { value, ref };
}

/* ── mock data ─────────────────────────────────────────────── */
const VOLUME_SPARKLINE = [
  { d: 'Mo', v: 4 }, { d: 'Tu', v: 7 }, { d: 'We', v: 5 },
  { d: 'Th', v: 9 }, { d: 'Fr', v: 6 }, { d: 'Sa', v: 3 }, { d: 'Su', v: 8 },
];

const KPIS = [
  {
    label: 'Pending Requests',
    target: 5,
    format: (v: number) => String(v),
    color: '#F5A623',
    border: 'rgba(245,166,35,0.22)',
    bg: 'rgba(245,166,35,0.07)',
    icon: Clock,
    trend: '+2 vs yesterday',
    trendUp: false,
    link: '/partner/inbox',
    spark: null,
  },
  {
    label: 'Completed This Month',
    target: 34,
    format: (v: number) => String(v),
    color: '#1FB57A',
    border: 'rgba(31,181,122,0.22)',
    bg: 'rgba(31,181,122,0.07)',
    icon: CheckCircle2,
    trend: '+8 vs last month',
    trendUp: true,
    link: '/partner/records',
    spark: VOLUME_SPARKLINE,
  },
  {
    label: 'Active Clearances',
    target: 127,
    format: (v: number) => String(v),
    color: '#2F80ED',
    border: 'rgba(47,128,237,0.22)',
    bg: 'rgba(47,128,237,0.07)',
    icon: Award,
    trend: '4 expiring soon',
    trendUp: false,
    link: '/partner/clearances',
    spark: null,
  },
  {
    label: 'Commission This Month',
    target: 9180,
    format: (v: number) => `AED ${v.toLocaleString()}`,
    color: '#1FB57A',
    border: 'rgba(31,181,122,0.22)',
    bg: 'rgba(31,181,122,0.07)',
    icon: DollarSign,
    trend: '+18% vs last month',
    trendUp: true,
    link: '/partner/bookings',
    spark: null,
  },
];

const PIPELINE = [
  { label: 'Awaiting Action',   count: 5,  color: '#F5A623', pct: 15 },
  { label: 'ID Verification',   count: 3,  color: '#EF5350', pct: 9  },
  { label: 'In Progress',       count: 8,  color: '#2F80ED', pct: 24 },
  { label: 'Completed',         count: 18, color: '#1FB57A', pct: 53 },
];

const TODAYS_QUEUE = [
  { time: '09:00', athlete: 'Khalid Al-Rashidi', type: 'Physical Assessment', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80', status: 'confirmed', id: 'r1' },
  { time: '10:30', athlete: 'Yusuf Al-Kaabi',    type: 'Medical Clearance',   avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=80', status: 'confirmed', id: 'r2' },
  { time: '12:00', athlete: 'Omar Al-Farsi',      type: 'Cardiac Screening',   avatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=80',  status: 'in_progress', id: 'r3' },
  { time: '14:30', athlete: 'Sara Al-Hashemi',    type: 'Blood / Lab',         avatar: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=80', status: 'pending',   id: 'r4' },
  { time: '16:00', athlete: 'James Crawford',     type: 'MRI / Imaging',       avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=80',  status: 'pending',   id: 'r5' },
];

const QUEUE_STATUS: Record<string, { color: string; label: string }> = {
  confirmed:   { color: '#2F80ED', label: 'Confirmed'    },
  in_progress: { color: '#F5A623', label: 'In Progress'  },
  pending:     { color: '#7C8DA6', label: 'Scheduled'    },
};

const CLEARANCE_HEALTH = [
  { label: 'Cleared',     count: 112, pct: 88, color: '#1FB57A' },
  { label: 'Restricted',  count: 9,   pct: 7,  color: '#F5A623' },
  { label: 'Not Cleared', count: 6,   pct: 5,  color: '#EF5350' },
];

const ALERTS = [
  { text: '4 clearances expiring within 14 days',     color: '#F5A623', icon: AlertTriangle, link: '/partner/clearances', urgency: 'warn'  },
  { text: '2 identity verifications awaiting action', color: '#EF5350', icon: ShieldCheck,   link: '/partner/inbox',       urgency: 'error' },
  { text: 'Payout AED 4,800 pending review',          color: '#2F80ED', icon: TrendingUp,    link: '/partner/bookings',    urgency: 'info'  },
];

const RECENT_ACTIVITY = [
  { text: 'Physical assessment completed — Khalid Al-Rashidi',       time: '12m ago', type: 'completed'  },
  { text: 'Clearance issued — Omar Al-Farsi (Al Wasl SC)',           time: '1h ago',  type: 'cleared'    },
  { text: 'New cardiac screening request — Yusuf Al-Kaabi',          time: '2h ago',  type: 'new'        },
  { text: 'Injury update recorded — Sara Al-Hashemi (MCL Grade II)', time: '3h ago',  type: 'injury'     },
  { text: 'Lab results anchored & provenance confirmed',              time: '5h ago',  type: 'anchored'   },
];

const ACTIVITY_DOT: Record<string, string> = {
  completed: '#1FB57A', cleared: '#1FB57A', new: '#F5A623',
  injury: '#EF5350', anchored: '#2F80ED',
};

/* ── sub-components ────────────────────────────────────────── */
function KpiCard({ kpi, i }: { kpi: typeof KPIS[0]; i: number }) {
  const { value, ref } = useCountUp(kpi.target);
  const Icon = kpi.icon;
  return (
    <Link to={kpi.link} ref={ref as React.RefObject<HTMLAnchorElement>}
      className="group relative rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 overflow-hidden"
      style={{
        background: kpi.bg,
        border: `1px solid ${kpi.border}`,
        animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both`,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = kpi.color + '55')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = kpi.border)}>
      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${kpi.color}10, transparent 60%)` }} />

      <div className="flex items-start justify-between relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}>
          <Icon size={18} style={{ color: kpi.color }} />
        </div>
        <ArrowUpRight size={13} style={{ color: 'rgba(255,255,255,0.2)' }} className="group-hover:text-white/50 transition-colors" />
      </div>

      <div className="relative z-10">
        <p className="text-2xl font-black text-white tabular-nums leading-none mb-1">
          {kpi.format(value)}
        </p>
        <p className="text-xs" style={{ color: '#9DB0C6' }}>{kpi.label}</p>
      </div>

      {kpi.spark ? (
        <div className="relative z-10 h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpi.spark} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="v" stroke={kpi.color} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="relative z-10 flex items-center gap-1.5">
          {kpi.trendUp
            ? <ArrowUp size={10} style={{ color: '#1FB57A' }} />
            : <ArrowDown size={10} style={{ color: '#F5A623' }} />}
          <span className="text-[10px] font-semibold" style={{ color: kpi.trendUp ? '#1FB57A' : '#F5A623' }}>
            {kpi.trend}
          </span>
        </div>
      )}
    </Link>
  );
}

const miniTooltipStyle = { background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10, color: '#F4F8FC', padding: '4px 8px' };

/* ── main component ────────────────────────────────────────── */
export default function PartnerDashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-6xl space-y-6 pb-10">
      <style>{`
        @keyframes fadeSlideUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stampIn      { 0%{opacity:0;transform:scale(0.65)} 70%{transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulseGreen   { 0%,100%{box-shadow:0 0 0 0 rgba(31,181,122,0.5)} 50%{box-shadow:0 0 0 6px rgba(31,181,122,0)} }
      `}</style>

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-6"
        style={{ background: 'linear-gradient(135deg,#0A1F2D 0%,#0D1C2E 60%,#091826 100%)', border: '1px solid rgba(31,181,122,0.25)', animation: 'fadeSlideUp 0.35s ease both', boxShadow: '0 0 60px rgba(31,181,122,0.06)' }}>
        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(31,181,122,0.12), transparent 65%)', transform: 'translate(20%,-20%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(47,128,237,0.07), transparent 70%)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(31,181,122,0.15)', border: '1.5px solid rgba(31,181,122,0.4)', boxShadow: '0 0 20px rgba(31,181,122,0.2)', animation: 'pulseGreen 3s ease-in-out infinite' }}>
                <ShieldCheck size={20} style={{ color: '#1FB57A' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">Dubai Sports Medicine Centre</h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(31,181,122,0.15)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.35)', animation: 'stampIn 0.5s 0.4s ease both' }}>
                    <ShieldCheck size={8} /> Verified Partner
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>Dubai Healthcare City · DSM-2024-0047 · {dateStr}</p>
              </div>
            </div>
          </div>

          {/* Live status pill */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(31,181,122,0.08)', border: '1px solid rgba(31,181,122,0.2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#1FB57A', boxShadow: '0 0 6px rgba(31,181,122,0.9)', animation: 'pulseGreen 2s ease-in-out infinite' }} />
              <span className="text-xs font-bold" style={{ color: '#1FB57A' }}>Clinic Open</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white leading-none">{TODAYS_QUEUE.length}</p>
              <p className="text-[10px]" style={{ color: '#7C8DA6' }}>Today</p>
            </div>
          </div>
        </div>

        {/* Alerts strip */}
        {ALERTS.length > 0 && (
          <div className="relative mt-5 flex flex-col gap-2">
            {ALERTS.map((a, i) => {
              const Icon = a.icon;
              return (
                <Link key={i} to={a.link}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all group"
                  style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}14`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}08`; }}>
                  <Icon size={12} style={{ color: a.color, flexShrink: 0 }} />
                  <p className="text-xs flex-1" style={{ color: 'rgba(244,248,252,0.75)' }}>{a.text}</p>
                  <ChevronRight size={11} style={{ color: a.color, flexShrink: 0 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── KPI tiles ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi, i) => <KpiCard key={kpi.label} kpi={kpi} i={i} />)}
      </div>

      {/* ── Pipeline + Clearance health ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Pipeline */}
        <div className="rounded-2xl p-5"
          style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.4s 0.2s ease both' }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-white">Request Pipeline</p>
            <Link to="/partner/inbox" className="text-xs font-semibold transition-colors"
              style={{ color: '#2F80ED' }}>View all</Link>
          </div>
          {/* Stage flow */}
          <div className="hidden sm:flex items-center gap-0 mb-6">
            {PIPELINE.map((stage, i) => (
              <div key={stage.label} className="flex items-center flex-1">
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full h-1.5 rounded-full" style={{ background: `${stage.color}30` }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${stage.pct}%`, background: stage.color, boxShadow: `0 0 6px ${stage.color}80` }} />
                  </div>
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className="text-[9px] font-semibold" style={{ color: '#7C8DA6' }}>{stage.label}</span>
                    <span className="text-[10px] font-black" style={{ color: stage.color }}>{stage.count}</span>
                  </div>
                </div>
                {i < PIPELINE.length - 1 && <ChevronRight size={14} className="mx-2 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>

          {/* Mobile: stacked */}
          <div className="sm:hidden space-y-2.5 mb-5">
            {PIPELINE.map(stage => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-xs w-32 flex-shrink-0" style={{ color: '#7C8DA6' }}>{stage.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: `${stage.color}20` }}>
                  <div className="h-full rounded-full" style={{ width: `${stage.pct}%`, background: stage.color }} />
                </div>
                <span className="text-xs font-black w-4 text-right flex-shrink-0" style={{ color: stage.color }}>{stage.count}</span>
              </div>
            ))}
          </div>

          {/* Weekly trend mini chart */}
          <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Tests Completed — Past 7 Days</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VOLUME_SPARKLINE} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="d" tick={{ fill: '#7C8DA6', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7C8DA6', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={miniTooltipStyle} itemStyle={{ color: '#1FB57A' }} cursor={{ stroke: 'rgba(31,181,122,0.2)' }} />
                <Line type="monotone" dataKey="v" stroke="#1FB57A" strokeWidth={2} dot={{ r: 3, fill: '#1FB57A', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#1FB57A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clearance health */}
        <div className="rounded-2xl p-5"
          style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.4s 0.25s ease both' }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-white">Clearance Health</p>
            <Link to="/partner/clearances" className="text-xs font-semibold" style={{ color: '#2F80ED' }}>Manage</Link>
          </div>

          {/* Donut-style ring using SVG */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  const r = 38, circ = 2 * Math.PI * r;
                  return CLEARANCE_HEALTH.map((s) => {
                    const dash = (s.pct / 100) * circ;
                    const el = (
                      <circle key={s.label} cx="50" cy="50" r={r}
                        fill="none" stroke={s.color} strokeWidth="12"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-offset * circ / 100}
                        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                    );
                    offset += s.pct;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-black text-white">127</p>
                <p className="text-[9px]" style={{ color: '#7C8DA6' }}>total</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {CLEARANCE_HEALTH.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-white">{s.label}</span>
                    <span className="text-[11px] font-black" style={{ color: s.color }}>{s.count}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
                <span className="text-[10px] w-7 text-right flex-shrink-0" style={{ color: '#7C8DA6' }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's queue + Activity ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

        {/* Today's schedule */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.4s 0.3s ease both' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} style={{ color: '#2F80ED' }} />
              <p className="text-sm font-bold text-white">Today's Schedule</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(47,128,237,0.12)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.25)' }}>
              {TODAYS_QUEUE.length} sessions
            </span>
          </div>

          <div>
            {TODAYS_QUEUE.map((session, i) => {
              const sm = QUEUE_STATUS[session.status];
              const isNow = session.status === 'in_progress';
              return (
                <Link key={session.id} to={`/partner/inbox/${session.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-all"
                  style={{
                    borderBottom: i < TODAYS_QUEUE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: isNow ? 'rgba(245,166,35,0.04)' : 'transparent',
                    borderLeft: isNow ? '2px solid #F5A623' : '2px solid transparent',
                    animation: `fadeSlideUp 0.3s ease ${0.35 + i * 0.05}s both`,
                  }}
                  onMouseEnter={e => { if (!isNow) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={e => { if (!isNow) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  {/* Time */}
                  <div className="w-14 flex-shrink-0 text-center">
                    <p className="text-xs font-black" style={{ color: isNow ? '#F5A623' : 'rgba(255,255,255,0.7)' }}>{session.time}</p>
                    {isNow && <p className="text-[9px] font-bold" style={{ color: '#F5A623' }}>NOW</p>}
                  </div>

                  {/* Divider dot */}
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: sm.color, boxShadow: isNow ? `0 0 6px ${sm.color}` : 'none' }} />
                    <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>

                  {/* Athlete */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={session.avatar} alt={session.athlete}
                      className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                      style={{ border: `1.5px solid ${sm.color}30` }} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{session.athlete}</p>
                      <p className="text-[11px]" style={{ color: '#7C8DA6' }}>{session.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${sm.color}12`, color: sm.color, border: `1px solid ${sm.color}25` }}>
                      {sm.label}
                    </span>
                    <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity + Quick actions */}
        <div className="flex flex-col gap-4">
          {/* Quick actions */}
          <div className="rounded-2xl p-4"
            style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.4s 0.35s ease both' }}>
            <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: '#7C8DA6' }}>Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'New Request',     icon: Inbox,        color: '#1FB57A', path: '/partner/inbox' },
                { label: 'Issue Clearance', icon: Award,        color: '#2F80ED', path: '/partner/clearances' },
                { label: 'Log Injury',      icon: Bone,         color: '#F5A623', path: '/partner/injuries' },
                { label: 'Bookings',        icon: DollarSign,   color: '#1FB57A', path: '/partner/bookings' },
                { label: 'Records',         icon: Hash,         color: '#7C8DA6', path: '/partner/records' },
                { label: 'Analytics',       icon: Activity,     color: '#7C8DA6', path: '/partner/analytics' },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} to={action.path}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${action.color}0D`; (e.currentTarget as HTMLElement).style.borderColor = `${action.color}30`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}>
                      <Icon size={14} style={{ color: action.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-white text-center leading-tight">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl overflow-hidden flex-1"
            style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.4s 0.4s ease both' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-bold text-white">Recent Activity</p>
            </div>
            <div>
              {RECENT_ACTIVITY.map((item, i) => {
                const color = ACTIVITY_DOT[item.type] ?? '#7C8DA6';
                return (
                  <div key={i} className="flex items-start gap-3 px-4 py-3"
                    style={{ borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', animation: `fadeSlideUp 0.3s ease ${0.45 + i * 0.04}s both` }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                    <p className="text-[11px] flex-1 leading-relaxed" style={{ color: 'rgba(244,248,252,0.6)' }}>{item.text}</p>
                    <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#7C8DA6' }}>{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Accreditation footer ──────────────────────────────── */}
      <div className="rounded-2xl p-5"
        style={{ background: '#0D1C2E', border: '1px solid rgba(31,181,122,0.18)', animation: 'fadeSlideUp 0.4s 0.45s ease both' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(31,181,122,0.12)', border: '1.5px solid rgba(31,181,122,0.3)' }}>
              <ShieldCheck size={18} style={{ color: '#1FB57A' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Verified Partner · License DSM-2024-0047</p>
              <p className="text-xs" style={{ color: '#7C8DA6' }}>UAE Sports Medicine Federation · FIFA MCE · WADA · DHA</p>
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Partner Since', value: 'Jan 2024' },
              { label: 'License Renewal', value: 'Jul 2027' },
              { label: 'Commission Rate', value: '15%' },
            ].map(item => (
              <div key={item.label} className="text-center px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-black text-white">{item.value}</p>
                <p className="text-[9px]" style={{ color: '#7C8DA6' }}>{item.label}</p>
              </div>
            ))}
            <Link to="/partner/clinic"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all self-center"
              style={{ background: 'rgba(31,181,122,0.1)', border: '1px solid rgba(31,181,122,0.25)', color: '#1FB57A' }}>
              View Profile <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
