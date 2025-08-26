/**
 * Mapping of chord type strings to their corresponding intervals.
 * Used for chord name to hex conversion and interval calculation.
 * @type {Object.<string, number[]>}
 */
const chordTypes = {
  "maj": [0, 4, 7],
  "min": [0, 3, 7],
  "m": [0, 3, 7],
  "dim": [0, 3, 6],
  "aug": [0, 4, 8],
  "+": [0, 4, 8],
  "7": [0, 4, 7, 10],
  "m7": [0, 3, 7, 10],
  "min7": [0, 3, 7, 10],
  "maj7": [0, 4, 7, 11],
  "M7": [0, 4, 7, 11],
  "sus2": [0, 2, 7],
  "sus4": [0, 5, 7],
  "6": [0, 4, 7, 9],
  "m6": [0, 3, 7, 9],
  "9": [0, 4, 7, 10, 14],
  "m9": [0, 3, 7, 10, 14],
  "maj9": [0, 4, 7, 11, 14],
  "11": [0, 4, 7, 10, 14, 17],
  "13": [0, 4, 7, 10, 14, 21],
  "add9": [0, 4, 7, 14],
  "add11": [0, 4, 7, 10, 14],
  "add13": [0, 4, 7, 10, 14, 21],
  "sus": [0, 5, 7],
  "5": [0, 7],
  "madd9": [0, 3, 7, 14],
  "maj6": [0, 4, 7, 9],
  "min9": [0, 3, 7, 10, 14],
  "min11": [0, 3, 7, 10, 14, 17],
  "min13": [0, 3, 7, 10, 14, 21],
  "7alt": [0, 4, 7, 10, 13, 15, 18, 20], // altered dominant: 1, 3, 5, b7, b9, #9, b5, #5
  "ø7": [0, 3, 6, 10], // half-diminished seventh
  "m7b5": [0, 3, 6, 10], // alias for half-diminished seventh
  "dim7": [0, 3, 6, 9], // fully diminished seventh
  "maj7#5": [0, 4, 8, 11], // major seventh sharp five
  "mMaj7": [0, 3, 7, 11], // minor major seventh
  "add2": [0, 2, 4, 7],
  "add4": [0, 4, 5, 7],
  "add6": [0, 4, 7, 9],
  "7b9": [0, 4, 7, 10, 13],
  "7#9": [0, 4, 7, 10, 15],
  "7b5": [0, 4, 6, 10],
  "7#5": [0, 4, 8, 10],
  "9b5": [0, 4, 6, 10, 14],
  "9#5": [0, 4, 8, 10, 14],
  "13b9": [0, 4, 7, 10, 13, 21],
  "13#9": [0, 4, 7, 10, 15, 21],
};

// --- Note → semitone mapping ---
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
 * Converts a semitone value to a 2-digit hexadecimal string (modulo 12).
 * @param {number} semitone - The semitone value to convert.
 * @returns {string} The hexadecimal representation (e.g., "00", "0C").
 */
function semitoneToHex(semitone) {
  let hex = (semitone % 12).toString(16).toUpperCase();
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Parses a chord name and returns its components and hex representations.
 * @param {string} chordName - The chord name (e.g., "Cmaj7", "Dm", "G7").
 * @returns {object|null} Object with chordName, root, type, rootBaked, intervalOnly; or null if invalid.
 */
function parseChordName(chordName) {
  const rootMatch = chordName.match(/^[A-G][b#]?/);
  if (!rootMatch) return null;
  const root = rootMatch[0];
  let type = chordName.slice(root.length) || "maj";
  // Handle half-diminished: ø7
  if (type === "ø7") {
    type = "ø7";
  } else {
    // Translate ø to dim for compatibility (for triads)
    type = type.replace("ø", "dim");
  }
  const intervals = chordTypes[type];
  if (!intervals) return null;
  const rootSemitone = notes[root];

  // Root-baked chord: add root semitone, wrap modulo 12
  const rootBaked = intervals.map((i) => semitoneToHex(i + rootSemitone));

  // Interval-only chord: just the intervals
  const intervalOnly = intervals.map((i) => semitoneToHex(i));

  return {
    chordName,
    root,
    type,
    rootBaked,
    intervalOnly,
  };
}

/**
 * Removes duplicate chords by their interval shape.
 * @param {Array<object>} chords - Array of parsed chord objects.
 * @returns {Array<object>} Array of unique chord objects.
 */
function getUniqueChordTypes(chords) {
  const seen = {};
  return chords.map((chord) => {
    const key = chord.intervalOnly.join("-");
    if (!seen[key]) seen[key] = chord;
    return chord;
  });
}

/**
 * Main function to convert input chord names to hex and display results.
 * Reads from #chordsInput, parses, deduplicates, and outputs hex.
 */
window.convertChords = function () {
  const input = document.getElementById("chordsInput").value;
  const chordNames = input.split(/[\s,]+/).filter((s) => s.length > 0);
  const parsed = chordNames.map(parseChordName).filter((c) => c !== null);
  const output = (parsed);

  let result = "";
  output.forEach((chord) => {
    result += `${chord.chordName} (${chord.type})\n`;
    result += `  Root-baked:    ${chord.rootBaked.join(" ")}\n`;
    result += `  Interval-only: ${chord.intervalOnly.join(" ")}\n\n`;
  });

  document.getElementById("output").textContent = result;
};
