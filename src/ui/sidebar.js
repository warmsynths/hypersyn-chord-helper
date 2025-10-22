
/**
 * Toggles the sidebar open/close state and updates the toggle button style.
 */
export function toggleSidebar() {
	const sidebar = document.getElementById("sidebar");
	const toggleBtn = document.getElementById("sidebarToggle");
	if (sidebar.classList.contains("-translate-x-full")) {
		sidebar.classList.remove("-translate-x-full");
		toggleBtn.classList.add("sidebar-toggle-fade");
	} else {
		sidebar.classList.add("-translate-x-full");
		toggleBtn.classList.remove("sidebar-toggle-fade");
	}
}
