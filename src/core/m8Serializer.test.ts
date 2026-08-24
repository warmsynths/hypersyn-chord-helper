import {
  extractUniqueChordIntervals,
  buildHypersynthPatch,
  serializeM8Instrument,
  serializeM8Song,
  buildM8Phrases,
  buildM8ChainsAndSteps,
  M8_MAGIC,
  FILE_TYPE_INSTRUMENT,
} from "./m8Serializer";

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

  describe("buildHypersynthPatch", () => {
    it("builds a patch with Lush Pad default parameters and progression chord banks", () => {
      const patch = buildHypersynthPatch(["Am7 Dm9 G13 Cmaj7"], "TESTPAD");
      expect(patch.name).toBe("TESTPAD");
      expect(patch.volume).toBe(0xE0);
      expect(patch.chordBanks.length).toBe(16);
      expect(patch.filter.type).toBe(0x00); // Lowpass
      expect(patch.filter.cutoff).toBe(0xB8);
      expect(patch.mixer.cho).toBeGreaterThan(0x00);
      expect(patch.mixer.rev).toBeGreaterThan(0x00);
    });

    it("sanitizes patch name to max 12 characters", () => {
      const patch = buildHypersynthPatch(["Cmaj7"], "VERYLONGSYNTHPATCHNAME");
      expect(patch.name.length).toBeLessThanOrEqual(12);
      expect(patch.name).toBe("VERYLONGSYNT");
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
});
