import { createOnePoleFilter } from './Utils';

export class Filter {
  private context: AudioContext;
  private filter1: BiquadFilterNode;
  private filter2: BiquadFilterNode;
  private filter3: BiquadFilterNode;
  private filter4: BiquadFilterNode;
  
  constructor(context: AudioContext, cutoff: number, resonance: number) {
    this.context = context;
    this.filter1 = createOnePoleFilter(context, cutoff);
    this.filter2 = createOnePoleFilter(context, cutoff);
    this.filter3 = createOnePoleFilter(context, cutoff);
    this.filter4 = createOnePoleFilter(context, cutoff);
    
    this.filter1.connect(this.filter2);
    this.filter2.connect(this.filter3);
    this.filter3.connect(this.filter4);
    this.filter4.connect(context.destination);
  }
  
  setCutoff(cutoff: number) {
    this.filter1.frequency.setTargetAtTime(cutoff, this.context.currentTime, 0.01);
  }
  
  setResonance(resonance: number) {
    this.filter1.Q.setTargetAtTime(resonance, this.context.currentTime, 0.01);
  }
}
