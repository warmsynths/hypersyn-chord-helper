
import {
  toggleVideoBg,
  playChordProgression,
  stopChordProgression,
} from "../core/core";
import {
  saveChordSet,
  loadChordSet,
  deleteChordSet,
  exportChordSets,
  importChordSets,
  updateSavedChordSetsDropdown,
} from "../core/storage";
import { convertChords } from "../core/chords";
import {
  convertChordsUI,
  updateChordVoicing,
  updateChordKeyboardViz,
  getCurrentProgressionNotes,
} from "./chordCards";
import { updateKeyboardViz } from "./keyboardViz";
import { showToast } from "./toast";
import { parseChordName } from "../core/chords";
import { playSingleChordGlobal } from "../core/core";

// ─── Voicing select (legacy global — returns "closed" in new UI) ────

/**
 * Returns the currently selected voicing type.
 * In the new tracker UI, per-chord voicing is controlled via drag; this
 * returns "closed" as the default for initial rendering.
 *
 * @returns {string} "closed"
 */
export const getSelectedVoicing = (): string => "closed";

// ─── Volume label ───────────────────────────────────────────────────

// (Volume slider removed)

// ─── Clear input ────────────────────────────────────────────────────

/**
 * Clears the chords input field.
 */
export const clearInput = (): void => {
  const input = document.getElementById("chordsInput") as HTMLInputElement | null;
  if (input) input.value = "";
};

// ─── Single chord dropdown ──────────────────────────────────────────

/**
 * Populates the single chord dropdown with unique chord names from the input field.
 */
export const updateSingleChordDropdownFromInput = (): void => {
  const input  = document.getElementById("chordsInput")  as HTMLInputElement  | null;
  const select = document.getElementById("singleChordSelect") as HTMLSelectElement | null;
  if (!input || !select) return;

  const chordNames  = input.value.split(/\s|,/).map((s) => s.trim()).filter(Boolean);
  const uniqueChords = Array.from(new Set(chordNames));

  select.innerHTML = "";
  if (uniqueChords.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(No chords)";
    select.appendChild(opt);
    select.disabled = true;
  } else {
    uniqueChords.forEach((chord) => {
      const opt = document.createElement("option");
      opt.value = chord;
      opt.textContent = chord;
      select.appendChild(opt);
    });
    select.disabled = false;
  }
};

// ─── Play single chord ──────────────────────────────────────────────

/**
 * Plays the currently selected chord from the single chord dropdown.
 */
export const playSingleChord = (): void => {
  const select = document.getElementById("singleChordSelect") as HTMLSelectElement | null;
  if (!select || !select.value) return;
  const parsed = parseChordName(select.value);
  if (!parsed) return;
  playSingleChordGlobal(parsed);
};

// ─── Konami Code Easter Egg ─────────────────────────────────────────

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

let konamiBuffer: string[] = [];

function handleKonamiKey(e: KeyboardEvent): void {
  konamiBuffer.push(e.key);
  if (konamiBuffer.length > KONAMI_SEQUENCE.length) {
    konamiBuffer.shift();
  }
  if (konamiBuffer.join(",") === KONAMI_SEQUENCE.join(",")) {
    konamiBuffer = [];
    const body    = document.body;
    const isOn    = body.classList.toggle("theme-synthwave");
    const videoBg = document.getElementById("video-bg");
    const appTitle = document.getElementById("app-title");

    if (videoBg)  videoBg.style.display  = isOn ? "block" : "none";
    if (appTitle) appTitle.style.display = isOn ? "block" : "none";

    showToast(
      isOn ? "🎮 Synthwave easter egg activated!" : "🎮 Back to tracker mode",
      isOn ? "success" : "info"
    );
  }
}

// ─── Wire all event listeners ───────────────────────────────────────

/**
 * Wires up all DOM event listeners for the app UI.
 */
