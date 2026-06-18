import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, X, Loader2, Check, ChevronLeft,
  AlertCircle, User, Calendar, Clock, MapPin, Target,
  Trophy, ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────
interface VerificationRequest {
  id: string;
  participation_id: string;
  athlete_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  participations: {
    id: string;
    sport: string;
    competition_name: string;
    match_date: string;
    opponent_name: string;
    venue: string | null;
    position: string;
    minutes_played: number;
    is_starter: boolean;
    jersey_number: number | null;
  };
  athlete?: {
    full_name: string;
    email: string;
  };
}

const FOOTBALL_STATS_TEMPLATE = {
  goals: 0,
  assists: 0,
  shots: 0,
  shots_on_target: 0,
  passes: 0,
  pass_accuracy: '0',
  tackles: 0,
  fouls_drawn: 0,
  fouls_committed: 0,
  dribbles_attempted: 0,
  dribbles_success: 0,
  yellow_cards: 0,
  red_cards: 0,
  rating: 0,
};

const GENERIC_STATS_TEMPLATE: Record<string, number> = {
  score: 0,
};

const FOOTBALL_FIELDS: Array<{ key: string; label: string; type: 'int' | 'dec' | 'pct' }> = [
  { key: 'goals',              label: 'Goals',              type: 'int' },
  { key: 'assists',            label: 'Assists',            type: 'int' },
  { key: 'shots',              label: 'Shots',              type: 'int' },
  { key: 'shots_on_target',    label: 'Shots on Target',    type: 'int' },
  { key: 'passes',             label: 'Passes',             type: 'int' },
  { key: 'pass_accuracy',      label: 'Pass Accuracy (%)',  type: 'pct' },
  { key: 'tackles',            label: 'Tackles',            type: 'int' },
  { key: 'fouls_drawn',        label: 'Fouls Drawn',        type: 'int' },
  { key: 'fouls_committed',    label: 'Fouls Committed',    type: 'int' },
  { key: 'dribbles_attempted', label: 'Dribbles Attempted', type: 'int' },
  { key: 'dribbles_success',   label: 'Dribbles Successful',type: 'int' },
  { key: 'yellow_cards',       label: 'Yellow Cards',       type: 'int' },
  { key: 'red_cards',          label: 'Red Cards',          type: 'int' },
  { key: 'rating',             label: 'Match Rating (0–10)',type: 'dec' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
      {children}
    </label>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function VerifyPerformancePage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    const { data } = await supabase
      .from('verification_requests')
      .select(`
        id, participation_id, athlete_id, status, notes, created_at,
        participations (
          id, sport, competition_name, match_date, opponent_name, venue,
          position, minutes_played, is_starter, jersey_number
        )
      `)
      .eq('id', requestId)
      .maybeSingle();

    if (!data) { setLoading(false); return; }

    // Load athlete profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', data.athlete_id)
      .maybeSingle();

    const req = { ...data, athlete: profile ?? undefined } as VerificationRequest;
    setRequest(req);

    // Pre-fill stats template
    const sport = req.participations?.sport?.toLowerCase() ?? '';
    setStats(sport === 'football' ? { ...FOOTBALL_STATS_TEMPLATE } : { ...GENERIC_STATS_TEMPLATE });

    setLoading(false);
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove() {
    if (!request || !user) return;
    setSaving(true);
    try {
      // Write performance record (service role not available from client — use regular insert;
      // RLS for club role allows insert if they are the requested_to verifier)
      const part = request.participations;
      await supabase.from('performances').insert({
        participation_id: request.participation_id,
        athlete_id: request.athlete_id,
        sport: part.sport,
        competition: part.competition_name,
        source: 'human',
        source_display: 'Club Verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        stats,
        version: 1,
        is_latest: true,
      });

      // Update verification request
      await supabase
        .from('verification_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      // Update participation status
      await supabase
        .from('participations')
        .update({ status: 'verified', verified_at: new Date().toISOString() })
        .eq('id', request.participation_id);

      setSaving(false);
      setDone('approved');
    } catch (err) {
      console.error('Approve error:', err);
      setSaving(false);
    }
  }

  async function handleReject() {
    if (!request) return;
    setSaving(true);
    await supabase
      .from('verification_requests')
      .update({ status: 'rejected', notes: rejectReason || 'Rejected by club.' })
      .eq('id', request.id);

    await supabase
      .from('participations')
      .update({ status: 'rejected' })
      .eq('id', request.participation_id);

    setSaving(false);
    setDone('rejected');
  }

  function setStatField(key: string, val: string) {
    setStats(s => ({ ...s, [key]: val }));
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertCircle size={28} className="text-white/20" />
        <p className="text-white/40 text-sm">Verification request not found.</p>
        <button onClick={() => navigate(-1)} className="text-azure text-sm hover:underline">
          Go back
        </button>
      </div>
    );
  }

  // ── Done state ─────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-5 py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: done === 'approved' ? 'rgba(31,181,122,0.12)' : 'rgba(239,83,80,0.12)',
            border: `1px solid ${done === 'approved' ? 'rgba(31,181,122,0.30)' : 'rgba(239,83,80,0.30)'}`,
            boxShadow: `0 0 32px ${done === 'approved' ? 'rgba(31,181,122,0.20)' : 'rgba(239,83,80,0.15)'}`,
          }}>
          {done === 'approved'
            ? <ShieldCheck size={28} style={{ color: '#1FB57A' }} />
            : <X size={28} style={{ color: '#EF5350' }} />}
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">
            {done === 'approved' ? 'Performance Verified' : 'Request Rejected'}
          </p>
          <p className="text-white/40 text-sm mt-1">
            {done === 'approved'
              ? 'Stats have been recorded and the athlete has been notified.'
              : 'The athlete has been notified.'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.70)' }}
        >
          <ChevronLeft size={14} /> Back
        </button>
      </div>
    );
  }

  const part = request.participations;
  const isFootball = part?.sport?.toLowerCase() === 'football';
  const matchDate = part?.match_date
    ? new Date(part.match_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-2xl space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/08 transition-colors">
          <ChevronLeft size={15} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Verify Performance</h1>
          <p className="text-[11px] text-white/30 mt-0.5">Confirm statistics for athlete participation</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.28)', color: '#F5A623' }}>
            <Clock size={11} /> Pending Review
          </span>
        </div>
      </div>

      {/* Athlete + match card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(47,128,237,0.10)', border: '1px solid rgba(47,128,237,0.20)' }}>
            <User size={16} className="text-azure" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{request.athlete?.full_name ?? 'Unknown Athlete'}</p>
            <p className="text-[11px] text-white/35">{request.athlete?.email ?? ''}</p>
          </div>
        </div>

        <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: Trophy,   label: 'Sport',       val: part?.sport ?? '—' },
            { icon: Trophy,   label: 'Competition', val: part?.competition_name ?? '—' },
            { icon: Calendar, label: 'Date',        val: matchDate },
            { icon: Target,   label: 'Opponent',    val: part?.opponent_name ?? '—' },
            { icon: User,     label: 'Position',    val: part?.position ?? '—' },
            { icon: Clock,    label: 'Minutes',     val: `${part?.minutes_played ?? 0}'` },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5 flex items-center gap-1">
                <Icon size={9} /> {label}
              </p>
              <p className="text-sm text-white/80 font-medium">{val}</p>
            </div>
          ))}
        </div>

        {part?.venue && (
          <div className="flex items-center gap-2 text-xs text-white/35">
            <MapPin size={11} />
            <span>{part.venue}</span>
          </div>
        )}

        {request.notes && (
          <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.15)' }}>
            <AlertCircle size={12} style={{ color: '#F5A623', flexShrink: 0, marginTop: 1 }} />
            <p className="text-[11px] text-white/50">{request.notes}</p>
          </div>
        )}
      </div>

      {/* Stats entry */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(31,181,122,0.10)', border: '1px solid rgba(31,181,122,0.22)' }}>
            <ShieldCheck size={14} style={{ color: '#1FB57A' }} />
          </div>
          <h3 className="text-sm font-bold text-white">Enter Match Statistics</h3>
        </div>

        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(47,128,237,0.07)', border: '1px solid rgba(47,128,237,0.14)' }}>
          <ShieldAlert size={12} style={{ color: '#2F80ED', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[11px] text-white/45">
            You are providing official statistics as the club representative. These will be recorded as verified and cannot be changed by the athlete.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(isFootball ? FOOTBALL_FIELDS : Object.keys(stats).map(key => ({
            key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            type: 'int' as const,
          }))).map(field => (
            <div key={field.key}>
              <FieldLabel>{field.label}</FieldLabel>
              <input
                type="number"
                min={0}
                step={field.type === 'dec' ? 0.1 : 1}
                max={field.type === 'dec' ? 10 : undefined}
                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none transition-all text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                value={String(stats[field.key] ?? 0)}
                onChange={e => setStatField(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reject reason panel */}
      {showReject && (
        <div className="card p-4 space-y-3">
          <FieldLabel>Reason for rejection (optional)</FieldLabel>
          <textarea
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,83,80,0.25)', minHeight: 80 }}
            placeholder="e.g. Athlete did not play in this match"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowReject(false)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={handleReject}
              className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.35)', color: '#EF5350' }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {/* Action footer */}
      {!showReject && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowReject(true)}
            className="px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            style={{ background: 'rgba(239,83,80,0.10)', border: '1px solid rgba(239,83,80,0.25)', color: '#EF5350' }}
          >
            <X size={14} /> Reject
          </button>
          <button
            disabled={saving}
            onClick={handleApprove}
            className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
            style={{ background: '#1FB57A', color: '#fff', boxShadow: '0 4px 20px rgba(31,181,122,0.35)' }}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : <><ShieldCheck size={14} /> Verify &amp; Save Stats</>}
          </button>
        </div>
      )}
    </div>
  );
}
