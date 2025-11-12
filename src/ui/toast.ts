/**
 * Displays a toast notification (Tailwind styled).
 *
 * @param {string} message - The message to display.
 * @param {string} [type="info"] - The type of toast: success, info, error.
 * @returns {void}
 */
export function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  while (container.children.length > 2)
    container.removeChild(container.firstChild);
  const colors = {
    success: "bg-pink-600 text-white border-pink-400",
    info: "bg-blue-600 text-white border-blue-400",
    error: "bg-gray-700 text-red-200 border-red-400",
  };
  const toast = document.createElement("div");
  toast.className = `px-4 py-2 rounded shadow-lg border ${
    colors[type] || colors.info
  } text-lg mb-2 animate-fadeIn`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("animate-fadeOut");
    setTimeout(() => container.removeChild(toast), 600);
  }, 2200);
}
