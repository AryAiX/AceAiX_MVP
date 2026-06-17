import { useState } from 'react';
import {
  Award, Plus, X, CheckCircle2, AlertTriangle, XCircle,
  Clock, ChevronDown, ChevronUp,
} from 'lucide-react';

const CLEARANCES = [
  { id: 'c1', athlete: 'Khalid Al-Rashidi', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80', status: 'cleared',     effectiveFrom: '01 Jun 2026', effectiveTo: '31 May 2027', issuedBy: 'Dr. Aisha Rahman', notes: 'Full clearance for all professional activities.',         history: [{ date: '01 Jun 2026', action: 'Issued', by: 'Dr. Aisha Rahman', status: 'cleared' }] },
  { id: 'c2', athlete: 'Yusuf Al-Kaabi',    avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=80', status: 'restricted',  effectiveFrom: '10 Jun 2026', effectiveTo: '30 Jun 2026', issuedBy: 'Dr. Aisha Rahman', notes: 'Restricted to non-contact training only until knee assessment clears.', history: [{ date: '01 May 2026', action: 'Issued (cleared)', by: 'Dr. Aisha Rahman', status: 'cleared' }, { date: '10 Jun 2026', action: 'Updated to restricted', by: 'Dr. Aisha Rahman', status: 'restricted' }] },
  { id: 'c3', athlete: 'Omar Al-Farsi',      avatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=80',  status: 'cleared',     effectiveFrom: '15 May 2026', effectiveTo: '14 May 2027', issuedBy: 'Dr. Tariq Zayed',  notes: 'Post-cardiac screening clearance.',                    history: [{ date: '15 May 2026', action: 'Issued', by: 'Dr. Tariq Zayed', status: 'cleared' }] },
  { id: 'c4', athlete: 'Fabrizio Moretti',   avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=80', status: 'not_cleared', effectiveFrom: '20 Jun 2026', effectiveTo: '—',           issuedBy: 'Dr. Aisha Rahman', notes: 'Not cleared pending further investigation of ECG anomaly.',  history: [{ date: '20 Jun 2026', action: 'Not cleared', by: 'Dr. Aisha Rahman', status: 'not_cleared' }] },
];

const STATUS_META = {
  cleared:     { label: 'Cleared',     color: '#1FB57A', bg: 'rgba(31,181,122,0.1)',  icon: CheckCircle2 },
  restricted:  { label: 'Restricted',  color: '#F5A623', bg: 'rgba(245,166,35,0.1)', icon: AlertTriangle },
  not_cleared: { label: 'Not Cleared', color: '#EF5350', bg: 'rgba(239,83,80,0.1)',  icon: XCircle      },
};

type ClearanceStatus = 'cleared' | 'restricted' | 'not_cleared';

export default function ClearancesPage() {
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [showIssue, setShowIssue]   = useState(false);
  const [revokeId, setRevokeId]     = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [formStatus, setFormStatus] = useState<ClearanceStatus>('cleared');

  return (
    <div className="max-w-4xl space-y-5 pb-10">
      <style>{`
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes stampIn{0%{opacity:0;transform:scale(0.65)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between" style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
        <div>
          <h1 className="text-xl font-black text-white">Clearance Management</h1>
          <p className="text-xs mt-0.5" style={{ color: '#7C8DA6' }}>
            {CLEARANCES.filter(c => c.status === 'cleared').length} cleared &nbsp;·&nbsp;
            {CLEARANCES.filter(c => c.status === 'restricted').length} restricted &nbsp;·&nbsp;
            {CLEARANCES.filter(c => c.status === 'not_cleared').length} not cleared
          </p>
        </div>
        <button onClick={() => setShowIssue(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'linear-gradient(135deg,#1FB57A,#178a5d)', color: '#fff', boxShadow: '0 4px 14px rgba(31,181,122,0.3)' }}>
          <Plus size={14} /> Issue Clearance
        </button>
      </div>

      {/* Issue clearance form */}
      {showIssue && (
        <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(31,181,122,0.3)', animation: 'fadeSlideUp 0.3s ease both' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Issue / Update Clearance</p>
            <button onClick={() => setShowIssue(false)} style={{ color: '#7C8DA6' }}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Athlete</label>
              <input placeholder="Search athlete..." className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Clearance Status</label>
              <div className="flex gap-2">
                {(Object.keys(STATUS_META) as ClearanceStatus[]).map(s => {
                  const m = STATUS_META[s];
                  return (
                    <button key={s} onClick={() => setFormStatus(s)}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
                      style={{
                        background: formStatus === s ? m.bg : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${formStatus === s ? m.color + '40' : 'rgba(255,255,255,0.08)'}`,
                        color: formStatus === s ? m.color : '#7C8DA6',
                      }}>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Effective From</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Effective To</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Clinical Notes</label>
            <textarea rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
              style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              placeholder="Basis for this clearance decision..." />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#1FB57A,#178a5d)', color: '#fff' }}>
              Issue Clearance
            </button>
            <button onClick={() => setShowIssue(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#7C8DA6' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Revoke modal */}
      {revokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0D1C2E', border: '1px solid rgba(239,83,80,0.35)', animation: 'fadeSlideUp 0.3s ease both' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,83,80,0.12)', border: '1px solid rgba(239,83,80,0.3)' }}>
                <XCircle size={18} style={{ color: '#EF5350' }} />
              </div>
              <p className="text-sm font-bold text-white">Revoke Clearance</p>
            </div>
            <p className="text-xs mb-4" style={{ color: '#7C8DA6' }}>Revocation is permanent and will be logged. Please provide a clinical reason.</p>
            <textarea rows={3} value={revokeReason} onChange={e => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation..."
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none mb-4"
              style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <div className="flex gap-3">
              <button disabled={!revokeReason.trim()} onClick={() => setRevokeId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.35)', color: '#EF5350' }}>
                Confirm Revoke
              </button>
              <button onClick={() => setRevokeId(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#7C8DA6' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clearance list */}
      <div className="space-y-3">
        {CLEARANCES.map((c, i) => {
          const m = STATUS_META[c.status as ClearanceStatus];
          const Icon = m.icon;
          const isExpanded = expanded === c.id;
          return (
            <div key={c.id} className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: '#0D1C2E',
                border: `1px solid ${isExpanded ? m.color + '30' : 'rgba(255,255,255,0.07)'}`,
                animation: `fadeSlideUp 0.3s ease ${i * 0.06}s both`,
              }}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : c.id)}>
                <img src={c.avatar} alt={c.athlete} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  style={{ border: `1.5px solid ${m.color}30` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{c.athlete}</p>
                  <p className="text-[11px]" style={{ color: '#7C8DA6' }}>
                    {c.effectiveFrom} → {c.effectiveTo}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}30` }}>
                    <Icon size={10} /> {m.label}
                  </span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: '#7C8DA6' }} /> : <ChevronDown size={14} style={{ color: '#7C8DA6' }} />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs leading-relaxed mt-4 mb-4" style={{ color: 'rgba(244,248,252,0.6)' }}>{c.notes}</p>
                  <p className="text-[10px] mb-1" style={{ color: '#7C8DA6' }}>Issued by: <span className="text-white">{c.issuedBy}</span></p>

                  {/* History timeline */}
                  <p className="text-[10px] font-black uppercase tracking-wider mt-4 mb-2" style={{ color: '#7C8DA6' }}>Clearance History</p>
                  <div className="space-y-2 mb-4">
                    {c.history.map((h, hi) => {
                      const hm = STATUS_META[h.status as ClearanceStatus];
                      return (
                        <div key={hi} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: hm.color }} />
                          <div>
                            <p className="text-xs text-white">{h.action}</p>
                            <p className="text-[10px]" style={{ color: '#7C8DA6' }}>{h.date} · {h.by}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setShowIssue(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(47,128,237,0.1)', border: '1px solid rgba(47,128,237,0.25)', color: '#2F80ED' }}>
                      Update Status
                    </button>
                    <button onClick={() => setRevokeId(c.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)', color: '#EF5350' }}>
                      <XCircle size={11} /> Revoke
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
