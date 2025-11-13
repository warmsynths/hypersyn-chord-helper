/**
 * Note name to semitone mapping.
 * Used for converting note names (e.g., C, D#, Bb) to semitone offsets.
 */
const notes = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

/**
 * Returns the MIDI root note for a given root string (C, D#, etc.).
 *
 * @param {string} root - The root note name (e.g., "C", "D#", "Bb").
 * @returns {number} The MIDI note number for the root (C4=60).
 */
export const getMidiRoot = (root) => {
  const midiRootMap = {
    C: 60,
    "C#": 61,
    Db: 61,
    D: 62,
    "D#": 63,
    Eb: 63,
    E: 64,
    F: 65,
    "F#": 66,
    Gb: 66,
    G: 67,
    "G#": 68,
    Ab: 68,
    A: 69,
    "A#": 70,
    Bb: 70,
    B: 71,
  };
  return midiRootMap[root] || 60;
}

/**
 * Returns an array of valid voicing option objects for a given interval array.
 *
 * @param {number[]} intervals - The chord intervals.
 * @returns {Array<{value: string, label: string}>} Array of valid voicing options for the chord.
 */
export const getValidVoicings = (intervals) => {
  const n = Array.isArray(intervals) ? intervals.length : 0;
  const voicingOptions = [
    { value: "closed", label: "Closed Voicing", valid: true },
    { value: "open-triad", label: "Open Triad", valid: n === 3 },
    { value: "drop2", label: "Drop-2", valid: n >= 3 },
    { value: "drop3", label: "Drop-3", valid: n >= 4 },
    { value: "spread", label: "Spread", valid: n >= 2 },
    { value: "octave", label: "Octave Doubling", valid: n >= 2 },
    { value: "first-inversion", label: "First Inversion", valid: n >= 2 },
    { value: "second-inversion", label: "Second Inversion", valid: n >= 3 },
    { value: "third-inversion", label: "Third Inversion", valid: n >= 4 },
    { value: "shell-dominant", label: "Shell Dominant", valid: n >= 3 },
    { value: "altered-dominant", label: "Altered Dominant", valid: n >= 3 },
  ];
  return voicingOptions.filter((opt) => opt.valid);
}

/**
 * Transforms chord intervals according to the selected voicing.
/**
 * Returns an array of intervals transformed by the selected voicing.
 *
 * Applies voicing types like drop2, open-triad, spread, etc. to the chord intervals.
 *
 * @param {number[]} intervals - The chord intervals.
 * @param {string} voicing - The voicing type to apply.
 * @returns {number[]} The transformed intervals.
 */
export const applyVoicing = (intervals, voicing) => {
  // Defensive: create a sorted copy of intervals
  const sorted = Array.isArray(intervals) ? intervals.slice().sort((a, b) => a - b) : [];
  // Helper: is dominant 7th (major 3rd, minor 7th)
  function isDominant(intervals) {
    // Intervals: root=0, major 3rd=4, perfect 5th=7, minor 7th=10
    return intervals.includes(4) && intervals.includes(10);
  }
  switch (voicing) {
    case "drop2":
      if (sorted.length >= 2) {
        // Drop 2nd highest
        const idx = sorted.length - 2;
        sorted[idx] -= 12;
      }
      return sorted.slice().sort((a, b) => a - b);
    case "open-triad":
      // For triads, move the middle note up an octave
      if (sorted.length === 3) {
        const open = [sorted[0], sorted[2], sorted[1] + 12];
        return open.sort((a, b) => a - b);
      }
      return sorted;
    case "drop3":
      if (sorted.length >= 3) {
        // Drop 3rd highest
        const idx = sorted.length - 3;
        sorted[idx] -= 12;
      }
      return sorted.slice().sort((a, b) => a - b);
    case "spread":
      // Lift every other (2nd, 4th, ...)
      return sorted.map((v, i) => (i % 2 === 1 ? v + 12 : v));
    case "octave":
      // Double root and/or 5th for thickness
      const doubled = [...sorted];
      if (doubled.length > 0) doubled.push(doubled[0] + 12); // root
      if (doubled.length > 2) doubled.push(doubled[2] + 12); // 5th
      return doubled;
    case "first-inversion":
      // Move root up an octave
      if (sorted.length > 1) {
        const inv = [...sorted];
        inv[0] += 12;
        return inv
          .slice(1)
          .concat(inv[0])
          .sort((a, b) => a - b);
      }
      return sorted;
    case "second-inversion":
      // Move root and 3rd up an octave
      if (sorted.length > 2) {
        const inv = [...sorted];
        inv[0] += 12;
        inv[1] += 12;
        return inv
          .slice(2)
          .concat(inv[0], inv[1])
          .sort((a, b) => a - b);
      }
      return sorted;
    case "third-inversion":
      // Move root, 3rd, and 5th up an octave (for 7th chords)
      if (sorted.length > 3) {
        const inv = [...sorted];
        inv[0] += 12;
        inv[1] += 12;
        inv[2] += 12;
        return inv
          .slice(3)
          .concat(inv[0], inv[1], inv[2])
          .sort((a, b) => a - b);
      }
      return sorted;
    case "shell-dominant":
      // Only root, 3rd, 7th for dominant chords
      if (isDominant(sorted)) {
        return sorted.filter((v) => v === 0 || v === 4 || v === 10);
      }
      return sorted;
    case "altered-dominant":
      // Add b9, #9, b13, #11 to dominant chords
      if (isDominant(sorted)) {
        const base = sorted.filter((v) => v === 0 || v === 4 || v === 10);
        // b9=1, #9=5, #11=6, b13=8
        return base.concat([1, 5, 6, 8]).sort((a, b) => a - b);
      }
      return sorted;
    case "closed":
    default:
      return intervals;
  }
}

