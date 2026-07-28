import {
  getSavedChordSets,
  setSavedChordSets,
  saveChordSetByName,
  deleteChordSetByIndex,
  exportChordSetsJson,
  importChordSetsJson,
} from './storage';

describe('storage module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getSavedChordSets returns an array and migrates legacy schema', () => {
    localStorage.setItem("hypersynChordSets", JSON.stringify([{ id: "1", name: "Legacy", chords: "C Dm" }]));
    const sets = getSavedChordSets();
    expect(Array.isArray(sets)).toBe(true);
    expect(sets[0].chordSets).toEqual(["C Dm"]);
  });

  it('setSavedChordSets and getSavedChordSets work together', () => {
    const sets = [{ name: 'Test', chords: 'C Dm G7', chordSets: ['C Dm G7'], id: 'abc' }];
    setSavedChordSets(sets);
    expect(getSavedChordSets()).toEqual(sets);
  });

  it('saveChordSetByName adds a new set', () => {
    const { savedSet, sets } = saveChordSetByName('MySet', ['C Dm']);
    expect(savedSet.name).toBe('MySet');
    expect(sets.some(s => s.name === 'MySet')).toBe(true);
  });

  it('deleteChordSetByIndex removes a set', () => {
    setSavedChordSets([{ name: 'DelMe', chords: 'C', chordSets: ['C'], id: '1' }]);
    const { sets, deletedSet } = deleteChordSetByIndex(0);
    expect(deletedSet?.name).toBe('DelMe');
    expect(sets.length).toBe(0);
  });

  it('exportChordSetsJson formats filename and JSON payload', () => {
    const sets = [{ name: 'Jazz Prog', chords: 'Cmaj7', chordSets: ['Cmaj7'], id: '1' }];
    const { filename, json } = exportChordSetsJson(sets, 0);
    expect(filename).toBe('hypersyn-jazzprog.json');
    expect(json).toContain('Cmaj7');
  });

  it('importChordSetsJson parses new presets without duplicating existing IDs', () => {
    setSavedChordSets([{ name: 'Existing', chords: 'C', chordSets: ['C'], id: '1' }]);
    const newJson = JSON.stringify([
      { id: '1', name: 'Existing Duplicate', chords: 'C', chordSets: ['C'] },
      { id: '2', name: 'New Set', chords: 'F', chordSets: ['F'] }
    ]);
    const { addedCount, updatedSets } = importChordSetsJson(newJson);
    expect(addedCount).toBe(1);
    expect(updatedSets.length).toBe(2);
    expect(updatedSets.some(s => s.id === '2')).toBe(true);
  });
});
