import { showToast } from './toast';

describe('toast module', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="toastContainer"></div>';
  });

  it('showToast adds a toast to the container', () => {
    showToast('Test message', 'success');
    const container = document.getElementById('toastContainer');
    expect(container?.children.length).toBeGreaterThan(0);
    expect(container?.textContent).toContain('Test message');
  });

  it('showToast handles multiple toasts', () => {
    showToast('First', 'info');
    showToast('Second', 'error');
    const container = document.getElementById('toastContainer');
    expect(container?.children.length).toBeGreaterThan(0);
    expect(container?.textContent).toContain('First');
    expect(container?.textContent).toContain('Second');
  });

  it('showToast does not throw for unknown type', () => {
    expect(() => showToast('Unknown', 'notatype')).not.toThrow();
  });
});
