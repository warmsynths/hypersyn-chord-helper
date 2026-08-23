import { parseChordName } from "../core/chords";
import {
  toggleIntervalMode,
  getOutputModeLabel,
  getOutputModeHint,
  isOutputIntervalOnly,
} from "./chordCards";
import { updateSingleChordDropdownFromInput } from "./events";
import {
  initPhosphor,
  setPersistence,
  getPersistLabel,
  getPersistMs,
  PERSIST_PRESETS,
} from "./phosphor";
import { runBoot, cleanupBoot } from "./boot";

// ─── Themes (from the Hypersyn Redesign) ─────────────────────────────
const THEMES: Record<string, string> = {
  green: "Classic Green",
  amber: "Amber",
  ibm: "IBM 5153 Cyan",
  monokai: "Monokai",
  dracula: "Dracula",
  solarized: "Solarized Dark",
  nord: "Nord",
  onedark: "One Dark",
};

const THEME_STORAGE_KEY = "hypersynTerminalTheme";
const CRT_STORAGE_KEY = "hypersynTerminalCrt";
const SIZE_STORAGE_KEY = "hypersynTerminalSize";

let currentTheme = "monokai";
let currentCrt = "low";
let currentSize = "normal";

const applyTheme = (key: string): boolean => {
  if (!THEMES[key]) return false;
  document.body.classList.remove(`theme-${currentTheme}`);
  currentTheme = key;
  document.body.classList.add(`theme-${currentTheme}`);
  localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  const chip = document.getElementById("themeChip");
  if (chip) chip.textContent = THEMES[currentTheme];
  return true;
};

const applyCrt = (level: string): boolean => {
  if (!["off", "low", "med", "high"].includes(level)) return false;
  const crtBox = document.getElementById("crt-box");
  if (crtBox) {
    crtBox.classList.remove("crt-off", "crt-low", "crt-med", "crt-high");
    crtBox.classList.add(`crt-${level}`);
  }
  currentCrt = level;
  localStorage.setItem(CRT_STORAGE_KEY, currentCrt);
  return true;
};

const applySize = (level: string): boolean => {
  const sizeMap: Record<string, string> = { normal: "zoom-a", large: "zoom-b", huge: "zoom-c" };
  if (!sizeMap[level]) return false;
  const crtBox = document.getElementById("crt-box");
  if (crtBox) {
    crtBox.classList.remove("zoom-a", "zoom-b", "zoom-c");
    crtBox.classList.add(sizeMap[level]);
  }
  currentSize = level;
  localStorage.setItem(SIZE_STORAGE_KEY, currentSize);
  return true;
};

const updateModeChips = (): void => {
  const chip = document.getElementById("modeChip");
  const hint = document.getElementById("modeHint");
  if (chip) chip.textContent = getOutputModeLabel();
  if (hint) hint.textContent = getOutputModeHint();
};

// ─── Command text ─────────────────────────────────────────────────────
const helpText = [
  "help              show this list",
  "about             what this tool does",
  "status            current mode, theme, crt, size, persistence",
  "crt <level>       off | low | med | high  CRT bloom intensity",
  "size <level>      normal | large | huge  text size",
  "mode notes        hex = literal note value (absolute pitch, for M8 entry as-is)",
  "mode intervals    hex = semitone offset from chord root (00-0B); set the root on the device",
  `theme <name>      ${Object.keys(THEMES).join(" | ")}`,
  "persist <level>   short | normal | long | off  how long the phosphor glow holds",
  "boot              replay the CRT power-on sequence",
  "projects          open project management dialog",
  "save <name>       save current chord progression set",
  "load <name>       load saved chord set by name",
  "export            export chord sets to JSON",
  "import            import chord sets from JSON file",
  "clear             clear this log",
].join("\n");

const aboutText = [
  "01  type a progression      e.g. Am7 Dm9 G13 Cmaj7 — press enter to load",
  "02  read the hex            each chord line prints hex codes ready for Hypersyn on M8",
  "03  click a chord line      expands it — up/down cycles voicings, plays each one",
  "04  mode notes|intervals    notes = hex bakes in the root, paste straight into Hypersyn",
  "                            intervals = chord shape only — you set the root on the device",
  "",
  "source progressions from chroma chords — warmsynths.github.io/chroma-chords",
].join("\n");

