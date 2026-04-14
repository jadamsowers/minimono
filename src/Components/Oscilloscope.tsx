import React, { useRef, useEffect, useCallback } from "react";
import "../styles/oscilloscope.css";

interface OscilloscopeProps {
  analyser: AnalyserNode | null;
  /** MIDI note number (already transposed). null when no note playing. */
  activeNote: number | null;
}

const SAMPLE_RATE = 44100;
const TARGET_CYCLES = 2.5; // cycles to show when a note is active
const DEFAULT_SHOW_SAMPLES = 1024; // ~23ms when idle

function noteToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({ analyser, activeNote }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeNoteRef = useRef<number | null>(activeNote);

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  const startAnimation = useCallback(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.fftSize; // 2048
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // --- Determine how many samples to render ---
      let samplesToShow: number;
      const note = activeNoteRef.current;
      if (note !== null) {
        const freq = noteToFreq(note);
        const samplesPerCycle = SAMPLE_RATE / freq;
        samplesToShow = Math.round(samplesPerCycle * TARGET_CYCLES);
        // Clamp to a safe range within the buffer
        samplesToShow = Math.max(32, Math.min(samplesToShow, bufferLength / 2));
      } else {
        samplesToShow = DEFAULT_SHOW_SAMPLES;
      }

      // --- Find zero-crossing trigger for stable display ---
      let offset = 0;
      const searchLimit = Math.min(
        bufferLength / 2,
        bufferLength - samplesToShow
      );
      for (let i = 1; i < searchLimit; i++) {
        if (dataArray[i - 1] < 128 && dataArray[i] >= 128) {
          offset = i;
          break;
        }
      }

      // --- Clear with phosphor trail ---
      ctx.fillStyle = "rgba(10, 12, 12, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Grid ---
      ctx.strokeStyle = "rgba(242, 233, 210, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 4) * i);
        ctx.lineTo(canvas.width, (canvas.height / 4) * i);
        ctx.stroke();
      }
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 8) * i, 0);
        ctx.lineTo((canvas.width / 8) * i, canvas.height);
        ctx.stroke();
      }

      // --- Waveform ---
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ff6600";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#ff6600";
      ctx.beginPath();

      const sliceWidth = canvas.width / samplesToShow;
      for (let i = 0; i < samplesToShow; i++) {
        const v = dataArray[i + offset] / 128.0;
        const x = i * sliceWidth;
        const y = v * (canvas.height / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [analyser]);

  useEffect(() => {
    const cleanup = startAnimation();
    return cleanup;
  }, [startAnimation]);

  return (
    <div className="oscilloscope-frame">
      <div className="oscilloscope-screen">
        <canvas ref={canvasRef} width={210} height={110} />
        <div className="screen-glare" />
      </div>
    </div>
  );
};

export default Oscilloscope;
