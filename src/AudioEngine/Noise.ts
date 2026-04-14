export type NoiseType = 'white' | 'pink' | 'brown';

export class NoiseGenerator {
  private context: AudioContext;
  private currentSource: AudioBufferSourceNode | null = null;
  private gain: GainNode;
  private _level: number = 0;
  private _type: NoiseType = 'white';

  constructor(context: AudioContext, destination: AudioNode) {
    this.context = context;
    this.gain = context.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);
    this.createSource('white');
  }

  private createSource(type: NoiseType) {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource.disconnect();
    }

    const bufferSize = 2 * this.context.sampleRate;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) accommodate for gain
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) accommodate for gain
      }
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    source.connect(this.gain);
    this.currentSource = source;
  }

  setType(type: NoiseType) {
    if (this._type === type) return;
    this._type = type;
    this.createSource(type);
  }

  setLevel(level: number, time: number = 0) {
    this._level = level;
    const t = time || this.context.currentTime;
    this.gain.gain.setTargetAtTime(level, t, 0.005);
  }

  dispose() {
    if (this.currentSource) {
      this.currentSource.stop();
    }
    this.gain.disconnect();
  }
}