const commandList: { cmd: string; desc: string }[] = [
  { cmd: "help", desc: "show available commands" },
  { cmd: "about", desc: "what this tool does" },
  { cmd: "status", desc: "show current mode, theme, crt, size" },
  { cmd: "crt off", desc: "no bloom or screen effects" },
  { cmd: "crt low", desc: "subtle CRT bloom (default)" },
  { cmd: "crt med", desc: "moderate CRT bloom" },
  { cmd: "crt high", desc: "rich CRT bloom and glow" },
  { cmd: "size normal", desc: "default text size" },
  { cmd: "size large", desc: "larger text for big displays" },
  { cmd: "size huge", desc: "across-the-room text size" },
  { cmd: "mode notes", desc: "output literal note hex" },
  { cmd: "mode intervals", desc: "output semitone offsets from root" },
  ...Object.keys(THEMES).map((key) => ({ cmd: `theme ${key}`, desc: `switch to ${THEMES[key]}` })),
  { cmd: "persist short", desc: "phosphor holds ~1.2s" },
  { cmd: "persist normal", desc: "phosphor holds ~2.4s (default)" },
  { cmd: "persist long", desc: "phosphor holds ~5s" },
  { cmd: "persist off", desc: "no phosphor persistence" },
  { cmd: "boot", desc: "replay CRT power-on sequence" },
  { cmd: "projects", desc: "open project manager modal" },
  { cmd: "save", desc: "save current chord progression set" },
  { cmd: "load", desc: "load saved chord set" },
  { cmd: "export", desc: "export chord sets to JSON" },
  { cmd: "import", desc: "import chord sets from JSON file" },
  { cmd: "clear", desc: "clear the command log" },
];

// ─── Command history log ──────────────────────────────────────────────
type HistoryEntry = { text: string; color: string; isHtml?: boolean };
let cmdHistory: HistoryEntry[] = [];

const renderHistory = (): void => {
  const el = document.getElementById("cmdHistory");
  if (!el) return;
  el.innerHTML = cmdHistory
    .map((h) => {
      const content = h.isHtml ? h.text : escapeHtml(h.text);
      return `<div class="cmd-history-line" style="color:${h.color};">${content}</div>`;
    })
    .join("");
  el.scrollTop = el.scrollHeight;
};

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

const pushHistory = (raw: string, out: string, color: string, isHtml: boolean = false): void => {
  cmdHistory.push({ text: "> " + raw, color: "var(--text-dim)" });
  cmdHistory.push({ text: out, color, isHtml });
  cmdHistory = cmdHistory.slice(-16);
  renderHistory();
};

const getSuggestion = (raw: string): { rest: string; full: string; desc: string } | null => {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const match = commandList.find((c) => c.cmd.startsWith(lower) && c.cmd !== lower);
  return match ? { rest: match.cmd.slice(raw.length), full: match.cmd, desc: match.desc } : null;
};

const renderSuggestion = (raw: string): void => {
  const el = document.getElementById("cmdSuggestion");
  if (!el) return;
  const s = getSuggestion(raw);
  if (!s) {
    el.style.display = "none";
    el.innerHTML = "";
    return;
  }
  el.style.display = "block";
  el.innerHTML = `&#8677; tab -&gt; <span class="cmd-suggestion-full">${escapeHtml(s.full)}</span> &mdash; ${escapeHtml(s.desc)}`;
};

// ─── Konami code easter egg (Pac-Man sweep) ──────────────────────────
const KONAMI_SEQ = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const PACMAN_STEPS = 22;
const PACMAN_DOTS = 20;
let konamiIdx = 0;
let konamiRunning = false;

const pacmanMouthClip = (pos: number): string =>
  pos % 2 === 0
    ? "polygon(50% 50%, 100% 8%, 100% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 92%)"
    : "circle(50%)";

const renderKonamiDots = (pos: number): void => {
  const dotsEl = document.getElementById("konamiDots");
  if (!dotsEl) return;
  let html = "";
  for (let i = 0; i < PACMAN_DOTS; i++) {
    if (i > pos * (PACMAN_DOTS / PACMAN_STEPS)) {
      html += `<div class="konami-dot" style="left:${(6 + i * 4.4).toFixed(1)}%;"></div>`;
    }
  }
  dotsEl.innerHTML = html;
};

