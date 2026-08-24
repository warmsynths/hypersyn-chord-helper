import { convertChords, parseChordName, getMidiRoot } from "./chords";

export const M8_MAGIC = [0x4D, 0x38, 0x56, 0x45, 0x52, 0x53, 0x49, 0x4F, 0x4E]; // "M8VERSION"
export const FILE_TYPE_SONG = 0x00;
export const FILE_TYPE_INSTRUMENT = 0x10; // 0x01 << 4
export const INSTRUMENT_KIND_HYPERSYNTH = 0x05;

export const MAX_CHORD_BANKS = 16;
export const MAX_INTERVALS_PER_BANK = 6;
export const EMPTY_BYTE = 0xFF;

export interface M8FilterParams {
  type: number;
  cutoff: number;
  res: number;
}

export interface M8AmpParams {
  amp: number;
  limit: number;
}

export interface M8MixerParams {
  pan: number;
  dry: number;
  cho: number;
  del: number;
  rev: number;
}

export interface M8EnvelopeParams {
  dest: number;
  amount: number;
  attack: number;
  hold: number;
  decay: number;
  retrigger: number;
}

export interface M8LFOParams {
  shape: number;
  dest: number;
  triggerMode: number;
  freq: number;
  amount: number;
  retrigger: number;
}

export interface M8HypersynthParams {
  scale: number;
  chord: number;
  shift: number;
  swarm: number;
  width: number;
  subOsc: number;
  chordBanks: number[][]; // 16 arrays of up to 6 numbers
}

export interface M8HypersynthPatch {
  name: string;
  transpose: boolean;
  tableTick: number;
  volume: number;
  pitch: number;
  fineTune: number;
  hypersynthParams: M8HypersynthParams;
  chordBanks: number[][];
  filter: M8FilterParams;
  amp: M8AmpParams;
  mixer: M8MixerParams;
  envelopes: M8EnvelopeParams[];
  lfos: M8LFOParams[];
}

/**
 * Extracts unique semitone interval patterns across all chord sets.
 * Clamps to 16 unique banks with a warning if exceeded.
 */
export function extractUniqueChordIntervals(
  chordSetsData: string[],
  customIntervals?: number[][]
): {
  chordBanks: number[][];
  warnings: string[];
  chordToBankMap: Map<string, number>;
} {
  const warnings: string[] = [];
  const uniqueKeys: string[] = [];
  const chordBanks: number[][] = [];
  const chordToBankMap = new Map<string, number>();

  let chordCounter = 0;
  chordSetsData.forEach((setStr) => {
    if (!setStr || typeof setStr !== "string") return;
    const tokens = setStr.split(/[\s,]+/).filter(Boolean);

    tokens.forEach((token) => {
      const parsed = parseChordName(token);
      if (!parsed) return;

      const intervals =
        customIntervals && customIntervals[chordCounter] && customIntervals[chordCounter].length > 0
          ? customIntervals[chordCounter].slice(0, MAX_INTERVALS_PER_BANK)
          : (parsed.intervalOnly || []).slice(0, MAX_INTERVALS_PER_BANK);
      chordCounter++;

      const key = intervals.join("-");

      let bankIdx = uniqueKeys.indexOf(key);
      if (bankIdx === -1) {
        if (uniqueKeys.length < MAX_CHORD_BANKS) {
          uniqueKeys.push(key);
          chordBanks.push(intervals);
          bankIdx = uniqueKeys.length - 1;
        } else {
          bankIdx = 0; // fallback to bank 0 on overflow
        }
      }
      chordToBankMap.set(parsed.chordName, bankIdx);
    });
  });

  // Check if raw unique shapes exceeded 16
  const totalUniqueShapes = new Set(
    chordSetsData
      .join(" ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((s) => parseChordName(s))
      .filter((c) => c !== null)
      .map((c) => (c?.intervalOnly ? c.intervalOnly.slice(0, MAX_INTERVALS_PER_BANK).join("-") : ""))
  ).size;

  if (totalUniqueShapes > MAX_CHORD_BANKS) {
    warnings.push(
      `Progression contains ${totalUniqueShapes} unique chord shapes, which exceeds the 16 chord bank limit. Chords were clamped to the first 16 shapes.`
    );
  }

  return { chordBanks, warnings, chordToBankMap };
}

/**
 * Builds a default Lush Synth Pad / Keys patch populated with progression chord banks.
 */
export function buildHypersynthPatch(
  chordSetsData: string[],
  patchName: string = "HYPERSYN",
  customIntervals?: number[][]
): M8HypersynthPatch {
  const sanitizedName = patchName.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12).toUpperCase() || "HYPERSYN";
  const { chordBanks } = extractUniqueChordIntervals(chordSetsData, customIntervals);

  // Fill up to 16 banks
  const fullBanks: number[][] = [];
  for (let i = 0; i < MAX_CHORD_BANKS; i++) {
    if (i < chordBanks.length && chordBanks[i]) {
      fullBanks.push(chordBanks[i].slice(0, MAX_INTERVALS_PER_BANK));
    } else {
      fullBanks.push([0]); // Default fundamental root unison
    }
  }

  return {
    name: sanitizedName,
    transpose: true,
    tableTick: 0x01,
    volume: 0xE0,
    pitch: 0x00,
    fineTune: 0x80,
    hypersynthParams: {
      scale: 0x00,
      chord: 0x00,
      shift: 0x00,
      swarm: 0x00,
      width: 0x80,
      subOsc: 0x00,
      chordBanks: fullBanks,
    },
    chordBanks: fullBanks,
    filter: {
      type: 0x01, // 0x01 = LOWPASS in M8 firmware
      cutoff: 0xB8,
      res: 0x20,
    },
    amp: {
      amp: 0x00,
      limit: 0x00,
    },
    mixer: {
      pan: 0x80, // Center
      dry: 0xC0,
      cho: 0x40, // Subtle Chorus
      del: 0x20,
      rev: 0x40, // Subtle Reverb
    },
    envelopes: [
      {
        dest: 0x01, // Volume
        amount: 0xFF,
        attack: 0x10,
        hold: 0x00,
        decay: 0x90,
        retrigger: 0x00,
      },
      {
        dest: 0x07, // Cutoff
        amount: 0x30,
        attack: 0x18,
        hold: 0x00,
        decay: 0x60,
        retrigger: 0x00,
      },
    ],
    lfos: [
      {
        shape: 0x00, // Triangle
        dest: 0x0A, // Pan
        triggerMode: 0x00,
        freq: 0x20,
        amount: 0x15,
        retrigger: 0x00,
      },
      {
        shape: 0x00,
        dest: 0x00,
        triggerMode: 0x00,
        freq: 0x00,
        amount: 0x00,
        retrigger: 0x00,
      },
    ],
  };
}

