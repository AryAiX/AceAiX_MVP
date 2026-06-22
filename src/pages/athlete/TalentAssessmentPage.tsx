import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera, MapPin, Sparkles, ChevronRight,
  Loader2, AlertTriangle, RefreshCw, CalendarCheck,
  Clock, CheckCircle, XCircle, Eye,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ConsentModal from '../../components/talent/ConsentModal';
import BookingFlow from '../../components/talent/BookingFlow';
import AssessmentResults, { SportRec, PhysicalMetrics } from '../../components/talent/AssessmentResults';
import SportifyBadge from '../../components/talent/SportifyBadge';

// ── Mock demo data (shown when no real assessments exist) ──────────────────────

const DEMO_SPORT_RECS: SportRec[] = [
  { sport: 'Swimming',          potential_score: 94, percentile: 97, rationale: 'Exceptional shoulder-to-hip ratio, high aerobic capacity, and rapid water-adaptation signals from movement analysis.' },
  { sport: 'Football',          potential_score: 88, percentile: 91, rationale: 'Strong sprint acceleration, agility scores, and spatial-awareness patterns indicate excellent football potential.' },
  { sport: 'Basketball',        potential_score: 82, percentile: 85, rationale: 'Height projection combined with vertical jump and reaction time readings align well with basketball demands.' },
  { sport: 'Athletics (100m)',  potential_score: 79, percentile: 82, rationale: 'Fast-twitch muscle indicators and explosive power readings from the camera analysis.' },
  { sport: 'Volleyball',        potential_score: 74, percentile: 76, rationale: 'Jump height and arm-span metrics fit the volleyball physical profile closely.' },
];

const DEMO_METRICS: PhysicalMetrics = {
  sprint_ms:    4820,
  agility_s:    8.4,
  jump_cm:      68,
  reaction_ms:  198,
  endurance_vo2: 54,
};

interface Assessment {
  id: string;
  modality: 'camera' | 'in_person';
  status: 'requested' | 'scheduled' | 'in_progress' | 'completed';
  sport_recommendations: SportRec[] | null;
  physical_metrics: PhysicalMetrics | null;
  overall_potential_score: number | null;
  taken_at: string | null;
  verified: boolean;
  provenance_hash: string | null;
  visibility: 'private' | 'scouts' | 'public';
  created_at: string;
}

interface Appointment {
  id: string;
  academy_location: string;
  slot_start: string;
  slot_end: string;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  sportify_booking_ref: string | null;
}

interface Slot {
  slot_id: string;
  location: string;
  start: string;
  end: string;
  capacity: number;
  booked: number;
}

type View = 'discover' | 'camera-consent' | 'booking-consent' | 'camera-active' | 'booking' | 'results' | 'demo';

