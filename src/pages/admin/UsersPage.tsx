import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ShieldCheck, Clock, Ban, CheckCircle, UserPlus,
  MoreVertical, Mail, Eye, Trash2, Users, Activity,
  UserCheck, UserX, ArrowUpRight, X, Zap, Filter,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Role   = 'athlete' | 'scout' | 'club' | 'medical_partner' | 'admin';
type Status = 'active' | 'suspended' | 'pending';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string;
  verified: boolean;
  country: string;
  plan: string;
  lastActive: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const USERS: User[] = [
  { id: 'u1',  name: 'Marcus Silva',       email: 'marcus@demo.com',   role: 'athlete',         status: 'active',    joined: '2026-06-08', verified: true,  country: 'Brazil',      plan: 'Elite',     lastActive: '2m ago'  },
  { id: 'u2',  name: 'Aisha Mensah',       email: 'aisha@demo.com',    role: 'athlete',         status: 'active',    joined: '2026-06-07', verified: true,  country: 'Ghana',       plan: 'Pro',       lastActive: '8m ago'  },
  { id: 'u3',  name: 'Lena Fischer',       email: 'lena@demo.com',     role: 'athlete',         status: 'active',    joined: '2026-06-06', verified: true,  country: 'Germany',     plan: 'Pro',       lastActive: '1h ago'  },
  { id: 'u4',  name: 'Jin-ho Park',        email: 'jinho@demo.com',    role: 'athlete',         status: 'active',    joined: '2026-06-06', verified: false, country: 'South Korea', plan: 'Free',      lastActive: '3h ago'  },
  { id: 'u5',  name: 'Priya Nair',         email: 'priya@demo.com',    role: 'athlete',         status: 'active',    joined: '2026-06-05', verified: true,  country: 'India',       plan: 'Pro',       lastActive: '5h ago'  },
  { id: 'u6',  name: 'Rayan Benali',       email: 'rayan@demo.com',    role: 'athlete',         status: 'suspended', joined: '2026-06-04', verified: false, country: 'Algeria',     plan: 'Free',      lastActive: '2d ago'  },
  { id: 'u7',  name: 'Carlos Mendoza',     email: 'carlos@demo.com',   role: 'athlete',         status: 'active',    joined: '2026-06-03', verified: true,  country: 'Colombia',    plan: 'Elite',     lastActive: '10m ago' },
  { id: 'u8',  name: 'Kai Nakamura',       email: 'kai@demo.com',      role: 'athlete',         status: 'pending',   joined: '2026-06-02', verified: false, country: 'Japan',       plan: 'Free',      lastActive: '1d ago'  },
  { id: 'u9',  name: 'Thomas Okonkwo',     email: 'thomas@demo.com',   role: 'scout',           status: 'active',    joined: '2026-06-01', verified: true,  country: 'Nigeria',     plan: 'Scout Pro', lastActive: '30m ago' },
  { id: 'u10', name: 'SportSync Agency',   email: 'contact@sport.com', role: 'scout',           status: 'active',    joined: '2026-05-28', verified: true,  country: 'England',     plan: 'Scout Pro', lastActive: '4h ago'  },
  { id: 'u11', name: 'FC Barcelona Acad.', email: 'fcb@demo.com',      role: 'club',            status: 'active',    joined: '2026-05-20', verified: true,  country: 'Spain',       plan: 'Club Pro',  lastActive: '2h ago'  },
  { id: 'u12', name: 'Dr. Sara Williams',  email: 'sara@med.com',      role: 'medical_partner', status: 'active',    joined: '2026-05-15', verified: true,  country: 'USA',         plan: 'Partner',   lastActive: '6h ago'  },
];

