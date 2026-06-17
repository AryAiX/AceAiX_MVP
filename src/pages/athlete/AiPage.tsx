import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, User, Zap, Lightbulb, TrendingUp, Target,
  Brain, Sparkles, BarChart2, Shield, ChevronRight,
  Star, Activity, Cpu, RefreshCw,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────── */
const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'assistant' as const,
    content: "Hi! I'm your AceAiX AI Career Coach — powered by real-time performance intelligence. I can analyze your form, forecast your career trajectory, boost your scout visibility, and guide you through opportunities. What would you like to explore today?",
    time: '10:00',
  },
];

const SUGGESTIONS = [
  { icon: <TrendingUp size={13} />, text: 'Analyze my performance trends', color: '#B8F135' },
  { icon: <Target size={13} />, text: 'How can I improve my visibility score?', color: '#2F80ED' },
  { icon: <Zap size={13} />, text: "What's my career trajectory forecast?", color: '#F5A623' },
  { icon: <Lightbulb size={13} />, text: 'Profile optimization tips', color: '#1FB57A' },
  { icon: <Shield size={13} />, text: 'What scouts are viewing my profile?', color: '#EF5350' },
  { icon: <BarChart2 size={13} />, text: 'Compare me to similar athletes', color: '#B8F135' },
];

const MOCK_RESPONSES: Record<string, { content: string; stat?: { label: string; value: string; color: string } }> = {
  performance: {
    content: "Your goal-scoring rate jumped **22%** over the last 4 weeks — elite-tier form. Sprint metrics rank in the **78th percentile** for UAE strikers, and your off-ball movement score improved 12% last month.\n\nOne gap: assists lag behind your scoring. Focusing on link-up play in training could push your overall rating from 8.1 → 9.0+ within 2–3 months.",
    stat: { label: 'Current Rating', value: '8.1', color: '#B8F135' },
  },
  visibility: {
    content: "Your visibility score is **82/100** — solid but with room to grow. Three targeted actions to break 90+:\n\n1. Add a verified medical clearance **(+12 pts)**\n2. Upload 2 highlight clips with AI tags **(+6 pts)**\n3. Request a coach endorsement **(+5 pts)**\n\nThose alone move you into the **top 15%** of UAE athletes on the platform.",
    stat: { label: 'Visibility Score', value: '82', color: '#2F80ED' },
  },
  trajectory: {
    content: "Based on your progression curve and 4,200 comparable player data points, you're on track for a **professional move within 12–18 months**.\n\nAthletes with your profile (age, goal rate, UAE market presence) typically attract Gulf club interest at this stage. **Al Ain FC** and **Al Hilal** have both recruited players with near-identical profiles in the last 18 months.",
    stat: { label: 'Career Confidence', value: '91%', color: '#F5A623' },
  },
  profile: {
    content: "Your profile is **65% complete**. Key missing elements:\n\n• Medical verification badge *(highest impact — 4× more views)*\n• Video highlights with AI position tags\n• Coach & teammate endorsements\n\nA complete profile gets **4× more scout views** than an incomplete one. Want me to walk you through each step in priority order?",
    stat: { label: 'Profile Complete', value: '65%', color: '#1FB57A' },
  },
  scouts: {
    content: "**14 scouts** viewed your profile in the last 7 days — up 38% week-over-week. Notable interest from Al Ain FC (3 views), Al Hilal (2 views), and UAE Athletics Federation (1 view).\n\nYour profile was also saved by **3 recruiters** this week. Scout activity typically spikes after you upload a new highlight — timing a clip upload now could capitalise on this momentum.",
    stat: { label: 'Scout Views', value: '14', color: '#EF5350' },
  },
  compare: {
    content: "Comparing your profile to **similar UAE strikers** (age 20–24, U23 level):\n\n• Goal rate: **Top 22%** ✓\n• Sprint speed: **Top 31%** ✓\n• Match rating avg: **Top 18%** ✓\n• Profile completeness: **Bottom 40%** — this is the gap holding you back.\n\nBridging the profile gap alone could shift your scout discovery ranking from position 94 → **top 40**.",
    stat: { label: 'Peer Ranking', value: 'Top 22%', color: '#B8F135' },
  },
};

