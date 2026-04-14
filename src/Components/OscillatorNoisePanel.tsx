import React from "react";
import Knob from "./Knob";
import { WaveformIcon } from "./WaveformIcons";
import Oscilloscope from "./Oscilloscope";

interface NoiseConfig {
  type: "white" | "pink" | "brown";
  level: number;
}

interface NoisePanelProps {
  config: NoiseConfig;
  onChange: (c: NoiseConfig) => void;
  analyser: AnalyserNode | null;
  activeNote: number | null;
}

const NoisePanel: React.FC<NoisePanelProps> = ({ config, onChange, analyser, activeNote }) => {
  const types: ("white" | "pink" | "brown")[] = ["white", "pink", "brown"];

  const tints: Record<string, string> = {
    white: "#ffffff",
    pink: "#ff99cc",
    brown: "#c68642",
  };

  return (
    <div className="panel-column">
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: 'center' }}>
        {/* Color Selector with Icons */}
        <div
          style={{
            position: "relative",
            width: 80,
            height: 75,
            margin: "0 auto",
          }}
        >
          {/* Noise Glyphs tinted */}
          {[
            { t: "white", r: -70 },
            { t: "pink", r: 0 },
            { t: "brown", r: 70 },
          ].map((icon, i) => {
            const rad = (icon.r - 90) * (Math.PI / 180);
            const radius = 28;
            const x = 40 + Math.cos(rad) * radius - 7;
            const y = 30 + Math.sin(rad) * radius - 7;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  opacity: config.type === icon.t ? 1 : 0.4,
                  filter: config.type === icon.t ? `drop-shadow(0 0 3px ${tints[icon.t]})` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <WaveformIcon type={icon.t} color={tints[icon.t]} />
              </div>
            );
          })}

          <div style={{ position: "absolute", top: 18, left: 0, right: 0 }}>
            <Knob
              value={types.indexOf(config.type)}
              min={0}
              max={2}
              label="COLOR"
              step={1}
              onChange={(v) =>
                onChange({ ...config, type: types[Math.round(v)] })
              }
              size="small"
            />
          </div>
        </div>

        {/* Embedded Oscilloscope in the Noise Bank */}
        <div style={{ margin: '10px 0', transform: 'scale(0.8)' }}>
           <Oscilloscope analyser={analyser} activeNote={activeNote} />
        </div>

        <Knob
          value={config.level}
          min={0}
          max={1}
          label="LEVEL"
          onChange={(v) => onChange({ ...config, level: v })}
          size="small"
        />
      </div>
    </div>
  );
};

export default NoisePanel;
