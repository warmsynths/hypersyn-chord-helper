# Specification: Dirtywave M8 Song (.m8s) and Hypersynth Instrument (.m8i) Export

## Problem Statement

When musicians and tracker producers create chord progressions in Hypersyn Chord Helper, they currently receive hex strings and interval codes on screen or can export project data as JSON. However, transferring these progressions into the Dirtywave M8 Tracker requires manually typing every hex interval into Hypersynth chord banks on the device and manually programming the root notes, instruments, and `CHD` FX commands step-by-step into M8 phrases and chains. This manual transcription is tedious, prone to human error, and interrupts the creative musical workflow.

## Solution

Provide direct, one-click binary export of arranged **M8 Songs (`.m8s`)** and standalone **M8 Hypersynth Instruments (`.m8i`)** directly from Hypersyn Chord Helper via the CRT terminal shell. The application analyzes the user's active chord progression and multi-step progression sets, populates the 16 chord banks of a dedicated Hypersynth instrument with the exact semitone interval shapes of the voicings, arranges a sequence of 16-step phrases and chains representing each progression step, and delivers ready-to-load `.m8s` and `.m8i` files for instant playback on M8 hardware or M8 headless setups.

## User Stories

1. As a tracker musician, I want to export my chord progression as a `.m8s` song file, so that I can load it straight onto my Dirtywave M8 SD card and immediately play my song.
2. As a synth enthusiast, I want to export my configured chord shapes as a `.m8i` instrument patch, so that I can reuse my custom Hypersynth chord banks across any existing M8 project.
3. As a producer using the terminal interface, I want to type `export song [name]` or `export m8s [name]`, so that I can download a complete M8 song file without leaving the CRT command line.
4. As a producer using the terminal interface, I want to type `export instr [name]` or `export m8i [name]`, so that I can download a standalone Hypersynth instrument preset file with my chord banks pre-populated.
5. As a terminal user, I want inline tab auto-completion for `export song`, `export m8s`, `export instr`, and `export m8i`, so that discovering and entering export commands is fast and frictionless.
6. As a user with multiple Chord Sets in the Step Strip, I want each Chord Set to map to its own M8 Chain, so that multi-part song structures (e.g. Verse, Chorus, Bridge) are preserved in order.
7. As a musician arranging a track, I want each chord in a progression to occupy its own 16-step M8 Phrase, so that I have a clean tracker bar per chord for adding fills, arpeggios, or custom automation.
8. As a composer, I want Step 00 of each chord phrase to trigger the chord's root note with the Hypersynth instrument and the corresponding `CHD` FX command, so that the correct chord bank plays on the downbeat.
9. As a composer, I want steps 01–15 of each chord phrase to remain open/empty by default, so that lush pads and synth keys sustain naturally for the full bar length.
10. As a producer, I want Song Steps on Track 1 of the exported M8 song to reference the generated Chains in sequential order, so that pressing Play on the M8 plays through the entire progression seamlessly.
11. As a sound designer, I want the generated Hypersynth instrument to come loaded with a polished "Lush Synth Pad / Keys" default timbre (warm saw oscillators, stereo width, gentle lowpass filter, smooth envelope, subtle chorus/reverb send), so that the chords sound musical and inspiring right out of the box.
12. As a user who crafts complex progressions, I want the exporter to group unique interval shapes into Hypersynth chord banks `00` through `0F`, so that identical chord shapes reuse the same bank efficiently.
13. As a user whose project contains more than 16 unique chord interval shapes, I want the CRT terminal to display a clear warning notifying me of the 16 chord bank limit, so that I understand which chords exceed hardware bank capacity.
14. As a user, I want the CRT log to print a clear confirmation message (e.g. `[ok] exported M8 song 'NAME.m8s' (X chains, Y phrases)`), so that I know the file was successfully compiled and downloaded.
15. As a user viewing the `help` or `about` commands, I want the new export commands documented in the terminal help output, so that I can learn the syntax without reading external manuals.
16. As a developer writing tests, I want the serialization logic to run synchronously and deterministically in Node and browser environments, so that test suites can verify binary byte structure and regression prevention without DOM dependencies.

## Implementation Decisions

