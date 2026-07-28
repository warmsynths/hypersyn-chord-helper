import * as core from './core';

describe('core module facade', () => {
  it('should re-export expected functions from submodules', () => {
    expect(typeof core.getMidiRoot).toBe('function');
    expect(typeof core.getValidVoicings).toBe('function');
    expect(typeof core.generateUUID).toBe('function');
    expect(typeof core.getSavedChordSets).toBe('function');
    expect(typeof core.setSavedChordSets).toBe('function');
    expect(typeof core.applyVoicing).toBe('function');
    expect(typeof core.stopChordProgression).toBe('function');
    expect(typeof core.playChordProgression).toBe('function');
    expect(typeof core.semitoneToHex).toBe('function');
    expect(typeof core.parseChordName).toBe('function');
    expect(typeof core.convertChords).toBe('function');
    expect(typeof core.playSingleChordGlobal).toBe('function');
  });

  it('re-exported getMidiRoot returns correct MIDI pitch', () => {
    expect(core.getMidiRoot('C')).toBe(60);
  });

  it('re-exported generateUUID generates a valid string', () => {
    expect(typeof core.generateUUID()).toBe('string');
  });

  it('re-exported convertChords converts chord string', () => {
    const res = core.convertChords('Cmaj7 Dm7 G7', 'closed');
    expect(res.inputChordNames).toContain('Cmaj7');
  });
});
