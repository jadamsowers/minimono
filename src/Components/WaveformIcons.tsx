import React from 'react';

export const WaveformIcon: React.FC<{ type: string; color?: string }> = ({ type, color = '#f2e9d2' }) => {
  const s = 14; // size
  return (
    <svg width={s} height={s} viewBox="0 0 10 10" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      {type === 'tri' && <path d="M 1 8 L 5 2 L 9 8" />}
      {type === 'tri-saw' && <path d="M 1 8 L 5 2 L 9 8 L 9 2" />}
      {type === 'rev-saw' && <path d="M 1 2 L 9 8 V 2" />}
      {type === 'saw' && <path d="M 1 8 L 9 2 L 9 8" />}
      {type === 'sq' && <path d="M 1 8 V 2 H 5 V 8 H 9 V 2" />}
      {type === 'pulse-wide' && <path d="M 1 8 V 2 H 7 V 8 H 9 V 2" />}
      {type === 'pulse-narrow' && <path d="M 1 8 V 2 H 3 V 8 H 9 V 2" />}
      
      {/* Noise Icons - jagged "static" waves */}
      {(type === 'white' || type === 'pink' || type === 'brown') && (
        <path d="M 1 5 L 2 3 L 3 6 L 4 2 L 5 8 L 6 4 L 7 7 L 8 2 L 9 5" />
      )}
    </svg>
  );
};
