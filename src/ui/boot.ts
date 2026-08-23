/**
 * Boot Sequence — CRT POST animation.
 *
 * Simulates a vintage hardware power-on self-test:
 *   1. POST text scrolls in a fixed overlay
 *   2. Terminal reveals with phosphor glow across all elements
 *
 * Skip: any keypress during boot jumps straight to ready state.
 * Reduced motion: entire sequence is bypassed.
 */

import { chargeEverything, reducedMotion } from "./phosphor";

// ─── Boot state ──────────────────────────────────────────────────────
let bootTimers: ReturnType<typeof setTimeout>[] = [];
let bootArmed = false;
let isBooting = false;

// ─── Helpers ─────────────────────────────────────────────────────────
const hex = (v: number, d: number): string =>
  v.toString(16).toUpperCase().padStart(d, "0");
const r = (a: number, b: number): number =>
  a + Math.floor(Math.random() * (b - a + 1));
const word = (): string => hex(r(0, 65535), 4);

// ─── Build the POST script ──────────────────────────────────────────
export const buildBootScript = (chordCount: number): [string, number][] => {
  return [
    ["HYPERSYN MONITOR 1.04  4096 BYTE ROM  $E000", 46],
    ["", 30],
    ["CPU   MC68010  7.1590MHz     OK", 40],
    ["MMU   PAGE 4K  SUPERVISOR    OK", 34],
    ["RAM   $000000-$007FFF  32K   OK", 34],
    [
      "RAM   $008000-$00FFFF  32K   " + hex(r(0, 255), 2) + " PARITY",
      300,
    ],
    ["      RETRY 1 ................ OK", 44],
    ["ROM   CRC " + word() + " EXPECT " + word(), 34],
    ["      NONFATAL - CONTINUE", 120],
    ["", 26],
    ["CRT   YOKE " + r(1, 2) + "." + r(0, 9) + "A  HV 18.4kV", 34],
    ["      PHOSPHOR AMBER  DECAY 2.4E-1", 34],
    [
      "      RETENTION MAP 0 ENTR @ $" + hex(r(2048, 65535), 4),
      200,
    ],
    ["DAC   12BIT  A=440.000  DRIFT -0.3c", 34],
    [
      "TBL   INTERVAL SET " +
        hex(r(16, 255), 2) +
        "  " +
        chordCount +
        " VOICE",
      34,
    ],
    ["", 26],
    ["RETICULATING SPLINES ......... " + r(11, 39) + "%", 240],
    ["RETICULATING SPLINES ......... 100%", 60],
    ["FROBNICATING GRONKULATOR ..... OK", 34],
    ["MAGIC / MORE MAGIC SWITCH .... MAGIC", 34],
    ["HALT AND CATCH FIRE .......... DEFERRED", 180],
    ["", 26],
    ["IRQ2  KBD    VECTOR $" + word(), 30],
    ["IRQ4  ----   UNCLAIMED, MASKED", 30],
    ["IRQ6  TIMER  VECTOR $" + word(), 30],
    ["LP0   ON FIRE (IGNORED)", 34],
    ["LPT1  PC LOAD LETTER", 160],
    ["", 26],
    ["KEYBOARD NOT FOUND -- PRESS F1", 260],
    ["      FOUND IT. NEVER MIND.", 120],
    ["TOWERS OF HANOI  3 DISC ...... OK", 34],
    ["640K CONVENTIONAL - ENOUGH FOR ANYONE", 34],
    ["Y2K COMPLIANT (OPTIMISTIC)", 160],
    ["", 26],
    [
      "DUMP  " +
        word() + " " + word() + " " + word() + " " + word() +
        "  " + word() + " " + word(),
      22,
    ],
    [
      "      " +
        word() + " " + word() + " " + word() + " " + word() +
        "  " + word() + " " + word(),
      22,
    ],
    [
      "      " +
        word() + " " + word() + " " + word() + " " + word() +
        "  " + word() + " " + word(),
      180,
    ],
    ["", 26],
    ["ABORT, RETRY, FAIL? ..... F", 140],
    ["BOOT  DEV 2 :: TTY1", 40],
    [
      "LOAD  HYPERSYN.CHORD  " + hex(r(4096, 65535), 4) + " BYTE",
      260,
    ],
    ["READY.", 200],
  ];
};

// ─── DOM management ──────────────────────────────────────────────────
function getOverlay(): HTMLElement | null {
  return document.getElementById("bootOverlay");
}

