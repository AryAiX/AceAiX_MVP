import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const SPORTS = ['Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 'Cricket', 'Rugby', 'Volleyball'];
const POSITIONS: Record<string, string[]> = {
  Football: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker', 'Center-Back', 'Full-Back', 'Winger'],
  Basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  Athletics: ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower', 'Hurdler'],
  Swimming: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Individual Medley'],
  Tennis: ['Singles Player', 'Doubles Specialist'],
  Cricket: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
  Rugby: ['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 'Scrum-Half', 'Fly-Half', 'Winger', 'Centre', 'Full-Back'],
  Volleyball: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Libero', 'Opposite Hitter'],
};

export default function OnboardingPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [sport, setSport] = useState('Football');
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('amateur');
  const [club, setClub] = useState('');
  const [nationality, setNationality] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!profile) return;
    setLoading(true);
    await supabase
      .from('athlete_profiles')
      .update({ sport, position_primary: position, level, current_club: club, nationality })
      .eq('user_id', profile.id);
    await refreshProfile();
    setLoading(false);
    navigate('/athlete/dashboard');
  }

  function skipToRole() {
    if (!profile) return;
    if (profile.role === 'scout' || profile.role === 'club') navigate('/recruiter/dashboard');
    else if (profile.role === 'medical_partner') navigate('/partner/dashboard');
    else if (profile.role === 'admin') navigate('/admin/dashboard');
    else navigate('/athlete/dashboard');
  }

  return (
    <div className="min-h-screen bg-navy-800 flex items-center justify-center px-4 bg-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900/60 via-transparent to-navy-700/20" />

      <div className="relative w-full max-w-lg animate-slide-up">
        <div className="card">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center" style={{ gap: 6 }}>
                <img src="/AceAiX_logo_transparent%20copy%20copy%20copy.png" alt="AceAiX" style={{ width: 140, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(47,128,237,0.6))' }} />
                <img src="/AceAiX_logo_transparent2%20copy.png" alt="AceAiX" style={{ height: 68, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(47,128,237,0.4))' }} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Set up your profile</h1>
            <p className="text-slate-400 text-sm mt-1">Help scouts and clubs find you faster</p>
          </div>

          {profile?.role === 'athlete' ? (
            <div className="space-y-5">
              <div>
                <label className="label">Primary Sport</label>
                <div className="grid grid-cols-4 gap-2">
                  {SPORTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSport(s); setPosition(''); }}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                        sport === s
                          ? 'bg-blue-600/20 border-blue-600/60 text-blue-400'
                          : 'bg-navy-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select position</option>
                  {(POSITIONS[sport] || []).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Current Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['amateur', 'semi-pro', 'professional'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                        level === l
                          ? 'bg-blue-600/20 border-blue-600/60 text-blue-400'
                          : 'bg-navy-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Current Club (optional)</label>
                <input
                  type="text"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  placeholder="e.g. Al Ain FC"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. UAE"
                  className="input-field"
                />
              </div>

              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><CheckCircle size={18} /> Complete Setup</>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-6">Welcome aboard! Your account is ready. You can complete your profile from the dashboard.</p>
              <button onClick={skipToRole} className="btn-primary justify-center px-8 py-3 text-base">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
