export function createOnePoleFilter(context: AudioContext, f0: number): BiquadFilterNode {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = f0;
  filter.Q.value = 0.1;
  
  filter.connect(filter);
  return filter;
}