function stringToBytes(str: string, length: number, fillByte: number = 0x00): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < length; i++) {
    if (i < str.length) {
      bytes.push(str.charCodeAt(i) & 0xFF);
    } else {
      bytes.push(fillByte);
    }
  }
  return bytes;
}

/**
 * Builds the standard 14-byte M8 file header.
 */
export function buildM8Header(fileType: number): number[] {
  const bytes: number[] = [...M8_MAGIC, 0x00]; // "M8VERSION\0" (10 bytes)
  // Version 3.0.0 (major: 3, minor: 0, patch: 0) -> (3 << 8) = 0x0300
  bytes.push(0x00, 0x03); // 2 bytes LE (0x0300)
  bytes.push(0x00); // 1 byte
  bytes.push(fileType); // 1 byte (0x10 for Instrument, 0x00 for Song)
  return bytes;
}

/**
 * Serializes a Hypersynth patch to an M8 Instrument byte array (215 bytes fixed).
 *
 * M8 Hypersynth Byte Structure (Firmware 3.0+ / 4.0+ / 6.0+):
 * - 0x00: kind (1 byte: 0x05)
 * - 0x01..0x0C: name (12 bytes, ASCII null-padded)
 * - 0x0D: transpose / eq (1 byte)
 * - 0x0E: tableTick (1 byte)
 * - 0x0F: volume (1 byte)
 * - 0x10: pitch (1 byte)
 * - 0x11: fineTune (1 byte)
 * - 0x12..0x18: default_chord (7 bytes: 1 byte mask + 6 bytes offsets)
 * - 0x19: scale (1 byte)
 * - 0x1A: shift (1 byte)
 * - 0x1B: swarm (1 byte)
 * - 0x1C: width (1 byte)
 * - 0x1D: subosc (1 byte)
 * - 0x1E..0x27: filter, amp, mixer (10 bytes)
 * - 0x28..0x3E: MOD_OFFSET gap (23 bytes: shape at +3, associated_eq at +22)
 * - 0x3F..0x56: 4 modulators (24 bytes: 2 AHD envelopes + 2 LFOs)
 * - 0x57..0xC6: 16 chord banks * 7 bytes (112 bytes: 1 byte mask + 6 bytes offsets)
 * - 0xC7..0xD6: padding (16 bytes: 0x00)
 * Total: 215 bytes
 */
