// --- Chord type → interval mapping ---
const chordTypes = {
  maj: [0, 4, 7],
  maj7: [0, 4, 7, 11],
  m: [0, 3, 7],
  m7: [0, 3, 7, 10],
  m9: [0, 3, 7, 10, 14],
  7: [0, 4, 7, 10],
  13: [0, 4, 7, 10, 14, 21],
  ø7: [0, 3, 6, 10],
  "7alt": [0, 4, 7, 10, 13, 15, 18, 20],
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

// --- Convert semitone to 2-digit hex (mod 12 for Hypersyn) ---
function semitoneToHex(semitone) {
  let hex = (semitone % 12).toString(16).toUpperCase();
  return hex.length === 1 ? "0" + hex : hex;
}

// --- Parse chord name ---
function parseChordName(chordName) {
  const rootMatch = chordName.match(/^[A-G][b#]?/);
  if (!rootMatch) return null;
  const root = rootMatch[0];
  const type = chordName.slice(root.length) || "maj";
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

// --- Remove duplicates by interval shape ---
function getUniqueChordTypes(chords) {
  const seen = {};
  return chords.map((chord) => {
    const key = chord.intervalOnly.join("-");
    if (!seen[key]) seen[key] = chord;
    return chord;
  });
}

// --- Main function ---
window.convertChords = function () {
  const input = document.getElementById("chordsInput").value;
  const chordNames = input.split(/[\s,]+/).filter((s) => s.length > 0);
  const parsed = chordNames.map(parseChordName).filter((c) => c !== null);
  const output = getUniqueChordTypes(parsed);

  let result = "";
  output.forEach((chord) => {
    result += `${chord.chordName} (${chord.type})\n`;
    result += `  Root-baked:    ${chord.rootBaked.join(" ")}\n`;
    result += `  Interval-only: ${chord.intervalOnly.join(" ")}\n\n`;
  });

  document.getElementById("output").textContent = result;
};
