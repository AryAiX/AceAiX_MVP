import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Send, Search, MessageSquare, ShieldCheck, Plus,
  ArrowLeft, Loader2, Users, MoreHorizontal, Phone, Video,
  Smile, Paperclip, Zap, Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Conversation, Message, UserProfile } from '../../types';

/* ─── Helpers ────────────────────────────────────────────── */
function timeLabel(iso: string) {
  const d = new Date(iso), now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const ROLE_COLOR: Record<string, string> = {
  scout:    '#2F80ED',
  recruiter:'#B8F135',
  coach:    '#1FB57A',
  club:     '#F5A623',
  athlete:  '#7C8DA6',
  admin:    '#EF5350',
};

function roleColor(role?: string) {
  return ROLE_COLOR[role ?? ''] ?? '#7C8DA6';
}

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({
  user, size = 10, online = false,
}: { user: Partial<UserProfile> | null | undefined; size?: number; online?: boolean }) {
  const px = size * 4;
  const color = roleColor(user?.role);
  return (
    <div className="relative flex-shrink-0" style={{ width: px, height: px }}>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
        style={{
          background: user?.avatar_url ? 'transparent' : `${color}18`,
          border: `1.5px solid ${color}30`,
          boxShadow: online ? `0 0 10px ${color}30` : 'none',
        }}>
        {user?.avatar_url
          ? <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
          : <span className="text-xs font-black" style={{ color, fontSize: px * 0.38 }}>
              {user?.full_name?.charAt(0) ?? '?'}
            </span>
        }
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 rounded-full border-2"
          style={{ width: px * 0.28, height: px * 0.28, background: '#1FB57A', borderColor: '#0C1A2B', boxShadow: '0 0 6px rgba(31,181,122,0.7)' }} />
      )}
    </div>
  );
}

