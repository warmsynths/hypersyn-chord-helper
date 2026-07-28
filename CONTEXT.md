# Domain Glossary & Model — hypersyn-chord-helper

This document defines the core domain concepts for the hypersyn-chord-helper application.

## 1. Harmony
- **Chord**: A combination of pitch intervals relative to a root note (e.g. `Cmaj7`, `Dm7`).
- **Voicing**: A spatial arrangement of chord intervals (e.g., `closed`, `drop2`, `drop3`, `open-triad`, `spread`, `octave`, `first-inversion`, `shell-dominant`, `altered-dominant`).
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

## 4. Tracker Store
- **Step Strip**: The multi-set progression sequence UI control (steps 1..N).
- **Active Set**: The currently selected chord progression step within the active session.
- **Session State**: Encapsulated state containing `chordSetsData`, `activeSetIndex`, and conversion status (`hasConverted`).
