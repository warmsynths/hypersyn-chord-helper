
import { getMidiRoot, getValidVoicings, semitoneToHex, applyVoicing } from '../core/chords.js';
import { showToast } from './toast.js';

// State for last rendered chord objects
let lastChordObjs = [];

export function convertChordsUI(convertChords, getSelectedVoicing, updateSingleChordDropdown) {
	document.getElementById("outputBox").style.display = "block";
	const outputBtn = document.querySelector('button[data-box="outputBox"]');
	if (outputBtn) outputBtn.innerHTML = outputBtn.innerHTML.replace("▶", "▼");

	const input = document.getElementById("chordsInput").value;
	const chordNames = input.split(/[\s,]+/).filter((s) => s.length > 0);
	updateSingleChordDropdown(chordNames);
	const voicing = getSelectedVoicing();
	const result = convertChords(input, voicing);
	let outputHTML = "";
	if (result.chords && result.chords.length > 0) {
		lastChordObjs = result.chords;
		const chordNumMap = {};
		result.uniqueGroups.forEach((group, idx) => {
			group.chords.forEach((chordName) => {
				chordNumMap[chordName] = idx.toString().padStart(2, "0");
			});
		});
		outputHTML +=
			'<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">';
		result.chords.forEach((chord, i) => {
			chord.midiRoot = getMidiRoot(chord.root);
			const intervalHexSpans = chord.intervalOnlyHex
				.map(
					(hex, idx) =>
						`<span${idx >= 6 ? ' class="dimmed"' : ""}>${hex}</span>`
				)
				.join(" ");
			const rootBakedSpans = chord.rootBaked
				.map(
					(hex, idx) =>
						`<span${idx >= 6 ? ' class="dimmed"' : ""}>${hex}</span>`
				)
				.join(" ");
			const chordNum = chordNumMap[chord.chordName] || "--";
			const voicingOptions = getValidVoicings(chord.intervalOnly);
			const voicingSelect = `<select class="chord-voicing-select mb-2 p-1 rounded border border-gray-300 bg-gray-800 text-blue-200 text-xs" data-chord-idx="${i}">
				${voicingOptions
					.map((opt) => `<option value=\"${opt.value}\">${opt.label}</option>`)
					.join("")}
			</select>`;
			outputHTML += `<div class="p-3 rounded bg-gray-800 text-white shadow">
				<span class="chord-name text-lg font-bold">${chord.root}(${chord.type}) <span class="text-yellow-300 text-sm">${chordNum}</span></span><br>
				<span class="root-baked-label">Root-baked:</span> <span class="root-baked-value">${rootBakedSpans}</span><br>
				<span class="interval-label">Interval:</span> <span class="interval-value">${intervalHexSpans}</span>
				<div class="mt-2 flex flex-col items-center">
					${voicingSelect}
					<div id="chordKeyboardViz${i}"></div>
				</div>
			</div>`;
		});
		outputHTML += "</div>";
	} else {
		outputHTML = "No valid chords found.<br><br>";
		showToast("No valid chords found.", "error");
	}
	document.getElementById("output").innerHTML = outputHTML;
	if (!outputHTML || !outputHTML.trim()) {
		outputBtn.classList.add("dimmed");
	} else {
		outputBtn.classList.remove("dimmed");
		// Render keyboard graphics for each chord (default voicing)
		if (result.chords && result.chords.length > 0) {
			result.chords.forEach((chord, i) => {
				updateChordKeyboardViz(i, getSelectedVoicing(), chord);
			});
		}
	}
}

export function updateChordKeyboardViz(idx, voicing, chordObj) {
	const keyboardDiv = document.getElementById("chordKeyboardViz" + idx);
	if (!keyboardDiv || !chordObj) return;
	let notes = [];
	if (chordObj.intervalOnly && Array.isArray(chordObj.intervalOnly)) {
		const midiRoot = chordObj.midiRoot || 60;
		notes = chordObj.intervalOnly.map((v) => midiRoot + v);
	}
	const octaves = [60, 72];
	const noteNames = [
		"C",
		"C#",
		"D",
		"D#",
		"E",
		"F",
		"F#",
		"G",
		"G#",
		"A",
		"A#",
		"B",
		"C",
	];
	let svg = '<svg width="130" height="90">';
	octaves.forEach((oct, row) => {
		for (let i = 0; i < 13; i++) {
			const x = i * 10;
			const y = 5 + row * 40;
			const midi = oct + i;
			const isActive = notes.includes(midi);
			svg += `<rect x="${x}" y="${y}" width="10" height="30" rx="2" fill="${
				isActive ? "#ff79c6" : "#282a36"
			}" stroke="#444" />`;
			svg += `<text x="${x + 5}" y="${
				y + 30
			}" text-anchor="middle" font-size="8" fill="#fff">${noteNames[i]}</text>`;
		}
	});
	svg += "</svg>";
	keyboardDiv.innerHTML = svg;
}

export function updateChordVoicing(idx, voicing) {
	if (!lastChordObjs || !lastChordObjs[idx]) return;
	const chordObj = lastChordObjs[idx];
	if (Array.isArray(chordObj.intervalOnly)) {
		let voicedIntervals = chordObj.intervalOnly;
		if (typeof applyVoicing === "function") {
			voicedIntervals = applyVoicing(chordObj.intervalOnly, voicing);
		}
		const midiRoot = chordObj.midiRoot || 60;
		const rootBakedHex = voicedIntervals
			.map((v) => {
				const hex = (midiRoot + v).toString(16).toUpperCase();
				return `<span>${hex}</span>`;
			})
			.join(" ");
		const chordObjUpdated = Object.assign({}, chordObj, {
			intervalOnly: voicedIntervals,
			intervalOnlyHex: voicedIntervals.map(semitoneToHex),
		});
		const intervalHex = chordObjUpdated.intervalOnlyHex
			.map((hex) => `<span>${hex}</span>`)
			.join(" ");
		const chordBox = document
			.getElementById("chordKeyboardViz" + idx)
			.closest(".p-3");
		if (chordBox) {
			const rootBakedEl = chordBox.querySelector(".root-baked-value");
			const intervalEl = chordBox.querySelector(".interval-value");
			if (rootBakedEl) rootBakedEl.innerHTML = rootBakedHex;
			if (intervalEl) intervalEl.innerHTML = intervalHex;
		}
		updateChordKeyboardViz(idx, voicing, chordObjUpdated);
	}
}
