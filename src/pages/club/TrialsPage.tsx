import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Plus, Clock, Users, ChevronDown, ChevronUp,
  CheckCircle2, Zap, ShieldCheck, Flame, X,
} from 'lucide-react';

const TRIALS = [
  {
    id: 't1',
    position: 'Striker / Centre Forward',
    ageRange: '18–24',
    type: 'trial' as const,
    deadline: '30 Jun 2025',
    applicants: 47,
    description: 'Seeking a dynamic, high-energy centre forward for the UAE Pro League squad.',
    requirements: ['AceAiX Score ≥ 80', 'Verified medical clearance', 'UAE-eligible or non-quota slot', 'Min 20 professional appearances'],
    color: '#B8F135',
  },
  {
    id: 't2',
    position: 'Left Back (Loan)',
    ageRange: '20–28',
    type: 'loan' as const,
    deadline: '15 Jul 2025',
    applicants: 23,
    description: 'Attacking fullback on loan for the upcoming season. Possession-based system.',
    requirements: ['Professional contract at parent club', 'AceAiX Score ≥ 75', 'Passing accuracy > 82%'],
    color: '#F5A623',
  },
  {
    id: 't3',
    position: 'Central Midfielder',
    ageRange: '21–27',
    type: 'transfer' as const,
    deadline: '10 Aug 2025',
    applicants: 61,
    description: 'Box-to-box midfielder with strong defensive awareness and distribution.',
    requirements: ['AceAiX Score ≥ 82', 'Min 40 league appearances', 'Available on permanent transfer'],
    color: '#2F80ED',
  },
];

const TYPE_STYLE = {
  trial:    { bg: 'rgba(184,241,53,0.1)',  border: 'rgba(184,241,53,0.25)',  color: '#B8F135' },
  transfer: { bg: 'rgba(47,128,237,0.1)',  border: 'rgba(47,128,237,0.25)',  color: '#2F80ED' },
  loan:     { bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.25)', color: '#F5A623' },
};

const APPLICANTS = [
  { name: 'Khalid Al-Rashidi', pos: 'ST',  score: 92, age: 21, verified: true,  hot: true,  trialId: 't1', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Tariq Hassan',      pos: 'ST',  score: 88, age: 24, verified: true,  hot: false, trialId: 't1', image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Yusuf Al-Kaabi',    pos: 'LB',  score: 85, age: 20, verified: false, hot: true,  trialId: 't2', image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { name: 'Rayan Benali',      pos: 'CM',  score: 87, age: 23, verified: true,  hot: false, trialId: 't3', image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

export default function ClubTrialsPage() {
  const [expanded, setExpanded] = useState<string | null>('t1');

  return (
    <div className="max-w-4xl space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white mb-0.5">Open Trials</h1>
          <p className="text-xs text-white/40">{TRIALS.length} active positions · {TRIALS.reduce((s, t) => s + t.applicants, 0)} total applicants</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#F5A623,#e09210)', color: '#0C1A2B', boxShadow: '0 4px 16px rgba(245,166,35,0.3)' }}>
          <Plus size={14} /> Post Trial
        </button>
      </div>

      {/* Trials */}
      <div className="space-y-3">
        {TRIALS.map(trial => {
          const isOpen = expanded === trial.id;
          const ts = TYPE_STYLE[trial.type];
          const trialApplicants = APPLICANTS.filter(a => a.trialId === trial.id);
          return (
            <div key={trial.id} className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: isOpen ? `${trial.color}06` : 'rgba(255,255,255,0.025)',
                border: `1px solid ${isOpen ? trial.color + '30' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isOpen ? `0 8px 32px ${trial.color}12` : 'none',
              }}>
              {/* Trial header */}
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(isOpen ? null : trial.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="text-base font-black text-white">{trial.position}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
                        style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color }}>
                        {trial.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <span className="flex items-center gap-1"><Target size={11} /> Ages {trial.ageRange}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> Deadline {trial.deadline}</span>
                      <span className="flex items-center gap-1 font-semibold" style={{ color: trial.color }}>
                        <Users size={11} /> {trial.applicants} applied
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold" style={{ color: trial.color }}>{trial.applicants}</p>
                      <p className="text-[9px] text-white/30">applicants</p>
                    </div>
                    {isOpen
                      ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                      : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                  </div>
                </div>
              </div>

              {/* Expanded body */}
              {isOpen && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm leading-relaxed mt-4 mb-4" style={{ color: 'rgba(244,248,252,0.65)' }}>{trial.description}</p>

                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Requirements</p>
                  <ul className="space-y-1.5 mb-5">
                    {trial.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(244,248,252,0.65)' }}>
                        <CheckCircle2 size={12} style={{ color: '#1FB57A', flexShrink: 0, marginTop: 2 }} /> {req}
                      </li>
                    ))}
                  </ul>

                  {/* Top Applicants */}
                  {trialApplicants.length > 0 && (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Top Applicants</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {trialApplicants.map(a => (
                          <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="relative flex-shrink-0">
                              <img src={a.image} alt={a.name} className="w-10 h-10 rounded-xl object-cover" />
                              {a.verified && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: '#1FB57A', border: '1.5px solid #080F1C' }}>
                                  <ShieldCheck size={8} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-white truncate">{a.name}</p>
                                {a.hot && <Flame size={10} style={{ color: '#F5A623', flexShrink: 0 }} />}
                              </div>
                              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{a.pos} · Age {a.age}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-black" style={{ color: '#B8F135' }}>{a.score}</p>
                              <p className="text-[9px] text-white/25">AI</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Link to="/club/search"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
                      style={{ background: `${trial.color}15`, border: `1px solid ${trial.color}30`, color: trial.color }}>
                      <Users size={13} /> View All Applicants
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
                      <X size={13} /> Close Trial
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