- **Domain Model & M8 Hypersynth Serialization**:
  - Implement a dedicated M8 serializer capable of compiling Dirtywave M8 binary structures:
    - **Hypersynth Instrument (`.m8i`)**: Formats binary header (`0x05` instrument kind for HYPERSYNTH), default parameters (volume, transpose, lush pad envelope, filter cutoff/res, stereo width, chorus/reverb sends), and the 16 chord banks populated with up to 6 semitone offset bytes each.
    - **M8 Song (`.m8s`)**: Compiles full song structure containing tempo (default 120 BPM), groove settings (default groove 6 for standard 16th notes), Instrument 00 (configured Hypersynth), Phrases (1 phrase per chord with root note and `CHD` FX parameter on step 0), Chains (1 chain per Chord Set referencing its chord phrases), and Song Steps on Track 1 sequencing the chains.
- **Chord Bank Allocation**:
  - Chords are analyzed across all active sets in the session.
  - Voicing-applied semitone interval patterns are deduplicated and mapped sequentially to chord bank indices `00` through `0F` (up to 16 slots).
  - If more than 16 unique interval shapes are detected in a single export, the exporter clamps to the first 16 shapes and outputs a prominent CRT warning log.
- **Arrangement Hierarchy**:
  - Session contains `chordSetsData` (array of string progressions representing Steps 1..N).
  - For each Chord Set $i$:
    - Create `Chain i`.
    - For each chord $j$ in Chord Set $i$:
      - Create `Phrase k`.
      - In `Phrase k`, Step `00`: `Note = MIDI root`, `Instrument = 00`, `FX1 = CHD`, `FX1_VAL = chordBankIndex`.
      - Add `Phrase k` to `Chain i` step $j$.
    - Set `Song Step i` track 0 to `Chain i`.
- **Terminal Shell Command Integration**:
  - Add command handlers for:
    - `export song [name]` / `export m8s [name]`
    - `export instr [name]` / `export m8i [name]`
  - If name argument is omitted, derive a clean slug from the active project/set name (defaulting to `hypersyn-song.m8s` / `hypersyn-chords.m8i`).
  - Register all command variations in the auto-complete dictionary with descriptions.
  - Update `help` text and command list in the terminal module.
- **Browser Download Delivery**:
  - Use Blob URL creation and programmatic click triggers to deliver `.m8s` and `.m8i` binary downloads with MIME type `application/octet-stream`.

## Testing Decisions

- **What Makes a Good Test**:
  - Tests must verify external domain behavior and binary contract integrity rather than private implementation details.
  - Tests should verify that given a progression string (e.g. `Am7 Dm9 G13 Cmaj7`), the generated binary buffer contains valid M8 magic headers, correct number of phrases, correct root note pitch values, correct `CHD` command assignments, and exact semitone interval values in the instrument chord banks.
  - Tests should verify boundary conditions: empty input, single chord, multi-set progression, exactly 16 chord shapes, and overflow (>16 chord shapes with warning).
- **Tested Modules**:
  - M8 serializer and chord bank compiler.
  - M8 song builder and chain/phrase arranger.
  - Terminal command parser and validator.
- **Seams & Prior Art**:
  - Single primary serialization seam: `buildM8Song(sessionData, options)` and `buildM8HypersynthInstrument(sessionData, options)`.
  - Prior art: `FmAudio.test.ts` and `Calibration.test.ts` in `m8fm`, plus existing `storage.test.ts` and `chords.test.ts` in `hypersyn-chord-helper`.

## Out of Scope

- Real-time two-way USB serial communication / WebMIDI streaming to M8 hardware (export produces offline `.m8s` / `.m8i` files).
- Multi-track polyphonic distribution across 4 separate tracks (Hypersynth handles 6-voice polyphony on a single track with chord banks).
- Custom FM synth or Sampler instrument generation (focus is specifically on the M8 Hypersynth chord engine).
- GUI modal redesign or non-terminal export buttons (adhering to the Terminal-First decision).

## Further Notes

- Dirtywave M8 Tracker uses 24 ticks per beat and groove 6 for standard 16th-note steps. A 16-step phrase at 120 BPM with groove 6 represents one 4/4 bar of 2.0 seconds.
- The `CHD` FX command on Dirtywave M8 selects the active chord bank (00–0F) for the Hypersynth instrument, allowing dynamic chord selection on every step of a single track.
