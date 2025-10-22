
// --- Audio state (module scoped) ---
let _activeOscillators = [];
let _activeGains = [];
let _hypersynAudioCtx = null;
let _hypersynReverb = null;

import { parseChordName, applyVoicing } from './chords.js';

/**
 * Stops all currently playing oscillators and disconnects gain nodes.
 * @function
 */
export function stopChordProgression() {
	if (_activeOscillators && _activeOscillators.length) {
		_activeOscillators.forEach((osc) => {
			try {
				osc.stop();
			} catch (e) {}
		});
		_activeOscillators = [];
	}
	if (_activeGains && _activeGains.length) {
		_activeGains.forEach((gain) => {
			try {
				gain.disconnect();
			} catch (e) {}
		});
		_activeGains = [];
	}
}

/**
 * Plays the input chord progression as block chords using the Web Audio API.
 * Each chord is played for 2.5 seconds as a synth pad.
 * @function
 */
export function playChordProgression() {
	const input = document.getElementById("chordsInput").value;
	const chordNames = input.split(/\s|,/).filter((s) => s.length > 0);
	const parsed = chordNames.map(parseChordName).filter((c) => c !== null);
	if (parsed.length === 0) return;

	// MIDI note numbers for C4 = 60
	// MIDI note numbers for C3 = 48 (one octave lower)
	const ROOTS = {
		C: 48,
		"C#": 49,
		Db: 49,
		D: 50,
		"D#": 51,
		Eb: 51,
		E: 52,
		F: 53,
		"F#": 54,
		Gb: 54,
		G: 55,
		"G#": 56,
		Ab: 56,
		A: 57,
		"A#": 58,
		Bb: 58,
		B: 59,
	};

	// Web Audio setup
	const ctx =
		_hypersynAudioCtx ||
		new (globalThis.AudioContext || globalThis.webkitAudioContext)();
	_hypersynAudioCtx = ctx;
	// iOS fix: resume context if suspended
	if (ctx.state === "suspended") {
		ctx.resume();
	}

	// --- Simple Reverb Setup ---
	if (!_hypersynReverb) {
		// Create impulse response for reverb (simple exponential decay)
		const length = ctx.sampleRate * 2.5; // 2.5s reverb tail
		const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
		for (let c = 0; c < 2; c++) {
			const channel = impulse.getChannelData(c);
			for (let i = 0; i < length; i++) {
				channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
			}
		}
		const convolver = ctx.createConvolver();
		convolver.buffer = impulse;
		_hypersynReverb = convolver;
	}
	const reverb = _hypersynReverb;

	let time = ctx.currentTime;
	const chordDuration = 2.5; // slower pad, longer chords

	stopChordProgression(); // Stop any previous notes
	const volume =
		parseInt(document.getElementById("volumeSlider").value, 10) / 100;
	_activeOscillators = [];
	_activeGains = [];
	// Get voicing from UI (default to 'closed')
	const voicing =
		typeof getSelectedVoicing === "function" ? getSelectedVoicing() : "closed";
	parsed.forEach((chord) => {
		let rootMidi = ROOTS[chord.root] || 60;
		if (!isFinite(rootMidi)) rootMidi = 60;
		let intervals = Array.isArray(chord.intervalOnly)
			? chord.intervalOnly.filter((x) => typeof x === "number" && isFinite(x))
			: [];
		intervals = applyVoicing(intervals, voicing);
		if (intervals.length === 0) {
			console.warn("No intervals for chord:", chord.chordName, chord);
		}
		intervals.forEach((semi) => {
			let midi = rootMidi + semi;
			if (!isFinite(midi)) return;
			let freq = 440 * Math.pow(2, (midi - 69) / 12);
			if (!isFinite(freq)) return;
			let osc = ctx.createOscillator();
			let gain = ctx.createGain();
			let filter = ctx.createBiquadFilter();
			osc.type = "triangle";
			osc.frequency.value = freq;
			osc.detune.value = Math.random() * 10 - 5;
			filter.type = "lowpass";
			filter.frequency.value = 220;
			filter.Q.value = 1.4;
			const attack = 1.0;
			const release = 1.2;
			gain.gain.setValueAtTime(0.0, time);
			gain.gain.linearRampToValueAtTime(volume, time + attack);
			gain.gain.setValueAtTime(volume, time + chordDuration - release);
			gain.gain.linearRampToValueAtTime(0.0, time + chordDuration);
			osc
				.connect(filter)
				.connect(gain)
				.connect(reverb)
				.connect(ctx.destination);
			osc.start(time);
			osc.stop(time + chordDuration);
			_activeOscillators.push(osc);
			_activeGains.push(gain);
		});
		time += chordDuration;
	});
}

