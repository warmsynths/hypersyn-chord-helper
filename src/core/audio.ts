import { parseChordName, applyVoicing, getMidiRoot } from "./chords";

/**
 * Module-scoped audio state for managing active oscillators, gain nodes, audio context, and FX.
 */
let _activeOscillators: OscillatorNode[] = [];
let _activeGains: GainNode[] = [];
let _hypersynAudioCtx: AudioContext | null = null;
let _hypersynFxBus: { ctx: AudioContext; input: GainNode } | null = null;
let _loopTimeout: any = null;
let _endTimeout: any = null;

/**
 * Builds (once per AudioContext) the shared Juno-60-style pad effects bus:
 * a chorus (LFO-modulated delay, dry/wet mixed) feeding a short plate-style
 * reverb. Every voice's amp envelope connects into `bus.input`.
 */
function getJuno60FxBus(ctx: AudioContext): { ctx: AudioContext; input: GainNode } {
  if (_hypersynFxBus && _hypersynFxBus.ctx === ctx) return _hypersynFxBus;

  const input = ctx.createGain();
  input.gain.value = 1;

  // --- Chorus: classic Juno-style LFO-modulated short delay, dry/wet mixed ---
  const chorusDelay = ctx.createDelay(0.05);
  chorusDelay.delayTime.value = 0.014;
  const chorusLfo = ctx.createOscillator();
  chorusLfo.type = "sine";
  chorusLfo.frequency.value = 0.4;
  const chorusDepth = ctx.createGain();
  chorusDepth.gain.value = 0.004; // seconds of delay-time modulation
  chorusLfo.connect(chorusDepth).connect(chorusDelay.delayTime);
  chorusLfo.start();

  const chorusWet = ctx.createGain();
  chorusWet.gain.value = 0.35;

  const dryWetMix = ctx.createGain();
  input.connect(dryWetMix);
  input.connect(chorusDelay);
  chorusDelay.connect(chorusWet).connect(dryWetMix);

  // --- Reverb: short exponential-decay impulse ---
  const reverbLength = Math.floor(ctx.sampleRate * 1.4);
  const impulse = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c);
    for (let i = 0; i < reverbLength; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 3);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;

  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.16;

  dryWetMix.connect(ctx.destination);
  dryWetMix.connect(convolver).connect(reverbWet).connect(ctx.destination);

  _hypersynFxBus = { ctx, input };
  return _hypersynFxBus;
}

/**
 * Starts one Juno-60-style pad voice (two detuned sawtooth oscillators + lowpass filter).
 */
function playJuno60PadVoice(
  ctx: AudioContext,
  midi: number,
  time: number,
  duration: number,
  volume: number,
  fxInput: GainNode
): { oscillators: OscillatorNode[]; gain: GainNode } {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  filter.Q.value = 0.7;

  const attack = 0.04;
  const release = 1.2;
  gain.gain.setValueAtTime(0.0, time);
  gain.gain.linearRampToValueAtTime(volume, time + attack);
  gain.gain.setValueAtTime(volume, time + duration - release);
  gain.gain.linearRampToValueAtTime(0.0, time + duration);

  filter.connect(gain).connect(fxInput);

  const oscillators = [-7, 7].map((detune) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(filter);
    osc.start(time);
    osc.stop(time + duration);
    return osc;
  });

  return { oscillators, gain };
}

/**
 * Stops all active audio playback and clears timeouts.
 */
export const stopChordProgression = (): void => {
  if (_loopTimeout) {
    clearTimeout(_loopTimeout);
    _loopTimeout = null;
  }
  if (_endTimeout) {
    clearTimeout(_endTimeout);
    _endTimeout = null;
  }
  if (_activeOscillators && _activeOscillators.length) {
    _activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    _activeOscillators = [];
  }
  if (_activeGains && _activeGains.length) {
    _activeGains.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {}
    });
    _activeGains = [];
  }
};

export const stopAllAudio = stopChordProgression;

/**
 * Plays a chord progression.
 * Accepts either an array of MIDI note arrays (`number[][]`) or a raw chord string.
 */
export const playChordProgression = (
  input?: number[][] | string | null,
  loop = false,
  onEnd: (() => void) | null = null,
  voicing = "closed"
): void => {
  if (!input) {
    if (onEnd) onEnd();
    return;
  }

  let chordNotesArray: number[][] = [];

  if (typeof input === "string") {
    console.log("Play button clicked");
    console.log("Chord input value:", input);
    const chordNames = input.split(/\s|,/).filter((s) => s.length > 0);
    const parsed = chordNames.map(parseChordName).filter((c) => c !== null);
    if (parsed.length === 0) {
      console.warn("No valid chords parsed from input.");
      if (onEnd) onEnd();
      return;
    }

    chordNotesArray = parsed.map((chord) => {
      const rootMidi = getMidiRoot(chord.root);
      const intervals = applyVoicing(chord.intervalOnly || [], voicing, chord);
      return intervals.map((semi) => rootMidi + semi);
    });
  } else if (Array.isArray(input)) {
    chordNotesArray = input;
  }

  if (chordNotesArray.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  const ctx =
    _hypersynAudioCtx ||
    new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
  _hypersynAudioCtx = ctx;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const fxBus = getJuno60FxBus(ctx);
  let time = ctx.currentTime;
  const chordDuration = 2.5;

  stopChordProgression();

  const volume = 0.05;
  _activeOscillators = [];
  _activeGains = [];

  chordNotesArray.forEach((notes) => {
    notes.forEach((midi) => {
      if (!isFinite(midi)) return;
      console.log("Oscillator created", { freq: 440 * Math.pow(2, (midi - 69) / 12), midi });
      const voice = playJuno60PadVoice(ctx, midi, time, chordDuration, volume, fxBus.input);
      _activeOscillators.push(...voice.oscillators);
      _activeGains.push(voice.gain);
    });
    time += chordDuration;
  });

  const totalDuration = chordDuration * chordNotesArray.length;

  if (loop) {
    _loopTimeout = setTimeout(() => {
      playChordProgression(chordNotesArray, loop, onEnd, voicing);
    }, totalDuration * 1000);
  } else {
    _endTimeout = setTimeout(() => {
      if (onEnd) onEnd();
    }, totalDuration * 1000);
  }
};

/**
 * Plays a single chord object or array of MIDI notes.
 */
export const playSingleChordGlobal = (
  chord: any,
  voicing = "closed"
): void => {
  if (!chord) return;
  let notes: number[] = [];

  if (Array.isArray(chord)) {
    notes = chord;
  } else if (chord.root && Array.isArray(chord.intervalOnly)) {
    const rootMidi = getMidiRoot(chord.root);
    const intervals = applyVoicing(chord.intervalOnly, voicing, chord);
    notes = intervals.map((semi) => rootMidi + semi);
  }

  if (notes.length === 0) return;

  const ctx =
    _hypersynAudioCtx ||
    new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
  _hypersynAudioCtx = ctx;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const fxBus = getJuno60FxBus(ctx);
  stopChordProgression();

  const volume = 0.05;
  const time = ctx.currentTime;
  const chordDuration = 2.5;

  _activeOscillators = [];
  _activeGains = [];

  notes.forEach((midi) => {
    if (!isFinite(midi)) return;
    const voice = playJuno60PadVoice(ctx, midi, time, chordDuration, volume, fxBus.input);
    _activeOscillators.push(...voice.oscillators);
    _activeGains.push(voice.gain);
  });
};
