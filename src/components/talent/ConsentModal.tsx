import React, { useState } from 'react';
import {
  ShieldCheck, X, Eye, Lock, Users, AlertTriangle,
  ChevronRight, CheckSquare, Square,
} from 'lucide-react';

interface ConsentModalProps {
  modality: 'camera' | 'in_person';
  onConsent: (isMinor: boolean, guardianApproved: boolean) => void;
  onClose: () => void;
}

const DATA_POINTS = [
  { icon: Eye,   label: 'Camera or physical movement analysis',    who: 'Sportify Academy' },
  { icon: Users, label: 'Sport potential scores & physical metrics', who: 'AceAiX + you control visibility' },
  { icon: Lock,  label: 'Your AceAiX athlete identity',             who: 'Shared with Sportify once only' },
];

export default function ConsentModal({ modality, onConsent, onClose }: ConsentModalProps) {
  const [isMinor, setIsMinor]           = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [athleteConsent, setAthleteConsent]   = useState(false);
  const [step, setStep] = useState<'info' | 'guardian'>('info');

  const canProceed = athleteConsent && (!isMinor || (guardianConsent && guardianName.trim() && guardianEmail.trim()));

  function handleSubmit() {
    if (!canProceed) return;
    onConsent(isMinor, isMinor ? guardianConsent : true);
  }

  return (
    <>
      <style>{`
        @keyframes modalIn {
          0%   { opacity: 0; transform: scale(0.94) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backdropIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', animation: 'backdropIn 0.2s ease' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0F1E32 0%, #0A1525 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(31,181,122,0.15)' }}>
                <ShieldCheck size={18} color="#1FB57A" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Data Consent</p>
                <p className="text-[11px]" style={{ color: '#9DB0C6' }}>
                  {modality === 'camera' ? 'Camera assessment' : 'In-person assessment'} · Sportify Academy
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#9DB0C6' }}>
              <X size={14} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {step === 'info' && (
              <>
                {/* What data */}
                <div>
                  <p className="text-xs font-bold text-white mb-3">What data will be shared</p>
                  <div className="space-y-2">
                    {DATA_POINTS.map(d => (
                      <div key={d.label} className="flex items-start gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <d.icon size={14} style={{ color: '#2F80ED', marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <p className="text-xs text-white leading-snug">{d.label}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#9DB0C6' }}>{d.who}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key rights */}
                <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ background: 'rgba(47,128,237,0.07)', border: '1px solid rgba(47,128,237,0.2)' }}>
                  {[
                    'You control who sees your results (private / scouts / public)',
                    'Results are read-only — values can never be altered by anyone',
                    'You can request deletion of your assessment data at any time',
                    'Sportify will not retain your identity beyond this test',
                  ].map(t => (
                    <div key={t} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2F80ED' }} />
                      <p className="text-[11px]" style={{ color: '#9DB0C6' }}>{t}</p>
                    </div>
                  ))}
                </div>

                {/* Minor toggle */}
                <div>
                  <button
                    className="flex items-center gap-2.5 w-full text-left"
                    onClick={() => setIsMinor(v => !v)}
                  >
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${isMinor ? '#F5A623' : 'rgba(255,255,255,0.2)'}`, background: isMinor ? 'rgba(245,166,35,0.15)' : 'transparent' }}>
                      {isMinor && <div className="w-2 h-2 rounded-sm" style={{ background: '#F5A623' }} />}
                    </div>
                    <span className="text-xs" style={{ color: isMinor ? '#F5A623' : '#9DB0C6' }}>
                      The athlete is under 18 (guardian approval required)
                    </span>
                  </button>
                  {isMinor && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)' }}>
                      <AlertTriangle size={13} style={{ color: '#F5A623', flexShrink: 0, marginTop: 1 }} />
                      <p className="text-[11px]" style={{ color: '#F5A623' }}>
                        A guardian must review and approve before any data leaves AceAiX. Click "Next" to complete guardian details.
                      </p>
                    </div>
                  )}
                </div>

                {/* Athlete consent checkbox */}
                <button
                  className="flex items-start gap-3 w-full text-left group"
                  onClick={() => setAthleteConsent(v => !v)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {athleteConsent
                      ? <CheckSquare size={16} color="#1FB57A" />
                      : <Square size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: athleteConsent ? '#fff' : '#9DB0C6' }}>
                    I understand what data will be shared, I have read the rights above, and I give my consent for this assessment to proceed.
                  </p>
                </button>
              </>
            )}

            {step === 'guardian' && (
              <>
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)' }}>
                  <p className="text-xs font-bold" style={{ color: '#F5A623' }}>Guardian / Parent Approval</p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(245,166,35,0.8)' }}>
                    As this athlete is a minor, their guardian must provide details and approve this assessment.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#9DB0C6' }}>Guardian full name</label>
                    <input
                      value={guardianName}
                      onChange={e => setGuardianName(e.target.value)}
                      placeholder="e.g. Sarah Al-Rashidi"
                      className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(245,166,35,0.5)')}
                      onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#9DB0C6' }}>Guardian email</label>
                    <input
                      value={guardianEmail}
                      onChange={e => setGuardianEmail(e.target.value)}
                      placeholder="guardian@email.com"
                      type="email"
                      className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(245,166,35,0.5)')}
                      onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>

                <button
                  className="flex items-start gap-3 w-full text-left"
                  onClick={() => setGuardianConsent(v => !v)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {guardianConsent
                      ? <CheckSquare size={16} color="#F5A623" />
                      : <Square size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: guardianConsent ? '#fff' : '#9DB0C6' }}>
                    As the athlete's guardian, I approve this assessment and the data sharing described above.
                  </p>
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-white/[0.06]"
              style={{ color: '#9DB0C6', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
            {step === 'info' && isMinor && athleteConsent ? (
              <button
                onClick={() => setStep('guardian')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.03]"
                style={{ background: '#F5A623', color: '#0C1A2B' }}
              >
                Next: Guardian details <ChevronRight size={12} />
              </button>
            ) : (
              <button
                disabled={!canProceed}
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: canProceed ? '#1FB57A' : 'rgba(255,255,255,0.08)',
                  color: canProceed ? '#fff' : '#9DB0C6',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  boxShadow: canProceed ? '0 0 16px rgba(31,181,122,0.3)' : 'none',
                  transform: canProceed ? undefined : undefined,
                }}
              >
                <ShieldCheck size={12} /> I consent — proceed
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
