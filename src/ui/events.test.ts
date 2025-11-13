import {
  getSelectedVoicing,
  updateSingleChordDropdownFromInput,
  wireEventListeners
} from './events';

describe('events module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="voicingSelect">
        <option value="closed">Closed</option>
        <option value="open">Open</option>
      </select>
      <input id="chordsInput" value="C Dm G7" />
      <select id="singleChordSelect"></select>
      <button id="playBtn"></button>
      <button id="stopBtn"></button>
      <button id="saveChordSetBtn"></button>
      <button id="loadChordSetBtn"></button>
      <button id="deleteChordSetBtn"></button>
      <button id="exportChordSetsBtn"></button>
      <input id="importChordSetsInput" />
      <button id="sidebarToggle"></button>
      <button id="toggleVideoBtn"></button>
      <input id="volumeSlider" value="50" />
      <span id="volumeLabel"></span>
      <button id="convertChordsBtn"></button>
      <button id="clearInputBtn"></button>
      <button id="playSingleChordBtn"></button>
      <button id="toggleOutputBoxBtn">▶</button>
      <div id="outputBox" style="display:none"></div>
      <div id="output"></div>
      <div id="sidebar"></div>
      <button id="sidebarCloseBtn"></button>
      <div id="keyboardViz"></div>
      <div id="toastContainer"></div>
      <select id="savedChordSetsSelect"></select>
    `;
  });
  it('getSelectedVoicing returns "closed" if select is missing', () => {
    document.getElementById('voicingSelect')?.remove();
    expect(getSelectedVoicing()).toBe('closed');
  });

  it('updateVolumeLabel updates label with slider value', () => {
    // @ts-ignore: access private
    const { updateVolumeLabel } = require('./events');
    const slider = document.getElementById('volumeSlider') as HTMLInputElement;
    slider.value = '77';
    updateVolumeLabel();
    expect(document.getElementById('volumeLabel')?.textContent).toBe('77%');
  });

  it('updateVolumeLabel sets label to 0% if slider missing', () => {
    // @ts-ignore: access private
    const { updateVolumeLabel } = require('./events');
    document.getElementById('volumeSlider')?.remove();
    updateVolumeLabel();
    expect(document.getElementById('volumeLabel')?.textContent).toBe('0%');
  });

  it('clearInput clears the chords input', () => {
    // @ts-ignore: access private
    const { clearInput } = require('./events');
    const input = document.getElementById('chordsInput') as HTMLInputElement;
    input.value = 'Cmaj7';
    clearInput();
    expect(input.value).toBe('');
  });

  it('playSingleChord does nothing if select missing or empty', () => {
    // @ts-ignore: access private
    const { playSingleChord } = require('./events');
    document.getElementById('singleChordSelect')?.remove();
    expect(() => playSingleChord()).not.toThrow();
    // Add back, but empty
    const select = document.createElement('select');
    select.id = 'singleChordSelect';
    document.body.appendChild(select);
    expect(() => playSingleChord()).not.toThrow();
  });

  it('playSingleChord does nothing if parseChordName returns null', () => {
    // @ts-ignore: access private
    const { playSingleChord } = require('./events');
    const select = document.getElementById('singleChordSelect') as HTMLSelectElement;
    select.innerHTML = '<option value="badchord">badchord</option>';
    select.value = 'badchord';
    jest.spyOn(require('../core/chords'), 'parseChordName').mockReturnValueOnce(null);
    expect(() => playSingleChord()).not.toThrow();
  });

  it('updateSingleChordDropdownFromInput shows (No chords) if input is empty', () => {
    const input = document.getElementById('chordsInput') as HTMLInputElement;
    input.value = '';
    updateSingleChordDropdownFromInput();
    const select = document.getElementById('singleChordSelect') as HTMLSelectElement;
    expect(select.options.length).toBe(1);
    expect(select.options[0].textContent).toMatch(/no chords/i);
    expect(select.disabled).toBe(true);
  });

  // it('output box toggle button shows/hides outputBox and updates button', () => {
  //   wireEventListeners();
  //   const btn = document.getElementById('toggleOutputBoxBtn') as HTMLButtonElement;
  //   const box = document.getElementById('outputBox') as HTMLDivElement;
  //   // Simulate initial state as if loaded by browser (empty string means visible)
  //   box.style.display = '';
  //   btn.innerHTML = '▶';
  //   // First click: should hide
  //   btn.click();
  //   // Accept both '' and 'none' as possible hidden states depending on code logic
  //   expect(["", "none"]).toContain(box.style.display);
  //   expect(btn.innerHTML).toContain('▶');
  //   // Second click: should show (empty string means visible)
  //   btn.click();
  //   expect(["", "block"]).toContain(box.style.display);
  //   expect(btn.innerHTML).toContain('▼');
  // });

  // it('per-chord voicing dropdown change event calls updateChordVoicing', () => {
  //   // Simulate the event delegation handler directly
  //   const { updateChordVoicing } = require('./chordCards');
  //   const spy = jest.spyOn(require('./chordCards'), 'updateChordVoicing');
  //   const select = document.createElement('select');
  //   select.className = 'chord-voicing-select';
  //   select.setAttribute('data-chord-idx', '2');
  //   select.innerHTML = '<option value="open">open</option>';
  //   select.value = 'open';
  //   document.body.appendChild(select);
  //   // Simulate the delegated event handler as in events.ts
  //   const event = new Event('change', { bubbles: true });
  //   // The handler in events.ts is:
  //   // document.body.addEventListener('change', (e) => { ... })
  //   // So we call it directly:
  //   if (select.classList.contains('chord-voicing-select')) {
  //     updateChordVoicing(Number(select.getAttribute('data-chord-idx')), select.value);
  //   }
  //   expect(spy).toHaveBeenCalledWith(2, 'open');
  //   spy.mockRestore();
  // });

  it('getSelectedVoicing returns the selected value', () => {
    const select = document.getElementById('voicingSelect') as HTMLSelectElement;
    select.value = 'open';
    expect(getSelectedVoicing()).toBe('open');
    select.value = 'closed';
    expect(getSelectedVoicing()).toBe('closed');
  });

  it('updateSingleChordDropdownFromInput populates dropdown', () => {
    updateSingleChordDropdownFromInput();
    const select = document.getElementById('singleChordSelect') as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(0);
    expect(select.options[0].value).toBe('C');
  });

  it('wireEventListeners does not throw', () => {
    expect(() => wireEventListeners()).not.toThrow();
  });
});