/* ─── New Conversation Modal ─────────────────────────────── */
function NewConversationModal({ onClose, onSelect }: {
  onClose: () => void;
  onSelect: (user: UserProfile) => void;
}) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const tid = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.from('user_profiles').select('*').ilike('full_name', `%${query}%`).limit(10);
      setResults((data as UserProfile[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(tid);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: '#16273B',
          border: '1px solid rgba(47,128,237,0.25)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        {/* Modal header */}
        <div className="px-5 pt-5 pb-4"
          style={{ background: 'linear-gradient(135deg,rgba(47,128,237,0.1),rgba(184,241,53,0.05))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-bold text-white mb-3">New Message</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl text-white placeholder:text-white/25 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </div>

        <div className="p-3 max-h-72 overflow-y-auto space-y-0.5">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-azure border-t-transparent animate-spin" />
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <p className="text-xs text-white/30 text-center py-8">No users found</p>
          )}
          {!loading && results.length === 0 && !query.trim() && (
            <p className="text-xs text-white/20 text-center py-6">Start typing to search...</p>
          )}
          {results.map(u => {
            const color = roleColor(u.role);
            return (
              <button key={u.id} onClick={() => onSelect(u)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)') }
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent') }>
                <Avatar user={u} size={9} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">{u.full_name}</span>
                    {u.is_verified && <ShieldCheck size={11} style={{ color: '#1FB57A', filter: 'drop-shadow(0 0 4px rgba(31,181,122,0.5))' }} />}
                  </div>
                  <span className="text-[10px] font-semibold capitalize" style={{ color }}>{u.role}</span>
                </div>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${color}20`, color }}>
                  <Send size={10} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]   = useState<string | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState('');
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [msgLoading, setMsgLoading]       = useState(false);
  const [sending, setSending]             = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [mobileView, setMobileView]       = useState<'list' | 'chat'>('list');
  const [mounted, setMounted]             = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null;
  const otherUser  = activeConv?.other_user;
  const accentColor = roleColor(otherUser?.role);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('*, p1:user_profiles!conversations_participant_1_id_fkey(*), p2:user_profiles!conversations_participant_2_id_fkey(*)')
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    if (data) {
      setConversations((data as any[]).map(row => ({
        ...row,
        other_user: row.participant_1_id === user.id ? row.p2 : row.p1,
      })) as Conversation[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    setMsgLoading(true);
    supabase.from('messages').select('*, sender:user_profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', activeConvId).order('created_at', { ascending: true })
      .then(({ data }) => { setMessages((data as Message[]) ?? []); setMsgLoading(false); });
    supabase.from('messages').update({ is_read: true }).eq('conversation_id', activeConvId).neq('sender_id', user!.id)
      .then(() => loadConversations());
  }, [activeConvId, user, loadConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    const sub = supabase.channel(`conv-${activeConvId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvId}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: sender } = await supabase.from('user_profiles').select('*').eq('id', newMsg.sender_id).maybeSingle();
          setMessages(prev => [...prev, { ...newMsg, sender: sender as UserProfile }]);
          loadConversations();
        }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [activeConvId, loadConversations]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function openConvWith(otherUser: UserProfile) {
    setShowNew(false);
    if (!user) return;
    const existing = conversations.find(c =>
      (c.participant_1_id === user.id && c.participant_2_id === otherUser.id) ||
      (c.participant_2_id === user.id && c.participant_1_id === otherUser.id)
    );
    if (existing) { setActiveConvId(existing.id); setMobileView('chat'); return; }
    const { data, error } = await supabase.from('conversations')
      .insert({ participant_1_id: user.id, participant_2_id: otherUser.id }).select().single();
    if (!error && data) {
      setConversations(prev => [{ ...data, other_user: otherUser } as Conversation, ...prev]);
      setActiveConvId(data.id);
      setMobileView('chat');
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeConvId || !user || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await supabase.from('messages').insert({ conversation_id: activeConvId, sender_id: user.id, content: text });
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: text.slice(0, 80) }).eq('id', activeConvId);
    setSending(false);
    loadConversations();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const filtered = conversations.filter(c => !search || c.other_user?.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubbleIn  { from{opacity:0;transform:scale(0.94) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes liveFlash { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: 'calc(100vh - 130px)', minHeight: 520 }}>

        <div className="flex h-full rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0A1421' }}>

          {/* ── Sidebar ───────────────────────────────── */}
          <div className={`
            w-full lg:w-[300px] xl:w-[320px] flex flex-col flex-shrink-0
            ${activeConvId && mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}
          `} style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Sidebar header */}
            <div className="px-4 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg,rgba(47,128,237,0.05),transparent)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Messages</h2>
                  {conversations.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.25)' }}>
                      {conversations.length}
                    </span>
                  )}
                </div>
                <button onClick={() => setShowNew(true)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#2F80ED,#1a5fc4)', boxShadow: '0 2px 12px rgba(47,128,237,0.4)' }}>
                  <Plus size={14} className="text-white" />
                </button>
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-azure border-t-transparent animate-spin" />
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.15)' }}>
                    <MessageSquare size={20} style={{ color: '#2F80ED' }} />
                  </div>
                  <p className="text-xs font-bold text-white mb-1">No conversations</p>
                  <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Start messaging people in your network</p>
                  <button onClick={() => setShowNew(true)}
                    className="flex items-center gap-1 text-xs font-semibold transition-colors"
                    style={{ color: '#2F80ED' }}>
                    <Plus size={11} /> Start a conversation
                  </button>
                </div>
              )}

              {filtered.map((conv, i) => {
                const other    = conv.other_user;
                const isActive = conv.id === activeConvId;
                const color    = roleColor(other?.role);
                return (
                  <button key={conv.id}
                    onClick={() => { setActiveConvId(conv.id); setMobileView('chat'); }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all group"
                    style={{
                      background: isActive ? `${color}10` : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <Avatar user={other} size={10} online={i % 2 === 0} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">{other?.full_name ?? 'Unknown'}</span>
                        {conv.last_message_at && (
                          <span className="text-[9px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeLabel(conv.last_message_at)}</span>
                        )}
                      </div>
                      <span className="text-[9px] font-semibold capitalize block mb-0.5" style={{ color }}>{other?.role}</span>
                      {conv.last_message_preview && (
                        <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{conv.last_message_preview}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Chat pane ─────────────────────────────── */}
          <div className={`
            flex-1 flex flex-col min-w-0
            ${mobileView === 'list' && !activeConvId ? 'hidden lg:flex' : 'flex'}
          `}>
            {!activeConvId ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,rgba(47,128,237,0.15),rgba(184,241,53,0.08))', border: '1px solid rgba(47,128,237,0.2)', boxShadow: '0 0 40px rgba(47,128,237,0.1)' }}>
                    <Users size={32} style={{ color: '#2F80ED' }} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#B8F135', boxShadow: '0 0 10px rgba(184,241,53,0.5)' }}>
                    <Zap size={11} className="text-black" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Select a conversation</h3>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)', maxWidth: 220 }}>
                  Choose someone from the left or start a new message to connect.
                </p>
                <button onClick={() => setShowNew(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#2F80ED,#1a5fc4)', boxShadow: '0 4px 20px rgba(47,128,237,0.35)', color: 'white' }}>
                  <Plus size={14} /> New Message
                </button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
                  style={{
                    borderBottom: `1px solid ${accentColor}20`,
                    background: `linear-gradient(135deg,${accentColor}08,rgba(10,20,35,0.95))`,
                  }}>
                  <button onClick={() => { setMobileView('list'); setActiveConvId(null); }}
                    className="lg:hidden p-1.5 rounded-lg mr-1 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <ArrowLeft size={16} />
                  </button>
                  <Avatar user={otherUser} size={9} online />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">{otherUser?.full_name}</p>
                      {otherUser?.is_verified && (
                        <ShieldCheck size={12} style={{ color: '#1FB57A', filter: 'drop-shadow(0 0 4px rgba(31,181,122,0.6))' }} />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1FB57A', boxShadow: '0 0 5px rgba(31,181,122,0.7)', animation: 'liveFlash 2s ease-in-out infinite' }} />
                      <p className="text-[10px] font-semibold" style={{ color: '#1FB57A' }}>Online</p>
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>· {otherUser?.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { icon: <Star size={14} />, label: 'Star' },
                      { icon: <Phone size={14} />, label: 'Call' },
                      { icon: <Video size={14} />, label: 'Video' },
                      { icon: <MoreHorizontal size={14} />, label: 'More' },
                    ].map(btn => (
                      <button key={btn.label}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
                        {btn.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                  {msgLoading && (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                          style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading messages...</span>
                      </div>
                    </div>
                  )}
                  {!msgLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
                        <MessageSquare size={22} style={{ color: accentColor }} />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">Start the conversation</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Say hello to {otherUser?.full_name?.split(' ')[0] ?? 'them'}!
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isMe    = msg.sender_id === user?.id;
                    const prevMsg = messages[i - 1];
                    const isFirst = prevMsg?.sender_id !== msg.sender_id;
                    const msgColor = isMe ? accentColor : roleColor(msg.sender?.role);

                    return (
                      <div key={msg.id}
                        className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                        style={{ animation: `${isMe ? 'slideInRight' : 'slideInLeft'} 0.25s ease both` }}>
                        {/* avatar spacer */}
                        {!isMe && (
                          <div className="flex-shrink-0" style={{ width: 28, height: 28 }}>
                            {isFirst && <Avatar user={msg.sender} size={7} />}
                          </div>
                        )}

                        <div className={`flex flex-col gap-0.5 max-w-[68%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {/* sender name on first in a run */}
                          {!isMe && isFirst && (
                            <span className="text-[9px] font-semibold px-1 mb-0.5" style={{ color: msgColor }}>
                              {msg.sender?.full_name}
                            </span>
                          )}
                          {/* Bubble */}
                          <div className="relative group">
                            <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                              style={{
                                background: isMe
                                  ? `linear-gradient(135deg,${accentColor},${accentColor}cc)`
                                  : 'rgba(255,255,255,0.06)',
                                border: isMe ? 'none' : '1px solid rgba(255,255,255,0.07)',
                                color: isMe ? 'white' : 'rgba(244,248,252,0.85)',
                                borderBottomRightRadius: isMe ? 4 : undefined,
                                borderBottomLeftRadius:  !isMe ? 4 : undefined,
                                boxShadow: isMe ? `0 4px 16px ${accentColor}35` : 'none',
                              }}>
                              {msg.content}
                            </div>
                          </div>
                          <span className="text-[9px] px-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{timeLabel(msg.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <div className="px-4 pb-4 pt-3 flex-shrink-0"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${input.trim() ? `${accentColor}40` : 'rgba(255,255,255,0.08)'}`,
                      transition: 'border-color 0.2s',
                    }}>
                    <button className="flex-shrink-0 transition-colors p-1"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
                      <Smile size={16} />
                    </button>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder={`Message ${otherUser?.full_name?.split(' ')[0] ?? ''}…`}
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: 'white' }}
                    />
                    <button className="flex-shrink-0 transition-colors p-1"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
                      <Paperclip size={15} />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: input.trim() && !sending ? accentColor : 'rgba(255,255,255,0.06)',
                        color: input.trim() && !sending ? (accentColor === '#B8F135' ? '#0C1A2B' : 'white') : 'rgba(255,255,255,0.2)',
                        boxShadow: input.trim() && !sending ? `0 2px 12px ${accentColor}50` : 'none',
                        transform: input.trim() ? 'scale(1)' : 'scale(0.9)',
                      }}>
                      {sending
                        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        : <Send size={13} style={{ transform: 'translateX(1px)' }} />
                      }
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showNew && <NewConversationModal onClose={() => setShowNew(false)} onSelect={openConvWith} />}
    </>
  );
}
