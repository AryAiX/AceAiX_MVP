import React from 'react';
import SourceBadge from './SourceBadge';
import {
  Target, Zap, Clock, Star, Shield, Activity,
  TrendingUp, MousePointer, Users,
} from 'lucide-react';

interface MatchStatPanelProps {
  stats: Record<string, number | string>;
  source: string;
  sourceDisplay: string;
  verifierName?: string | null;
  sport: string;
}

const FOOTBALL_STAT_GROUPS = [
  {
    label: 'Attack',
    color: '#B8F135',
    icon: Target,
    keys: [
      { key: 'goals',           label: 'Goals',            fmt: 'int'   },
      { key: 'assists',         label: 'Assists',          fmt: 'int'   },
      { key: 'shots',           label: 'Shots',            fmt: 'int'   },
      { key: 'shots_on_target', label: 'On Target',        fmt: 'int'   },
    ],
  },
  {
    label: 'Passing',
    color: '#2F80ED',
    icon: TrendingUp,
    keys: [
      { key: 'passes',          label: 'Passes',           fmt: 'int'   },
      { key: 'pass_accuracy',   label: 'Accuracy',         fmt: 'pct'   },
    ],
  },
  {
    label: 'Defense',
    color: '#1FB57A',
    icon: Shield,
    keys: [
      { key: 'tackles',         label: 'Tackles',          fmt: 'int'   },
      { key: 'fouls_drawn',     label: 'Fouls Drawn',      fmt: 'int'   },
      { key: 'fouls_committed', label: 'Fouls Committed',  fmt: 'int'   },
    ],
  },
  {
    label: 'Dribbling',
    color: '#F5A623',
    icon: MousePointer,
    keys: [
      { key: 'dribbles_attempted', label: 'Attempted',     fmt: 'int'   },
      { key: 'dribbles_success',   label: 'Successful',    fmt: 'int'   },
    ],
  },
  {
    label: 'Match',
    color: '#A78BFA',
    icon: Activity,
    keys: [
      { key: 'minutes',         label: 'Minutes',          fmt: 'int'   },
      { key: 'position',        label: 'Position',         fmt: 'str'   },
      { key: 'rating',          label: 'Rating',           fmt: 'dec'   },
      { key: 'yellow_cards',    label: 'Yellow Cards',     fmt: 'int'   },
      { key: 'red_cards',       label: 'Red Cards',        fmt: 'int'   },
    ],
  },
];

function fmtValue(val: number | string, fmt: string): string {
  if (fmt === 'pct') return `${val}%`;
  if (fmt === 'dec') return typeof val === 'number' ? val.toFixed(1) : String(val);
  if (fmt === 'str') return String(val) || '—';
  return String(val);
}

export default function MatchStatPanel({ stats, source, sourceDisplay, verifierName, sport }: MatchStatPanelProps) {
  const groups = sport.toLowerCase() === 'football' ? FOOTBALL_STAT_GROUPS : buildGenericGroups(stats);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40">
          Match Statistics
        </h4>
        <SourceBadge source={source} sourceDisplay={sourceDisplay} verifierName={verifierName} size="sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {groups.map(group => {
          const presentKeys = group.keys.filter(k => stats[k.key] !== undefined && stats[k.key] !== null);
          if (presentKeys.length === 0) return null;
          const Icon = group.icon;
          return (
            <div
              key={group.label}
              className="rounded-xl p-3.5"
              style={{
                background: `${group.color}08`,
                border: `1px solid ${group.color}1A`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={12} style={{ color: group.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${group.color}90` }}>
                  {group.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {presentKeys.map(({ key, label, fmt }) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-bold tabular" style={{ color: group.color }}>
                      {fmtValue(stats[key], fmt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildGenericGroups(stats: Record<string, number | string>) {
  const entries = Object.entries(stats).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return [];
  return [{
    label: 'Stats',
    color: '#2F80ED',
    icon: Activity,
    keys: entries.map(([key]) => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      fmt: typeof stats[key] === 'number' ? 'dec' : 'str',
    })),
  }];
}
