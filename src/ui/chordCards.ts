import * as Midi from "@tonaljs/midi";
import { semitoneToHex, getMidiRoot } from "../core/chords";
import { playChordProgression } from "../core/core";
import { showToast } from "./toast";

// ─── Module state ────────────────────────────────────────────────────
let lastChordObjs: any[] = [];
let isIntervalOnly: boolean = true;

/** Base (root-position, "closed") MIDI notes per chord. */
let baseNotesByChord: number[][] = [];

/** Currently selected voicing index per chord (into VOICINGS). */
let voicingIdxByChord: number[] = [];

/** Note-diffs from the last voicing change per chord, for the expanded log view. */
let diffsByChord: Record<number, { label: string; oldHex: string; newHex: string }[]> = {};

/** Which chord row is currently expanded (only one at a time), or null. */
let expandedIdx: number | null = null;

// ─── Fixed voicing set ────────────────────────────────────────────────
// A small, common set of voicings applied as octave shifts over the
// chord's base note stack — no drag/window interaction, just ↑/↓ to cycle.
const VOICINGS: { label: string; fn: (notes: number[]) => number[] }[] = [
  { label: "ROOT", fn: (n) => n.slice() },
  { label: "INV 1", fn: (n) => n.map((v, i) => (i === 0 ? v + 12 : v)) },
  { label: "INV 2", fn: (n) => n.map((v, i) => (i <= 1 ? v + 12 : v)) },
  { label: "INV 3", fn: (n) => n.map((v, i) => (i <= 2 ? v + 12 : v)) },
  { label: "DROP 2", fn: (n) => n.map((v, i) => (i === n.length - 2 ? v - 12 : v)) },
  { label: "SPREAD", fn: (n) => n.map((v, i) => (i === 0 ? v - 12 : i === n.length - 1 ? v + 12 : v)) },
];

function hexForMidi(midi: number, midiRoot: number): { hex: string; tooltip: string } {
  if (isIntervalOnly) {
    const interval = midi - midiRoot;
    const hex = semitoneToHex(interval);
    return { hex, tooltip: `Interval ${interval} → ${hex}` };
  }
  const hex = midi.toString(16).toUpperCase().padStart(2, "0");
  return { hex, tooltip: `MIDI ${midi} → ${hex}` };
}

function renderHexBoxes(notes: number[], midiRoot: number): string {
  return notes
    .map((midi) => {
      const { hex, tooltip } = hexForMidi(midi, midiRoot);
      const noteName = Midi.midiToNoteName(midi);
      const classNames = isIntervalOnly ? "hex-box interval-mode" : "hex-box";
      return `<div class="hex-col"><span class="${classNames}" title="${tooltip}" data-copy="${hex}">${hex}</span><span class="hex-note-name">${noteName}</span></div>`;
    })
    .join("");
}

function currentNotesFor(idx: number): number[] {
  const base = baseNotesByChord[idx];
  if (!base) return [];
  const voicing = VOICINGS[voicingIdxByChord[idx] ?? 0] ?? VOICINGS[0];
  return voicing.fn(base);
}

/** Re-renders hex boxes + voicing chip + diff panel for one chord row. */
function renderRow(idx: number): void {
  const chord = lastChordObjs[idx];
  if (!chord) return;
  const notes = currentNotesFor(idx);

  const hexEl = document.getElementById("hexBoxes" + idx);
  if (hexEl) hexEl.innerHTML = renderHexBoxes(notes, chord.midiRoot ?? 60);

  const chipEl = document.getElementById("voicingChip" + idx);
  if (chipEl) {
    const label = VOICINGS[voicingIdxByChord[idx] ?? 0]?.label ?? "ROOT";
    chipEl.textContent = label;
  }

  const diffEl = document.getElementById("voicingDiffs" + idx);
  if (diffEl) {
    const diffs = diffsByChord[idx] ?? [];
    diffEl.innerHTML = diffs
      .map(
        (d) =>
          `<div class="voicing-diff-row"><span class="voicing-diff-old">~ ${d.label} <s>${d.oldHex}</s></span><span class="voicing-diff-arrow">-&gt;</span><span class="voicing-diff-new">${d.newHex}</span></div>`
      )
      .join("");
  }
}

