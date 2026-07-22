import { wireEventListeners } from "./ui/events";
import { initTerminal } from "./ui/terminal";

// Entry point: wire up all UI event listeners
wireEventListeners();

document.addEventListener("DOMContentLoaded", () => {
  initTerminal();
});
