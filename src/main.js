// main.js - Vite entry point for Hypersyn Chord Helper
import {
  getMidiRoot,
  getValidVoicings,
  applyVoicing,
  semitoneToHex,
  parseChordName,
} from "./core.js";

// Example: expose only UI-needed functions to window (for inline HTML handlers)
window.getMidiRoot = getMidiRoot;
window.getValidVoicings = getValidVoicings;
window.applyVoicing = applyVoicing;
window.semitoneToHex = semitoneToHex;
window.parseChordName = parseChordName;

// You can also move more UI logic here and use addEventListener instead of inline onclick, etc.
// ...

// Example: on DOMContentLoaded, update dropdowns, etc.
document.addEventListener("DOMContentLoaded", () => {
  if (window.updateSavedChordSetsDropdown)
    window.updateSavedChordSetsDropdown();
});
