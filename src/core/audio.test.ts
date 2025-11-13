// Mock AudioContext for Jest (Node/jsdom)
const mockNode = {
  connect: function () { return this; },
  start: () => {},
  stop: () => {},
  type: "",
  frequency: { value: 0 },
  detune: { value: 0 },
  gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
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
    createBiquadFilter() { return Object.create(mockNode); }
    createConvolver() { return Object.create(mockNode); }
    createBuffer() { return { getChannelData: () => new Float32Array(1) }; }
    get currentTime() { return 0; }
    get sampleRate() { return 44100; }
    get destination() { return Object.create(mockNode); }
  } as any;
  // Optionally: global.webkitAudioContext = global.AudioContext;
});

beforeEach(() => {
  document.body.innerHTML = `
    <input id="chordsInput" value="C" />
    <input id="volumeSlider" value="50" />
  `;
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

  it('playChordProgression does not throw', () => {
    expect(() => audio.playChordProgression()).not.toThrow();
  });

  it('playSingleChordGlobal does not throw with minimal input', () => {
    expect(() => audio.playSingleChordGlobal({ root: 'C', intervalOnly: [0, 4, 7], chordName: 'Cmaj' })).not.toThrow();
  });
});
