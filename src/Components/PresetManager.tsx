import React, { useState, useEffect } from "react";
import { Preset, factoryPresets } from "../Presets/presets";

interface PresetManagerProps {
  currentParams: any;
  onLoadPreset: (params: any) => void;
}

const adjectives = ["Liquid", "Electric", "Dusty", "Cosmic", "Modular", "Neon", "Organic", "Cyber", "Vintage", "Lunar", "Acid", "Smooth", "Fuzzy", "Sharp", "Deep"];
const nouns = ["Waves", "Cloud", "Ghost", "Signal", "Heart", "Echo", "Machine", "Vortex", "Pulse", "Dream", "Bass", "Lead", "Pad", "Drone", "Star"];

const getRandomName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};

const PresetManager: React.FC<PresetManagerProps> = ({
  currentParams,
  onLoadPreset,
}) => {
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState(getRandomName());
  const [selectedPresetName, setSelectedPresetName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("minimono_user_presets");
    if (saved) {
      try {
        setUserPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load user presets", e);
      }
    }
  }, []);

  const saveToLocalStorage = (presets: Preset[]) => {
    localStorage.setItem("minimono_user_presets", JSON.stringify(presets));
  };

  const handleSave = () => {
    const newPreset: Preset = {
      name: presetName,
      params: {
        ...JSON.parse(JSON.stringify(currentParams)),
        name: presetName // Store name inside params too for export/import reliability
      }
    };
    const updated = [...userPresets, newPreset];
    setUserPresets(updated);
    saveToLocalStorage(updated);
    setSelectedPresetName(presetName);
    setPresetName(getRandomName()); // Prep next name
  };

  const handleRandomize = () => {
    const waves: ("tri" | "tri-saw" | "rev-saw" | "saw" | "sq" | "pulse-wide" | "pulse-narrow")[] = ["tri", "tri-saw", "rev-saw", "saw", "sq", "pulse-wide", "pulse-narrow"];
    const noiseTypes: ("white" | "pink" | "brown")[] = ["white", "pink", "brown"];

    const r = (min: number, max: number) => Math.random() * (max - min) + min;
    const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const randomParams = {
      osc1: { wave: pick(waves), octave: ri(-1, 1), detune: r(-10, 10), level: r(0.4, 0.9), sync: false, pulseWidth: r(10, 50) },
      osc2: { wave: pick(waves), octave: ri(-1, 1), detune: r(-15, 15), level: r(0, 0.8), sync: false, pulseWidth: r(10, 50) },
      osc3: { wave: pick(waves), octave: ri(-2, 1), detune: r(-20, 20), level: r(0, 0.8), sync: false, pulseWidth: r(10, 50) },
      noise: { type: pick(noiseTypes), level: Math.random() < 0.3 ? r(0.1, 0.4) : 0 },
      filter: { cutoff: r(0.1, 0.8), resonance: r(0, 15), envelopeAmount: r(0, 0.8), keyboardFollow: Math.random() > 0.5 },
      vcaEnvelope: { attack: r(0.001, 0.5), decay: r(0.1, 2.0), sustain: r(0.1, 1.0), release: r(0.1, 2.0) },
      filterEnvelope: { attack: r(0.001, 1.0), decay: r(0.1, 2.0), sustain: r(0, 0.8), release: r(0.1, 2.0) },
      glide: { time: Math.random() < 0.2 ? r(0.1, 0.5) : 0, mode: "never" },
      masterVolume: 0.8,
      driveAmount: r(0, 0.6),
      driveMode: pick(['soft', 'hard', 'fold']),
      driveEnabled: Math.random() > 0.4,
      decayRelease: Math.random() > 0.3
    };

    onLoadPreset(randomParams);
    setPresetName(getRandomName());
    setSelectedPresetName("");
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ ...currentParams, name: selectedPresetName || presetName }));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${(selectedPresetName || presetName).replace(/\s+/g, "_").toLowerCase()}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        try {
          const json = JSON.parse(event.target.result as string);
          // Use name inside JSON or filename (sans extension)
          const name = json.name || file.name.replace(".json", "").replace(/_/g, " ").toUpperCase();
          
          const newPreset: Preset = {
            name: name,
            params: json
          };
          
          const updated = [...userPresets, newPreset];
          setUserPresets(updated);
          saveToLocalStorage(updated);
          onLoadPreset(json);
          setSelectedPresetName(name);
        } catch (err) {
          alert("Invalid preset file");
        }
      }
    };
    fileReader.readAsText(file);
  };

  const handleDelete = () => {
    if (!selectedPresetName) return;
    const isUserPreset = userPresets.some(p => p.name === selectedPresetName);
    if (!isUserPreset) {
      alert("Factory presets cannot be deleted.");
      return;
    }
    
    if (confirm(`Delete user preset "${selectedPresetName}"?`)) {
      const updated = userPresets.filter(p => p.name !== selectedPresetName);
      setUserPresets(updated);
      saveToLocalStorage(updated);
      setSelectedPresetName("");
    }
  };

  const allPresets = [...factoryPresets, ...userPresets];

  return (
    <div
      className="preset-manager"
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        padding: "8px 20px",
        background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
        border: "1px solid #333",
        borderRadius: "6px",
        margin: "0 0 15px 0",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "10px", color: "#666", fontWeight: 700, letterSpacing: "1px" }}>PATCH</span>
        <select
          value={selectedPresetName}
          onChange={(e) => {
            const preset = allPresets.find((p) => p.name === e.target.value);
            if (preset) {
                onLoadPreset(preset.params);
                setSelectedPresetName(preset.name);
            } else {
                setSelectedPresetName("");
            }
          }}
          style={{
            background: "#000",
            color: "#f2e9d2",
            border: "1px solid #444",
            fontSize: "11px",
            padding: "4px 8px",
            borderRadius: "3px",
            cursor: "pointer",
            minWidth: "180px",
          }}
        >
          <option value="">Select Preset...</option>
          <optgroup label="Factory">
            {factoryPresets.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </optgroup>
          {userPresets.length > 0 && (
            <optgroup label="User">
              {userPresets.map((p, i) => (
                <option key={`${p.name}-${i}`} value={p.name}>{p.name}</option>
              ))}
            </optgroup>
          )}
        </select>
        
        <button onClick={handleRandomize} style={{ background: "#333", color: "#888", border: "1px solid #444", fontSize: "9px", fontWeight: 700, padding: "5px 12px", borderRadius: "3px", cursor: "pointer", textTransform: "uppercase" }}>
          Random
        </button>

        {selectedPresetName && userPresets.some(p => p.name === selectedPresetName) && (
            <button 
                onClick={handleDelete}
                style={{ background: "#400", color: "#f88", border: "1px solid #600", fontSize: "9px", fontWeight: 700, padding: "5px 10px", borderRadius: "3px", cursor: "pointer", textTransform: "uppercase" }}
            >Delete</button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="New Preset Name..."
          style={{
            background: "#000",
            color: "#fff",
            border: "1px solid #444",
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "3px",
            width: "140px",
          }}
        />
        <button
          onClick={handleSave}
          style={{ background: "#ff6600", color: "#000", border: "none", fontSize: "10px", fontWeight: 700, padding: "5px 15px", borderRadius: "3px", cursor: "pointer", textTransform: "uppercase" }}
        >
          Save
        </button>

        <div style={{ width: 1, height: 20, background: "#333", margin: "0 5px" }} />

        <button onClick={handleExport} style={{ background: "#222", color: "#888", border: "1px solid #333", fontSize: "9px", padding: "4px 10px", borderRadius: "3px", cursor: "pointer", textTransform: "uppercase" }}>
          Export
        </button>

        <label style={{ background: "#222", color: "#888", border: "1px solid #333", fontSize: "9px", padding: "4px 10px", borderRadius: "3px", cursor: "pointer", textTransform: "uppercase" }}>
          Import
          <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
        </label>
      </div>
    </div>
  );
};

export default PresetManager;
