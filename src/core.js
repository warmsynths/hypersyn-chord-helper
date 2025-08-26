/**
 * Stops all currently playing oscillators and disconnects gains.
 */
window.stopChordProgression = function() {
  if (window._activeOscillators && window._activeOscillators.length) {
    window._activeOscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
    window._activeOscillators = [];
  }
  if (window._activeGains && window._activeGains.length) {
    window._activeGains.forEach(gain => { try { gain.disconnect(); } catch(e) {} });
    window._activeGains = [];
  }
};

/**
 * Plays the input chord progression as block chords using the Web Audio API.
 * Each chord is played for 2.5 seconds, all notes together (like a soft synth pad).
 */
window.playChordProgression = function() {
  const input = document.getElementById("chordsInput").value;
  const chordNames = input.split(/\s|,/).filter(s => s.length > 0);
  const parsed = chordNames.map(window.parseChordName).filter(c => c !== null);
  if (parsed.length === 0) return;

  // MIDI note numbers for C4 = 60
  const ROOTS = {
    'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63, 'E': 64, 'F': 65,
    'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68, 'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
  };

  // Web Audio setup
  const ctx = window._hypersynAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
  window._hypersynAudioCtx = ctx;

  let time = ctx.currentTime;
  const chordDuration = 2.5; // slower pad, longer chords

  window.stopChordProgression(); // Stop any previous notes
  const volume = parseInt(document.getElementById('volumeSlider').value, 10) / 100;
  window._activeOscillators = [];
  window._activeGains = [];
  parsed.forEach((chord) => {
    // Get root MIDI number
    let rootMidi = ROOTS[chord.root] || 60;
    if (!isFinite(rootMidi)) rootMidi = 60;
    // Get intervals (semitones from root)
    let intervals = Array.isArray(chord.intervalOnly)
      ? chord.intervalOnly.filter(x => typeof x === 'number' && isFinite(x))
      : [];
    if (intervals.length === 0) {
      console.warn('No intervals for chord:', chord.chordName, chord);
    }
    // Play all notes as block chord, skip non-numeric intervals
    intervals.forEach((semi) => {
      let midi = rootMidi + semi;
      if (!isFinite(midi)) return;
      let freq = 440 * Math.pow(2, (midi - 69) / 12);
      if (!isFinite(freq)) return;
      let osc = ctx.createOscillator();
      let gain = ctx.createGain();
      let filter = ctx.createBiquadFilter();
      osc.type = 'triangle'; // synth pad
      osc.frequency.value = freq;
      osc.detune.value = Math.random() * 10 - 5; // slight detune for warmth
      filter.type = 'lowpass';
      filter.frequency.value = 220; // much darker pad
      filter.Q.value = 1.4; // more resonance for warmth
      // Envelope: slower attack/release
      const attack = 1.0;
      const release = 1.2;
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(volume, time + attack);
      gain.gain.setValueAtTime(volume, time + chordDuration - release);
      gain.gain.linearRampToValueAtTime(0.0, time + chordDuration);
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + chordDuration);
      window._activeOscillators.push(osc);
      window._activeGains.push(gain);
      // For debugging:
      // console.log(`Playing: ${chord.chordName} root=${rootMidi} semi=${semi} midi=${midi} freq=${freq} vol=${volume}`);
    });
    time += chordDuration;
  });
};
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
 * @param {Array<object>} chords - Array of parsed chord objects.
 * @returns {Array<object>} Array of unique chord objects.
 */
function getUniqueChordTypes(chords) {
  // Map: intervalKey -> { typeKey, chords: [], intervalOnlyHex: [] }
  const typeOrder = [];
  const typeMap = {};
  chords.forEach((chord, idx) => {
    const key = chord.intervalOnly.join("-");
    console.log(`[getUniqueChordTypes] Chord ${idx}: ${chord.chordName}, intervalKey: ${key}`);
    if (!typeMap[key]) {
      typeOrder.push(key);
      typeMap[key] = {
        typeKey: key,
        chords: [],
        intervalOnlyHex: chord.intervalOnlyHex.slice(),
      };
      console.log(`[getUniqueChordTypes] New group for intervalKey: ${key}`);
    }
    typeMap[key].chords.push(chord.chordName);
    console.log(`[getUniqueChordTypes] Added chord '${chord.chordName}' to group '${key}'. Current chords:`, typeMap[key].chords);
  });
  const result = typeOrder.map((key) => typeMap[key]);
  console.log('[getUniqueChordTypes] Final groups:', result);
  return result;
}

/**
 * Main function to convert input chord names to hex and display results.
 * Reads from #chordsInput, parses, deduplicates, and outputs hex.
 */
window.convertChords = function () {
  const input = document.getElementById("chordsInput").value;
  const chordNames = input.split(/[\s,]+/).filter((s) => s.length > 0);
  const parsed = chordNames.map(parseChordName).filter((c) => c !== null);

  // Show input progression
  let result = parsed.map(c => c.chordName).join(" ") + "\n\n";

  // Group by interval shape
  const uniqueGroups = getUniqueChordTypes(parsed);
  uniqueGroups.forEach((group, idx) => {
    result += `Chord ${idx.toString().padStart(2, "0")}\n`;
    result += `Chords: ${group.chords.join(", ")}\n`;
    result += `Interval: ${group.intervalOnlyHex.join(" ")}\n\n`;
  });

  document.getElementById("output").textContent = result;
};
