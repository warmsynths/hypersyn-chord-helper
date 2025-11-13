import {
  getMidiRoot,
  getValidVoicings,
  applyVoicing,
  semitoneToHex,
  parseChordName,
  convertChords
} from './chords';

describe('chords module', () => {
  it('getMidiRoot returns correct MIDI number', () => {
    expect(getMidiRoot('C')).toBe(60);
    expect(getMidiRoot('G')).toBe(67);
    expect(getMidiRoot('Bb')).toBe(70);
  });

  it('getValidVoicings returns array of voicing options', () => {
    const triad = [0, 4, 7];
    const voicings = getValidVoicings(triad);
    expect(Array.isArray(voicings)).toBe(true);
    expect(voicings.some(v => v.value === 'closed')).toBe(true);
  });

  it('applyVoicing returns transformed intervals', () => {
    const triad = [0, 4, 7];
    const drop2 = applyVoicing(triad, 'drop2');
    expect(Array.isArray(drop2)).toBe(true);
  });

  it('semitoneToHex returns hex string', () => {
    expect(semitoneToHex(0)).toBe('00');
    expect(semitoneToHex(11)).toBe('0B');
    expect(semitoneToHex(12)).toBe('00');
  });

  it('parseChordName parses valid chord', () => {
    const chord = parseChordName('Cmaj7');
    expect(chord).toBeTruthy();
    expect(chord.root).toBe('C');
    expect(chord.type).toMatch(/maj7/i);
    expect(Array.isArray(chord.intervalOnly)).toBe(true);
  });

  it('convertChords returns structured result', () => {
    const result = convertChords('Cmaj7 Dm7', 'closed');
    expect(result).toHaveProperty('chords');
    expect(Array.isArray(result.chords)).toBe(true);
    expect(result.chords.length).toBeGreaterThan(0);
  });
});
