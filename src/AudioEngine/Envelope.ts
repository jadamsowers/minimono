export class Envelope {
  private context: AudioContext;
  private startValue: number;
  private targetValue: number;
  private attackTime: number;
  private decayTime: number;
  private sustainValue: number;
  private releaseTime: number;
  private startTime: number;
  private gainNode: GainNode;
  private finished: boolean;

  constructor(context: AudioContext) {
    this.context = context;
    this.gainNode = context.createGain();
  }

  setValue(startValue: number, targetValue: number, attackTime: number, decayTime: number, sustainValue: number) {
    this.startValue = startValue;
    this.targetValue = targetValue;
    this.attackTime = attackTime;
    this.decayTime = decayTime;
    this.sustainValue = sustainValue;
    this.startTime = this.context.currentTime;
    this.gainNode.gain.setValueAtTime(startValue, this.startTime);
    this.gainNode.gain.exponentialRampToValueAtTime(sustainValue, this.startTime + attackTime + decayTime);
  }

  release() {
    const now = this.context.currentTime;
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1);
  }
}