function getMockResponse(userInput: string) {
  const lower = userInput.toLowerCase();
  if (lower.includes('perform') || lower.includes('stats') || lower.includes('trend') || lower.includes('form')) return MOCK_RESPONSES.performance;
  if (lower.includes('visib') || lower.includes('score') || lower.includes('found')) return MOCK_RESPONSES.visibility;
  if (lower.includes('traject') || lower.includes('career') || lower.includes('future') || lower.includes('forecast')) return MOCK_RESPONSES.trajectory;
  if (lower.includes('profile') || lower.includes('optim') || lower.includes('complet')) return MOCK_RESPONSES.profile;
  if (lower.includes('scout') || lower.includes('view') || lower.includes('who')) return MOCK_RESPONSES.scouts;
  if (lower.includes('compar') || lower.includes('similar') || lower.includes('peer')) return MOCK_RESPONSES.compare;
  return {
    content: "Great question. Based on your verified performance data and current AceAiX profile, I'd recommend prioritising full profile completion — it's the single biggest credibility signal for scouts.\n\nYour recent form is impressive (avg rating **8.1**), and with 3 targeted profile improvements you'd rank in the **top 20%** of UAE athletes. Which aspect would you like to focus on?",
    stat: { label: 'Avg Rating', value: '8.1', color: '#B8F135' },
  };
}

/* ─── Typewriter effect ──────────────────────────────────── */
function TypewriterText({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const t = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) { clearInterval(t); onDone?.(); }
    }, speed);
    return () => clearInterval(t);
  }, [text]);

  return <span>{displayed}<span className="inline-block w-0.5 h-3.5 bg-azure ml-0.5 animate-pulse" style={{ display: idx.current < text.length ? 'inline-block' : 'none' }} /></span>;
}

/* ─── Stat chip inside message ───────────────────────────── */
function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl"
      style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <Activity size={11} style={{ color }} />
      <span className="text-xs font-semibold" style={{ color }}>{value}</span>
      <span className="text-[10px] text-white/40">{label}</span>
    </div>
  );
}

/* ─── Render markdown-lite bold ─────────────────────────── */
function MessageContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
          : part.split('\n').map((line, j) =>
              line === '' ? <br key={`${i}-${j}`} /> :
              line.startsWith('•') ? <div key={`${i}-${j}`} className="flex items-start gap-1.5 mt-1"><span className="text-white/30 mt-0.5">•</span><span>{line.slice(1).trim()}</span></div> :
              line.match(/^\d\./) ? <div key={`${i}-${j}`} className="mt-1">{line}</div> :
              <span key={`${i}-${j}`}>{line}</span>
            )
      )}
    </>
  );
}

/* ─── Animated orb background ───────────────────────────── */
function AiOrb() {
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, #2F80ED, #B8F135, #1FB57A, #2F80ED)', animation: 'spin 4s linear infinite', opacity: 0.7 }} />
      <div className="absolute inset-0.5 rounded-full" style={{ background: '#0F2133' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Brain size={20} className="text-azure" />
      </div>
    </div>
  );
}

/* ─── Live activity ticker ───────────────────────────────── */
const LIVE_EVENTS = [
  '3 scouts viewed your profile today',
  'Al Ain FC saved your profile',
  'New match: 94% compatibility',
  'Visibility score updated: 82 → 83',
  'UAE Athletics Federation is recruiting',
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_EVENTS.length); setVisible(true); }, 400);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ animation: 'liveFlash 1.5s infinite' }} />
      <span className="text-xs text-white/50 transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
        {LIVE_EVENTS[idx]}
      </span>
    </div>
  );
}

