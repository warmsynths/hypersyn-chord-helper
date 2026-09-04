import {
  extractUniqueChordIntervals,
  buildHypersynthPatch,
  serializeHypersynthBody,
  serializeM8Instrument,
  serializeM8Song,
  buildM8Phrases,
  buildM8ChainsAndSteps,
  M8_MAGIC,
  FILE_TYPE_INSTRUMENT,
  exportM8Song,
  exportM8Instrument,
} from "./m8Serializer";
import { buildProgressionStep } from "./trackerStore";

describe("M8 Serializer — Hypersynth Instrument (.m8i)", () => {
  describe("extractUniqueChordIntervals", () => {
    it("extracts unique interval patterns from a progression", () => {
      const { chordBanks, warnings } = extractUniqueChordIntervals(["Am7 Dm9 G13 Cmaj7"]);
      expect(warnings).toHaveLength(0);
      expect(chordBanks.length).toBeGreaterThanOrEqual(1);
      expect(chordBanks.length).toBeLessThanOrEqual(16);
      // Each bank should be an array of numbers (semitone offsets)
      chordBanks.forEach((bank) => {
        expect(Array.isArray(bank)).toBe(true);
        expect(bank.length).toBeLessThanOrEqual(6);
        bank.forEach((interval) => {
          expect(typeof interval).toBe("number");
        });
      });
    });

    it("deduplicates identical interval shapes", () => {
      // Am7 and Dm7 have the same minor 7th shape [0, 3, 7, 10]
      const { chordBanks } = extractUniqueChordIntervals(["Am7 Dm7"]);
      // Both chords share the same minor 7th interval pattern in closed root voicing
      expect(chordBanks).toHaveLength(1);
      expect(chordBanks[0]).toEqual([0, 3, 7, 10]);
    });

    it("handles empty or invalid inputs gracefully", () => {
      const { chordBanks, warnings } = extractUniqueChordIntervals([""]);
      expect(warnings).toHaveLength(0);
      expect(chordBanks).toEqual([]);
    });

    it("warns and clamps when unique shapes exceed 16", () => {
      // Create 18 distinct chord types/voicings
      const eighteenChords = [
        "C", "Cm", "C7", "Cmaj7", "Cm7", "Cdim", "Cdim7", "Caug",
        "Csus2", "Csus4", "C6", "Cm6", "C9", "Cm9", "Cmaj9", "C11",
        "C13", "Cadd9"
      ].join(" ");
      const { chordBanks, warnings } = extractUniqueChordIntervals([eighteenChords]);
      expect(chordBanks.length).toBe(16);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toMatch(/16 chord bank limit/i);
    });
  });

  describe("serializeHypersynthBody & serializeM8Instrument", () => {
    it("serializes Hypersynth body to exactly 215 bytes with valid M8 firmware layout", () => {
      const patch = buildHypersynthPatch(["Am7 Dm9 G13 Cmaj7"], "TESTPAD");
      const body = serializeHypersynthBody(patch);

      expect(body).toHaveLength(215);

      // Index 0x00: Kind = 0x05 (Hypersynth)
      expect(body[0]).toBe(0x05);

      // Index 0x01..0x0C: Name (12 bytes)
      const nameStr = String.fromCharCode(...body.slice(1, 8));
      expect(nameStr).toBe("TESTPAD");

      // Index 0x0D: Transpose
      expect(body[0x0D]).toBe(0x01);

      // Index 0x0E: TableTick
      expect(body[0x0E]).toBe(0x00);

      // Index 0x0F: Volume
      expect(body[0x0F]).toBe(0xFF);

      // Index 0x12..0x18: Default Chord (7 bytes: mask 0x01 + 6 offsets 0x00)
      expect(body.slice(0x12, 0x19)).toEqual([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

      // Index 0x19..0x1D: Engine params (scale, shift, swarm, width, subosc)
      expect(body[0x19]).toBe(0x00); // scale
      expect(body[0x1A]).toBe(0x00); // shift
      expect(body[0x1B]).toBe(0x0C); // swarm (minimal swarm)
      expect(body[0x1C]).toBe(0xC0); // width (wide stereo spread)
      expect(body[0x1D]).toBe(0xA0); // subosc (1 octave down square)

      // Index 0x1E..0x27: Common Synth Params (Filter, Amp, Mixer)
      expect(body[0x1E]).toBe(0x01); // filter type: 0x01 (LOWPASS)
      expect(body[0x1F]).toBe(0x50); // filter cutoff (warm creamy cutoff)
      expect(body[0x23]).toBe(0x80); // mixer pan (center)
      expect(body[0x24]).toBe(0xE8); // mixer dry

      // Index 0x28..0x3E: MOD_OFFSET gap (23 bytes)
      expect(body[0x2B]).toBe(0x00); // shape (Saw)
      expect(body[0x3E]).toBe(0x80); // associated_eq

      // Index 0x3F..0x56: 4 Modulators (24 bytes)
      expect(body[0x3F]).toBe(0x01); // Env 1 dest: Volume
      expect(body[0x45]).toBe(0x00); // Env 2 dest: Off
      expect(body[0x4B]).toBe(0x30); // LFO 1 dest: Off ((3 << 4) | 0x00)
      expect(body[0x51]).toBe(0x30); // LFO 2 dest: Off ((3 << 4) | 0x00)

      // Index 0x57..0x5D: Chord Bank 0 (Am7 -> [0, 3, 7, 10])
      // 1 byte mask (0x0F = 4 active voices) + 6 offset bytes [0, 3, 7, 10, 0, 0]
      expect(body[0x57]).toBe(0x0F); // mask for 4 voices
      expect(body.slice(0x58, 0x5E)).toEqual([0x00, 0x03, 0x07, 0x0A, 0x00, 0x00]); // offsets
    });

    it("serializes standalone .m8i instrument file to exactly 357 bytes", () => {
      const patch = buildHypersynthPatch(["Am7"], "MYPAD");
      const fileBytes = serializeM8Instrument(patch);

      expect(fileBytes).toBeInstanceOf(Uint8Array);
      // 14 bytes (header) + 215 bytes (body) + 128 bytes (table) = 357 bytes
      expect(fileBytes.length).toBe(357);

      // Header verification
      const magic = String.fromCharCode(...fileBytes.slice(0, 9));
      expect(magic).toBe("M8VERSION");
      expect(fileBytes[13]).toBe(FILE_TYPE_INSTRUMENT); // 0x10

      // Instrument body starts at offset 14
      expect(fileBytes[14]).toBe(0x05); // kind Hypersynth
    });
  });

  describe("serializeM8Song", () => {
    it("serializes a complete .m8s song file with Hypersynth instrument, phrases, and chains", () => {
      const { bytes, warnings, chainCount, phraseCount } = serializeM8Song(
        ["Am7 Dm9 G13 Cmaj7"],
        "TESTSONG",
        120
      );

      expect(warnings).toHaveLength(0);
      expect(chainCount).toBe(1);
      expect(phraseCount).toBe(4);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(50000);

      // Verify M8VERSION header
      const headerStr = String.fromCharCode(...bytes.slice(0, 9));
      expect(headerStr).toBe("M8VERSION");

      // Verify File Type byte (0x00 = Song)
      expect(bytes[13]).toBe(0x00);
    });

    it("creates one phrase per chord in the progression with root note and CHD command", () => {
      const { phrases, phraseCount } = buildM8Phrases(["Am7 Dm9 G13 Cmaj7"]);
      expect(phraseCount).toBe(4);
      expect(phrases.length).toBe(255);

      // Phrase 0: Am7 -> Root A (MIDI 57 or 69)
      const p0 = phrases[0];
      expect(p0.steps[0].note).toBeGreaterThan(0);
      expect(p0.steps[0].instrument).toBe(0x00);
      expect(p0.steps[0].fx[0].command).toBe(0x83); // CHD command
      expect(p0.steps[0].fx[0].value).toBe(0x00); // Bank 0

      // Step 1 to 15 should be empty (note 0xFF)
      for (let s = 1; s < 16; s++) {
        expect(p0.steps[s].note).toBe(0xFF);
      }
    });

    it("wires Chain 00 with phrase indices and sets Song Step 00 Track 1 to Chain 00", () => {
      const { chains, steps } = buildM8ChainsAndSteps(["Am7 Dm9 G13 Cmaj7"]);
      expect(chains[0].steps[0].phrase).toBe(0);
      expect(chains[0].steps[1].phrase).toBe(1);
      expect(chains[0].steps[2].phrase).toBe(2);
      expect(chains[0].steps[3].phrase).toBe(3);
      expect(chains[0].steps[4].phrase).toBe(0xFF); // Remaining steps empty

      // Song step 0, track 0 -> Chain 0
      expect(steps[0].tracks[0]).toBe(0);
      // Track 1-7 empty (0xFF)
      expect(steps[0].tracks[1]).toBe(0xFF);
    });

    it("arranges multi-set projects across multiple chains and song steps", () => {
      const multiSets = [
        "Am7 Dm9 G13 Cmaj7", // Set 1: 4 chords -> phrases 0, 1, 2, 3 in Chain 0
        "Fmaj7 Em7 Dm7 Cmaj7", // Set 2: 4 chords -> phrases 4, 5, 6, 7 in Chain 1
        "E7 Am7 D7 G7", // Set 3: 4 chords -> phrases 8, 9, 10, 11 in Chain 2
      ];

      const { bytes, warnings, chainCount, phraseCount } = serializeM8Song(multiSets, "MULTITRACK");

      expect(warnings).toHaveLength(0);
      expect(chainCount).toBe(3);
      expect(phraseCount).toBe(12);

      const { chains, steps } = buildM8ChainsAndSteps(multiSets);
      expect(chains[0].steps[0].phrase).toBe(0);
      expect(chains[1].steps[0].phrase).toBe(4);
      expect(chains[2].steps[0].phrase).toBe(8);

      expect(steps[0].tracks[0]).toBe(0); // Step 0 -> Chain 0
      expect(steps[1].tracks[0]).toBe(1); // Step 1 -> Chain 1
      expect(steps[2].tracks[0]).toBe(2); // Step 2 -> Chain 2
    });

    it("respects custom voiced intervals when provided", () => {
      // User voiced Am7 as [0x0A, 0x02, 0x03, 0x07]
      const custom = [[10, 2, 3, 7]];
      const patch = buildHypersynthPatch(["Am7"], "VOICED", custom);
      expect(patch.chordBanks[0]).toEqual([10, 2, 3, 7]);

      const body = serializeHypersynthBody(patch);
      // Byte 0x57: mask 0x0F
      expect(body[0x57]).toBe(0x0F);
      // Bytes 0x58..0x5D: [0x0A, 0x02, 0x03, 0x07, 0x00, 0x00]
      expect(body.slice(0x58, 0x5E)).toEqual([0x0A, 0x02, 0x03, 0x07, 0x00, 0x00]);
    });

    it("includes warning in serializeM8Song output when total unique chord shapes exceed 16", () => {
      const eighteenChords = [
        "C", "Cm", "C7", "Cmaj7", "Cm7", "Cdim", "Cdim7", "Caug",
        "Csus2", "Csus4", "C6", "Cm6", "C9", "Cm9", "Cmaj9", "C11",
        "C13", "Cadd9"
      ].join(" ");

      const { warnings } = serializeM8Song([eighteenChords], "OVERFLOW");
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain("exceeds the 16 chord bank limit");
    });
  });

  describe("Deep Exporter Interface (exportM8Song & exportM8Instrument)", () => {
    it("exportM8Song returns a complete ExportResult for string inputs", () => {
      const result = exportM8Song({
        steps: ["Am7 Dm9 G13 Cmaj7"],
        name: "Chill Session",
        tempo: 128,
      });

      expect(result.filename).toBe("chillsession.m8s");
      expect(result.bytes).toBeInstanceOf(Uint8Array);
      expect(result.bytes.length).toBe(108914); // standard M8 song byte length
      expect(result.warnings).toHaveLength(0);
      expect(result.stats.chainCount).toBe(1);
      expect(result.stats.phraseCount).toBe(4);
      expect(result.stats.chordBankCount).toBeGreaterThanOrEqual(1);
    });

    it("exportM8Song works directly with ProgressionStep domain models", () => {
      const step1 = buildProgressionStep("Am7 Dm9", [1, 4]); // custom voicings
      const step2 = buildProgressionStep("G13 Cmaj7");

      const result = exportM8Song({
        steps: [step1, step2],
        name: "VoicedSong",
      });

      expect(result.filename).toBe("voicedsong.m8s");
      expect(result.stats.chainCount).toBe(2);
      expect(result.stats.phraseCount).toBe(4);
    });

    it("exportM8Song throws when progression contains no valid chords", () => {
      expect(() => {
        exportM8Song({ steps: ["", "   ", "xyz"] });
      }).toThrow(/Cannot export M8 song/);
    });

    it("exportM8Instrument returns a complete ExportResult for standalone patch", () => {
      const result = exportM8Instrument({
        steps: ["Am7 Dm9 G13 Cmaj7"],
        name: "LushJuno",
      });

      expect(result.filename).toBe("lushjuno.m8i");
      expect(result.bytes).toBeInstanceOf(Uint8Array);
      expect(result.bytes.length).toBe(357); // standard M8 instrument length
      expect(result.stats.chordBankCount).toBe(4);
    });

    it("exportM8Instrument throws on empty input", () => {
      expect(() => {
        exportM8Instrument({ steps: [] });
      }).toThrow(/Cannot export M8 instrument/);
    });

    it("exportM8Instrument respects patchOverrides", () => {
      const result = exportM8Instrument({
        steps: ["Cmaj7"],
        patchOverrides: {
          volume: 0xC0,
        },
      });

      // Header is 14 bytes. Hypersynth body volume is at offset 15 (0x0F) in body -> 14 + 15 = 29
      expect(result.bytes[29]).toBe(0xC0);
    });
  });
});


