# 02 — M8 Song (.m8s) Single-Set Arrangement & Terminal Command

**What to build:**
The user can type `export song [name]` or `export m8s [name]` in the CRT terminal to generate and download a complete Dirtywave M8 Song (`.m8s`) file for the active chord progression. The song embeds Instrument 00 (the configured Hypersynth instrument with progression chord banks), generates a 16-step phrase for each chord in the progression (Step 00 triggering root note + `CHD` command selecting its chord bank, with steps 01–15 sustaining), places these phrases in Chain 00, and assigns Track 1 Step 00 to Chain 00.

**Blocked by:** 01 — M8 Hypersynth Instrument (.m8i) Export & Terminal Command

**Status:** completed

- [x] Typing `export song` or `export m8s` in the terminal compiles a valid M8 Song binary file (`.m8s`).
- [x] Embeds Instrument 00 as the configured Hypersynth instrument.
- [x] Generates a dedicated 16-step phrase for each chord in the active progression.
- [x] Sets Step 00 of each phrase to trigger the chord root note and the `CHD` FX command matching its chord bank index.
- [x] Leaves steps 01–15 empty so the chord sustains for the 16-step duration.
- [x] Populates Chain 00 with the sequence of phrases and assigns Song Step 00 Track 1 to Chain 00.
- [x] Triggers browser download with filename `[name].m8s` (or derived progression slug if name is omitted).
- [x] Unit tests verify `.m8s` song structure, tempo, phrases, chain steps, and downbeat chord triggering.
