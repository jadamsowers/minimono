import React, { useState, useEffect, useCallback, useRef } from "react";
import { AudioEngine } from "./AudioEngine/Engine";
import { Oscillator } from "./AudioEngine/Oscillator";
import Osc1Panel from "./Components/Oscillator1Panel";
import Osc2Panel from "./Components/Oscillator2Panel";
import Osc3Panel from "./Components/Oscillator3Panel";
import NoisePanel from "./Components/OscillatorNoisePanel";
import Knob from "./Components/Knob";
import FilterPanel from "./Components/FilterPanel";
import EnvelopesPanel from "./Components/EnvelopesPanel";
import Keyboard from "./Components/Keyboard";
import Wheel from "./Components/Wheel";
import Toggle from "./Components/Toggle";
import PresetManager from "./Components/PresetManager";
import Oscilloscope from "./Components/Oscilloscope";
import "./styles/MainLayout.css";
import { OscConfig, FilterConfig, VcaEnvelope, FilterEnvelope, LfoConfig, GlideConfig } from "./types/synth";

interface NoiseConfig {
  type: "white" | "pink" | "brown";
  level: number;
}


interface DefaultParams {
  oscillators: {
    1: OscConfig;
    2: OscConfig;
    3: OscConfig;
  };
  noise: NoiseConfig;
  filter: FilterConfig;
  vcaEnvelope: VcaEnvelope;
  filterEnvelope: FilterEnvelope;
  lfo: LfoConfig;
  glide: GlideConfig;
}

const defaultParams: DefaultParams = {
  oscillators: {
    1: {
      wave: "saw",
      octave: 0,
      detune: 0,
      level: 0.8,
      sync: false,
      pulseWidth: 25,
    },
    2: {
      wave: "saw",
      octave: 0,
      detune: 5,
      level: 0,
      sync: false,
      pulseWidth: 25,
    },
    3: {
      wave: "tri",
      octave: -1,
      detune: -5,
      level: 0,
      sync: false,
      pulseWidth: 30,
    },
  },
  noise: { type: "white", level: 0 },
  filter: {
    cutoff: 0.35,
    resonance: 15,
    envelopeAmount: 0.2,
    keyboardFollow: false,
  },
  vcaEnvelope: { attack: 0.01, decay: 0.5, sustain: 1.0, release: 0.2 },
  filterEnvelope: { attack: 0.05, decay: 0.5, sustain: 0.5, release: 0.2 },
  lfo: { rate: 0, depthVibrato: 10, depthFilter: 0, waveform: "sine" },
  glide: { time: 0, mode: "never" },
};

