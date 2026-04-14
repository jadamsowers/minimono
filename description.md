## Minimono — feature spec for software recreation

Overview: emulate three analog VCOs, mixer, 24dB/oct ladder low-pass filter, VCA, envelopes, LFO, noise source, oscillator sync, glide, keyboard pitch control, and routing/modulation. Below are modules, parameters, signal flow, and behaviors with precise algorithmic notes.

### Modules & signal flow

1. Oscillators (VCO1, VCO2, VCO3) -> Mixer -> Filter -> VCA -> Output
   - Control bus: pitch (keyboard + pitch wheel + glide + VCO fine/Coarse tuning + pitch modulation).
   - Modulation bus: assigns sources (LFO, envelope) to destinations (filter cutoff, VCO pitch, VCA level).

### Oscillators (per VCO)

- Waveforms: saw, triangle, square/pulse. Implement as bandlimited oscillators (BLEP or minBLEP) or wavetable to avoid aliasing.
- Frequency control: base note -> frequency = 440 _ 2^((note-69)/12) _ 2^(octave_shift) \* detune_factor. Allow coarse (octave) and fine tuning (± semitones/cents).
- Pulse width: for square waveform, support PWM by varying duty cycle (default 50%).
- Mixer level: linear gain per oscillator into mixer.
- Hard sync: VCO1/2 can be forcibly restarted by VCO3 (or master/slave config). Implement by resetting phase of slave to phase of master when master completes a cycle — produces inharmonic content when slave pitch > master.
- Phase: track phase per oscillator; wrap at 2π.

### Noise generator

- White noise source mixed in mixer; band-limit for sample-rate independence (e.g., pinking or lowpass filter if desired).

### Mixer

- Sum of VCO outputs + noise + external input. Implement as linear sum with adjustable level per input. Optionally model slight saturation/trim to mimic analog behavior.

### Filter (24 dB/oct ladder)

- Core: 4-pole low-pass ladder with resonance (emphasis). Implement either:
  - Non-linear analog-model: Ladder VCF approximation (e.g., Cascade of four one-pole filters with feedback and tanh/nonlinear element), or
  - ZDF/emulated ladder (e.g., Stilson–Smith, Antti Huovilainen, or diode ladder models) for accurate resonance and self-oscillation.
- Cutoff control: cutoff frequency (Hz) modulated by envelope and LFO. Map control to exponential frequency response.
- Resonance: feedback coefficient; allow self-oscillation when resonance high. Implement drive/saturation to model behavior near self-oscillation.
- Keyboard tracking: cutoff shift per octave (scale factor).
- Envelope amount: polarity: Implement bipolar control for flexibility.

### VCA & Amplitude Envelope (AD)

- VCA follows an amplitude envelope with Attack and Decay knobs (Model D has simple ADS? The Minimono has an ADS envelope: Attack, Decay, Sustain — actually Model D has Attack and Decay with sustain on keyboard release behavior — implement ADSR-like behavior approximating original).
- Implement linear or exponential segments; use exponential curves for more natural analog feel.
- VCA gating via keyboard gate input.

### Filter Envelope

- Dedicated envelope (often called Filter Envelope) with Attack and Decay controls; envelope amount knob controls influence on cutoff. Implement initial offset so envelope can open the filter on note-on.

### LFO (Modulation)

- Single LFO with sine/triangle/square options; rate control; routable to pitch (vibrato) and filter cutoff. Implement depth controls per destination. For pitch vibrato, use low-depth pitch modulation in cents.

### Glide (Portamento)

- Implement portamento as smoothing on target pitch using exponential glide time parameter when legato or when glide is enabled. Provide mode for legato vs always.

### Keyboard & Pitch controls

- 44-key physical range mapping to MIDI note numbers. Implement pitch wheel (continuous pitch bend range selectable, default ±2 semitones) and modulation wheel routing (typically vibrato).

### Modulation routing matrix (simple)

- Sources: LFO, Filter Envelope, VCA Envelope, Noise, External CV.
- Destinations: VCO pitch (per-osc), filter cutoff, VCA level.
- Implement per-destination depth controls (positive/negative).

### Oscillator interactions

- Detune: small offsets between oscillators in cents to create beating/chorus.
- Mixer balance and panning optional.
- Oscillator sync and ring modulation: ring mod not native but expose optional ring-mod between any two oscillators (multiply signals) for extended timbres.

### Tuning & calibration behaviors (optional for realism)

- Temperature/tuning drift: implement slow random walk or smoothing for slight pitch instability.
- Component tolerances: small variations in filter cutoff and oscillator responses per-voice.

### Voice architecture

- Monophonic by default with 3 oscillators per voice. For polyphony, instantiate independent voice stacks (VCOs, filter, envelopes). Implement voice-stealing priority (last-note or oldest).

### Non-linearities & analog character (optional)

- Soft clipping/saturation in mixer, nonlinear filter stage (tanh in ladder), and VCA nonlinearity.
- Add subtle noise floor and quantization to emulate vintage circuitry.

### Controls & UI mapping (parameters)

- Oscillator: waveform (saw/tri/sq), octave (−2..+2), fine tune (±50 cents), level, pulse width.
- Mixer: level knobs for VCO1/2/3, noise.
- Filter: cutoff (Hz or normalized), resonance, envelope amount, keyboard follow.
- Envelopes: Attack, Decay, Sustain (or Decay used as sustain approximator per Model D), Release (if implementing ADR vs original behavior).
- LFO: waveform, rate (Hz), depth per destination.
- Glide: time, mode.
- Pitch wheel range, mod wheel depth mapping.

### Implementation notes & algorithms

- Use anti-aliased oscillator algorithms (minBLEP/BLIT/wavetable).
- Use sample-rate adapted filter coefficient calculations. For ladder model, prefer validated algorithms (Stilson–Smith or Huovilainen) to reproduce resonance and nonlinearity.
- For envelopes, use time-constant calculations: coeff = exp(-1/(time \* sample_rate)).
- For performance, vectorize per-sample operations and use lookup tables for waves where suitable.
- Ensure stable feedback handling in filter to avoid numerical instability at high resonance — include small denormal handling and saturation clamps.

### MIDI mapping & CC controls

- Map standard CCs: CC1 = mod wheel (LFO depth), CC74 = filter cutoff, CC71 = resonance or timbre, CC21-23 = oscillator levels (optional), pitch bend = pitch wheel. Map program changes to presets.

### Preset & parameter storage

- Store knob positions as floating parameters; provide snapshot recall. For modeled calibration, store random seed/offsets.

This specification should allow a coding AI to implement a functionally faithful Minimono-like synth engine suitable for further refinement and sonic tuning.
