// --- Module-scoped state ---
let lastChordObjs = [];

// Sidebar close button (X)
document
  .getElementById("sidebarCloseBtn")
  ?.addEventListener("click", toggleSidebar);
// --- Event Listener Wiring ---
document.addEventListener("DOMContentLoaded", () => {
  // Play/Stop progression
  document.getElementById("playBtn")?.addEventListener("click", handlePlay);
  document.getElementById("stopBtn")?.addEventListener("click", handleStop);

  // Save/Load/Delete/Export/Import chord sets
  document
    .getElementById("saveChordSetBtn")
    ?.addEventListener("click", saveChordSet);
  document
    .getElementById("loadChordSetBtn")
    ?.addEventListener("click", loadChordSet);
  document
    .getElementById("deleteChordSetBtn")
    ?.addEventListener("click", deleteChordSet);
  document
    .getElementById("exportChordSetsBtn")
    ?.addEventListener("click", exportChordSets);
  document
    .getElementById("importChordSetsInput")
    ?.addEventListener("change", importChordSets);

  // Sidebar and video toggles
  document
    .getElementById("sidebarToggle")
    ?.addEventListener("click", toggleSidebar);
  document
    .getElementById("toggleVideoBtn")
    ?.addEventListener("click", toggleVideoBg);

  // Volume slider
  document
    .getElementById("volumeSlider")
    ?.addEventListener("input", updateVolumeLabel);

  // Convert/Clear/Single Chord Preview
  document
    .getElementById("convertChordsBtn")
    ?.addEventListener("click", convertChordsUI);
  document
    .getElementById("clearInputBtn")
    ?.addEventListener("click", clearInput);
  document
    .getElementById("playSingleChordBtn")
    ?.addEventListener("click", playSingleChord);

  // Chords input updates single chord dropdown
  document
    .getElementById("chordsInput")
    ?.addEventListener("input", updateSingleChordDropdownFromInput);

  // Output box toggle
  document
    .getElementById("toggleOutputBoxBtn")
    ?.addEventListener("click", () => {
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
// Export UI logic for modularity/testing
export {
  setPlayVisualState,
  handlePlay,
  handleStop,
  toggleSidebar,
  toggleVideoBg,
  saveChordSet,
  loadChordSet,
  deleteChordSet,
  exportChordSets,
  importChordSets,
};
// --- Additional UI Logic Functions ---

let isPlaying = false;

function setPlayVisualState(playing) {
  const playBtn = document.getElementById("playBtn");
  const stopBtn = document.getElementById("stopBtn");
  if (playing) {
    playBtn.classList.add("ring-4", "ring-green-300", "scale-95", "shadow-lg");
    stopBtn.classList.add("ring-2", "ring-red-400", "scale-105", "shadow-md");
  } else {
    playBtn.classList.remove(
      "ring-4",
      "ring-green-300",
      "scale-95",
      "shadow-lg"
    );
    stopBtn.classList.remove(
      "ring-2",
      "ring-red-400",
      "scale-105",
      "shadow-md"
    );
  }
}

function handlePlay() {
  if (!isPlaying) {
    isPlaying = true;
    setPlayVisualState(true);
    // TODO: Replace with imported playChordProgression when modularized
    if (typeof playChordProgression === "function") playChordProgression();
    // Estimate total duration and reset state after
    const input = document.getElementById("chordsInput").value;
    const chordCount = input.split(/\s|,/).filter((s) => s.length > 0).length;
    const chordDuration = 2.5;
    setTimeout(() => {
      isPlaying = false;
      setPlayVisualState(false);
    }, chordCount * chordDuration * 1000 + 100);
  }
}

function handleStop() {
  if (isPlaying) {
    isPlaying = false;
    setPlayVisualState(false);
    if (typeof stopChordProgression === "function") stopChordProgression();
  } else {
    if (typeof stopChordProgression === "function") stopChordProgression();
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  if (sidebar.classList.contains("-translate-x-full")) {
    sidebar.classList.remove("-translate-x-full");
    toggleBtn.classList.add("sidebar-toggle-fade");
  } else {
    sidebar.classList.add("-translate-x-full");
    toggleBtn.classList.remove("sidebar-toggle-fade");
  }
}

// Save/Load/Delete/Export/Import Chord Sets
// Save/Load/Delete/Export/Import Chord Sets (direct imports from core.js)
// Functions are imported below
// main.js - Vite entry point for Hypersyn Chord Helper
import {
  getMidiRoot,
  getValidVoicings,
  applyVoicing,
  semitoneToHex,
  parseChordName,
  exportChordSets,
  importChordSets,
  showToast,
  getSavedChordSets,
  setSavedChordSets,
  updateSavedChordSetsDropdown,
  saveChordSet,
  loadChordSet,
  deleteChordSet,
  convertChords,
  playSingleChordGlobal,
  toggleVideoBg,
} from "./core.js";

// --- UI Logic Functions ---

function updateVolumeLabel() {
  const slider = document.getElementById("volumeSlider");
  document.getElementById("volumeLabel").textContent = slider.value + "%";
}

function clearInput() {
  document.getElementById("chordsInput").value = "";
  updateSingleChordDropdown([]);
  document.getElementById("output").innerHTML = "";
  const uniqueChordTypes = document.getElementById("uniqueChordTypes");
  if (uniqueChordTypes) uniqueChordTypes.innerHTML = "";
}

function updateSingleChordDropdown(chordNames) {
  const select = document.getElementById("singleChordSelect");
  if (!select) return;
  select.innerHTML = '<option value="">Select a chord...</option>';
  chordNames.forEach((chord) => {
    select.innerHTML += `<option value="${chord}">${chord}</option>`;
  });
  select.disabled = false;
  select.classList.remove("dimmed");
}

function updateSingleChordDropdownFromInput() {
  const input = document.getElementById("chordsInput").value;
  const chordNames = input.split(/\s|,/).filter((s) => s.length > 0);
  updateSingleChordDropdown(chordNames);
}

function convertChordsUI() {
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

function getSelectedVoicing() {
  const select = document.getElementById("voicingSelect");
  return select ? select.value : "closed";
}

function playSingleChord() {
  const select = document.getElementById("singleChordSelect");
  const chordName = select.value;
  if (!chordName || chordName === "Select a chord...") return;
  const chordObj = parseChordName(chordName);
  if (chordObj) {
    playSingleChordGlobal(chordObj);
  } else {
    showToast("Chord playback not available.", "error");
  }
}

// --- Keyboard Visualization and Voicing Helpers ---
function updateKeyboardViz() {
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

function updateChordKeyboardViz(idx, voicing, chordObj) {
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

function updateChordVoicing(idx, voicing) {
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

// --- Wire up voicing/keyboard viz on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  updateKeyboardViz();
  // Delegate for per-chord voicing dropdowns
  document.body.addEventListener("change", (e) => {
    if (e.target && e.target.classList.contains("chord-voicing-select")) {
      const idx = e.target.getAttribute("data-chord-idx");
      const voicing = e.target.value;
      updateChordVoicing(Number(idx), voicing);
    }
  });
});
