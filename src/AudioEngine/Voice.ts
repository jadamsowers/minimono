export class Voice {
  private context: AudioContext;
  private oscillator: Oscillator;
  private gain: GainNode;
  
  constructor(context: AudioContext) {
    this.context = context;
    this.oscillator = {
      frequency: context.createOscillator().frequency as AudioParam,
      gain: context.createGain()
    };
    this.oscillator.frequency.value = 440;
    this.oscillator.gain.gain.value = 0;
  }
  
  play(frequency: number, startTime = 0) {
    this.oscillator.frequency.setValueAtTime(frequency, startTime);
    this.oscillator.gain.gain.cancelScheduledValues(startTime);
    this.oscillator.gain.gain.setValueAtTime(0, startTime);
    this.oscillator.gain.gain.linearRampToValueAtTime(1, startTime + 0.01);
  }
  
  stop(stopTime = 0) {
    this.oscillator.gain.gain.cancelScheduledValues(stopTime);
    this.oscillator.gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.1);
    this.oscillator.frequency.cancelScheduledValues(stopTime);
  }
}