function getCrtContent(): HTMLElement | null {
  return document.querySelector(".crt-content");
}

function showOverlay(): void {
  const overlay = getOverlay();
  if (overlay) {
    overlay.style.display = "flex";
    overlay.innerHTML = "";
  }
  // Hide main content during POST
  const content = getCrtContent();
  if (content) content.style.opacity = "0";
}

function hideOverlay(): void {
  const overlay = getOverlay();
  if (overlay) {
    overlay.style.display = "none";
    overlay.innerHTML = "";
  }
  const content = getCrtContent();
  if (content) content.style.opacity = "1";
}

function appendPostLine(text: string): void {
  const overlay = getOverlay();
  if (!overlay) return;
  const line = document.createElement("div");
  line.className = "boot-post-line";
  line.textContent = text;
  overlay.appendChild(line);
  // Auto-scroll to bottom
  overlay.scrollTop = overlay.scrollHeight;
}

// ─── Content reveal + phosphor charge across all elements ────────────
function revealAndGlow(chordCount: number, onComplete: () => void): void {
  // Reveal content
  const content = getCrtContent();
  if (content) content.style.opacity = "1";

  // Reveal all rows
  showAllChordRows();

  // Charge all terminal elements with phosphor glow
  chargeEverything(chordCount, 1.0);

  bootTimers.push(
    setTimeout(() => {
      onComplete();
    }, 80)
  );
}

// ─── Row hiding for reveal ───────────────────────────────────────────
function hideChordRows(): void {
  const rows = document.querySelectorAll(".chord-row-wrapper");
  rows.forEach((row) => {
    (row as HTMLElement).classList.add("boot-hidden");
    (row as HTMLElement).classList.remove("boot-revealed");
  });
}

function showAllChordRows(): void {
  const rows = document.querySelectorAll(".chord-row-wrapper");
  rows.forEach((row) => {
    (row as HTMLElement).classList.remove("boot-hidden");
    (row as HTMLElement).classList.add("boot-revealed");
  });
}

// ─── End boot ────────────────────────────────────────────────────────
function endBoot(instant?: boolean): void {
  bootTimers.forEach(clearTimeout);
  bootTimers = [];
  bootArmed = false;
  isBooting = false;

  hideOverlay();

  const count = document.querySelectorAll(".chord-row-wrapper").length;
  revealAndGlow(count, () => {
    showAllChordRows();
  });

  // Remove skip listener
  window.removeEventListener("keydown", skipHandler);
}

// ─── Skip handler ────────────────────────────────────────────────────
function skipHandler(e: KeyboardEvent): void {
  if (!bootArmed || !isBooting || e.key === "Tab") return;
  endBoot(true);
}

// ─── Run boot ────────────────────────────────────────────────────────
export const runBoot = (chordCount: number): void => {
  // Clean up any previous boot
  bootTimers.forEach(clearTimeout);
  bootTimers = [];
  bootArmed = false;
  isBooting = true;

  if (reducedMotion()) {
    isBooting = false;
    showAllChordRows();
    chargeEverything(chordCount, 0.5);
    return;
  }

  // Arm skip after a brief delay (prevent accidental skip)
  bootTimers.push(
    setTimeout(() => {
      bootArmed = true;
    }, 100)
  );

  // Wire skip handler
  window.addEventListener("keydown", skipHandler);

  // Hide chord rows for reveal
  hideChordRows();

  // Show POST overlay
  showOverlay();

  // Build and schedule POST lines
  const script = buildBootScript(chordCount);
  let t = 60;
  script.forEach(([text, delay]) => {
    t += delay;
    bootTimers.push(
      setTimeout(() => {
        appendPostLine(text);
      }, t)
    );
  });

  // After POST, transition to content reveal and phosphor glow
  bootTimers.push(
    setTimeout(() => {
      hideOverlay();
      revealAndGlow(chordCount, () => {
        showAllChordRows();
        isBooting = false;
        bootArmed = false;
        window.removeEventListener("keydown", skipHandler);
      });
    }, t + 250)
  );
};

export const isBootActive = (): boolean => isBooting;

// ─── Cleanup ─────────────────────────────────────────────────────────
export const cleanupBoot = (): void => {
  bootTimers.forEach(clearTimeout);
  bootTimers = [];
  bootArmed = false;
  isBooting = false;
  window.removeEventListener("keydown", skipHandler);
};