export function serializeHypersynthBody(patch: M8HypersynthPatch): number[] {
  const bytes: number[] = [];

  // 1. Header (18 bytes: 0x00..0x11)
  bytes.push(INSTRUMENT_KIND_HYPERSYNTH); // kind: 0x05 (1 byte)
  bytes.push(...stringToBytes(patch.name, 12, 0x00)); // name: 12 bytes
  bytes.push(patch.transpose ? 0x01 : 0x00); // transpose: 1 byte
  bytes.push(patch.tableTick & 0xFF); // tableTick: 1 byte
  bytes.push(patch.volume & 0xFF); // volume: 1 byte
  bytes.push(patch.pitch & 0xFF); // pitch: 1 byte
  bytes.push(patch.fineTune & 0xFF); // fineTune: 1 byte

  // 2. Default Chord (7 bytes: 0x12..0x18)
  // 1 byte mask (0x01 = voice 0 enabled) + 6 bytes interval offsets
  bytes.push(0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

  // 3. Hypersynth Engine Params (5 bytes: 0x19..0x1D)
  bytes.push(patch.hypersynthParams.scale & 0xFF);
  bytes.push(patch.hypersynthParams.shift & 0xFF);
  bytes.push(patch.hypersynthParams.swarm & 0xFF);
  bytes.push(patch.hypersynthParams.width & 0xFF);
  bytes.push(patch.hypersynthParams.subOsc & 0xFF);

  // 4. Synth Common Params — Filter, Amp, Mixer (10 bytes: 0x1E..0x27)
  bytes.push(patch.filter.type & 0xFF);
  bytes.push(patch.filter.cutoff & 0xFF);
  bytes.push(patch.filter.res & 0xFF);

  bytes.push(patch.amp.amp & 0xFF);
  bytes.push(patch.amp.limit & 0xFF);

  bytes.push(patch.mixer.pan & 0xFF);
  bytes.push(patch.mixer.dry & 0xFF);
  bytes.push(patch.mixer.cho & 0xFF);
  bytes.push(patch.mixer.del & 0xFF);
  bytes.push(patch.mixer.rev & 0xFF);

  // 5. MOD_OFFSET Gap (23 bytes: 0x28..0x3E)
  // Firmware 4.0/5.0/6.0+ places modulators at offset 23 from mixer params.
  bytes.push(0x00, 0x00, 0x00); // 0x28..0x2A (3 bytes)
  bytes.push(0x00); // 0x2B: shape (Saw default)
  bytes.push(...Array(18).fill(0x00)); // 0x2C..0x3D (18 bytes)
  bytes.push(0x80); // 0x3E: associated_eq (default 0x80)

  // 6. 4 Modulators (24 bytes: 0x3F..0x56)
  // Env 1: AHDEnv (type 0) -> Volume (dest 0x01)
  const env1 = patch.envelopes[0] || { dest: 0x01, amount: 0xFF, attack: 0x10, hold: 0x00, decay: 0x90, retrigger: 0x00 };
  bytes.push(
    (0 << 4) | (env1.dest & 0x0F),
    env1.amount & 0xFF,
    env1.attack & 0xFF,
    env1.hold & 0xFF,
    env1.decay & 0xFF,
    0x00
  );

  // Env 2: AHDEnv (type 0) -> Cutoff (dest 0x07)
  const env2 = patch.envelopes[1] || { dest: 0x07, amount: 0x30, attack: 0x18, hold: 0x00, decay: 0x60, retrigger: 0x00 };
  bytes.push(
    (0 << 4) | (env2.dest & 0x0F),
    env2.amount & 0xFF,
    env2.attack & 0xFF,
    env2.hold & 0xFF,
    env2.decay & 0xFF,
    0x00
  );

  // LFO 1: LFO (type 3) -> Pan (dest 0x0A)
  const lfo1 = patch.lfos[0] || { shape: 0x00, dest: 0x0A, triggerMode: 0x00, freq: 0x20, amount: 0x15, retrigger: 0x00 };
  bytes.push(
    (3 << 4) | (lfo1.dest & 0x0F),
    lfo1.amount & 0xFF,
    lfo1.shape & 0xFF,
    lfo1.triggerMode & 0xFF,
    lfo1.freq & 0xFF,
    lfo1.retrigger & 0xFF
  );

  // LFO 2: LFO (type 3) -> Off (dest 0x00)
  const lfo2 = patch.lfos[1] || { shape: 0x00, dest: 0x00, triggerMode: 0x00, freq: 0x00, amount: 0x00, retrigger: 0x00 };
  bytes.push(
    (3 << 4) | (lfo2.dest & 0x0F),
    lfo2.amount & 0xFF,
    lfo2.shape & 0xFF,
    lfo2.triggerMode & 0xFF,
    lfo2.freq & 0xFF,
    lfo2.retrigger & 0xFF
  );

  // 7. 16 Chord Banks (16 * 7 bytes = 112 bytes: 0x57..0xC6)
  for (let b = 0; b < MAX_CHORD_BANKS; b++) {
    const bank = patch.chordBanks[b] || [0];
    const activeCount = Math.min(bank.length, MAX_INTERVALS_PER_BANK);
    
    // Mask: bitmask of active voices (e.g. 4 voices -> (1 << 4) - 1 = 0x0F)
    const mask = activeCount > 0 ? (1 << activeCount) - 1 : 0x01;
    bytes.push(mask & 0xFF);

    // 6 offset bytes
    for (let s = 0; s < MAX_INTERVALS_PER_BANK; s++) {
      if (s < activeCount && typeof bank[s] === "number") {
        bytes.push(bank[s] & 0xFF);
      } else {
        bytes.push(0x00);
      }
    }
  }

  // 8. Padding (16 bytes: 0xC7..0xD6)
  bytes.push(...Array(16).fill(0x00));

  // Sanity check: Ensure total length is exactly 215 bytes
  if (bytes.length !== 215) {
    throw new Error(`serializeHypersynthBody internal length mismatch: expected 215, got ${bytes.length}`);
  }

  return bytes;
}

export interface M8PhraseStep {
  note: number;
  volume: number;
  instrument: number;
  fx: Array<{ command: number; value: number }>;
}

export interface M8Phrase {
  steps: M8PhraseStep[];
}

export interface M8ChainStep {
  phrase: number;
  transpose: number;
}

export interface M8Chain {
  steps: M8ChainStep[];
}

export interface M8SongStep {
  tracks: number[];
}

function emptyPhraseStep(): M8PhraseStep {
  return {
    note: EMPTY_BYTE,
    volume: EMPTY_BYTE,
    instrument: EMPTY_BYTE,
    fx: [
      { command: EMPTY_BYTE, value: 0x00 },
      { command: EMPTY_BYTE, value: 0x00 },
      { command: EMPTY_BYTE, value: 0x00 },
    ],
  };
}

function emptyPhrase(): M8Phrase {
  return {
    steps: Array.from({ length: 16 }, () => emptyPhraseStep()),
  };
}

function emptyChain(): M8Chain {
  return {
    steps: Array.from({ length: 16 }, () => ({ phrase: EMPTY_BYTE, transpose: 0x00 })),
  };
}

function emptySongStep(): M8SongStep {
  return {
    tracks: Array(8).fill(EMPTY_BYTE),
  };
}

export function buildM8Phrases(
  chordSetsData: string[],
  customIntervals?: number[][]
): {
  phrases: M8Phrase[];
  phraseCount: number;
  warnings: string[];
} {
  const { warnings, chordToBankMap } = extractUniqueChordIntervals(chordSetsData, customIntervals);
  const phrases: M8Phrase[] = Array.from({ length: 255 }, () => emptyPhrase());
  let phraseIndex = 0;

  chordSetsData.forEach((setStr) => {
    if (!setStr || typeof setStr !== "string") return;
    const tokens = setStr.split(/[\s,]+/).filter(Boolean);

    tokens.forEach((token) => {
      if (phraseIndex >= 255) return;
      const parsed = parseChordName(token);
      if (!parsed) return;

      const bankIdx = chordToBankMap.get(parsed.chordName) ?? 0x00;
      const rootMidi = getMidiRoot(parsed.root);

      const phrase = emptyPhrase();
      phrase.steps[0] = {
        note: rootMidi,
        volume: 0xFF,
        instrument: 0x00,
        fx: [
          { command: 0x83, value: bankIdx }, // CHD command selecting bank
          { command: EMPTY_BYTE, value: 0x00 },
          { command: EMPTY_BYTE, value: 0x00 },
        ],
      };

      phrases[phraseIndex] = phrase;
      phraseIndex++;
    });
  });

  return { phrases, phraseCount: phraseIndex, warnings };
}

export function buildM8ChainsAndSteps(chordSetsData: string[]): {
  chains: M8Chain[];
  steps: M8SongStep[];
  chainCount: number;
} {
  const chains: M8Chain[] = Array.from({ length: 255 }, () => emptyChain());
  const steps: M8SongStep[] = Array.from({ length: 256 }, () => emptySongStep());
  let currentPhraseIdx = 0;
  let chainIdx = 0;

  chordSetsData.forEach((setStr, setIndex) => {
    if (chainIdx >= 255 || setIndex >= 256) return;
    const tokens = setStr ? setStr.split(/[\s,]+/).filter(Boolean) : [];
    if (tokens.length === 0) return;

    const chain = emptyChain();
    tokens.forEach((token, sIdx) => {
      if (sIdx >= 16 || currentPhraseIdx >= 255) return;
      chain.steps[sIdx] = {
        phrase: currentPhraseIdx,
        transpose: 0x00,
      };
      currentPhraseIdx++;
    });

    chains[chainIdx] = chain;
    steps[chainIdx].tracks[0] = chainIdx; // Track 0 plays chain
    chainIdx++;
  });

  if (chainIdx === 0) {
    // If no sets, provide at least Chain 0
    chains[0] = emptyChain();
    steps[0].tracks[0] = 0x00;
    chainIdx = 1;
  }

  return { chains, steps, chainCount: chainIdx };
}

function float32ToBytesLE(value: number): number[] {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, value, true);
  return [view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)];
}

