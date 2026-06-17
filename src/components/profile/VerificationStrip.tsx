import { useEffect, useRef } from 'react';
import { ShieldCheck, Activity, Stethoscope, CheckCircle2 } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, label: 'Identity Verified', sub: 'Emirates ID • Passport', color: 'emerald' as const },
  { icon: Activity, label: 'Performance Data', sub: 'Wyscout • InStat Feed', color: 'azure' as const },
  { icon: Stethoscope, label: 'Medical Clearance', sub: 'Al Wasl Medical · Jan 2025', color: 'emerald' as const },
];

const COLORS = {
  emerald: { bg: 'bg-emerald/10 border-emerald/25', icon: 'text-emerald', dot: 'bg-emerald', label: 'text-emerald' },
  azure:   { bg: 'bg-azure/10 border-azure/25',     icon: 'text-azure',   dot: 'bg-azure',   label: 'text-azure'   },
};

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      const obs = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        el.style.transition = `opacity 0.5s cubic-bezier(0.19,1,0.22,1) ${delay}s, transform 0.5s cubic-bezier(0.19,1,0.22,1) ${delay}s`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, { threshold: 0.3 });
      obs.observe(el);
    });
    return () => cancelAnimationFrame(raf);
  }, [delay]);
  return ref;
}

function BadgeItem({ b, index }: { b: typeof BADGES[0]; index: number }) {
  const ref = useFadeIn(index * 0.08);
  const c = COLORS[b.color];
  const Icon = b.icon;
  return (
    <div ref={ref} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${c.bg}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon size={16} className={c.icon} />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-bold ${c.label}`}>{b.label}</p>
        <p className="text-[10px] text-muted truncate mt-0.5">{b.sub}</p>
      </div>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto ${c.dot}`}
        style={{ boxShadow: `0 0 6px ${b.color === 'emerald' ? 'rgba(31,181,122,0.8)' : 'rgba(47,128,237,0.8)'}` }} />
    </div>
  );
}

export default function VerificationStrip() {
  const wrapRef = useFadeIn(0);
  return (
    <div ref={wrapRef} className="card-glass px-5 py-4" style={{ borderColor: 'rgba(31,181,122,0.2)', boxShadow: '0 0 32px rgba(31,181,122,0.06)' }}>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 size={14} className="text-emerald" />
        <span className="text-xs font-bold text-emerald uppercase tracking-widest">AceAiX Verified Athlete</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BADGES.map((b, i) => <BadgeItem key={b.label} b={b} index={i} />)}
      </div>
    </div>
  );
}
