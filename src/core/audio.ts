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
 * Builds (once per AudioContext) the shared Roland Juno-60 pad effects bus:
 * - True stereo biphase chorus (Chorus II: dual modulated delay lines with 180-deg phase offset)
 * - Warm diffuse plate/hall reverb with frequency-dependent damping and lowpass filtering
 * - Master optical-style compressor/limiter to glue chords and prevent digital clipping
 */
function getJuno60FxBus(ctx: AudioContext): { ctx: AudioContext; input: GainNode } {
  if (_hypersynFxBus && _hypersynFxBus.ctx === ctx) return _hypersynFxBus;

  const input = ctx.createGain();
  input.gain.value = 1;

  // --- Output Stage: Dynamics Compressor / Limiter ---
  let outputStage: AudioNode = ctx.destination;
  if (typeof ctx.createDynamicsCompressor === "function") {
    try {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -8;
      comp.knee.value = 12;
      comp.ratio.value = 3;
      comp.attack.value = 0.02;
      comp.release.value = 0.25;
      comp.connect(ctx.destination);
      outputStage = comp;
    } catch {
      outputStage = ctx.destination;
    }
  }

  // --- True Stereo Juno Biphase Chorus (Chorus II) ---
  // In a real Juno, Left and Right delays (~16ms base) are modulated out-of-phase by an LFO.
  // This produces wide dimensional stereo movement without mono comb-filtering notches.
  const delayL = ctx.createDelay(0.05);
  delayL.delayTime.value = 0.016;
  const delayR = ctx.createDelay(0.05);
  delayR.delayTime.value = 0.016;

  const chorusLfo = ctx.createOscillator();
  chorusLfo.type = "sine";
  chorusLfo.frequency.value = 0.55; // Classic Juno-60 chorus rate (~0.55 Hz)

  const depthL = ctx.createGain();
  depthL.gain.value = 0.0022; // +2.2ms delay modulation

  const depthR = ctx.createGain();
  depthR.gain.value = -0.0022; // -2.2ms inverted phase modulation

  chorusLfo.connect(depthL).connect(delayL.delayTime);
  chorusLfo.connect(depthR).connect(delayR.delayTime);
  try {
    chorusLfo.start();
  } catch {}

  const dryL = ctx.createGain();
  dryL.gain.value = 0.68;
  const dryR = ctx.createGain();
  dryR.gain.value = 0.68;

  const wetL = ctx.createGain();
  wetL.gain.value = 0.52;
  const wetR = ctx.createGain();
  wetR.gain.value = 0.52;

  let chorusOutput: AudioNode;

  if (typeof ctx.createChannelMerger === "function") {
    try {
      const merger = ctx.createChannelMerger(2);
      // Left channel mix
      input.connect(dryL).connect(merger, 0, 0);
      input.connect(delayL).connect(wetL).connect(merger, 0, 0);
      // Right channel mix
      input.connect(dryR).connect(merger, 0, 1);
      input.connect(delayR).connect(wetR).connect(merger, 0, 1);
      chorusOutput = merger;
    } catch {
      // Fallback if merger throws in certain environments
      const fallback = ctx.createGain();
      input.connect(fallback);
      input.connect(delayL).connect(wetL).connect(fallback);
      chorusOutput = fallback;
    }
  } else {
    const fallback = ctx.createGain();
    input.connect(fallback);
    input.connect(delayL).connect(wetL).connect(fallback);
    chorusOutput = fallback;
  }

  // --- Reverb: Warm Plate/Hall with High-Frequency Absorption ---
  const reverbLength = Math.floor(ctx.sampleRate * 2.2);
  const impulse = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c);
    let lastSample = 0;
    for (let i = 0; i < reverbLength; i++) {
      const progress = i / reverbLength;
      // Exponential envelope decay
      const envelope = Math.exp(-progress * 3.4);
      // Lowpass smoothing that dampens highs as sound travels (air absorption)
      const damp = Math.max(0.04, 0.38 * (1 - progress * 0.85));
      const white = Math.random() * 2 - 1;
      lastSample = lastSample * (1 - damp) + white * damp;
      channel[i] = lastSample * envelope;
    }
  }

  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;

  // Darkening lowpass filter on reverb return to remove metallic sizzle
  const reverbFilter = ctx.createBiquadFilter();
  reverbFilter.type = "lowpass";
  reverbFilter.frequency.value = 2200;
  reverbFilter.Q.value = 0.6;

  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.24;

  // Connect dry chorus output to main bus output
  chorusOutput.connect(outputStage);
  // Send chorus output into warm diffuse reverb
  chorusOutput.connect(convolver).connect(reverbFilter).connect(reverbWet).connect(outputStage);

  _hypersynFxBus = { ctx, input };
  return _hypersynFxBus;
}

