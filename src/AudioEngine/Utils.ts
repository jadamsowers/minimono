function getFrequency(note: number, octave: number, detuneCents: number = 0): number {
  return 440 * Math.pow(2, (note - 69) / 12) * Math.pow(2, octave) * (1 + detuneCents / 1200);
}

function initBlepImpulseResponse(): Float32Array {
  const sampleRate = 44100;
  const numSamples = 2048;
  const windowSamples = sampleRate / 8;
  const impulse: Float32Array = new Float32Array(numSamples).fill(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let windowSample = 0;
    
    if (t < windowSamples) {
      const u = t * sampleRate / windowSamples;
      windowSample = (u - 0.5) * Math.tan(Math.PI / 2);
    }
    
    const discontinuity = windowSample < 0 ? 0 : windowSample;
    impulse[i] = windowSample - discontinuity;
  }

  return impulse;
}
