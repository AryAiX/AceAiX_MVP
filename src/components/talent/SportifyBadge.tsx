import React, { useEffect, useState } from 'react';
import { ShieldCheck, Link as LinkIcon } from 'lucide-react';

interface SportifyBadgeProps {
  date?: string;
  provenanceHash?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SportifyBadge({ date, provenanceHash, size = 'md' }: SportifyBadgeProps) {
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStamped(true), 200);
    return () => clearTimeout(t);
  }, []);

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <>
      <style>{`
        @keyframes stampIn {
          0%   { opacity: 0; transform: scale(1.6) rotate(-8deg); }
          60%  { opacity: 1; transform: scale(0.94) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes hashReveal {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="inline-flex flex-col gap-1.5"
        style={{
          opacity: stamped ? 1 : 0,
          animation: stamped ? 'stampIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
        }}
      >
        {/* Main badge */}
        <div
          className="inline-flex items-center gap-2 rounded-xl"
          style={{
            padding: isLg ? '10px 16px' : isSm ? '4px 10px' : '7px 12px',
            background: 'linear-gradient(135deg, rgba(31,181,122,0.15) 0%, rgba(31,181,122,0.07) 100%)',
            border: '1px solid rgba(31,181,122,0.35)',
            boxShadow: '0 0 20px rgba(31,181,122,0.12)',
          }}
        >
          <div
            className="rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              width: isLg ? 30 : isSm ? 18 : 24,
              height: isLg ? 30 : isSm ? 18 : 24,
              background: 'rgba(31,181,122,0.2)',
              boxShadow: '0 0 10px rgba(31,181,122,0.3)',
            }}
          >
            <ShieldCheck size={isLg ? 16 : isSm ? 10 : 13} color="#1FB57A" />
          </div>
          <div>
            <p
              className="font-bold leading-none"
              style={{ fontSize: isLg ? 13 : isSm ? 10 : 11, color: '#1FB57A' }}
            >
              Verified by Sportify Academy
            </p>
            {date && (
              <p
                className="leading-none mt-0.5"
                style={{ fontSize: isLg ? 11 : 9, color: 'rgba(31,181,122,0.65)' }}
              >
                {date}
              </p>
            )}
          </div>
        </div>

        {/* Provenance hash */}
        {provenanceHash && !isSm && (
          <div
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'hashReveal 0.4s ease 0.5s both',
            }}
          >
            <LinkIcon size={9} style={{ color: '#9DB0C6', flexShrink: 0 }} />
            <span
              className="font-mono truncate"
              style={{ fontSize: 9, color: '#9DB0C6', maxWidth: 220 }}
              title={`Provenance: ${provenanceHash}`}
            >
              {provenanceHash.slice(0, 12)}…{provenanceHash.slice(-8)}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(157,176,198,0.5)' }}>tamper-evident</span>
          </div>
        )}
      </div>
    </>
  );
}
