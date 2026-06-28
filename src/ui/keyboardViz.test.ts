import { updateKeyboardViz } from './keyboardViz';

describe('keyboardViz module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="keyboardViz"></div>
      <select id="voicingSelect">
        <option value="closed">Closed</option>
        <option value="open-triad">Open Triad</option>
        <option value="drop2">Drop2</option>
      </select>
    `;
  });

  it('updateKeyboardViz is a no-op and does not throw', () => {
    expect(() => updateKeyboardViz()).not.toThrow();
  });
});
