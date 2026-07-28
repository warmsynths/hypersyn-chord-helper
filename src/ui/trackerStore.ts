type Listener = () => void;

class TrackerStore {
  private chordSetsData: string[] = [""];
  private activeSetIndex = 0;
  private hasConverted = false;
  private listeners: Set<Listener> = new Set();

  /**
   * Subscribes a listener callback to store changes.
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getSetsData(): string[] {
    return [...this.chordSetsData];
  }

  public getActiveIndex(): number {
    return this.activeSetIndex;
  }

  public getActiveSet(): string {
    return this.chordSetsData[this.activeSetIndex] || "";
  }

  public getHasConverted(): boolean {
    return this.hasConverted;
  }

  public setHasConverted(val: boolean): void {
    this.hasConverted = val;
    this.notify();
  }

  public loadSetsData(sets: string[]): void {
    if (!sets || sets.length === 0) {
      this.chordSetsData = [""];
    } else {
      this.chordSetsData = [...sets];
    }
    this.activeSetIndex = 0;
    this.hasConverted = true;
    this.notify();
  }

  public updateActiveSet(content: string): void {
    if (this.activeSetIndex >= 0 && this.activeSetIndex < this.chordSetsData.length) {
      this.chordSetsData[this.activeSetIndex] = content;
      this.notify();
    }
  }

  public addSet(): number {
    this.chordSetsData.push("");
    this.activeSetIndex = this.chordSetsData.length - 1;
    this.notify();
    return this.activeSetIndex;
  }

  public removeSet(): number {
    if (this.chordSetsData.length <= 1) return this.activeSetIndex;
    this.chordSetsData.splice(this.activeSetIndex, 1);
    if (this.activeSetIndex >= this.chordSetsData.length) {
      this.activeSetIndex = this.chordSetsData.length - 1;
    }
    this.notify();
    return this.activeSetIndex;
  }

  public switchSet(index: number): boolean {
    if (index < 0 || index >= this.chordSetsData.length) return false;
    this.activeSetIndex = index;
    this.notify();
    return true;
  }

  public reset(): void {
    this.chordSetsData = [""];
    this.activeSetIndex = 0;
    this.hasConverted = false;
    this.notify();
  }
}

export const trackerStore = new TrackerStore();
