import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertCircle, Clock, FileText, Plus, Lock,
  CheckCircle2, Heart, X, Loader2, Check, Activity,
  Zap, ChevronRight, Upload, Eye, EyeOff, Sparkles,
  Stethoscope, Syringe, FlaskConical,
} from 'lucide-react';

/* ── data ──────────────────────────────────────────────────── */
const CLEARANCES = [
  {
    id: '1',
    status: 'cleared',
    issued_by: 'Dubai Sports Medicine Centre',
    issue_date: 'Mar 15, 2026',
    expiry_date: 'Mar 15, 2027',
    notes: 'Full fitness clearance. No restrictions.',
  },
];

const RECORDS = [
  { id: '1', type: 'Physical Assessment', title: 'Annual Fitness Test 2026',      date: 'Mar 15, 2026', verified: true,  provider: 'Dubai Sports Medicine Centre', icon: Activity     },
  { id: '2', type: 'Injury Report',       title: 'Right Ankle Sprain Recovery',   date: 'Nov 20, 2025', verified: true,  provider: 'Al Ain Medical Clinic',         icon: AlertCircle  },
  { id: '3', type: 'Blood Test',          title: 'Pre-Season Blood Panel',         date: 'Jul 1, 2026',  verified: false, provider: 'Personal Upload',               icon: FlaskConical },
  { id: '4', type: 'Vaccination',         title: 'Annual Flu & Hep-B Booster',     date: 'Jan 8, 2026',  verified: true,  provider: 'UAE Health Authority',          icon: Syringe      },
];

const RISK_ITEMS = [
  { label: 'Injury History Risk',  score: 'Low',  color: '#1FB57A', note: 'Single minor ankle sprain in 18 months. Good recovery protocol followed.' },
  { label: 'Current Fitness',      score: 'High', color: '#B8F135', note: 'Recent clearance from licensed partner confirms full fitness.' },
  { label: 'Return-to-Play',       score: 'Full', color: '#2F80ED', note: 'No restrictions. Available for all competition types.' },
  { label: 'Stress Load (7 days)', score: 'Mod',  color: '#F5A623', note: '3 high-intensity sessions this week. Monitor cumulative load.' },
];

const TYPE_COLORS: Record<string, string> = {
  'Physical Assessment': '#2F80ED',
  'Injury Report':       '#EF5350',
  'Blood Test':          '#A78BFA',
  'Vaccination':         '#1FB57A',
};

/* ── animated pulse ring (clearance) ───────────────────────── */
function PulseRing() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      {[1, 2].map(i => (
        <span key={i} className="absolute inset-0 rounded-full"
          style={{
            border: '1.5px solid rgba(31,181,122,0.4)',
            animation: `pulse ${1.5 + i * 0.5}s ease-out ${i * 0.4}s infinite`,
          }} />
      ))}
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(31,181,122,0.15)', border: '2px solid rgba(31,181,122,0.40)', boxShadow: '0 0 20px rgba(31,181,122,0.25)' }}>
        <CheckCircle2 size={22} className="text-emerald" />
      </div>
    </div>
  );
}

