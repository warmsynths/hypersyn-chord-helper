import {
  getSavedChordSets,
  setSavedChordSets,
  updateSavedChordSetsDropdown,
  saveChordSet,
  loadChordSet,
  deleteChordSet,
  exportChordSets,
  importChordSets
} from './storage';

describe('storage module', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <select id="savedChordSetsSelect"></select>
      <input id="chordsInput" />
      <input id="chordSetNameInput" />
    `;
  });

  it('getSavedChordSets returns an array', () => {
    expect(Array.isArray(getSavedChordSets())).toBe(true);
  });

  it('setSavedChordSets and getSavedChordSets work together', () => {
    const sets = [{ name: 'Test', chords: 'C Dm G7', id: 'abc' }];
    setSavedChordSets(sets);
    expect(getSavedChordSets()).toEqual(sets);
  });

  it('updateSavedChordSetsDropdown populates select', () => {
    setSavedChordSets([{ name: 'Set1', chords: 'C', id: '1' }]);
    updateSavedChordSetsDropdown();
    const select = document.getElementById('savedChordSetsSelect');
    expect(select?.children.length).toBeGreaterThan(0);
  });

  it('saveChordSet adds a new set', () => {
    (document.getElementById('chordsInput') as HTMLInputElement).value = 'C Dm';
    (document.getElementById('chordSetNameInput') as HTMLInputElement).value = 'MySet';
    saveChordSet();
    const sets = getSavedChordSets();
    expect(sets.some(s => s.name === 'MySet')).toBe(true);
  });

  it('loadChordSet loads the correct set', () => {
    setSavedChordSets([{ name: 'LoadMe', chords: 'C', id: '1' }]);
    updateSavedChordSetsDropdown();
    const select = document.getElementById('savedChordSetsSelect') as HTMLSelectElement;
    select.value = '0';
    loadChordSet();
    expect((document.getElementById('chordsInput') as HTMLInputElement).value).toBe('C');
  });

  it('deleteChordSet removes a set', () => {
    setSavedChordSets([{ name: 'DelMe', chords: 'C', id: '1' }]);
    updateSavedChordSetsDropdown();
    const select = document.getElementById('savedChordSetsSelect') as HTMLSelectElement;
    select.value = '0';
    deleteChordSet();
    expect(getSavedChordSets().length).toBe(0);
  });

  // exportChordSets and importChordSets involve file and DOM operations,
  // so they are best tested with integration or manual tests.
});
