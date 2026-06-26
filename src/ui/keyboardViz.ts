/**
 * Renders a piano keyboard SVG spanning 3 octaves (C3–B5, MIDI 48–83 + C6=84).
 * Highlights up to 4 active chord notes with accent colour and glow.
 * Black keys are rendered on top of white keys.
 *
 * @param {number[]} activeNotes - MIDI note numbers to highlight (max 4).
 * @returns {string} SVG markup string.
 */
export function renderKeyboardSVG(activeNotes: number[]): string {
  // 3 octaves: C3 (48) through C6 (84)
  const START_MIDI = 48;
  const END_MIDI   = 84;

  const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10]);

  const W_KEY_W = 13;
  const W_KEY_H = 50;
  const B_KEY_W = 8;
  const B_KEY_H = 30;
  // C3..C6 = 3 full octaves = 21 white keys + final C = 22 white keys
  const TOTAL_WHITE = 22;
  const SVG_W = TOTAL_WHITE * W_KEY_W;
  const SVG_H = W_KEY_H + 13;

  // Build midi → pixel-x maps
  let whiteCount = 0;
  const whiteX: Record<number, number> = {};
  const blackX: Record<number, number> = {};

  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const semitone = (midi - START_MIDI) % 12;
    if (!BLACK_OFFSETS.has(semitone)) {
      whiteX[midi] = whiteCount * W_KEY_W;
      whiteCount++;
    }
  }
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const semitone = (midi - START_MIDI) % 12;
    if (BLACK_OFFSETS.has(semitone)) {
      const prev = midi - 1;
      if (whiteX[prev] !== undefined) {
        blackX[midi] = whiteX[prev] + W_KEY_W - Math.floor(B_KEY_W / 2);
      }
    }
  }

  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const activeSet = new Set(activeNotes);

  // Unique glow filter id per render to avoid SVG id collisions
  const glowId = `kg${Math.random().toString(36).slice(2, 7)}`;

  const parts: string[] = [
    `<defs>` +
    `<filter id="${glowId}" x="-30%" y="-30%" width="160%" height="160%">` +
    `<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>` +
    `<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>` +
    `</filter></defs>`,
    `<svg class="chord-keyboard-svg" width="${SVG_W}" height="${SVG_H}" ` +
    `viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg">`,
  ];

  // White keys
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const semitone = (midi - START_MIDI) % 12;
    if (BLACK_OFFSETS.has(semitone)) continue;
    const x      = whiteX[midi];
    const active = activeSet.has(midi);
    parts.push(
      `<rect x="${x}" y="0" width="${W_KEY_W - 1}" height="${W_KEY_H}" rx="2" ` +
      `fill="${active ? 'var(--key-active)' : 'var(--key-white)'}" ` +
      `stroke="${active ? 'var(--accent-dim)' : '#1a3a4a'}" stroke-width="1" ` +
      `${active ? `filter="url(#${glowId})"` : ''}/>`
    );
    if (active) {
      parts.push(
        `<text x="${x + (W_KEY_W - 1) / 2}" y="${W_KEY_H + 10}" ` +
        `text-anchor="middle" font-size="7" font-family="'Share Tech Mono',monospace" ` +
        `fill="var(--accent)">${NOTE_NAMES[semitone]}</text>`
      );
    }
  }

  // Black keys (drawn on top)
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const semitone = (midi - START_MIDI) % 12;
    if (!BLACK_OFFSETS.has(semitone) || blackX[midi] === undefined) continue;
    const x      = blackX[midi];
    const active = activeSet.has(midi);
    parts.push(
      `<rect x="${x}" y="0" width="${B_KEY_W}" height="${B_KEY_H}" rx="1" ` +
      `fill="${active ? 'var(--key-active)' : 'var(--key-black)'}" ` +
      `stroke="${active ? 'var(--accent)' : '#0a1825'}" stroke-width="1" ` +
      `${active ? `filter="url(#${glowId})"` : ''}/>`
    );
    if (active) {
      parts.push(
        `<text x="${x + B_KEY_W / 2}" y="${B_KEY_H + 9}" ` +
        `text-anchor="middle" font-size="6" font-family="'Share Tech Mono',monospace" ` +
        `fill="var(--accent)">${NOTE_NAMES[semitone]}</text>`
      );
    }
  }

  parts.push('</svg>');
  // SVG open tag goes after defs in index 1 — join them all
  return parts[0] + parts.slice(1).join('');
}

/**
 * Builds all chord-tone MIDI notes across octaves that fit in the
 * keyboard range (C3–C6, MIDI 48–84), sorted ascending.
 *
 * @param {number[]} intervalOnly - Interval offsets from root (semitones).
 * @param {number}   midiRoot     - Root MIDI note (e.g. 60 for C4).
 * @returns {number[]} Sorted unique MIDI notes within the display range.
 */
export function buildAllChordNotes(intervalOnly: number[], midiRoot: number): number[] {
  const KB_LOW  = 48; // C3
  const KB_HIGH = 84; // C6
  const notes = new Set<number>();

  for (let oct = -24; oct <= 24; oct += 12) {
    for (const interval of intervalOnly) {
      const midi = midiRoot + interval + oct;
      if (midi >= KB_LOW && midi <= KB_HIGH) notes.add(midi);
    }
  }
  return Array.from(notes).sort((a, b) => a - b);
}

/**
 * Builds sliding 4-note windows from all available chord tones.
 * Each window represents a 4-note cluster the user can land on.
 *
 * @param {number[]} allNotes - Sorted MIDI notes across octaves.
 * @returns {number[][]}      - Array of 4-note windows.
 */
export function buildWindows(allNotes: number[]): number[][] {
  const WINDOW = 4;
  if (allNotes.length <= WINDOW) return [allNotes];
  const windows: number[][] = [];
  for (let i = 0; i <= allNotes.length - WINDOW; i++) {
    windows.push(allNotes.slice(i, i + WINDOW));
  }
  return windows;
}

/**
 * Derives a human-readable register label for a set of MIDI notes.
 * Shows the note names of the 4 highlighted keys.
 *
 * @param {number[]} notes - The 4 active MIDI notes.
 * @returns {string}
 */
export function windowLabel(notes: number[]): string {
  if (!notes || notes.length === 0) return '';
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return notes.map(n => NOTE_NAMES[n % 12]).join(' · ');
}

/**
 * Legacy no-op — kept so events.ts wiring doesn't error.
 */
export const updateKeyboardViz = (): void => {};
