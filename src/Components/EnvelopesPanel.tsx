import React from 'react';
import Knob from './Knob';
import Toggle from './Toggle';
import { VcaEnvelope, FilterEnvelope } from '../types/synth';

interface EnvelopesPanelProps {
  vcaEnvelope: VcaEnvelope;
  filterEnvelope: FilterEnvelope;
  onVcaChange: (env: Partial<VcaEnvelope>) => void;
  onFilterEnvChange: (env: Partial<FilterEnvelope>) => void;
  decayRelease: boolean;
  onDecayReleaseChange: (enabled: boolean) => void;
}

const EnvelopesPanel: React.FC<EnvelopesPanelProps> = ({
  vcaEnvelope,
  filterEnvelope,
  onVcaChange,
  onFilterEnvChange,
  decayRelease,
  onDecayReleaseChange
}) => {
  return (
    <div className="panel-column" style={{ gap: 8, alignItems: 'flex-start', paddingLeft: 10 }}>
      {/* Vca Envelope */}
      <div className="envelope-group">
        <span style={{ 
          fontSize: 9, 
          color: '#ff6600', 
          marginBottom: 8, 
          display: 'block', 
          fontWeight: 800, 
          letterSpacing: 2,
          textAlign: 'left'
        }}>LOUDNESS CONTOUR</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Knob
            value={vcaEnvelope.attack}
            min={0}
            max={10}
            label="ATTACK"
            onChange={(v) => onVcaChange({ attack: v })}
            size="small"
          />
          <Knob
            value={vcaEnvelope.decay}
            min={0}
            max={10}
            label="DECAY"
            onChange={(v) => onVcaChange({ decay: v, release: v })} // Release links to decay on Moog
            size="small"
          />
          <Knob
            value={vcaEnvelope.sustain}
            min={0}
            max={1}
            label="SUSTAIN"
            onChange={(v) => onVcaChange({ sustain: v })}
            size="small"
          />
        </div>
      </div>

      {/* Filter Envelope */}
      <div className="envelope-group">
        <span style={{ 
          fontSize: 9, 
          color: '#ff6600', 
          marginBottom: 8, 
          display: 'block', 
          fontWeight: 800, 
          letterSpacing: 2,
          textAlign: 'left'
        }}>FILTER CONTOUR</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Knob
            value={filterEnvelope.attack}
            min={0}
            max={10}
            label="ATTACK"
            onChange={(v) => onFilterEnvChange({ attack: v })}
            size="small"
          />
          <Knob
            value={filterEnvelope.decay}
            min={0}
            max={10}
            label="DECAY"
            onChange={(v) => onFilterEnvChange({ decay: v, release: v })}
            size="small"
          />
          <Knob
            value={filterEnvelope.sustain}
            min={0}
            max={1}
            label="SUSTAIN"
            onChange={(v) => onFilterEnvChange({ sustain: v })}
            size="small"
          />
        </div>
      </div>

      <div style={{ fontSize: 7, color: '#888', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
           <span style={{ color: '#cc6644', fontSize: 6 }}>DECAY</span>
           <Toggle
             active={decayRelease}
             label=""
             onClick={() => onDecayReleaseChange(!decayRelease)}
           />
        </div>
        <span style={{ color: '#555', fontSize: 6, lineWeight: 1.2 }}>
          WHEN ON, RELEASE TIME <br/>
          FOLLOWS DECAY SETTING
        </span>
      </div>
    </div>
  );
};

export default EnvelopesPanel;
