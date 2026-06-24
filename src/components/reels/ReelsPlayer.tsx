import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX,
  ShieldCheck, Play, Plus, X, ChevronDown,
  Send,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
export interface ReelItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  authorId: string;
  authorName: string;
  authorImg: string;
  authorVerified?: boolean;
  caption: string;
  aiTags: string[];
  soundLabel?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

/* ─── Volt particle burst (double-tap like) ──────────────────── */
interface Particle { id: number; x: number; y: number; angle: number }

function VoltBurst({ x, y, active }: { x: number; y: number; active: boolean }) {
  if (!active) return null;
  const particles: Particle[] = Array.from({ length: 14 }, (_, i) => ({
    id: i, x, y, angle: (i / 14) * 360,
  }));
  return (
    <>
      {particles.map(p => {
        const dist = 55 + Math.random() * 30;
        const dx = Math.cos((p.angle * Math.PI) / 180) * dist;
        const dy = Math.sin((p.angle * Math.PI) / 180) * dist;
        return (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-30"
            style={{
              left: p.x, top: p.y,
              width: p.id % 3 === 0 ? 10 : 7,
              height: p.id % 3 === 0 ? 10 : 7,
              background: p.id % 2 === 0 ? '#B8F135' : '#2F80ED',
              boxShadow: `0 0 8px ${p.id % 2 === 0 ? '#B8F135' : '#2F80ED'}`,
              animation: 'particleBurst 0.65s ease-out forwards',
              ['--dx' as string]: `${dx}px`,
              ['--dy' as string]: `${dy}px`,
            }}
          />
        );
      })}
      <div
        className="absolute pointer-events-none z-30"
        style={{
          left: x - 36, top: y - 36, fontSize: 72,
          filter: 'drop-shadow(0 0 16px #B8F135)',
          animation: 'heartPop 0.7s ease-out forwards',
        }}
      >⚡</div>
    </>
  );
}

/* ─── Magnetic action button ────────────────────────────────── */
function MagBtn({
  children,
  onClick,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.22;
    const dy = (e.clientY - cy) * 0.22;
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
  }

  function handleMouseLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col items-center gap-1 outline-none ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', ...style }}
    >
      {children}
    </button>
  );
}

/* ─── Count-up animation ────────────────────────────────────── */
function AnimatedCount({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => {
    const diff = value - displayed;
    if (diff === 0) return;
    const step = diff > 0 ? 1 : -1;
    const t = setTimeout(() => setDisplayed(d => d + step), 40);
    return () => clearTimeout(t);
  }, [value, displayed]);
  return <span>{formatCount(displayed)}</span>;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ─── Shimmer skeleton ──────────────────────────────────────── */
function ReelSkeleton() {
  return (
    <div className="absolute inset-0 shimmer" style={{ background: '#0A1726' }}>
      <div className="w-full h-full" style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.03)0%,rgba(255,255,255,0.09)50%,rgba(255,255,255,0.03)100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s linear infinite' }} />
    </div>
  );
}

