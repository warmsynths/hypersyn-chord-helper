import { convertChordsUI, getCurrentProgressionNotes, getCurrentProgressionIntervals } from './chordCards';

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
    expect(output?.innerHTML).toContain('voicing-badge');
    expect(output?.innerHTML).toContain('RC00');
    expect(output?.innerHTML).toContain('RD01');
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

  it('renders true compound interval hex (0E for 9th) in hex boxes and returns true offsets in getCurrentProgressionIntervals', () => {
    const mockConvertChords = () => ({
      chords: [
        {
          root: 'D',
          type: 'm9',
          chordName: 'Dm9',
          intervalOnly: [0, 3, 7, 10, 14],
          intervalOnlyHex: ['00', '03', '07', '0A', '0E'],
        },
      ],
      uniqueGroups: [{ chords: ['Dm9'], intervalOnlyHex: ['00', '03', '07', '0A', '0E'] }],
    });
    convertChordsUI(mockConvertChords, () => 'closed', () => {});

    // Output should contain 0E (not 02!)
    const output = document.getElementById('output');
    expect(output?.innerHTML).toContain('data-copy="0E"');
    expect(output?.innerHTML).toContain('>0E<');

    // Progression intervals must retain true offset 14 (not wrapped to 2)
    expect(getCurrentProgressionIntervals()).toEqual([[0, 3, 7, 10, 14]]);
  });
});
