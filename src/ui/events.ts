/**
 * Returns the currently selected voicing type from the voicing dropdown.
 * Defaults to 'closed' if not found.
 */
export function getSelectedVoicing(): string {
	const select = document.getElementById("voicingSelect") as HTMLSelectElement | null;
	return select ? select.value : "closed";
}

import { toggleSidebar } from './sidebar';
import { toggleVideoBg } from '../core/core';
import { saveChordSet, loadChordSet, deleteChordSet, exportChordSets, importChordSets, updateSavedChordSetsDropdown } from '../core/storage';
import { convertChords } from '../core/chords';
import { convertChordsUI, updateChordVoicing, updateChordKeyboardViz } from './chordCards';
import { updateKeyboardViz } from './keyboardViz';

// Placeholder: these should be implemented or imported as needed
function updateVolumeLabel() {
	const slider = document.getElementById("volumeSlider") as HTMLInputElement | null;
	document.getElementById("volumeLabel").textContent = (slider ? slider.value : "0") + "%";
}
function clearInput() {
	(document.getElementById("chordsInput") as HTMLInputElement | null)!.value = "";
	// ...clear other UI as needed
}
function playSingleChord() {
	// ...implement as needed
}
export function updateSingleChordDropdownFromInput() {
	// ...implement as needed
}

/**
 * Wires up all DOM event listeners for the app UI.
 *
 * @returns {void}
 */
export function wireEventListeners() {
	// Sidebar close button (X)
	document.getElementById("sidebarCloseBtn")?.addEventListener("click", toggleSidebar);
	document.addEventListener("DOMContentLoaded", () => {
		// Play/Stop progression
		document.getElementById("playBtn")?.addEventListener("click", () => {/* handlePlay */});
		document.getElementById("stopBtn")?.addEventListener("click", () => {/* handleStop */});

		// Save/Load/Delete/Export/Import chord sets
		document.getElementById("saveChordSetBtn")?.addEventListener("click", saveChordSet);
		document.getElementById("loadChordSetBtn")?.addEventListener("click", loadChordSet);
		document.getElementById("deleteChordSetBtn")?.addEventListener("click", deleteChordSet);
		document.getElementById("exportChordSetsBtn")?.addEventListener("click", exportChordSets);
		document.getElementById("importChordSetsInput")?.addEventListener("change", importChordSets);

		// Sidebar and video toggles
		document.getElementById("sidebarToggle")?.addEventListener("click", toggleSidebar);
		document.getElementById("toggleVideoBtn")?.addEventListener("click", toggleVideoBg);

		// Volume slider
		document.getElementById("volumeSlider")?.addEventListener("input", updateVolumeLabel);

		// Convert/Clear/Single Chord Preview
		document.getElementById("convertChordsBtn")?.addEventListener("click", () => convertChordsUI(convertChords, () => "closed", () => {}));
		document.getElementById("clearInputBtn")?.addEventListener("click", clearInput);
		document.getElementById("playSingleChordBtn")?.addEventListener("click", playSingleChord);

		// Chords input updates single chord dropdown
		document.getElementById("chordsInput")?.addEventListener("input", updateSingleChordDropdownFromInput);

		// Output box toggle
		document.getElementById("toggleOutputBoxBtn")?.addEventListener("click", () => {
			const box = document.getElementById("outputBox");
			const btn = document.getElementById("toggleOutputBoxBtn");
			if (!box || !btn) return;
			const isOpen = box.style.display !== "none" && box.style.display !== "";
			box.style.display = isOpen ? "none" : "block";
			btn.innerHTML = isOpen
				? btn.innerHTML.replace("▼", "▶")
				: btn.innerHTML.replace("▶", "▼");
		});

		// Initialize volume label and single chord dropdown
		updateVolumeLabel();
		updateSingleChordDropdownFromInput();
		// Populate saved sets dropdown on initial load
		updateSavedChordSetsDropdown();
	});

	// --- Wire up voicing/keyboard viz on DOMContentLoaded ---
	document.addEventListener("DOMContentLoaded", () => {
		updateKeyboardViz();
		// Delegate for per-chord voicing dropdowns
		document.body.addEventListener("change", (e) => {
			const target = e.target as Element | null;
			if (target && target.classList.contains("chord-voicing-select")) {
				const idx = target.getAttribute("data-chord-idx");
				const voicing = (target as HTMLSelectElement).value;
				updateChordVoicing(Number(idx), voicing);
			}
		});
	});
}
