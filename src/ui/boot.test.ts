import { runBoot, cleanupBoot, isBootActive } from './boot';
import * as phosphor from './phosphor';

describe('boot sequence module', () => {
  beforeEach(() => {
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
});
