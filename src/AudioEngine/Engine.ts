import { Oscillator } from './Oscillator';
import { NoiseGenerator, NoiseType } from './Noise';

export type DistortionMode = 'soft' | 'hard' | 'fold';

export class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private filter: BiquadFilterNode;
  
  // New architecture for summing cutoff
  private cutoffSource: ConstantSourceNode;
  private filterEnvSource: ConstantSourceNode;
  private filterEnvGain: GainNode;

  private saturation: WaveShaperNode;
  private mixer: GainNode;
  private analyser: AnalyserNode;
  private ledMeter: AnalyserNode;
  private oscs: Oscillator[] = [];
  private noise: NoiseGenerator;
  
  // Modulation
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private _pitchBendCents: number = 0;
  private _modWheelDepth: number = 0;

  private activeNote: number | null = null;
  private _masterVolume: number = 0.8;
  private _masterDetune: number = 0; // cents
  private _glideTime: number = 0; // seconds
  private _syncEnabled: boolean = false;
  private _keyboardTracking: boolean = false;
  private _decayReleaseEnabled: boolean = true;
  
  // Distortion Params
  private _driveEnabled: boolean = true;
  private _driveAmount: number = 0;
  private _driveMode: DistortionMode = 'soft';

  private vcaEnvelope: any = { attack: 0.01, decay: 0.5, sustain: 1.0, release: 0.2 };
  private filterEnvelope: any = { attack: 0.05, decay: 0.5, sustain: 0.5, release: 0.2 };
  private filterConfig: any = { cutoff: 0.5, resonance: 1, envelopeAmount: 0.2 };

  constructor(context: AudioContext) {
    this.context = context;
    
    // Gain/Mixer chain
    this.masterGain = context.createGain();
    this.masterGain.gain.value = 0;
    
    this.filter = context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 0;

    this.cutoffSource = context.createConstantSource();
    this.filterEnvSource = context.createConstantSource();
    this.filterEnvGain = context.createGain();
    
    this.cutoffSource.start();
    this.filterEnvSource.start();
    this.filterEnvSource.offset.value = 0;

    this.cutoffSource.connect(this.filter.frequency);
    this.filterEnvSource.connect(this.filterEnvGain);
    this.filterEnvGain.connect(this.filter.frequency);

    // Saturation stage
    this.saturation = context.createWaveShaper();
    this.refreshDriveCurve();
    this.saturation.oversample = '4x';

    this.mixer = context.createGain();
    this.mixer.gain.value = 1.0;
    
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 2048;

    this.ledMeter = context.createAnalyser();
    this.ledMeter.fftSize = 256;

    this.mixer.connect(this.filter);
    this.filter.connect(this.saturation);
    this.saturation.connect(this.masterGain);
    
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.ledMeter);
    this.masterGain.connect(context.destination);

    // LFO Setup
    this.lfo = context.createOscillator();
    this.lfo.type = 'triangle';
    this.lfo.frequency.value = 5;
    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = 0;
    
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.detune);
    this.lfo.start();

    for (let i = 0; i < 3; i++) {
        this.oscs.push(new Oscillator(context, this.mixer));
    }

    this.noise = new NoiseGenerator(context, this.mixer);
  }

  private makeDistortionCurve(amount: number, mode: DistortionMode) {
    const k = amount * 100;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      
      if (mode === 'soft') {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      } else if (mode === 'hard') {
        const threshold = 1.0 - (amount * 0.9);
        if (x > threshold) curve[i] = threshold;
        else if (x < -threshold) curve[i] = -threshold;
        else curve[i] = x;
        curve[i] *= (1.0 / threshold);
      } else if (mode === 'fold') {
        let val = x * (1 + k * 0.1);
        while (val > 1 || val < -1) {
          if (val > 1) val = 2 - val;
          if (val < -1) val = -2 - val;
        }
        curve[i] = val;
      }
    }
    return curve;
  }

  private refreshDriveCurve() {
    if (this._driveEnabled) {
      this.saturation.curve = this.makeDistortionCurve(this._driveAmount, this._driveMode);
    } else {
      // Linear curve = Bypass
      const n_samples = 2;
      const curve = new Float32Array(n_samples);
      curve[0] = -1;
      curve[1] = 1;
      this.saturation.curve = curve;
    }
  }

  public setDrive(amount: number, mode: DistortionMode, enabled: boolean) {
    this._driveAmount = amount;
    this._driveMode = mode;
    this._driveEnabled = enabled;
    this.refreshDriveCurve();
  }

  public getAnalyser() { return this.analyser; }
  public getLedMeter() { return this.ledMeter; }
  public getContext() { return this.context; }

  public async resume() {
    if (this.context.state === 'suspended') await this.context.resume();
  }

  public noteOn(note: number) {
    const now = this.context.currentTime;
    this.activeNote = note;
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const time = this._glideTime > 0 ? this._glideTime : 0;

    this.oscs.forEach(osc => {
      osc.setFrequency(freq, now, time);
    });
    
    // VCA
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    const vcaAttackEnd = now + Math.max(0.001, this.vcaEnvelope.attack);
    this.masterGain.gain.linearRampToValueAtTime(this._masterVolume, vcaAttackEnd);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.vcaEnvelope.sustain * this._masterVolume), vcaAttackEnd + Math.max(0.001, this.vcaEnvelope.decay));
    
    this.updateBaseCutoff(note);

    // Filter Envelope
    this.filterEnvSource.offset.cancelScheduledValues(now);
    this.filterEnvSource.offset.setValueAtTime(0, now);
    const attackEnd = now + Math.max(0.001, this.filterEnvelope.attack);
    this.filterEnvSource.offset.linearRampToValueAtTime(1.0, attackEnd);
    this.filterEnvSource.offset.exponentialRampToValueAtTime(Math.max(0.001, this.filterEnvelope.sustain), attackEnd + Math.max(0.001, this.filterEnvelope.decay));
    
    this.filterEnvGain.gain.setTargetAtTime(this.filterConfig.envelopeAmount * 10000, now, 0.01);
  }

  public noteOff(note: number) {
    if (this.activeNote === note) {
      const now = this.context.currentTime;
      const releaseTime = this._decayReleaseEnabled ? this.vcaEnvelope.release : 0.001;
      const filterReleaseTime = this._decayReleaseEnabled ? this.filterEnvelope.release : 0.001;

      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.001, releaseTime));
      this.masterGain.gain.linearRampToValueAtTime(0, now + Math.max(0.001, releaseTime) + 0.01);

      this.filterEnvSource.offset.cancelScheduledValues(now);
      this.filterEnvSource.offset.setValueAtTime(this.filterEnvSource.offset.value, now);
      this.filterEnvSource.offset.exponentialRampToValueAtTime(0.001, now + Math.max(0.001, filterReleaseTime));
      
      this.activeNote = null;
    }
  }

  public stopAllNotes() {
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(0, now, 0.01);
    this.filterEnvSource.offset.cancelScheduledValues(now);
    this.activeNote = null;
  }

  public setPitchBend(semitones: number) {
    const cents = semitones * 100;
    const delta = cents - this._pitchBendCents;
    this._pitchBendCents = cents;
    this.oscs.forEach(osc => {
      osc.setDetune(osc.getDetuneBase() + delta);
    });
  }

  public setModulation(depth: number) {
    this._modWheelDepth = depth;
    const now = this.context.currentTime;
    this.lfoGain.gain.setTargetAtTime(depth * 3600, now, 0.05);
  }

  public updateOscillator(index: number, config: any) {
    const osc = this.oscs[index];
    if (!osc) return;
    osc.waveform = config.wave;
    osc.setDetune(config.detune + (config.octave * 1200) + this._masterDetune + this._pitchBendCents);
    osc.setLevel(config.level);
  }

  public updateNoise(config: any) {
    this.noise.setType(config.type);
    this.noise.setLevel(config.level);
  }

  public setMasterVolume(level: number) {
    this._masterVolume = level;
    if (this.activeNote !== null) {
        this.masterGain.gain.setTargetAtTime(this.vcaEnvelope.sustain * level, this.context.currentTime, 0.02);
    }
  }

  public setMasterDetune(cents: number) {
    const delta = cents - this._masterDetune;
    this._masterDetune = cents;
    this.oscs.forEach(osc => {
      osc.setDetune(osc.getDetuneBase() + delta);
    });
  }

  public setGlide(time: number) {
    this._glideTime = time;
  }

  public setKeyboardTracking(enabled: boolean) {
    this._keyboardTracking = enabled;
    if (this.activeNote !== null) this.updateBaseCutoff(this.activeNote);
  }

  public setDecayRelease(enabled: boolean) {
    this._decayReleaseEnabled = enabled;
  }

  public setSync(enabled: boolean) {
    this._syncEnabled = enabled;
  }

  public updateEnvelopes(vca: any, filter: any) {
    this.vcaEnvelope = vca;
    this.filterEnvelope = filter;
  }

  public updateFilter(config: any) {
    this.filterConfig = config;
    if (this.activeNote !== null) {
        this.updateBaseCutoff(this.activeNote);
    } else {
        const freq = 20 * Math.pow(1000, config.cutoff);
        this.cutoffSource.offset.setTargetAtTime(freq, this.context.currentTime, 0.01);
    }
    this.filter.Q.setTargetAtTime(config.resonance, this.context.currentTime, 0.01);
    this.filterEnvGain.gain.setTargetAtTime(config.envelopeAmount * 10000, this.context.currentTime, 0.01);
  }

  private updateBaseCutoff(note: number) {
    let freq = 20 * Math.pow(1000, this.filterConfig.cutoff);
    if (this._keyboardTracking) {
      const trackingOffset = (note - 60) * (freq / 12);
      freq = Math.max(20, Math.min(20000, freq + trackingOffset));
    }
    this.cutoffSource.offset.setTargetAtTime(freq, this.context.currentTime, 0.01);
  }

  public dispose() {
    this.lfo.stop();
    this.context.close();
  }
}
