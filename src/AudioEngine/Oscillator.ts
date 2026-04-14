export type WaveformType =
  | "tri"
  | "tri-saw"
  | "rev-saw"
  | "saw"
  | "sq"
  | "pulse-wide"
  | "pulse-narrow";

export class Oscillator {
  private context: AudioContext;
  private osc: OscillatorNode;
  private gain: GainNode;
  private _waveform: WaveformType = "saw";
  private _detune: number = 0;

  constructor(context: AudioContext, destination: AudioNode) {
    this.context = context;
    this.osc = context.createOscillator();
    this.gain = context.createGain();

    this.osc.type = "sawtooth";
    this.gain.gain.value = 0; // Default off

    this.osc.connect(this.gain);
    this.gain.connect(destination);

    this.osc.start();
  }

  set waveform(type: WaveformType) {
    this._waveform = type;

    if (type === "tri") {
      this.osc.type = "triangle";
    } else if (type === "saw") {
      this.osc.type = "sawtooth";
    } else if (type === "sq") {
      this.osc.type = "square";
    } else if (type === "rev-saw") {
      // Reverse saw (negative ramp)
      const n = 64;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let i = 1; i < n; i++) {
        imag[i] = -(2 / (i * Math.PI)) * Math.pow(-1, i);
      }
      const wave = this.context.createPeriodicWave(real, imag);
      this.osc.setPeriodicWave(wave);
    } else if (type === "tri-saw") {
      // Approximation of a mixed wave
      const real = new Float32Array([0, 0, 0.5, 0, 0.25, 0, 0.125]);
      const imag = new Float32Array([0, 0.8, 0, 0.2, 0, 0.1, 0]);
      const wave = this.context.createPeriodicWave(real, imag);
      this.osc.setPeriodicWave(wave);
    } else if (type === "pulse-wide") {
      // Wide pulse (approx 25% duty)
      const n = 64;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let i = 1; i < n; i++) {
        imag[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * 0.25);
      }
      const wave = this.context.createPeriodicWave(real, imag);
      this.osc.setPeriodicWave(wave);
    } else if (type === "pulse-narrow") {
      // Narrow pulse (approx 10% duty)
      const n = 64;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let i = 1; i < n; i++) {
        imag[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * 0.1);
      }
      const wave = this.context.createPeriodicWave(real, imag);
      this.osc.setPeriodicWave(wave);
    }
  }

  setFrequency(freq: number, time: number = 0, transitionTime: number = 0) {
    const t = time || this.context.currentTime;
    if (transitionTime > 0) {
      this.osc.frequency.setTargetAtTime(freq, t, transitionTime / 2);
    } else {
      this.osc.frequency.setTargetAtTime(freq, t, 0.005);
    }
  }

  setDetune(cents: number, time: number = 0) {
    this._detune = cents;
    const t = time || this.context.currentTime;
    this.osc.detune.setTargetAtTime(cents, t, 0.005);
  }

  getDetuneBase(): number {
    return this._detune;
  }

  setLevel(level: number, time: number = 0) {
    const t = time || this.context.currentTime;
    this.gain.gain.setTargetAtTime(level, t, 0.005);
  }

  dispose() {
    this.osc.stop();
    this.osc.disconnect();
    this.gain.disconnect();
  }
}
