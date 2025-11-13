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
      <button id="toggleOutputBoxBtn"></button>
      <div id="outputBox"></div>
      <div id="output"></div>
      <div id="sidebar"></div>
      <button id="sidebarCloseBtn"></button>
      <div id="keyboardViz"></div>
      <div id="toastContainer"></div>
      <select id="savedChordSetsSelect"></select>
    `;
  });

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
