/**
 * Toggles the sidebar open/close state and updates the toggle button style.
 *
 * @returns {void}
 */
/**
 * Toggles the sidebar open/close state and updates the toggle button style.
 * When opening, adds a document click listener to close the sidebar if clicking outside.
 * When closing, removes the document click listener.
 *
 * @returns {void}
 */
let sidebarOutsideClickListener = null;
export const toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  if (sidebar.classList.contains("-translate-x-full")) {
    sidebar.classList.remove("-translate-x-full");
    toggleBtn.classList.add("sidebar-toggle-fade");
    // Add outside click listener
    sidebarOutsideClickListener = (e) => {
      // Only close if click is outside sidebar and not on toggle button
      if (
        sidebar &&
        !sidebar.contains(e.target) &&
        (!toggleBtn || !toggleBtn.contains(e.target))
      ) {
        toggleSidebar();
      }
    };
    setTimeout(() => {
      // Delay to avoid immediate close from the click that opened it
      document.addEventListener("mousedown", sidebarOutsideClickListener);
    }, 0);
  } else {
    sidebar.classList.add("-translate-x-full");
    toggleBtn.classList.remove("sidebar-toggle-fade");
    // Remove outside click listener
    if (sidebarOutsideClickListener) {
      document.removeEventListener("mousedown", sidebarOutsideClickListener);
      sidebarOutsideClickListener = null;
    }
  }
}
