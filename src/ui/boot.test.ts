import {
  runBoot,
  cleanupBoot,
  isBootActive,
  isBootEnabled,
  setBootEnabled,
  toggleBootEnabled,
  shouldRunStartupBoot,
  BOOT_STORAGE_KEY,
} from './boot';
import * as phosphor from './phosphor';

describe('boot sequence module', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    jest.useFakeTimers();
    phosphor.resetHeats();
    phosphor.stopDecay();
    document.body.innerHTML = `
      <div id="crt-box">
        <div id="bootOverlay" style="display:none;"></div>
        <div class="crt-content">
          <pre class="ascii-hdr">HEADER</pre>
          <div class="boot-text">BOOT TEXT</div>
          <div class="term-hint">HINT</div>
          <div class="chord-row-wrapper" id="chord-row-wrapper0"></div>
          <div class="chord-row-wrapper" id="chord-row-wrapper1"></div>
          <div class="cmd-input-row">
            <span class="cmd-prompt">></span>
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    cleanupBoot();
    phosphor.stopDecay();
    jest.useRealTimers();
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('reveals terminal and charges all elements with phosphor glow after POST completes', () => {
    const chargeEverythingSpy = jest.spyOn(phosphor, 'chargeEverything');

    runBoot(2);
    expect(isBootActive()).toBe(true);

    // Fast-forward through POST script (~3.5 seconds)
    jest.advanceTimersByTime(4500);

    expect(chargeEverythingSpy).toHaveBeenCalledWith(2, 1.0);
    expect(isBootActive()).toBe(false);
  });

  it('charges all elements when boot is skipped via keypress', () => {
    const chargeEverythingSpy = jest.spyOn(phosphor, 'chargeEverything');

    runBoot(2);
    expect(isBootActive()).toBe(true);

    // Arm skip
    jest.advanceTimersByTime(150);

    // Press any key to skip
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(isBootActive()).toBe(false);
    expect(chargeEverythingSpy).toHaveBeenCalled();
  });

  describe('boot configuration and single-play logic', () => {
    it('isBootEnabled defaults to true on fresh state, and reflects stored state', () => {
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBeNull();
      expect(isBootEnabled()).toBe(true);

      localStorage.setItem(BOOT_STORAGE_KEY, 'off');
      expect(isBootEnabled()).toBe(false);

      localStorage.setItem(BOOT_STORAGE_KEY, 'on');
      expect(isBootEnabled()).toBe(true);
    });

    it('setBootEnabled updates storage and syncs boot-off class on documentElement', () => {
      setBootEnabled(false);
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBe('off');
      expect(document.documentElement.classList.contains('boot-off')).toBe(true);
      expect(isBootEnabled()).toBe(false);

      setBootEnabled(true);
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBe('on');
      expect(document.documentElement.classList.contains('boot-off')).toBe(false);
      expect(isBootEnabled()).toBe(true);
    });

    it('toggleBootEnabled flips between on and off', () => {
      // Starts unconfigured (evaluates to true) -> toggling turns it off
      expect(toggleBootEnabled()).toBe(false);
      expect(isBootEnabled()).toBe(false);
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBe('off');

      expect(toggleBootEnabled()).toBe(true);
      expect(isBootEnabled()).toBe(true);
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBe('on');
    });

    it('shouldRunStartupBoot plays once on first visit and automatically toggles off by default', () => {
      // First visit: no localStorage entry exists
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBeNull();

      // Should run boot, and persist "off" to storage
      const shouldRunFirstTime = shouldRunStartupBoot();
      expect(shouldRunFirstTime).toBe(true);
      expect(localStorage.getItem(BOOT_STORAGE_KEY)).toBe('off');
      expect(isBootEnabled()).toBe(false);

      // Subsequent visit: should NOT run boot
      const shouldRunSecondTime = shouldRunStartupBoot();
      expect(shouldRunSecondTime).toBe(false);
    });

    it('shouldRunStartupBoot honors explicit on setting', () => {
      setBootEnabled(true);
      expect(shouldRunStartupBoot()).toBe(true);
    });

    it('shouldRunStartupBoot honors explicit off setting', () => {
      setBootEnabled(false);
      expect(shouldRunStartupBoot()).toBe(false);
    });

    it('runBoot removes boot-off on launch and restores boot-off after completion if disabled', () => {
      setBootEnabled(false);
      expect(document.documentElement.classList.contains('boot-off')).toBe(true);

      runBoot(2);
      expect(document.documentElement.classList.contains('boot-off')).toBe(false);

      // Fast-forward to completion
      jest.advanceTimersByTime(4500);
      expect(document.documentElement.classList.contains('boot-off')).toBe(true);
    });
  });
});

