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

  it('applyVoicing keeps E7 near visible register', () => {
    const voiced = applyVoicing([0, 4, 7, 10], 'closed', {
      root: 'E',
      type: '7'
    });
    expect(voiced.some(v => v >= -4 && v <= 20)).toBe(true);
  });

  it('semitoneToHex returns hex string', () => {
    expect(semitoneToHex(0)).toBe('00');
    expect(semitoneToHex(11)).toBe('0B');
    expect(semitoneToHex(12)).toBe('0C');
    expect(semitoneToHex(14)).toBe('0E');
    expect(semitoneToHex(17)).toBe('11');
    expect(semitoneToHex(21)).toBe('15');
    expect(semitoneToHex(-12)).toBe('F4');
  });

  it('parseChordName parses valid chord', () => {
    const chord = parseChordName('Cmaj7');
    expect(chord).toBeTruthy();
    expect(chord.root).toBe('C');
    expect(chord.type).toMatch(/maj7/i);
    expect(Array.isArray(chord.intervalOnly)).toBe(true);
  });

  it('parseChordName handles common aliases and casing', () => {
    expect(parseChordName('cmin7')).toBeTruthy();
    expect(parseChordName('CΔ7')).toBeTruthy();
    expect(parseChordName('Bø7')).toBeTruthy();
    expect(parseChordName('C♯m7')).toBeTruthy();
    expect(parseChordName('E(7)')).toBeTruthy();
    expect(parseChordName('C(maj7)')).toBeTruthy();

    // Test uppercase B accidental and capitalized qualities
    const bbm7 = parseChordName('BBm7');
    expect(bbm7).toBeTruthy();
    expect(bbm7.root).toBe('Bb');
    expect(bbm7.type).toBe('m7');

    const csDim = parseChordName('C#Dim');
    expect(csDim).toBeTruthy();
    expect(csDim.root).toBe('C#');
    expect(csDim.type).toBe('dim');

    const ebmaj7 = parseChordName('EBmaj7');
    expect(ebmaj7).toBeTruthy();
    expect(ebmaj7.root).toBe('Eb');
    expect(ebmaj7.type).toBe('maj7');
  });

  it('parseChordName returns null for unsupported token', () => {
    expect(parseChordName('Hmaj7')).toBeNull();
    expect(parseChordName('Cwhatever')).toBeNull();
  });

  it('convertChords returns structured result', () => {
    const result = convertChords('Cmaj7 Dm7', 'closed');
    expect(result).toHaveProperty('chords');
    expect(Array.isArray(result.chords)).toBe(true);
    expect(result.chords.length).toBeGreaterThan(0);
  });

  it('convertChords keeps valid mixed-symbol chords', () => {
    const result = convertChords('cmin7 CΔ7 Bø7 C♯m7 nope', 'closed');
    expect(result.chords.length).toBe(4);
  });

  it('convertChords assigns matching intervalId to chords with identical interval shapes', () => {
    const result = convertChords('Am7 Dm7 G7 Am7', 'closed');
    expect(result.chords[0].intervalId).toBe('00');
    expect(result.chords[1].intervalId).toBe('00');
    expect(result.chords[2].intervalId).toBe('01');
    expect(result.chords[3].intervalId).toBe('00');
    expect(result.uniqueGroups[0].intervalId).toBe('00');
    expect(result.uniqueGroups[1].intervalId).toBe('01');
  });

  it('preserves compound intervals (9th, 11th, 13th) in intervalOnlyHex without modulo-12 truncation', () => {
    const dm9 = parseChordName('Dm9');
    expect(dm9).toBeTruthy();
    expect(dm9?.intervalOnly).toEqual([0, 3, 7, 10, 14]);
    // 14 semitones should be '0E', NOT '02'
    expect(dm9?.intervalOnlyHex).toEqual(['00', '03', '07', '0A', '0E']);

    const g13 = parseChordName('G13');
    expect(g13).toBeTruthy();
    expect(g13?.intervalOnly).toEqual([0, 4, 7, 10, 14, 21]);
    // 14 -> '0E', 21 -> '15', NOT '02' and '09'
    expect(g13?.intervalOnlyHex).toEqual(['00', '04', '07', '0A', '0E', '15']);

    const converted = convertChords('Dm9 G13', 'closed');
    expect(converted.chords[0].intervalOnlyHex).toEqual(['00', '03', '07', '0A', '0E']);
    expect(converted.chords[1].intervalOnlyHex).toEqual(['00', '04', '07', '0A', '0E', '15']);
  });
});
