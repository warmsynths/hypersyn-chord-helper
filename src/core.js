/**
 * Transforms chord intervals according to the selected voicing.
 * @param {number[]} intervals - Array of intervals (semitones from root).
 * @param {string} voicing - Voicing type: 'closed', 'drop2', 'drop3', 'spread', 'octave'.
 * @returns {number[]} Transformed intervals.
 */
function applyVoicing(intervals, voicing) {
  if (!Array.isArray(intervals)) return intervals;
  const sorted = [...intervals].sort((a, b) => a - b);
  // Helper: is dominant 7th (major 3rd, minor 7th)
  function isDominant(intervals) {
    // Intervals: root=0, major 3rd=4, perfect 5th=7, minor 7th=10
    return intervals.includes(4) && intervals.includes(10);
  }
  switch (voicing) {
    case 'drop2':
      if (sorted.length >= 2) {
        // Drop 2nd highest
        const idx = sorted.length - 2;
        sorted[idx] -= 12;
      }
      return sorted.slice().sort((a, b) => a - b);
    case 'drop3':
      if (sorted.length >= 3) {
        // Drop 3rd highest
        const idx = sorted.length - 3;
        sorted[idx] -= 12;
      }
      return sorted.slice().sort((a, b) => a - b);
    case 'spread':
      // Lift every other (2nd, 4th, ...)
      return sorted.map((v, i) => (i % 2 === 1 ? v + 12 : v));
    case 'octave':
      // Double root and/or 5th for thickness
      const doubled = [...sorted];
      if (doubled.length > 0) doubled.push(doubled[0] + 12); // root
      if (doubled.length > 2) doubled.push(doubled[2] + 12); // 5th
      return doubled;
    case 'first-inversion':
      // Move root up an octave
      if (sorted.length > 1) {
        const inv = [...sorted];
        inv[0] += 12;
        return inv.slice(1).concat(inv[0]).sort((a, b) => a - b);
      }
      return sorted;
    case 'second-inversion':
      // Move root and 3rd up an octave
      if (sorted.length > 2) {
        const inv = [...sorted];
        inv[0] += 12;
        inv[1] += 12;
        return inv.slice(2).concat(inv[0], inv[1]).sort((a, b) => a - b);
      }
      return sorted;
    case 'third-inversion':
      // Move root, 3rd, and 5th up an octave (for 7th chords)
      if (sorted.length > 3) {
        const inv = [...sorted];
        inv[0] += 12;
        inv[1] += 12;
        inv[2] += 12;
        return inv.slice(3).concat(inv[0], inv[1], inv[2]).sort((a, b) => a - b);
      }
      return sorted;
    case 'shell-dominant':
      // Only root, 3rd, 7th for dominant chords
      if (isDominant(sorted)) {
        return sorted.filter((v) => v === 0 || v === 4 || v === 10);
      }
      return sorted;
    case 'altered-dominant':
      // Add b9, #9, b13, #11 to dominant chords
      if (isDominant(sorted)) {
        const base = sorted.filter((v) => v === 0 || v === 4 || v === 10);
        // b9=1, #9=5, #11=6, b13=8
        return base.concat([1, 5, 6, 8]).sort((a, b) => a - b);
      }
      return sorted;
    case 'closed':
    default:
      return intervals;
  }
}
/**
 * Stops all currently playing oscillators and disconnects gain nodes.
 * @function
 */
window.stopChordProgression = function () {
  if (window._activeOscillators && window._activeOscillators.length) {
    window._activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    window._activeOscillators = [];
  }
  if (window._activeGains && window._activeGains.length) {
    window._activeGains.forEach((gain) => {
      try {
        gain.disconnect();
      } catch (e) {}
    });
    window._activeGains = [];
  }
};

/**
 * Plays the input chord progression as block chords using the Web Audio API.
 * Each chord is played for 2.5 seconds as a synth pad.
 * @function
 */