/** Cycles the voicing for the expanded chord row, plays it, and records the diff. */
function cycleVoicing(idx: number, delta: number): void {
  const base = baseNotesByChord[idx];
  if (!base) return;
  const total = VOICINGS.length;
  const curIdx = voicingIdxByChord[idx] ?? 0;
  const nextIdx = ((curIdx + delta) % total + total) % total;

  const oldNotes = VOICINGS[curIdx].fn(base);
  const newNotes = VOICINGS[nextIdx].fn(base);

  const diffs: { label: string; oldHex: string; newHex: string }[] = [];
  const midiRoot = lastChordObjs[idx]?.midiRoot ?? 60;
  newNotes.forEach((midi, i) => {
    const old = oldNotes[i];
    if (old !== midi) {
      diffs.push({
        label: Midi.midiToNoteName(old),
        oldHex: hexForMidi(old, midiRoot).hex,
        newHex: hexForMidi(midi, midiRoot).hex,
      });
    }
  });

  voicingIdxByChord[idx] = nextIdx;
  diffsByChord[idx] = diffs;
  renderRow(idx);
  playChordProgression([newNotes]);
}

function setExpanded(idx: number | null): void {
  const prev = expandedIdx;
  expandedIdx = expandedIdx === idx ? null : idx;

  [prev, expandedIdx].forEach((i) => {
    if (i === null || i === undefined) return;
    const wrapper = document.getElementById("chord-row-wrapper" + i);
    const drawer = document.getElementById("voicing-drawer" + i);
    if (!wrapper || !drawer) return;
    const isOpen = expandedIdx === i;
    drawer.style.display = isOpen ? "block" : "none";
    wrapper.classList.toggle("expanded", isOpen);
    if (isOpen) wrapper.focus();
  });
}

export const toggleIntervalMode = (): void => {
  isIntervalOnly = !isIntervalOnly;

  const btn = document.getElementById("intervalToggleBtn");
  if (btn) {
    if (isIntervalOnly) {
      btn.classList.remove("btn-muted");
      btn.classList.add("btn-primary");
    } else {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-muted");
    }
  }

  lastChordObjs.forEach((_, i) => renderRow(i));
};

// ─── Public: convert chords → tracker rows ───────────────────────────