/* ─── Comments drawer ───────────────────────────────────────── */
function CommentsDrawer({ reel, onClose }: { reel: ReelItem; onClose: () => void }) {
  const MOCK_COMMENTS = [
    { id: '1', author: 'Khalid', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100', text: 'Incredible skill! 🔥', time: '2m' },
    { id: '2', author: 'Noura',  img: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=100', text: 'That finish was clean ⚡', time: '5m' },
    { id: '3', author: 'Tariq',  img: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=100', text: 'Top talent right here', time: '12m' },
  ];

  const [text, setText] = useState('');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="absolute bottom-0 inset-x-0 rounded-t-2xl overflow-hidden z-40"
      style={{
        background: 'rgba(10,23,38,0.97)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        height: '65%',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-sm font-semibold text-white">{reel.commentCount} Comments</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/50">
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: 'calc(65vh - 110px)' }}>
        {MOCK_COMMENTS.map(c => (
          <div key={c.id} className="flex gap-2.5">
            <img src={c.img} alt={c.author} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-white mb-0.5">{c.author} <span className="font-normal text-white/40">{c.time}</span></p>
              <p className="text-sm text-white/80">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-3 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <button disabled={!text.trim()} className="w-10 h-10 rounded-2xl flex items-center justify-center btn-primary text-xs flex-shrink-0 disabled:opacity-40">
          <Send size={15} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Single reel card ──────────────────────────────────────── */
function ReelCard({
  reel,
  active,
  onFollow,
}: {
  reel: ReelItem;
  active: boolean;
  onFollow: (id: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [liked, setLiked] = useState(reel.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(reel.likeCount);
  const [saved, setSaved] = useState(reel.isSaved ?? false);
  const [showComments, setShowComments] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const lastTap = useRef(0);

  /* ── Autoplay / pause on active ────────────────────────── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active) {
      vid.currentTime = 0;
      vid.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setPlaying(false);
    }
  }, [active]);

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setPlaying(true); }
    else { vid.pause(); setPlaying(false); }
  }

  function doubleTapLike(e: React.TouchEvent | React.MouseEvent) {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = 'touches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
      const cy = 'touches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
      setBurst({ x: cx - rect.left, y: cy - rect.top, id: Date.now() });
      setTimeout(() => setBurst(null), 700);
      if (!liked) {
        setLiked(true);
        setLikeCount(c => c + 1);
      }
    }
    lastTap.current = now;
  }

  function toggleLike() {
    setLiked(l => !l);
    setLikeCount(c => (liked ? c - 1 : c + 1));
  }

  /* ── Progress scrubber ──────────────────────────────────── */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    function update() {
      if (vid && vid.duration) setProgress(vid.currentTime / vid.duration);
    }
    vid.addEventListener('timeupdate', update);
    return () => vid.removeEventListener('timeupdate', update);
  }, []);

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    vid.currentTime = pct * vid.duration;
  }

  return (
    <div
      className="relative snap-item overflow-hidden bg-[#080F1C]"
      style={{ width: '100%', height: '100dvh', maxHeight: '100dvh' }}
      onClick={doubleTapLike}
      onTouchEnd={doubleTapLike}
    >
      {/* Skeleton */}
      {!loaded && <ReelSkeleton />}

      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        className="absolute inset-0 w-full h-full object-cover"
        muted={muted}
        playsInline
        loop
        onCanPlay={() => setLoaded(true)}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.2)0%,transparent 30%,transparent 55%,rgba(0,0,0,0.75)100%)' }} />

      {/* Volt burst */}
      {burst && <VoltBurst x={burst.x} y={burst.y} active key={burst.id} />}

      {/* Pause icon */}
      <AnimatePresence>
        {!playing && loaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(22,39,59,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Play size={24} className="text-white" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right action rail ───────────────────────────── */}
      <div
        className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Author avatar + follow */}
        <div className="relative mb-2">
          <img
            src={reel.authorImg}
            alt={reel.authorName}
            className="w-11 h-11 rounded-full object-cover"
            style={{ border: '2px solid rgba(255,255,255,0.3)' }}
          />
          <button
            onClick={() => onFollow(reel.authorId)}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: '#2F80ED', border: '2px solid #080F1C' }}
          >
            <Plus size={10} className="text-white" />
          </button>
        </div>

        {/* Like */}
        <MagBtn
          onClick={toggleLike}
          className="items-center"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: liked ? 'rgba(184,241,53,0.15)' : 'rgba(255,255,255,0.08)',
              border: liked ? '1px solid rgba(184,241,53,0.35)' : '1px solid rgba(255,255,255,0.12)',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <Heart
              size={20}
              fill={liked ? '#B8F135' : 'none'}
              style={{ color: liked ? '#B8F135' : '#fff', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: liked ? '#B8F135' : 'rgba(255,255,255,0.75)' }}>
            <AnimatedCount value={likeCount} />
          </span>
        </MagBtn>

        {/* Comment */}
        <MagBtn onClick={() => setShowComments(true)}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <MessageCircle size={20} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-white/75"><AnimatedCount value={reel.commentCount} /></span>
        </MagBtn>

        {/* Share */}
        <MagBtn>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-white/75"><AnimatedCount value={reel.shareCount} /></span>
        </MagBtn>

        {/* Save */}
        <MagBtn onClick={() => setSaved(s => !s)}>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: saved ? 'rgba(47,128,237,0.15)' : 'rgba(255,255,255,0.08)',
              border: saved ? '1px solid rgba(47,128,237,0.35)' : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Bookmark size={20} fill={saved ? '#2F80ED' : 'none'} style={{ color: saved ? '#2F80ED' : '#fff' }} />
          </div>
          <span className="text-xs font-semibold text-white/75">Save</span>
        </MagBtn>

        {/* Mute toggle */}
        <MagBtn onClick={() => { setMuted(m => !m); (videoRef.current as any)?.play?.(); }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {muted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
          </div>
        </MagBtn>
      </div>

      {/* ── Bottom info ──────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-[72px] z-20 px-4 pb-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white text-sm">{reel.authorName}</span>
          {reel.authorVerified && <ShieldCheck size={13} className="text-emerald flex-shrink-0" />}
        </div>

        {/* Caption */}
        <p className="text-sm text-white/85 leading-relaxed mb-2.5 line-clamp-2">{reel.caption}</p>

        {/* AI tags */}
        {reel.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {reel.aiTags.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: 'rgba(184,241,53,0.12)',
                  border: '1px solid rgba(184,241,53,0.30)',
                  color: '#B8F135',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Sound */}
        {reel.soundLabel && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border border-white/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
            <span className="text-xs text-white/55 truncate max-w-[180px]">{reel.soundLabel}</span>
          </div>
        )}
      </div>

      {/* ── Progress scrubber ────────────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 h-1 cursor-pointer"
        onClick={e => { e.stopPropagation(); seek(e); }}
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: '#B8F135',
            boxShadow: progress > 0 && progress < 1 ? '0 0 6px rgba(184,241,53,0.6)' : 'none',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Tap to play/pause (center area, avoid overlap) */}
      <button
        className="absolute inset-0 z-10"
        style={{ background: 'transparent' }}
        onClick={e => { e.stopPropagation(); togglePlay(); }}
        aria-label="Play/Pause"
      />

      {/* Comments drawer */}
      <AnimatePresence>
        {showComments && (
          <CommentsDrawer reel={reel} onClose={() => setShowComments(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Reels Player ──────────────────────────────────────────── */
interface ReelsPlayerProps {
  reels: ReelItem[];
  initialIndex?: number;
  onClose?: () => void;
  showClose?: boolean;
}

export default function ReelsPlayer({ reels, initialIndex = 0, onClose, showClose = false }: ReelsPlayerProps) {
  const [activeIdx, setActiveIdx] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== activeIdx) setActiveIdx(idx);
  }

  function follow(authorId: string) {
    setFollowed(s => {
      const n = new Set(s);
      n.has(authorId) ? n.delete(authorId) : n.add(authorId);
      return n;
    });
  }

  return (
    <div className="relative w-full h-full bg-[#080F1C]">
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(12,26,43,0.85)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <X size={18} className="text-white/70" />
        </button>
      )}

      <div
        ref={containerRef}
        className="snap-container w-full h-full overflow-y-scroll scrollbar-hidden"
        onScroll={handleScroll}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {reels.map((reel, i) => (
          <ReelCard
            key={reel.id}
            reel={{ ...reel, authorName: followed.has(reel.authorId) ? reel.authorName : reel.authorName }}
            active={i === activeIdx}
            onFollow={follow}
          />
        ))}
      </div>
    </div>
  );
}