/**
 * Starts one Juno-60-style pad voice:
 * - Dual detuned sawtooth oscillators (-4 cents, +4 cents) for warm chorus shimmer
 * - Sub-oscillator (square wave, 1 octave below fundamental) for fat analog weight
 * - Warm body oscillator (triangle wave) for velvety harmonic depth
 * - Juno HPF filter at 35 Hz to eliminate sub-bass rumble
 * - Dual-stage 24dB/oct resonant lowpass filter with dynamic cutoff envelope (IR3109 VCF)
 * - Soft blooming pad envelope (0.48s attack swell, gentle sustain, silky release)
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

  // --- Highpass Filter (models Juno HPF slider) ---
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 35;
  hpf.Q.value = 0.7;

  // --- Dual-Stage 24dB/oct Lowpass Filter (models Roland IR3109 4-pole VCF) ---
  const vcf1 = ctx.createBiquadFilter();
  vcf1.type = "lowpass";
  vcf1.Q.value = 1.35;

  const vcf2 = ctx.createBiquadFilter();
  vcf2.type = "lowpass";
  vcf2.Q.value = 1.35;

  // --- Filter Envelope & Keytracking ---
  // Lower notes stay deep and rounded; higher notes open up with airy warmth
  const keyTrack = Math.pow(freq / 261.63, 0.35);
  const startCutoff = Math.max(220, Math.min(620, 380 * keyTrack));
  const peakCutoff = Math.max(550, Math.min(2400, 1380 * keyTrack));
  const sustainCutoff = Math.max(380, Math.min(1800, 960 * keyTrack));
  const endCutoff = Math.max(160, 260 * keyTrack);

  const attackTime = 0.48;
  const decayTime = 0.75;
  const releaseTime = 1.3;

  [vcf1, vcf2].forEach((filter) => {
    filter.frequency.setValueAtTime(startCutoff, time);
    if (typeof filter.frequency.linearRampToValueAtTime === "function") {
      filter.frequency.linearRampToValueAtTime(peakCutoff, time + attackTime);
      filter.frequency.linearRampToValueAtTime(sustainCutoff, time + attackTime + decayTime);
      const releaseStart = Math.max(time + attackTime + decayTime, time + duration - releaseTime);
      filter.frequency.setValueAtTime(sustainCutoff, releaseStart);
      filter.frequency.linearRampToValueAtTime(endCutoff, time + duration);
    }
  });

  // --- Voice Amp Envelope (VCA) ---
  const voiceGain = ctx.createGain();
  const peakVolume = volume;
  const sustainVolume = volume * 0.82;

  voiceGain.gain.setValueAtTime(0.0001, time);
  if (typeof voiceGain.gain.linearRampToValueAtTime === "function") {
    voiceGain.gain.linearRampToValueAtTime(peakVolume, time + attackTime);
    voiceGain.gain.linearRampToValueAtTime(sustainVolume, time + attackTime + decayTime);
    const releaseStart = Math.max(time + attackTime + decayTime, time + duration - releaseTime);
    voiceGain.gain.setValueAtTime(sustainVolume, releaseStart);
    voiceGain.gain.linearRampToValueAtTime(0.0001, time + duration);
  }

  // Chain: HPF -> VCF1 -> VCF2 -> Amp Envelope -> FX Bus Input
  hpf.connect(vcf1).connect(vcf2).connect(voiceGain).connect(fxInput);

  // --- Oscillators: DCO Multi-Core ---
  // 1. Primary Sawtooth (-4 cents)
  const saw1 = ctx.createOscillator();
  saw1.type = "sawtooth";
  saw1.frequency.value = freq;
  saw1.detune.value = -4;
  const saw1Gain = ctx.createGain();
  saw1Gain.gain.value = 0.46;
  saw1.connect(saw1Gain).connect(hpf);

  // 2. Secondary Sawtooth (+4 cents)
  const saw2 = ctx.createOscillator();
  saw2.type = "sawtooth";
  saw2.frequency.value = freq;
  saw2.detune.value = 4;
  const saw2Gain = ctx.createGain();
  saw2Gain.gain.value = 0.46;
  saw2.connect(saw2Gain).connect(hpf);

  // 3. Sub-Oscillator (Square wave 1 octave down: freq / 2)
  const subOsc = ctx.createOscillator();
  subOsc.type = "square";
  subOsc.frequency.value = freq / 2;
  const subGain = ctx.createGain();
  subGain.gain.value = 0.32;
  subOsc.connect(subGain).connect(hpf);

  // 4. Warm Body Oscillator (Triangle wave at fundamental)
  const warmBody = ctx.createOscillator();
  warmBody.type = "triangle";
  warmBody.frequency.value = freq;
  const warmGain = ctx.createGain();
  warmGain.gain.value = 0.28;
  warmBody.connect(warmGain).connect(hpf);

  const oscillators = [saw1, saw2, subOsc, warmBody];
  oscillators.forEach((osc) => {
    try {
      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  });

  return { oscillators, gain: voiceGain };
}

/**
 * Stops all active audio playback and clears timeouts.
 * Ramps active gains down quickly to avoid abrupt clicks.
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
  if (_activeGains && _activeGains.length) {
    _activeGains.forEach((gain) => {
      try {
        if (_hypersynAudioCtx && typeof gain.gain.linearRampToValueAtTime === "function") {
          gain.gain.setValueAtTime(gain.gain.value, _hypersynAudioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.0001, _hypersynAudioCtx.currentTime + 0.04);
          setTimeout(() => {
            try {
              gain.disconnect();
            } catch {}
          }, 50);
        } else {
          gain.disconnect();
        }
      } catch {}
    });
    _activeGains = [];
  }
  if (_activeOscillators && _activeOscillators.length) {
    _activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    _activeOscillators = [];
  }
};

export const stopAllAudio = stopChordProgression;

/**
 * Plays a chord progression.
 * Accepts either an array of MIDI note arrays (`number[][]`) or a raw chord string.
 * Chords in a progression crossfade smoothly into each other using legato voice overlap.
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
  const chordStepDuration = 2.4;
  // Allow pad voices to release across the start of the next chord for seamless legato overlap
  const voiceDuration = chordNotesArray.length > 1 ? chordStepDuration + 0.8 : 3.2;

  stopChordProgression();

  const volume = 0.055;
  _activeOscillators = [];
  _activeGains = [];

  chordNotesArray.forEach((notes) => {
    notes.forEach((midi) => {
      if (!isFinite(midi)) return;
      const voice = playJuno60PadVoice(ctx, midi, time, voiceDuration, volume, fxBus.input);
      _activeOscillators.push(...voice.oscillators);
      _activeGains.push(voice.gain);
    });
    time += chordStepDuration;
  });

  const totalDuration = chordStepDuration * chordNotesArray.length;

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
 * Plays a single chord object or array of MIDI notes with full sustained Juno pad bloom.
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

  const volume = 0.055;
  const time = ctx.currentTime;
  const chordDuration = 3.2;

  _activeOscillators = [];
  _activeGains = [];

  notes.forEach((midi) => {
    if (!isFinite(midi)) return;
    const voice = playJuno60PadVoice(ctx, midi, time, chordDuration, volume, fxBus.input);
    _activeOscillators.push(...voice.oscillators);
    _activeGains.push(voice.gain);
  });
};

