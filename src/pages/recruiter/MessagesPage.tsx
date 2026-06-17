import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Send, ShieldCheck, Flame, Zap, Star, MessageSquare,
  Phone, Video, MoreHorizontal, ChevronRight, ArrowUpRight,
  Paperclip, Smile, BrainCircuit, TrendingUp, X,
} from 'lucide-react';

/* ── palette ──────────────────────────────────────────────────── */
const C = {
  blue:   '#2F80ED',
  green:  '#1FB57A',
  amber:  '#F5A623',
  lime:   '#B8F135',
  red:    '#EF5350',
  purple: '#9B59B6',
};

/* ── data ─────────────────────────────────────────────────────── */
const CONVERSATIONS = [
  {
    id: '1',
    with: 'Khalid Al-Rashidi',
    role: 'Striker · Al Ain FC',
    lastMsg: 'Thank you for reaching out. I am very interested in the trial.',
    time: '10:24 AM',
    unread: 2,
    verified: true,
    online: true,
    hot: true,
    score: 9.2,
    match: 97,
    age: 22,
    goals: 18,
    assists: 7,
    color: C.lime,
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '2',
    with: 'Tariq Hassan',
    role: 'Midfielder · Al Hilal',
    lastMsg: 'When would the trial dates be?',
    time: 'Yesterday',
    unread: 0,
    verified: true,
    online: false,
    hot: false,
    score: 8.8,
    match: 91,
    age: 24,
    goals: 9,
    assists: 14,
    color: C.blue,
    image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '3',
    with: 'Rayan Benali',
    role: 'Goalkeeper · Wydad AC',
    lastMsg: 'Please send me the details.',
    time: 'Mon',
    unread: 0,
    verified: true,
    online: true,
    hot: false,
    score: 8.7,
    match: 88,
    age: 26,
    goals: 0,
    assists: 0,
    color: C.green,
    image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '4',
    with: 'Noura Al-Mansoori',
    role: 'Sprinter · UAE Athletics',
    lastMsg: 'I will check my schedule and get back to you.',
    time: 'Sun',
    unread: 1,
    verified: true,
    online: false,
    hot: true,
    score: 9.0,
    match: 94,
    age: 21,
    goals: 0,
    assists: 0,
    color: C.amber,
    image: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '5',
    with: 'Yusuf Al-Kaabi',
    role: 'Winger · Shabab FC',
    lastMsg: 'Sounds great, looking forward to it.',
    time: 'Fri',
    unread: 0,
    verified: false,
    online: false,
    hot: false,
    score: 8.5,
    match: 85,
    age: 20,
    goals: 11,
    assists: 9,
    color: C.purple,
    image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

type Msg = { role: 'me' | 'them'; text: string; time: string };
const MESSAGES_MAP: Record<string, Msg[]> = {
  '1': [
    { role: 'me',   text: 'Hi Khalid, I watched your highlights — your numbers this season are impressive. We have a first-team trial opening in July.',         time: '9:51 AM' },
    { role: 'them', text: 'Thank you for reaching out. I am very interested in the trial.',                                                                       time: '10:24 AM' },
  ],
  '2': [
    { role: 'me',   text: 'Hello Tariq, your passing metrics rank top-5 in the league. Would you consider discussing a summer move?',                             time: 'Yesterday, 3:00 PM' },
    { role: 'them', text: 'When would the trial dates be?',                                                                                                        time: 'Yesterday, 4:15 PM' },
  ],
  '3': [
    { role: 'me',   text: 'Rayan, your save percentage and distribution are exactly what we need. Are you available to discuss further?',                         time: 'Mon, 11:00 AM' },
    { role: 'them', text: 'Please send me the details.',                                                                                                           time: 'Mon, 12:30 PM' },
  ],
  '4': [
    { role: 'me',   text: 'Noura, your recent 100m times caught our attention. We\'d love to discuss a performance partnership.',                                 time: 'Sun, 9:00 AM' },
    { role: 'them', text: 'I will check my schedule and get back to you.',                                                                                         time: 'Sun, 10:40 AM' },
  ],
  '5': [
    { role: 'me',   text: 'Yusuf, your dribble success rate and through-ball vision are outstanding. We believe you could be a great fit.',                      time: 'Fri, 2:00 PM' },
    { role: 'them', text: 'Sounds great, looking forward to it.',                                                                                                  time: 'Fri, 3:20 PM' },
  ],
};

/* ── typing dots ─────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.45)',
            animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
          }} />
      ))}
    </div>
  );
}

/* ── message bubble ──────────────────────────────────────────── */
function Bubble({ m, color, idx }: { m: Msg; color: string; idx: number }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), idx * 60);
    return () => clearTimeout(t);
  }, [idx]);
  const isMe = m.role === 'me';
  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : `translateY(8px)`,
        transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.4,0.64,1)',
      }}>
      <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={isMe
            ? { background: `linear-gradient(135deg,${color}CC,${color})`, color: '#fff', borderRadius: '18px 4px 18px 18px', boxShadow: `0 4px 18px ${color}35` }
            : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.82)', borderRadius: '4px 18px 18px 18px' }}>
          {m.text}
        </div>
        <p className="text-[10px] px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{m.time}</p>
      </div>
    </div>
  );
}

