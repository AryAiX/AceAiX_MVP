import React from 'react';
import { ShieldCheck, Clock, UserCheck } from 'lucide-react';

interface SourceBadgeProps {
  source: string;
  sourceDisplay: string;
  verifierName?: string | null;
  size?: 'sm' | 'md';
}

export default function SourceBadge({ source, sourceDisplay, verifierName, size = 'md' }: SourceBadgeProps) {
  const isVerified = source !== 'pending' && source !== 'human_required';
  const isHuman = source === 'human_required' || source === 'human';
  const isPending = source === 'pending';

  const textClass = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const iconSize = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  if (isPending) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${textClass} ${px}`}
        style={{
          background: 'rgba(245,166,35,0.12)',
          border: '1px solid rgba(245,166,35,0.30)',
          color: '#F5A623',
        }}
      >
        <Clock size={iconSize} />
        Awaiting Verification
      </span>
    );
  }

  if (isHuman) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${textClass} ${px}`}
        style={{
          background: 'rgba(31,181,122,0.12)',
          border: '1px solid rgba(31,181,122,0.30)',
          color: '#1FB57A',
        }}
      >
        <UserCheck size={iconSize} />
        {verifierName ? `Verified by ${verifierName}` : 'Club Verified'}
      </span>
    );
  }

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${textClass} ${px}`}
        style={{
          background: 'rgba(31,181,122,0.10)',
          border: '1px solid rgba(31,181,122,0.28)',
          color: '#1FB57A',
        }}
      >
        <ShieldCheck size={iconSize} />
        {sourceDisplay}
      </span>
    );
  }

  return null;
}
