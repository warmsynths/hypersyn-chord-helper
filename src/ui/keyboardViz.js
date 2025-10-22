
/**
 * Updates the main keyboard visualization based on the selected voicing.
 *
 * @returns {void}
 */
export function updateKeyboardViz() {
	const keyboardDiv = document.getElementById("keyboardViz");
	if (!keyboardDiv) return;
	const voicing = document.getElementById("voicingSelect").value;
	let notes = [];
	if (voicing === "closed") notes = [60, 64, 67];
	else if (voicing === "open-triad") notes = [62, 65, 69];
	else if (voicing === "drop2") notes = [60, 65, 67];
	else if (voicing === "drop3") notes = [60, 64, 69];
	else if (voicing === "spread") notes = [60, 67, 71];
	else if (voicing === "octave") notes = [60, 72];
	else if (voicing === "first-inversion") notes = [64, 67, 72];
	else if (voicing === "second-inversion") notes = [67, 72, 76];
	else if (voicing === "third-inversion") notes = [71, 76, 79];
	else if (voicing === "shell-dominant") notes = [60, 67];
	else if (voicing === "altered-dominant") notes = [60, 64, 70];
	let svg = '<svg width="130" height="40">';
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
	for (let i = 0; i < 13; i++) {
		const x = i * 10;
		const midi = 60 + i;
		const isActive = notes.includes(midi);
		svg += `<rect x="${x}" y="5" width="10" height="30" rx="2" fill="${
			isActive ? "#ff79c6" : "#282a36"
		}" stroke="#444" />`;
		svg += `<text x="${
			x + 5
		}" y="35" text-anchor="middle" font-size="8" fill="#fff">${
			noteNames[i]
		}</text>`;
	}
	svg += "</svg>";
	keyboardDiv.innerHTML = svg;
}
