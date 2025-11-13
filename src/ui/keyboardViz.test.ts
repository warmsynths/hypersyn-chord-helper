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

  it('updateKeyboardViz renders SVG', () => {
    const select = document.getElementById('voicingSelect') as HTMLSelectElement;
    select.value = 'closed';
    updateKeyboardViz();
    const div = document.getElementById('keyboardViz');
    expect(div?.innerHTML).toContain('<svg');
    expect(div?.innerHTML).toContain('C');
  });

  it('updateKeyboardViz does not throw for all voicings', () => {
    const select = document.getElementById('voicingSelect') as HTMLSelectElement;
    const voicings = ['closed', 'open-triad', 'drop2', 'drop3', 'spread', 'octave', 'first-inversion', 'second-inversion', 'third-inversion', 'shell-dominant', 'altered-dominant'];
    voicings.forEach(v => {
      select.value = v;
      expect(() => updateKeyboardViz()).not.toThrow();
    });
  });
});
