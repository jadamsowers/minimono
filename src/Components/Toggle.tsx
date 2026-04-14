import React from 'react';
import '../styles/toggle.css';

interface ToggleProps {
  active: boolean;
  label?: string;
  onClick: (active: boolean) => void;
  color?: 'blue' | 'red' | 'yellow' | 'default';
  size?: 'small' | 'medium';
}

const Toggle: React.FC<ToggleProps> = ({
  active,
  label,
  onClick,
  color = 'default',
  size = 'medium'
}) => {
  return (
    <div className="toggle-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div 
        className={`rocker-switch ${active ? 'active' : ''} ${color} ${size}`}
        onClick={() => onClick(!active)}
      >
        <div className="rocker-switch-inner">
          <div className="rocker-switch-cap" />
          <div className="rocker-switch-highlight" />
        </div>
      </div>
      {label && <span style={{ fontSize: 8, color: '#f2e9d2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>}
    </div>
  );
};

export default Toggle;
