import * as core from './core';

describe('core module', () => {
  it('should export functions', () => {
    expect(typeof core.getMidiRoot).toBe('function');
    expect(typeof core.getValidVoicings).toBe('function');
    expect(typeof core.generateUUID).toBe('function');
    expect(typeof core.exportChordSets).toBe('function');
    expect(typeof core.importChordSets).toBe('function');
    expect(typeof core.toggleVideoBg).toBe('function');
    expect(typeof core.showToast).toBe('function');
    expect(typeof core.getSavedChordSets).toBe('function');
    expect(typeof core.setSavedChordSets).toBe('function');
    expect(typeof core.updateSavedChordSetsDropdown).toBe('function');
    expect(typeof core.saveChordSet).toBe('function');
    expect(typeof core.loadChordSet).toBe('function');
    expect(typeof core.deleteChordSet).toBe('function');
    expect(typeof core.applyVoicing).toBe('function');
    expect(typeof core.stopChordProgression).toBe('function');
    expect(typeof core.playChordProgression).toBe('function');
    expect(typeof core.semitoneToHex).toBe('function');
    expect(typeof core.parseChordName).toBe('function');
    expect(typeof core.convertChords).toBe('function');
    expect(typeof core.playSingleChordGlobal).toBe('function');
  });

  it('generateUUID returns a string', () => {
    const uuid = core.generateUUID();
    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBeGreaterThan(0);
  });

  it('showToast does not throw', () => {
    document.body.innerHTML = '<div id="toastContainer"></div>';
    expect(() => core.showToast('Hello', 'info')).not.toThrow();
  });

  // Add more specific tests for other functions as needed
});
