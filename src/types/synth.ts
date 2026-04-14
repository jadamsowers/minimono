export type WaveformType = 'tri' | 'tri-saw' | 'rev-saw' | 'saw' | 'sq' | 'pulse-wide' | 'pulse-narrow';

export interface OscConfig {
  wave: WaveformType;
  octave: number;
  detune: number; // cents
  level: number; // 0-1
  sync: boolean;
  pulseWidth: number; // 0 to 50% for square
}

export interface FilterConfig {
  cutoff: number; // normalized 0-1
  resonance: number; // 0-1
  envelopeAmount: number; // 0-1
  keyboardFollow: boolean;
}

export interface VcaEnvelope {
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // level 0-1
  release: number; // seconds
}

export interface FilterEnvelope {
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // level 0-1
  release: number; // seconds
}

export interface LfoConfig {
  rate: number; // -1 to 1
  depthVibrato: number; // -1 to 1
  depthFilter: number; // -1 to 1
  waveform: 'sine' | 'tri' | 'sq';
}

export interface GlideConfig {
  time: number; // 0 to 2
  mode: 'never' | 'legato' | 'always';
}

export interface MixerConfig {
  vco1Level: number;
  vco2Level: number;
  vco3Level: number;
  noiseLevel: number;
  externalLevel: number;
}

export interface AllParams {
  oscillators: {
    1: OscConfig;
    2: OscConfig;
    3: OscConfig;
  };
  mixer: MixerConfig;
  filter: FilterConfig;
  vcaEnvelope: VcaEnvelope;
  filterEnvelope: FilterEnvelope;
  lfo: LfoConfig;
  glide: GlideConfig;
  saturation: boolean;
}

export interface VoiceState {
  playing: boolean;
  pitch: number;
}
