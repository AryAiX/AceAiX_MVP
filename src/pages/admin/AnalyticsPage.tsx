import React, { useEffect, useRef, useState } from 'react';
import {
  TrendingUp, Users, MessageSquare, ShieldCheck, Globe, Activity,
  ArrowUpRight, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

// ── Count-up ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Jul', signups: 480 },
  { month: 'Aug', signups: 520 },
  { month: 'Sep', signups: 610 },
  { month: 'Oct', signups: 730 },
  { month: 'Nov', signups: 820 },
  { month: 'Dec', signups: 910 },
  { month: 'Jan', signups: 1080 },
  { month: 'Feb', signups: 1240 },
  { month: 'Mar', signups: 1100 },
  { month: 'Apr', signups: 1380 },
  { month: 'May', signups: 1520 },
  { month: 'Jun', signups: 1284 },
];

const SPORT_DATA = [
  { sport: 'Football',   pct: 72, count: 8913,  color: '#2F80ED' },
  { sport: 'Athletics',  pct: 12, count: 1486,  color: '#B8F135' },
  { sport: 'Basketball', pct: 7,  count: 866,   color: '#1FB57A' },
  { sport: 'Swimming',   pct: 5,  count: 619,   color: '#F5A623' },
  { sport: 'Other',      pct: 4,  count: 495,   color: '#EF5350' },
];

const GEO_DATA = [
  { country: 'UAE',          users: 4284, pct: 34 },
  { country: 'Saudi Arabia', users: 2891, pct: 23 },
  { country: 'Morocco',      users: 1623, pct: 13 },
  { country: 'Egypt',        users: 1248, pct: 10 },
  { country: 'Iran',         users: 986,  pct: 8  },
  { country: 'Other',        users: 1451, pct: 12 },
];

const SESSION_DATA = [
  { month: 'Jan', sessions: 18400, ai: 62000 },
  { month: 'Feb', sessions: 21200, ai: 70000 },
  { month: 'Mar', sessions: 24000, ai: 78000 },
  { month: 'Apr', sessions: 26100, ai: 83000 },
  { month: 'May', sessions: 27400, ai: 88000 },
  { month: 'Jun', sessions: 28491, ai: 94230 },
];

