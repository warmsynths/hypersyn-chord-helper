/**
 * Phosphor Engine — glow charge and decay simulation.
 *
 * When a chord is played or the terminal boots up, target UI elements
 * "charge" to full brightness, then decay over the configured persistence
 * window. The glow colour comes from the current theme's --glow-rgb CSS variable
 * so it adapts automatically to every colour theme (monokai -> pink, amber -> orange, etc.).
 */

// ─── Persistence presets ──────────────────────────────────────────────
const PERSIST_MAP: Record<string, number> = {
  short: 1200,
  normal: 2400,
  long: 5000,
  off: 1,
};

const PERSIST_STORAGE_KEY = "hypersynPhosphorPersist";
const DECAY_TICK_MS = 90;

let persistMs = 2400;
let heats: Record<string | number, number> = {};
let decayTimer: ReturnType<typeof setInterval> | null = null;
let onGlowUpdate: ((key: string | number, heat: number) => void) | null = null;

// ─── Reduced motion helper ───────────────────────────────────────────
export const reducedMotion = (): boolean => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

// ─── Persistence control ─────────────────────────────────────────────
export const getPersistMs = (): number => persistMs;

export const getPersistLabel = (): string => {
  const key = Object.keys(PERSIST_MAP).find((k) => PERSIST_MAP[k] === persistMs);
  return key || "custom";
};

export const setPersistence = (level: string): boolean => {
  if (!PERSIST_MAP[level]) return false;
  persistMs = PERSIST_MAP[level];
  try {
    localStorage.setItem(PERSIST_STORAGE_KEY, level);
  } catch {}
  return true;
};

export const PERSIST_PRESETS = PERSIST_MAP;

// ─── Glow callback registration ─────────────────────────────────────
export const setGlowCallback = (cb: (key: string | number, heat: number) => void): void => {
  onGlowUpdate = cb;
};

// ─── Charge / heat ───────────────────────────────────────────────────
export const charge = (target: string | number, amount: number = 1): void => {
  if (reducedMotion()) return;
  heats[target] = Math.min(1, Math.max(0, amount));
  if (onGlowUpdate) onGlowUpdate(target, heats[target]);
  startDecay();
};

export const chargeAll = (count: number, amount: number = 0.5): void => {
  for (let i = 0; i < count; i++) charge(i, amount);
};

export const chargeEverything = (chordCount: number, amount: number = 0.9): void => {
  if (reducedMotion()) return;
  charge("header", amount);
  charge("boot-text", amount);
  charge("hints", amount);
  charge("cmd-bar", amount);
  charge("history", amount);
  for (let i = 0; i < chordCount; i++) {
    charge(i, amount);
  }
};

export const getHeat = (target: string | number): number => heats[target] ?? 0;

export const resetHeats = (): void => {
  heats = {};
};

// ─── Decay loop ──────────────────────────────────────────────────────
function startDecay(): void {
  if (decayTimer) return;
  decayTimer = setInterval(() => {
    let live = false;
    const keys = Object.keys(heats);
    for (const k of keys) {
      const target = isNaN(Number(k)) ? k : Number(k);
      const v = heats[target] - DECAY_TICK_MS / persistMs;
      if (v > 0.004) {
        heats[target] = v;
        live = true;
      } else {
        delete heats[target];
        if (onGlowUpdate) onGlowUpdate(target, 0);
        continue;
      }
      if (onGlowUpdate) onGlowUpdate(target, heats[target]);
    }
    if (!live && decayTimer) {
      clearInterval(decayTimer);
      decayTimer = null;
    }
  }, DECAY_TICK_MS);
}

export const stopDecay = (): void => {
  if (decayTimer) {
    clearInterval(decayTimer);
    decayTimer = null;
  }
};

// ─── Glow CSS application ────────────────────────────────────────────
/**
 * Reads the current --glow-rgb from the document and builds multi-layer
 * text-shadow + brightness filter for the given heat level.
 */
export const applyGlow = (el: HTMLElement, heat: number): void => {
  if (heat <= 0.004) {
    el.style.textShadow = "";
    el.style.filter = "";
    return;
  }
  const style = getComputedStyle(document.documentElement);
  const rgb = style.getPropertyValue("--glow-rgb").trim() || "50, 236, 255";

  const s1 = (1 + 4 * heat).toFixed(1);
  const a1 = (0.3 + 0.7 * heat).toFixed(3);
  const s2 = (6 + 18 * heat).toFixed(1);
  const a2 = (0.15 + 0.6 * heat).toFixed(3);
  const s3 = (14 + 40 * heat).toFixed(1);
  const a3 = (0.45 * heat).toFixed(3);

  el.style.textShadow = `0 0 ${s1}px rgba(${rgb}, ${a1}), 0 0 ${s2}px rgba(${rgb}, ${a2}), 0 0 ${s3}px rgba(${rgb}, ${a3})`;
  el.style.filter = `brightness(${(1 + 0.4 * heat).toFixed(2)})`;
};

export const applyGlowToRow = applyGlow;

/**
 * Standard dispatcher for terminal element glow updates.
 */
export const dispatchGlowUpdate = (key: string | number, heat: number): void => {
  if (typeof key === "number" || !isNaN(Number(key))) {
    const idx = Number(key);
    const row = document.getElementById("chord-row-wrapper" + idx);
    if (row) applyGlow(row, heat);
    return;
  }

  switch (key) {
    case "header": {
      const ascii = document.querySelector(".ascii-hdr") as HTMLElement | null;
      if (ascii) applyGlow(ascii, heat);
      const asciiSm = document.getElementById("asciiHdrSm");
      if (asciiSm) applyGlow(asciiSm, heat);
      break;
    }
    case "boot-text": {
      const bootText = document.querySelector(".boot-text") as HTMLElement | null;
      if (bootText) applyGlow(bootText, heat);
      break;
    }
    case "hints": {
      const hints = document.querySelectorAll(".term-hint, .voicing-hint-desktop, .voicing-hint-mobile");
      hints.forEach((h) => applyGlow(h as HTMLElement, heat));
      break;
    }
    case "cmd-bar": {
      const prompt = document.querySelector(".cmd-prompt") as HTMLElement | null;
      const input = document.getElementById("cmdInput") as HTMLElement | null;
      const cmdRow = document.querySelector(".cmd-input-row") as HTMLElement | null;
      if (prompt) applyGlow(prompt, heat);
      if (input) applyGlow(input, heat);
      if (cmdRow) {
        if (heat <= 0.004) {
          cmdRow.style.borderColor = "";
        } else {
          const style = getComputedStyle(document.documentElement);
          const rgb = style.getPropertyValue("--glow-rgb").trim() || "50, 236, 255";
          cmdRow.style.borderColor = `rgba(${rgb}, ${(0.2 + 0.35 * heat).toFixed(2)})`;
        }
      }
      break;
    }
    case "history": {
      const lines = document.querySelectorAll(".cmd-history-line");
      lines.forEach((l) => applyGlow(l as HTMLElement, heat));
      break;
    }
    default: {
      const el = document.getElementById(key);
      if (el) applyGlow(el, heat);
      break;
    }
  }
};

// ─── Initialise from localStorage ────────────────────────────────────
export const initPhosphor = (): void => {
  try {
    const stored = localStorage.getItem(PERSIST_STORAGE_KEY);
    if (stored && PERSIST_MAP[stored]) {
      persistMs = PERSIST_MAP[stored];
    }
  } catch {}
  setGlowCallback(dispatchGlowUpdate);
};