/* ─── Insight cards above chat ───────────────────────────── */
const INSIGHTS = [
  { icon: <TrendingUp size={16} />, label: 'Form', value: '+22%', sub: 'last 4 weeks', color: '#B8F135', bg: 'rgba(184,241,53,0.08)', border: 'rgba(184,241,53,0.2)' },
  { icon: <Star size={16} />,       label: 'Rating', value: '8.1',  sub: 'avg this month', color: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)' },
  { icon: <Activity size={16} />,   label: 'Scouts', value: '14',   sub: 'this week',      color: '#EF5350', bg: 'rgba(239,83,80,0.08)',  border: 'rgba(239,83,80,0.2)'  },
  { icon: <Target size={16} />,     label: 'Match',  value: '94%',  sub: 'top opportunity', color: '#2F80ED', bg: 'rgba(47,128,237,0.08)', border: 'rgba(47,128,237,0.2)' },
];

/* ─── Main Page ──────────────────────────────────────────── */
export default function AiPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    const uid = String(Date.now());
    setMessages(prev => [...prev, { id: uid, role: 'user', content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 500));
    const response = getMockResponse(content);
    const aid = String(Date.now() + 1);
    setMessages(prev => [...prev, {
      id: aid, role: 'assistant', content: response.content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stat: response.stat,
    } as any]);
    setTypingId(aid);
    setLoading(false);
    inputRef.current?.focus();
  }

  const showSuggestions = messages.length <= 2 && !loading;

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes liveFlash { 0%,100%{opacity:1}50%{opacity:0.25} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubbleIn  { from{opacity:0;transform:scale(0.92) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shimmer   { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(47,128,237,0)} 50%{box-shadow:0 0 0 6px rgba(47,128,237,0.15)} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
      `}</style>

      <div className={`max-w-3xl flex flex-col gap-5 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* ── Header ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #0D1F33 0%, #132A44 60%, #0A1825 100%)',
            border: '1px solid rgba(47,128,237,0.25)',
            animation: 'fadeSlideIn 0.45s ease both',
          }}>
          {/* animated gradient stripe */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(47,128,237,0.04), rgba(184,241,53,0.03), transparent)',
              backgroundSize: '200% 100%',
              animation: 'gradShift 6s ease infinite',
            }} />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AiOrb />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-display font-bold text-white">AI Career Coach</h1>
                  <span className="flex items-center gap-1 text-[10px] font-black text-azure bg-azure/10 border border-azure/25 px-2 py-0.5 rounded-full">
                    <Cpu size={8} /> GPT-4o
                  </span>
                </div>
                <LiveTicker />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(31,181,122,0.1)', border: '1px solid rgba(31,181,122,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'liveFlash 1.5s ease-in-out infinite', boxShadow: '0 0 6px #1FB57A' }} />
              <span className="text-xs font-bold text-emerald-400">Online</span>
            </div>
          </div>
        </div>

        {/* ── Insight strip ──────────────────────────── */}
        <div className="grid grid-cols-4 gap-2.5">
          {INSIGHTS.map((ins, i) => (
            <div key={ins.label}
              className="relative overflow-hidden rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: ins.bg, border: `1px solid ${ins.border}`,
                animation: `fadeSlideIn 0.4s ${i * 0.06}s ease both`,
                boxShadow: `0 4px 16px ${ins.color}0a`,
              }}
              onClick={() => sendMessage(SUGGESTIONS[i]?.text)}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ins.color}18`, color: ins.color }}>{ins.icon}</div>
                <ChevronRight size={12} style={{ color: `${ins.color}60` }} />
              </div>
              <p className="text-base font-black text-white leading-none">{ins.value}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{ins.label}</p>
              <p className="text-[9px] text-white/20 mt-0.5">{ins.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Chat panel ─────────────────────────────── */}
        <div className="flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: '#0F2133',
            border: '1px solid rgba(47,128,237,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            minHeight: 480,
            animation: 'fadeSlideIn 0.5s 0.1s ease both',
          }}>

          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(47,128,237,0.15)', boxShadow: '0 0 12px rgba(47,128,237,0.3)', animation: 'pulseRing 3s ease-in-out infinite' }}>
                <Bot size={15} className="text-azure" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AceAiX Coach</p>
                <p className="text-[10px] text-white/35">Career &amp; Performance Intelligence</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              <RefreshCw size={10} /> New chat
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ maxHeight: 400 }}>
            {messages.map((msg, idx) => (
              <div key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                style={{ animation: 'bubbleIn 0.3s ease both' }}>

                {/* Avatar */}
                {msg.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(47,128,237,0.15)', border: '1px solid rgba(47,128,237,0.25)', boxShadow: '0 0 10px rgba(47,128,237,0.2)' }}>
                    <Sparkles size={14} className="text-azure" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #B8F135, #1FB57A)', boxShadow: '0 0 10px rgba(184,241,53,0.25)' }}>
                    <User size={13} className="text-black font-bold" />
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[82%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'assistant'
                        ? 'linear-gradient(135deg, rgba(47,128,237,0.1), rgba(184,241,53,0.04))'
                        : 'linear-gradient(135deg, rgba(184,241,53,0.15), rgba(47,128,237,0.08))',
                      border: msg.role === 'assistant'
                        ? '1px solid rgba(47,128,237,0.18)'
                        : '1px solid rgba(184,241,53,0.2)',
                      borderTopLeftRadius:  msg.role === 'assistant' ? 4 : undefined,
                      borderTopRightRadius: msg.role === 'user' ? 4 : undefined,
                      color: 'rgba(244,248,252,0.85)',
                    }}>
                    {msg.role === 'assistant' && typingId === msg.id ? (
                      <TypewriterText text={msg.content} onDone={() => setTypingId(null)} />
                    ) : (
                      <MessageContent text={msg.content} />
                    )}
                    {(msg as any).stat && (
                      <StatChip label={(msg as any).stat.label} value={(msg as any).stat.value} color={(msg as any).stat.color} />
                    )}
                  </div>
                  <span className="text-[10px] text-white/20 mt-1 px-1">{(msg as any).time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start gap-3" style={{ animation: 'bubbleIn 0.3s ease both' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(47,128,237,0.15)', border: '1px solid rgba(47,128,237,0.25)' }}>
                  <Sparkles size={14} className="text-azure" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3.5"
                  style={{ background: 'linear-gradient(135deg, rgba(47,128,237,0.1), rgba(184,241,53,0.04))', border: '1px solid rgba(47,128,237,0.18)' }}>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: ['#2F80ED', '#B8F135', '#1FB57A'][i],
                          animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                          boxShadow: `0 0 6px ${['rgba(47,128,237,0.6)','rgba(184,241,53,0.6)','rgba(31,181,122,0.6)'][i]}`,
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="px-5 pb-4">
              <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider mb-2">Quick questions</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {SUGGESTIONS.map((s, i) => (
                  <button key={s.text} onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all hover:scale-[1.02]"
                    style={{
                      background: `${s.color}0e`,
                      border: `1px solid ${s.color}25`,
                      color: s.color,
                      animation: `fadeSlideIn 0.4s ${i * 0.05}s ease both`,
                    }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="px-5 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', transition: 'border-color 0.2s' }}
              onFocus={() => {}} >
              <Bot size={15} className="text-azure flex-shrink-0 opacity-50" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask your AI coach anything..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  background: input.trim() && !loading ? '#2F80ED' : 'rgba(255,255,255,0.05)',
                  boxShadow: input.trim() && !loading ? '0 2px 12px rgba(47,128,237,0.4)' : 'none',
                  color: input.trim() && !loading ? 'white' : 'rgba(255,255,255,0.2)',
                  transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.92)',
                }}>
                <Send size={13} />
              </button>
            </div>
            <p className="text-center text-[10px] text-white/15 mt-2">AI responses are for guidance only. Always verify with your club or agent.</p>
          </div>
        </div>

      </div>
    </>
  );
}