export const wireEventListeners = (): void => {

  // Konami code — works any time
  document.addEventListener("keydown", handleKonamiKey);



  document.addEventListener("DOMContentLoaded", () => {
    // ── Playback ──
    let isPlaying = false;
    let isLooping = false;

    const PLAY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    const STOP_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16"></rect></svg>`;

    const resetPlayBtn = () => {
      isPlaying = false;
      const btn = document.getElementById("mainPlayBtn");
      if (btn) {
        btn.innerHTML = PLAY_ICON;
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-muted");
      }
    };

    document.getElementById("mainPlayBtn")?.addEventListener("click", () => {
      const btn = document.getElementById("mainPlayBtn");
      if (isPlaying) {
        stopChordProgression();
        resetPlayBtn();
      } else {
        const notesArray = getCurrentProgressionNotes();
        playChordProgression(notesArray, isLooping, resetPlayBtn);
        isPlaying = true;
        if (btn) {
          btn.innerHTML = STOP_ICON;
          btn.classList.remove("btn-muted");
          btn.classList.add("btn-primary");
        }
      }
    });

    document.getElementById("mainLoopBtn")?.addEventListener("click", () => {
      isLooping = !isLooping;
      const btn = document.getElementById("mainLoopBtn");
      if (isLooping) {
        if (btn) {
          btn.classList.remove("btn-muted");
          btn.classList.add("btn-primary");
        }
      } else {
        if (btn) {
          btn.classList.remove("btn-primary");
          btn.classList.add("btn-muted");
        }
      }
    });

    // ── Chord set management ──
    document.getElementById("saveChordSetBtn")?.addEventListener("click",   saveChordSet);
    document.getElementById("loadChordSetBtn")?.addEventListener("click",   loadChordSet);
    document.getElementById("deleteChordSetBtn")?.addEventListener("click", deleteChordSet);
    document.getElementById("exportChordSetsBtn")?.addEventListener("click", exportChordSets);
    document.getElementById("importChordSetsInput")?.addEventListener("change", importChordSets);

    // ── Nav bar: Help Modal ──
    const helpModal = document.getElementById("helpModal") as HTMLDialogElement;
    document.getElementById("nav-settings-btn")?.addEventListener("click", () => {
      if (helpModal) helpModal.showModal();
    });
    document.getElementById("helpModalCloseBtn")?.addEventListener("click", () => {
      if (helpModal) helpModal.close();
    });
    // Close modal on click outside
    helpModal?.addEventListener("click", (e) => {
      if (e.target === helpModal) {
        helpModal.close();
      }
    });

    // ── Nav bar: Disk Modal ──
    const diskModal = document.getElementById("diskModal") as HTMLDialogElement;
    document.getElementById("nav-disk-btn")?.addEventListener("click", () => {
      if (diskModal) diskModal.showModal();
    });
    document.getElementById("diskModalCloseBtn")?.addEventListener("click", () => {
      if (diskModal) diskModal.close();
    });
    // Close modal on click outside
    diskModal?.addEventListener("click", (e) => {
      if (e.target === diskModal) {
        diskModal.close();
      }
    });

    // ── Disk Modal: New Project ──
    document.getElementById("newProjectBtn")?.addEventListener("click", () => {
      const input = document.getElementById("chordsInput") as HTMLInputElement;
      if (input) input.value = "";
      const outputBox = document.getElementById("outputBox");
      if (outputBox) outputBox.style.display = "none";
      const toggleBtn = document.getElementById("toggleOutputBoxBtn");
      if (toggleBtn) {
        toggleBtn.innerHTML = "CHORDS ▶";
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.add("dimmed");
      }
      if (diskModal) diskModal.close();
      showToast("New project started.", "info");
    });



    // ── Video toggle (legacy — now hidden in sidebar info section) ──
    document.getElementById("toggleVideoBtn")?.addEventListener("click", toggleVideoBg);

    // ── Convert / Clear / Single Chord ──
    document.getElementById("convertChordsBtn")?.addEventListener("click", () => {
      convertChordsUI(
        convertChords,
        () => "closed",
        updateSingleChordDropdownFromInput
      );
      stopChordProgression();
      resetPlayBtn();
    });
    document.getElementById("clearInputBtn")?.addEventListener("click", clearInput);
    document.getElementById("playSingleChordBtn")?.addEventListener("click", playSingleChord);

    // ── Chords input → update single chord dropdown ──
    document.getElementById("chordsInput")?.addEventListener("input", updateSingleChordDropdownFromInput);

    // ── Output box toggle ──
    document.getElementById("toggleOutputBoxBtn")?.addEventListener("click", () => {
      const box = document.getElementById("outputBox");
      const btn = document.getElementById("toggleOutputBoxBtn");
      if (!box || !btn) return;
      const isOpen = box.style.display !== "none" && box.style.display !== "";
      box.style.display = isOpen ? "none" : "block";
      btn.setAttribute("aria-expanded", String(!isOpen));
      if (isOpen) {
        btn.innerHTML = "CHORDS ▶";
      } else {
        btn.innerHTML = "CHORDS ▼";
      }
    });

    // ── Step strip: clicking a step number highlights it ──
    document.getElementById("step-strip")?.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("step-num")) {
        document.querySelectorAll(".step-num").forEach((el) => el.classList.remove("active"));
        target.classList.add("active");
      }
    });

    // ── Initialise dropdowns ──
    updateSingleChordDropdownFromInput();
    updateSavedChordSetsDropdown();

    // ── Legacy keyboard viz (no-op in new UI) ──
    updateKeyboardViz();
  });
};
