import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserPlus, UserCheck, MessageSquare, Share2, MoreHorizontal,
  MapPin, Loader2, Users, X, Send, ShieldCheck, Ban,
  UserMinus, AlertTriangle, Zap, ChevronLeft, Trophy, Star,
  BadgeCheck, Plus, Quote, Languages, Activity, CheckCircle2,
  Briefcase, Eye, TrendingUp, Globe, LayoutGrid,
} from 'lucide-react';

import PublicHeader from '../components/PublicHeader';
import AuroraBackground from '../components/ui/AuroraBackground';
import MagneticButton from '../components/ui/MagneticButton';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import ScoreRing from '../components/ui/ScoreRing';
import StatTile from '../components/ui/StatTile';
import SectionCard from '../components/profile/SectionCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SCOUT_PROFILES, SIMILAR_SCOUTS } from '../data/scoutProfile';

/* ── palette ──────────────────────────────────────────────────── */
const C = {
  blue:   '#2F80ED',
  green:  '#1FB57A',
  amber:  '#F5A623',
  lime:   '#B8F135',
  red:    '#EF5350',
  purple: '#9B59B6',
};

/* ── helpers ─────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || started.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect(); started.current = true;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return { val, ref };
}

const ATTR_COLORS: Record<string, string> = {
  'Talent Identification': C.lime,
  'Data & Analytics':      C.blue,
  'Network Depth':         C.green,
  'Player Profiling':      C.amber,
  'Contract Negotiation':  C.red,
  'Youth Development Eye': C.purple,
};

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  professional: { color: C.green,  label: 'Professional' },
  trial:        { color: C.amber,  label: 'On Trial'     },
  academy:      { color: C.blue,   label: 'Academy'      },
};

/* ── Block Modal ─────────────────────────────────────────────── */
function BlockModal({ name, isBlocked, onConfirm, onCancel, loading }: {
  name: string; isBlocked: boolean; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm card-glass p-6 text-center" style={{ animation: 'slideUp 0.2s ease-out', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
        <AlertTriangle size={24} className="text-coral mx-auto mb-3" />
        <h3 className="font-display font-bold text-white mb-1">{isBlocked ? `Unblock ${name}?` : `Block ${name}?`}</h3>
        <p className="text-sm text-muted mb-6">{isBlocked ? `${name} will be able to see your profile again.` : `${name} won't be able to contact you.`}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-ghost py-2.5 text-sm rounded-xl">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl font-semibold inline-flex items-center justify-center gap-2 bg-coral/15 border border-coral/30 text-coral hover:bg-coral/25 disabled:opacity-50 transition-all">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Message Modal ───────────────────────────────────────────── */
function MessageModal({ name, onClose, onSend, sending, isAuth }: {
  name: string; onClose: () => void; onSend: (t: string) => Promise<void>; sending: boolean; isAuth: boolean;
}) {
  const [text, setText] = useState('');
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card-glass p-6" style={{ animation: 'slideUp 0.2s ease-out', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div className="flex items-center justify-between mb-5">
          <div><h3 className="font-display font-bold text-white">Send Message</h3><p className="text-xs text-muted mt-0.5">to {name}</p></div>
          <button onClick={onClose} className="text-muted hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X size={16} /></button>
        </div>
        {!isAuth ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-300 mb-4">Sign in to message {name.split(' ')[0]}.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/auth/login" onClick={onClose} className="btn-primary px-5 py-2.5 text-sm">Sign In</Link>
              <Link to="/auth/register" onClick={onClose} className="btn-outline px-5 py-2.5 text-sm">Register</Link>
            </div>
          </div>
        ) : (
          <>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write a message…" rows={4} className="input-dark resize-none mb-4 text-sm" autoFocus />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{text.length}/500</span>
              <button onClick={() => text.trim() && onSend(text)} disabled={!text.trim() || sending}
                className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-50">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── verification strip ──────────────────────────────────────── */
function VerificationStripScout() {
  const items = [
    { label: 'Licensed Scout', sub: 'AFC · AceAiX Certified', color: 'volt' as const, Icon: BadgeCheck },
    { label: 'Identity Verified', sub: 'Passport · Club ID', color: 'azure' as const, Icon: ShieldCheck },
    { label: 'Background Check', sub: 'AceAiX Cleared', color: 'emerald' as const, Icon: CheckCircle2 },
  ];
  const COLORS = {
    volt:    { bg: 'bg-volt/10 border-volt/25',     icon: 'text-volt',    dot: 'bg-volt',    label: 'text-volt'    },
    azure:   { bg: 'bg-azure/10 border-azure/25',   icon: 'text-azure',   dot: 'bg-azure',   label: 'text-azure'   },
    emerald: { bg: 'bg-emerald/10 border-emerald/25',icon: 'text-emerald', dot: 'bg-emerald', label: 'text-emerald' },
  };
  return (
    <div className="card-glass px-5 py-4" style={{ borderColor: 'rgba(184,241,53,0.20)', boxShadow: '0 0 32px rgba(184,241,53,0.06)' }}>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 size={14} className="text-volt" />
        <span className="text-xs font-bold text-volt uppercase tracking-widest">AceAiX Verified Scout</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map(item => {
          const c = COLORS[item.color];
          return (
            <div key={item.label} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${c.bg}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                <item.Icon size={16} className={c.icon} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold ${c.label}`}>{item.label}</p>
                <p className="text-[10px] text-muted truncate mt-0.5">{item.sub}</p>
              </div>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto ${c.dot}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── scouting spell card ─────────────────────────────────────── */
type SpellState = { expanded: Set<number>; toggle: (i: number) => void };

function SpellCard({ spell, idx, state }: { spell: ReturnType<typeof SCOUT_PROFILES['s1']['scoutingHistory'][0]>; idx: number; state: SpellState }) {
  const open = state.expanded.has(idx);
  const isCurrent = spell.to === 'Present';
  const signRate = spell.athletesRecommended > 0
    ? Math.round((spell.athletesSigned / spell.athletesRecommended) * 100)
    : 0;
  return (
    <div className="relative pl-12">
      {idx < 3 && <div className="absolute left-4 top-10 bottom-0 w-px bg-white/[0.06]" />}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold"
        style={{ background: `${spell.orgColor}18`, borderColor: `${spell.orgColor}30`, color: spell.orgColor }}>
        {spell.orgInitials}
      </div>
      <div className="border border-white/[0.06] rounded-2xl p-4 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
        onClick={() => state.toggle(idx)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white text-sm">{spell.org}</p>
              {isCurrent && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald border border-emerald/25 bg-emerald/10 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald animate-pulse" /> Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">{spell.role} · {spell.from}–{spell.to}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted"><Globe size={9} /> {spell.region}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="font-display font-bold text-volt text-lg tabular">{spell.athletesSigned}</span>
            <span className="text-muted text-xs"> signed</span>
            <p className="text-[10px] text-muted">{signRate}% sign rate</p>
          </div>
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t border-white/[0.05] space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">{spell.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px]">
                <Eye size={9} className="text-muted" />
                <span className="text-muted">Recommended:</span>
                <span className="font-bold text-white">{spell.athletesRecommended}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <CheckCircle2 size={9} className="text-emerald" />
                <span className="text-muted">Signed:</span>
                <span className="font-bold text-volt">{spell.athletesSigned}</span>
              </div>
            </div>
            {spell.notableSignings.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Notable Signings</p>
                <div className="flex flex-wrap gap-2">
                  {spell.notableSignings.map(s => (
                    <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-azure/10 border border-azure/20 text-azure font-semibold">
                      <Star size={8} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── athlete discovery card ──────────────────────────────────── */
function AthleteDiscoveryCard({ athlete }: { athlete: ReturnType<typeof SCOUT_PROFILES['s1']['discoveredAthletes'][0]> }) {
  const [hov, setHov] = useState(false);
  const location = useLocation();
  const portalBase = location.pathname.startsWith('/recruiter/') ? '/recruiter'
    : location.pathname.startsWith('/athlete/') ? '/athlete' : '';
  const st = STATUS_STYLE[athlete.status];
  return (
    <Link to={`${portalBase}/athletes/${athlete.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="block rounded-2xl overflow-hidden"
      style={{
        background: hov ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hov ? '0 10px 36px rgba(0,0,0,0.40)' : 'none',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.25s cubic-bezier(0.34,1.4,0.64,1)',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}>
      <div className="relative h-28 overflow-hidden">
        <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover object-top"
          style={{ transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 30%,rgba(11,23,40,0.97))' }} />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{ background: `${st.color}CC`, color: st.color === C.amber ? '#0C1A2B' : '#fff', backdropFilter: 'blur(4px)' }}>
            {st.label}
          </span>
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg font-display font-bold text-sm"
          style={{ background: 'rgba(11,23,40,0.82)', color: '#fff', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.14)' }}>
          {athlete.aiScore}
        </div>
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-sm font-bold text-white leading-tight">{athlete.name}</p>
          <p className="text-[10px] text-white/45">{athlete.position} · {athlete.currentClub}</p>
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Discovered</p>
            <p className="text-xs font-bold text-white">{athlete.discoveredYear}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Sport</p>
            <p className="text-xs font-bold text-white">{athlete.sport}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Value</p>
            <p className="text-xs font-bold" style={{ color: C.lime }}>{athlete.transferValue}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── main page ───────────────────────────────────────────────── */
export default function ScoutPublicProfilePage({ hideHeader = false }: { hideHeader?: boolean }) {
  const { id = 's1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scout = SCOUT_PROFILES[id] ?? SCOUT_PROFILES['s1'];
  const profileUserId = id;

  const [isFollowing, setIsFollowing]       = useState(false);
  const [followerCount, setFollowerCount]   = useState(scout.followersCount);
  const [followLoading, setFollowLoading]   = useState(false);
  const [isBlocked, setIsBlocked]           = useState(false);
  const [blockLoading, setBlockLoading]     = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen]     = useState(false);
  const [msgOpen, setMsgOpen]               = useState(false);
  const [msgSending, setMsgSending]         = useState(false);
  const [msgSent, setMsgSent]               = useState(false);
  const [endorsedAttrs, setEndorsedAttrs]   = useState<Set<string>>(new Set());
  const [expandedSet, setExpandedSet]       = useState<Set<number>>(new Set([0]));
  const [bioExpanded, setBioExpanded]       = useState(false);
  const [showStickyBar, setShowStickyBar]   = useState(false);
  const [activeTab, setActiveTab]           = useState<'overview' | 'scouting' | 'attributes' | 'network'>('overview');
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const introRef    = useRef<HTMLDivElement>(null);
  const bannerRef   = useRef<HTMLDivElement>(null);
  const isSelf      = user?.id === profileUserId;

  const { val: followerDisplay, ref: followerRef } = useCountUp(followerCount);
  const { val: connDisplay,     ref: connRef     } = useCountUp(scout.connectionsCount);
  const { val: signedDisplay,   ref: signedRef   } = useCountUp(scout.totalAthletesSigned);

  const spellState: SpellState = {
    expanded: expandedSet,
    toggle: (i) => setExpandedSet(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; }),
  };

  // Parallax
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const h = () => { el.style.transform = `translateY(${window.scrollY * 0.14}px)`; };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Sticky bar
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setShowStickyBar(!e.isIntersecting), { threshold: 0 });
    if (introRef.current) obs.observe(introRef.current);
    return () => obs.disconnect();
  }, []);

  // Close more menu
  useEffect(() => {
    if (!moreMenuOpen) return;
    const h = (e: MouseEvent) => { if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setMoreMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [moreMenuOpen]);

  // Load social state
  useEffect(() => {
    async function load() {
      const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileUserId);
      if (count) setFollowerCount(count);
      if (user) {
        const [fR, bR] = await Promise.all([
          supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profileUserId).maybeSingle(),
          supabase.from('user_blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', profileUserId).maybeSingle(),
        ]);
        setIsFollowing(!!fR.data);
        setIsBlocked(!!bR.data);
      }
    }
    load();
  }, [profileUserId, user]);

  async function toggleFollow() {
    if (!user) { navigate('/auth/login'); return; }
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileUserId);
      setIsFollowing(false); setFollowerCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileUserId });
      setIsFollowing(true); setFollowerCount(c => c + 1);
    }
    setFollowLoading(false);
  }

  async function toggleBlock() {
    if (!user) { navigate('/auth/login'); return; }
    setBlockLoading(true);
    if (isBlocked) {
      await supabase.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', profileUserId);
      setIsBlocked(false);
    } else {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileUserId);
        setIsFollowing(false); setFollowerCount(c => Math.max(0, c - 1));
      }
      await supabase.from('user_blocks').insert({ blocker_id: user.id, blocked_id: profileUserId });
      setIsBlocked(true);
    }
    setBlockLoading(false); setBlockConfirmOpen(false); setMoreMenuOpen(false);
  }

  async function handleSendMessage(text: string) {
    if (!user) return;
    setMsgSending(true);
    const { data: existing } = await supabase.from('conversations').select('id')
      .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${profileUserId}),and(participant_1_id.eq.${profileUserId},participant_2_id.eq.${user.id})`).maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data: nc } = await supabase.from('conversations').insert({ participant_1_id: user.id, participant_2_id: profileUserId }).select('id').single();
      convId = nc?.id;
    }
    if (convId) await supabase.from('messages').insert({ conversation_id: convId, sender_id: user.id, content: text });
    setMsgSending(false); setMsgSent(true); setMsgOpen(false);
  }

  return (
    <div className="min-h-screen bg-page">
      {!hideHeader && <PublicHeader avatarOverride={scout.image} />}

      {/* Sticky mini-bar */}
      {showStickyBar && (
        <div className="fixed top-14 left-0 right-0 z-40 glass-dark border-b border-white/[0.08] px-4 lg:px-8"
          style={{ animation: 'slideUp 0.25s cubic-bezier(0.19,1,0.22,1)' }}>
          <div className="max-w-6xl mx-auto flex items-center gap-4 py-2.5">
            <img src={scout.image} alt={scout.name} className="w-8 h-8 rounded-full object-cover border border-white/15 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white text-sm truncate">{scout.name}</p>
              <p className="text-xs text-muted truncate hidden sm:block">{scout.role} · {scout.organization}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isSelf && !isBlocked && (
                <button onClick={toggleFollow} disabled={followLoading}
                  className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-all inline-flex items-center gap-1.5 ${isFollowing ? 'bg-white/[0.06] border border-white/10 text-white' : 'btn-outline'}`}>
                  {followLoading ? <Loader2 size={11} className="animate-spin" /> : isFollowing ? <><UserCheck size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
                </button>
              )}
              {!isSelf && !isBlocked && (
                <button onClick={() => user ? setMsgOpen(true) : navigate('/auth/login')}
                  className="btn-primary px-4 py-1.5 text-xs rounded-lg font-semibold inline-flex items-center gap-1.5">
                  <MessageSquare size={11} /> Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div ref={introRef} className="relative overflow-hidden" style={{ height: '50vh', minHeight: 340 }}>
        <AuroraBackground />
        <div ref={bannerRef} className="absolute inset-0">
          <img src={scout.coverImage} alt="" className="w-full h-[120%] object-cover object-center" />
          <div className="absolute inset-0 hero-overlay-bottom" />
          <div className="absolute inset-0" style={{ background: 'rgba(12,26,43,0.45)' }} />
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-20 left-4 lg:left-8 z-10 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        {/* Scout Intelligence Score badge */}
        <div className="absolute top-20 right-6 lg:right-10 z-10" style={{ animation: 'scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.5s both' }}>
          <div className="card-glass p-3 text-center min-w-[80px]" style={{ boxShadow: `0 0 24px ${C.lime}40` }}>
            <div className="text-3xl font-display font-bold tabular" style={{ color: C.lime, filter: `drop-shadow(0 0 10px ${C.lime}80)` }}>
              {scout.score}
            </div>
            <div className="text-[10px] text-muted mt-0.5">Scout Score</div>
            <div className="flex items-center justify-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: `${C.lime}20`, color: C.lime, border: `1px solid ${C.lime}35` }}>
              <Zap size={8} /> Master
            </div>
          </div>
        </div>

        {/* Specialization chips */}
        <div className="absolute bottom-6 left-4 lg:left-8 flex flex-wrap gap-2 z-10" style={{ animation: 'fadeIn 0.6s ease 0.6s both' }}>
          {scout.regionSpecializations.map(r => (
            <span key={r} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(12,26,43,0.75)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
              <Globe size={8} /> {r}
            </span>
          ))}
        </div>
      </div>

      {/* Intro card */}
      <div className="bg-page border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="relative pb-5">
            {/* Avatar + name row — sits 12px below hero bottom */}
            <div className="flex items-center gap-5 mt-3" style={{ animation: 'fadeIn 0.5s ease 0.1s both' }}>
              <div className="relative flex-shrink-0" style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#0C1A2B]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                  <img src={scout.image} alt={scout.name} className="w-full h-full object-cover" />
                </div>
                {scout.isOpenToOpportunities ? (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-volt text-ink text-[9px] font-bold whitespace-nowrap border border-volt/30"
                    style={{ boxShadow: `0 0 10px ${C.lime}50` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" /> Open to Roles
                  </div>
                ) : (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-panel text-muted text-[9px] font-bold whitespace-nowrap border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted" /> Not Available
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0" style={{ animation: 'fadeIn 0.55s ease 0.2s both' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-white text-2xl lg:text-3xl leading-tight">{scout.name}</h1>
                  {scout.isVerified && <VerifiedBadge animate size="sm" />}
                </div>
                <p className="text-muted text-sm mt-1">{scout.role}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold"
                      style={{ borderColor: `${scout.organizationColor}40`, background: `${scout.organizationColor}15`, color: scout.organizationColor }}>
                      {scout.organizationInitials.charAt(0)}
                    </span>
                    {scout.organization}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted"><MapPin size={11} /> {scout.country} · {scout.nationality}</span>
                  <span className="badge-muted text-[10px]">{scout.yearsExperience} yrs exp.</span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-azure hover:text-azure/80 transition-colors">
                    <Users size={12} />
                    <span ref={followerRef as any} className="tabular">{followerDisplay.toLocaleString()}</span>
                    <span className="text-muted font-normal">followers</span>
                  </button>
                  <span className="text-white/10">·</span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <span ref={connRef as any} className="font-semibold text-white tabular">{connDisplay}</span> connections
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 mt-4 items-center" style={{ animation: 'fadeIn 0.5s ease 0.35s both' }}>
              {!isSelf && !isBlocked && (
                <button onClick={toggleFollow} disabled={followLoading}
                  className={`px-5 py-2 inline-flex items-center gap-2 text-sm rounded-xl font-semibold transition-all ${isFollowing ? 'bg-white/[0.06] border border-white/10 text-white hover:border-coral/40 hover:text-coral' : 'btn-outline'}`}>
                  {followLoading ? <Loader2 size={14} className="animate-spin" /> : isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                </button>
              )}
              <MagneticButton className="btn-volt px-5 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2">
                <Star size={13} className="text-ink" /> Endorse
              </MagneticButton>
              {!isSelf && !isBlocked && (
                <button onClick={() => user ? setMsgOpen(true) : navigate('/auth/login')}
                  className={`px-5 py-2 inline-flex items-center gap-2 text-sm rounded-xl font-semibold transition-all ${msgSent ? 'bg-emerald/10 border border-emerald/20 text-emerald' : 'btn-primary'}`}>
                  <MessageSquare size={14} /> {msgSent ? 'Sent' : 'Message'}
                </button>
              )}
              {isBlocked && !isSelf && (
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-coral/10 border border-coral/20 text-coral">
                  <Ban size={13} /> Blocked
                </span>
              )}
              <button className="btn-ghost px-4 py-2 inline-flex items-center gap-2 text-sm">
                <Share2 size={14} /> Share
              </button>
              {!isSelf && (
                <div ref={moreMenuRef} className="relative">
                  <button onClick={() => setMoreMenuOpen(o => !o)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${moreMenuOpen ? 'bg-white/10 text-white' : 'btn-ghost text-muted hover:text-white'}`}>
                    <MoreHorizontal size={16} />
                  </button>
                  {moreMenuOpen && user && (
                    <div className="absolute right-0 top-11 w-48 card-glass border border-white/10 rounded-2xl overflow-hidden z-20"
                      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.7)', animation: 'fadeIn 0.15s ease' }}>
                      {isFollowing && (
                        <button onClick={() => { toggleFollow(); setMoreMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors border-b border-white/[0.06]">
                          <UserMinus size={14} className="text-muted" /> Unfollow
                        </button>
                      )}
                      <button onClick={() => { setMoreMenuOpen(false); setBlockConfirmOpen(true); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isBlocked ? 'text-emerald hover:bg-emerald/10' : 'text-coral hover:bg-coral/10'}`}>
                        <Ban size={14} /> {isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-16 z-30 glass-dark border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {([
              { id: 'overview',    label: 'Overview',    Icon: LayoutGrid },
              { id: 'scouting',    label: 'Scouting',    Icon: Briefcase  },
              { id: 'attributes',  label: 'Attributes',  Icon: Zap        },
              { id: 'network',     label: 'Network',     Icon: Users      },
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
                style={{ color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.4)' }}
              >
                <Icon size={14} style={{ color: activeTab === id ? '#2F80ED' : undefined }} />
                {label}
                {activeTab === id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #2F80ED, #B8F135)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 pb-28 lg:pb-10">
        <div className="flex gap-6 items-start">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-4">
            <VerificationStripScout />

            {activeTab === 'overview' && (
              <>
            {/* Key Metrics */}
            <SectionCard title="Scouting Impact" delay={0.04}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div className="flex flex-col items-center">
                  <ScoreRing value={scout.score * 10} size={96} label="Scout Score" isTopTier />
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-3 content-start">
                  <StatTile value={scout.totalAthletesSigned} label="Athletes Signed" accent="volt" />
                  <StatTile value={scout.totalClubsWorked}    label="Clubs Worked"    accent="azure" />
                  <StatTile value={scout.yearsExperience}     label="Years Exp."      accent="azure" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.lime}0A`, border: `1px solid ${C.lime}20` }}>
                  <TrendingUp size={16} style={{ color: C.lime }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.lime }}>{scout.totalTransferValue}</p>
                    <p className="text-[10px] text-muted">Transfer Value Generated</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.blue}0A`, border: `1px solid ${C.blue}20` }}>
                  <Globe size={16} style={{ color: C.blue }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.blue }}>{scout.regionSpecializations.length} Regions</p>
                    <p className="text-[10px] text-muted">Geographic Coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.green}0A`, border: `1px solid ${C.green}20` }}>
                  <Eye size={16} style={{ color: C.green }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.green }}>
                      <span ref={signedRef as any}>{signedDisplay}</span>+
                    </p>
                    <p className="text-[10px] text-muted">Athletes Profiled</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Specializations */}
            <SectionCard title="Specializations" icon={<Zap size={15} />}>
              <div className="space-y-4">
                {[
                  { label: 'Sports', items: scout.sportSpecializations, color: C.blue },
                  { label: 'Positions', items: scout.positionSpecializations, color: C.green },
                  { label: 'Regions', items: scout.regionSpecializations, color: C.lime },
                ].map(group => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <span key={item} className="px-3 py-1 rounded-full text-[11px] font-semibold"
                          style={{ background: `${group.color}14`, border: `1px solid ${group.color}28`, color: group.color }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Philosophy */}
            <SectionCard title="Scouting Philosophy" icon={<Briefcase size={15} />}>
              <div className="space-y-3">
                {scout.philosophy.split('\n\n').slice(0, bioExpanded ? undefined : 1).map((p, i) => (
                  <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
                ))}
                {scout.philosophy.split('\n\n').length > 1 && (
                  <button onClick={() => setBioExpanded(e => !e)}
                    className="text-xs font-semibold text-azure hover:text-azure/80 transition-colors">
                    {bioExpanded ? 'Show less' : '…show more'}
                  </button>
                )}
              </div>
            </SectionCard>
              </>
            )}

            {activeTab === 'scouting' && (
              <>
            {/* Activity */}
            <SectionCard title="Activity" icon={<Activity size={15} />}>
              <div className="space-y-4">
                {scout.activity.map(post => (
                  <div key={post.id} className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02]">
                    {post.image && <img src={post.image} alt="" className="w-full h-36 object-cover" />}
                    <div className="p-4">
                      <p className="text-sm text-slate-300 leading-relaxed">{post.text}</p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.05] text-xs text-muted">
                        <span>❤ {post.reactions.toLocaleString()}</span>
                        <span className="ml-auto">{post.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Scouting History */}
            <SectionCard title="Scouting History" icon={<Briefcase size={15} />}>
              <div className="space-y-4">
                {scout.scoutingHistory.map((spell, i) => (
                  <SpellCard key={i} spell={spell} idx={i} state={spellState} />
                ))}
              </div>
            </SectionCard>

            {/* Discovered Athletes */}
            <SectionCard title="Discovered Athletes" icon={<Star size={15} />}>
              <p className="text-xs text-muted mb-4">{scout.discoveredAthletes.length} athletes profiled and signed from the field</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scout.discoveredAthletes.map(a => (
                  <AthleteDiscoveryCard key={a.id} athlete={a} />
                ))}
              </div>
            </SectionCard>
              </>
            )}

            {activeTab === 'attributes' && (
              <>
            {/* Scout Attributes */}
            <SectionCard title="Scout Attributes" icon={<Zap size={15} />}>
              <div className="space-y-4">
                {scout.attributes.map((attr, i) => {
                  const isEndorsed = endorsedAttrs.has(attr.label);
                  const color = ATTR_COLORS[attr.label] ?? C.blue;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{attr.label}</span>
                          <span className="font-display font-bold text-sm tabular" style={{ color }}>{attr.value}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{attr.endorsements + (isEndorsed ? 1 : 0)}</span>
                          <button onClick={() => setEndorsedAttrs(s => { const n = new Set(s); n.has(attr.label) ? n.delete(attr.label) : n.add(attr.label); return n; })}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${isEndorsed ? 'border-azure/40 bg-azure/15 text-azure' : 'border-white/15 bg-white/[0.04] text-muted hover:border-azure/30 hover:text-azure'}`}>
                            <Plus size={9} /> {isEndorsed ? 'Endorsed' : 'Endorse'}
                          </button>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${attr.value}%`, background: color, transition: 'width 1s ease' }} />
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-muted">Top endorser: {attr.topEndorser}</span>
                        {attr.topEndorserVerified && <ShieldCheck size={9} className="text-emerald" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Honors */}
            <SectionCard title="Honors &amp; Recognition" icon={<Trophy size={15} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scout.honors.map((h, i) => {
                  const cfg = h.type === 'award'
                    ? { color: C.lime,   bg: 'bg-volt/10 border-volt/20',   Icon: Star      }
                    : h.type === 'recognition'
                    ? { color: C.blue,   bg: 'bg-azure/10 border-azure/20', Icon: BadgeCheck }
                    : { color: C.green,  bg: 'bg-emerald/10 border-emerald/20', Icon: CheckCircle2 };
                  return (
                    <div key={i} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${cfg.bg}`}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}18` }}>
                        <cfg.Icon size={14} style={{ color: cfg.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{h.title}</p>
                        <p className="text-xs text-muted truncate">{h.org} · {h.year}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
              </>
            )}

            {activeTab === 'network' && (
              <>
            {/* Recommendations */}
            <SectionCard title="Recommendations" icon={<Quote size={15} />}>
              <div className="space-y-4">
                {scout.recommendations.map(rec => (
                  <div key={rec.id} className="border border-white/[0.06] rounded-2xl p-4 bg-white/[0.02]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-azure/15 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-azure">{rec.authorName.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white">{rec.authorName}</span>
                          {rec.authorVerified && <ShieldCheck size={11} className="text-emerald" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold text-azure border border-azure/20 bg-azure/10 px-1.5 py-0.5 rounded-full">{rec.relationship}</span>
                          <span className="text-[11px] text-muted">{rec.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{rec.body}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Languages */}
            <SectionCard title="Languages" icon={<Languages size={15} />}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {scout.languages.map(lang => (
                  <div key={lang.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{lang.name}</p>
                      <p className="text-xs text-muted">{lang.level}</p>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-azure"
                        style={{ width: lang.level === 'Native' ? '100%' : lang.level === 'Fluent' ? '85%' : lang.level === 'Professional' ? '75%' : lang.level === 'Conversational' ? '55%' : '35%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
              </>
            )}
          </div>
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24 space-y-4">
            {/* Similar scouts */}
            <div className="card-glass p-4">
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Similar Scouts</p>
              <div className="space-y-4">
                {SIMILAR_SCOUTS.map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={s.image} alt={s.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                      {s.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald border-2 border-[#0C1A2B] flex items-center justify-center">
                          <ShieldCheck size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/scouts/${s.id}`} className="text-sm font-semibold text-white hover:text-azure transition-colors block truncate">{s.name}</Link>
                      <p className="text-xs text-muted truncate">{s.role} · {s.org}</p>
                    </div>
                    <span className="font-display font-bold text-volt text-sm tabular flex-shrink-0">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform CTA */}
            <div className="card-glass p-4" style={{ background: `linear-gradient(135deg,${C.lime}0E,rgba(22,39,59,0.8))` }}>
              <Zap size={18} className="text-volt mb-2" style={{ filter: `drop-shadow(0 0 8px ${C.lime}80)` }} />
              <p className="text-sm font-bold text-white mb-1">Connect with Scouts</p>
              <p className="text-xs text-muted mb-3">Join AceAiX to connect with verified scouts looking for your talent profile.</p>
              <Link to="/auth/register" className="btn-volt w-full py-2 text-xs font-bold rounded-xl inline-flex items-center justify-center">
                Create Profile
              </Link>
            </div>

            {/* Org card */}
            <div className="card-glass p-4">
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Organization</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background: `${scout.organizationColor}18`, border: `1px solid ${scout.organizationColor}30`, color: scout.organizationColor }}>
                  {scout.organizationInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{scout.organization}</p>
                  <p className="text-xs text-muted">{scout.region}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                {[
                  { label: 'Athletes Signed', value: String(scout.totalAthletesSigned), color: C.lime  },
                  { label: 'Clubs Worked',    value: String(scout.totalClubsWorked),    color: C.blue  },
                  { label: 'Transfer Value',  value: scout.totalTransferValue,           color: C.green },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted">{s.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky */}
      {!isSelf && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 glass-dark border-t border-white/[0.08] px-4 py-3 flex gap-2.5">
          {!isBlocked && (
            <button onClick={toggleFollow} disabled={followLoading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${isFollowing ? 'bg-white/[0.06] border border-white/10 text-white' : 'btn-outline'}`}>
              {isFollowing ? <><UserCheck size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}
            </button>
          )}
          {!isBlocked && (
            <button onClick={() => user ? setMsgOpen(true) : navigate('/auth/login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${msgSent ? 'bg-emerald/10 border border-emerald/20 text-emerald' : 'btn-primary'}`}>
              <MessageSquare size={13} /> Message
            </button>
          )}
        </div>
      )}

      {blockConfirmOpen && <BlockModal name={scout.name} isBlocked={isBlocked} onConfirm={toggleBlock} onCancel={() => setBlockConfirmOpen(false)} loading={blockLoading} />}
      {msgOpen && <MessageModal name={scout.name} onClose={() => setMsgOpen(false)} onSend={handleSendMessage} sending={msgSending} isAuth={!!user} />}
    </div>
  );
}
