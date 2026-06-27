import * as Midi from "@tonaljs/midi";
import {
  getMidiRoot,
  semitoneToHex,
} from "../core/chords";
import { playChordProgression } from "../core/core";
import { showToast } from "./toast";
import {
  renderKeyboardSVG,
  buildAllChordNotes,
  buildWindows,
} from "./keyboardViz";

// ─── Module state ────────────────────────────────────────────────────
let lastChordObjs: any[] = [];
let isIntervalOnly: boolean = false;

/**
 * Per-chord: which window (4-note slice) is currently shown.
 * Index 0 = lowest available notes, max = highest.
 */
let chordWindowIndices: number[] = [];

/**
 * Per-chord: pre-built list of 4-note windows for quick lookup.
 */
let chordWindows: number[][][] = [];

// ─── Horizontal-drag / scroll interaction ────────────────────────────

/** Pixels of horizontal drag to advance one window step */
const DRAG_PX = 18;

/**
 * Attaches horizontal pointer-drag and scroll-wheel handlers to a keyboard
 * wrapper. Moving right → higher notes; moving left → lower notes.
 *
 * @param wrap       - The `.chord-keyboard-wrap` element.
 * @param idx        - Chord row index.
 * @param numWindows - Total available 4-note windows for this chord.
 */
function attachHorizontalDrag(wrap: HTMLElement, idx: number, numWindows: number): void {
  let startX   = 0;
  let startWin = 0;
  let active   = false;

  wrap.addEventListener('pointerdown', (e: PointerEvent) => {
    startX   = e.clientX;
    startWin = chordWindowIndices[idx] ?? 0;
    active   = true;
    wrap.classList.add('dragging');
    wrap.setPointerCapture(e.pointerId);
  });

  wrap.addEventListener('pointermove', (e: PointerEvent) => {
    if (!active) return;
    const delta = e.clientX - startX;
    const steps = Math.round(delta / DRAG_PX);
    const next  = clamp(startWin + steps, 0, numWindows - 1);
    if (next !== (chordWindowIndices[idx] ?? 0)) {
      chordWindowIndices[idx] = next;
      _applyWindow(idx, next);
    }
  });

  const end = () => { active = false; wrap.classList.remove('dragging'); };
  wrap.addEventListener('pointerup',     end);
  wrap.addEventListener('pointercancel', end);

  // Scroll wheel: left/right or up/down both work
  wrap.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    // deltaX for trackpad horizontal scroll, deltaY as fallback
    const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const dir  = raw > 0 ? 1 : -1;
    const cur  = chordWindowIndices[idx] ?? 0;
    const next = clamp(cur + dir, 0, numWindows - 1);
    if (next !== cur) {
      chordWindowIndices[idx] = next;
      _applyWindow(idx, next);
    }
  }, { passive: false });
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Renders the keyboard and hex boxes for a given window index.
 */
function _applyWindow(idx: number, windowIdx: number): void {
  const chordObj = lastChordObjs[idx];
  if (!chordObj) return;
  const windows = chordWindows[idx] ?? [];
  const notes   = windows[windowIdx] ?? windows[0] ?? [];

  // Update keyboard SVG
  const kbdDiv = document.getElementById('chordKeyboardViz' + idx);
  if (kbdDiv) kbdDiv.innerHTML = renderKeyboardSVG(notes);


  // Update hex boxes
  const hexEl = document.getElementById('hexBoxes' + idx);
  if (hexEl) {
    hexEl.innerHTML = notes
      .map((midi, j) => {
        let hex = "";
        let tooltip = "";
        
        if (isIntervalOnly) {
          const interval = midi - (chordObj.midiRoot ?? 60);
          hex = semitoneToHex(interval);
          tooltip = `Interval ${interval} → ${hex}`;
        } else {
          hex = midi.toString(16).toUpperCase().padStart(2, '0');
          tooltip = `MIDI ${midi} → ${hex}`;
        }
        
        const noteName = Midi.midiToNoteName(midi);
        const classNames = isIntervalOnly ? 'hex-box interval-mode' : 'hex-box';
        
        return `<div class="hex-col"><span class="${classNames}" title="${tooltip}" data-copy="${hex}">${hex}</span><span class="hex-note-name">${noteName}</span></div>`;
      })
      .join('');
  }
}

export const toggleIntervalMode = (): void => {
  isIntervalOnly = !isIntervalOnly;
  
  // Update button visual state
  const btn = document.getElementById('intervalToggleBtn');
  if (btn) {
    if (isIntervalOnly) {
      btn.classList.remove('btn-muted');
      btn.classList.add('btn-primary');
    } else {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-muted');
    }
  }

  // Re-render all current windows
  lastChordObjs.forEach((_, i) => _applyWindow(i, chordWindowIndices[i] ?? 0));
};

// ─── Public: convert chords → tracker rows ───────────────────────────

