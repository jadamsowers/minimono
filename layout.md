## Minimono — UI layout spec for web recreation

Top-level constraints

- Canvas size: responsive but designed around a 1200×420 px default artboard (scale UI elements proportionally).
- Visual style: black matte panel, chrome screws at corners, wooden side panels, cream/beige text and markings, orange/red indicator elements. Use subtle bevels and inner shadows to simulate metal panel. Use system fonts similar to Futura/Eurostile for labels; fallback to sans-serif.

Overall panel regions (left → right)

1. Power & Pitch Controls (far left, vertical strip)
2. Oscillator Section (left-center) — Osc 1, Osc 2, Osc 3 controls stacked horizontally grouped by oscillator.
3. Mixer Section (center top) — oscillator level knobs, noise, external input.
4. Filter & Filter Envelope (center-right) — cutoff, resonance, envelope amount, keyboard follow.
5. VCA & Volume (right) — VCA envelope, master volume, sustain/release behavior.
6. Modulation & Glide (far right) — LFO, glide, pitch/mod wheels, sustain/hold switches.
7. Keyboard (bottom spanning width) — 44-key graphic keyboard with pitch/mod wheels at left of keys.

Grid & spacing

- Use 12px baseline grid; primary control spacing 28–36px. Group headers 18–20px high. Knobs ~48px diameter for main controls, 32px for secondary, 20–24px for small trimmers/toggles.

Controls — visual and interaction details

- Knobs:
  - Shape: circular with a thin chrome rim, flat black cap, white pointer line.
  - Sizes: large (48px), medium (36px), small (28px).
  - Markings: radial tick marks around knob (subtle) and numeric/label below.
  - Behavior: drag vertically or rotate to change value; snap to integers only where original had detents (octave switches). Support double-click to reset to default.
  - Visual feedback: highlight ring glow when active/hovered; smooth animated pointer rotation.
- Switches:
  - Toggle switches: rectangular rocker with two positions (UP/DOWN) or small metal toggle with inlaid label. Active state uses orange/red indicator.
  - Momentary push-buttons: recessed chrome button with LED-style indicator.
- Sliders:
  - Use faux-physical horizontal sliders only if original uses faders (Minimono uses knobs; avoid sliders except for pitch/mod wheels).
- LEDs:
  - Small circular LEDs for power or active state, amber or red. Subtle glow.
- Keyboard:
  - 44 keys rendered with realistic proportions (white keys with subtle bevel, black keys shorter and narrower). Key press shows depression animation and emits small shadow.
- Screws and bezels:
  - Decorative chrome screws at panel corners and section separators. Thin engraved lines to separate sections.

Typography & labels

- Main section labels: small uppercase, letter-spaced (e.g., "OSCILLATORS", "MIXER") — 10–12px.
- Control labels: lowercase/upper depending on original; use small caps for knob labels (8–10px).
- Knob value readouts: optional small numeric display under or above knob; 10–12px monospace for numeric values (e.g., "440 Hz", "-2").
- Engraved style: use slight emboss/engrave effect (inner shadow + highlight) for permanent labels; transient values use flat bright text.

Exact control list and placement (left → right, top rows then bottom rows)

- Leftmost vertical: Power toggle (top), Pitch Wheel (vertical slider, 120×28 px), Mod Wheel (vertical, shorter), Tuning trim (small knob), Glide switch (toggle).
- Oscillator section (three vertical columns labeled OSC 1 / OSC 2 / OSC 3):
  - Top: Waveform selector (3-position toggle or small rotary labeled SAW / TRI / SQUARE).
  - Octave switch: 3-position rocker (-2, -1, 0, +1, +2 as in replica; visually 5 small rocker buttons or one multi-position rotary).
  - Range/fine-tune knob (small).
  - Pulse-width knob (medium) for square waveform.
  - Sync toggle (for slaves) near Osc 2/1 as in original.
- Mixer section (center):
  - Knobs for VCO1 level, VCO2 level, VCO3 level (large, aligned horizontally).
  - Noise level knob (medium).
  - External input knob (small).
  - Small legend: "MIXER" above row.
- Filter section:
  - Cutoff knob (large center), labeled with frequency scale or numeric readout.
  - Emphasis/Resonance knob (large) to the right of cutoff.
  - Envelope Amount knob (medium) above or below cutoff.
  - Keyboard Follow toggle/knob (small) and limiter/drive indicator.
  - Section label: "LOW PASS FILTER 24dB/Oct".
- Filter Envelope:
  - Attack knob (medium), Decay knob (medium), Sustain slider/knob (small) if included. Place under filter controls with label "ENVELOPE".
- VCA / Output:
  - Volume/Mix master knob (large).
  - VCA envelope controls: Attack, Decay (medium).
  - Output level meter: 6-segment LED-style vertical meter.
- Modulation / LFO:
  - LFO Rate knob (medium), LFO Waveform selector (small 3-pos), LFO Depth knob (medium) with routing labels "VIBRATO" and "TIMER" or "FILTER".
  - Glide/Portamento knob (medium) with legato toggle (small).
- Keyboard row:
  - Keys centered across bottom with realistic spacing.
  - Left of keyboard: Pitch wheel and Mod wheel rendered as springs/rollers with textured caps.
  - Right of keyboard: Hold/Glide LED and footswitch input icons.

Accessibility & responsive behavior

- Provide keyboard focus outlines and ARIA labels for each control.
- Scalable vector graphics (SVG) for crisp rendering; group elements for interaction.
- Support touch gestures: knob rotation via circular drag, keyboard touch.
- Provide an "editor mode" showing numeric values and exact CSS pixel coordinates for precise placement.

Exact CSS/HTML structure suggestions

- Root: <div class="minimono-panel" style="width:1200px;height:420px">
- Sections: <section class="panel-section osc1">…</section> etc.
- Knob component:
  - <div class="knob" data-param="vco1-level" role="slider" aria-valuemin="0" aria-valuemax="10">SVG knob</div>
  - Use transform: rotate(var(--angle)) to position pointer.
- Switch component: <button class="toggle" data-param="sync" aria-pressed="false">…</button>
- Keyboard: <div class="keyboard" role="group">…<div class="key white" data-note="48"></div>…</div>

Assets & styling tokens

- Colors: panel-bg #0c0c0c; label #f2e9d2; knob-cap #111111; chrome #d7d7d7; wood #8b5a2b.
- Shadows: subtle drop-shadow for keys; inset for panel engravings.
- Use SVG filters for subtle grain/texture overlay to mimic aged metal.

Interaction mapping to synth engine

- Each UI control should map to a parameter identifier (e.g., engine.params.vco1.waveform). Use camelCase keys and normalized value ranges (0–1) for engine bindings. Provide a JSON parameter map file with control IDs, default values, min/max, and units.

Example JSON entry (one knob)

- { "id":"filter.cutoff", "type":"knob", "default":0.35, "min":0, "max":1, "unit":"normalized", "label":"Cutoff" }

Testing & pixel-accuracy

- Include a "reference overlay" toggle that displays measured bounding boxes and exact pixel offsets against a photographic reference image to tweak alignment.

Export & theming

- Allow two skins: "vintage" (wood side panels, cream labels) and "flat" (material UI, simplified colors) for responsiveness. Provide CSS variables for all tokens.

This spec provides layout, control types, visual tokens, interactions, accessibility notes, and engine binding conventions to recreate a Minimono-style web UI that looks and behaves very close to the original.
