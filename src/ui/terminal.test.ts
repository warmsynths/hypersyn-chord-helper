import { initTerminal } from './terminal';

describe('terminal module', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="cmdHistory"></div>
      <form id="cmdForm">
        <input id="cmdInput" type="text" />
      </form>
      <div id="cmdSuggestion"></div>
      <input id="chordsInput" value="" />
      <button id="convertChordsBtn"></button>
    `;
  });

  it('handles status command and outputs mode and theme info', () => {
    initTerminal();

    const form = document.getElementById('cmdForm') as HTMLFormElement;
    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const history = document.getElementById('cmdHistory') as HTMLElement;

    input.value = 'status';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(history.children.length).toBe(2);
    expect(history.children[0].textContent).toBe('> status');
    expect(history.children[1].textContent).toContain('MODE   INTERVALS');
    expect(history.children[1].textContent).toContain('THEME  Monokai');
    expect(history.children[1].innerHTML).toContain('<span style="color:var(--accent);">INTERVALS</span>');
    expect(history.children[1].innerHTML).toContain('<span style="color:var(--accent);">Monokai</span>');
  });
});
