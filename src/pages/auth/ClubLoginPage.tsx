import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Building2, ShieldCheck,
  Users, Trophy, Target, BarChart3, Zap, Check, ChevronLeft,
  TrendingUp, MessageSquare, Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── club feature highlights ──────────────────────────────── */
const FEATURES = [
  { icon: Target,      label: 'Post & manage open trials',          color: '#F5A623' },
  { icon: Users,       label: 'AI-ranked applicant shortlisting',   color: '#2F80ED' },
  { icon: BarChart3,   label: 'Full squad analytics & tracking',    color: '#1FB57A' },
  { icon: ShieldCheck, label: 'Verified player credentials',        color: '#B8F135' },
  { icon: MessageSquare, label: 'Direct messaging with athletes',  color: '#E056A0' },
  { icon: Zap,         label: 'AI transfer recommendations',        color: '#F5A623' },
];

const STATS = [
  { value: '850+', label: 'Clubs on platform', color: '#F5A623' },
  { value: '12K+', label: 'Verified athletes',  color: '#2F80ED' },
  { value: '98%',  label: 'Satisfaction',        color: '#1FB57A' },
  { value: '24',   label: 'Countries',            color: '#B8F135' },
];

const TICKER = [
  'Al Wasl SC · UAE Champions 2024',
  'Al Hilal · 6 trial positions open',
  'Wydad AC · 14 verified signings',
  'AI Match Score · 97% placement rate',
  'Verified Medical Records · Instant',
  'Scout Network · 340+ Clubs Active',
];

/* ─── demo clubs ─────────────────────────────────────────────── */
const DEMO_CLUBS = [
  { label: 'Al Wasl SC',   email: 'club@aceaix.demo',  password: 'demo123456', color: '#F5A623', initials: 'AW' },
  { label: 'Al Ain FC',    email: 'club2@aceaix.demo', password: 'demo123456', color: '#2F80ED', initials: 'AA' },
  { label: 'Wydad AC',     email: 'club3@aceaix.demo', password: 'demo123456', color: '#EF5350', initials: 'WY' },
];

