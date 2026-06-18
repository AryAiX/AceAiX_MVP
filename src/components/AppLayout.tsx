import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, User, Video, Activity, Heart, Network,
  TrendingUp, Bot, MessageSquare, Settings, Bell, Search, Menu, X,
  LogOut, ChevronDown, ChevronLeft, ChevronRight,
  Users, ShieldCheck, BarChart3, FileText,
  Briefcase, Sun, Moon, ExternalLink, Home, Rss, Compass,
  Inbox, ClipboardList, Award, Bone, CalendarDays, Building2,
  CalendarCheck, Trophy, Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  badge?: number;
}

function getNav(role: string | null, basePath: string): NavItem[] {
  if (role === 'athlete') return [
    { label: 'Feed',          path: `${basePath}/feed`,          icon: <Home size={17} />,          color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Dashboard',     path: `${basePath}/dashboard`,     icon: <LayoutDashboard size={17} />, color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Profile',       path: `${basePath}/profile`,       icon: <User size={17} />,          color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Media',         path: `${basePath}/media`,         icon: <Video size={17} />,         color: '#E056A0', glow: 'rgba(224,86,160,0.35)' },
    { label: 'Performance',   path: `${basePath}/performance`,   icon: <Activity size={17} />,      color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Medical',       path: `${basePath}/medical`,       icon: <Heart size={17} />,         color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'Network',       path: `${basePath}/network`,       icon: <Network size={17} />,       color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Career',        path: `${basePath}/career`,        icon: <TrendingUp size={17} />,    color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Events',        path: `${basePath}/events`,        icon: <CalendarCheck size={17} />, color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Opportunities', path: `${basePath}/opportunities`, icon: <Briefcase size={17} />,     color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'AI Coach',      path: `${basePath}/ai`,            icon: <Bot size={17} />,           color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Analytics',     path: `${basePath}/analytics`,     icon: <BarChart3 size={17} />,     color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Messages',      path: `${basePath}/messages`,      icon: <MessageSquare size={17} />, color: '#E056A0', glow: 'rgba(224,86,160,0.35)', badge: 3 },
    { label: 'Settings',      path: `${basePath}/settings`,      icon: <Settings size={17} />,      color: '#7C8DA6', glow: 'rgba(124,141,166,0.25)' },
  ];
  if (role === 'scout') return [
    { label: 'Feed',       path: `${basePath}/feed`,       icon: <Home size={17} />,          color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Dashboard',  path: `${basePath}/dashboard`,  icon: <LayoutDashboard size={17} />, color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Search',     path: `${basePath}/search`,     icon: <Search size={17} />,         color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'Watchlists', path: `${basePath}/watchlists`, icon: <Users size={17} />,          color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Analytics',  path: `${basePath}/analytics`,  icon: <BarChart3 size={17} />,      color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Messages',   path: `${basePath}/messages`,   icon: <MessageSquare size={17} />,  color: '#E056A0', glow: 'rgba(224,86,160,0.35)', badge: 3 },
    { label: 'Settings',   path: `${basePath}/settings`,   icon: <Settings size={17} />,       color: '#7C8DA6', glow: 'rgba(124,141,166,0.25)' },
  ];
  if (role === 'club') return [
    { label: 'Feed',       path: `${basePath}/feed`,       icon: <Home size={17} />,          color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'Dashboard',  path: `${basePath}/dashboard`,  icon: <LayoutDashboard size={17} />, color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'Squad',      path: `${basePath}/squad`,      icon: <Users size={17} />,          color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Trials',     path: `${basePath}/trials`,     icon: <Briefcase size={17} />,      color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Find Players', path: `${basePath}/search`,   icon: <Search size={17} />,         color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Analytics',  path: `${basePath}/analytics`,  icon: <BarChart3 size={17} />,      color: '#EF5350', glow: 'rgba(239,83,80,0.35)' },
    { label: 'Messages',   path: `${basePath}/messages`,   icon: <MessageSquare size={17} />,  color: '#E056A0', glow: 'rgba(224,86,160,0.35)', badge: 5 },
    { label: 'Settings',   path: `${basePath}/settings`,   icon: <Settings size={17} />,       color: '#7C8DA6', glow: 'rgba(124,141,166,0.25)' },
  ];
  if (role === 'medical_partner') return [
    { label: 'Dashboard',    path: `${basePath}/dashboard`,   icon: <LayoutDashboard size={17} />, color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Inbox',        path: `${basePath}/inbox`,       icon: <Inbox size={17} />,           color: '#1FB57A', glow: 'rgba(31,181,122,0.35)', badge: 5 },
    { label: 'Records',      path: `${basePath}/records`,     icon: <ClipboardList size={17} />,   color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Clearances',   path: `${basePath}/clearances`,  icon: <Award size={17} />,           color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Injuries',     path: `${basePath}/injuries`,    icon: <Bone size={17} />,            color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'Bookings',     path: `${basePath}/bookings`,    icon: <CalendarDays size={17} />,    color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Analytics',    path: `${basePath}/analytics`,   icon: <BarChart3 size={17} />,       color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Clinic',       path: `${basePath}/clinic`,      icon: <Building2 size={17} />,       color: '#7C8DA6', glow: 'rgba(124,141,166,0.25)' },
    { label: 'Settings',     path: `${basePath}/settings`,    icon: <Settings size={17} />,        color: '#7C8DA6', glow: 'rgba(124,141,166,0.25)' },
  ];
  if (role === 'admin') return [
    { label: 'Overview',     path: `${basePath}/dashboard`,    icon: <LayoutDashboard size={17} />, color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Users',        path: `${basePath}/users`,        icon: <Users size={17} />,          color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Verification', path: `${basePath}/verification`, icon: <ShieldCheck size={17} />,    color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Sports',       path: `${basePath}/sports`,       icon: <Activity size={17} />,       color: '#F5A623', glow: 'rgba(245,166,35,0.35)' },
    { label: 'Leagues',      path: `${basePath}/leagues`,      icon: <Trophy size={17} />,         color: '#1FB57A', glow: 'rgba(31,181,122,0.35)' },
    { label: 'Competitions', path: `${basePath}/competitions`, icon: <Layers size={17} />,         color: '#B8F135', glow: 'rgba(184,241,53,0.35)' },
    { label: 'Analytics',    path: `${basePath}/analytics`,    icon: <BarChart3 size={17} />,      color: '#2F80ED', glow: 'rgba(47,128,237,0.35)' },
    { label: 'Settings',     path: `${basePath}/settings`,     icon: <Settings size={17} />,       color: '#7C8DA6', glow: 'rgba(124,141,166,0.25)' },
  ];
  return [];
}

function getBasePath(role: string | null) {
  if (role === 'athlete') return '/athlete';
  if (role === 'scout') return '/recruiter';
  if (role === 'club') return '/club';
  if (role === 'medical_partner') return '/partner';
  if (role === 'admin') return '/admin';
  return '/athlete';
}

const NOTIFS = [
  { id: '1', text: 'Al Ain FC scout viewed your profile', time: '5m ago', unread: true },
  { id: '2', text: 'New medical clearance request', time: '1h ago', unread: true },
  { id: '3', text: 'Your AI score updated to 9.2', time: '3h ago', unread: false },
];

function Dropdown({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null;
  return <>{children}</>;
}

function NavLink({
  item, active, collapsed, mobile, index, onClick,
}: {
  item: NavItem; active: boolean; collapsed: boolean; mobile: boolean; index: number; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40 + index * 45);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <Link
      to={item.path}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed && !mobile ? item.label : undefined}
      className="relative flex items-center gap-3 rounded-xl text-sm font-medium overflow-hidden"
      style={{
        padding: collapsed && !mobile ? '10px 0' : '9px 12px',
        justifyContent: collapsed && !mobile ? 'center' : undefined,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-18px)',
        transition: `opacity 0.35s ease ${index * 0.04}s, transform 0.38s cubic-bezier(0.19,1,0.22,1) ${index * 0.04}s, background 0.18s ease, box-shadow 0.18s ease`,
        background: active
          ? `linear-gradient(90deg, ${item.color}1A 0%, ${item.color}08 100%)`
          : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        boxShadow: active ? `inset 0 0 0 1px ${item.color}20` : 'none',
        color: active ? item.color : hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
      }}
    >
      {/* Active left bar */}
      <div
        className="absolute left-0 top-1/2 rounded-r-full"
        style={{
          width: 3,
          height: active ? 26 : 0,
          background: item.color,
          transform: 'translateY(-50%)',
          boxShadow: active ? `0 0 10px ${item.glow}, 0 0 20px ${item.glow}` : 'none',
          transition: 'height 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
        }}
      />

      {/* Icon wrapper */}
      <span
        className="relative flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 30, height: 30,
          background: active ? `${item.color}20` : hovered ? `${item.color}12` : 'transparent',
          color: active ? item.color : hovered ? item.color : 'rgba(255,255,255,0.45)',
          transform: hovered || active ? 'scale(1.10)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.18s ease, color 0.18s ease',
          boxShadow: active ? `0 0 14px ${item.glow}` : 'none',
        }}
      >
        {item.icon}
      </span>

      {/* Label + badge */}
      {(!collapsed || mobile) && (
        <span className="flex-1 leading-none" style={{ transition: 'color 0.15s ease' }}>
          {item.label}
        </span>
      )}
      {(!collapsed || mobile) && item.badge && (
        <span
          className="flex items-center justify-center text-white text-[9px] font-bold rounded-full flex-shrink-0"
          style={{
            width: 18, height: 18,
            background: item.color,
            boxShadow: `0 0 8px ${item.glow}`,
            animation: 'pulseScale 2s ease-in-out infinite',
          }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function AppLayout() {
  const { user, profile, role, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const basePath = getBasePath(role);
  const navItems = getNav(role, basePath);
  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Element;
      if (!t.closest('[data-dropdown]')) {
        setNotifOpen(false);
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const show = !collapsed || mobile;
    return (
      <div className="flex flex-col h-full relative overflow-hidden">

        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-48 h-48 rounded-full"
            style={{
              top: '-20%', left: '-30%',
              background: 'radial-gradient(circle, rgba(47,128,237,0.12), transparent 70%)',
              animation: 'sidebarOrb1 12s ease-in-out infinite',
            }} />
          <div className="absolute w-40 h-40 rounded-full"
            style={{
              bottom: '10%', right: '-20%',
              background: 'radial-gradient(circle, rgba(184,241,53,0.08), transparent 70%)',
              animation: 'sidebarOrb2 16s ease-in-out infinite',
            }} />
        </div>

        {/* Logo */}
        <div
          className="relative flex items-center px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', gap: show ? 10 : 0, justifyContent: !show ? 'center' : undefined }}
        >
          <img
            src="/AceAiX_logo_transparent%20copy%20copy%20copy.png"
            alt="AceAiX"
            className="flex-shrink-0"
            style={{
              width: 80, height: 80,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(47,128,237,0.5)) drop-shadow(0 0 20px rgba(47,128,237,0.2))',
              animation: 'logoPulse 3s ease-in-out infinite',
            }}
          />
          {show && (
            <div className="flex-1 min-w-0 flex flex-col gap-1" style={{ marginLeft: 6 }}>
              <img
                src="/AceAiX_logo_transparent2%20copy.png"
                alt="AceAiX"
                style={{ width: 'auto', height: 38, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(47,128,237,0.4))' }}
              />
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'livePulse 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(31,181,122,0.8)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#1FB57A' }}>Live</span>
              </div>
            </div>
          )}
          {!mobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.35)', marginLeft: show ? 0 : undefined }}
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          )}
        </div>

        {/* Role badge */}
        {show && (
          <div className="px-4 pt-3 pb-1">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: role === 'club'
                  ? 'linear-gradient(90deg,rgba(245,166,35,0.15),rgba(245,166,35,0.05))'
                  : role === 'scout'
                  ? 'linear-gradient(90deg,rgba(245,166,35,0.15),rgba(245,166,35,0.05))'
                  : 'linear-gradient(90deg,rgba(47,128,237,0.15),rgba(47,128,237,0.05))',
                border: `1px solid ${role === 'scout' || role === 'club' ? 'rgba(245,166,35,0.30)' : 'rgba(47,128,237,0.30)'}`,
                color: role === 'scout' || role === 'club' ? '#F5A623' : '#2F80ED',
              }}
            >
              <ShieldCheck size={10} />
              {role?.replace('_', ' ')}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-3 space-y-0.5">
          {navItems.map((item, i) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                item={item}
                active={active}
                collapsed={collapsed}
                mobile={mobile}
                index={i}
                onClick={mobile ? () => setMobileOpen(false) : undefined}
              />
            );
          })}

          {/* Divider + utility links */}
          <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {(role === 'athlete' || role === 'scout' || role === 'club') && (
              <NavLink
                item={{
                  label: 'View Public Profile',
                  path: role === 'athlete' ? `/athletes/${user?.id ?? 'a1'}` : role === 'club' ? `/clubs/${user?.id ?? 'alwasl'}` : `/scouts/${user?.id ?? 's1'}`,
                  icon: <User size={17} />,
                  color: '#2F80ED',
                  glow: 'rgba(47,128,237,0.30)',
                }}
                active={false}
                collapsed={collapsed}
                mobile={mobile}
                index={navItems.length}
                onClick={mobile ? () => setMobileOpen(false) : undefined}
              />
            )}
            <NavLink
              item={{
                label: 'Discover Athletes',
                path: basePath === '/recruiter' ? '/recruiter/discover' : '/discover',
                icon: <Compass size={17} />,
                color: '#F5A623',
                glow: 'rgba(245,166,35,0.30)',
              }}
              active={false}
              collapsed={collapsed}
              mobile={mobile}
              index={navItems.length + 1}
              onClick={mobile ? () => setMobileOpen(false) : undefined}
            />
          </div>
        </nav>

        {/* User card */}
        <div
          className="relative flex-shrink-0 p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {!show ? (
            <div
              className="w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(47,128,237,0.3), rgba(184,241,53,0.15))',
                border: '1.5px solid rgba(47,128,237,0.4)',
                color: '#2F80ED',
                boxShadow: '0 0 14px rgba(47,128,237,0.25)',
              }}
              onClick={() => navigate(`${basePath}/settings`)}
            >
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer group transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(47,128,237,0.08), rgba(184,241,53,0.04))',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
              onClick={() => navigate(`${basePath}/settings`)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(47,128,237,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
            >
              <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(47,128,237,0.4), rgba(184,241,53,0.2))',
                  border: '1.5px solid rgba(47,128,237,0.45)',
                  color: '#fff',
                  boxShadow: '0 0 14px rgba(47,128,237,0.3)',
                }}
              >
                {profile?.full_name?.charAt(0) ?? 'U'}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: '#1FB57A', borderColor: '#0A1426', boxShadow: '0 0 6px rgba(31,181,122,0.7)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{profile?.full_name ?? 'User'}</p>
                <p className="text-[10px] capitalize truncate mt-0.5" style={{ color: '#7C8DA6' }}>{role?.replace('_', ' ')}</p>
              </div>
              <Settings size={12} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080F1C' }}>
      <style>{`
        @keyframes sidebarOrb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(12px,18px) scale(1.15); }
        }
        @keyframes sidebarOrb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-10px,-14px) scale(1.12); }
        }
        @keyframes logoPulse {
          0%,100% { filter: drop-shadow(0 0 10px rgba(47,128,237,0.5)) drop-shadow(0 0 20px rgba(47,128,237,0.2)); }
          50% { filter: drop-shadow(0 0 16px rgba(47,128,237,0.75)) drop-shadow(0 0 32px rgba(47,128,237,0.35)); }
        }
        @keyframes livePulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes pulseScale {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes topbarGlow {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Background aurora */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #2F80ED, transparent 70%)', animation: 'aurora1 18s ease-in-out infinite' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #B8F135, transparent 70%)', animation: 'aurora2 24s ease-in-out infinite' }} />
      </div>

      {/* Desktop sidebar */}
      <aside
        className="relative hidden lg:flex flex-col z-10 flex-shrink-0"
        style={{
          width: collapsed ? 68 : 248,
          background: 'linear-gradient(180deg, #0A1726 0%, #071120 60%, #0A1726 100%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-40 w-64 lg:hidden"
            style={{
              background: 'linear-gradient(180deg, #0A1726 0%, #071120 60%, #0A1726 100%)',
              borderRight: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
              animation: 'slideInLeft 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2.5">
              <img src="/AceAiX_logo_transparent%20copy%20copy%20copy.png" alt="AceAiX" style={{ width: 74, height: 74, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(47,128,237,0.5))' }} />
              <img src="/AceAiX_logo_transparent2%20copy.png" alt="AceAiX wordmark" style={{ height: 36, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(47,128,237,0.4))', marginLeft: 6 }} />
              </div>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                <X size={16} />
              </button>
            </div>
            <SidebarContent mobile />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden z-10">

        {/* Top bar */}
        <header
          className="relative flex items-center gap-3 px-4 lg:px-6 z-20 flex-shrink-0"
          style={{
            height: 58,
            background: 'rgba(8,15,28,0.94)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 1px 0 rgba(47,128,237,0.08)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <Menu size={18} />
          </button>

          {/* Back + page label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] transition-all"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <ChevronLeft size={15} />
            </button>
            {(() => {
              const active = navItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
              return active ? (
                <span
                  className="hidden sm:block text-sm font-semibold"
                  style={{ color: active.color }}
                >
                  {active.label}
                </span>
              ) : null;
            })()}
          </div>

          {/* Search */}
          <div className="relative hidden sm:flex items-center flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input
              placeholder="Search athletes, clubs..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) navigate(basePath === '/recruiter' ? '/recruiter/search' : '/discover');
                }
              }}
              className="w-full rounded-xl pl-9 pr-3 py-1.5 text-sm focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.8)',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.45)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
          </div>

          {/* Animated accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(47,128,237,0.5),rgba(184,241,53,0.4),transparent)', animation: 'topbarGlow 4s ease-in-out infinite' }}
          />

          <div className="ml-auto flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.07] transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.07] transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span
                    className="absolute flex items-center justify-center text-white text-[8px] font-bold rounded-full"
                    style={{
                      top: 4, right: 4, width: 14, height: 14,
                      background: 'linear-gradient(135deg,#2F80ED,#1a5bbf)',
                      boxShadow: '0 0 8px rgba(47,128,237,0.7)',
                      animation: 'pulseScale 2s ease-in-out infinite',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              <Dropdown open={notifOpen}>
                <div
                  className="absolute right-0 top-10 w-80 rounded-2xl z-50 overflow-hidden"
                  style={{ background: 'rgba(10,20,38,0.98)', border: '1px solid rgba(255,255,255,0.11)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-sm font-bold text-white">Notifications</p>
                  </div>
                  {NOTIFS.map((n) => (
                    <div key={n.id}
                      className="px-4 py-3 cursor-pointer transition-colors"
                      style={{ background: n.unread ? 'rgba(47,128,237,0.07)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = n.unread ? 'rgba(47,128,237,0.07)' : 'transparent')}>
                      <div className="flex gap-2">
                        {n.unread && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2F80ED', boxShadow: '0 0 6px rgba(47,128,237,0.8)' }} />}
                        <div className={n.unread ? '' : 'ml-3.5'}>
                          <p className="text-xs text-white/80 leading-relaxed">{n.text}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#7C8DA6' }}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Dropdown>
            </div>

            {/* User menu */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
                className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl hover:bg-white/[0.07] transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg,rgba(47,128,237,0.4),rgba(184,241,53,0.2))',
                    border: '1.5px solid rgba(47,128,237,0.4)',
                    color: '#fff',
                    boxShadow: '0 0 10px rgba(47,128,237,0.3)',
                  }}
                >
                  {profile?.full_name?.charAt(0) ?? 'U'}
                </div>
                <ChevronDown size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
              <Dropdown open={userOpen}>
                <div
                  className="absolute right-0 top-11 w-52 rounded-2xl z-50 overflow-hidden"
                  style={{ background: 'rgba(10,20,38,0.98)', border: '1px solid rgba(255,255,255,0.11)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-sm font-semibold text-white">{profile?.full_name ?? 'User'}</p>
                    <p className="text-xs capitalize mt-0.5" style={{ color: '#7C8DA6' }}>{role?.replace('_', ' ')}</p>
                  </div>
                  <div className="p-1">
                    <Link to={`${basePath}/settings`} onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/[0.06]"
                      style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <Settings size={13} /> Settings
                    </Link>
                    {(role === 'athlete' || role === 'scout' || role === 'club') && user?.id && (
                      <Link
                        to={role === 'athlete' ? `/athletes/${user.id}` : role === 'club' ? `/clubs/${user.id}` : `/scouts/${user.id}`}
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/[0.06]"
                        style={{ color: 'rgba(255,255,255,0.55)' }}>
                        <ExternalLink size={13} style={{ color: '#2F80ED' }} /> View Public Profile
                      </Link>
                    )}
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/[0.08]"
                      style={{ color: 'rgba(239,68,68,0.7)' }}>
                      <LogOut size={13} /> Sign out
                    </button>
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7" style={{ background: '#080F1C' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
