import React from 'react';
import Knob from './Knob';
import Toggle from './Toggle';
import { FilterConfig } from '../types/synth';

const FilterPanel: React.FC<{
  config: FilterConfig;
  onChange: (filter: Partial<FilterConfig>) => void;
  isOverloading: boolean;
}> = ({ config, onChange, isOverloading }) => {
  const handleCutoffChange = (val: number) => {
    onChange({ cutoff: val });
  };

  const handleResonanceChange = (val: number) => {
    onChange({ resonance: val });
  };

  const handleEnvelopeAmountChange = (val: number) => {
    onChange({ envelopeAmount: val });
  };

  const handleKeyboardFollowChange = () => {
    onChange({ keyboardFollow: !config.keyboardFollow });
  };

  // The Overload indicator now uses the real signal state from the engine
  const driveGlow = isOverloading ? `0 0 12px #ff0000` : 'none';
  const driveOpacity = isOverloading ? 1 : 0.2;

  return (
    <div className="panel-column">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Knob
            value={config.cutoff}
            min={0}
            max={1}
            label="CUTOFF"
            onChange={handleCutoffChange}
            size="large"
          />
          <div style={{ width: 33 }} />
          <Knob
            value={config.resonance}
            min={0}
            max={60}
            label="EMPHASIS"
            onChange={handleResonanceChange}
            size="large"
          />
        </div>

        <div style={{ margin: '4px 0' }}>
            <Knob
              value={config.envelopeAmount}
              min={0}
              max={1}
              label="CONTOUR AMOUNT"
              onChange={handleEnvelopeAmountChange}
              size="medium"
            />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: 4 }}>
          <span style={{ fontSize: 7, color: '#888', letterSpacing: 1 }}>KEYBOARD TRACK</span>
          <Toggle
            active={config.keyboardFollow}
            label=""
            color="blue"
            onClick={handleKeyboardFollowChange}
          />
        </div>
      </div>

      <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: isOverloading ? '#ff0000' : '#1a0000', 
            boxShadow: driveGlow,
            opacity: driveOpacity,
            transition: 'background-color 0.05s, opacity 0.05s'
        }} />
        <span style={{ fontSize: 7, color: isOverloading ? '#cc3300' : '#444', letterSpacing: 2, fontWeight: isOverloading ? 700 : 400 }}>OVERLOAD</span>
      </div>
    </div>
  );
};

export default FilterPanel;