function App() {
  const [osc1, setOsc1] = useState(defaultParams.oscillators[1]);
  const [osc2, setOsc2] = useState(defaultParams.oscillators[2]);
  const [osc3, setOsc3] = useState(defaultParams.oscillators[3]);
  const [noise, setNoise] = useState(defaultParams.noise);
  const [filter, setFilter] = useState(defaultParams.filter);
  const [vcaEnvelope, setVcaEnvelope] = useState(defaultParams.vcaEnvelope);
  const [filterEnvelope, setFilterEnvelope] = useState(
    defaultParams.filterEnvelope,
  );
  const [lfo, setLfo] = useState(defaultParams.lfo);
  const [glide, setGlide] = useState(defaultParams.glide);
  const [pressedNotes, setPressedNotes] = useState<number[]>([]);
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [outputLevel, setOutputLevel] = useState(0);
  const [isOverloading, setIsOverloading] = useState(false);
  const [pitchWheel, setPitchWheel] = useState(0);
  const [modWheel, setModWheel] = useState(0);

  const [keyboardOctave, setKeyboardOctave] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterDetune, setMasterDetune] = useState(0);
  const [scale, setScale] = useState(1);
  const [midiStatus, setMidiStatus] = useState<
    "none" | "available" | "connected" | "error"
  >("none");
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [decayRelease, setDecayRelease] = useState(true);
  const [driveAmount, setDriveAmount] = useState(0.2);
  const [driveMode, setDriveMode] = useState<"soft" | "hard" | "fold">("soft");
  const [driveEnabled, setDriveEnabled] = useState(true);

  // Performance Controls State
  const [isSustaining, setIsSustaining] = useState(false);
  const sustainNotes = useRef<Set<number>>(new Set());
  const activeKeys = useRef<Set<string>>(new Set());

  async function initAudio() {
    try {
      if (audioEngine) {
        if (audioEngine.getContext().state === "suspended") {
          await audioEngine.resume();
        } else {
          // Toggle "OFF" (or just dispose)
          audioEngine.dispose();
          setAudioEngine(null);
        }
        return;
      }
      const context = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const engine = new AudioEngine(context);
      setAudioEngine(engine);
    } catch (err) {
      console.error("Failed to initialize audio:", err);
    }
  }

  // Auto-init on mount (will be suspended)
  useEffect(() => {
    initAudio();

    // Resume on first interaction
    const resume = () => {
      audioEngine?.resume();
      window.removeEventListener("mousedown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("mousedown", resume);
    window.addEventListener("keydown", resume);
    return () => {
      window.removeEventListener("mousedown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  // Handle Key Press with Sustain logic
  const handleKeyPress = useCallback(
    (note: number) => {
      setPressedNotes((prev) => [...new Set([...prev, note])]);
      if (!audioEngine) return;
      const transposedNote = note + keyboardOctave * 12;
      audioEngine.resume();
      audioEngine.noteOn(transposedNote);
    },
    [audioEngine, keyboardOctave],
  );

  // Handle Key Release with Sustain logic
  const handleKeyRelease = useCallback(
    (note: number) => {
      setPressedNotes((prev) => prev.filter((n) => n !== note));
      if (!audioEngine) return;

      const transposedNote = note + keyboardOctave * 12;
      if (isSustaining) {
        sustainNotes.current.add(transposedNote);
      } else {
        audioEngine.noteOff(transposedNote);
      }
    },
    [audioEngine, keyboardOctave, isSustaining],
  );

  // Performance Loop for Smooth Wheel Movement
  useEffect(() => {
    let raf: number;
    const updateWheels = () => {
      // PITCH: Computer Keyboard takes priority if held
      const kbdUp = activeKeys.current.has("shift");
      const kbdDown = activeKeys.current.has("control");

      if (kbdUp || kbdDown) {
        const target = kbdUp ? 1 : -1;
        setPitchWheel((prev) => prev + (target - prev) * 0.15);
      }
      // NOTE: We don't force return to 0 here to allow MIDI to hold a value.
      // The KeyUp event handler will handle the return-to-zero for Z/X.

      // MOD: Computer Keyboard takes priority if held
      if (activeKeys.current.has("alt")) {
        setModWheel((prev) => prev + (0.7 - prev) * 0.1);
      }

      raf = requestAnimationFrame(updateWheels);
    };
    updateWheels();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard Shortcuts Effect
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 36,
      w: 37,
      s: 38,
      e: 39,
      d: 40,
      f: 41,
      t: 42,
      g: 43,
      y: 44,
      h: 45,
      u: 46,
      j: 47,
      k: 48,
    };

    const onDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (activeKeys.current.has(key)) return;
      activeKeys.current.add(key);

      // Notes
      const note = keyMap[key];
      if (note !== undefined) {
        handleKeyPress(note);
      }

      // Octaves
      if (key === "z") setKeyboardOctave((prev) => Math.max(-2, prev - 1));
      if (key === "x") setKeyboardOctave((prev) => Math.min(2, prev + 1));

      // Sustain
      if (key === " ") {
        e.preventDefault();
        setIsSustaining(true);
      }
    };

    const onUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      activeKeys.current.delete(key);

      const note = keyMap[key];
      if (note !== undefined) {
        handleKeyRelease(note);
      }

      // Performance hand-off: return wheels to zero when performance keys are released
      if (key === "shift" || key === "control") {
        const returnToCenter = () => {
          setPitchWheel((prev) => {
            if (
              activeKeys.current.has("shift") ||
              activeKeys.current.has("control")
            )
              return prev;
            if (Math.abs(prev) < 0.01) return 0;
            const next = prev * 0.8;
            requestAnimationFrame(returnToCenter);
            return next;
          });
        };
        returnToCenter();
      }

      if (key === "alt") {
        const returnMod = () => {
          setModWheel((prev) => {
            if (activeKeys.current.has("alt")) return prev;
            if (Math.abs(prev) < 0.01) return 0;
            const next = prev * 0.8;
            requestAnimationFrame(returnMod);
            return next;
          });
        };
        returnMod();
      }

      // Sustain Release
      if (key === " ") {
        setIsSustaining(false);
      }
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [handleKeyPress, handleKeyRelease]);

  useEffect(() => {
    if (!isSustaining && audioEngine) {
      sustainNotes.current.forEach((note) => {
        audioEngine.noteOff(note);
      });
      sustainNotes.current.clear();
    }
  }, [isSustaining, audioEngine]);

  // Request MIDI access immediately on mount
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      setMidiStatus("available");
      navigator
        .requestMIDIAccess({ sysex: false })
        .then((access) => {
          setMidiAccess(access);
          setMidiStatus(access.inputs.size > 0 ? "connected" : "available");
          access.onstatechange = () => {
            setMidiStatus(access.inputs.size > 0 ? "connected" : "available");
          };
        })
        .catch(() => setMidiStatus("error"));
    }
  }, []);

  // Attach MIDI listeners when engine or access changes
  useEffect(() => {
    if (!audioEngine || !midiAccess) return;

    const attachListeners = () => {
      midiAccess.inputs.forEach((input: any) => {
        input.onmidimessage = (msg: any) => {
          if (!msg.data) return;
          const [status, data1, data2] = msg.data;
          const type = status & 0xf0;
          switch (type) {
            case 0x90:
              if (data2 > 0) handleKeyPress(data1 - keyboardOctave * 12);
              else handleKeyRelease(data1 - keyboardOctave * 12);
              break;
            case 0x80:
              handleKeyRelease(data1 - keyboardOctave * 12);
              break;
            case 0xe0:
              const bend = (data2 << 7) | data1;
              setPitchWheel((bend - 8192) / 8192);
              break;
            case 0xb0:
              if (data1 === 1) setModWheel(data2 / 127);
              else if (data1 === 7) setMasterVolume(data2 / 127);
              else if (data1 === 74)
                setFilter((prev) => ({ ...prev, cutoff: data2 / 127 }));
              else if (data1 === 71)
                setFilter((prev) => ({
                  ...prev,
                  resonance: (data2 / 127) * 20,
                }));
              break;
          }
        };
      });
    };

    attachListeners();
    const prevOnStateChange = midiAccess.onstatechange;
    midiAccess.onstatechange = (e: any) => {
      if (prevOnStateChange) prevOnStateChange(e);
      attachListeners();
      setMidiStatus(midiAccess.inputs.size > 0 ? "connected" : "available");
    };
  }, [
    audioEngine,
    midiAccess,
    keyboardOctave,
    handleKeyPress,
    handleKeyRelease,
  ]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScale(Math.min(1, Math.min(width / 1500, height / 900)));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.updateOscillator(0, osc1);
    audioEngine.updateOscillator(1, osc2);
    audioEngine.updateOscillator(2, osc3);
    audioEngine.updateNoise(noise);
    audioEngine.setSync(osc1.sync || osc2.sync || osc3.sync);
  }, [osc1, osc2, osc3, noise, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.updateEnvelopes(vcaEnvelope, filterEnvelope);
  }, [vcaEnvelope, filterEnvelope, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.updateFilter(filter);
  }, [filter, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setMasterDetune(masterDetune);
  }, [masterDetune, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setDrive(driveAmount, driveMode, driveEnabled);
  }, [driveAmount, driveMode, driveEnabled, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setKeyboardTracking(filter.keyboardFollow);
    audioEngine.setDecayRelease(decayRelease);
  }, [filter.keyboardFollow, decayRelease, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setGlide(glide.time);
  }, [glide.time, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setPitchBend(pitchWheel * 2);
  }, [pitchWheel, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    audioEngine.setModulation(modWheel);
  }, [modWheel, audioEngine]);

  useEffect(() => {
    if (!audioEngine) return;
    let raf: number;
    const meter = audioEngine.getLedMeter();
    const data = new Uint8Array(meter.frequencyBinCount);
    const updateMeter = () => {
      meter.getByteFrequencyData(data);
      const sum = data.reduce((a, b) => a + b, 0);
      const level = sum / data.length / 128;
      setOutputLevel(level);
      setIsOverloading(level > 0.85); // Overload threshold
      raf = requestAnimationFrame(updateMeter);
    };
    updateMeter();
    return () => cancelAnimationFrame(raf);
  }, [audioEngine]);

  const loadPreset = (params: any) => {
    if (audioEngine) audioEngine.stopAllNotes();
    setPressedNotes([]);
    if (params.osc1) setOsc1(params.osc1);
    if (params.osc2) setOsc2(params.osc2);
    if (params.osc3) setOsc3(params.osc3);
    if (params.noise) setNoise(params.noise);
    if (params.filter) setFilter(params.filter);
    if (params.vcaEnvelope) setVcaEnvelope(params.vcaEnvelope);
    if (params.filterEnvelope) setFilterEnvelope(params.filterEnvelope);
    if (params.glide) setGlide(params.glide);
    if (params.masterVolume !== undefined) setMasterVolume(params.masterVolume);
    if (params.driveAmount !== undefined) setDriveAmount(params.driveAmount);
    if (params.driveMode) setDriveMode(params.driveMode);
    if (params.driveEnabled !== undefined) setDriveEnabled(params.driveEnabled);
    if (params.decayRelease !== undefined) setDecayRelease(params.decayRelease);
  };

  const getCurrentParams = () => ({
    osc1,
    osc2,
    osc3,
    noise,
    filter,
    vcaEnvelope,
    filterEnvelope,
    glide,
    masterVolume,
    driveAmount,
    driveMode,
    driveEnabled,
    decayRelease,
  });

  const octaveUp = () => setKeyboardOctave((prev) => Math.min(2, prev + 1));
  const octaveDown = () => setKeyboardOctave((prev) => Math.max(-2, prev - 1));

  const activeNote =
    pressedNotes.length > 0
      ? pressedNotes[pressedNotes.length - 1] + keyboardOctave * 12
      : null;

  return (
    <div
      className="minimono-container"
      style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
    >
      <PresetManager
        currentParams={getCurrentParams()}
        onLoadPreset={loadPreset}
      />
      <div className="main-panel">
        <div className="panel-section controllers-section">
          <div className="section-label">Controllers</div>
          <div className="panel-column">
            <div style={{ marginBottom: 15 }}>
              <div style={{ fontSize: 9, color: "#888", marginBottom: 5 }}>
                OCTAVE
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={octaveDown}
                  style={{
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    color: "#ff6600",
                    minWidth: 20,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {keyboardOctave}
                </span>
                <button
                  onClick={octaveUp}
                  style={{
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
              <div
                style={{
                  fontSize: 7,
                  color: "#555",
                  marginTop: 4,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                [Z] DOWN / UP [X]
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 7,
                  color:
                    midiStatus === "connected"
                      ? "#00ff00"
                      : midiStatus === "available"
                        ? "#888"
                        : "#444",
                  letterSpacing: 1,
                  fontWeight: 700,
                }}
              >
                {midiStatus === "connected"
                  ? "MIDI ONLINE"
                  : midiStatus === "available"
                    ? "MIDI WAITING"
                    : "MIDI OFF"}
              </div>
            </div>
          </div>
          <div
            className="control-group"
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 7,
                  color: "#888",
                  display: "block",
                  textAlign: "center",
                }}
              >
                GLIDE
              </span>
              <Knob
                value={glide.time}
                min={0}
                max={1}
                label=""
                onChange={(v) => setGlide({ ...glide, time: v })}
                size="small"
              />
            </div>
            <div>
              <span
                style={{
                  fontSize: 7,
                  color: "#888",
                  display: "block",
                  textAlign: "center",
                }}
              >
                TUNE
              </span>
              <Knob
                value={masterDetune}
                min={-600}
                max={600}
                label=""
                onChange={setMasterDetune}
                size="small"
                step={1}
                initial={0}
              />
            </div>
          </div>
        </div>

        <div className="panel-section oscillators-section">
          <Osc1Panel config={osc1} onChange={setOsc1} />
          <Osc2Panel config={osc2} onChange={setOsc2} />
          <Osc3Panel config={osc3} onChange={setOsc3} />
          <NoisePanel
            config={noise}
            onChange={setNoise}
            analyser={audioEngine ? audioEngine.getAnalyser() : null}
            activeNote={activeNote}
          />
        </div>

        <div className="panel-section filter-section">
          <div className="section-label">Filter</div>
          <FilterPanel
            config={filter}
            onChange={(f) => setFilter((prev) => ({ ...prev, ...f }))}
            isOverloading={isOverloading}
          />
        </div>

        <div className="panel-section envelopes-section">
          <div className="section-label">Envelopes</div>
          <EnvelopesPanel
            vcaEnvelope={vcaEnvelope}
            filterEnvelope={filterEnvelope}
            onVcaChange={(e) => setVcaEnvelope((prev) => ({ ...prev, ...e }))}
            onFilterEnvChange={(e) =>
              setFilterEnvelope((prev) => ({ ...prev, ...e }))
            }
            decayRelease={decayRelease}
            onDecayReleaseChange={setDecayRelease}
          />
        </div>

        <div className="panel-section output-section">
          <div className="section-label">Output</div>
          <div className="panel-column" style={{ gap: 12 }}>
            <div style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
              <Knob
                value={masterVolume}
                min={0}
                max={1}
                label="VOLUME"
                initial={0.8}
                onChange={setMasterVolume}
                size="medium"
              />
              <div
                className="leds"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  marginTop: 10,
                }}
              >
                {Array.from({ length: 6 })
                  .reverse()
                  .map((_, i) => {
                    const isActive = outputLevel * 6 > 5 - i;
                    return (
                      <div
                        key={i}
                        className="led-meter"
                        style={{
                          width: 12,
                          height: 4,
                          borderRadius: 1,
                          backgroundColor: isActive
                            ? 5 - i < 4
                              ? "#00ff00"
                              : "#ff0000"
                            : "#111",
                          boxShadow: isActive
                            ? `0 0 6px ${5 - i < 4 ? "#00ff00" : "#ff0000"}`
                            : "none",
                          transition: "background-color 0.1s",
                        }}
                      />
                    );
                  })}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "10px 0",
                borderTop: "1px solid #222",
                width: "100%",
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: 5, right: 10 }}>
                 <Toggle active={driveEnabled} onClick={() => setDriveEnabled(!driveEnabled)} color="red" label="" />
              </div>
              <Knob
                value={driveAmount}
                min={0}
                max={1}
                label="DRIVE"
                onChange={setDriveAmount}
                size="small"
              />
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {(["soft", "hard", "fold"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDriveMode(mode)}
                    style={{
                      background: driveMode === mode ? "#ff6600" : "#111",
                      color: driveMode === mode ? "#000" : "#888",
                      border: "1px solid #333",
                      fontSize: "6px",
                      padding: "2px 4px",
                      borderRadius: 2,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="keyboard-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div className="wheels-container">
            <Wheel
              type="pitch"
              value={pitchWheel}
              onChange={setPitchWheel}
              label="PITCH"
            />
            <Wheel
              type="mod"
              value={modWheel}
              onChange={setModWheel}
              label="MOD"
            />
          </div>
          <div
            style={{
              fontSize: 7,
              color: "#555",
              letterSpacing: 1,
              textAlign: "center",
              maxWidth: 100,
            }}
          >
            [SHIFT] / [CTRL] PITCH
            <br />
            [ALT] MODULATION
            <br />
            [SPACE] SUSTAIN
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          <Keyboard
            onNoteOn={handleKeyPress}
            onNoteOff={handleKeyRelease}
            pressedNotes={pressedNotes}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