/**
 * Plays a single chord object (from parseChordName) as a block chord using the Web Audio API.
 * @param {object} chord - Parsed chord object from parseChordName.
 * @function
 */
export function playSingleChordGlobal(chord) {
	if (!chord || !Array.isArray(chord.intervalOnly)) return;
	// MIDI note numbers for C4 = 60
	// MIDI note numbers for C3 = 48 (one octave lower)
	const ROOTS = {
		C: 48,
		"C#": 49,
		Db: 49,
		D: 50,
		"D#": 51,
		Eb: 51,
		E: 52,
		F: 53,
		"F#": 54,
		Gb: 54,
		G: 55,
		"G#": 56,
		Ab: 56,
		A: 57,
		"A#": 58,
		Bb: 58,
		B: 59,
	};
	const ctx =
		_hypersynAudioCtx ||
		new (globalThis.AudioContext || globalThis.webkitAudioContext)();
	_hypersynAudioCtx = ctx;
	// iOS fix: resume context if suspended
	if (ctx.state === "suspended") {
		ctx.resume();
	}
	// --- Simple Reverb Setup ---
	if (!_hypersynReverb) {
		const length = ctx.sampleRate * 2.5;
		const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
		for (let c = 0; c < 2; c++) {
			const channel = impulse.getChannelData(c);
			for (let i = 0; i < length; i++) {
				channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
			}
		}
		const convolver = ctx.createConvolver();
		convolver.buffer = impulse;
		_hypersynReverb = convolver;
	}
	const reverb = _hypersynReverb;
	stopChordProgression();
	const volume =
		parseInt(document.getElementById("volumeSlider").value, 10) / 100;
	_activeOscillators = [];
	_activeGains = [];
	let rootMidi = ROOTS[chord.root] || 60;
	if (!isFinite(rootMidi)) rootMidi = 60;
	// Get voicing from UI (default to 'closed')
	const voicing =
		typeof getSelectedVoicing === "function" ? getSelectedVoicing() : "closed";
	let intervals = chord.intervalOnly.filter(
		(x) => typeof x === "number" && isFinite(x)
	);
	intervals = applyVoicing(intervals, voicing);
	intervals.forEach((semi) => {
		let midi = rootMidi + semi;
		if (!isFinite(midi)) return;
		let freq = 440 * Math.pow(2, (midi - 69) / 12);
		if (!isFinite(freq)) return;
		let osc = ctx.createOscillator();
		let gain = ctx.createGain();
		let filter = ctx.createBiquadFilter();
		osc.type = "triangle";
		osc.frequency.value = freq;
		osc.detune.value = Math.random() * 10 - 5;
		filter.type = "lowpass";
		filter.frequency.value = 220;
		filter.Q.value = 1.4;
		const time = ctx.currentTime;
		const attack = 1.0;
		const chordDuration = 2.5;
		const release = 1.2;
		gain.gain.setValueAtTime(0.0, time);
		gain.gain.linearRampToValueAtTime(volume, time + attack);
		gain.gain.setValueAtTime(volume, time + chordDuration - release);
		gain.gain.linearRampToValueAtTime(0.0, time + chordDuration);
		osc.connect(filter).connect(gain).connect(reverb).connect(ctx.destination);
		osc.start(time);
		osc.stop(time + chordDuration);
		_activeOscillators.push(osc);
		_activeGains.push(gain);
	});
}
