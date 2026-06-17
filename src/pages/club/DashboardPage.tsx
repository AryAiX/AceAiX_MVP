import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, ChevronRight, Zap, ShieldCheck,
  TrendingUp, Bell, Target, Clock, ArrowUpRight,
  Flame, Building2, Star, BarChart3, Trophy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATS = [
  { label: 'Squad Size',      value: 28,  delta: '+2',  up: true,  color: '#2F80ED', icon: Users         },
  { label: 'Open Trials',     value: 3,   delta: '+1',  up: true,  color: '#B8F135', icon: Target        },
  { label: 'Active Outreach', value: 11,  delta: '+4',  up: true,  color: '#1FB57A', icon: MessageSquare },
  { label: 'Profile Views',   value: 847, delta: '+93', up: true,  color: '#F5A623', icon: BarChart3     },
];

const PIPELINE = [
  { stage: 'Scouted',    count: 31, color: '#2F80ED' },
  { stage: 'Contacted',  count: 14, color: '#1FB57A' },
  { stage: 'In Trial',   count: 5,  color: '#F5A623' },
  { stage: 'Offer Sent', count: 2,  color: '#B8F135' },
];
const PIPE_TOTAL = PIPELINE.reduce((s, p) => s + p.count, 0);

const TRIAL_APPLICATIONS = [
  { name: 'Khalid Al-Rashidi', position: 'Striker',    score: 92, match: 97, age: 21, verified: true,  hot: true,  image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Tariq Hassan',      position: 'Midfielder', score: 88, match: 93, age: 24, verified: true,  hot: false, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Yusuf Al-Kaabi',    position: 'Winger',     score: 85, match: 89, age: 20, verified: false, hot: true,  image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

const ACTIVITY = [
  { action: 'New trial application', name: 'Khalid Al-Rashidi', time: '14m ago', color: '#B8F135', icon: Target        },
  { action: 'Scout shortlisted',     name: 'Tariq Hassan',      time: '2h ago',  color: '#2F80ED', icon: Star          },
  { action: 'Message received',      name: 'Al Jazira FC',      time: '5h ago',  color: '#1FB57A', icon: MessageSquare },
  { action: 'New follower',          name: 'Rayan Benali',      time: '1d ago',  color: '#F5A623', icon: Users         },
];

function Counter({ target, delay = 0 }: { target: number; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 28));
      const id = setInterval(() => {
        cur = Math.min(cur + step, target);
        setVal(cur);
        if (cur >= target) clearInterval(id);
      }, 28);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <>{val}</>;
}

function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 400); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${w}%`, background: `linear-gradient(90deg,${color}60,${color})`, boxShadow: `0 0 8px ${color}55`, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

function StatCard({ s, idx }: { s: typeof STATS[0]; idx: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100 + idx * 75); return () => clearTimeout(t); }, [idx]);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="rounded-2xl p-5 cursor-default"
      style={{
        background: hov ? `${s.color}0E` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? s.color + '38' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hov ? `0 8px 32px ${s.color}18` : 'none',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
        transition: 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}>
          <s.icon size={17} style={{ color: s.color }} />
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{
            background: s.up ? 'rgba(31,181,122,0.12)' : 'rgba(239,83,80,0.12)',
            color: s.up ? '#1FB57A' : '#EF5350',
            border: `1px solid ${s.up ? 'rgba(31,181,122,0.28)' : 'rgba(239,83,80,0.28)'}`,
          }}>
          <TrendingUp size={9} style={{ transform: s.up ? 'none' : 'rotate(180deg)' }} />
          {s.delta}
        </span>
      </div>
      <p className="text-3xl font-display font-bold text-white tabular mb-0.5">
        <Counter target={s.value} delay={100 + idx * 75} />
      </p>
      <p className="text-[12px] text-white/40">{s.label}</p>
    </div>
  );
}

export default function ClubDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  return (
    <div className="max-w-7xl space-y-5 pb-10">

      {/* HERO */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0B1728 0%,#0F1E2E 55%,#0B1A10 100%)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.19,1,0.22,1)',
        }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(245,166,35,0.15) 0%,transparent 68%)' }} />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(31,181,122,0.08) 0%,transparent 68%)' }} />

        <div className="relative px-6 sm:px-8 pt-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.13)', border: '1px solid rgba(245,166,35,0.35)', boxShadow: '0 0 30px rgba(245,166,35,0.18)' }}>
              <Building2 size={22} style={{ color: '#F5A623' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {profile?.full_name ?? 'Club'} Portal
                </h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(245,166,35,0.13)', border: '1px solid rgba(245,166,35,0.30)', color: '#F5A623' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F5A623' }} />
                  Live
                </span>
              </div>
              <p className="text-white/40 text-sm">Manage your squad, trials and recruitment</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <Link to="/club/trials"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(184,241,53,0.12)', border: '1px solid rgba(184,241,53,0.28)', color: '#B8F135' }}>
              <Target size={14} /> Open Trials
            </Link>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}>
              <Bell size={14} /> Alerts
              <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#EF5350', color: '#fff' }}>5</span>
            </button>
            <Link to="/club/search"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#F5A623', color: '#0C1A2B', boxShadow: '0 4px 20px rgba(245,166,35,0.45)' }}>
              <Users size={14} /> Find Players
            </Link>
          </div>
        </div>

        <div className="mx-6 sm:mx-8 mt-5 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(245,166,35,0.55) 35%,rgba(31,181,122,0.38) 65%,transparent)' }} />

        <div className="relative px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">Recruitment Pipeline</p>
            <p className="text-[11px] text-white/25">{PIPE_TOTAL} candidates total</p>
          </div>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
            {PIPELINE.map((p, i) => (
              <div key={p.stage}
                style={{
                  width: mounted ? `${(p.count / PIPE_TOTAL) * 100}%` : '0%',
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}65`,
                  borderRadius: '9999px',
                  transition: `width 0.9s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.1}s`,
                }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            {PIPELINE.map(p => (
              <div key={p.stage} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[11px] text-white/40">{p.stage}</span>
                <span className="text-[11px] font-bold" style={{ color: p.color }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} s={s} idx={i} />)}
      </div>

      {/* TRIAL APPLICATIONS */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.5s ease 0.3s both' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184,241,53,0.13)', border: '1px solid rgba(184,241,53,0.28)' }}>
              <Zap size={14} style={{ color: '#B8F135' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Top Trial Applicants</h2>
              <p className="text-[11px] text-white/30">AI-ranked for your open positions</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold"
              style={{ background: 'rgba(184,241,53,0.13)', border: '1px solid rgba(184,241,53,0.28)', color: '#B8F135' }}>
              AI Ranked
            </span>
          </div>
          <Link to="/club/trials" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#F5A623' }}>
            View all <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRIAL_APPLICATIONS.map((a, i) => {
            const [hov, setHov] = useState(false);
            const mc = a.match >= 95 ? '#B8F135' : a.match >= 90 ? '#1FB57A' : '#2F80ED';
            return (
              <Link key={a.name} to="/club/trials"
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                className="block rounded-2xl overflow-hidden"
                style={{
                  background: hov ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hov ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.4)' : 'none',
                  transform: hov ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                <div className="relative h-32 overflow-hidden">
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover object-top"
                    style={{ transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 25%,rgba(11,23,40,0.97))' }} />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    {a.verified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: 'rgba(31,181,122,0.90)', color: '#fff' }}>
                        <ShieldCheck size={8} /> Verified
                      </span>
                    )}
                    {a.hot && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: 'rgba(245,166,35,0.90)', color: '#0C1A2B' }}>
                        <Flame size={8} /> Hot
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl font-display font-bold text-sm"
                    style={{ background: 'rgba(11,23,40,0.82)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)' }}>
                    {a.score}
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <p className="text-sm font-bold text-white leading-tight">{a.name}</p>
                    <p className="text-[10px] text-white/45">{a.position} · Age {a.age}</p>
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">AI Match</span>
                    <span className="text-[11px] font-bold" style={{ color: mc }}>{a.match}%</span>
                  </div>
                  <Bar pct={a.match} color={mc} delay={i * 90} />
                  <div className="flex gap-2 mt-3">
                    <button onClick={e => e.preventDefault()}
                      className="flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                      style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.25)', color: '#1FB57A' }}>
                      Shortlist
                    </button>
                    <button onClick={e => e.preventDefault()}
                      className="flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                      style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.25)', color: '#2F80ED' }}>
                      Message
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Activity */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.5s ease 0.4s both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,166,35,0.13)', border: '1px solid rgba(245,166,35,0.26)' }}>
                <Clock size={12} style={{ color: '#F5A623' }} />
              </div>
              <h2 className="text-sm font-bold text-white">Recent Activity</h2>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#1FB57A' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1FB57A' }} />
              Live
            </span>
          </div>
          <div className="space-y-0.5">
            {ACTIVITY.map((item, i) => (
              <div key={i} onClick={() => navigate('/club/messages')}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.03]"
                style={{ animation: `slideUp 0.35s ease ${0.44 + i * 0.07}s both` }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}13`, border: `1px solid ${item.color}25` }}>
                  <item.icon size={11} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/50">{item.action}</p>
                  <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                </div>
                <span className="text-[10px] text-white/22 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trophy & Quick Stats */}
        <div className="rounded-2xl p-5 lg:col-span-2"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.5s ease 0.46s both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(184,241,53,0.13)', border: '1px solid rgba(184,241,53,0.26)' }}>
                <Trophy size={12} style={{ color: '#B8F135' }} />
              </div>
              <h2 className="text-sm font-bold text-white">Season Performance</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Matches Played', value: '26', sub: '18W · 5D · 3L', color: '#2F80ED' },
              { label: 'Goals Scored',   value: '62', sub: '2.4 per game',  color: '#B8F135' },
              { label: 'Clean Sheets',   value: '11', sub: '42% rate',      color: '#1FB57A' },
              { label: 'League Position',value: '1st', sub: 'UAE Pro League', color: '#F5A623' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                <p className="text-2xl font-black text-white leading-none mb-0.5" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-white/50 mb-0.5">{s.label}</p>
                <p className="text-[9px]" style={{ color: `${s.color}80` }}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-white/30">Squad Nationality Mix</p>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
              {[
                { label: 'UAE', pct: 54, color: '#2F80ED' },
                { label: 'Brazil', pct: 18, color: '#1FB57A' },
                { label: 'Europe', pct: 18, color: '#F5A623' },
                { label: 'Other', pct: 10, color: '#B8F135' },
              ].map((n, i) => (
                <div key={n.label}
                  style={{
                    width: mounted ? `${n.pct}%` : '0%',
                    background: n.color,
                    borderRadius: '9999px',
                    transition: `width 0.8s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.1}s`,
                  }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {[
                { label: 'UAE',    pct: 54, color: '#2F80ED' },
                { label: 'Brazil', pct: 18, color: '#1FB57A' },
                { label: 'Europe', pct: 18, color: '#F5A623' },
                { label: 'Other',  pct: 10, color: '#B8F135' },
              ].map(n => (
                <div key={n.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: n.color }} />
                  <span className="text-[11px] text-white/40">{n.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: n.color }}>{n.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        style={{ animation: 'slideUp 0.5s ease 0.54s both' }}>
        {[
          { label: 'Find Players',  icon: Users,        color: '#F5A623', to: '/club/search'    },
          { label: 'Open Trials',   icon: Target,       color: '#B8F135', to: '/club/trials'    },
          { label: 'Squad',         icon: Building2,    color: '#2F80ED', to: '/club/squad'     },
          { label: 'Messages',      icon: MessageSquare,color: '#1FB57A', to: '/club/messages'  },
          { label: 'Analytics',     icon: BarChart3,    color: '#EF5350', to: '/club/analytics' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group"
            style={{ background: `${a.color}09`, border: `1px solid ${a.color}1A` }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${a.color}14`; el.style.borderColor = `${a.color}35`; el.style.boxShadow = `0 4px 22px ${a.color}16`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${a.color}09`; el.style.borderColor = `${a.color}1A`; el.style.boxShadow = 'none'; }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}15`, border: `1px solid ${a.color}28` }}>
              <a.icon size={14} style={{ color: a.color }} />
            </div>
            <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors truncate">{a.label}</span>
            <ChevronRight size={12} className="ml-auto flex-shrink-0 text-white/18 group-hover:text-white/45 transition-colors" />
          </Link>
        ))}
      </div>

    </div>
  );
}