export default function ClubLoginPage() {
  const [email,        setEmail]        = useState('club@aceaix.demo');
  const [password,     setPassword]     = useState('demo123456');
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [redirecting,  setRedirecting]  = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [focusEmail,   setFocusEmail]   = useState(false);
  const [focusPass,    setFocusPass]    = useState(false);

  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  useEffect(() => {
    if (!redirecting || !user || !profile) return;
    if (profile.role === 'club') navigate('/club/dashboard');
    else navigate('/dashboard');
  }, [redirecting, user, profile, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) { setError(err.message || 'Invalid login credentials'); setLoading(false); return; }
    setRedirecting(true);
  }

  const ACCENT = '#F5A623';

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#080F1A' }}>
      <style>{`
        @keyframes floatOrb    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,28px) scale(1.08)} }
        @keyframes floatOrbAlt { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-18px,-20px) scale(1.06)} }
        @keyframes ticker      { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes slideUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight{ from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes gradShift   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes liveFlash   { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes pulseGlow   {
          0%,100%{filter:drop-shadow(0 0 10px rgba(245,166,35,0.5)) drop-shadow(0 0 20px rgba(245,166,35,0.2))}
          50%   {filter:drop-shadow(0 0 18px rgba(245,166,35,0.8)) drop-shadow(0 0 36px rgba(245,166,35,0.35))}
        }
      `}</style>

      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col relative w-[52%] xl:w-[56%] overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0A1420 0%,#0D1B2E 50%,#0A1810 100%)' }}>

        {/* orbs */}
        <div className="absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(245,166,35,0.15) 0%,transparent 70%)', animation: 'floatOrb 14s ease-in-out infinite' }} />
        <div className="absolute bottom-[-80px] right-[-60px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(31,181,122,0.10) 0%,transparent 70%)', animation: 'floatOrbAlt 20s ease-in-out infinite' }} />
        <div className="absolute top-[35%] right-[8%] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(47,128,237,0.08) 0%,transparent 70%)', animation: 'floatOrb 26s ease-in-out infinite reverse' }} />
        {/* grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-10">
          {/* Logo */}
          <div style={{ animation: mounted ? 'slideInLeft 0.6s cubic-bezier(0.19,1,0.22,1) both' : 'none', opacity: mounted ? undefined : 0 }}>
            <Link to="/" className="inline-flex items-center" style={{ gap: 6 }}>
              <img src="/AceAiX_logo_transparent%20copy%20copy%20copy.png" alt="AceAiX"
                style={{ width: 96, height: 96, objectFit: 'contain', animation: 'pulseGlow 3s ease-in-out infinite' }} />
              <img src="/AceAiX_logo_transparent2%20copy.png" alt="AceAiX"
                style={{ height: 46, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(245,166,35,0.4))' }} />
            </Link>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div style={{ animation: mounted ? 'slideInLeft 0.7s 0.15s cubic-bezier(0.19,1,0.22,1) both' : 'none', opacity: mounted ? undefined : 0 }}>
              {/* live badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623', animation: 'liveFlash 2s infinite' }} />
                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#F5A623' }}>Club Portal</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
                Your squad,<br />
                <span style={{
                  background: 'linear-gradient(90deg,#F5A623,#B8F135,#F5A623)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradShift 4s ease infinite',
                }}>
                  supercharged.
                </span>
              </h1>
              <p className="text-white/45 text-base leading-relaxed mb-8">
                Post trials, scout AI-ranked talent, manage your squad pipeline and connect directly with verified athletes across MENA and beyond.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-2.5 mb-8"
              style={{ animation: mounted ? 'slideInLeft 0.7s 0.3s cubic-bezier(0.19,1,0.22,1) both' : 'none', opacity: mounted ? undefined : 0 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: `${f.color}08`, border: `1px solid ${f.color}15` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}15`, color: f.color }}>
                    <f.icon size={13} />
                  </div>
                  <span className="text-[11px] font-semibold text-white/65 leading-tight">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3"
              style={{ animation: mounted ? 'slideInLeft 0.7s 0.45s cubic-bezier(0.19,1,0.22,1) both' : 'none', opacity: mounted ? undefined : 0 }}>
              {STATS.map(s => (
                <div key={s.label} className="rounded-2xl p-3 text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                  <div className="font-black text-base leading-tight" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker */}
          <div className="overflow-hidden pt-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', animation: mounted ? 'slideInLeft 0.6s 0.8s both' : 'none', opacity: mounted ? undefined : 0 }}>
            <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'ticker 28s linear infinite' }}>
              {[...TICKER, ...TICKER].map((item, i) => (
                <span key={i} className="text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(245,166,35,0.4)' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
        {/* reactive bg glow */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: `radial-gradient(ellipse at 60% 40%, rgba(245,166,35,0.07) 0%, transparent 60%)` }} />

        <div className="relative w-full max-w-[420px]"
          style={{ animation: mounted ? 'slideInRight 0.65s 0.1s cubic-bezier(0.19,1,0.22,1) both' : 'none', opacity: mounted ? undefined : 0 }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center mb-8" style={{ gap: 6 }}>
            <img src="/AceAiX_logo_transparent%20copy%20copy%20copy.png" alt="AceAiX"
              style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(245,166,35,0.5))' }} />
            <img src="/AceAiX_logo_transparent2%20copy.png" alt="AceAiX"
              style={{ height: 38, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(245,166,35,0.4))' }} />
          </div>

          {/* Back link */}
          <Link to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            <ChevronLeft size={13} /> All login options
          </Link>

          {/* Portal identity card */}
          <div className="flex items-center gap-4 mb-7 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg,rgba(245,166,35,0.10),rgba(245,166,35,0.04))',
              border: '1px solid rgba(245,166,35,0.25)',
              boxShadow: '0 0 32px rgba(245,166,35,0.08)',
            }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.30)', boxShadow: '0 0 20px rgba(245,166,35,0.20)' }}>
              <Building2 size={22} style={{ color: '#F5A623' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-black text-white">Club Portal</h2>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)' }}>
                  <ShieldCheck size={10} style={{ color: '#F5A623' }} />
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#F5A623' }}>Verified</span>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Squad management & talent acquisition</p>
            </div>
          </div>

          {/* Form heading */}
          <h1 className="text-2xl font-black text-white mb-1.5">Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>Sign in to your club's dashboard</p>

          {/* Demo accounts */}
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-wider mb-2.5 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Quick demo access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CLUBS.map(acc => (
                <button key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                  className="rounded-xl py-2.5 px-2 text-xs font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = `${acc.color}12`; el.style.borderColor = `${acc.color}35`; el.style.color = acc.color; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.color = 'rgba(255,255,255,0.4)'; }}>
                  <div className="w-7 h-7 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-[10px] font-black"
                    style={{ background: `${acc.color}18`, color: acc.color, border: `1px solid ${acc.color}25` }}>
                    {acc.initials}
                  </div>
                  <p className="text-[10px] truncate">{acc.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>or sign in manually</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Login form */}
          <div className="rounded-3xl p-6 mb-5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>Email address</label>
                <div className="relative rounded-xl transition-all duration-200"
                  style={{ boxShadow: focusEmail ? `0 0 0 2px ${ACCENT}50` : '0 0 0 1px rgba(255,255,255,0.09)' }}>
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: focusEmail ? ACCENT : 'rgba(255,255,255,0.22)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)}
                    placeholder="club@example.com"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                    required />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Password</label>
                  <button type="button" className="text-[11px] font-semibold transition-colors"
                    style={{ color: `${ACCENT}90` }}
                    onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
                    onMouseLeave={e => (e.currentTarget.style.color = `${ACCENT}90`)}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative rounded-xl transition-all duration-200"
                  style={{ boxShadow: focusPass ? `0 0 0 2px ${ACCENT}50` : '0 0 0 1px rgba(255,255,255,0.09)' }}>
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: focusPass ? ACCENT : 'rgba(255,255,255,0.22)' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)}
                    placeholder="••••••••"
                    className="w-full rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                    required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: showPass ? ACCENT : 'rgba(255,255,255,0.22)' }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                  style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.25)', color: '#EF5350', animation: 'slideUp 0.3s both' }}>
                  <span className="mt-0.5 flex-shrink-0">!</span>{error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading || redirecting}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-black transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: loading || redirecting
                    ? 'rgba(245,166,35,0.6)'
                    : 'linear-gradient(135deg,#F5A623,#e09210)',
                  color: '#0C1A2B',
                  boxShadow: loading || redirecting ? 'none' : '0 4px 24px rgba(245,166,35,0.45)',
                }}>
                {loading || redirecting ? (
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                ) : (
                  <>
                    <Building2 size={15} />
                    Sign In to Club Portal
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="space-y-2.5 text-center">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Not a member yet?{' '}
              <Link to="/auth/register?role=club" className="font-bold transition-colors"
                style={{ color: '#F5A623' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Register your club free
              </Link>
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Are you a scout?{' '}
              <Link to="/auth/login" className="font-semibold" style={{ color: 'rgba(47,128,237,0.7)' }}>
                Use recruiter login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
