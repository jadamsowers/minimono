import { Mididebugger } from '@tonejs/midi';

export interface MidiInput {
  name: string;
}

export interface MidiManager {
  connect(input: string): Promise<void>;
  disconnect(): void;
  dispose(): void;
  isMidiConnected(): boolean;
}

let inputs: MididebuggerInput[] = [];
let connectedInput: MididebuggerInput | null = null;
let connected: Promise<MidiInput> | null = null;

function connect() {
  connected = new Promise<MidiInput>((resolve) => {
    const device = inputs.find((i) => i.name.toLowerCase() === connectedInput);
    if (!device) return;
    
    device.on('event', (event) => {
      const note = event.note;
      const velocity = event.velocity;
      const cc = event.cc;
      const pitchBend = event.pitchBent;
      
      if (note === null) return;
      
      switch (event.type) {
        case 'Note-ON':
          handleNoteOn(note, velocity);
          break;
        case 'Note-OFF':
          handleNoteOff(note);
          break;
        case 'Control-Change':
          handleControlChange(cc, velocity);
          break;
        case 'Pitch-Bend':
          handlePitchBend(pitchBend);
          break;
      }
    });
    
    console.log('MIDI connected:', device.name);
    resolve({
      id: device.name,
      name: device.name
    });
  });
}

function handleNoteOn(note: number, velocity: number) {
  console.log('KEY ON:', note, velocity);
  // Note frequency = 440 * 2^((note-69)/12)
  const freq = 440 * Math.pow(2, (note - 69) / 12);
  console.log('Playing note:', note, 'at frequency:', freq);
}

function handleNoteOff(note: number) {
  console.log('KEY OFF:', note);
}

function handleControlChange(cc: number, value: number) {
  console.log('CC', cc, '=', value);
}

function handlePitchBend(pitch: number) {
  console.log('Pitch bend:', pitch);
}

export function createMidiConnection(): MidiManager {
  console.log('MIDI input connected:', connected);
}