export const convertChordsUI = (
  convertChords: Function,
  _unused: Function,
  updateSingleChordDropdown: Function
): void => {
  const outputBox = document.getElementById("outputBox")!;
  const toggleBtn = document.getElementById("toggleOutputBoxBtn");

  outputBox.style.display = "block";
  if (toggleBtn) {
    toggleBtn.innerHTML = "CHORDS ▼";
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.classList.remove("dimmed");
  }

  const input = (document.getElementById("chordsInput") as HTMLInputElement).value;
  const chordNames = input.split(/[\s,]+/).filter((s) => s.length > 0);
  updateSingleChordDropdown(chordNames);

  const result = convertChords(input, "closed");

  if (!result.chords || result.chords.length === 0) {
    document.getElementById("output")!.innerHTML =
      `<div style="padding:16px;color:var(--text-dim);font-size:0.8rem;">NO VALID CHORDS FOUND</div>`;
    showToast("No valid chords found.", "error");
    const pbControls = document.getElementById("playbackControls");
    if (pbControls) pbControls.style.display = "none";
    const intContainer = document.getElementById("intervalToggleContainer");
    if (intContainer) intContainer.style.display = "none";
    return;
  }

  const pbControls = document.getElementById("playbackControls");
  if (pbControls) pbControls.style.display = "flex";

  const intContainer = document.getElementById("intervalToggleContainer");
  if (intContainer) intContainer.style.display = "flex";

  lastChordObjs = result.chords;
  voicingIdxByChord = result.chords.map(() => 0);
  diffsByChord = {};
  expandedIdx = null;
  baseNotesByChord = [];

  // Unique group → 2-digit hex label
  const chordNumMap: Record<string, string> = {};
  result.uniqueGroups.forEach((group: any, idx: number) => {
    group.chords.forEach((name: string) => {
      chordNumMap[name] = idx.toString(16).toUpperCase().padStart(2, "0");
    });
  });

  result.chords.forEach((chord: any) => {
    chord.midiRoot = getMidiRoot(chord.root);
    baseNotesByChord.push((chord.intervalOnly ?? []).map((iv: number) => chord.midiRoot + iv));
  });

  // Build HTML
  let html = '<div id="chord-list">';

  result.chords.forEach((chord: any, i: number) => {
    const chordNum = chordNumMap[chord.chordName] ?? i.toString(16).toUpperCase().padStart(2, "0");
    const notes = currentNotesFor(i);
    const hexBoxes = renderHexBoxes(notes, chord.midiRoot ?? 60);

    html += `
      <div class="chord-row-wrapper" id="chord-row-wrapper${i}" data-chord-idx="${i}" tabindex="0">
        <div class="chord-row" id="chord-row-${i}">
          <div class="chord-meta">
            <span class="chord-label">CHORD ${chordNum}</span>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="chord-name-display">${chord.root}${chord.type}</span>
              <span class="voicing-chip" id="voicingChip${i}">ROOT</span>
              <button class="chord-play-btn" data-chord-idx="${i}" title="Play Chord">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            </div>
          </div>
          <div class="hex-boxes" id="hexBoxes${i}">${hexBoxes}</div>
        </div>

        <div class="voicing-drawer" id="voicing-drawer${i}" style="display:none;">
          <div class="voicing-hint">
            <span class="voicing-hint-text">&#8593;/&#8595; cycle voicing · plays on change</span>
            <span class="voicing-nudge-btns">
              <button class="voicing-nudge-btn" data-chord-idx="${i}" data-dir="1" title="Previous voicing">&#9650;</button>
              <button class="voicing-nudge-btn" data-chord-idx="${i}" data-dir="-1" title="Next voicing">&#9660;</button>
            </span>
          </div>
          <div class="voicing-diffs" id="voicingDiffs${i}"></div>
        </div>
      </div>`;
  });

  html += "</div>";
  document.getElementById("output")!.innerHTML = html;

  // Delegated clicks and keydowns
  const listEl = document.getElementById("chord-list");
  if (listEl) {
    listEl.addEventListener("click", (e: MouseEvent) => {
      const t = e.target as HTMLElement;

      // Play chord button
      const playBtn = t.closest(".chord-play-btn") as HTMLElement;
      if (playBtn) {
        const idxStr = playBtn.dataset.chordIdx;
        if (idxStr) {
          playChordProgression([currentNotesFor(parseInt(idxStr, 10))]);
        }
        return;
      }

      // Voicing nudge buttons (touch-friendly equivalent of ↑/↓)
      const nudgeBtn = t.closest(".voicing-nudge-btn") as HTMLElement;
      if (nudgeBtn) {
        const idxStr = nudgeBtn.dataset.chordIdx;
        const dir = nudgeBtn.dataset.dir;
        if (idxStr && dir) {
          cycleVoicing(parseInt(idxStr, 10), parseInt(dir, 10));
        }
        return;
      }

      if (t.classList.contains("hex-box") && t.dataset.copy) {
        navigator.clipboard?.writeText(t.dataset.copy)
          .then(() => showToast(`Copied ${t.dataset.copy}`, "info"))
          .catch(() => {});
        return;
      }

      // Click a row (outside the play button / hex box) → expand/collapse it
      const wrapper = t.closest(".chord-row-wrapper") as HTMLElement;
      if (wrapper) {
        const idxStr = wrapper.dataset.chordIdx;
        if (idxStr) setExpanded(parseInt(idxStr, 10));
      }
    });

    listEl.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      const wrapper = (e.target as HTMLElement).closest(".chord-row-wrapper") as HTMLElement;
      if (!wrapper) return;
      const idxStr = wrapper.dataset.chordIdx;
      if (idxStr === undefined || parseInt(idxStr, 10) !== expandedIdx) return;
      e.preventDefault();
      cycleVoicing(parseInt(idxStr, 10), e.key === "ArrowUp" ? 1 : -1);
    });
  }
};

export const getCurrentProgressionNotes = (): number[][] => {
  return lastChordObjs.map((_, idx) => currentNotesFor(idx));
};

export const getOutputModeLabel = (): string => (isIntervalOnly ? "INTERVALS" : "NOTES");
export const getOutputModeHint = (): string =>
  isIntervalOnly ? "(offsets from root — set root on device)" : "(literal note values)";
export const isOutputIntervalOnly = (): boolean => isIntervalOnly;
