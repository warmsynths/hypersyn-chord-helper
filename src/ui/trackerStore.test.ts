import { trackerStore } from './trackerStore';

describe('trackerStore module', () => {
  beforeEach(() => {
    trackerStore.reset();
  });

  it('initializes with single empty set', () => {
    expect(trackerStore.getSetsData()).toEqual([""]);
    expect(trackerStore.getActiveIndex()).toBe(0);
    expect(trackerStore.getActiveSet()).toBe("");
    expect(trackerStore.getHasConverted()).toBe(false);
  });

  it('loadSetsData updates sets and sets active index to 0', () => {
    trackerStore.loadSetsData(["Cmaj7", "Dm7 G7"]);
    expect(trackerStore.getSetsData()).toEqual(["Cmaj7", "Dm7 G7"]);
    expect(trackerStore.getActiveIndex()).toBe(0);
    expect(trackerStore.getActiveSet()).toBe("Cmaj7");
    expect(trackerStore.getHasConverted()).toBe(true);
  });

  it('addSet appends new empty set and switches active index', () => {
    trackerStore.loadSetsData(["C"]);
    const newIdx = trackerStore.addSet();
    expect(newIdx).toBe(1);
    expect(trackerStore.getSetsData()).toEqual(["C", ""]);
    expect(trackerStore.getActiveIndex()).toBe(1);
  });

  it('removeSet deletes active set and adjusts active index', () => {
    trackerStore.loadSetsData(["C", "F", "G"]);
    trackerStore.switchSet(2); // select "G"
    trackerStore.removeSet();
    expect(trackerStore.getSetsData()).toEqual(["C", "F"]);
    expect(trackerStore.getActiveIndex()).toBe(1); // falls back to "F"
  });

  it('updateActiveSet mutates active set string', () => {
    trackerStore.loadSetsData(["C"]);
    trackerStore.updateActiveSet("Cmaj7 Dm7");
    expect(trackerStore.getActiveSet()).toBe("Cmaj7 Dm7");
  });

  it('subscribe triggers notification on state change', () => {
    const listener = jest.fn();
    const unsubscribe = trackerStore.subscribe(listener);
    trackerStore.addSet();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
