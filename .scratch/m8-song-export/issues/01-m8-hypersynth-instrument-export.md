# 01 — M8 Hypersynth Instrument (.m8i) Export & Terminal Command

**What to build:**
The user can type `export instr [name]` or `export m8i [name]` in the CRT terminal to generate and download a standalone Dirtywave M8 Hypersynth instrument preset (`.m8i`) file. The instrument format is populated with the unique chord interval shapes (up to 6 semitones per bank) extracted from the active progression's voicings into its 16 chord banks (`00`–`0F`) and configured with the Lush Synth Pad / Keys default timbre (warm saw oscillators, stereo width, gentle lowpass filter, smooth envelope, subtle chorus/reverb send).

**Blocked by:** None — can start immediately

**Status:** completed

- [x] Typing `export instr` or `export m8i` in the terminal extracts the unique interval shapes from the active progression.
- [x] Compiles a valid M8 Hypersynth binary instrument file (`.m8i`) with 16 chord banks populated with semitone intervals.
- [x] Sets the Hypersynth instrument default timbre parameters (saw oscillators, stereo width, envelope, filter, chorus/reverb).
- [x] Triggers browser download with filename `[name].m8i` (or derived progression slug if name is omitted).
- [x] Unit tests verify `.m8i` binary structure, header magic, and chord bank semitone mappings.