/**
 * Converts a semitone value to a 2-digit hexadecimal string (modulo 12).
/**
 * Converts a semitone value to a hex string (for debugging/visualization).
 *
 * @param {number} semitone - The semitone value.
 * @returns {string} The hex string.
 */
/**
 * Converts a semitone value to a 2-digit hexadecimal string (modulo 12).
 *
 * @param {number} semitone - The semitone value.
 * @returns {string} The hex string (00-0B).
 */
export const semitoneToHex = (semitone) => {
  if (typeof semitone !== "number" || isNaN(semitone)) return "--";
  const val = ((semitone % 12) + 12) % 12; // ensure positive mod
  return val.toString(16).toUpperCase().padStart(2, "0");
}

/**
 * Mapping of chord type strings to their corresponding intervals.
 * Used for chord name to hex conversion and interval calculation.
 *
 * @type {Object.<string, number[]>}
 */
const chordTypes = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  "+": [0, 4, 8],
  7: [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  6: [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  9: [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  11: [0, 4, 7, 10, 14, 17],
  13: [0, 4, 7, 10, 14, 21],
  add9: [0, 4, 7, 14],
  add11: [0, 4, 7, 10, 14],
  add13: [0, 4, 7, 10, 14, 21],
  sus: [0, 5, 7],
  5: [0, 7],
  madd9: [0, 3, 7, 14],
  maj6: [0, 4, 7, 9],
  min9: [0, 3, 7, 10, 14],
  min11: [0, 3, 7, 10, 14, 17],
  min13: [0, 3, 7, 10, 14, 21],
  "7alt": [0, 4, 7, 10, 13, 15, 18, 20], // altered dominant: 1, 3, 5, b7, b9, #9, b5, #5
  ø7: [0, 3, 6, 10], // half-diminished seventh
  m7b5: [0, 3, 6, 10], // alias for half-diminished seventh
  dim7: [0, 3, 6, 9], // fully diminished seventh
  "maj7#5": [0, 4, 8, 11], // major seventh sharp five
  mMaj7: [0, 3, 7, 11], // minor major seventh
  add2: [0, 2, 4, 7],
  add4: [0, 4, 5, 7],
  add6: [0, 4, 7, 9],
  "7b9": [0, 4, 7, 10, 13],
  "7#9": [0, 4, 7, 10, 15],
  "7b5": [0, 4, 6, 10],
  "7#5": [0, 4, 8, 10],
  "9b5": [0, 4, 6, 10, 14],
  "9#5": [0, 4, 8, 10, 14],
  "13b9": [0, 4, 7, 10, 13, 21],
  "13#9": [0, 4, 7, 10, 15, 21],
};

/**
 * Parses a chord name and returns its components and hex representations.
 *
 * @param {string} chordName - The chord name (e.g., "Cmaj7", "Dm", "G7").
 * @returns {object|null} An object with chordName, root, type, rootBaked, intervalOnlyHex, intervalOnly; or null if invalid.
 */
export const parseChordName = (chordName) => {
  const rootMatch = chordName.match(/^[A-G][b#]?/);
  if (!rootMatch) return null;
  const root = rootMatch[0];
  let type = chordName.slice(root.length) || "maj";
  // Handle half-diminished: ø7
  if (type === "ø7") {
    type = "ø7";
  } else {
    // Translate ø to dim for compatibility (for triads)
    type = type.replace("ø", "m7b5");
  }
  const intervals = chordTypes[type];
  if (!intervals) return null;
  const rootSemitone = notes[root];

  // Root-baked chord: add root semitone, wrap modulo 12
  const rootBaked = intervals.map((i) => semitoneToHex(i + rootSemitone));

  // Interval-only hex for display
  const intervalOnlyHex = intervals.map((i) => semitoneToHex(i));
  // Interval-only numbers for playback
  const intervalOnly = intervals.slice();

  return {
    chordName,
    root,
    type,
    rootBaked,
    intervalOnlyHex,
    intervalOnly,
  };
}

/**
 * Removes duplicate chords by their interval shape.
 *
 * @param {Array<object>} chords - Array of parsed chord objects.
 * @returns {Array<object>} Array of unique chord group objects.
 */
function getUniqueChordTypes(chords) {
  // Map: intervalKey -> { typeKey, chords: [], intervalOnlyHex: [] }
  const typeOrder = [];
  const typeMap = {};
  chords.forEach((chord, idx) => {
    const key = chord.intervalOnly.join("-");
    // Debug: show intervals and hex after voicing
    // console.log(
    //   `[Chord Debug] ${chord.chordName} (${chord.type}) intervals: [${chord.intervalOnly.join(", ")}] hex: [${chord.intervalOnlyHex.join(" ")}]`
    // );
    if (!typeMap[key]) {
      typeOrder.push(key);
      typeMap[key] = {
        typeKey: key,
        chords: [],
        intervalOnlyHex: chord.intervalOnlyHex.slice(),
      };
    }
    typeMap[key].chords.push(chord.chordName);
  });
  const result = typeOrder.map((key) => typeMap[key]);
  return result;
}

/**
 * Converts input chord names to hex and groups results by interval shape.
 *
 * Used for UI rendering and deduplication of chord types.
 *
 * @param {string} input - The input string containing chord names (space or comma separated).
 * @param {string} voicing - The voicing type to apply to each chord.
 * @returns {object} Structured result for UI rendering, including inputChordNames, uniqueGroups, voicing, and chords.
 */
export const convertChords = (input, voicing) => {
  const chordNames = input.split(/[\s,]+/).filter((s) => s.length > 0);
  // Parse and apply voicing to intervals for display
  const parsed = chordNames
    .map(parseChordName)
    .filter((c) => c !== null)
    .map((chord) => {
      // Apply voicing to intervals
      const intervals = applyVoicing(chord.intervalOnly, voicing);
      // Defensive: ensure intervals is array
      const safeIntervals = Array.isArray(intervals) ? intervals : [];
      return {
        ...chord,
        intervalOnly: safeIntervals,
        intervalOnlyHex: safeIntervals.map(semitoneToHex),
        rootBaked: safeIntervals.map((i) =>
          semitoneToHex(i + (notes[chord.root] || 0))
        ),
      };
    });

  // Defensive: filter out chords with undefined chordName
  const validParsed = parsed.filter((c) => typeof c.chordName === "string");
  let result =
    validParsed.length > 0
      ? validParsed.map((c) => c.chordName).join(" ") + "\n\n"
      : "No valid chords found.\n\n";

  // Group by interval shape (with voicing applied)
  const uniqueGroups = getUniqueChordTypes(validParsed);
  let details = uniqueGroups.map((group, idx) => {
    return {
      index: idx,
      chords: Array.isArray(group.chords) ? group.chords : [],
      interval: Array.isArray(group.intervalOnlyHex)
        ? group.intervalOnlyHex
        : [],
    };
  });

  // Return structured result for UI rendering
  return {
    inputChordNames: validParsed.map((c) => c.chordName),
    uniqueGroups: details,
    voicing,
    chords: validParsed,
  };
}
