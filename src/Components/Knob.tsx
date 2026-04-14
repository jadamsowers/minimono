import React, { useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  label?: string;
  onChange: (value: number) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  initial?: number;
  step?: number;
}

interface KnobRef {
  setValue: (value: number) => void;
}

const Knob = forwardRef<KnobRef, KnobProps>(
  (
    {
      value,
      min,
      max,
      label,
      onChange,
      size = 'medium',
      disabled = false,
      initial = min,
      step = 0.01,
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startVal = useRef(0);

    const rotation = useCallback((v: number) => {
      const range = max - min;
      const normalized = Math.max(min, Math.min(max, v));
      const fraction = (normalized - min) / range;
      return -135 + (270 * fraction); // -135° to 135° rotation
    }, [min, max]);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (disabled) return;
      setIsDragging(true);
      startY.current = e.clientY;
      startVal.current = value;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaY = startY.current - e.clientY;
      const sensitivity = 0.005;
      const range = max - min;
      const deltaVal = deltaY * sensitivity * range;
      let newValue = startVal.current + deltaVal;
      newValue = Math.max(min, Math.min(max, newValue));
      if (step) newValue = Math.round(newValue / step) * step;
      onChange(newValue);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    useImperativeHandle(ref, () => ({
      setValue: (v: number) => {
        onChange(v);
      },
    }));

    const knobSize = {
      small: 32,
      medium: 46,
      large: 64,
    }[size];

    const currentRotation = rotation(value);

    return (
      <div
        className="knob-wrapper"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%',
          maxWidth: '80px',
          flexShrink: 0,
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div
          className="knob-body"
          style={{ 
            width: knobSize, 
            height: knobSize,
            position: 'relative',
            cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
            touchAction: 'none',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2a2a2a 0%, #000 100%)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${currentRotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={() => !disabled && onChange(initial)}
        >
          {/* Knurling / Textured Grip */}
          <div style={{
            position: 'absolute',
            inset: 1,
            borderRadius: '50%',
            background: `repeating-conic-gradient(
              from 0deg,
              #444 0deg 0.2deg,
              #111 0.2deg 4deg
            )`,
            opacity: 0.2,
            pointerEvents: 'none'
          }} />

          {/* Authentic 70s Metal Cap */}
          <div style={{
            width: '72%',
            height: '72%',
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, #f0f0f0, #888 65%, #444 100%)
            `,
            boxShadow: '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {/* Brushed Metal Texture */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 0.5px, rgba(255,255,255,0.03) 0.5px, rgba(255,255,255,0.03) 1px)`,
              opacity: 0.4
            }} />
          </div>

          {/* Indicator notched at the edge */}
          <div style={{
            position: 'absolute',
            top: '4px',
            width: '2px',
            height: '20%',
            background: '#ff6600',
            boxShadow: '0 0 2px rgba(255,102,0,0.5)',
            borderRadius: '1px',
            zIndex: 10
          }} />
        </div>

        {label && (
          <span 
            className="knob-label" 
            style={{ 
              fontFamily: 'var(--font-geometric)',
              fontSize: '8px',
              fontWeight: 700,
              color: 'var(--label-color)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              whiteSpace: 'nowrap',
              width: '100%',
              display: 'block',
              textAlign: 'center',
              marginTop: '6px',
              opacity: 0.8
            }}
          >
            {label}
          </span>
        )}

        <span 
          className="knob-value" 
          style={{ 
            fontFamily: 'var(--font-geometric)',
            fontSize: '8px',
            color: '#777',
            fontWeight: 400,
            marginTop: '1px'
          }}
        >
          {Math.round(value * 10) / 10}
        </span>
      </div>
    );
  }
);

Knob.displayName = 'Knob';

export default Knob;
