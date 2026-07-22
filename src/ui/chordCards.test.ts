import { convertChordsUI, getCurrentProgressionNotes } from './chordCards';

describe('chordCards module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="outputBox"></div>
      <div id="output"></div>
      <input id="chordsInput" value="Cmaj7 Dm7" />
      <select id="singleChordSelect"></select>
      <button data-box="outputBox"></button>
    `;
  });

  it('convertChordsUI renders chord log rows', () => {
    const mockConvertChords = (input, voicing) => ({
      chords: [
        { root: 'C', type: 'maj7', chordName: 'Cmaj7', intervalOnly: [0, 4, 7, 11], intervalOnlyHex: ['00', '04', '07', '0B'], rootBaked: ['00', '04', '07', '0B'] },
        { root: 'D', type: 'm7', chordName: 'Dm7', intervalOnly: [0, 3, 7, 10], intervalOnlyHex: ['00', '03', '07', '0A'], rootBaked: ['02', '05', '09', '0C'] }
      ],
      uniqueGroups: [
        { chords: ['Cmaj7'], intervalOnlyHex: ['00', '04', '07', '0B'] },
        { chords: ['Dm7'], intervalOnlyHex: ['00', '03', '07', '0A'] }
      ]
    });
    const mockGetVoicing = () => 'closed';
    const mockUpdateDropdown = () => {};
    convertChordsUI(mockConvertChords, mockGetVoicing, mockUpdateDropdown);
    const output = document.getElementById('output');
    expect(output?.innerHTML).toContain('Cmaj7');
    expect(output?.innerHTML).toContain('Dm7');
    expect(output?.innerHTML).toContain('voicing-chip');
  });

  it('getCurrentProgressionNotes returns root-position notes by default', () => {
    const mockConvertChords = () => ({
      chords: [
        { root: 'C', type: 'maj7', chordName: 'Cmaj7', intervalOnly: [0, 4, 7, 11], intervalOnlyHex: ['00', '04', '07', '0B'], rootBaked: ['00', '04', '07', '0B'] },
      ],
      uniqueGroups: [{ chords: ['Cmaj7'], intervalOnlyHex: ['00', '04', '07', '0B'] }],
    });
    convertChordsUI(mockConvertChords, () => 'closed', () => {});
    expect(getCurrentProgressionNotes()).toEqual([[60, 64, 67, 71]]);
  });
});
