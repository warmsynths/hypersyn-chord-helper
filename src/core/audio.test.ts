const mockNode = {
  connect: function () { return this; },
  start: () => {},
  stop: () => {},
  type: "",
  frequency: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
  detune: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
  delayTime: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
  gain: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
  threshold: { value: 0 },
  knee: { value: 0 },
  ratio: { value: 0 },
  attack: { value: 0 },
  release: { value: 0 },
  Q: { value: 0 },
  buffer: null,
  disconnect: () => {},
};

beforeAll(() => {
  global.AudioContext = class {
    constructor() {}
    get state() { return "running"; }
    resume() {}
    createOscillator() { return Object.create(mockNode); }
    createGain() { return Object.create(mockNode); }
    createDelay() { return Object.create(mockNode); }
    createBiquadFilter() { return Object.create(mockNode); }
    createConvolver() { return Object.create(mockNode); }
    createChannelMerger() { return Object.create(mockNode); }
    createChannelSplitter() { return Object.create(mockNode); }
    createDynamicsCompressor() { return Object.create(mockNode); }
    createBuffer() { return { getChannelData: () => new Float32Array(10) }; }
    get currentTime() { return 0; }
    get sampleRate() { return 44100; }
    get destination() { return Object.create(mockNode); }
  } as any;
});

import * as audio from './audio';

describe('audio module', () => {
  it('should export expected functions', () => {
    expect(typeof audio.stopChordProgression).toBe('function');
    expect(typeof audio.playChordProgression).toBe('function');
    expect(typeof audio.playSingleChordGlobal).toBe('function');
  });

  it('stopChordProgression does not throw', () => {
    expect(() => audio.stopChordProgression()).not.toThrow();
  });

  it('playChordProgression accepts string input and plays without error', () => {
    expect(() => audio.playChordProgression('Cmaj7 Dm7 G7')).not.toThrow();
  });

  it('playChordProgression accepts MIDI note arrays directly', () => {
    expect(() => audio.playChordProgression([[60, 64, 67, 71], [62, 65, 69, 72]])).not.toThrow();
  });

  it('playSingleChordGlobal handles chord object correctly', () => {
    expect(() => audio.playSingleChordGlobal({ root: 'C', intervalOnly: [0, 4, 7], chordName: 'C' })).not.toThrow();
  });
});
