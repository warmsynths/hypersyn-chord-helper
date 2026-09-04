# Domain Glossary & Model — hypersyn-chord-helper

This document defines the core domain concepts for the hypersyn-chord-helper application.

## 1. Harmony
- **Chord**: A combination of pitch intervals relative to a root note (e.g. `Cmaj7`, `Dm7`).
- **Voicing**: A spatial arrangement of chord intervals (e.g., `closed`, `drop2`, `drop3`, `open-triad`, `spread`, `octave`, `first-inversion`, `shell-dominant`, `altered-dominant`).
- **Canonical Voicing**: The authoritative registry of chord voicing transforms (root position, inversions, drop-2, spread) defined in the Harmony module and shared across UI cards, audio synthesizer, and M8 export.
- **MIDI Root**: The base MIDI note number corresponding to a root pitch name (e.g., `C` = 60).
- **Interval Map**: Array of semitone offsets from root (e.g., major 7th = `[0, 4, 7, 11]`).

## 2. Audio Engine
- **Synthesizer**: The Web Audio engine producing polyphonic sound output.
- **Juno-60 FX Bus**: Dual-effect processing chain consisting of an LFO-modulated delay chorus and short plate reverb.
- **Voice**: Active oscillator and gain envelope instance mapped to a single MIDI note.
- **Progression Playback**: Sequenced playback of chord steps at a target tempo.

## 3. ChordSet Storage
- **ChordSet Preset**: A named collection of chord progressions saved by the user with a unique UUID.
- **Schema Migration**: Auto-upgrading legacy single-string presets (`chords`) to multi-step progression arrays (`chordSets`).
- **JSON Exporter / Importer**: Exporting presets to `.json` files and importing without overwriting duplicate IDs.
- **Project Actions**: Encapsulated lifecycle operations (`saveProject`, `loadProject`, `deleteProject`, `exportProjectJson`, `importProjectJson`) providing a headless domain interface for both GUI controls and CLI terminal commands.

## 4. Tracker Store
- **Step Strip**: The multi-set progression sequence UI control (steps 1..N).
- **Active Set**: The currently selected chord progression step within the active session.
- **Progression Step**: Encapsulates raw chord input text, ordered `ChordState` instances, active voicing selections, and precomputed semitone intervals for a single sequencer step.
- **Chord State**: In-memory domain representation of an active chord step holding chord name, root pitch, voicing index, resolved interval offsets, and MIDI note values.
- **Session State**: Authoritative domain session holding ordered progression steps (`ProgressionStep[]`), active step index, and conversion status.

## 5. M8 Exporter
- **M8 Song Exporter (`.m8s`)**: Binary exporter generating Dirtywave M8 song files with arranged song tracks, chains, phrases, and embedded Hypersynth chord instruments.
- **M8 Hypersynth Instrument Exporter (`.m8i`)**: Binary exporter producing standalone Dirtywave M8 Hypersynth instrument patches with populated chord banks.
- **M8 Chord Bank**: A 6-slot interval memory bank on the M8 Hypersynth storing semitone offsets from root (maximum 16 banks per instrument).
- **Export Result**: Self-contained export payload containing output filename, binary byte array, diagnostic warnings, and arrangement statistics.

