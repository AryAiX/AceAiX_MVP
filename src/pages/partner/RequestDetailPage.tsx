import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ShieldCheck, AlertTriangle, CheckCircle2,
  Upload, FileText, Lock, Hash, Award, X, Check,
} from 'lucide-react';

const REQUEST_DATA: Record<string, {
  id: string; athlete: string; avatar: string; dob: string; nationality: string;
  requestedBy: string; type: string; date: string; status: string;
  consentType: 'athlete' | 'club'; consentDate: string; notes: string;
}> = {
  r1: { id: 'r1', athlete: 'Khalid Al-Rashidi', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', dob: '15 Mar 2005', nationality: 'UAE', requestedBy: 'Athlete (self)', type: 'Physical Assessment', date: '17 Jun 2026', status: 'pending', consentType: 'athlete', consentDate: '17 Jun 2026', notes: 'Pre-season assessment for the 2026-27 campaign.' },
  r2: { id: 'r2', athlete: 'Yusuf Al-Kaabi',    avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200', dob: '22 Aug 2006', nationality: 'UAE', requestedBy: 'Al Wasl SC',     type: 'Medical Clearance',    date: '16 Jun 2026', status: 'in_progress', consentType: 'club', consentDate: '16 Jun 2026', notes: 'Clearance required before loan agreement is finalised.' },
  r3: { id: 'r3', athlete: 'Omar Al-Farsi',      avatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=200',  dob: '04 Jan 2002', nationality: 'UAE', requestedBy: 'Athlete (self)', type: 'Cardiac Screening',    date: '15 Jun 2026', status: 'in_progress', consentType: 'athlete', consentDate: '15 Jun 2026', notes: 'Routine UEFA-mandated cardiac screening.' },
};

const RECORD_TYPES = ['Physical Assessment', 'Cardiac Screening', 'Blood / Lab', 'MRI / Imaging', 'Drug Test', 'Nutritional Assessment', 'Psychological Assessment'];

const VERSION_HISTORY = [
  { version: 'v1', date: '10 Jun 2026', author: 'Dr. Aisha Rahman', hash: '0x4f7e…b2a1', note: 'Initial record' },
];

type Step = 'identity' | 'upload' | 'confirmed';

export default function RequestDetailPage() {
  const { id = 'r1' } = useParams();
  const req = REQUEST_DATA[id] ?? REQUEST_DATA['r1'];

  const [step, setStep]             = useState<Step>('identity');
  const [emiratesIdMatch, setMatch] = useState<boolean | null>(null);
  const [idInput, setIdInput]       = useState('');
  const [recordType, setRecordType] = useState(RECORD_TYPES[0]);
  const [findings, setFindings]     = useState('');
  const [notes, setNotes]           = useState('');
  const [fileAttached, setFile]     = useState(false);
  const [anchored, setAnchored]     = useState(false);
  const [provenanceRef]             = useState('AX-2026-' + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [showVersions, setVersions] = useState(false);

  function handleVerifyIdentity() {
    if (idInput.trim().length >= 6) { setMatch(true); }
    else { setMatch(false); }
  }

  function handleAnchor() {
    setAnchored(true);
    setStep('confirmed');
  }

  const consentColor = req.consentType === 'athlete' ? '#1FB57A' : '#2F80ED';

  return (
    <div className="max-w-3xl space-y-5 pb-10">
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stampIn { 0%{opacity:0;transform:scale(0.65)} 70%{transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
        @keyframes emeraldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(31,181,122,0.4)} 50%{box-shadow:0 0 0 8px rgba(31,181,122,0)} }
      `}</style>

      {/* Back */}
      <Link to="/partner/inbox" className="inline-flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: '#7C8DA6' }}
        onMouseEnter={e => ((e.target as HTMLElement).style.color = '#F4F8FC')}
        onMouseLeave={e => ((e.target as HTMLElement).style.color = '#7C8DA6')}>
        <ChevronLeft size={13} /> Back to Inbox
      </Link>

      {/* Request context card */}
      <div className="rounded-2xl p-5" style={{ background: '#0D1C2E', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeSlideUp 0.35s ease both' }}>
        <div className="flex items-start gap-4">
          <img src={req.avatar} alt={req.athlete} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
            style={{ border: '1.5px solid rgba(31,181,122,0.3)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-base font-black text-white">{req.athlete}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(47,128,237,0.12)', color: '#2F80ED', border: '1px solid rgba(47,128,237,0.25)' }}>
                {req.nationality}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: '#7C8DA6' }}>DOB: {req.dob} · Requested by: {req.requestedBy}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(244,248,252,0.6)' }}>
                {req.type}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(244,248,252,0.6)' }}>
                Requested {req.date}
              </span>
            </div>
          </div>
        </div>

        {/* Consent indicator */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: `${consentColor}08`, border: `1px solid ${consentColor}22` }}>
          <CheckCircle2 size={13} style={{ color: consentColor, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: 'rgba(244,248,252,0.7)' }}>
            Consent confirmed — initiated by <strong style={{ color: consentColor }}>{req.consentType === 'athlete' ? 'athlete' : 'club'}</strong> on {req.consentDate}.
            Records may only be uploaded after identity verification.
          </p>
        </div>

        {req.notes && (
          <p className="mt-3 text-xs px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(244,248,252,0.55)' }}>
            {req.notes}
          </p>
        )}
      </div>

      {/* STEP 1: Identity Verification */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#0D1C2E', border: `1px solid ${step === 'identity' && emiratesIdMatch !== true ? 'rgba(245,166,35,0.3)' : 'rgba(31,181,122,0.3)'}`, animation: 'fadeSlideUp 0.35s 0.08s ease both' }}>
        <div className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{
              background: emiratesIdMatch === true ? 'rgba(31,181,122,0.15)' : 'rgba(245,166,35,0.15)',
              border: `1.5px solid ${emiratesIdMatch === true ? '#1FB57A' : '#F5A623'}`,
              color: emiratesIdMatch === true ? '#1FB57A' : '#F5A623',
            }}>
            {emiratesIdMatch === true ? <Check size={13} /> : '1'}
          </div>
          <div>
            <p className="text-sm font-bold text-white">Identity Verification</p>
            <p className="text-[11px]" style={{ color: '#7C8DA6' }}>Confirm athlete via Emirates ID / UAE Pass before uploading any records</p>
          </div>
          {emiratesIdMatch === true && (
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.3)', animation: 'stampIn 0.45s ease both' }}>
              <ShieldCheck size={11} style={{ color: '#1FB57A' }} />
              <span className="text-[10px] font-black" style={{ color: '#1FB57A' }}>Identity Confirmed</span>
            </div>
          )}
        </div>

        {emiratesIdMatch !== true && (
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-start gap-3 px-3 py-3 rounded-xl"
              style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <Lock size={13} style={{ color: '#F5A623', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: 'rgba(244,248,252,0.65)' }}>
                Records cannot be uploaded until the athlete's identity is confirmed. Enter their Emirates ID number and cross-check against the system.
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Emirates ID / UAE Pass Number</label>
              <div className="flex gap-2">
                <input value={idInput} onChange={e => setIdInput(e.target.value)} placeholder="784-XXXX-XXXXXXX-X"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(31,181,122,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                <button onClick={handleVerifyIdentity}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg,#1FB57A,#178a5d)', color: '#fff', boxShadow: '0 4px 14px rgba(31,181,122,0.3)' }}>
                  Verify
                </button>
              </div>
              {emiratesIdMatch === false && (
                <p className="mt-2 text-xs flex items-center gap-1.5" style={{ color: '#EF5350' }}>
                  <AlertTriangle size={11} /> ID not found or insufficient length — please check and retry.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Record Upload */}
      {emiratesIdMatch === true && step !== 'confirmed' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(47,128,237,0.25)', animation: 'fadeSlideUp 0.35s ease both' }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'rgba(47,128,237,0.15)', border: '1.5px solid #2F80ED', color: '#2F80ED' }}>2</div>
            <div>
              <p className="text-sm font-bold text-white">Upload Assessment Record</p>
              <p className="text-[11px]" style={{ color: '#7C8DA6' }}>Records are append-only and will be hashed for tamper-evidence</p>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            {/* Record type */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Record Type</label>
              <select value={recordType} onChange={e => setRecordType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Findings */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Structured Findings</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[
                  { label: 'Result / Outcome', placeholder: 'e.g., All parameters within range' },
                  { label: 'Reference Range',   placeholder: 'e.g., Normal limits per FIFA standard' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] mb-1" style={{ color: '#7C8DA6' }}>{f.label}</p>
                    <input placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                      style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.4)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
                  </div>
                ))}
              </div>
              <textarea rows={3} value={findings} onChange={e => setFindings(e.target.value)}
                placeholder="Clinical notes, observations, and any recommendations..."
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{ background: '#0A1622', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(47,128,237,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
            </div>

            {/* File attachment */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#7C8DA6' }}>Attach File (PDF / Imaging)</label>
              <div
                className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all"
                style={{ borderColor: fileAttached ? 'rgba(31,181,122,0.4)' : 'rgba(255,255,255,0.1)', background: fileAttached ? 'rgba(31,181,122,0.05)' : 'rgba(255,255,255,0.02)' }}
                onClick={() => setFile(true)}>
                {fileAttached ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} style={{ color: '#1FB57A' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1FB57A' }}>assessment_report.pdf attached</span>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="mx-auto mb-2" style={{ color: '#7C8DA6' }} />
                    <p className="text-xs font-semibold text-white mb-0.5">Drop file or click to browse</p>
                    <p className="text-[10px]" style={{ color: '#7C8DA6' }}>PDF, JPG, DICOM — max 50 MB · Signed / secure access only</p>
                  </>
                )}
              </div>
            </div>

            {/* Append-only notice */}
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(47,128,237,0.06)', border: '1px solid rgba(47,128,237,0.18)' }}>
              <FileText size={12} style={{ color: '#2F80ED', flexShrink: 0, marginTop: 1 }} />
              <p className="text-[11px]" style={{ color: 'rgba(244,248,252,0.55)' }}>
                Records are <strong style={{ color: '#2F80ED' }}>append-only</strong>. Corrections create a new versioned record — existing records cannot be edited in place.
              </p>
            </div>

            <button onClick={handleAnchor} disabled={!findings.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#1FB57A,#178a5d)', color: '#fff', boxShadow: findings.trim() ? '0 4px 18px rgba(31,181,122,0.35)' : 'none' }}>
              <Hash size={14} /> Submit & Anchor Record
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Confirmed */}
      {step === 'confirmed' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1C2E', border: '1px solid rgba(31,181,122,0.4)', animation: 'fadeSlideUp 0.4s ease both', boxShadow: '0 0 40px rgba(31,181,122,0.1)' }}>
          <div className="px-5 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(31,181,122,0.15)', border: '2px solid rgba(31,181,122,0.5)', animation: 'stampIn 0.55s ease both, emeraldPulse 2s ease-in-out 0.6s 2' }}>
              <ShieldCheck size={30} style={{ color: '#1FB57A' }} />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Record Anchored</h3>
            <p className="text-xs mb-5" style={{ color: '#7C8DA6' }}>The record has been hashed and anchored — tamper-evident provenance confirmed.</p>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5"
              style={{ background: 'rgba(31,181,122,0.1)', border: '1px solid rgba(31,181,122,0.3)' }}>
              <Hash size={13} style={{ color: '#1FB57A' }} />
              <span className="text-xs font-black text-white">Provenance Ref: </span>
              <span className="text-xs font-bold" style={{ color: '#1FB57A' }}>{provenanceRef}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5 text-left">
              {[
                { label: 'Record Type',  value: recordType },
                { label: 'Athlete',      value: req.athlete },
                { label: 'Anchored by',  value: 'Dr. Aisha Rahman' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] mb-0.5" style={{ color: '#7C8DA6' }}>{item.label}</p>
                  <p className="text-xs font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Version history */}
            <button onClick={() => setVersions(!showVersions)}
              className="text-xs font-semibold mb-3 transition-colors"
              style={{ color: '#2F80ED' }}>
              {showVersions ? 'Hide' : 'Show'} version history
            </button>
            {showVersions && (
              <div className="text-left space-y-2 mb-4">
                {[...VERSION_HISTORY, { version: 'v2', date: '17 Jun 2026', author: 'Dr. Aisha Rahman', hash: `0x${provenanceRef}`, note: 'New record (this upload)' }].map(v => (
                  <div key={v.version} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(47,128,237,0.15)', color: '#2F80ED' }}>{v.version}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white">{v.note}</p>
                      <p className="text-[10px]" style={{ color: '#7C8DA6' }}>{v.date} · {v.author}</p>
                    </div>
                    <code className="text-[10px]" style={{ color: '#7C8DA6' }}>{v.hash}</code>
                  </div>
                ))}
              </div>
            )}

            <Link to="/partner/inbox"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(244,248,252,0.7)' }}>
              Back to Inbox
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
