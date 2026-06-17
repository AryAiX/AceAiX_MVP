import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import { Search, Bot, Send, ShieldCheck, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ATHLETES = [
  { id: 'a1', name: 'Khalid Al-Rashidi', position: 'Striker', sport: 'Football', club: 'Al Ain FC', score: 9.2, verified: true, image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'a1', name: 'Tariq Hassan', position: 'Midfielder', sport: 'Football', club: 'Al Hilal', score: 8.8, verified: true, image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'a1', name: 'Noura Al-Mansoori', position: 'Sprinter', sport: 'Athletics', club: 'UAE National', score: 9.0, verified: true, image: 'https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'a1', name: 'Rayan Benali', position: 'Goalkeeper', sport: 'Football', club: 'Wydad AC', score: 8.7, verified: true, image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'a1', name: 'Amir Karimi', position: 'Center-Back', sport: 'Football', club: 'Esteghlal FC', score: 8.5, verified: true, image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'a1', name: 'Yusuf Al-Kaabi', position: 'Winger', sport: 'Football', club: 'Shabab FC', score: 8.3, verified: false, image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const AI_RESPONSES: Record<string, string> = {
  default: 'I found 6 athletes matching your description. Results are ranked by AI fit score, verified metrics, and recency. Would you like to filter by position, age, or nationality?',
  striker: 'Found 2 strikers in the UAE market. Khalid Al-Rashidi leads with a 9.2 score — 18 goals this season with full medical verification. Want me to show their full profiles?',
  goalkeeper: 'Rayan Benali is your top match — 87% rating, professional level, verified medical clearance active. Currently at Wydad AC. Shall I send a contact request?',
};

function DiscoverContent() {
  const location = useLocation();
  const portalBase = location.pathname.startsWith('/recruiter/') ? '/recruiter'
    : location.pathname.startsWith('/athlete/') ? '/athlete'
    : '';
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I can help you find athletes. Describe what you\'re looking for — sport, position, age, location, or any specific attributes.' },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    const userQ = query;
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userQ }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const lower = userQ.toLowerCase();
    const resp = lower.includes('striker') ? AI_RESPONSES.striker : lower.includes('goalkeeper') ? AI_RESPONSES.goalkeeper : AI_RESPONSES.default;
    setMessages((prev) => [...prev, { role: 'ai', text: resp }]);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">AI Talent Discovery</h1>
        <p className="text-slate-400 text-lg">Describe who you're looking for. Our AI searches verified profiles and surfaces the best matches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Chat */}
        <div className="card p-0 flex flex-col" style={{ height: '500px' }}>
          <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AceAiX Talent AI</p>
              <p className="text-xs text-slate-500">No account required</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'ai' ? 'bg-blue-600/20 border border-blue-600/30' : 'bg-slate-700'}`}>
                  {m.role === 'ai' ? <Bot size={12} className="text-blue-400" /> : <Search size={12} className="text-slate-400" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'ai' ? 'bg-navy-700 border border-slate-700/50 rounded-tl-sm' : 'bg-blue-600 rounded-tr-sm'}`}>
                  <p className="text-sm text-slate-200">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center">
                  <Bot size={12} className="text-blue-400" />
                </div>
                <div className="bg-navy-700 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Describe the athlete you're looking for..."
                className="input-field flex-1 text-sm"
              />
              <button onClick={handleSearch} disabled={!query.trim()} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors">
                <Send size={16} className="text-white" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">To contact athletes, <Link to="/auth/register" className="text-blue-400 hover:underline">create a free account</Link></p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <p className="text-sm text-slate-400 font-medium">Featured Athletes</p>
          {ATHLETES.map((a) => (
            <Link key={a.name} to={`${portalBase}/athletes/${a.id}`} className="flex items-center gap-4 p-4 bg-navy-700 border border-slate-700/50 rounded-xl hover:border-blue-600/40 transition-all cursor-pointer">
              <img src={a.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                  {a.verified && <ShieldCheck size={12} className="text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400">{a.position} · {a.sport} · {a.club}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{a.score}</p>
                <p className="text-xs text-slate-500">AI Score</p>
              </div>
              <span className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">View Profile</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage({ hideHeader = false }: { hideHeader?: boolean }) {
  if (hideHeader) return <DiscoverContent />;
  return (
    <div className="min-h-screen bg-navy-800">
      <PublicHeader />
      <DiscoverContent />
    </div>
  );
}