// ── Config ────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  athlete:         { label: 'Athlete',     color: '#2F80ED', bg: 'rgba(47,128,237,0.15)'  },
  scout:           { label: 'Scout',       color: '#F5A623', bg: 'rgba(245,166,35,0.15)'  },
  club:            { label: 'Club',        color: '#1FB57A', bg: 'rgba(31,181,122,0.15)'  },
  medical_partner: { label: 'Med Partner', color: '#B8F135', bg: 'rgba(184,241,53,0.12)'  },
  admin:           { label: 'Admin',       color: '#EF5350', bg: 'rgba(239,83,80,0.15)'   },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: 'Active',    color: '#1FB57A', bg: 'rgba(31,181,122,0.12)',  dot: '#1FB57A' },
  suspended: { label: 'Suspended', color: '#EF5350', bg: 'rgba(239,83,80,0.12)',   dot: '#EF5350' },
  pending:   { label: 'Pending',   color: '#F5A623', bg: 'rgba(245,166,35,0.12)',  dot: '#F5A623' },
};

const ROW_ACCENT: Record<Status, string> = {
  active:    'transparent',
  suspended: '#EF5350',
  pending:   '#F5A623',
};

const AVATAR_GRADIENTS = [
  ['#2F80ED','#B8F135'], ['#1FB57A','#2F80ED'], ['#F5A623','#EF5350'],
  ['#B8F135','#1FB57A'], ['#EF5350','#2F80ED'], ['#2F80ED','#1FB57A'],
  ['#F5A623','#2F80ED'], ['#B8F135','#EF5350'], ['#1FB57A','#F5A623'],
  ['#2F80ED','#F5A623'], ['#EF5350','#1FB57A'], ['#B8F135','#2F80ED'],
];

