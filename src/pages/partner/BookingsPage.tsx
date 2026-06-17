import { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { value, ref };
}

const BOOKINGS = [
  { id: 'b1', athlete: 'Khalid Al-Rashidi', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80', test: 'Physical Assessment', date: '17 Jun 2026', fee: 1800, commission: 270, payout: 'paid'    },
  { id: 'b2', athlete: 'Yusuf Al-Kaabi',    avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=80', test: 'Medical Clearance',    date: '16 Jun 2026', fee: 2200, commission: 330, payout: 'pending' },
  { id: 'b3', athlete: 'Omar Al-Farsi',      avatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=80',  test: 'Cardiac Screening',    date: '15 Jun 2026', fee: 3500, commission: 525, payout: 'pending' },
  { id: 'b4', athlete: 'Sara Al-Hashemi',    avatar: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=80', test: 'Blood / Lab',          date: '14 Jun 2026', fee: 850,  commission: 127, payout: 'paid'    },
  { id: 'b5', athlete: 'James Crawford',     avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=80',  test: 'MRI / Imaging',        date: '13 Jun 2026', fee: 4200, commission: 630, payout: 'paid'    },
  { id: 'b6', athlete: 'Fabrizio Moretti',   avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=80', test: 'Drug Test',            date: '12 Jun 2026', fee: 1100, commission: 165, payout: 'processing' },
  { id: 'b7', athlete: 'Karim Al-Hassan',    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80', test: 'Physical Assessment',  date: '10 Jun 2026', fee: 1800, commission: 270, payout: 'paid'    },
  { id: 'b8', athlete: 'Rashid Salem',        avatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=80', test: 'Blood / Lab',          date: '08 Jun 2026', fee: 850,  commission: 127, payout: 'paid'    },
];

const PAYOUT_META: Record<string, { label: string; color: string; bg: string }> = {
  paid:       { label: 'Paid',       color: '#1FB57A', bg: 'rgba(31,181,122,0.1)'  },
  pending:    { label: 'Pending',    color: '#F5A623', bg: 'rgba(245,166,35,0.1)' },
  processing: { label: 'Processing', color: '#2F80ED', bg: 'rgba(47,128,237,0.1)' },
};

const PAYOUT_HISTORY = [
  { date: '01 Jun 2026', amount: 3220, ref: 'PAY-2026-0044', status: 'Paid' },
  { date: '01 May 2026', amount: 2870, ref: 'PAY-2026-0031', status: 'Paid' },
  { date: '01 Apr 2026', amount: 4150, ref: 'PAY-2026-0018', status: 'Paid' },
];

function SummaryTile({ label, target, prefix = '', suffix = '', color, icon: Icon, bg }: { label: string; target: number; prefix?: string; suffix?: string; color: string; icon: React.ElementType; bg: string }) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="rounded-2xl p-5"
      style={{ background: '#0D1C2E', border: `1px solid ${color}22` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-black text-white tabular-nums">{prefix}{value.toLocaleString()}{suffix}</p>
      <p className="text-xs mt-1" style={{ color: '#7C8DA6' }}>{label}</p>
    </div>
  );
}

export default function BookingsPage() {
  const totalFees       = BOOKINGS.reduce((s, b) => s + b.fee, 0);
  const totalComm       = BOOKINGS.reduce((s, b) => s + b.commission, 0);
  const pendingComm     = BOOKINGS.filter(b => b.payout === 'pending').reduce((s, b) => s + b.commission, 0);

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <h1 className="text-xl font-black text-white">Bookings & Commission</h1>
        <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>Platform-booked tests · AED</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile label="Tests This Month" target={BOOKINGS.length} color="#2F80ED" bg="rgba(47,128,237,0.1)" icon={CheckCircle2} />
        <SummaryTile label="Total Fees (AED)" target={totalFees} prefix="AED " color="#1FB57A" bg="rgba(31,181,122,0.1)" icon={DollarSign} />
        <SummaryTile label="Commission Earned" target={totalComm} prefix="AED " color="#1FB57A" bg="rgba(31,181,122,0.1)" icon={TrendingUp} />
        <SummaryTile label="Pending Payout" target={pendingComm} prefix="AED " color="#F5A623" bg="rgba(245,166,35,0.1)" icon={Clock} />
      </div>

      {/* Bookings table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold text-white">Bookings</p>
          {pendingComm > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', color: '#F5A623' }}>
              <AlertTriangle size={10} /> AED {pendingComm.toLocaleString()} pending
            </span>
          )}
        </div>

        {/* Table header */}
        <div className="hidden sm:grid px-5 py-2.5 text-[10px] font-black uppercase tracking-wider"
          style={{
            gridTemplateColumns: '1fr auto auto auto auto',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: '#7C8DA6',
          }}>
          <span>Athlete</span>
          <span className="w-36 text-left">Test</span>
          <span className="w-20 text-right">Fee (AED)</span>
          <span className="w-24 text-right">Commission</span>
          <span className="w-24 text-right">Payout</span>
        </div>

        {BOOKINGS.map((b, i) => {
          const pm = PAYOUT_META[b.payout];
          return (
            <div key={b.id}
              className="flex sm:grid items-center gap-3 px-5 py-3.5"
              style={{
                gridTemplateColumns: '1fr auto auto auto auto',
                borderBottom: i < BOOKINGS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`,
              }}>
              <div className="flex items-center gap-3 min-w-0">
                <img src={b.avatar} alt={b.athlete} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{b.athlete}</p>
                  <p className="text-[10px] sm:hidden" style={{ color: '#7C8DA6' }}>{b.test} · {b.date}</p>
                </div>
              </div>
              <div className="w-36 hidden sm:block">
                <p className="text-[11px]" style={{ color: 'rgba(244,248,252,0.6)' }}>{b.test}</p>
                <p className="text-[10px]" style={{ color: '#7C8DA6' }}>{b.date}</p>
              </div>
              <p className="w-20 text-right text-xs font-semibold text-white hidden sm:block">{b.fee.toLocaleString()}</p>
              <p className="w-24 text-right text-xs font-semibold hidden sm:block" style={{ color: '#1FB57A' }}>{b.commission.toLocaleString()}</p>
              <div className="w-24 flex justify-end flex-shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: pm.bg, color: pm.color, border: `1px solid ${pm.color}25` }}>
                  {pm.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payout history */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold text-white">Payout History</p>
        </div>
        {PAYOUT_HISTORY.map((p, i) => (
          <div key={p.ref} className="flex items-center gap-4 px-5 py-3.5"
            style={{ borderBottom: i < PAYOUT_HISTORY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(31,181,122,0.1)', border: '1px solid rgba(31,181,122,0.2)' }}>
              <CheckCircle2 size={14} style={{ color: '#1FB57A' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">AED {p.amount.toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: '#7C8DA6' }}>{p.date} · Ref: {p.ref}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(31,181,122,0.1)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.2)' }}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
