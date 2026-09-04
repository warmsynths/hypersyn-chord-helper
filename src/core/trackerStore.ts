import {
  parseChordName,
  getMidiRoot,
  getCanonicalVoicings,
  getCanonicalVoicingByIndex,
  applyCanonicalVoicingByIndex,
} from "./chords";

export interface ChordState {
  name: string;
  root: string;
  midiRoot: number;
  voicingIndex: number;
  voicingLabel: string;
  baseIntervals: number[];
  baseNotes: number[];
  intervals: number[];
  notes: number[];
  intervalId: string;
}

export interface ProgressionStep {
  rawText: string;
  chords: ChordState[];
}

export interface StepLoadInput {
  chords: string;
  voicings?: number[];
}

type Listener = () => void;

/**
 * Builds a ProgressionStep domain model from raw text and optional voicing indices.
 * Assigns canonical voicings and computes voiced notes and semitone intervals.
 */
export function buildProgressionStep(
  rawText: string,
  voicingIndices?: number[]
): ProgressionStep {
  const trimmed = rawText ? rawText.trim() : "";
  if (!trimmed) {
    return { rawText: "", chords: [] };
  }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const chords: ChordState[] = [];
  const uniqueShapeKeys: string[] = [];

  tokens.forEach((token, idx) => {
    const parsed = parseChordName(token);
    if (!parsed) return;

    const root = parsed.root || "C";
    const midiRoot = getMidiRoot(root);
    const baseIntervals = Array.isArray(parsed.intervalOnly) && parsed.intervalOnly.length > 0
      ? parsed.intervalOnly
      : [0];
    const baseNotes = baseIntervals.map((iv) => midiRoot + iv);

    const voicingIdx =
      voicingIndices && typeof voicingIndices[idx] === "number"
        ? voicingIndices[idx]
        : 0;

    const voicing = getCanonicalVoicingByIndex(voicingIdx);
    const voicedNotes = voicing.fn(baseNotes);
    const voicedIntervals = voicedNotes.map((m) => m - midiRoot);

    const shapeKey = voicedIntervals.join("-");
    let shapeIdx = uniqueShapeKeys.indexOf(shapeKey);
    if (shapeIdx === -1) {
      uniqueShapeKeys.push(shapeKey);
      shapeIdx = uniqueShapeKeys.length - 1;
    }

    chords.push({
      name: parsed.chordName || token,
      root,
      midiRoot,
      voicingIndex: voicingIdx,
      voicingLabel: voicing.label,
      baseIntervals,
      baseNotes,
      intervals: voicedIntervals,
      notes: voicedNotes,
      intervalId: String(shapeIdx).padStart(2, "0"),
    });
  });

  return { rawText, chords };
}

export class TrackerStore {
  private steps: ProgressionStep[] = [{ rawText: "", chords: [] }];
  private activeStepIndex = 0;
  private hasConverted = false;
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getSteps(): ProgressionStep[] {
    return [...this.steps];
  }

  public getStep(index: number): ProgressionStep | undefined {
    return this.steps[index];
  }

  public getActiveStep(): ProgressionStep {
    return this.steps[this.activeStepIndex] || { rawText: "", chords: [] };
  }

  public getActiveIndex(): number {
    return this.activeStepIndex;
  }

  public getHasConverted(): boolean {
    return this.hasConverted;
  }

  public setHasConverted(val: boolean): void {
    this.hasConverted = val;
    this.notify();
  }

  /**
   * Backward-compatible string-only accessor.
   */
  public getSetsData(): string[] {
    return this.steps.map((s) => s.rawText);
  }

  /**
   * Backward-compatible active step string accessor.
   */
  public getActiveSet(): string {
    return this.getActiveStep().rawText;
  }

  /**
   * Updates the active step's text while preserving existing chord voicings positionally.
   */
  public updateActiveSet(content: string): void {
    this.setStepText(this.activeStepIndex, content);
  }

  /**
   * Updates text for a given step index, positionally retaining voicings where possible.
   */
  public setStepText(index: number, content: string): void {
    if (index < 0 || index >= this.steps.length) return;
    const existingVoicings = (this.steps[index]?.chords || []).map((c) => c.voicingIndex);
    this.steps[index] = buildProgressionStep(content, existingVoicings);
    this.notify();
  }