window.playChordProgression = function () {
  const input = document.getElementById("chordsInput").value;
  const chordNames = input.split(/\s|,/).filter((s) => s.length > 0);
  const parsed = chordNames
    .map(window.parseChordName)
    .filter((c) => c !== null);
  if (parsed.length === 0) return;

  // MIDI note numbers for C4 = 60
    // MIDI note numbers for C3 = 48 (one octave lower)
    const ROOTS = {
      C: 48,
      "C#": 49,
      Db: 49,
      D: 50,
      "D#": 51,
      Eb: 51,
      E: 52,
      F: 53,
      "F#": 54,
      Gb: 54,
      G: 55,
      "G#": 56,
      Ab: 56,
      A: 57,
      "A#": 58,
      Bb: 58,
      B: 59,
    };

  // Web Audio setup
  const ctx =
    window._hypersynAudioCtx ||
    new (window.AudioContext || window.webkitAudioContext)();
  window._hypersynAudioCtx = ctx;

  // --- Simple Reverb Setup ---
  if (!window._hypersynReverb) {
    // Create impulse response for reverb (simple exponential decay)
    const length = ctx.sampleRate * 2.5; // 2.5s reverb tail
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const channel = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    window._hypersynReverb = convolver;
  }
  const reverb = window._hypersynReverb;

  let time = ctx.currentTime;
  const chordDuration = 2.5; // slower pad, longer chords

  window.stopChordProgression(); // Stop any previous notes
  const volume =
    parseInt(document.getElementById("volumeSlider").value, 10) / 100;
  window._activeOscillators = [];
  window._activeGains = [];
  // Get voicing from UI (default to 'closed')
  const voicing = window.getSelectedVoicing ? window.getSelectedVoicing() : 'closed';
  parsed.forEach((chord) => {
    let rootMidi = ROOTS[chord.root] || 60;
    if (!isFinite(rootMidi)) rootMidi = 60;
    let intervals = Array.isArray(chord.intervalOnly)
      ? chord.intervalOnly.filter((x) => typeof x === "number" && isFinite(x))
      : [];
    intervals = applyVoicing(intervals, voicing);
    if (intervals.length === 0) {
      console.warn("No intervals for chord:", chord.chordName, chord);
    }
    intervals.forEach((semi) => {
      let midi = rootMidi + semi;
      if (!isFinite(midi)) return;
      let freq = 440 * Math.pow(2, (midi - 69) / 12);
      if (!isFinite(freq)) return;
      let osc = ctx.createOscillator();
      let gain = ctx.createGain();
      let filter = ctx.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.detune.value = Math.random() * 10 - 5;
      filter.type = "lowpass";
      filter.frequency.value = 220;
      filter.Q.value = 1.4;
      const attack = 1.0;
      const release = 1.2;
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(volume, time + attack);
      gain.gain.setValueAtTime(volume, time + chordDuration - release);
      gain.gain.linearRampToValueAtTime(0.0, time + chordDuration);
      osc.connect(filter).connect(gain).connect(reverb).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + chordDuration);
      window._activeOscillators.push(osc);
      window._activeGains.push(gain);
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
  let hex = semitone.toString(16).toUpperCase();
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Parses a chord name and returns its components and hex representations.
 * @param {string} chordName - The chord name (e.g., "Cmaj7", "Dm", "G7").
 * @returns {object|null} Object with chordName, root, type, rootBaked, intervalOnlyHex, intervalOnly; or null if invalid.
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
    console.log(`[Chord Debug] ${chord.chordName} (${chord.type}) intervals: [${chord.intervalOnly.join(", ")}] hex: [${chord.intervalOnlyHex.join(" ")}]`);
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
 * Converts input chord names to hex and displays results in the output element.
 * Reads from #chordsInput, parses, deduplicates, and outputs hex.
 * @function
 */
window.convertChords = function(input, voicing) {
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
        rootBaked: safeIntervals.map((i) => semitoneToHex(i + (notes[chord.root] || 0)))
      };
    });

  // Defensive: filter out chords with undefined chordName
  const validParsed = parsed.filter((c) => typeof c.chordName === 'string');
  let result = validParsed.length > 0 ? validParsed.map((c) => c.chordName).join(" ") + "\n\n" : "No valid chords found.\n\n";

  // Group by interval shape (with voicing applied)
  const uniqueGroups = getUniqueChordTypes(validParsed);
  let details = uniqueGroups.map((group, idx) => {
    return {
      index: idx,
      chords: Array.isArray(group.chords) ? group.chords : [],
      interval: Array.isArray(group.intervalOnlyHex) ? group.intervalOnlyHex : []
    };
  });

  // Return structured result for UI rendering
  return {
    inputChordNames: validParsed.map((c) => c.chordName),
    uniqueGroups: details,
    voicing,
    chords: validParsed
  };
};
/**
 * Plays a single chord object (from parseChordName) as a block chord using the Web Audio API.
 * @param {object} chord - Parsed chord object from parseChordName.
 * @function
 */
window.playSingleChordGlobal = function (chord) {
  if (!chord || !Array.isArray(chord.intervalOnly)) return;
  // MIDI note numbers for C4 = 60
    // MIDI note numbers for C3 = 48 (one octave lower)
    const ROOTS = {
      C: 48,
      "C#": 49,
      Db: 49,
      D: 50,
      "D#": 51,
      Eb: 51,
      E: 52,
      F: 53,
      "F#": 54,
      Gb: 54,
      G: 55,
      "G#": 56,
      Ab: 56,
      A: 57,
      "A#": 58,
      Bb: 58,
      B: 59,
    };
  const ctx =
    window._hypersynAudioCtx ||
    new (window.AudioContext || window.webkitAudioContext)();
  window._hypersynAudioCtx = ctx;
  // --- Simple Reverb Setup ---
  if (!window._hypersynReverb) {
    const length = ctx.sampleRate * 2.5;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const channel = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    window._hypersynReverb = convolver;
  }
  const reverb = window._hypersynReverb;
  window.stopChordProgression();
  const volume =
    parseInt(document.getElementById("volumeSlider").value, 10) / 100;
  window._activeOscillators = [];
  window._activeGains = [];
  let rootMidi = ROOTS[chord.root] || 60;
  if (!isFinite(rootMidi)) rootMidi = 60;
  // Get voicing from UI (default to 'closed')
  const voicing = window.getSelectedVoicing ? window.getSelectedVoicing() : 'closed';
  let intervals = chord.intervalOnly.filter(
    (x) => typeof x === "number" && isFinite(x)
  );
  intervals = applyVoicing(intervals, voicing);
  intervals.forEach((semi) => {
    let midi = rootMidi + semi;
    if (!isFinite(midi)) return;
    let freq = 440 * Math.pow(2, (midi - 69) / 12);
    if (!isFinite(freq)) return;
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    let filter = ctx.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.detune.value = Math.random() * 10 - 5;
    filter.type = "lowpass";
    filter.frequency.value = 220;
    filter.Q.value = 1.4;
    const time = ctx.currentTime;
    const attack = 1.0;
    const chordDuration = 2.5;
    const release = 1.2;
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(volume, time + attack);
    gain.gain.setValueAtTime(volume, time + chordDuration - release);
    gain.gain.linearRampToValueAtTime(0.0, time + chordDuration);
    osc.connect(filter).connect(gain).connect(reverb).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + chordDuration);
    window._activeOscillators.push(osc);
    window._activeGains.push(gain);
  });
};
