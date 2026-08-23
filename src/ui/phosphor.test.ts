import {
  charge,
  chargeAll,
  chargeEverything,
  getHeat,
  resetHeats,
  applyGlow,
  setGlowCallback,
  dispatchGlowUpdate,
  initPhosphor,
  setPersistence,
  getPersistMs,
  getPersistLabel,
  stopDecay,
} from './phosphor';

describe('phosphor module', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetHeats();
    stopDecay();
    document.body.innerHTML = `
      <div class="ascii-hdr">HEADER</div>
      <div id="asciiHdrSm">HEADER SM</div>
      <div class="boot-text">BOOT</div>
      <div class="term-hint">HINT</div>
      <div class="cmd-input-row">
        <span class="cmd-prompt">></span>
        <input id="cmdInput" />
      </div>
      <div id="chord-row-wrapper0">CHORD 0</div>
      <div id="chord-row-wrapper1">CHORD 1</div>
    `;
  });

  afterEach(() => {
    stopDecay();
    jest.useRealTimers();
  });

  it('charges numeric row targets and retrieves heat', () => {
    charge(0, 0.8);
    expect(getHeat(0)).toBe(0.8);
    expect(getHeat(1)).toBe(0);
  });

  it('charges string-named UI targets', () => {
    charge('header', 0.95);
    charge('boot-text', 0.9);
    expect(getHeat('header')).toBe(0.95);
    expect(getHeat('boot-text')).toBe(0.9);
  });

  it('chargeEverything charges all UI sections and rows', () => {
    chargeEverything(2, 0.85);
    expect(getHeat('header')).toBe(0.85);
    expect(getHeat('boot-text')).toBe(0.85);
    expect(getHeat('hints')).toBe(0.85);
    expect(getHeat('cmd-bar')).toBe(0.85);
    expect(getHeat(0)).toBe(0.85);
    expect(getHeat(1)).toBe(0.85);
  });

  it('applyGlow sets multi-layer text-shadow and filter', () => {
    const el = document.createElement('div');
    applyGlow(el, 0.8);
    expect(el.style.textShadow).toContain('px rgba(');
    expect(el.style.filter).toContain('brightness(');

    applyGlow(el, 0);
    expect(el.style.textShadow).toBe('');
    expect(el.style.filter).toBe('');
  });

  it('dispatchGlowUpdate applies glow to DOM elements for string and numeric keys', () => {
    const header = document.querySelector('.ascii-hdr') as HTMLElement;
    const row = document.getElementById('chord-row-wrapper0') as HTMLElement;
    const prompt = document.querySelector('.cmd-prompt') as HTMLElement;

    dispatchGlowUpdate('header', 0.9);
    expect(header.style.textShadow).not.toBe('');

    dispatchGlowUpdate(0, 0.9);
    expect(row.style.textShadow).not.toBe('');

    dispatchGlowUpdate('cmd-bar', 0.9);
    expect(prompt.style.textShadow).not.toBe('');

    // Reset
    dispatchGlowUpdate('header', 0);
    expect(header.style.textShadow).toBe('');
  });

  it('decays heat over time and notifies callback', () => {
    const glowUpdates: Record<string | number, number> = {};
    setGlowCallback((key, heat) => {
      glowUpdates[key] = heat;
    });

    charge(0, 1.0);
    expect(getHeat(0)).toBe(1.0);

    // Advance timers through several decay ticks (tick is 90ms)
    jest.advanceTimersByTime(270);
    expect(getHeat(0)).toBeLessThan(1.0);
    expect(getHeat(0)).toBeGreaterThan(0);
    expect(glowUpdates[0]).toBe(getHeat(0));

    // Advance past total persistence window (2400ms)
    jest.advanceTimersByTime(3000);
    expect(getHeat(0)).toBe(0);
    expect(glowUpdates[0]).toBe(0);
  });

  it('persistence level settings can be changed and stored', () => {
    expect(setPersistence('short')).toBe(true);
    expect(getPersistMs()).toBe(1200);
    expect(getPersistLabel()).toBe('short');

    expect(setPersistence('invalid')).toBe(false);
  });
});
