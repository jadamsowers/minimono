export interface Preset {
  name: string;
  params: {
    osc1: { wave: "tri" | "tri-saw" | "saw" | "sq" | "pulse-wide" | "pulse-narrow"; octave: number; detune: number; level: number; sync: boolean; pulseWidth: number };
    osc2: { wave: "tri" | "tri-saw" | "saw" | "sq" | "pulse-wide" | "pulse-narrow"; octave: number; detune: number; level: number; sync: boolean; pulseWidth: number };
    osc3: { wave: "tri" | "tri-saw" | "saw" | "sq" | "pulse-wide" | "pulse-narrow"; octave: number; detune: number; level: number; sync: boolean; pulseWidth: number };
    filter: { cutoff: number; resonance: number; envelopeAmount: number; keyboardFollow: boolean };
    vcaEnvelope: { attack: number; decay: number };
    filterEnvelope: { attack: number; decay: number };
    lfo: { rate: number; depthVibrato: number; depthFilter: number; waveform: string };
    glide: { time: number; mode: string };
    mixer: { vco1Level: number; vco2Level: number; vco3Level: number; noiseLevel: number; externalLevel: number };
  };
}

export const factoryPresets: Preset[] = [
  {
    name: "Classic Lead",
    params: {
      osc1: { wave: "saw", octave: 0, detune: 0, level: 0.8, sync: false, pulseWidth: 25 },
      osc2: { wave: "saw", octave: 0, detune: 5, level: 0.7, sync: false, pulseWidth: 25 },
      osc3: { wave: "saw", octave: -1, detune: -5, level: 0.6, sync: false, pulseWidth: 30 },
      filter: { cutoff: 0.6, resonance: 10, envelopeAmount: 0.3, keyboardFollow: true },
      vcaEnvelope: { attack: 0.05, decay: 0.4 },
      filterEnvelope: { attack: 0.1, decay: 0.3 },
      lfo: { rate: 5, depthVibrato: 5, depthFilter: 2, waveform: "sine" },
      glide: { time: 0.1, mode: "always" },
      mixer: { vco1Level: 0.8, vco2Level: 0.7, vco3Level: 0.6, noiseLevel: 0, externalLevel: 0 }
    }
  },
  {
    name: "Deep Bass",
    params: {
      osc1: { wave: "sq", octave: -1, detune: 0, level: 1.0, sync: false, pulseWidth: 25 },
      osc2: { wave: "saw", octave: -1, detune: 8, level: 0.8, sync: false, pulseWidth: 25 },
      osc3: { wave: "saw", octave: -2, detune: 0, level: 0.7, sync: false, pulseWidth: 30 },
      filter: { cutoff: 0.25, resonance: 25, envelopeAmount: 0.4, keyboardFollow: false },
      vcaEnvelope: { attack: 0.01, decay: 0.3 },
      filterEnvelope: { attack: 0.02, decay: 0.2 },
      lfo: { rate: 2, depthVibrato: 0, depthFilter: 5, waveform: "sine" },
      glide: { time: 0.05, mode: "always" },
      mixer: { vco1Level: 1.0, vco2Level: 0.8, vco3Level: 0.7, noiseLevel: 0.05, externalLevel: 0 }
    }
  },
  {
    name: "Vintage Poly-ish Pad",
    params: {
      osc1: { wave: "tri", octave: 0, detune: 0, level: 0.8, sync: false, pulseWidth: 25 },
      osc2: { wave: "tri", octave: 0, detune: 12, level: 0.8, sync: false, pulseWidth: 25 },
      osc3: { wave: "tri", octave: 1, detune: 0, level: 0.6, sync: false, pulseWidth: 30 },
      filter: { cutoff: 0.4, resonance: 5, envelopeAmount: 0.6, keyboardFollow: true },
      vcaEnvelope: { attack: 0.4, decay: 1.5 },
      filterEnvelope: { attack: 0.6, decay: 1.2 },
      lfo: { rate: 1.5, depthVibrato: 2, depthFilter: 10, waveform: "sine" },
      glide: { time: 0, mode: "never" },
      mixer: { vco1Level: 0.8, vco2Level: 0.8, vco3Level: 0.6, noiseLevel: 0.1, externalLevel: 0 }
    }
  },
  {
    name: "Chameleon Zap",
    params: {
      osc1: { wave: "saw", octave: 0, detune: 0, level: 0.9, sync: false, pulseWidth: 25 },
      osc2: { wave: "sq", octave: 0, detune: 0, level: 0.8, sync: false, pulseWidth: 10 },
      osc3: { wave: "tri", octave: -1, detune: 0, level: 0.7, sync: false, pulseWidth: 30 },
      filter: { cutoff: 0.1, resonance: 45, envelopeAmount: 0.8, keyboardFollow: false },
      vcaEnvelope: { attack: 0.001, decay: 0.15 },
      filterEnvelope: { attack: 0.01, decay: 0.08 },
      lfo: { rate: 0, depthVibrato: 0, depthFilter: 0, waveform: "sine" },
      glide: { time: 0, mode: "never" },
      mixer: { vco1Level: 0.9, vco2Level: 0.8, vco3Level: 0.7, noiseLevel: 0, externalLevel: 0 }
    }
  },
  {
    name: "Cosmic Winds",
    params: {
      osc1: { wave: "tri", octave: 0, detune: 0, level: 0.2, sync: false, pulseWidth: 25 },
      osc2: { wave: "saw", octave: 1, detune: 15, level: 0.2, sync: false, pulseWidth: 25 },
      osc3: { wave: "sq", octave: 2, detune: -15, level: 0.2, sync: false, pulseWidth: 50 },
      filter: { cutoff: 0.5, resonance: 55, envelopeAmount: 0.2, keyboardFollow: true },
      vcaEnvelope: { attack: 2.0, decay: 2.0 },
      filterEnvelope: { attack: 3.0, decay: 3.0 },
      lfo: { rate: 0.5, depthVibrato: 10, depthFilter: 40, waveform: "sine" },
      glide: { time: 0.5, mode: "always" },
      mixer: { vco1Level: 0.2, vco2Level: 0.2, vco3Level: 0.2, noiseLevel: 0.8, externalLevel: 0 }
    }
  }
];
