import React, { useCallback, useRef, useEffect } from "react";
import "../styles/keyboard.css";

interface KeyboardProps {
  onNoteOn?: (note: number) => void;
  onNoteOff?: (note: number) => void;
  pressedNotes?: number[];
}

const START_NOTE = 36;
const OCTAVES = 4;
const TOTAL_SEMITONES = OCTAVES * 12 + 1; // C3 to C7
const BLACK_NOTE_PATTERN = new Set([1, 3, 6, 8, 10]);

const buildLayout = () => {
  let whiteCount = 0;
  const whites: { note: number }[] = [];
  const blacks: { note: number; atWhiteBoundary: number }[] = [];

  for (let i = 0; i < TOTAL_SEMITONES; i++) {
    const note = START_NOTE + i;
    const noteInOctave = i % 12;
    const isBlack = BLACK_NOTE_PATTERN.has(noteInOctave);
    if (isBlack) {
      blacks.push({ note, atWhiteBoundary: whiteCount });
    } else {
      whites.push({ note });
      whiteCount++;
    }
  }

  const totalWhite = whiteCount;
  const blackWidthPct = (1 / totalWhite) * 58;

  const blackLayouts = blacks.map(({ note, atWhiteBoundary }) => ({
    note,
    leftPct: (atWhiteBoundary / totalWhite) * 100 - blackWidthPct / 2,
    widthPct: blackWidthPct,
  }));

  return { whites, blackLayouts };
};

const { whites, blackLayouts } = buildLayout();

const Keyboard: React.FC<KeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  pressedNotes = [],
}) => {
  const isPointerDown = useRef(false);
  const heldNotes = useRef<Set<number>>(new Set());
  const activeNotes = new Set(pressedNotes);

  const handlePointerDown = (note: number, e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isPointerDown.current = true;
    heldNotes.current.add(note);
    onNoteOn?.(note);
  };

  const handlePointerUp = (note: number, e: React.PointerEvent) => {
    isPointerDown.current = false;
    heldNotes.current.delete(note);
    onNoteOff?.(note);
  };

  const handlePointerEnter = (note: number) => {
    if (!isPointerDown.current) return;
    if (!heldNotes.current.has(note)) {
      heldNotes.current.add(note);
      onNoteOn?.(note);
    }
  };

  const handlePointerLeave = (note: number) => {
    if (!isPointerDown.current) return;
    if (heldNotes.current.has(note)) {
      heldNotes.current.delete(note);
      onNoteOff?.(note);
    }
  };

  // Global safety
  useEffect(() => {
    const handleUp = () => {
      isPointerDown.current = false;
      heldNotes.current.forEach(note => onNoteOff?.(note));
      heldNotes.current.clear();
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, [onNoteOff]);

  return (
    <div className="keyboard-component-root">
      <div className="keyboard-wrapper">
        <div className="white-keys-container">
          {whites.map(({ note }) => (
            <div
              key={note}
              className={`white-key${activeNotes.has(note) ? " active" : ""}`}
              onPointerDown={(e) => handlePointerDown(note, e)}
              onPointerUp={(e) => handlePointerUp(note, e)}
              onPointerEnter={() => handlePointerEnter(note)}
              onPointerLeave={() => handlePointerLeave(note)}
            />
          ))}
        </div>

        <div className="black-keys-container">
          {blackLayouts.map(({ note, leftPct, widthPct }) => (
            <div
              key={note}
              className={`black-key${activeNotes.has(note) ? " active" : ""}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              onPointerDown={(e) => handlePointerDown(note, e)}
              onPointerUp={(e) => handlePointerUp(note, e)}
              onPointerEnter={() => handlePointerEnter(note)}
              onPointerLeave={() => handlePointerLeave(note)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Keyboard;
