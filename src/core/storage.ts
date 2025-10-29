
import { generateUUID } from './utils';
import { showToast } from '../ui/toast';

/**
 * Retrieves all saved chord sets from localStorage.
 *
 * @returns {Array<object>} Array of saved chord set objects.
 */
export function getSavedChordSets() {
	const sets = localStorage.getItem("hypersynChordSets");
	try {
		return sets ? JSON.parse(sets) : [];
	} catch {
		return [];
	}
}
/**
 * Saves the provided chord sets array to localStorage.
 *
 * @param {Array<object>} sets - Array of chord set objects to save.
 */
export function setSavedChordSets(sets) {
	localStorage.setItem("hypersynChordSets", JSON.stringify(sets));
}
/**
 * Updates the saved chord sets dropdown in the UI with current sets from localStorage.
 *
 * @returns {void}
 */
export function updateSavedChordSetsDropdown() {
	const select = document.getElementById("savedChordSetsSelect");
	if (!select) return;
	const sets = getSavedChordSets();
	select.innerHTML = '<option value="">Load saved set...</option>';
	sets.forEach((set, idx) => {
		select.innerHTML += `<option value="${idx}">${set.name}</option>`;
	});
}
/**
 * Saves the current chord set from the UI to localStorage, updating if the name exists.
 *
 * @returns {void}
 */
export function saveChordSet() {
	const input = document.getElementById("chordsInput").value;
	const nameInput = document.getElementById("chordSetNameInput");
	const name = nameInput.value.trim();
	if (!name) {
		showToast("Please enter a name for the chord set.", "error");
		return;
	}
	let sets = getSavedChordSets();
	const idx = sets.findIndex((s) => s.name === name);
	if (idx >= 0) {
		sets[idx].chords = input;
	} else {
		sets.push({ name, chords: input, id: generateUUID() });
	}
	setSavedChordSets(sets);
	updateSavedChordSetsDropdown();
	showToast(`Chord set saved as '${name}'.`, "success");
}
/**
 * Loads the selected chord set from the dropdown into the UI.
 *
 * @returns {void}
 */
export function loadChordSet() {
	const select = document.getElementById("savedChordSetsSelect");
	const idx = select.value;
	if (!idx || isNaN(idx)) {
		showToast("Please select a saved chord set to load.", "error");
		return;
	}
	const sets = getSavedChordSets();
	const set = sets[parseInt(idx, 10)];
	if (set) {
		document.getElementById("chordsInput").value = set.chords;
		if (typeof updateSingleChordDropdownFromInput === "function")
			updateSingleChordDropdownFromInput();
		showToast(`Chord set '${set.name}' loaded!`, "success");
	} else {
		showToast("Chord set not found.", "error");
	}
}
/**
 * Deletes the selected chord set from localStorage and updates the dropdown.
 *
 * @returns {void}
 */
export function deleteChordSet() {
	const select = document.getElementById("savedChordSetsSelect");
	const idx = select.value;
	if (!idx || isNaN(idx)) {
		showToast("Please select a saved chord set to delete.", "error");
		return;
	}
	let sets = getSavedChordSets();
	const set = sets[parseInt(idx, 10)];
	if (set) {
		sets.splice(parseInt(idx, 10), 1);
		setSavedChordSets(sets);
		updateSavedChordSetsDropdown();
		showToast("Chord set deleted.", "success");
	} else {
		showToast("Chord set not found.", "error");
	}
}
/**
 * Exports all saved chord sets as a downloadable JSON file.
 *
 * @returns {void}
 */
export function exportChordSets() {
	const sets = getSavedChordSets();
	const dataStr = JSON.stringify(sets, null, 2);
	const blob = new Blob([dataStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "hypersyn-chord-sets.json";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	showToast("Chord sets exported as JSON.", "success");
}

/**
 * Imports chord sets from a JSON file input, only adding new sets by unique id.
 *
 * @param {HTMLInputElement} fileInput - The file input element containing the JSON file.
 * @returns {void}
 */
export function importChordSets(fileInput) {
	if (!fileInput.files || !fileInput.files[0]) {
		showToast("No file selected.", "error");
		return;
	}
	const file = fileInput.files[0];
	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			const importedSets = JSON.parse(e.target.result);
			if (!Array.isArray(importedSets)) throw new Error("Invalid format");
			let sets = getSavedChordSets();
			const existingIds = new Set(sets.map((s) => s.id));
			let added = 0;
			importedSets.forEach((set) => {
				if (set && set.id && !existingIds.has(set.id)) {
					sets.push(set);
					added++;
				}
			});
			setSavedChordSets(sets);
			updateSavedChordSetsDropdown();
			if (added > 0) {
				showToast(`Imported ${added} new chord set(s).`, "success");
			} else {
				showToast("No new chord sets to import.", "info");
			}
		} catch {
			showToast("Failed to import chord sets.", "error");
		}
		fileInput.value = "";
	};
	reader.readAsText(file);
}