  /**
   * Sets the voicing for a specific chord in a step.
   */
  public setChordVoicing(stepIndex: number, chordIndex: number, voicingIndex: number): void {
    const step = this.steps[stepIndex];
    if (!step || !step.chords[chordIndex]) return;

    const chord = step.chords[chordIndex];
    const voicing = getCanonicalVoicingByIndex(voicingIndex);
    chord.voicingIndex = voicingIndex;
    chord.voicingLabel = voicing.label;
    chord.notes = voicing.fn(chord.baseNotes);
    chord.intervals = chord.notes.map((m) => m - chord.midiRoot);

    // Refresh interval IDs for the step
    const uniqueShapeKeys: string[] = [];
    step.chords.forEach((c) => {
      const shapeKey = c.intervals.join("-");
      let shapeIdx = uniqueShapeKeys.indexOf(shapeKey);
      if (shapeIdx === -1) {
        uniqueShapeKeys.push(shapeKey);
        shapeIdx = uniqueShapeKeys.length - 1;
      }
      c.intervalId = String(shapeIdx).padStart(2, "0");
    });

    this.notify();
  }

  /**
   * Cycles a chord's voicing by a delta (+1 or -1) and returns the new voicing index.
   */
  public cycleChordVoicing(stepIndex: number, chordIndex: number, delta: number): number {
    const step = this.steps[stepIndex];
    if (!step || !step.chords[chordIndex]) return 0;
    const total = getCanonicalVoicings().length;
    const current = step.chords[chordIndex].voicingIndex;
    const next = ((current + delta) % total + total) % total;
    this.setChordVoicing(stepIndex, chordIndex, next);
    return next;
  }

  /**
   * Retrieves semitone interval arrays for a step (or active step).
   */
  public getStepIntervals(stepIndex?: number): number[][] {
    const idx = stepIndex !== undefined ? stepIndex : this.activeStepIndex;
    const step = this.steps[idx];
    if (!step) return [];
    return step.chords.map((c) => [...c.intervals]);
  }

  /**
   * Retrieves absolute MIDI note numbers for a step (or active step).
   */
  public getStepNotes(stepIndex?: number): number[][] {
    const idx = stepIndex !== undefined ? stepIndex : this.activeStepIndex;
    const step = this.steps[idx];
    if (!step) return [];
    return step.chords.map((c) => [...c.notes]);
  }

  /**
   * Loads string array (backward compatibility).
   */
  public loadSetsData(sets: string[]): void {
    if (!sets || sets.length === 0) {
      this.steps = [buildProgressionStep("")];
    } else {
      this.steps = sets.map((str) => buildProgressionStep(str));
    }
    this.activeStepIndex = 0;
    this.hasConverted = true;
    this.notify();
  }

  /**
   * Loads rich progression steps with custom voicings.
   */
  public loadStepsData(steps: (string | StepLoadInput)[]): void {
    if (!steps || steps.length === 0) {
      this.steps = [buildProgressionStep("")];
    } else {
      this.steps = steps.map((item) => {
        if (typeof item === "string") {
          return buildProgressionStep(item);
        }
        return buildProgressionStep(item.chords || "", item.voicings);
      });
    }
    this.activeStepIndex = 0;
    this.hasConverted = true;
    this.notify();
  }

  public addSet(): number {
    this.steps.push(buildProgressionStep(""));
    this.activeStepIndex = this.steps.length - 1;
    this.notify();
    return this.activeStepIndex;
  }

  public removeSet(): number {
    if (this.steps.length <= 1) return this.activeStepIndex;
    this.steps.splice(this.activeStepIndex, 1);
    if (this.activeStepIndex >= this.steps.length) {
      this.activeStepIndex = this.steps.length - 1;
    }
    this.notify();
    return this.activeStepIndex;
  }

  public switchSet(index: number): boolean {
    if (index < 0 || index >= this.steps.length) return false;
    this.activeStepIndex = index;
    this.notify();
    return true;
  }

  public reset(): void {
    this.steps = [buildProgressionStep("")];
    this.activeStepIndex = 0;
    this.hasConverted = false;
    this.notify();
  }
}

export const trackerStore = new TrackerStore();
