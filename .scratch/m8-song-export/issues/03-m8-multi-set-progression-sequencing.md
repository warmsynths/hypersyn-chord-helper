# 03 — Multi-Set Step Strip M8 Song Arrangement & Capacity Warning

**What to build:**
Multi-set chord progression projects (from the Tracker Step Strip 1..N) export as a complete multi-chain M8 song (`.m8s`), mapping each Chord Set to its own Chain (`Chain 00`, `Chain 01`...) and sequencing them on Track 1 (`Song Step 00` -> `Chain 00`, `Song Step 01` -> `Chain 01`). If a project contains more than 16 unique chord interval shapes, a clear CRT terminal warning is logged while safely clamping to the first 16 shapes.

**Blocked by:** 02 — M8 Song (.m8s) Single-Set Arrangement & Terminal Command

**Status:** completed

- [x] Inspects all Chord Sets in `trackerStore` (Steps 1..N) during export.
- [x] Maps each Chord Set to its own M8 Chain (`Chain 00` for Set 1, `Chain 01` for Set 2, etc.).
- [x] Sequences Chains in order on Track 1 of M8 Song Steps (`Song Step 00` -> `Chain 00`, `Song Step 01` -> `Chain 01`).
- [x] Deduplicates unique interval shapes globally across all sets into Hypersynth chord banks `00`–`0F`.
- [x] If unique interval shapes exceed 16, logs a clear warning in the CRT terminal and clamps to the first 16 shapes.
- [x] Unit tests verify multi-chain arrangement, song step sequencing, and >16 chord shape overflow handling.
