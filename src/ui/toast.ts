/**
 * Displays a toast notification using the Condiiox tracker theme styles.
 *
 * @param {string} message - The message to display.
 * @param {string} [type="info"] - The type of toast: "success" | "info" | "error".
 * @returns {void}
 */
export const showToast = (message: string, type: "success" | "info" | "error" = "info"): void => {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  // Keep at most 2 stacked toasts
  while (container.children.length >= 2) {
    container.removeChild(container.firstChild!);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  container.appendChild(toast);

  // Auto-dismiss after 2.4 s with a fade-out
  setTimeout(() => {
    toast.style.transition = "opacity 0.5s ease";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 500);
  }, 2400);
};