function buildDefaultScale(name: string): number[] {
  const bytes: number[] = [];
  // 12 enabled bits (0x0FFF in LE)
  bytes.push(0xFF, 0x0F);
  // 12 intervals * 2 offset bytes = 24 bytes
  for (let i = 0; i < 12; i++) {
    bytes.push(0x00, 0x00);
  }
  // Name 16 bytes
  bytes.push(...stringToBytes(name, 16, 0x00));
  return bytes;
}

export function serializeM8Song(
  chordSetsData: string[],
  songName: string = "HYPERSYN",
  tempo: number = 120,
  customIntervals?: number[][]
): {
  bytes: Uint8Array;
  warnings: string[];
  chainCount: number;
  phraseCount: number;
} {
  const sanitizedName = songName.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12).toUpperCase() || "HYPERSYN";
  const patch = buildHypersynthPatch(chordSetsData, sanitizedName, customIntervals);
  const { phrases, phraseCount, warnings } = buildM8Phrases(chordSetsData, customIntervals);
  const { chains, steps, chainCount } = buildM8ChainsAndSteps(chordSetsData);

  const bytes: number[] = [];

  // Header (14 bytes)
  bytes.push(...buildM8Header(FILE_TYPE_SONG));

  // Directory (128 bytes of 0x00)
  bytes.push(...Array(128).fill(0x00));

  // Transpose (1 byte)
  bytes.push(0x00);

  // Tempo (Float32 LE, 4 bytes)
  bytes.push(...float32ToBytesLE(tempo));

  // Quantize (1 byte)
  bytes.push(0x00);

  // Name (12 bytes)
  bytes.push(...stringToBytes(sanitizedName, 12, 0x00));

  // MIDI settings (27 bytes)
  bytes.push(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  bytes.push(...Array(8).fill(0x00)); // trackInputChannel
  bytes.push(...Array(8).fill(0x00)); // trackInputInstrument
  bytes.push(0x00, 0x00); // trackInputProgramChange, trackInputMode

  // Song key (1 byte)
  bytes.push(0x00);

  // Skipped (18 bytes)
  bytes.push(...Array(18).fill(0x00));

  // Mixer settings (26 bytes)
  bytes.push(0xE0, 0x00); // masterVolume, masterLimit
  bytes.push(...Array(8).fill(0xE0)); // trackVolume
  bytes.push(0xE0, 0xE0, 0xE0); // chorus, delay, reverb volume
  bytes.push(0x00, 0x00, 0x00); // analogInputVolume, usbInputVolume
  bytes.push(0x00, 0x00, 0x00, 0x00, 0x00, 0x00); // analog sends
  bytes.push(0x00, 0x00, 0x00); // usb sends
  bytes.push(0x80, 0x00); // djFilter, djFilterPeak

  // Skipped (5 bytes)
  bytes.push(...Array(5).fill(0x00));

  // Grooves (32 grooves * 16 steps = 512 bytes)
  for (let g = 0; g < 32; g++) {
    if (g === 0) {
      // Groove 0: standard 6/6 groove (16th notes)
      bytes.push(0x06, 0x06, ...Array(14).fill(EMPTY_BYTE));
    } else {
      bytes.push(...Array(16).fill(EMPTY_BYTE));
    }
  }

  // Song steps (256 steps * 8 tracks = 2048 bytes)
  for (let s = 0; s < 256; s++) {
    const step = steps[s] || emptySongStep();
    for (let t = 0; t < 8; t++) {
      bytes.push(step.tracks[t] ?? EMPTY_BYTE);
    }
  }

  // Phrases (255 phrases * 16 steps * 9 bytes = 36720 bytes)
  for (let p = 0; p < 255; p++) {
    const phrase = phrases[p] || emptyPhrase();
    for (let s = 0; s < 16; s++) {
      const step = phrase.steps[s] || emptyPhraseStep();
      bytes.push(step.note & 0xFF);
      bytes.push(step.volume & 0xFF);
      bytes.push(step.instrument & 0xFF);
      for (let k = 0; k < 3; k++) {
        const fx = step.fx[k] || { command: EMPTY_BYTE, value: 0x00 };
        bytes.push(fx.command & 0xFF);
        bytes.push(fx.value & 0xFF);
      }
    }
  }

  // Chains (255 chains * 16 steps * 2 bytes = 8160 bytes)
  for (let c = 0; c < 255; c++) {
    const chain = chains[c] || emptyChain();
    for (let s = 0; s < 16; s++) {
      const step = chain.steps[s] || { phrase: EMPTY_BYTE, transpose: 0x00 };
      bytes.push(step.phrase & 0xFF);
      bytes.push(step.transpose & 0xFF);
    }
  }

  // Tables (256 tables * 128 bytes = 32768 bytes)
  bytes.push(...Array(256 * 128).fill(EMPTY_BYTE));

  // Instruments (128 instruments * 215 bytes = 27520 bytes)
  // Instrument 00: Hypersynth patch body
  const inst0Bytes = serializeHypersynthBody(patch);
  bytes.push(...inst0Bytes);

  // Instruments 01..127: Empty instruments
  for (let i = 1; i < 128; i++) {
    bytes.push(EMPTY_BYTE); // kind: None
    bytes.push(...Array(12).fill(EMPTY_BYTE)); // name
    bytes.push(0x00); // transpose
    bytes.push(0x01); // tableTick
    bytes.push(0x00, 0x00, 0x00); // volume, pitch, fineTune
    // Remaining empty parameters to 0x57 (71 bytes)
    bytes.push(...Array(71).fill(EMPTY_BYTE));
    // Sample path (128 bytes)
    bytes.push(...Array(128).fill(0x00));
  }

  // Skipped (3 bytes)
  bytes.push(0x00, 0x00, 0x00);

  // Effects settings
  // Chorus (4 bytes)
  bytes.push(0x00, 0x00, 0x00, 0x00);
  // Skipped (3 bytes)
  bytes.push(0x00, 0x00, 0x00);
  // Delay (7 bytes)
  bytes.push(0x00, 0xFF, 0x30, 0x30, 0x40, 0x80, 0x20);
  // Skipped (1 byte)
  bytes.push(0x00);
  // Reverb (4 bytes)
  bytes.push(0x20, 0xD0, 0x80, 0x40);

  // Scales (16 scales * 36 bytes = 576 bytes)
  for (let sc = 0; sc < 16; sc++) {
    bytes.push(...buildDefaultScale(`SCALE ${sc + 1}`));
  }

  return {
    bytes: new Uint8Array(bytes),
    warnings,
    chainCount,
    phraseCount,
  };
}

/**
 * Serializes a complete standalone .m8i instrument file.
 */
export function serializeM8Instrument(patch: M8HypersynthPatch): Uint8Array {
  const bytes: number[] = [];
  bytes.push(...buildM8Header(FILE_TYPE_INSTRUMENT));
  bytes.push(...serializeHypersynthBody(patch));

  // Table data for standalone .m8i (16 steps * 8 bytes = 128 bytes, filled with 0xFF)
  bytes.push(...Array(128).fill(EMPTY_BYTE));

  return new Uint8Array(bytes);
}

/**
 * Triggers a browser file download for binary M8 data.
 */
export function downloadM8File(bytes: Uint8Array, filename: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
