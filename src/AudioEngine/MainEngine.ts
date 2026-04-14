export class AudioEngine {
  private context: AudioContext;
  public analyser: AnalyserNode;
  public ledMeter: AnalyserNode;
  public masterGain: GainNode;
  private oscillators: Oscillator[] = [];
  private voices: Voice[] = [];
  private filter: Filter;

  constructor(context: AudioContext, osc1Config: OscConfig, osc2Config: OscConfig, osc3Config: OscConfig, filterConfig: FilterConfig) {
    this.context = context;
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 2048;

    this.ledMeter = context.createAnalyser();
    this.ledMeter.fftSize = 512;

    this.masterGain = context.createGain();
    this.masterGain.gain.value = 0.8;
    
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.ledMeter);
    this.masterGain.connect(context.destination);

    // Initialize 3 oscillators
    this.osc1Node = new Oscillator(context);
    this.osc2Node = new Oscillator(context);
    this.osc3Node = new Oscillator(context);

    this.oscillators[0] = this.osc1Node;
    this.oscillators[1] = this.osc2Node;
    this.oscillators[2] = this.osc3Node;

    // Set frequencies
    const baseFreq = 440;
    
    this.osc1Node.frequency.setTargetAtTime(getFrequency(69, osc1Config.octave, osc1Config.detune), this.context.currentTime, 0.01);
    this.osc2Node.frequency.setTargetAtTime(getFrequency(69 + (-12), osc2Config.octave, osc2Config.detune), this.context.currentTime, 0.01);
    this.osc3Node.frequency.setTargetAtTime(getFrequency(69, osc3Config.octave, osc3Config.detune), this.context.currentTime, 0.01);

    // Set volumes
    this.osc1Node.gain.gain.setTargetAtTime(osc1Config.level, this.context.currentTime, 0.01);
    this.osc2Node.gain.gain.setTargetAtTime(osc2Config.level, this.context.currentTime, 0.01);
    this.osc3Node.gain.gain.setTargetAtTime(osc3Config.level, this.context.currentTime, 0.01);

    // Set waveforms
    this.osc1Node.osc1.frequency.type = osc1Config.wave;
    this.osc2Node.osc2.frequency.type = osc2Config.wave;
    this.osc3Node.osc3.frequency.type = osc3Config.wave;

    // Create filter
    this.filter = new Filter(this.context, filterConfig.cutoff, filterConfig.resonance);
    
    // Oscillators connect to filter input
    this.osc1Node.gain.connect(this.filter);
    this.osc2Node.gain.connect(this.filter);
    this.osc3Node.gain.connect(this.filter);

    // Set master volume
    this.masterGain.gain.value = 0.8;
  }

  startOscillators() {
    this.osc1Node.start();
    this.osc2Node.start();
    this.osc3Node.start();
  }

  stopOscillators() {
    this.osc1Node.stop();
    this.osc2Node.stop();
    this.osc3Node.stop();
    this.osc3Node.stop();
  }

  setOscillatorWaveform(index: number, wave: WaveformType) {
    if (this.oscillators[index]) {
      this.oscillators[index].osc.frequencyType = wave;
    }
  }

  setOscillatorOctave(index: number, octave: number) {
    const freq = getFrequency(69 + (index === 2 ? -12 : 0), octave);
    this.oscillator[index].frequency.setTargetAtTime(freq, this.context.currentTime, 0.01);
  }

  setOscillatorLevel(index: number, level: number) {
    if (this.oscillators[index]) {
      this.oscillator[index].gain.gain.setTargetAtTime(level, this.context.currentTime, 0.01);
    }
  }

  setMasterVolume(level: number) {
    this.masterGain.gain.setTargetAtTime(level, this.context.currentTime, 0.01);
  }

  setFilterCutoff(cutoff: number) {
    this.filter.setCutoff(cutoff);
  }

  setFilterResonance(resonance: number) {
    this.filter.setResonance(resonance);
  }

  getAnalyser() {
    return this.analyser;
  }

  getLedMeter() {
    return this.ledMeter;
  }

  getMasterGain() {
    return this.masterGain;
  }

  dispose() {
    this.context.close();
  }
}