const runKonamiAnimation = (): void => {
  if (konamiRunning) return;
  konamiRunning = true;
  const track = document.getElementById("konamiTrack");
  const pac = document.getElementById("konamiPac");
  const done = document.getElementById("konamiDone");

  if (done) done.style.display = "none";
  if (track) track.style.display = "flex";

  let pos = 0;
  const tick = () => {
    if (pos <= PACMAN_STEPS) {
      renderKonamiDots(pos);
      if (pac) {
        pac.style.left = ((pos / PACMAN_STEPS) * 92).toFixed(1) + "%";
        pac.style.clipPath = pacmanMouthClip(pos);
      }
      pos++;
      setTimeout(tick, 220);
    } else {
      if (track) track.style.display = "none";
      if (done) done.style.display = "block";
      konamiRunning = false;
      setTimeout(() => {
        if (done) done.style.display = "none";
      }, 1200);
    }
  };
  tick();
};

const handleKonamiKey = (key: string): void => {
  const want = KONAMI_SEQ[konamiIdx];
  konamiIdx = key === want ? konamiIdx + 1 : key === KONAMI_SEQ[0] ? 1 : 0;
  if (konamiIdx === KONAMI_SEQ.length) {
    konamiIdx = 0;
    runKonamiAnimation();
  }
};

