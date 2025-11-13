import { toggleSidebar } from './sidebar';

describe('sidebar module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sidebar" class="-translate-x-full"></div>
      <button id="sidebarToggle"></button>
    `;
  });

  it('toggleSidebar opens the sidebar', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.add('-translate-x-full');
    toggleSidebar();
    expect(sidebar?.classList.contains('-translate-x-full')).toBe(false);
  });

  it('toggleSidebar closes the sidebar', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.remove('-translate-x-full');
    toggleSidebar();
    expect(sidebar?.classList.contains('-translate-x-full')).toBe(true);
  });

  it('toggleSidebar does not throw if called repeatedly', () => {
    expect(() => {
      toggleSidebar();
      toggleSidebar();
      toggleSidebar();
    }).not.toThrow();
  });
});
