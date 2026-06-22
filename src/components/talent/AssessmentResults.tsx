import React, { useState, useEffect, useRef } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Trophy, Zap, Eye, Lock, Users, ChevronDown, Star } from 'lucide-react';
import SportifyBadge from './SportifyBadge';

export interface SportRec {
  sport: string;
  potential_score: number;
  percentile: number;
  rationale: string;
}

export interface PhysicalMetrics {
  sprint_ms?: number;
  agility_s?: number;
  jump_cm?: number;
  reaction_ms?: number;
  endurance_vo2?: number;
}

interface AssessmentResultsProps {
  sportRecommendations: SportRec[];
  physicalMetrics: PhysicalMetrics;
  overallScore: number;
  takenAt: string;
  provenanceHash?: string;
  visibility: 'private' | 'scouts' | 'public';
  onVisibilityChange?: (v: 'private' | 'scouts' | 'public') => void;
  modality: 'camera' | 'in_person';
}

function useCountUp(target: number, duration = 1100) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function ScoreBar({ score, color, delay }: { score: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
          transition: `width 1.1s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

function PhysicMetricTile({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  const counted = useCountUp(value);
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-lg font-bold tabular-nums leading-none" style={{ color }}>
        {counted}<span className="text-xs font-semibold ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{unit}</span>
      </p>
      <p className="text-[10px] mt-1 font-medium" style={{ color: '#9DB0C6' }}>{label}</p>
    </div>
  );
}

const VISIBILITY_OPTIONS: { value: 'private' | 'scouts' | 'public'; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'private', label: 'Private',       icon: Lock,  color: '#9DB0C6' },
  { value: 'scouts',  label: 'Visible to scouts', icon: Users, color: '#2F80ED' },
  { value: 'public',  label: 'Public profile', icon: Eye,   color: '#1FB57A' },
];

export default function AssessmentResults({
  sportRecommendations,
  physicalMetrics,
  overallScore,
  takenAt,
  provenanceHash,
  visibility,
  onVisibilityChange,
  modality,
}: AssessmentResultsProps) {
  const topSport = sportRecommendations[0];

  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [visDropdown, setVisDropdown]     = useState(false);
  const overallCounted = useCountUp(overallScore);
  const topScoreCounted = useCountUp(topSport?.potential_score ?? 0);

  const radarData = [
    { metric: 'Sprint',    value: physicalMetrics.sprint_ms   ? Math.round(100 - (physicalMetrics.sprint_ms - 4000) / 30) : 0 },
    { metric: 'Agility',   value: physicalMetrics.agility_s   ? Math.round(100 - (physicalMetrics.agility_s - 7) * 10)    : 0 },
    { metric: 'Jump',      value: physicalMetrics.jump_cm     ? Math.round((physicalMetrics.jump_cm / 90) * 100)           : 0 },
    { metric: 'Reaction',  value: physicalMetrics.reaction_ms ? Math.round(100 - (physicalMetrics.reaction_ms - 150) / 2)  : 0 },
    { metric: 'Endurance', value: physicalMetrics.endurance_vo2 ? Math.round((physicalMetrics.endurance_vo2 / 70) * 100)   : 0 },
  ];

  const currentVis = VISIBILITY_OPTIONS.find(o => o.value === visibility) ?? VISIBILITY_OPTIONS[0];

  return (
    <>
      <style>{`
        @keyframes resultsFadeIn {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes topSportGlow {
          0%,100% { box-shadow: 0 0 20px rgba(184,241,53,0.15); }
          50%     { box-shadow: 0 0 40px rgba(184,241,53,0.30); }
        }
      `}</style>

      <div className="space-y-5" style={{ animation: 'resultsFadeIn 0.5s ease both' }}>

        {/* Verified header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Talent Assessment Results</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9DB0C6' }}>
              {modality === 'camera' ? 'Camera test' : 'In-person assessment'} · {new Date(takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <SportifyBadge
            date={new Date(takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            provenanceHash={provenanceHash}
            size="md"
          />
        </div>

        {/* Overall score + top sport */}
        {topSport && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(184,241,53,0.1) 0%, rgba(184,241,53,0.04) 100%)',
              border: '1px solid rgba(184,241,53,0.25)',
              animation: 'topSportGlow 3s ease-in-out infinite',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(184,241,53,0.12), transparent 70%)', transform: 'translate(30%, -30%)' }} />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} color="#B8F135" fill="#B8F135" />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#B8F135' }}>Top sport match</span>
                </div>
                <h3 className="text-2xl font-bold text-white leading-none">{topSport.sport}</h3>
                <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{topSport.rationale}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-4xl font-bold leading-none tabular-nums" style={{ color: '#B8F135' }}>
                  {topScoreCounted}
                </p>
                <p className="text-[10px] mt-1 font-semibold uppercase tracking-wider" style={{ color: 'rgba(184,241,53,0.7)' }}>potential</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#9DB0C6' }}>top {100 - topSport.percentile}th %ile</p>
              </div>
            </div>
          </div>
        )}

        {/* Sport recommendations list */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#0A1828', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Trophy size={13} color="#F5A623" />
              <span className="text-xs font-bold text-white">Sport potential ranking</span>
            </div>
            <span className="text-[10px]" style={{ color: '#9DB0C6' }}>{sportRecommendations.length} sports analysed</span>
          </div>

          {sportRecommendations.map((rec, i) => {
            const isTop     = i === 0;
            const isExpanded = expandedSport === rec.sport;
            const color     = isTop ? '#B8F135' : i === 1 ? '#2F80ED' : i === 2 ? '#1FB57A' : '#9DB0C6';
            return (
              <div
                key={rec.sport}
                style={{
                  background: isTop ? 'rgba(184,241,53,0.04)' : i % 2 === 0 ? '#0D1A2B' : 'transparent',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  borderLeft: `3px solid ${isTop ? '#B8F135' : 'transparent'}`,
                  animation: `resultsFadeIn 0.4s ease ${i * 0.07}s both`,
                }}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpandedSport(isExpanded ? null : rec.sport)}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: `${color}20`, color }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-white">{rec.sport}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color }}>{rec.potential_score}</span>
                    </div>
                    <ScoreBar score={rec.potential_score} color={color} delay={i * 80} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>
                      top {100 - rec.percentile}%
                    </span>
                    <ChevronDown size={11} style={{ color: '#9DB0C6', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3">
                    <p className="text-xs leading-relaxed pl-8" style={{ color: '#9DB0C6' }}>{rec.rationale}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Physical metrics */}
        <div className="rounded-2xl p-5" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={13} color="#2F80ED" />
            <span className="text-xs font-bold text-white">Physical metrics</span>
            <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full" style={{ background: 'rgba(31,181,122,0.12)', color: '#1FB57A', border: '1px solid rgba(31,181,122,0.25)' }}>
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {physicalMetrics.sprint_ms    && <PhysicMetricTile label="Sprint"    value={physicalMetrics.sprint_ms}    unit="ms"     color="#2F80ED" />}
            {physicalMetrics.agility_s    && <PhysicMetricTile label="Agility"   value={Math.round(physicalMetrics.agility_s * 10)} unit="×0.1s" color="#F5A623" />}
            {physicalMetrics.jump_cm      && <PhysicMetricTile label="Jump"      value={physicalMetrics.jump_cm}      unit="cm"     color="#B8F135" />}
            {physicalMetrics.reaction_ms  && <PhysicMetricTile label="Reaction"  value={physicalMetrics.reaction_ms}  unit="ms"     color="#1FB57A" />}
            {physicalMetrics.endurance_vo2 && <PhysicMetricTile label="VO₂ Max" value={physicalMetrics.endurance_vo2} unit="ml/kg" color="#EF5350" />}
          </div>

          {/* Radar chart */}
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9DB0C6', fontSize: 10 }} />
                <Radar
                  name="Athlete"
                  dataKey="value"
                  stroke="#2F80ED"
                  fill="#2F80ED"
                  fillOpacity={0.18}
                  strokeWidth={1.5}
                />
                <Tooltip
                  contentStyle={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#2F80ED' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visibility control */}
        {onVisibilityChange && (
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: '#0F1E32', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p className="text-xs font-bold text-white">Who can see these results</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#9DB0C6' }}>You control visibility — values are never editable</p>
              </div>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: `${currentVis.color}18`, color: currentVis.color, border: `1px solid ${currentVis.color}30` }}
                onClick={() => setVisDropdown(v => !v)}
              >
                <currentVis.icon size={11} />
                {currentVis.label}
                <ChevronDown size={10} style={{ transform: visDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>
            </div>
            {visDropdown && (
              <div className="absolute right-0 top-14 z-20 w-52 rounded-xl overflow-hidden"
                style={{ background: '#0A1828', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', animation: 'resultsFadeIn 0.15s ease' }}>
                {VISIBILITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-left transition-colors hover:bg-white/[0.05]"
                    style={{ color: opt.value === visibility ? opt.color : '#9DB0C6' }}
                    onClick={() => { onVisibilityChange(opt.value); setVisDropdown(false); }}
                  >
                    <opt.icon size={12} style={{ color: opt.color }} />
                    {opt.label}
                    {opt.value === visibility && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: opt.color }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