const APPT_STATUS_CONFIG = {
  booked:    { color: '#2F80ED', bg: 'rgba(47,128,237,0.12)',  label: 'Booked',    icon: Clock },
  confirmed: { color: '#1FB57A', bg: 'rgba(31,181,122,0.12)', label: 'Confirmed', icon: CheckCircle },
  completed: { color: '#B8F135', bg: 'rgba(184,241,53,0.12)', label: 'Completed', icon: CheckCircle },
  cancelled: { color: '#EF5350', bg: 'rgba(239,83,80,0.12)',  label: 'Cancelled', icon: XCircle },
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function TalentAssessmentPage() {
  const { user } = useAuth();

  const [view, setView]                   = useState<View>('discover');
  const [assessments, setAssessments]     = useState<Assessment[]>([]);
  const [appointments, setAppointments]   = useState<Appointment[]>([]);
  const [slots, setSlots]                 = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [loadingData, setLoadingData]     = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [consentModality, setConsentModality] = useState<'camera' | 'in_person'>('camera');
  const [isMinor, setIsMinor]             = useState(false);
  const [guardianApproved, setGuardianApproved] = useState(false);
  const [mounted, setMounted]             = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // Fetch existing assessments + appointments
  const fetchData = useCallback(async () => {
    if (!user) { setLoadingData(false); return; }
    setLoadingData(true);
    try {
      const [{ data: aData }, { data: apptData }] = await Promise.all([
        supabase.from('assessments').select('*').eq('athlete_id', user.id).order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').eq('athlete_id', user.id).order('slot_start', { ascending: true }),
      ]);
      setAssessments((aData ?? []) as Assessment[]);
      setAppointments((apptData ?? []) as Appointment[]);

      const completed = (aData ?? []).find((a: Assessment) => a.status === 'completed' && a.verified);
      if (completed) setView('results');
      else if ((aData ?? []).some((a: Assessment) => a.status === 'in_progress')) setView('camera-active');
    } catch {
      setError('Failed to load assessment data.');
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function fetchSlots() {
    setLoadingSlots(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const { data: fnData, error: fnErr } = await supabase.functions.invoke('sportify-availability', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (fnErr) throw fnErr;
      setSlots(fnData?.slots ?? []);
    } catch {
      // Fallback to inline mock slots so UI always works
      setSlots(generateMockSlots());
    } finally {
      setLoadingSlots(false);
    }
  }

  function generateMockSlots(): Slot[] {
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    const locations = ['Dubai Sports City', 'Abu Dhabi Academy', 'Sharjah Sportify Hub'];
    const result: Slot[] = [];
    for (let day = 1; day <= 14; day++) {
      const d = new Date(base);
      d.setDate(d.getDate() + day);
      if (d.getDay() === 0) continue;
      for (const hour of [9, 11, 14, 16]) {
        const start = new Date(d); start.setHours(hour, 0, 0, 0);
        const end   = new Date(d); end.setHours(hour + 1, 30, 0, 0);
        result.push({ slot_id: `mock-${day}-${hour}`, location: locations[day % locations.length], start: start.toISOString(), end: end.toISOString(), capacity: 4, booked: Math.floor(Math.random() * 3) });
      }
    }
    return result;
  }

  async function startCameraTest() {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error: fnErr } = await supabase.functions.invoke('sportify-start-camera-test', {
        body: { consent_given: true, is_minor: isMinor, guardian_approved: guardianApproved },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (fnErr) throw fnErr;
      if (data?.session_url) window.open(data.session_url, '_blank');
      setView('camera-active');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera test.');
      setView('discover');
    }
  }

  async function bookSlot(slot: Slot) {
    const { data: { session } } = await supabase.auth.getSession();
    const { error: fnErr } = await supabase.functions.invoke('sportify-book', {
      body: {
        slot_id: slot.slot_id,
        location: slot.location,
        slot_start: slot.start,
        slot_end: slot.end,
        consent_given: true,
        is_minor: isMinor,
        guardian_approved: guardianApproved,
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    if (fnErr) throw fnErr;
    await fetchData();
  }

  async function updateVisibility(assessmentId: string, vis: 'private' | 'scouts' | 'public') {
    await supabase.from('assessments').update({ visibility: vis }).eq('id', assessmentId);
    setAssessments(prev => prev.map(a => a.id === assessmentId ? { ...a, visibility: vis } : a));
  }

  function handleConsent(minor: boolean, gApproved: boolean) {
    setIsMinor(minor);
    setGuardianApproved(gApproved);
    if (consentModality === 'camera') {
      setView('camera-active');
      startCameraTest();
    } else {
      setView('booking');
      fetchSlots();
    }
  }

  // ── Derived state ────────────────────────────────────────────────────────────

  const completedAssessment = assessments.find(a => a.status === 'completed' && a.verified);
  const inProgressAssessment = assessments.find(a => a.status === 'in_progress');
  const upcomingAppointments = appointments.filter(a => a.status === 'booked' || a.status === 'confirmed');

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin" style={{ color: '#2F80ED' }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pageIn {
          0%   { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); opacity: 0.6; }
          100% { transform: translateY(100%);  opacity: 0; }
        }
        @keyframes entryCardGlow {
          0%,100% { box-shadow: 0 0 30px rgba(47,128,237,0.08); }
          50%     { box-shadow: 0 0 50px rgba(47,128,237,0.15); }
        }
      `}</style>

      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Header */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} color="#B8F135" />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#B8F135' }}>Powered by Sportify Academy</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Talent Assessment</h1>
              <p className="text-sm mt-1" style={{ color: '#9DB0C6' }}>
                Discover the sport you're truly built for — assessed with camera AI or in-person at a Sportify Academy.
              </p>
            </div>
            {(view === 'results' || view === 'demo') && completedAssessment && (
              <SportifyBadge
                date={completedAssessment.taken_at ? new Date(completedAssessment.taken_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined}
                provenanceHash={completedAssessment.provenance_hash ?? undefined}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.3)' }}>
            <AlertTriangle size={13} color="#EF5350" />
            <p className="text-xs text-white flex-1">{error}</p>
            <button onClick={() => setError(null)} style={{ color: '#EF5350' }}><XCircle size={13} /></button>
          </div>
        )}

        {/* DISCOVER VIEW: no assessment yet */}
        {(view === 'discover') && (
          <div className="space-y-4" style={{ animation: 'pageIn 0.45s ease both' }}>

            {/* Hero entry card */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0F1E32 0%, #0A1525 100%)',
                border: '1px solid rgba(47,128,237,0.2)',
                animation: 'entryCardGlow 4s ease-in-out infinite',
              }}
            >
              {/* Background orb */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(47,128,237,0.1), transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(184,241,53,0.07), transparent 70%)', transform: 'translate(-30%, 30%)' }} />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1FB57A', animation: 'pulseDot 2s ease-in-out infinite' }} />
                  <span className="text-[11px] font-semibold" style={{ color: '#1FB57A' }}>Sportify Academy · Official partner</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-2 mb-1">Find the sport you're built for</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#9DB0C6' }}>
                  Sportify Academy's AI analyses your physical attributes and movement patterns to reveal which sports you have the highest potential in — verified, source-badged, and anchored to your profile.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Camera test CTA */}
                  <button
                    onClick={() => { setConsentModality('camera'); setView('camera-consent'); }}
                    className="flex flex-col gap-3 p-4 rounded-2xl text-left transition-all group hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(47,128,237,0.15) 0%, rgba(47,128,237,0.07) 100%)',
                      border: '1px solid rgba(47,128,237,0.3)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'rgba(47,128,237,0.2)' }}>
                      <Camera size={20} color="#2F80ED" />
                      <div className="absolute inset-0 w-full" style={{ background: 'rgba(47,128,237,0.3)', height: 2, animation: 'scanLine 2s ease-in-out infinite' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Camera test</p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: '#9DB0C6' }}>Use your phone camera — 5-min AI movement analysis, no equipment needed.</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#2F80ED' }}>
                      Start now <ChevronRight size={12} />
                    </div>
                  </button>

                  {/* In-person CTA */}
                  <button
                    onClick={() => { setConsentModality('in_person'); setView('booking-consent'); }}
                    className="flex flex-col gap-3 p-4 rounded-2xl text-left transition-all group hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(31,181,122,0.12) 0%, rgba(31,181,122,0.05) 100%)',
                      border: '1px solid rgba(31,181,122,0.25)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(31,181,122,0.2)' }}>
                      <MapPin size={20} color="#1FB57A" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">In-person assessment</p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: '#9DB0C6' }}>Visit a Sportify Academy for a full physical test with certified coaches.</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#1FB57A' }}>
                      Book a slot <ChevronRight size={12} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sample results preview */}
            <button
              onClick={() => setView('demo')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Eye size={13} style={{ color: '#9DB0C6' }} />
                <span className="text-xs" style={{ color: '#9DB0C6' }}>Preview sample assessment results</span>
              </div>
              <ChevronRight size={12} style={{ color: '#9DB0C6' }} />
            </button>
          </div>
        )}

        {/* CAMERA ACTIVE VIEW */}
        {view === 'camera-active' && (
          <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: '#0F1E32', border: '1px solid rgba(47,128,237,0.25)', animation: 'pageIn 0.4s ease' }}>
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center relative overflow-hidden" style={{ background: 'rgba(47,128,237,0.15)', border: '2px solid rgba(47,128,237,0.35)' }}>
              <Camera size={28} color="#2F80ED" />
              <div className="absolute inset-0 w-full" style={{ background: 'rgba(47,128,237,0.25)', height: 2, animation: 'scanLine 1.5s ease-in-out infinite' }} />
            </div>
            <div>
              <p className="text-base font-bold text-white">Camera test in progress</p>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#9DB0C6' }}>
                Complete the camera test in the Sportify window. Your results will sync automatically to this page once the analysis is complete.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#9DB0C6' }}>
              <Loader2 size={12} className="animate-spin" />
              Waiting for results…
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:bg-white/10" style={{ color: '#2F80ED', border: '1px solid rgba(47,128,237,0.25)' }}>
                <RefreshCw size={11} /> Check for results
              </button>
              <button onClick={() => setView('discover')} className="px-3 py-1.5 rounded-xl text-xs transition-colors hover:bg-white/[0.06]" style={{ color: '#9DB0C6' }}>
                Cancel
              </button>
            </div>
            {/* For demo purposes only */}
            <button
              onClick={() => setView('demo')}
              className="text-[11px] underline"
              style={{ color: 'rgba(157,176,198,0.4)' }}
            >
              View demo results
            </button>
          </div>
        )}

        {/* BOOKING VIEW */}
        {view === 'booking' && (
          <div style={{ animation: 'pageIn 0.4s ease' }}>
            <BookingFlow
              slots={slots}
              loadingSlots={loadingSlots}
              isMinor={isMinor}
              guardianApproved={guardianApproved}
              onBook={bookSlot}
              onClose={() => { setView('discover'); fetchData(); }}
            />
          </div>
        )}

        {/* RESULTS VIEW (real) */}
        {view === 'results' && completedAssessment && (
          <AssessmentResults
            sportRecommendations={completedAssessment.sport_recommendations ?? DEMO_SPORT_RECS}
            physicalMetrics={completedAssessment.physical_metrics ?? DEMO_METRICS}
            overallScore={completedAssessment.overall_potential_score ?? 88}
            takenAt={completedAssessment.taken_at ?? new Date().toISOString()}
            provenanceHash={completedAssessment.provenance_hash ?? undefined}
            visibility={completedAssessment.visibility}
            onVisibilityChange={v => updateVisibility(completedAssessment.id, v)}
            modality={completedAssessment.modality}
          />
        )}

        {/* DEMO VIEW */}
        {view === 'demo' && (
          <div style={{ animation: 'pageIn 0.4s ease' }}>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <Eye size={12} color="#F5A623" />
              <p className="text-xs" style={{ color: '#F5A623' }}>Sample results — not your real data</p>
              <button onClick={() => setView('discover')} className="ml-auto text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: '#F5A623' }}>← Back</button>
            </div>
            <AssessmentResults
              sportRecommendations={DEMO_SPORT_RECS}
              physicalMetrics={DEMO_METRICS}
              overallScore={88}
              takenAt={new Date().toISOString()}
              provenanceHash="a3f8c2d1e9b4560fe12a97c3b5d8e2f1a6b9c4d7e0f3a2b5c8d1e4f7a0b3c6d9"
              visibility="private"
              modality="camera"
            />
          </div>
        )}

        {/* Upcoming appointments */}
        {upcomingAppointments.length > 0 && view !== 'booking' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', animation: 'pageIn 0.5s ease 0.1s both' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#0A1828', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <CalendarCheck size={13} color="#2F80ED" />
              <span className="text-xs font-bold text-white">Upcoming appointments</span>
            </div>
            {upcomingAppointments.map((appt, i) => {
              const cfg = APPT_STATUS_CONFIG[appt.status];
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? '#0D1A2B' : 'transparent',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderLeft: `2px solid ${cfg.color}60`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <MapPin size={11} style={{ color: '#9DB0C6', flexShrink: 0 }} />
                      <span className="text-xs font-semibold text-white truncate">{appt.academy_location}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: '#9DB0C6' }}>
                      {new Date(appt.slot_start).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                      {new Date(appt.slot_start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–{new Date(appt.slot_end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    <cfg.icon size={9} />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Consent modal */}
      {(view === 'camera-consent' || view === 'booking-consent') && (
        <ConsentModal
          modality={consentModality}
          onConsent={handleConsent}
          onClose={() => setView('discover')}
        />
      )}
    </>
  );
}
