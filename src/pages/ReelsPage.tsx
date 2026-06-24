import React from 'react';
import { Film, ArrowLeft } from 'lucide-react';
import ReelsPlayer from '../components/reels/ReelsPlayer';
import { DEMO_REELS } from '../data/storiesReelsData';
import { useNavigate } from 'react-router-dom';

export default function ReelsPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-[#080F1C]" style={{ height: '100dvh' }}>
      {/* Top bar */}
      <div
        className="absolute top-0 inset-x-0 z-50 flex items-center gap-3 px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, rgba(8,15,28,0.95) 0%, transparent 100%)',
          backdropFilter: 'blur(0px)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(22,39,59,0.80)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={18} className="text-white/70" />
        </button>

        <div className="flex items-center gap-2">
          <Film size={16} style={{ color: '#B8F135' }} />
          <span className="font-semibold text-white text-base font-display">Reels</span>
        </div>
      </div>

      <ReelsPlayer reels={DEMO_REELS} />
    </div>
  );
}
