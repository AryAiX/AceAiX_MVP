import { useState } from 'react';
import { Plus, X, Bone, AlertTriangle } from 'lucide-react';

const BODY_AREAS = ['Head / Neck', 'Shoulder', 'Upper Arm', 'Elbow', 'Forearm / Wrist', 'Hand', 'Chest / Ribs', 'Spine / Back', 'Hip / Groin', 'Thigh', 'Knee', 'Lower Leg', 'Ankle', 'Foot'];
const INJURY_TYPES = ['Muscle Strain', 'Ligament Sprain', 'Tendinopathy', 'Fracture', 'Contusion', 'Concussion', 'Dislocation', 'Overuse', 'Other'];
const SEVERITIES = ['Mild', 'Moderate', 'Severe'];
const RECOVERY_STATUSES = ['Acute', 'Rehabilitation', 'Return to Training', 'Cleared', 'Re-injured'];

const INJURIES = [
  { id: 'i1', athlete: 'Sara Al-Hashemi',  avatar: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=80', type: 'Ligament Sprain', area: 'Knee',       severity: 'Moderate', occurred: '05 Jun 2026', recovery: 'Rehabilitation', notes: 'MCL Grade II sprain. Estimated 4–6 week recovery.' },
  { id: 'i2', athlete: 'James Crawford',    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=80',  type: 'Muscle Strain',  area: 'Thigh',      severity: 'Mild',     occurred: '01 Jun 2026', recovery: 'Return to Training', notes: 'Hamstring Grade I. Cleared for light training.' },
  { id: 'i3', athlete: 'Fabrizio Moretti',  avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=80', type: 'Overuse',         area: 'Ankle',      severity: 'Mild',     occurred: '10 May 2026', recovery: 'Cleared', notes: 'Peroneal tendinopathy — fully resolved.' },
  { id: 'i4', athlete: 'Rashid Salem',      avatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=80', type: 'Contusion',       area: 'Hip / Groin', severity: 'Moderate', occurred: '15 Jun 2026', recovery: 'Acute', notes: 'Direct impact during training. Under observation.' },
];

const SEVERITY_META: Record<string, { color: string }> = {
  Mild:     { color: '#1FB57A' },
  Moderate: { color: '#F5A623' },
  Severe:   { color: '#EF5350' },
};

const RECOVERY_META: Record<string, { color: string }> = {
  Acute:               { color: '#EF5350' },
  Rehabilitation:      { color: '#F5A623' },
  'Return to Training':{ color: '#2F80ED' },
  Cleared:             { color: '#1FB57A' },
  'Re-injured':        { color: '#EF5350' },
};

export default function InjuriesPage() {
  const [showForm, setShowForm]     = useState(false);
  const [bodyArea, setBodyArea]     = useState(BODY_AREAS[4]);
  const [injType, setInjType]       = useState(INJURY_TYPES[0]);
  const [severity, setSeverity]     = useState(SEVERITIES[0]);
  const [recovery, setRecovery]     = useState(RECOVERY_STATUSES[0]);

  return (
    <div className="max-w-4xl space-y-5 pb-10">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="flex items-center justify-between" style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <div>
          <h1 className="text-xl font-black text-white">Injuries</h1>
          <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>{INJURIES.length} active injury records</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}>
          <Plus size={14} /> Log Injury
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(245,166,35,0.3)', animation: 'fadeSlideUp 0.3s ease both' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Log New Injury</p>
            <button onClick={() => setShowForm(false)} style={{ color: '#7C8DA6' }}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Athlete</label>
              <input placeholder="Search athlete..." className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Occurred Date</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Injury Type</label>
              <select value={injType} onChange={e => setInjType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {INJURY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Body Area</label>
              <select value={bodyArea} onChange={e => setBodyArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {BODY_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Severity</label>
              <div className="flex gap-2">
                {SEVERITIES.map(s => {
                  const sm = SEVERITY_META[s];
                  return (
                    <button key={s} onClick={() => setSeverity(s)}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
                      style={{
                        background: severity === s ? `${sm.color}15` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${severity === s ? sm.color + '40' : 'rgba(255,255,255,0.08)'}`,
                        color: severity === s ? sm.color : '#7C8DA6',
                      }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Recovery Status</label>
              <select value={recovery} onChange={e => setRecovery(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {RECOVERY_STATUSES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Clinical Notes</label>
            <textarea rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
              style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              placeholder="Assessment findings, treatment plan, estimated return date..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}>
              Save Injury Record
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#7C8DA6' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {INJURIES.map((inj, i) => {
          const sm = SEVERITY_META[inj.severity];
          const rm = RECOVERY_META[inj.recovery];
          return (
            <div key={inj.id} className="rounded-2xl p-5"
              style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: `fadeSlideUp 0.3s ease ${i * 0.07}s both` }}>
              <div className="flex items-start gap-4">
                <img src={inj.avatar} alt={inj.athlete} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-sm font-bold text-white">{inj.athlete}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${sm.color}12`, color: sm.color, border: `1px solid ${sm.color}25` }}>
                      {inj.severity}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${rm.color}12`, color: rm.color, border: `1px solid ${rm.color}25` }}>
                      {inj.recovery}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-2 text-xs" style={{ color: '#7C8DA6' }}>
                    <span className="flex items-center gap-1"><Bone size={10} /> {inj.type}</span>
                    <span>·</span>
                    <span>{inj.area}</span>
                    <span>·</span>
                    <span>Occurred {inj.occurred}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(244,248,252,0.55)' }}>{inj.notes}</p>
                </div>
                <button
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.22)', color: '#2F80ED' }}>
                  Update
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