/* ── conversation list item ──────────────────────────────────── */
type Conv = typeof CONVERSATIONS[0];
function ConvItem({ conv, isActive, onSelect, mounted, delay }: {
  conv: Conv; isActive: boolean; onSelect: () => void; mounted: boolean; delay: number;
}) {
  const [hov, setHov] = useState(false);
  const mc = (m: number) => m >= 95 ? C.lime : m >= 90 ? C.green : C.blue;
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-3 px-3.5 py-3 cursor-pointer"
      style={{
        background: isActive ? `${conv.color}10` : hov ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderLeft: isActive ? `2px solid ${conv.color}` : '2px solid transparent',
        borderBottom: '1px solid rgba(255,255,255,0.045)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-8px)',
        transition: `background 0.15s, border-color 0.15s, opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
      }}>
      <div className="relative flex-shrink-0">
        <img src={conv.image} alt={conv.with}
          className="w-11 h-11 rounded-xl object-cover"
          style={{ border: isActive ? `2px solid ${conv.color}55` : '2px solid rgba(255,255,255,0.08)' }} />
        {conv.online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 animate-pulse"
            style={{ background: C.green, borderColor: '#0C1A2B' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{conv.with}</p>
            {conv.verified && <ShieldCheck size={10} style={{ color: C.green, flexShrink: 0 }} />}
            {conv.hot && <Flame size={9} style={{ color: C.amber, flexShrink: 0 }} />}
          </div>
          <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{conv.time}</span>
        </div>
        <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{conv.lastMsg}</p>
      </div>
      {conv.unread > 0 && (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ background: conv.color, color: '#0C1A2B', animation: 'popIn 0.3s ease' }}>
          {conv.unread}
        </span>
      )}
    </div>
  );
}

/* ── main ─────────────────────────────────────────────────────── */
export default function RecruiterMessagesPage() {
  const [selected, setSelected]   = useState(CONVERSATIONS[0]);
  const [input, setInput]         = useState('');
  const [msgs, setMsgs]           = useState(MESSAGES_MAP);
  const [query, setQuery]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [mounted, setMounted]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, selected.id, typing]);

  function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMsgs(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), { role: 'me', text, time: 'Just now' }] }));
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), { role: 'them', text: 'Thanks for the message! I\'ll get back to you shortly.', time: 'Just now' }] }));
    }, 1800);
  }

  const filtered = CONVERSATIONS.filter(c =>
    c.with.toLowerCase().includes(query.toLowerCase()) ||
    c.role.toLowerCase().includes(query.toLowerCase())
  );

  const currentMsgs = msgs[selected.id] || [];
  const mc = (m: number) => m >= 95 ? C.lime : m >= 90 ? C.green : C.blue;

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          70% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)', minHeight: '500px' }}>

        {/* ── header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-10px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-display font-bold text-white">Messages</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${C.green}14`, border: `1px solid ${C.green}30`, color: C.green }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                Live
              </span>
            </div>
            <p className="text-[12px] text-white/38 mt-0.5">Direct line to your prospects</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ background: `${C.blue}14`, border: `1px solid ${C.blue}28`, color: C.blue }}>
              {CONVERSATIONS.reduce((s, c) => s + c.unread, 0)} unread
            </span>
          </div>
        </div>

        {/* ── 3-panel body ───────────────────────────────────── */}
        <div className="flex flex-1 gap-4 overflow-hidden min-h-0">

          {/* ── LEFT: conversation list ─────────────────────── */}
          <div className="w-72 flex flex-col flex-shrink-0 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
              transition: 'opacity 0.45s ease 0.1s, transform 0.45s cubic-bezier(0.34,1.2,0.64,1) 0.1s',
            }}>

            {/* search */}
            <div className="p-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.28)' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-[12px] outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'rgba(255,255,255,0.80)',
                  }}
                  onFocus={e => { e.target.style.borderColor = `${C.blue}60`; e.target.style.boxShadow = `0 0 0 3px ${C.blue}14`; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map((conv, i) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={selected.id === conv.id}
                  onSelect={() => setSelected(conv)}
                  mounted={mounted}
                  delay={0.15 + i * 0.06}
                />
              ))}
            </div>
          </div>

          {/* ── CENTER: chat thread ─────────────────────────── */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.45s ease 0.18s',
            }}>

            {/* chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
              style={{ borderBottom: `1px solid rgba(255,255,255,0.07)`, background: `linear-gradient(90deg,${selected.color}08,transparent)` }}>
              <div className="relative flex-shrink-0">
                <img src={selected.image} alt={selected.with}
                  className="w-10 h-10 rounded-xl object-cover"
                  style={{ border: `2px solid ${selected.color}40` }} />
                {selected.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    style={{ background: C.green, borderColor: '#0C1A2B' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{selected.with}</p>
                  {selected.verified && <ShieldCheck size={12} style={{ color: C.green }} />}
                  {selected.hot && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ background: `${C.amber}20`, color: C.amber, border: `1px solid ${C.amber}35` }}>
                      <Flame size={8} /> Hot
                    </span>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {selected.online ? <span style={{ color: C.green }}>● Online</span> : selected.role}
                  {selected.online && <span className="text-white/30 ml-1">· {selected.role}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: `${mc(selected.match)}15`, color: mc(selected.match), border: `1px solid ${mc(selected.match)}28` }}>
                  {selected.match}% match
                </span>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.06]"
                  style={{ color: 'rgba(255,255,255,0.38)' }}>
                  <Phone size={14} />
                </button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.06]"
                  style={{ color: 'rgba(255,255,255,0.38)' }}>
                  <Video size={14} />
                </button>
                <button
                  onClick={() => setShowProfile(p => !p)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.06]"
                  style={{ color: showProfile ? C.blue : 'rgba(255,255,255,0.38)' }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {currentMsgs.map((m, i) => (
                <Bubble key={`${selected.id}-${i}`} m={m} color={selected.color} idx={i} />
              ))}
              {typing && (
                <div className="flex gap-2"
                  style={{ animation: 'popIn 0.25s ease' }}>
                  <TypingDots />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input bar */}
            <div className="px-4 py-3.5 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-white/[0.07]"
                  style={{ color: 'rgba(255,255,255,0.30)' }}>
                  <Paperclip size={14} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder={`Message ${selected.with.split(' ')[0]}…`}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'rgba(255,255,255,0.85)', caretColor: selected.color }}
                />
                <button className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-white/[0.07]"
                  style={{ color: 'rgba(255,255,255,0.30)' }}>
                  <Smile size={14} />
                </button>
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
                  style={{
                    background: input.trim() ? selected.color : 'rgba(255,255,255,0.08)',
                    boxShadow: input.trim() ? `0 4px 16px ${selected.color}45` : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
                  }}>
                  <Send size={13} style={{ color: input.trim() ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: athlete profile panel ────────────────── */}
          {showProfile && (
            <div className="w-64 flex-shrink-0 flex flex-col gap-3 overflow-y-auto"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(14px)',
                transition: 'opacity 0.45s ease 0.25s, transform 0.45s cubic-bezier(0.34,1.2,0.64,1) 0.25s',
              }}>

              {/* profile card */}
              <div className="rounded-2xl overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="relative h-28">
                  <img src={selected.image} alt={selected.with} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 20%,rgba(12,26,43,0.97))' }} />
                  <button
                    onClick={() => setShowProfile(false)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(12,26,43,0.70)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.55)' }}>
                    <X size={11} />
                  </button>
                  <div className="absolute top-2 left-2 flex gap-1">
                    {selected.verified && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: `${C.green}CC`, color: '#fff', backdropFilter: 'blur(4px)' }}>
                        <ShieldCheck size={8} /> Verified
                      </span>
                    )}
                    {selected.hot && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: `${C.amber}CC`, color: '#0C1A2B', backdropFilter: 'blur(4px)' }}>
                        <Flame size={8} /> Hot
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <p className="text-sm font-bold text-white leading-tight">{selected.with}</p>
                    <p className="text-[10px] text-white/45">{selected.role}</p>
                  </div>
                </div>

                <div className="p-4">
                  {/* AI score */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${selected.color}16`, border: `1px solid ${selected.color}28` }}>
                        <BrainCircuit size={13} style={{ color: selected.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{selected.score}</p>
                        <p className="text-[9px] text-white/30">AI Score</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: mc(selected.match) }}>{selected.match}%</p>
                      <p className="text-[9px] text-white/30">Match</p>
                    </div>
                  </div>

                  {/* match bar */}
                  <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: mounted ? `${selected.match}%` : '0%',
                        background: `linear-gradient(90deg,${mc(selected.match)}60,${mc(selected.match)})`,
                        boxShadow: `0 0 8px ${mc(selected.match)}55`,
                        transitionTimingFunction: 'cubic-bezier(0.34,1.2,0.64,1)',
                        transitionDelay: '0.5s',
                      }} />
                  </div>

                  {/* stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { v: selected.age,     l: 'Age'     },
                      { v: selected.goals,   l: 'Goals'   },
                      { v: selected.assists, l: 'Assists'  },
                    ].map(s => (
                      <div key={s.l} className="text-center py-2 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-sm font-bold text-white">{s.v}</p>
                        <p className="text-[9px] text-white/28">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {/* actions */}
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                      style={{ background: selected.color, color: '#fff', boxShadow: `0 4px 16px ${selected.color}40` }}>
                      <ArrowUpRight size={12} /> View Full Profile
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: `${C.amber}12`, border: `1px solid ${C.amber}28`, color: C.amber }}>
                      <Star size={11} /> Add to Watchlist
                    </button>
                  </div>
                </div>
              </div>

              {/* AI context card */}
              <div className="rounded-2xl p-4 flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${C.blue}0C,${C.purple}09)`, border: `1px solid ${C.blue}1A` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={12} style={{ color: C.blue }} />
                  <p className="text-[11px] font-bold text-white">AI Context</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Scouted',   value: '3 times', color: C.blue   },
                    { label: 'Responded', value: '< 2h avg', color: C.green },
                    { label: 'Interest',  value: 'High',    color: C.lime   },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/38">{r.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* quick stats */}
              <div className="rounded-2xl p-4 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={12} style={{ color: C.amber }} />
                  <p className="text-[11px] font-bold text-white">Season Form</p>
                  <span className="ml-auto text-[10px] font-bold flex items-center gap-1" style={{ color: C.green }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                    Live
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-10">
                  {[6, 8, 5, 9, 7, 10, 8].map((v, i) => (
                    <div key={i} className="flex-1 rounded-t-sm transition-all duration-700"
                      style={{
                        height: mounted ? `${(v / 10) * 100}%` : '0%',
                        background: `linear-gradient(to top,${selected.color}50,${selected.color})`,
                        transitionDelay: `${0.6 + i * 0.06}s`,
                        transitionTimingFunction: 'cubic-bezier(0.34,1.4,0.64,1)',
                      }} />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <span key={i} className="flex-1 text-center text-[8px]" style={{ color: 'rgba(255,255,255,0.20)' }}>{d}</span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