/* ── expiry countdown bar ───────────────────────────────────── */
function ExpiryBar({ pct }: { pct: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 400); return () => clearTimeout(t); }, [pct]);
  const color = pct > 50 ? '#1FB57A' : pct > 25 ? '#F5A623' : '#EF5350';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/30">Validity remaining</span>
        <span className="text-[10px] font-bold tabular" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 8px ${color}50`,
            transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1) 0.4s',
          }} />
      </div>
    </div>
  );
}

/* ── upload modal ───────────────────────────────────────────── */
function UploadModal({ onClose }: { onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  async function submit() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false); setDone(true);
    setTimeout(onClose, 900);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(12,26,43,0.85)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease both' }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: '#16273B', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.14)', border: '1px solid rgba(47,128,237,0.25)' }}>
              <Upload size={14} className="text-azure" />
            </div>
            <h3 className="text-sm font-bold text-white">Upload Medical Record</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/08 transition-colors"><X size={13} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Record Type</label>
            <select className="input-field">
              <option>Physical Assessment</option>
              <option>Injury Report</option>
              <option>Blood Test</option>
              <option>Vaccination</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Title</label>
            <input className="input-field" placeholder="e.g. Annual Fitness Test 2026" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Provider / Issuer</label>
            <input className="input-field" placeholder="Clinic or hospital name" />
          </div>
          <div className="rounded-xl p-4 text-center cursor-pointer"
            style={{ border: '2px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}>
            <Upload size={20} className="text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">Drag PDF or image here</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={submit} disabled={saving || done}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: done ? '#1FB57A' : '#2F80ED', color: '#fff', boxShadow: done ? '0 4px 20px rgba(31,181,122,0.4)' : '0 4px 20px rgba(47,128,237,0.35)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={14} /> : <Upload size={14} />}
            {saving ? 'Uploading…' : done ? 'Uploaded!' : 'Upload Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── risk score ring ────────────────────────────────────────── */
function RiskRing({ color, score }: { color: string; score: string }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, border: `2px solid ${color}35`, boxShadow: `0 0 12px ${color}25` }}>
      <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

/* ── main ───────────────────────────────────────────────────── */
export default function MedicalPage() {
  const [mounted, setMounted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [hoveredRec, setHoveredRec] = useState<string | null>(null);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const expiryPct = 75;

  return (
    <>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      <div className="max-w-4xl space-y-5 pb-10">

        {/* ── HERO HEADER ─────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0C1A2B 0%, #16273B 50%, #0A1E18 100%)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
            transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.19,1,0.22,1)',
          }}>
          {/* orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(31,181,122,0.12) 0%, transparent 70%)', transform: 'translate(40%,-40%)' }} />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(239,83,80,0.07) 0%, transparent 70%)', transform: 'translateY(60%)' }} />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.25)', boxShadow: '0 0 28px rgba(31,181,122,0.15)' }}>
                <Stethoscope size={22} style={{ color: '#1FB57A' }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Medical Intelligence</h1>
                <p className="text-white/40 text-sm mt-0.5">Verified health records &amp; clearances</p>
              </div>
            </div>

            {/* clearance status pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl flex-shrink-0"
              style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.25)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1FB57A', boxShadow: '0 0 6px rgba(31,181,122,0.7)' }} />
              <span className="text-xs font-bold text-emerald uppercase tracking-wider">Cleared for Competition</span>
            </div>

            <button onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-all active:scale-95"
              style={{ background: '#1FB57A', color: '#fff', boxShadow: '0 4px 20px rgba(31,181,122,0.40)' }}>
              <Plus size={15} /> Add Record
            </button>
          </div>

          {/* energy line */}
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(31,181,122,0.5) 40%, rgba(47,128,237,0.3) 70%, transparent)' }} />

          {/* quick stats */}
          <div className="relative px-6 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Records',     val: RECORDS.length,                                   color: '#2F80ED' },
              { label: 'Verified',    val: RECORDS.filter(r => r.verified).length,            color: '#1FB57A' },
              { label: 'Pending',     val: RECORDS.filter(r => !r.verified).length,           color: '#F5A623' },
              { label: 'Risk Score',  val: 'Low',                                             color: '#B8F135' },
            ].map((s, i) => (
              <div key={s.label}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 0.4s ease ${0.1 + i * 0.06}s, transform 0.4s cubic-bezier(0.19,1,0.22,1) ${0.1 + i * 0.06}s`,
                }}>
                <p className="text-lg font-display font-bold tabular" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRIVACY NOTICE ──────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
          style={{
            background: 'rgba(47,128,237,0.07)',
            border: '1px solid rgba(47,128,237,0.18)',
            animation: 'slideUp 0.4s ease 0.1s both',
          }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(47,128,237,0.14)', border: '1px solid rgba(47,128,237,0.22)' }}>
            <Lock size={13} className="text-azure" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-azure">Consent-First Privacy</p>
            <p className="text-[11px] text-white/35 mt-0.5">Medical data is only shared with scouts/clubs you explicitly authorize. Revoke anytime in Privacy Settings.</p>
          </div>
          <button onClick={() => setPrivacy(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold flex-shrink-0 transition-colors"
            style={{ color: privacy ? '#1FB57A' : '#7C8DA6' }}>
            {privacy ? <Eye size={12} /> : <EyeOff size={12} />}
            {privacy ? 'Visible' : 'Hidden'}
          </button>
        </div>

        {/* ── MAIN 2-COL ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* LEFT: clearance + risk — 2 cols */}
          <div className="lg:col-span-2 space-y-5">

            {/* clearance card */}
            {CLEARANCES.map(c => (
              <div key={c.id} className="rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(31,181,122,0.10) 0%, rgba(22,39,59,0.90) 60%)',
                  border: '1px solid rgba(31,181,122,0.25)',
                  boxShadow: '0 0 40px rgba(31,181,122,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                  animation: 'slideUp 0.45s ease 0.15s both',
                }}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <PulseRing />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald">Cleared</p>
                      <p className="text-[11px] text-white/40 mt-0.5">{c.issued_by}</p>
                    </div>
                    <ShieldCheck size={16} className="text-emerald ml-auto" />
                  </div>

                  <p className="text-[11px] text-white/40 mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {c.notes}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[{ label: 'Issued', val: c.issue_date }, { label: 'Expires', val: c.expiry_date }].map(d => (
                      <div key={d.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">{d.label}</p>
                        <p className="text-xs font-semibold text-white">{d.val}</p>
                      </div>
                    ))}
                  </div>

                  <ExpiryBar pct={expiryPct} />
                </div>
              </div>
            ))}

            {/* AI risk card */}
            <div className="card p-5"
              style={{ animation: 'slideUp 0.45s ease 0.22s both' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(239,83,80,0.10)', border: '1px solid rgba(239,83,80,0.20)' }}>
                  <Heart size={14} style={{ color: '#EF5350' }} />
                </div>
                <h2 className="text-sm font-bold text-white">AI Risk Summary</h2>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(124,141,166,0.12)', color: '#7C8DA6', border: '1px solid rgba(124,141,166,0.20)' }}>Advisory</span>
              </div>

              <div className="space-y-3">
                {RISK_ITEMS.map((item, i) => (
                  <div key={item.label}
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                      transition: `opacity 0.4s ease ${0.3 + i * 0.07}s, transform 0.4s cubic-bezier(0.19,1,0.22,1) ${0.3 + i * 0.07}s`,
                    }}>
                    <RiskRing color={item.color} score={item.score} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{item.label}</p>
                      <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-white/20 mt-4 leading-relaxed">AI outputs are advisory decision-support signals, not clinical diagnoses. Final medical decisions rest with qualified professionals.</p>
            </div>
          </div>

          {/* RIGHT: records — 3 cols */}
          <div className="lg:col-span-3">
            <div className="card p-5 h-full"
              style={{ animation: 'slideUp 0.45s ease 0.20s both' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(47,128,237,0.12)', border: '1px solid rgba(47,128,237,0.22)' }}>
                    <FileText size={14} className="text-azure" />
                  </div>
                  <h2 className="text-sm font-bold text-white">Medical Records</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/25">{RECORDS.length} records</span>
                  <button onClick={() => setShowUpload(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-azure hover:text-azure/70 transition-colors">
                    <Plus size={11} /> Upload
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {RECORDS.map((rec, i) => {
                  const color = TYPE_COLORS[rec.type] ?? '#7C8DA6';
                  const isHov = hoveredRec === rec.id;
                  return (
                    <div key={rec.id}
                      onMouseEnter={() => setHoveredRec(rec.id)}
                      onMouseLeave={() => setHoveredRec(null)}
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{
                        background: isHov ? `${color}08` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isHov ? color + '28' : 'rgba(255,255,255,0.07)'}`,
                        transform: isHov ? 'translateX(4px)' : 'translateX(0)',
                        opacity: mounted ? 1 : 0,
                        transition: 'background 0.2s, border-color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
                        transitionDelay: mounted ? '0ms' : `${0.25 + i * 0.07}s`,
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
                        <rec.icon size={16} style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{rec.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>{rec.type}</span>
                          <span className="text-[10px] text-white/25">·</span>
                          <span className="text-[10px] text-white/35 truncate">{rec.provider}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="text-[11px] text-white/30">{rec.date}</p>
                        {rec.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(31,181,122,0.12)', border: '1px solid rgba(31,181,122,0.25)', color: '#1FB57A' }}>
                            <ShieldCheck size={8} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(245,166,35,0.10)', border: '1px solid rgba(245,166,35,0.22)', color: '#F5A623' }}>
                            <Clock size={8} /> Pending
                          </span>
                        )}
                      </div>

                      <ChevronRight size={13} className="text-white/15 flex-shrink-0"
                        style={{ opacity: isHov ? 1 : 0, transition: 'opacity 0.2s' }} />
                    </div>
                  );
                })}
              </div>

              {/* request verification CTA */}
              <div className="mt-5 p-4 rounded-2xl flex items-center gap-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(47,128,237,0.07) 0%, rgba(184,241,53,0.05) 100%)',
                  border: '1px solid rgba(47,128,237,0.18)',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(47,128,237,0.14)', border: '1px solid rgba(47,128,237,0.22)' }}>
                  <Sparkles size={14} className="text-azure" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-azure">Get Official Verification</p>
                  <p className="text-[11px] text-white/35 mt-0.5">Connect a licensed clinic to issue verified digital certificates in minutes.</p>
                </div>
                <button
                  className="flex-shrink-0 text-[11px] font-bold text-azure flex items-center gap-1 hover:text-azure/70 transition-colors">
                  Connect <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
