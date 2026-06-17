import React, { useRef, useState, useEffect } from 'react';
import {
  Heart, MessageCircle, Share2, Play, Zap, ShieldCheck,
  MoreHorizontal, Video, Image as ImageIcon, BarChart3, Send,
  Plus, ThumbsUp, Shield, FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── Types ─────────────────────────────────────────────── */
type PostType = 'highlight' | 'milestone' | 'endorsement' | 'scout_interest' | 'standard';

interface Post {
  id: string;
  type: PostType;
  author: { name: string; img: string; headline: string; verified: boolean; score?: number };
  content: string;
  media?: string;
  likes: number;
  comments: number;
  shares: number;
  time: string;
  milestone?: { label: string; value: string };
  endorser?: { name: string; skill: string };
  scoutOrg?: string;
}

/* ─── Data ───────────────────────────────────────────────── */
const STORIES = [
  { id: 's1', name: 'Khalid', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', isNew: true  },
  { id: 's2', name: 'Noura',  img: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=200', isNew: false },
  { id: 's3', name: 'Tariq',  img: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200', isNew: false },
  { id: 's4', name: 'Rayan',  img: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200', isNew: false },
  { id: 's5', name: 'Ahmed',  img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', isNew: false },
];

const POSTS: Post[] = [
  {
    id: 'p1', type: 'highlight',
    author: { name: 'Ahmed Al Mansoori', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', headline: 'Striker · Al Wasl SC', verified: true, score: 9.2 },
    content: 'My best goals compilation from the 2024/25 season. Proud of the journey.',
    media:   'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 248, comments: 34, shares: 12, time: '2h',
  },
  {
    id: 'p2', type: 'milestone',
    author: { name: 'Ahmed Al Mansoori', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', headline: 'Striker · Al Wasl SC', verified: true, score: 9.2 },
    content: 'Ahmed Al Mansoori signed with Al Wasl SC for the 2025/26 season.',
    likes: 156, comments: 18, shares: 8, time: '5h',
    milestone: { label: 'First Professional Contract', value: '2025/26' },
  },
  {
    id: 'p3', type: 'endorsement',
    author: { name: 'Ahmed Al Mansoori', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', headline: 'Striker · Al Wasl SC', verified: true, score: 9.2 },
    content: 'Coach Khalid Al Rashid endorsed Ahmed Al Mansoori for Finishing. View all 24 endorsements.',
    likes: 92, comments: 11, shares: 5, time: '8h',
    endorser: { name: 'Coach Khalid Al Rashid', skill: 'Finishing' },
  },
  {
    id: 'p4', type: 'scout_interest',
    author: { name: 'Al Nassr FC Scout', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', headline: 'Scout Activity', verified: false },
    content: 'Al Nassr FC Scout added you to their watchlist.',
    likes: 0, comments: 0, shares: 0, time: 'Just now',
    scoutOrg: 'Al Nassr FC',
  },
  {
    id: 'p5', type: 'standard',
    author: { name: 'Khalid Al Rashidi', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', headline: 'Coach · Al Wasl SC', verified: true, score: 8.9 },
    content: 'Full medical clearance confirmed for the upcoming cup campaign. All systems go.',
    likes: 134, comments: 15, shares: 7, time: '1d',
  },
];

/* ─── Reaction Burst ─────────────────────────────────────── */
function ReactionBurst({ children }: { children: React.ReactNode }) {
  const [burst, setBurst] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleDblClick() {
    setBurst(false);
    requestAnimationFrame(() => setBurst(true));
    setTimeout(() => setBurst(false), 900);
  }

  const EMOJIS = ['🎯', '⚡', '🔥', '⭐'];
  const particles = Array.from({ length: 6 }, (_, i) => ({
    emoji: EMOJIS[i % EMOJIS.length],
    dx: ((i % 3) - 1) * 80 + (Math.random() - 0.5) * 40,
    dy: -60 - Math.random() * 80,
  }));

  return (
    <div ref={ref} className="relative" onDoubleClick={handleDblClick}>
      {children}
      {burst && particles.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute text-xl z-10"
          style={{
            left: '50%', top: '50%',
            marginLeft: '-12px', marginTop: '-12px',
            ['--dx' as string]: `${p.dx}px`,
            ['--dy' as string]: `${p.dy}px`,
            animation: `particleBurst 0.8s ease-out ${i * 0.05}s forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

/* ─── Action button ─────────────────────────────────────── */
function ActionBtn({ onClick, className, children }: { onClick?: () => void; className: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{ transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
    >
      {children}
    </button>
  );
}

/* ─── Post header ────────────────────────────────────────── */
function PostHeader({ author, time, menuOpen, setMenuOpen, menuRef }: {
  author: Post['author']; time: string;
  menuOpen: boolean; setMenuOpen: (v: boolean) => void;
  menuRef: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={author.img} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm">{author.name}</span>
            {author.verified && <ShieldCheck size={13} className="text-emerald flex-shrink-0" />}
          </div>
          <p className="text-xs text-white/50">{author.headline} · {time}</p>
        </div>
      </div>
      <div className="relative">
        <button
          ref={menuRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-white/[0.07] rounded-lg transition-colors"
        >
          <MoreHorizontal size={17} className="text-white/40" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 w-40 card py-1" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <button className="w-full px-4 py-2 text-sm text-left text-white/60 hover:bg-white/[0.07] hover:text-white transition-colors">Save post</button>
            <button className="w-full px-4 py-2 text-sm text-left text-white/60 hover:bg-white/[0.07] hover:text-white transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>Report</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Action bar ────────────────────────────────────────── */
function ActionBar({ liked, likes, onLike, endorse = false }: {
  liked: boolean; likes: number; onLike: () => void; endorse?: boolean;
}) {
  return (
    <div className="flex gap-1 pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}>
      <ActionBtn
        onClick={onLike}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
          liked ? 'text-volt bg-volt/10' : 'text-white/50 hover:bg-white/[0.07] hover:text-white'
        }`}
      >
        <Heart size={16} fill={liked ? '#B8F135' : 'none'} />
        <span className="text-xs">{likes}</span>
      </ActionBtn>
      <ActionBtn className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.07] hover:text-white transition-colors">
        <MessageCircle size={16} />
        <span className="text-xs">Comment</span>
      </ActionBtn>
      {endorse && (
        <ActionBtn className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-azure hover:bg-azure/10 transition-colors">
          <Zap size={16} />
          <span className="text-xs">Endorse</span>
        </ActionBtn>
      )}
      <ActionBtn className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.07] hover:text-white transition-colors">
        <Share2 size={16} />
        <span className="text-xs">Share</span>
      </ActionBtn>
    </div>
  );
}

/* ─── Post Card ─────────────────────────────────────────── */
function PostCard({ post, index }: { post: Post; index: number }) {
  const [likes,   setLikes]   = useState(post.likes);
  const [liked,   setLiked]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const menuRef  = useRef<HTMLButtonElement>(null);
  const cardRef  = useRef<HTMLDivElement>(null);

  function toggleLike() { setLiked(l => !l); setLikes(n => n + (liked ? -1 : 1)); }

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const enterStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.4s ease ${index * 0.08}s, transform 0.4s cubic-bezier(0.19,1,0.22,1) ${index * 0.08}s`,
  };

  /* Scout interest */
  if (post.type === 'scout_interest') {
    return (
      <div ref={cardRef} className="card p-4 mb-3 flex items-center gap-4" style={{ ...enterStyle, borderLeft: '4px solid #F5A623' }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,166,35,0.12)' }}>
          <Shield size={18} style={{ color: '#F5A623' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{post.scoutOrg} Scout added you to their watchlist</p>
          <p className="text-xs text-white/50 mt-0.5">{post.time}</p>
        </div>
        <button className="btn-primary px-3 py-1.5 text-xs flex-shrink-0">View Opportunity</button>
      </div>
    );
  }

  /* Milestone */
  if (post.type === 'milestone') {
    return (
      <div ref={cardRef} className="card p-5 mb-3" style={{ ...enterStyle, borderLeft: '4px solid #1FB57A' }}>
        <PostHeader author={post.author} time={post.time} menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menuRef as React.RefObject<HTMLButtonElement>} />
        <div className="mt-4 rounded-xl p-4 text-center mb-3" style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.20)' }}>
          <ShieldCheck size={24} className="text-emerald mx-auto mb-2" />
          <h3 className="text-xl font-bold text-emerald" style={{ fontFamily: "'Clash Display',sans-serif" }}>
            {post.milestone?.label}
          </h3>
        </div>
        <p className="text-sm text-ink mb-1">{post.content}</p>
        <ActionBar liked={liked} likes={likes} onLike={toggleLike} />
      </div>
    );
  }

  /* Endorsement */
  if (post.type === 'endorsement') {
    return (
      <div ref={cardRef} className="card p-5 mb-3" style={{ ...enterStyle, borderLeft: '4px solid #2F80ED' }}>
        <PostHeader author={post.author} time={post.time} menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menuRef as React.RefObject<HTMLButtonElement>} />
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full mb-3" style={{ background: 'rgba(47,128,237,0.14)', border: '1px solid rgba(47,128,237,0.25)' }}>
          <ThumbsUp size={13} className="text-azure" />
          <span className="text-xs font-semibold text-azure">{post.endorser?.skill}</span>
        </div>
        <p className="text-sm text-ink mb-1">{post.content}</p>
        <ActionBar liked={liked} likes={likes} onLike={toggleLike} />
      </div>
    );
  }

  /* Highlight (with media) */
  if (post.type === 'highlight') {
    return (
      <div ref={cardRef} className="card overflow-hidden mb-3" style={enterStyle}>
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
          <PostHeader author={post.author} time={post.time} menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menuRef as React.RefObject<HTMLButtonElement>} />
          <p className="text-sm text-ink mt-3">{post.content}</p>
        </div>
        <ReactionBurst>
          <div className="relative w-full h-72 overflow-hidden group cursor-pointer" style={{ background: '#0A1628' }}>
            <img src={post.media} alt="Post media" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(22,39,59,0.90)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
              >
                <Play size={22} className="text-azure" fill="#2F80ED" />
              </div>
            </div>
          </div>
        </ReactionBurst>
        <div className="p-4">
          <p className="text-xs text-white/40 mb-2">{likes} reactions · {post.comments} comments</p>
          <ActionBar liked={liked} likes={likes} onLike={toggleLike} endorse />
        </div>
      </div>
    );
  }

  /* Standard */
  return (
    <div ref={cardRef} className="card p-5 mb-3" style={enterStyle}>
      <PostHeader author={post.author} time={post.time} menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menuRef as React.RefObject<HTMLButtonElement>} />
      <p className="text-sm text-ink my-3">{post.content}</p>
      <p className="text-xs text-white/40 mb-1">{likes} reactions · {post.comments} comments</p>
      <ActionBar liked={liked} likes={likes} onLike={toggleLike} endorse />
    </div>
  );
}

/* ─── Story Row ─────────────────────────────────────────── */
function StoryRow() {
  return (
    <div className="card p-3 mb-3 overflow-x-auto scrollbar-hidden">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-azure flex items-center justify-center bg-azure/5 cursor-pointer hover:bg-azure/10 transition-colors">
            <Plus size={20} className="text-azure" />
          </div>
          <p className="text-[10px] text-white/40 font-medium">Add story</p>
        </div>
        {STORIES.map(s => (
          <div key={s.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full p-0.5 cursor-pointer"
              style={{ background: s.isNew ? '#2F80ED' : 'rgba(255,255,255,0.15)' }}
            >
              <img src={s.img} alt={s.name} className="w-full h-full rounded-full object-cover ring-2 ring-[#16273B]" />
            </div>
            <p className="text-[10px] text-white/40 font-medium truncate w-14 text-center">{s.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Post Composer ─────────────────────────────────────── */
function PostComposer() {
  const { profile } = useAuth();
  const [text, setText] = useState('');
  const initial = profile?.full_name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="card p-4 mb-3">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-azure/10 border border-azure/20 flex items-center justify-center flex-shrink-0 font-bold text-azure text-sm">
          {initial}
        </div>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share an update or post a highlight…"
          className="input-field flex-1 text-sm"
        />
      </div>
      <div className="flex items-center gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        <button className="p-2 rounded-lg text-azure hover:bg-azure/10 transition-colors"><Video size={17} /></button>
        <button className="p-2 rounded-lg hover:bg-white/[0.07] transition-colors" style={{ color: '#B8F135' }}><ImageIcon size={17} /></button>
        <button className="p-2 rounded-lg text-azure hover:bg-azure/10 transition-colors"><BarChart3 size={17} /></button>
        <button className="p-2 rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white/80 transition-colors"><FileText size={17} /></button>
        {text.trim() && (
          <button
            className="ml-auto btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <Send size={13} /> Post
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Load More ─────────────────────────────────────────── */
function LoadMore({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center py-8">
      {loading ? (
        <div className="flex items-center gap-2 text-white/40">
          <div className="w-4 h-4 border-2 border-azure border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
          <span className="text-sm">Loading posts…</span>
        </div>
      ) : (
        <button onClick={onClick} className="btn-outline px-8 py-2.5 text-sm">Load more posts</button>
      )}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────── */
export default function FeedCenter() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-2xl mx-auto">
        <StoryRow />
        <PostComposer />
        <div>
          {POSTS.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
        </div>
        <LoadMore onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1200); }} loading={loading} />
      </div>
    </div>
  );
}
