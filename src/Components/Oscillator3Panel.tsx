import React from "react";
import Toggle from "./Toggle";
import Knob from "./Knob";
import { OscConfig } from "../types/synth";
import { WaveformIcon } from "./WaveformIcons";

const Osc3Panel: React.FC<{
  config: OscConfig;
  onChange: (c: OscConfig) => void;
}> = ({ config, onChange }) => {
  const waves: (
    | "tri"
    | "rev-saw"
    | "saw"
    | "sq"
    | "pulse-wide"
    | "pulse-narrow"
  )[] = ["tri", "rev-saw", "saw", "sq", "pulse-wide", "pulse-narrow"];

  return (
    <div className="panel-column">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            position: "relative",
            width: 80,
            height: 75,
            margin: "0 auto",
          }}
        >
          {/* Waveform Icons Semi-Circle */}
          {[
            { t: "tri", r: -135 },
            { t: "rev-saw", r: -81 },
            { t: "saw", r: -27 },
            { t: "sq", r: 27 },
            { t: "pulse-wide", r: 81 },
            { t: "pulse-narrow", r: 135 },
          ].map((icon, i) => {
            const rad = (icon.r - 90) * (Math.PI / 180);
            const radius = 28;
            const x = 40 + Math.cos(rad) * radius - 7;
            const y = 30 + Math.sin(rad) * radius - 7;
            return (
              <div
                key={i}
                style={{ position: "absolute", left: x, top: y, opacity: 0.6 }}
              >
                <WaveformIcon type={icon.t} />
              </div>
            );
          })}

          <div style={{ position: "absolute", top: 18, left: 0, right: 0 }}>
            <Knob
              value={waves.indexOf(config.wave as any)}
              min={0}
              max={5}
              label="WAVE"
              step={1}
              onChange={(v) =>
                onChange({ ...config, wave: waves[Math.round(v)] as any })
              }
              size="small"
            />
          </div>
        </div>
        <Knob
          value={config.octave}
          min={-2}
          max={2}
          label="OCTAVE"
          step={1}
          initial={0}
          onChange={(v) => onChange({ ...config, octave: v })}
          size="small"
        />
        <Knob
          value={config.detune}
          min={-50}
          max={50}
          label="FINE TUNE"
          initial={0}
          onChange={(v) => onChange({ ...config, detune: v })}
          size="small"
        />
        <Knob
          value={config.level}
          min={0}
          max={1}
          label="LEVEL"
          onChange={(v) => onChange({ ...config, level: v })}
          size="small"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 7, color: "#888" }}>MASTER</span>
          <Toggle
            active={config.sync}
            label=""
            color="red"
            onClick={() => onChange({ ...config, sync: !config.sync })}
          />
        </div>
      </div>
    </div>
  );
};

export default Osc3Panel;