const loadProgression = (raw: string): void => {
  const input = document.getElementById("chordsInput") as HTMLInputElement | null;
  if (input) {
    input.value = raw;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  updateSingleChordDropdownFromInput();
  document.getElementById("convertChordsBtn")?.click();
};

const handleSubmit = (): void => {
  const input = document.getElementById("cmdInput") as HTMLInputElement | null;
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;

  const rawParts = raw.split(/\s+/);
  const parts = raw.toLowerCase().split(/\s+/);
  let out = "";
  let color = "var(--text-dim)";
  let isHtml = false;

  if (rawParts.every((p) => parseChordName(p))) {
    loadProgression(raw);
    out = "loaded " + rawParts.length + " chord(s)";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "help") {
    out = helpText;
  } else if (parts[0] === "status") {
    const modeVal = escapeHtml(getOutputModeLabel());
    const modeHint = escapeHtml(getOutputModeHint());
    const themeVal = escapeHtml(THEMES[currentTheme]);
    out = [
      `mode    <span style="color:var(--accent);">${modeVal}</span>  ${modeHint}`,
      `theme   <span style="color:var(--accent);">${themeVal}</span>`,
      `crt     <span style="color:var(--accent);">${currentCrt}</span>`,
      `size    <span style="color:var(--accent);">${currentSize}</span>`,
      `persist <span style="color:var(--accent);">${escapeHtml(getPersistLabel())}</span>  (${getPersistMs()}ms)`,
    ].join("\n");
    color = "var(--text-dim)";
    isHtml = true;
  } else if (parts[0] === "about") {
    out = aboutText;
  } else if (parts[0] === "crt" && ["off", "low", "med", "high"].includes(parts[1])) {
    applyCrt(parts[1]);
    out = "crt -> " + parts[1];
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "size" && ["normal", "large", "huge"].includes(parts[1])) {
    applySize(parts[1]);
    out = "size -> " + parts[1];
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "mode" && ["notes", "intervals"].includes(parts[1])) {
    const wantIntervals = parts[1] === "intervals";
    if (wantIntervals !== isOutputIntervalOnly()) toggleIntervalMode();
    updateModeChips();
    out = "mode -> " + parts[1];
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "theme" && THEMES[parts[1]]) {
    applyTheme(parts[1]);
    out = "theme -> " + THEMES[parts[1]];
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "persist" && PERSIST_PRESETS[parts[1]]) {
    setPersistence(parts[1]);
    out = "persist -> " + parts[1] + " (" + PERSIST_PRESETS[parts[1]] + "ms)";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "boot") {
    cmdHistory = [];
    renderHistory();
    input.value = "";
    renderSuggestion("");
    const count = document.querySelectorAll(".chord-row-wrapper").length;
    runBoot(count || 8);
    return;
  } else if (parts[0] === "projects") {
    const dialog = document.getElementById("diskModal") as HTMLDialogElement | null;
    if (dialog) dialog.showModal();
    out = "opened project manager";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "save") {
    const name = rawParts.slice(1).join(" ");
    const nameInput = document.getElementById("chordSetNameInput") as HTMLInputElement | null;
    if (nameInput && name) nameInput.value = name;
    document.getElementById("saveChordSetBtn")?.click();
    out = name ? `saved chord set "${name}"` : "triggered save chord set";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "load") {
    const name = rawParts.slice(1).join(" ");
    const select = document.getElementById("savedChordSetsSelect") as HTMLSelectElement | null;
    if (select && name) {
      const opt = Array.from(select.options).find((o) => o.text.toLowerCase() === name.toLowerCase() || o.value === name);
      if (opt) select.value = opt.value;
    }
    document.getElementById("loadChordSetBtn")?.click();
    out = name ? `loaded chord set "${name}"` : "triggered load chord set";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "export") {
    document.getElementById("exportChordSetsBtn")?.click();
    out = "exported chord sets JSON";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "import") {
    document.getElementById("importChordSetsInput")?.click();
    out = "opened JSON import chooser";
    color = "var(--accent-green, #7CFF6B)";
  } else if (parts[0] === "clear") {
    cmdHistory = [];
    renderHistory();
    input.value = "";
    renderSuggestion("");
    return;
  } else {
    out = `unrecognized "${raw}" — type help, or enter chord names like Am7 Dm9`;
    color = "#FF6B6B";
  }

  pushHistory(raw, out, color, isHtml);
  input.value = "";
  renderSuggestion("");
};

export const initTerminal = (): void => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  applyTheme(storedTheme && THEMES[storedTheme] ? storedTheme : "monokai");

  const storedCrt = localStorage.getItem(CRT_STORAGE_KEY);
  applyCrt(storedCrt && ["off", "low", "med", "high"].includes(storedCrt) ? storedCrt : "low");

  const storedSize = localStorage.getItem(SIZE_STORAGE_KEY);
  applySize(storedSize && ["normal", "large", "huge"].includes(storedSize) ? storedSize : "normal");

  initPhosphor();
  updateModeChips();

  const form = document.getElementById("cmdForm") as HTMLFormElement | null;
  const input = document.getElementById("cmdInput") as HTMLInputElement | null;

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  input?.addEventListener("input", () => renderSuggestion(input.value));

  input?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      handleKonamiKey(e.key);
      return;
    }
    const lowerKey = e.key.toLowerCase();
    if ((lowerKey === "b" || lowerKey === "a") && konamiIdx >= 8) {
      e.stopPropagation();
      handleKonamiKey(lowerKey);
      return;
    }
    if (e.key === "Tab") {
      const s = getSuggestion(input.value);
      if (s) {
        e.preventDefault();
        input.value += s.rest;
        renderSuggestion(input.value);
      }
    }
  });

  // Mobile easter-egg trigger — tapping compact ">_ HYPERSYN" header 5 times runs Pac-Man sweep
  const asciiHdrSm = document.getElementById("asciiHdrSm");
  let mobileTapCount = 0;
  let mobileTapTimeout: ReturnType<typeof setTimeout> | undefined;

  asciiHdrSm?.addEventListener("click", () => {
    clearTimeout(mobileTapTimeout);
    mobileTapCount++;
    if (mobileTapCount >= 5) {
      mobileTapCount = 0;
      runKonamiAnimation();
      return;
    }
    mobileTapTimeout = setTimeout(() => {
      mobileTapCount = 0;
    }, 1200);
  });

  const boot = () => {
    const initInput = document.getElementById("chordsInput") as HTMLInputElement | null;
    if (initInput && initInput.value.trim()) {
      loadProgression(initInput.value.trim());
    }
    // Run boot POST animation after chords are loaded
    setTimeout(() => {
      const count = document.querySelectorAll(".chord-row-wrapper").length;
      runBoot(count || 8);
    }, 50);
  };

  const params = new URLSearchParams(window.location.search);
  if (params.getAll("p").length === 0 && params.getAll("progression").length === 0) {
    boot();
  }
};