const KPIS = [
  { label: 'New Signups (30d)',       target: 1284,  prefix: '',  suffix: '',  color: '#2F80ED', delta: '+23%',  icon: Users         },
  { label: 'Search Sessions',         target: 28491, prefix: '',  suffix: '',  color: '#B8F135', delta: '+18%',  icon: Activity      },
  { label: 'AI Chat Messages',        target: 94230, prefix: '',  suffix: '',  color: '#F5A623', delta: '+31%',  icon: MessageSquare },
  { label: 'Medical Verifications',   target: 412,   prefix: '',  suffix: '',  color: '#1FB57A', delta: '+9%',   icon: ShieldCheck   },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

// ── KPI tile ──────────────────────────────────────────────────────────────────

function KpiTile({ label, target, prefix, suffix, color, icon: Icon, delta }: {
  label: string; target: number; prefix?: string; suffix?: string;
  color: string; icon: React.ElementType; delta: string;
}) {
  const val = useCountUp(target);
  return (
    <div
      className="group relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden cursor-default"
      style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${color}12`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${color}08 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={17} />
        </div>
        <span className="flex items-center gap-0.5 text-[11px] font-bold" style={{ color: '#1FB57A' }}>
          <ArrowUpRight size={11} />{delta}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold leading-none tracking-tight text-white">
          {prefix}{val.toLocaleString()}{suffix}
        </p>
        <p className="text-[11px] mt-1" style={{ color: '#9DB0C6' }}>{label}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [activeSport, setActiveSport] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .bar-grow { transform-origin: bottom; animation: barGrow 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .row-in { animation: fadeIn 0.4s ease both; }
      `}</style>

      <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Usage metrics, growth trends, and engagement data
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            LIVE DATA
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((k, i) => (
            <div key={k.label} className="row-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <KpiTile {...k} prefix={k.prefix} suffix={k.suffix} />
            </div>
          ))}
        </div>

        {/* Growth chart */}
        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.5s 0.2s ease both' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.15)' }}>
              <TrendingUp size={15} style={{ color: '#2F80ED' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Monthly New Signups</p>
              <p className="text-[11px]" style={{ color: '#9DB0C6' }}>12-month trailing</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(31,181,122,0.12)', color: '#1FB57A' }}>
              <ArrowUpRight size={11} />+23% MoM
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gAzure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2F80ED" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="signups" stroke="#2F80ED" strokeWidth={2.5} fill="url(#gAzure)" name="Signups" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions + AI */}
        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.5s 0.25s ease both' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.15)' }}>
              <BarChart3 size={15} style={{ color: '#F5A623' }} />
            </div>
            <p className="text-sm font-bold text-white">Sessions & AI Engagement</p>
            <div className="ml-auto flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#B8F135' }}>
                <span className="w-2 h-0.5 inline-block rounded" style={{ background: '#B8F135' }} />
                Search Sessions
              </span>
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#F5A623' }}>
                <span className="w-2 h-0.5 inline-block rounded" style={{ background: '#F5A623' }} />
                AI Messages
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={SESSION_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gVolt2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#B8F135" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#B8F135" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9DB0C6', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="sessions" stroke="#B8F135" strokeWidth={2} fill="url(#gVolt2)" name="Sessions" />
              <Area type="monotone" dataKey="ai" stroke="#F5A623" strokeWidth={2} fill="url(#gAmber)" name="AI Messages" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sport + Geo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Athletes by Sport */}
          <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.5s 0.3s ease both' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,241,53,0.12)' }}>
                <Activity size={15} style={{ color: '#B8F135' }} />
              </div>
              <p className="text-sm font-bold text-white">Athletes by Sport</p>
              <span className="ml-auto text-[11px]" style={{ color: '#9DB0C6' }}>12,379 total</span>
            </div>

            {/* Sport color strip */}
            <div className="flex rounded-lg overflow-hidden h-3 mb-4">
              {SPORT_DATA.map(s => (
                <div
                  key={s.sport}
                  className="cursor-pointer transition-all"
                  style={{
                    width: `${s.pct}%`,
                    background: s.color,
                    opacity: activeSport && activeSport !== s.sport ? 0.3 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={() => setActiveSport(s.sport)}
                  onMouseLeave={() => setActiveSport(null)}
                  title={`${s.sport}: ${s.pct}%`}
                />
              ))}
            </div>

            <div className="space-y-3">
              {SPORT_DATA.map((s, i) => (
                <div
                  key={s.sport}
                  className="row-in cursor-default"
                  style={{
                    animationDelay: `${0.3 + i * 0.06}s`,
                    opacity: activeSport && activeSport !== s.sport ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={() => setActiveSport(s.sport)}
                  onMouseLeave={() => setActiveSport(null)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
                      <span className="text-sm" style={{ color: '#e2e8f0' }}>{s.sport}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: '#9DB0C6' }}>{s.count.toLocaleString()}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.pct}%`,
                        background: s.color,
                        boxShadow: `0 0 8px ${s.color}60`,
                        transition: 'box-shadow 0.2s',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users by Country */}
          <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.5s 0.35s ease both' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(31,181,122,0.12)' }}>
                <Globe size={15} style={{ color: '#1FB57A' }} />
              </div>
              <p className="text-sm font-bold text-white">Users by Country</p>
              <span className="ml-auto text-[11px]" style={{ color: '#9DB0C6' }}>12,483 total</span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={GEO_DATA} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <XAxis
                  type="number"
                  tick={{ fill: '#9DB0C6', fontSize: 9 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  dataKey="country"
                  type="category"
                  tick={{ fill: '#9DB0C6', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  width={80}
                />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="users" fill="#1FB57A" radius={[0, 4, 4, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
