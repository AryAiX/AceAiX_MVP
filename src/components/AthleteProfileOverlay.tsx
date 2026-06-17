import React, { useEffect, useState } from 'react';
import { X, UserPlus, Award, ShieldCheck, Activity, Heart, MapPin, ChevronRight, Star, Zap } from 'lucide-react';
import { AthleteCardData } from './ui/AthleteCard';
import ScoreRing from './ui/ScoreRing';
import VerifiedBadge from './ui/VerifiedBadge';
import StatusChip from './ui/StatusChip';

const RADAR_ATTRS = [
  { label: 'Speed',     value: 88 },
  { label: 'Strength',  value: 75 },
  { label: 'Agility',   value: 91 },
  { label: 'Endurance', value: 82 },
  { label: 'Vision',    value: 79 },
  { label: 'Technique', value: 93 },
];

function RadarChart({ size = 200 }: { size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = RADAR_ATTRS.length;
  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = RADAR_ATTRS.map((d, i) => {
    const a = angle(i);
    const v = (d.value / 100) * r;
    return `${cx + v * Math.cos(a)},${cy + v * Math.sin(a)}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map(f => (
        <polygon key={f}
          points={RADAR_ATTRS.map((_, i) => {
            const a = angle(i);
            return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`;
          }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1}
        />
      ))}
      {RADAR_ATTRS.map((_, i) => (
        <line key={i} x1={cx} y1={cy}
          x2={cx + r * Math.cos(angle(i))} y2={cy + r * Math.sin(angle(i))}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1}
        />
      ))}
      <polygon
        points={dataPoints}
        fill="rgba(47,128,237,0.2)"
        stroke="#2F80ED"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 6px rgba(47,128,237,0.4))' }}
      />
      {RADAR_ATTRS.map((d, i) => {
        const a = angle(i);
        const dist = r + 20;
        return (
          <text key={d.label} x={cx + dist * Math.cos(a)} y={cy + dist * Math.sin(a)}
            fill="#7C8DA6" fontSize={9} textAnchor="middle" dominantBaseline="middle">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

interface AthleteProfileOverlayProps {
  athlete: AthleteCardData | null;
  layoutId?: string;
  onClose: () => void;
}

export default function AthleteProfileOverlay({ athlete, onClose }: AthleteProfileOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (athlete) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      setTimeout(() => { document.body.style.overflow = ''; }, 300);
    }
    return () => { document.body.style.overflow = ''; };
  }, [athlete]);

  if (!athlete && !visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: athlete ? 'all' : 'none',
      }}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full md:w-[680px] max-h-[90vh] overflow-y-auto rounded-3xl z-10"
        style={{
          background: 'rgba(14,22,35,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.92)',
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative h-72 overflow-hidden rounded-t-3xl">
          <img src={athlete?.image} alt={athlete?.name} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,22,35,0.95) 0%, rgba(14,22,35,0.4) 60%, transparent 100%)' }} />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ink/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-display font-bold text-white leading-tight">{athlete?.name}</h2>
            <div className="energy-line mt-2" style={{ maxWidth: 200 }} />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <VerifiedBadge animate={!!athlete} />
              <StatusChip status="cleared" />
              {athlete?.club && (
                <span className="badge-muted flex items-center gap-1">
                  <MapPin size={9} /> {athlete.club}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score rings */}
          <div className="flex items-center justify-around">
            <ScoreRing value={athlete?.score !== undefined ? Math.round(athlete.score * 10) : 87} max={100} size={110} label="Performance" sublabel="/100" isTopTier={(athlete?.score ?? 0) >= 9} />
            <div className="flex flex-col items-center gap-1">
              <div className="text-4xl font-display font-bold text-volt tabular"
                style={{ filter: 'drop-shadow(0 0 12px rgba(184,241,53,0.6))' }}>
                {athlete?.score ?? '—'}
              </div>
              <div className="text-xs text-muted">AI Score</div>
              {(athlete?.score ?? 0) >= 9 && (
                <div className="badge-volt mt-1 flex items-center gap-1">
                  <Zap size={10} /> Elite
                </div>
              )}
            </div>
            <ScoreRing value={91} max={100} size={110} label="Visibility" sublabel="/100" />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Endorsements', value: '48',  icon: <Award size={14} />, color: '#F5A623' },
              { label: 'Scout Views',  value: '312', icon: <Activity size={14} />, color: '#2F80ED' },
              { label: 'Medical Clr', value: '100%', icon: <Heart size={14} />, color: '#1FB57A' },
            ].map(s => (
              <div key={s.label} className="card-glass p-3 text-center">
                <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                <div className="text-lg font-display font-bold text-white tabular">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Radar */}
          <div className="card-glass p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Attribute Radar</p>
            <div className="flex justify-center">
              <RadarChart size={220} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">About</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {athlete?.position} specializing in {athlete?.sport}.{athlete?.age ? ` Age ${athlete.age}.` : ''}{athlete?.club ? ` Currently with ${athlete.club}.` : ''} All medical records verified by an accredited AceAiX partner clinic.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 btn-volt justify-center gap-2 flex items-center">
              <Star size={15} /> Endorse
            </button>
            <button className="flex-1 btn-outline justify-center gap-2 flex items-center">
              <UserPlus size={15} /> Follow
            </button>
            <button className="btn-ghost px-3">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
