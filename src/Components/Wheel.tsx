import React, { useState, useRef, useCallback } from 'react';

interface WheelProps {
  type: 'pitch' | 'mod';
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const Wheel: React.FC<WheelProps> = ({ type, value, onChange, label }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY.current - e.clientY;
    const sensitivity = 0.005;
    let newVal = startVal.current + (deltaY * sensitivity);
    
    // Pitch wheel is 0 centered (-1 to 1), mod wheel is 0 to 1
    if (type === 'pitch') {
      newVal = Math.max(-1, Math.min(1, newVal));
    } else {
      newVal = Math.max(0, Math.min(1, newVal));
    }
    
    onChange(newVal);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    // Snap pitch wheel back to center
    if (type === 'pitch') {
      onChange(0);
    }
  };

  // Map 0..1 to -40..40 for visual rotation/position
  // For pitch -1..1 map to -40..40
  const visualPos = type === 'pitch' ? value * 40 : (value - 0.5) * 80;

  return (
    <div className="control-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 7, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <div 
        className="wheel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <div 
          className="wheel-handle" 
          style={{ 
            transform: `translateY(${-visualPos}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default Wheel;