function avatarGradient(id: string) {
  const idx = parseInt(id.replace('u', ''), 10) % AVATAR_GRADIENTS.length;
  const [a, b] = AVATAR_GRADIENTS[idx];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function avatarGlowColor(id: string) {
  const idx = parseInt(id.replace('u', ''), 10) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx][0];
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
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

// ── Shimmer row ───────────────────────────────────────────────────────────────

function ShimmerRow() {
  return (
    <div className="grid px-4 py-3 items-center"
      style={{
        gridTemplateColumns: '36px 1fr 110px 90px 80px 80px 100px 40px',
        background: '#0D1A2B',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
      {[20, 220, 80, 70, 56, 64, 72, 20].map((w, i) => (
        <div key={i} className="shimmer rounded" style={{ height: 11, width: w, maxWidth: '85%' }} />
      ))}
    </div>
  );
}

// ── Action menu ───────────────────────────────────────────────────────────────

function ActionMenu({ user, onClose }: { user: User; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-8 z-50 w-44 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(10,20,38,0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
        animation: 'menuIn 0.15s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      {[
        { icon: Eye,         label: 'View profile', color: '#2F80ED' },
        { icon: Mail,        label: 'Send email',   color: '#9DB0C6' },
        { icon: CheckCircle, label: 'Verify',       color: '#1FB57A' },
        { icon: Ban,         label: user.status === 'suspended' ? 'Unsuspend' : 'Suspend', color: '#F5A623' },
        { icon: Trash2,      label: 'Delete user',  color: '#EF5350' },
      ].map(a => (
        <button key={a.label}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/[0.06] text-left"
          style={{ color: a.color }}
          onClick={onClose}>
          <a.icon size={12} style={{ color: a.color }} />
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ── KPI tile ──────────────────────────────────────────────────────────────────

function KpiTile({ label, target, color, icon: Icon, delta, live }: {
  label: string; target: number; color: string; icon: React.ElementType;
  delta?: string; live?: boolean;
}) {
  const val = useCountUp(target);
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group cursor-default"
      style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.25s ease, box-shadow 0.25s ease' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${color}12`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${color}0A 0%, transparent 65%)` }} />
      <div className="flex items-start justify-between relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={17} />
        </div>
        <div className="flex items-center gap-1.5">
          {live && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(31,181,122,0.15)', color: '#1FB57A' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1FB57A', animation: 'pulseDot 2s ease-in-out infinite' }} />
              LIVE
            </span>
          )}
          {delta && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: '#1FB57A' }}>
              <ArrowUpRight size={11} />{delta}
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold text-white leading-none tracking-tight tabular-nums">
          {val.toLocaleString()}
        </p>
        <p className="text-[11px] mt-1" style={{ color: '#9DB0C6' }}>{label}</p>
      </div>
    </div>
  );
}

// ── Role distribution strip ───────────────────────────────────────────────────

function RoleBar({ users }: { users: User[] }) {
  const counts = Object.fromEntries(
    Object.keys(ROLE_CONFIG).map(r => [r, users.filter(u => u.role === r).length])
  ) as Record<Role, number>;
  const total = users.length || 1;
  const order: Role[] = ['athlete', 'scout', 'club', 'medical_partner'];

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-white">Role distribution</p>
        <span className="text-[11px]" style={{ color: '#9DB0C6' }}>{total} total</span>
      </div>
      <div className="flex rounded-full overflow-hidden h-2.5 mb-3">
        {order.map(r => (
          <div key={r} style={{
            width: `${(counts[r] / total) * 100}%`,
            background: ROLE_CONFIG[r].color,
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {order.map(r => (
          <div key={r} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ROLE_CONFIG[r].color }} />
            <span className="text-[10px] font-semibold truncate" style={{ color: '#9DB0C6' }}>
              {ROLE_CONFIG[r].label}
            </span>
            <span className="text-[10px] font-bold ml-auto" style={{ color: ROLE_CONFIG[r].color }}>{counts[r]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Signup sparkline ──────────────────────────────────────────────────────────

function SignupSparkline({ mounted }: { mounted: boolean }) {
  const bars = [18, 24, 31, 22, 40, 35, 28, 42, 38, 51, 44, 47, 59, 67];
  const max = Math.max(...bars);
  return (
    <div className="rounded-2xl p-4" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-white">Signups — last 14 days</p>
        <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#1FB57A' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1FB57A', animation: 'pulseDot 2s ease-in-out infinite' }} />
          Live
        </span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 rounded-t-sm"
            style={{
              height: `${(v / max) * 100}%`,
              background: i === bars.length - 1
                ? 'linear-gradient(180deg, #B8F135, rgba(184,241,53,0.45))'
                : `rgba(47,128,237,${0.2 + (v / max) * 0.55})`,
              boxShadow: i === bars.length - 1 ? '0 0 8px rgba(184,241,53,0.5)' : 'none',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transition: `opacity 0.4s ease ${i * 0.03}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.03}s`,
            }} />
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [query, setQuery]           = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [mounted, setMounted]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [liveActive, setLiveActive] = useState(3241);

  useEffect(() => {
    const t = setTimeout(() => { setLoading(false); setMounted(true); }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveActive(n => n + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const filtered = USERS.filter(u => {
    if (query && !u.name.toLowerCase().includes(query) && !u.email.toLowerCase().includes(query)) return false;
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    return true;
  });

  const toggleSelect = (id: string) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const allSelected = filtered.length > 0 && filtered.every(u => selected.has(u.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(u => u.id)));
  };

  const roleOptions   = ['All', 'athlete', 'scout', 'club', 'medical_partner'];
  const statusOptions = ['All', 'active', 'suspended', 'pending'];

  const pendingCount    = USERS.filter(u => u.status === 'pending').length;
  const suspendedCount  = USERS.filter(u => u.status === 'suspended').length;

  return (
    <>
      <style>{`
        @keyframes menuIn {
          0%   { opacity: 0; transform: scale(0.92) translateY(-4px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes pulseOnline {
          0%,100% { box-shadow: 0 0 0 0 rgba(31,181,122,0.6); }
          50%     { box-shadow: 0 0 0 4px rgba(31,181,122,0); }
        }
        @keyframes rowIn {
          0%   { opacity: 0; transform: translateX(-12px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes bulkIn {
          0%   { opacity: 0; transform: translateY(-6px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes liveCount {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-3px); opacity: 0.7; }
          100% { transform: translateY(0); }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9DB0C6' }}>
              Browse, filter, verify and action all platform users
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.25)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623', animation: 'pulseDot 2s ease-in-out infinite' }} />
                {pendingCount} pending review
              </span>
            )}
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: '#B8F135', color: '#0C1A2B', boxShadow: '0 0 20px rgba(184,241,53,0.25)' }}>
              <UserPlus size={14} /> Invite User
            </button>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile label="Total Users"  target={12483}      color="#2F80ED" icon={Users}     delta="+8.4%" />
          <KpiTile label="Active Now"   target={liveActive} color="#1FB57A" icon={Activity}  live />
          <KpiTile label="Verified"     target={9821}       color="#B8F135" icon={UserCheck} delta="+5.1%" />
          <KpiTile label="Suspended"    target={suspendedCount} color="#EF5350" icon={UserX} />
        </div>

        {/* Sub-panels: sparkline + role bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SignupSparkline mounted={mounted} />
          <RoleBar users={USERS} />
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9DB0C6' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value.toLowerCase())}
              placeholder="Search by name or email..."
              className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              onFocus={e  => (e.target.style.borderColor = 'rgba(47,128,237,0.5)')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9DB0C6' }}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex gap-1 flex-wrap">
            {roleOptions.map(r => {
              const cfg    = r !== 'All' ? ROLE_CONFIG[r as Role] : null;
              const active = roleFilter === r;
              return (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: active ? (cfg?.bg ?? 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.04)',
                    color: active ? (cfg?.color ?? 'white') : '#9DB0C6',
                    border: active ? `1px solid ${cfg?.color ?? 'rgba(255,255,255,0.2)'}40` : '1px solid rgba(255,255,255,0.06)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}>
                  {r === 'All' ? 'All Roles' : ROLE_CONFIG[r as Role].label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1">
            {statusOptions.map(s => {
              const cfg    = s !== 'All' ? STATUS_CONFIG[s as Status] : null;
              const active = statusFilter === s;
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: active ? (cfg?.bg ?? 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.04)',
                    color: active ? (cfg?.color ?? 'white') : '#9DB0C6',
                    border: active ? `1px solid ${cfg?.color ?? 'rgba(255,255,255,0.2)'}40` : '1px solid rgba(255,255,255,0.06)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}>
                  {s === 'All' ? 'All Status' : STATUS_CONFIG[s as Status].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(47,128,237,0.08)',
              border: '1px solid rgba(47,128,237,0.3)',
              animation: 'bulkIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
            <Zap size={13} style={{ color: '#2F80ED' }} />
            <span className="text-sm font-semibold" style={{ color: '#2F80ED' }}>{selected.size} selected</span>
            <div className="flex gap-2 ml-1">
              {[
                { label: 'Verify all',  color: '#1FB57A', icon: CheckCircle },
                { label: 'Suspend all', color: '#F5A623', icon: Ban },
                { label: 'Delete all',  color: '#EF5350', icon: Trash2 },
              ].map(a => (
                <button key={a.label} onClick={() => setSelected(new Set())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 hover:scale-[1.03]"
                  style={{ background: `${a.color}18`, color: a.color, border: `1px solid ${a.color}30` }}>
                  <a.icon size={11} />{a.label}
                </button>
              ))}
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto transition-opacity hover:opacity-70" style={{ color: '#9DB0C6' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header */}
          <div className="grid px-4 py-3 text-[10px] font-bold uppercase tracking-widest items-center"
            style={{
              background: '#0A1828',
              color: '#9DB0C6',
              gridTemplateColumns: '36px 1fr 110px 90px 80px 80px 120px 40px',
            }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span className="hidden lg:block">Plan</span>
            <span className="hidden xl:block">Joined</span>
            <span className="hidden lg:block">Last Active</span>
            <span />
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ShimmerRow key={i} />)
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ background: '#0D1A2B' }}>
              <Users size={32} className="mx-auto mb-3 opacity-20 text-white" />
              <p className="text-sm" style={{ color: '#9DB0C6' }}>No users match your filters</p>
            </div>
          ) : (
            filtered.map((user, i) => {
              const roleCfg    = ROLE_CONFIG[user.role];
              const statusCfg  = STATUS_CONFIG[user.status];
              const accent     = ROW_ACCENT[user.status];
              const isSelected = selected.has(user.id);
              const isHovered  = hoveredRow === user.id;
              const glowColor  = avatarGlowColor(user.id);

              return (
                <div
                  key={user.id}
                  className="grid px-4 py-3 items-center cursor-pointer relative group"
                  style={{
                    gridTemplateColumns: '36px 1fr 110px 90px 80px 80px 120px 40px',
                    background: isSelected
                      ? 'rgba(47,128,237,0.07)'
                      : isHovered
                      ? 'rgba(255,255,255,0.025)'
                      : i % 2 === 0 ? '#0D1A2B' : 'rgba(255,255,255,0.012)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `2px solid ${isSelected ? 'rgba(47,128,237,0.6)' : accent !== 'transparent' ? `${accent}60` : 'transparent'}`,
                    animation: `rowIn 0.35s cubic-bezier(0.19,1,0.22,1) both`,
                    animationDelay: `${Math.min(i, 12) * 0.04}s`,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={() => setHoveredRow(user.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(user.id)}
                    className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" onClick={e => e.stopPropagation()} />

                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{
                          background: avatarGradient(user.id),
                          boxShadow: isHovered ? `0 0 16px ${glowColor}50` : 'none',
                          transition: 'box-shadow 0.2s ease',
                        }}>
                        {user.name.charAt(0)}
                      </div>
                      {user.status === 'active' && user.lastActive.includes('m') && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                          style={{
                            background: '#1FB57A',
                            borderColor: '#0D1A2B',
                            animation: 'pulseOnline 2s ease-in-out infinite',
                          }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
                        {user.verified && (
                          <ShieldCheck size={11} style={{ color: '#1FB57A', flexShrink: 0 }} />
                        )}
                      </div>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: '#9DB0C6' }}>{user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold w-fit"
                    style={{ background: roleCfg.bg, color: roleCfg.color }}>
                    {roleCfg.label}
                  </span>

                  {/* Status */}
                  <span className="flex items-center gap-1.5 text-[10px] font-bold w-fit">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: statusCfg.dot,
                        boxShadow: user.status === 'active' && user.lastActive.includes('m')
                          ? `0 0 6px ${statusCfg.dot}` : 'none',
                      }} />
                    <span style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                  </span>

                  {/* Plan */}
                  <span className="hidden lg:block text-xs" style={{ color: '#9DB0C6' }}>{user.plan}</span>

                  {/* Joined */}
                  <span className="hidden xl:block text-xs" style={{ color: '#9DB0C6' }}>{user.joined}</span>

                  {/* Last active + inline quick actions (hover reveal) */}
                  <div className="hidden lg:flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs transition-opacity duration-150 group-hover:opacity-0"
                      style={{ color: '#9DB0C6' }}>
                      <Clock size={11} style={{ flexShrink: 0 }} />
                      {user.lastActive}
                    </div>
                    <div className="absolute flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ right: 48 }}>
                      <button title="View profile"
                        className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-white/10"
                        style={{ color: '#2F80ED' }}>
                        <Eye size={11} />
                      </button>
                      <button title="Verify"
                        className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-white/10"
                        style={{ color: '#1FB57A' }}>
                        <CheckCircle size={11} />
                      </button>
                      <button title={user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-white/10"
                        style={{ color: '#F5A623' }}>
                        <Ban size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative flex justify-end">
                    <button
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: isHovered ? 'white' : '#9DB0C6' }}>
                      <MoreVertical size={13} />
                    </button>
                    {openMenu === user.id && (
                      <ActionMenu user={user} onClose={() => setOpenMenu(null)} />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 text-xs"
            style={{ background: '#0A1828', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#9DB0C6' }}>
            <span>
              Showing <strong className="text-white">{filtered.length}</strong> of <strong className="text-white">{USERS.length}</strong> users
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9DB0C6' }}>Previous</button>
              <button className="px-3 py-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9DB0C6' }}>Next</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
