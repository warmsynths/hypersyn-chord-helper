/**
 * Toggles the sidebar open/close state using CSS classes.
 * Uses the new Condiiox theme classes: `open` on #sidebar and `visible` on #sidebar-overlay.
 *
 * @returns {void}
 */
let _outsideClickListener: ((e: MouseEvent) => void) | null = null;

export const toggleSidebar = (): void => {
  const sidebar  = document.getElementById("sidebar");
  const overlay  = document.getElementById("sidebar-overlay");
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains("open");

  if (isOpen) {
    // Close
    sidebar.classList.remove("open");
    overlay?.classList.remove("visible");
    if (_outsideClickListener) {
      document.removeEventListener("mousedown", _outsideClickListener);
      _outsideClickListener = null;
    }
  } else {
    // Open
    sidebar.classList.add("open");
    overlay?.classList.add("visible");
    _outsideClickListener = (e: MouseEvent) => {
      if (
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        !(document.getElementById("sidebarToggle"))?.contains(e.target as Node)
      ) {
        toggleSidebar();
      }
    };
    setTimeout(() => {
      document.addEventListener("mousedown", _outsideClickListener!);
    }, 0);
  }
};
