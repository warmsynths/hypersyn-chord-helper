import {
  TrackerStore,
  buildProgressionStep,
} from "./trackerStore";

describe("core TrackerStore domain model", () => {
  let store: TrackerStore;

  beforeEach(() => {
    store = new TrackerStore();
  });

  it("initializes with single empty progression step", () => {
    expect(store.getSteps().length).toBe(1);
    expect(store.getActiveStep().rawText).toBe("");
    expect(store.getActiveIndex()).toBe(0);
    expect(store.getHasConverted()).toBe(false);
  });

  it("builds structured ProgressionStep with parsed chord states", () => {
    const step = buildProgressionStep("Am7 Dm9 G13 Cmaj7");
    expect(step.chords.length).toBe(4);
    expect(step.chords[0].name).toBe("Am7");
    expect(step.chords[0].root).toBe("A");
    expect(step.chords[0].midiRoot).toBe(69);
    expect(step.chords[0].voicingIndex).toBe(0);
    expect(step.chords[0].voicingLabel).toBe("ROOT");
    expect(step.chords[0].intervals).toEqual([0, 3, 7, 10]);
  });

  it("allows setting chord voicings and updates intervals and notes", () => {
    store.loadSetsData(["Am7 Dm9 G13 Cmaj7"]);
    const initialNotes = [...store.getActiveStep().chords[0].notes];

    // Set Am7 to INV 1 (voicingIndex 1)
    store.setChordVoicing(0, 0, 1);
    const updatedChord = store.getActiveStep().chords[0];
    expect(updatedChord.voicingIndex).toBe(1);
    expect(updatedChord.voicingLabel).toBe("INV 1");
    // INV 1 raises first note by 12 semitones
    expect(updatedChord.notes[0]).toBe(initialNotes[0] + 12);
    expect(updatedChord.intervals[0]).toBe(12);
  });

  it("preserves custom voicings across step switches (no state wiping)", () => {
    store.loadSetsData(["Am7 Dm9", "Fmaj7 Em7"]);

    // Step 0: customize Am7 to INV 1
    store.setChordVoicing(0, 0, 1);
    expect(store.getSteps()[0].chords[0].voicingIndex).toBe(1);

    // Switch to step 1
    store.switchSet(1);
    expect(store.getActiveIndex()).toBe(1);
    expect(store.getActiveStep().chords[0].name).toBe("Fmaj7");

    // Switch back to step 0: Am7 voicing must still be INV 1!
    store.switchSet(0);
    expect(store.getActiveStep().chords[0].voicingIndex).toBe(1);
    expect(store.getActiveStep().chords[0].voicingLabel).toBe("INV 1");
  });

  it("preserves voicings positionally when step text is edited", () => {
    store.loadSetsData(["Am7 Dm9"]);
    store.setChordVoicing(0, 0, 2); // INV 2 on Am7
    store.setChordVoicing(0, 1, 4); // DROP 2 on Dm9

    // Add a third chord to step 0
    store.updateActiveSet("Am7 Dm9 G13");
    const chords = store.getActiveStep().chords;
    expect(chords.length).toBe(3);
    // Am7 retains INV 2
    expect(chords[0].voicingIndex).toBe(2);
    // Dm9 retains DROP 2
    expect(chords[1].voicingIndex).toBe(4);
    // New chord G13 defaults to ROOT
    expect(chords[2].voicingIndex).toBe(0);
  });

  it("cycles chord voicing with delta and wraps around", () => {
    store.loadSetsData(["Cmaj7"]);
    expect(store.cycleChordVoicing(0, 0, 1)).toBe(1); // INV 1
    expect(store.cycleChordVoicing(0, 0, 1)).toBe(2); // INV 2
    expect(store.cycleChordVoicing(0, 0, -1)).toBe(1); // back to INV 1
  });

  it("returns step intervals and notes directly", () => {
    store.loadSetsData(["Cmaj7"]);
    const intervals = store.getStepIntervals(0);
    expect(intervals).toEqual([[0, 4, 7, 11]]);

    const notes = store.getStepNotes(0);
    expect(notes).toEqual([[60, 64, 67, 71]]);
  });

  it("loads steps data with custom voicings", () => {
    store.loadStepsData([
      { chords: "Am7 Dm9", voicings: [1, 4] },
    ]);
    const chords = store.getActiveStep().chords;
    expect(chords[0].voicingIndex).toBe(1);
    expect(chords[1].voicingIndex).toBe(4);
  });
});
