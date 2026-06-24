import React, { useRef, useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

/* ─── Types ────────────────────────────────────────────────── */
export interface StoryAuthor {
  id: string;
  name: string;
  img: string;
  verified?: boolean;
  isLive?: boolean;
  seen?: boolean;
  storiesCount?: number;
}

interface StoriesRailProps {
  authors: StoryAuthor[];
  onAuthorClick: (authorId: string) => void;
  onAddClick: () => void;
}

/* ─── Gradient ring avatar ──────────────────────────────────── */
function StoryAvatar({
  author,
  onClick,
  index,
}: {
  author: StoryAuthor;
  onClick: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const ringId = `ring-${author.id}`;

  const unseen = !author.seen;
  const live = author.isLive;

  /* coral pulsing for live, azure→volt gradient for unseen, muted for seen */
  const ringStyle: React.CSSProperties = live
    ? { background: 'none' }
    : unseen
    ? { background: 'linear-gradient(135deg, #2F80ED, #B8F135)' }
    : { background: 'rgba(255,255,255,0.18)' };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 380, damping: 26 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 select-none outline-none"
      style={{ width: 72 }}
    >
      <div className="relative" style={{ width: 64, height: 64 }}>
        {/* Live ring: coral pulsing SVG */}
        {live ? (
          <>
            <svg
              width={64} height={64}
              className="absolute inset-0 pointer-events-none"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle cx={32} cy={32} r={29} fill="none" stroke="rgba(239,83,80,0.25)" strokeWidth={3} />
              <circle
                cx={32} cy={32} r={29}
                fill="none"
                stroke="#EF5350"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={182}
                strokeDashoffset={0}
                style={{ filter: 'drop-shadow(0 0 5px #EF535080)', animation: 'coralPulse 1.5s ease-in-out infinite' }}
              />
            </svg>
          </>
        ) : (
          /* gradient / muted ring via border trick */
          <div
            className="absolute inset-0 rounded-full p-[2.5px]"
            style={{ ...ringStyle, transition: 'box-shadow 0.2s ease' }}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden"
              style={{
                border: '2px solid #0C1A2B',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <img src={author.img} alt={author.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Avatar image (for live, sits above ring) */}
        {live && (
          <div
            className="absolute rounded-full overflow-hidden"
            style={{ inset: 4, border: '2px solid #0C1A2B' }}
          >
            <img
              src={author.img}
              alt={author.name}
              className="w-full h-full object-cover"
              style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          </div>
        )}

        {/* Verified emerald tick */}
        {author.verified && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center"
            style={{ width: 17, height: 17, background: '#1FB57A', border: '2px solid #0C1A2B', boxShadow: '0 0 6px rgba(31,181,122,0.6)' }}
          >
            <svg width={9} height={9} viewBox="0 0 9 9" fill="none">
              <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* LIVE badge */}
        {live && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide text-white"
            style={{ background: '#EF5350', boxShadow: '0 0 8px rgba(239,83,80,0.7)' }}
          >
            LIVE
          </div>
        )}
      </div>

      <span
        className="text-[10px] font-medium text-center truncate w-full"
        style={{ color: live ? '#EF5350' : unseen ? '#F4F8FC' : '#7C8DA6' }}
      >
        {author.name}
      </span>
    </motion.button>
  );
}

/* ─── Add Story button ──────────────────────────────────────── */
function AddStoryButton({ onClick, avatarInitial }: { onClick: () => void; avatarInitial: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 select-none outline-none"
      style={{ width: 72 }}
    >
      <div className="relative" style={{ width: 64, height: 64 }}>
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-bold text-xl"
          style={{
            background: hovered ? 'rgba(47,128,237,0.18)' : 'rgba(47,128,237,0.10)',
            border: '2px dashed rgba(47,128,237,0.55)',
            color: '#2F80ED',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease',
          }}
        >
          <Plus size={22} />
        </div>
      </div>
      <span className="text-[10px] font-medium" style={{ color: '#7C8DA6' }}>Your Story</span>
    </motion.button>
  );
}

/* ─── Main rail ─────────────────────────────────────────────── */
export default function StoriesRail({ authors, onAuthorClick, onAddClick }: StoriesRailProps) {
  const { profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScrollability() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    return () => {
      el?.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [authors]);

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  }

  const initial = profile?.full_name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="relative card p-3 mb-3 overflow-visible">
      <style>{`
        @keyframes coralPulse {
          0%,100% { stroke-opacity:1; filter:drop-shadow(0 0 5px #EF535080); }
          50% { stroke-opacity:0.5; filter:drop-shadow(0 0 10px #EF5350CC); }
        }
      `}</style>

      {/* Scroll left arrow */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(12,26,43,0.92)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            <ChevronLeft size={14} className="text-white/70" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll right arrow */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(12,26,43,0.92)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            <ChevronRight size={14} className="text-white/70" />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hidden"
        style={{ padding: '2px 4px' }}
      >
        <AddStoryButton onClick={onAddClick} avatarInitial={initial} />
        {authors.map((author, i) => (
          <StoryAvatar
            key={author.id}
            author={author}
            onClick={() => onAuthorClick(author.id)}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
