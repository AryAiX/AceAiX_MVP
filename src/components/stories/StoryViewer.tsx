import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, ShieldCheck, Eye,
  Send, Smile, MoreHorizontal, Bookmark,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────── */
export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  durationMs: number;
  caption?: string;
  authorId: string;
  authorName: string;
  authorImg: string;
  authorVerified?: boolean;
  createdAt: string;
  viewCount?: number;
  viewers?: { id: string; name: string; img: string }[];
}

export interface StoryGroup {
  authorId: string;
  authorName: string;
  authorImg: string;
  authorVerified?: boolean;
  stories: StoryItem[];
  seenUpTo?: number; /* index of last seen story */
}

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex?: number;
  onClose: () => void;
  isOwnStory?: (authorId: string) => boolean;
}

/* ─── Segmented progress bar ────────────────────────────────── */
function ProgressBar({
  total,
  current,
  elapsed,
  duration,
  rtl,
}: {
  total: number;
  current: number;
  elapsed: number;
  duration: number;
  rtl: boolean;
}) {
  return (
    <div
      className="flex gap-1 w-full"
      style={{ direction: rtl ? 'rtl' : 'ltr' }}
    >
      {Array.from({ length: total }, (_, i) => {
        const filled = i < current ? 1 : i === current ? elapsed / duration : 0;
        return (
          <div
            key={i}
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 2, background: 'rgba(255,255,255,0.28)' }}
          >
            <div
              style={{
                width: `${Math.min(filled * 100, 100)}%`,
                height: '100%',
                background: '#B8F135',
                boxShadow: filled > 0 && filled < 1 ? '0 0 6px rgba(184,241,53,0.7)' : 'none',
                transition: 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Quick reaction emoji picker ──────────────────────────── */
const QUICK_REACTIONS = ['⚡', '🔥', '🎯', '💪', '👏', '😮'];

function QuickReactions({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute bottom-16 right-2 flex gap-1 px-2 py-1.5 rounded-2xl"
      style={{
        background: 'rgba(12,26,43,0.95)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {QUICK_REACTIONS.map(e => (
        <button
          key={e}
          onClick={() => onSelect(e)}
          className="text-xl w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
          style={{ transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)' }}
          onMouseEnter={el => (el.currentTarget.style.transform = 'scale(1.3)')}
          onMouseLeave={el => (el.currentTarget.style.transform = 'scale(1)')}
        >
          {e}
        </button>
      ))}
    </motion.div>
  );
}

/* ─── Seen by list ──────────────────────────────────────────── */
function SeenByPanel({ viewers, count }: { viewers: { id: string; name: string; img: string }[]; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 inset-x-0 rounded-t-2xl overflow-y-auto"
      style={{
        background: 'rgba(12,26,43,0.97)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        maxHeight: '60%',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Eye size={15} className="text-white/50" />
          <span className="text-sm font-semibold text-white">Seen by {count}</span>
        </div>
        <div className="w-8 h-1 rounded-full bg-white/20 mx-auto" />
      </div>
      <div className="p-3 space-y-1">
        {viewers.map(v => (
          <div key={v.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <img src={v.img} alt={v.name} className="w-9 h-9 rounded-full object-cover" />
            <span className="text-sm font-medium text-white/80">{v.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Main StoryViewer ──────────────────────────────────────── */
export default function StoryViewer({
  groups,
  initialGroupIndex = 0,
  onClose,
  isOwnStory,
}: StoryViewerProps) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showSeen, setShowSeen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const duration = story?.durationMs ?? 5000;

  const isOwn = isOwnStory?.(group?.authorId) ?? false;

  /* ── Tick ────────────────────────────────────────────────── */
  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(() => {
      setElapsed(e => {
        if (e >= duration) {
          advance();
          return 0;
        }
        return e + 100;
      });
    }, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [paused, storyIdx, groupIdx, duration]);

  function advance() {
    const g = groups[groupIdx];
    if (storyIdx < g.stories.length - 1) {
      setStoryIdx(s => s + 1);
      setElapsed(0);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(gi => gi + 1);
      setStoryIdx(0);
      setElapsed(0);
    } else {
      onClose();
    }
  }

  function retreat() {
    if (elapsed > 300) {
      setElapsed(0);
    } else if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
      setElapsed(0);
    } else if (groupIdx > 0) {
      setGroupIdx(gi => gi - 1);
      setStoryIdx(groups[groupIdx - 1].stories.length - 1);
      setElapsed(0);
    }
  }

  /* ── Touch gestures ──────────────────────────────────────── */
  function onTouchStart(e: React.TouchEvent) {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    setPaused(false);
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dy) > 80 && dy > 0) { onClose(); return; }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const x = e.changedTouches[0].clientX;
      if (x < window.innerWidth / 3) retreat();
      else advance();
    }
    setTouchStart(null);
  }

  /* ── Video autoplay ─────────────────────────────────────── */
  useEffect(() => {
    if (story?.mediaType === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!paused) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [storyIdx, groupIdx, paused, story?.mediaType]);

  function sendReaction(emoji: string) {
    setSentReaction(emoji);
    setShowReactions(false);
    setTimeout(() => setSentReaction(null), 1200);
  }

  if (!group || !story) return null;

  /* ── RTL detection ──────────────────────────────────────── */
  const rtl = document.documentElement.dir === 'rtl';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Story card */}
        <motion.div
          key={`${groupIdx}-${storyIdx}`}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="relative overflow-hidden select-none"
          style={{
            width: '100%',
            maxWidth: 420,
            height: '100dvh',
            maxHeight: 860,
            background: '#0A1726',
            borderRadius: window.innerWidth > 768 ? '24px' : '0',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Media */}
          {story.mediaType === 'image' ? (
            <img
              src={story.mediaUrl}
              alt={story.caption ?? 'Story'}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <video
              ref={videoRef}
              src={story.mediaUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              loop={false}
            />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.72) 100%)' }} />

          {/* ── Top chrome ─────────────────────────────────── */}
          <div className="absolute top-0 inset-x-0 z-20 px-3 pt-3 pb-1">
            {/* Progress bars */}
            <ProgressBar
              total={group.stories.length}
              current={storyIdx}
              elapsed={elapsed}
              duration={duration}
              rtl={rtl}
            />

            {/* Author row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={group.authorImg}
                    alt={group.authorName}
                    className="w-9 h-9 rounded-full object-cover"
                    style={{ border: '2px solid rgba(255,255,255,0.35)' }}
                  />
                  {group.authorVerified && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
                      style={{ width: 15, height: 15, background: '#1FB57A', border: '1.5px solid #0A1726' }}
                    >
                      <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{group.authorName}</p>
                  <p className="text-xs text-white/50 leading-tight">{formatRelative(story.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onPointerDown={() => setPaused(true)}
                  onPointerUp={() => setPaused(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60"
                >
                  <MoreHorizontal size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Tap zones ──────────────────────────────────── */}
          <button
            className="absolute left-0 top-[70px] bottom-[100px] w-1/3 z-10 cursor-pointer"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => { setPaused(false); retreat(); }}
            aria-label="Previous"
          />
          <button
            className="absolute right-0 top-[70px] bottom-[100px] w-1/3 z-10 cursor-pointer"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => { setPaused(false); advance(); }}
            aria-label="Next"
          />

          {/* ── Caption ────────────────────────────────────── */}
          {story.caption && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-[90px] inset-x-0 z-20 px-4 pointer-events-none"
            >
              <p className="text-sm text-white leading-relaxed text-center" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
                {story.caption}
              </p>
            </motion.div>
          )}

          {/* ── Floating reaction ─────────────────────────── */}
          <AnimatePresence>
            {sentReaction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: 1, scale: 1.4, y: -60 }}
                exit={{ opacity: 0, scale: 0, y: -120 }}
                className="absolute bottom-32 right-8 z-30 pointer-events-none text-4xl"
                style={{ filter: 'drop-shadow(0 0 10px rgba(184,241,53,0.8))' }}
              >
                {sentReaction}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom chrome ──────────────────────────────── */}
          <div className="absolute bottom-0 inset-x-0 z-20 px-3 pb-4 pt-2">
            {isOwn ? (
              /* Own story: seen by */
              <button
                onClick={() => setShowSeen(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full"
                style={{ background: 'rgba(22,39,59,0.88)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Eye size={15} className="text-white/50" />
                <span className="text-sm text-white/70">{story.viewCount ?? 0} viewers</span>
                <div className="ml-auto flex -space-x-2">
                  {(story.viewers ?? []).slice(0, 3).map(v => (
                    <img key={v.id} src={v.img} alt={v.name} className="w-6 h-6 rounded-full object-cover border-2 border-[#16273B]" />
                  ))}
                </div>
              </button>
            ) : (
              /* Other's story: reply + react */
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Reply to ${group.authorName}…`}
                    className="w-full rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
                    style={{
                      background: 'rgba(22,39,59,0.85)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                    }}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                  />
                  {replyText && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => { setReplyText(''); setPaused(false); }}
                    >
                      <Send size={15} className="text-azure" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowReactions(r => !r)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(22,39,59,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <Smile size={18} className="text-white/60" />
                </button>
                <button
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(22,39,59,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <Bookmark size={18} className="text-white/60" />
                </button>
              </div>
            )}
          </div>

          {/* Quick reactions */}
          <AnimatePresence>
            {showReactions && <QuickReactions onSelect={sendReaction} />}
          </AnimatePresence>

          {/* Seen by panel */}
          <AnimatePresence>
            {showSeen && isOwn && (
              <SeenByPanel viewers={story.viewers ?? []} count={story.viewCount ?? 0} />
            )}
          </AnimatePresence>

          {/* Prev / Next group nav arrows (desktop) */}
          {groupIdx > 0 && (
            <button
              onClick={() => { setGroupIdx(gi => gi - 1); setStoryIdx(0); setElapsed(0); }}
              className="absolute left-[-56px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center hidden md:flex"
              style={{ background: 'rgba(22,39,59,0.80)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronLeft size={20} className="text-white/80" />
            </button>
          )}
          {groupIdx < groups.length - 1 && (
            <button
              onClick={() => { setGroupIdx(gi => gi + 1); setStoryIdx(0); setElapsed(0); }}
              className="absolute right-[-56px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center hidden md:flex"
              style={{ background: 'rgba(22,39,59,0.80)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronRight size={20} className="text-white/80" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Utility ────────────────────────────────────────────────── */
function formatRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
