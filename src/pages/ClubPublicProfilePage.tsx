import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users, MapPin, Calendar, Building2, ChevronLeft, Share2,
  MoreHorizontal, UserPlus, UserCheck, MessageSquare, X,
  Send, Loader2, ShieldCheck, Trophy, Zap, Target, Clock,
  BadgeCheck, CheckCircle2, Heart, Globe, ChevronDown,
  ChevronUp, ExternalLink, Shirt, Star, Ban,
} from 'lucide-react';

import PublicHeader from '../components/PublicHeader';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import StatusChip from '../components/ui/StatusChip';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CLUB_PROFILES, SIMILAR_CLUBS } from '../data/clubProfile';

/* ─── Helpers ─── */
function useCountUp(target: number) {
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
        const p = Math.min((Date.now() - start) / 1200, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return { val, ref };
}

const POSITION_COLORS: Record<string, string> = {
  GK: '#F5A623', CB: '#2F80ED', LB: '#2F80ED', RB: '#2F80ED',
  CDM: '#1FB57A', CM: '#1FB57A', CAM: '#B8F135', LW: '#B8F135',
  RW: '#B8F135', ST: '#EF5350', CF: '#EF5350',
};

const TABS = ['Overview', 'Squad', 'Open Trials', 'Honours', 'Statistics', 'Media'] as const;
type Tab = typeof TABS[number];

const TROPHY_ICONS: Record<string, string> = {
  league: '🏆', cup: '🥇', supercup: '🌟', continental: '⚡', other: '🎖',
};

/* ─── Message Modal ─── */
function ContactModal({ name, onClose, isAuth }: { name: string; onClose: () => void; isAuth: boolean }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
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
          <div><h3 className="font-display font-bold text-white">Contact {name}</h3><p className="text-xs text-muted mt-0.5">General enquiry or partnership</p></div>
          <button onClick={onClose} className="text-muted hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X size={16} /></button>
        </div>
        {!isAuth ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-300 mb-4">Sign in to contact {name}.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/auth/login" onClick={onClose} className="btn-primary px-5 py-2.5 text-sm">Sign In</Link>
              <Link to="/auth/register" onClick={onClose} className="btn-outline px-5 py-2.5 text-sm">Register</Link>
            </div>
          </div>
        ) : sent ? (
          <div className="text-center py-6">
            <CheckCircle2 size={36} className="text-emerald mx-auto mb-3" />
            <p className="font-semibold text-white">Message sent!</p>
            <p className="text-xs text-muted mt-1">The club's representative will get back to you.</p>
          </div>
        ) : (
          <>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Your message…" rows={4} className="input-dark resize-none mb-4 text-sm" autoFocus />
            <button onClick={() => setSent(true)} disabled={!text.trim()}
              className="btn-primary w-full py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={14} /> Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ClubPublicProfilePage({ hideHeader = false }: { hideHeader?: boolean }) {
  const { id = 'alwasl' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const club = CLUB_PROFILES[id] ?? CLUB_PROFILES['alwasl'];

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(club.followersCount);
  const [followLoading, setFollowLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [expandedTrial, setExpandedTrial] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const { val: followerDisplay, ref: followerRef } = useCountUp(followerCount);
  const { val: playerDisplay, ref: playerRef } = useCountUp(club.playerCount);

  // Parallax
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const h = () => { el.style.transform = `translateY(${window.scrollY * 0.12}px)`; };
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

  // Load follow state
  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle();
      setIsFollowing(!!data);
    }
    load();
  }, [id, user]);

  async function toggleFollow() {
    if (!user) { navigate('/auth/login'); return; }
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
      setIsFollowing(false); setFollowerCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: id });
      setIsFollowing(true); setFollowerCount(c => c + 1);
    }
    setFollowLoading(false);
  }

  const descParagraphs = club.description.split('\n\n');
  const positions = ['All', ...Array.from(new Set(club.squad.map(p => p.position)))];
  const filteredSquad = positionFilter === 'All' ? club.squad : club.squad.filter(p => p.position === positionFilter);

  return (
    <div className="min-h-screen" style={{ background: '#080F1A' }}>
      {!hideHeader && <PublicHeader />}
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes liveFlash { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes pulseOrb  { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
      `}</style>

      {/* Sticky mini-bar */}
      {showStickyBar && (
        <div className="fixed top-14 left-0 right-0 z-40 glass-dark border-b border-white/[0.08] px-4 lg:px-8"
          style={{ animation: 'slideUp 0.25s cubic-bezier(0.19,1,0.22,1)' }}>
          <div className="max-w-6xl mx-auto flex items-center gap-4 py-2.5">
            <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: `${club.primaryColor}18`, borderColor: `${club.primaryColor}30`, color: club.primaryColor }}>
              {club.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white text-sm truncate">{club.name}</p>
              <p className="text-xs text-muted truncate hidden sm:block">{club.league} · {club.city}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={toggleFollow} disabled={followLoading}
                className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-all inline-flex items-center gap-1.5 ${isFollowing ? 'bg-white/[0.06] border border-white/10 text-white' : 'btn-outline'}`}>
                {followLoading ? <Loader2 size={11} className="animate-spin" /> : isFollowing ? <><UserCheck size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
              </button>
              <button onClick={() => setContactOpen(true)} className="btn-primary px-4 py-1.5 text-xs rounded-lg font-semibold inline-flex items-center gap-1.5">
                <MessageSquare size={11} /> Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover banner */}
      <div ref={introRef} className="relative overflow-hidden" style={{ height: '42vh', minHeight: 290 }}>
        <div ref={bannerRef} className="absolute inset-0">
          <img src={club.coverImage} alt="" className="w-full h-[120%] object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,15,26,0.2) 0%, rgba(8,15,26,0.85) 100%)' }} />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 100%, ${club.primaryColor}18, transparent 60%)` }} />
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-20 left-4 lg:left-8 z-10 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      {/* Club intro card */}
      <div style={{ background: '#0A1421', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="relative pb-5">
            {/* Club logo */}
            <div className="absolute -top-12 left-0 z-10" style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center font-display font-bold text-2xl"
                style={{ background: `linear-gradient(135deg, ${club.primaryColor}25, ${club.primaryColor}08)`, border: `2px solid ${club.primaryColor}50`, boxShadow: `0 8px 32px ${club.primaryColor}30, 0 0 0 4px #0A1421`, color: club.primaryColor }}>
                {club.initials}
              </div>
              {club.isVerified && (
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#1FB57A', border: '2px solid #0A1421', boxShadow: '0 0 10px rgba(31,181,122,0.5)' }}>
                  <ShieldCheck size={13} className="text-white" />
                </div>
              )}
            </div>

            <div className="pl-28 pt-4" style={{ animation: 'fadeIn 0.55s ease 0.15s both' }}>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-white text-2xl lg:text-3xl">{club.name}</h1>
                {club.isVerified && <VerifiedBadge animate size="sm" />}
              </div>
              <p className="text-sm text-muted mt-1">{club.league}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted"><MapPin size={11} /> {club.city}, {club.country}</span>
                <span className="flex items-center gap-1 text-xs text-muted"><Calendar size={11} /> Founded {club.founded}</span>
                <span className="flex items-center gap-1 text-xs text-muted"><Building2 size={11} /> {club.stadium} ({club.stadiumCapacity.toLocaleString()})</span>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-azure">
                  <Users size={12} />
                  <span ref={followerRef as any} className="tabular">{followerDisplay.toLocaleString()}</span>
                  <span className="text-muted font-normal">followers</span>
                </span>
                <span className="text-white/10">·</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <span ref={playerRef as any} className="font-semibold text-white tabular">{playerDisplay}</span> squad members
                </span>
                <span className="text-white/10 hidden sm:inline">·</span>
                <span className="text-xs text-muted hidden sm:inline">{club.staffCount} staff</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 mt-4 pl-28 items-center" style={{ animation: 'fadeIn 0.5s ease 0.3s both' }}>
              <button onClick={toggleFollow} disabled={followLoading}
                className={`px-5 py-2 inline-flex items-center gap-2 text-sm rounded-xl font-semibold transition-all ${isFollowing ? 'bg-white/[0.06] border border-white/10 text-white hover:border-coral/40 hover:text-coral' : 'btn-outline'}`}>
                {followLoading ? <Loader2 size={14} className="animate-spin" /> : isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
              </button>
              <button onClick={() => setContactOpen(true)}
                className="btn-primary px-5 py-2 inline-flex items-center gap-2 text-sm rounded-xl font-semibold">
                <MessageSquare size={14} /> Contact
              </button>
              <button onClick={() => setShortlisted(s => !s)}
                className={`px-5 py-2 inline-flex items-center gap-2 text-sm rounded-xl font-semibold transition-all ${shortlisted ? 'bg-volt/10 border border-volt/25 text-volt' : 'btn-ghost'}`}>
                <Star size={14} className={shortlisted ? 'fill-volt text-volt' : ''} /> {shortlisted ? 'Shortlisted' : 'Shortlist'}
              </button>
              <button className="btn-ghost px-4 py-2 inline-flex items-center gap-2 text-sm">
                <Share2 size={14} /> Share
              </button>
              <div ref={moreMenuRef} className="relative ml-auto">
                <button onClick={() => setMoreMenuOpen(o => !o)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${moreMenuOpen ? 'bg-white/10 text-white' : 'btn-ghost text-muted hover:text-white'}`}>
                  <MoreHorizontal size={16} />
                </button>
                {moreMenuOpen && (
                  <div className="absolute right-0 top-11 w-44 card-glass border border-white/10 rounded-2xl overflow-hidden z-20"
                    style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.7)', animation: 'fadeIn 0.15s ease' }}>
                    <a href={`https://${club.website}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors">
                      <Globe size={13} className="text-muted" /> Visit Website
                    </a>
                    <Link to="/auth/register"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition-colors border-t border-white/[0.06]">
                      <ExternalLink size={13} className="text-muted" /> Apply for Trial
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-0 border-t border-white/[0.06] overflow-x-auto scrollbar-hidden">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                  activeTab === tab
                    ? 'border-azure text-white'
                    : 'border-transparent text-muted hover:text-white hover:border-white/20'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 pb-20 lg:pb-10" style={{ background: '#080F1A' }}>
        <div className="flex gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ─ OVERVIEW ─ */}
            {activeTab === 'Overview' && (
              <>
                {/* About */}
                <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="font-display font-bold text-white text-base mb-3">About {club.shortName}</h2>
                  {descParagraphs.slice(0, aboutExpanded ? undefined : 1).map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(244,248,252,0.7)' }}>{p}</p>
                  ))}
                  {descParagraphs.length > 1 && (
                    <button onClick={() => setAboutExpanded(e => !e)}
                      className="text-xs font-semibold transition-colors mt-1" style={{ color: club.primaryColor }}>
                      {aboutExpanded ? 'Show less' : '…show more'}
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {club.values.map(v => (
                      <span key={v} className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: `${club.primaryColor}10`, border: `1px solid ${club.primaryColor}25`, color: club.primaryColor }}>
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 text-xs flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                    <span className="flex items-center gap-1.5"><Globe size={11} /> {club.website}</span>
                    <span className="flex items-center gap-1.5"><Building2 size={11} /> {club.stadium}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={11} /> Est. {club.founded}</span>
                  </div>
                </div>

                {/* Activity */}
                <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="font-display font-bold text-white text-base mb-4">Latest Updates</h2>
                  <div className="space-y-4">
                    {club.activity.map(post => (
                      <div key={post.id} className="rounded-xl overflow-hidden transition-all hover:border-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                        {post.image && (
                          <div className="relative overflow-hidden" style={{ height: 160 }}>
                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(13,31,51,0.7),transparent)' }} />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black"
                              style={{ background: `${club.primaryColor}18`, color: club.primaryColor, border: `1px solid ${club.primaryColor}30` }}>
                              {club.initials}
                            </div>
                            <span className="text-xs font-bold text-white">{club.shortName}</span>
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>· {post.time}</span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,248,252,0.75)' }}>{post.text}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            <span className="flex items-center gap-1"><Heart size={11} /> {post.reactions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coaching Staff */}
                <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="font-display font-bold text-white text-base mb-4">Coaching Staff</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {club.coachingStaff.map(staff => (
                      <div key={staff.name} className="text-center group">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden mx-auto mb-2 transition-all group-hover:scale-105"
                          style={{ border: `1.5px solid ${club.primaryColor}25`, boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}>
                          <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                          {staff.isVerified && (
                            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: '#1FB57A', border: '1.5px solid #0A1421', boxShadow: '0 0 6px rgba(31,181,122,0.6)' }}>
                              <ShieldCheck size={9} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white truncate">{staff.name}</p>
                        <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{staff.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ─ SQUAD ─ */}
            {activeTab === 'Squad' && (
              <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-white text-base">Current Squad</h2>
                  <div className="flex gap-1 flex-wrap">
                    {positions.map(pos => (
                      <button key={pos} onClick={() => setPositionFilter(pos)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                        style={{
                          background: positionFilter === pos ? `${club.primaryColor}20` : 'rgba(255,255,255,0.04)',
                          color: positionFilter === pos ? club.primaryColor : 'rgba(255,255,255,0.4)',
                          border: `1px solid ${positionFilter === pos ? `${club.primaryColor}35` : 'rgba(255,255,255,0.08)'}`,
                        }}>
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSquad.map(player => (
                    <Link key={player.id} to={`/athletes/${player.id}`}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all group"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = `${POSITION_COLORS[player.position] ?? '#2F80ED'}30`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                      <div className="relative flex-shrink-0">
                        <img src={player.image} alt={player.name} className="w-10 h-10 rounded-xl object-cover"
                          style={{ border: `1.5px solid ${POSITION_COLORS[player.position] ?? '#2F80ED'}25` }} />
                        {player.isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: '#1FB57A', border: '1.5px solid #0D1F33', boxShadow: '0 0 6px rgba(31,181,122,0.5)' }}>
                            <ShieldCheck size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black flex-shrink-0"
                        style={{ background: `${POSITION_COLORS[player.position] ?? '#2F80ED'}18`, color: POSITION_COLORS[player.position] ?? '#2F80ED', border: `1px solid ${POSITION_COLORS[player.position] ?? '#2F80ED'}30` }}>
                        {player.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{player.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{player.position} · {player.nationality} · Age {player.age}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="font-display font-black text-sm tabular" style={{ color: '#B8F135' }}>{player.score}</span>
                        <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>AI</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {filteredSquad.length === 0 && (
                  <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>No players found for this position.</p>
                )}
              </div>
            )}

            {/* ─ OPEN TRIALS ─ */}
            {activeTab === 'Open Trials' && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#1FB57A', boxShadow: '0 0 6px rgba(31,181,122,0.7)', animation: 'liveFlash 1.5s infinite' }} />
                    <h2 className="font-display font-bold text-white text-base">Open Trials & Transfer Targets</h2>
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{club.openTrials.length} position{club.openTrials.length !== 1 ? 's' : ''} available · Applications open</p>
                  <div className="space-y-3">
                    {club.openTrials.map(trial => {
                      const isOpen = expandedTrial === trial.id;
                      const typeColors = {
                        trial:    { bg: 'rgba(184,241,53,0.1)',  border: 'rgba(184,241,53,0.25)',  color: '#B8F135' },
                        transfer: { bg: 'rgba(47,128,237,0.1)',  border: 'rgba(47,128,237,0.25)',  color: '#2F80ED' },
                        loan:     { bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.25)', color: '#F5A623' },
                      };
                      const tc = typeColors[trial.type];
                      return (
                        <div key={trial.id} className="rounded-2xl overflow-hidden transition-all"
                          style={{ border: `1px solid ${isOpen ? `${club.primaryColor}30` : 'rgba(255,255,255,0.08)'}`, background: isOpen ? `${club.primaryColor}05` : 'rgba(255,255,255,0.02)' }}>
                          <div className="p-4 cursor-pointer transition-colors"
                            onClick={() => setExpandedTrial(isOpen ? null : trial.id)}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-bold text-white">{trial.position}</p>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
                                    style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                                    {trial.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                  <span className="flex items-center gap-1"><Target size={10} /> Age {trial.ageRange}</span>
                                  <span className="flex items-center gap-1"><Clock size={10} /> {trial.deadline}</span>
                                  <span className="flex items-center gap-1"><Users size={10} /> {trial.applicants} applied</span>
                                </div>
                              </div>
                              {isOpen
                                ? <ChevronUp size={16} className="flex-shrink-0 mt-1" style={{ color: 'rgba(255,255,255,0.4)' }} />
                                : <ChevronDown size={16} className="flex-shrink-0 mt-1" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                            </div>
                          </div>
                          {isOpen && (
                            <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <p className="text-sm leading-relaxed mt-3 mb-4" style={{ color: 'rgba(244,248,252,0.65)' }}>{trial.description}</p>
                              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Requirements</p>
                              <ul className="space-y-1.5 mb-4">
                                {trial.requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(244,248,252,0.65)' }}>
                                    <CheckCircle2 size={12} style={{ color: '#1FB57A', flexShrink: 0, marginTop: 2 }} /> {req}
                                  </li>
                                ))}
                              </ul>
                              <Link to="/auth/register"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl transition-all hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg,#B8F135,#8fd600)', color: '#0C1A2B', boxShadow: '0 4px 16px rgba(184,241,53,0.3)' }}>
                                <Zap size={13} /> Apply Now
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─ HONOURS ─ */}
            {activeTab === 'Honours' && (
              <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="font-display font-bold text-white text-base mb-4">Trophy Cabinet</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {club.trophies.map((trophy, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:scale-[1.01]"
                      style={{ background: 'rgba(184,241,53,0.05)', border: '1px solid rgba(184,241,53,0.15)' }}>
                      <span className="text-2xl">{TROPHY_ICONS[trophy.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{trophy.title}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{trophy.year}{trophy.count ? ` · ${trophy.count}× won` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─ STATISTICS ─ */}
            {activeTab === 'Statistics' && (
              <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="font-display font-bold text-white text-base mb-0.5">Current Season</h2>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>{club.league} · 2024–25</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {club.currentSeason.map((stat, i) => {
                    const colors = ['#2F80ED','#B8F135','#1FB57A','#F5A623','#EF5350'];
                    const c = colors[i % colors.length];
                    return (
                      <div key={stat.label} className="text-center rounded-xl p-3"
                        style={{ background: `${c}08`, border: `1px solid ${c}15` }}>
                        <div className="text-2xl font-black text-white tabular">{stat.value}</div>
                        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                        {stat.rank && <div className="text-[10px] mt-0.5 font-semibold" style={{ color: c }}>{stat.rank}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─ MEDIA ─ */}
            {activeTab === 'Media' && (
              <div className="rounded-2xl p-5" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="font-display font-bold text-white text-base mb-4">Media Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400',
                  ].map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer group"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24 space-y-4">
            {/* Quick stats */}
            <div className="rounded-2xl p-4" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Club At a Glance</p>
              <div className="space-y-3">
                {[
                  { label: 'League Position', value: '1st · UAE Pro League', icon: Trophy },
                  { label: 'Squad Size',       value: `${club.playerCount} players`, icon: Shirt },
                  { label: 'Stadium',          value: club.stadium, icon: Building2 },
                  { label: 'Founded',          value: String(club.founded), icon: Calendar },
                  { label: 'Open Trials',      value: `${club.openTrials.length} positions`, icon: Target },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${club.primaryColor}12`, boxShadow: `0 0 8px ${club.primaryColor}15` }}>
                      <item.icon size={13} style={{ color: club.primaryColor }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</p>
                      <p className="text-xs font-bold text-white truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar clubs */}
            <div className="rounded-2xl p-4" style={{ background: '#0D1F33', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Similar Clubs</p>
              <div className="space-y-3">
                {SIMILAR_CLUBS.map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: `${c.color}15`, border: `1px solid ${c.color}25`, color: c.color }}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/clubs/${c.id}`} className="text-sm font-bold text-white hover:text-azure transition-colors block truncate">{c.name}</Link>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.league} · {c.city}</p>
                    </div>
                    {c.isVerified && <ShieldCheck size={12} style={{ color: '#1FB57A', filter: 'drop-shadow(0 0 4px rgba(31,181,122,0.5))' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${club.primaryColor}12, rgba(13,31,51,0.95))`, border: `1px solid ${club.primaryColor}20` }}>
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle,${club.primaryColor}15,transparent 70%)` }} />
              <Zap size={18} className="mb-2" style={{ color: '#B8F135' }} />
              <p className="text-sm font-black text-white mb-1">Request Player Report</p>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>Get full AI-verified profiles of players matching your squad needs.</p>
              <Link to="/auth/register"
                className="w-full py-2 text-xs font-black rounded-xl inline-flex items-center justify-center transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#B8F135,#8fd600)', color: '#0C1A2B', boxShadow: '0 4px 12px rgba(184,241,53,0.3)' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 glass-dark border-t border-white/[0.08] px-4 py-3 flex gap-2.5">
        <button onClick={toggleFollow} disabled={followLoading}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${isFollowing ? 'bg-white/[0.06] border border-white/10 text-white' : 'btn-outline'}`}>
          {isFollowing ? <><UserCheck size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}
        </button>
        <button onClick={() => setContactOpen(true)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 btn-primary">
          <MessageSquare size={13} /> Contact
        </button>
      </div>

      {contactOpen && <ContactModal name={club.name} onClose={() => setContactOpen(false)} isAuth={!!user} />}
    </div>
  );
}