export const convertChordsUI = (
  convertChords: Function,
  _unused: Function,
  updateSingleChordDropdown: Function
): void => {
  const outputBox = document.getElementById('outputBox')!;
  const toggleBtn = document.getElementById('toggleOutputBoxBtn');

  outputBox.style.display = 'block';
  if (toggleBtn) {
    toggleBtn.innerHTML = 'CHORDS ▼';
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.classList.remove('dimmed');
  }

  const input      = (document.getElementById('chordsInput') as HTMLInputElement).value;
  const chordNames = input.split(/[\s,]+/).filter(s => s.length > 0);
  updateSingleChordDropdown(chordNames);

  const result = convertChords(input, 'closed');

  if (!result.chords || result.chords.length === 0) {
    document.getElementById('output')!.innerHTML =
      `<div style="padding:16px;color:var(--text-dim);font-size:0.8rem;">NO VALID CHORDS FOUND</div>`;
    showToast('No valid chords found.', 'error');
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

  lastChordObjs      = result.chords;
  chordWindowIndices = result.chords.map(() => 0);
  chordWindows       = [];

  // Unique group → 2-digit hex label
  const chordNumMap: Record<string, string> = {};
  result.uniqueGroups.forEach((group: any, idx: number) => {
    group.chords.forEach((name: string) => {
      chordNumMap[name] = idx.toString(16).toUpperCase().padStart(2, '0');
    });
  });

  // Pre-compute windows for every chord
  result.chords.forEach((chord: any) => {
    chord.midiRoot = getMidiRoot(chord.root);
    const allNotes = buildAllChordNotes(chord.intervalOnly, chord.midiRoot);
    chordWindows.push(buildWindows(allNotes));
  });

  // Build HTML
  let html = '<div id="chord-list">';

  result.chords.forEach((chord: any, i: number) => {
    const chordNum  = chordNumMap[chord.chordName] ?? i.toString(16).toUpperCase().padStart(2, '0');
    const initNotes = chordWindows[i]?.[0] ?? [];

    // Initial 4 hex boxes
    const hexBoxes = initNotes
      .map(midi => {
        let hex = "";
        let tooltip = "";
        
        if (isIntervalOnly) {
          const interval = midi - (chord.midiRoot ?? 60);
          hex = semitoneToHex(interval);
          tooltip = `Interval ${interval} → ${hex}`;
        } else {
          hex = midi.toString(16).toUpperCase().padStart(2, '0');
          tooltip = `MIDI ${midi} → ${hex}`;
        }
        
        const noteName = Midi.midiToNoteName(midi);
        const classNames = isIntervalOnly ? 'hex-box interval-mode' : 'hex-box';
        return `<div class="hex-col"><span class="${classNames}" title="${tooltip}" data-copy="${hex}">${hex}</span><span class="hex-note-name">${noteName}</span></div>`;
      })
      .join('');

    html += `
      <div class="chord-row" id="chord-row-${i}">
        <div class="chord-meta">
          <span class="chord-label">CHORD ${chordNum}</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="chord-name-display">[${chord.root}${chord.type}]</span>
            <button class="btn btn-muted chord-play-btn" data-chord-idx="${i}" title="Play Chord" style="padding:3px 6px; height:20px; display:flex; align-items:center; justify-content:center;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
          </div>
        </div>
        <div class="chord-keyboard-wrap" id="kbdWrap${i}" data-chord-idx="${i}"
             title="Drag left/right to move through voicing positions">
          <div id="chordKeyboardViz${i}"></div>
        </div>
        <div class="hex-boxes" id="hexBoxes${i}">${hexBoxes}</div>
      </div>`;
  });

  html += '</div>';
  document.getElementById('output')!.innerHTML = html;

  // Render keyboards and attach drag handlers
  result.chords.forEach((_: any, i: number) => {
    _applyWindow(i, 0);
    const wrap = document.getElementById(`kbdWrap${i}`) as HTMLElement;
    if (wrap) {
      attachHorizontalDrag(wrap, i, chordWindows[i]?.length ?? 1);
    }
  });

  // Delegated clicks for play and hex copy
  document.getElementById('chord-list')?.addEventListener('click', (e: MouseEvent) => {
    const t = e.target as HTMLElement;

    // Play chord button
    const playBtn = t.closest('.chord-play-btn') as HTMLElement;
    if (playBtn) {
      const idxStr = playBtn.dataset.chordIdx;
      if (idxStr) {
        const idx = parseInt(idxStr, 10);
        const windowIdx = chordWindowIndices[idx] ?? 0;
        const windows = chordWindows[idx] ?? [];
        const notes = windows[windowIdx] ?? windows[0] ?? [];
        playChordProgression([notes]);
      }
      return;
    }

    if (t.classList.contains('hex-box') && t.dataset.copy) {
      navigator.clipboard?.writeText(t.dataset.copy)
        .then(() => showToast(`Copied ${t.dataset.copy}`, 'info'))
        .catch(() => {});
    }
  });
};

// ─── Legacy exports (still wired in events.ts) ───────────────────────

export const updateChordKeyboardViz = (idx: number, _voicing: string, chordObj: any): void => {
  // Re-render using the current window for this chord
  const windowIdx = chordWindowIndices[idx] ?? 0;
  const windows   = chordWindows[idx];
  if (windows) {
    _applyWindow(idx, windowIdx);
  } else {
    // Fallback: just render root-position notes
    const midi = chordObj?.midiRoot ?? 60;
    const notes = (chordObj?.intervalOnly ?? []).map((v: number) => midi + v);
    const kbdDiv = document.getElementById('chordKeyboardViz' + idx);
    if (kbdDiv) kbdDiv.innerHTML = renderKeyboardSVG(notes.slice(0, 4));
  }
};

export const updateChordVoicing = (idx: number, _voicing: string, _label?: string): void => {
  // In the new model voicing is driven by window position, not a type string.
  // Calling this re-renders the current window.
  const windowIdx = chordWindowIndices[idx] ?? 0;
  _applyWindow(idx, windowIdx);
};

export const getCurrentProgressionNotes = (): number[][] => {
  return lastChordObjs.map((_, idx) => {
    const windowIdx = chordWindowIndices[idx] ?? 0;
    const windows = chordWindows[idx] ?? [];
    return windows[windowIdx] ?? windows[0] ?? [];
  });
};
