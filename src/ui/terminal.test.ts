import { initTerminal } from './terminal';
import { trackerStore } from './trackerStore';

describe('terminal module', () => {
  beforeEach(() => {
    localStorage.clear();
    trackerStore.reset();
    document.body.innerHTML = `
      <div id="cmdHistory"></div>
      <form id="cmdForm">
        <input id="cmdInput" type="text" />
      </form>
      <div id="cmdSuggestion"></div>
      <input id="chordsInput" value="" />
      <button id="convertChordsBtn"></button>
    `;

    // Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
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
    expect(history.children[1].textContent).toContain('mode    INTERVALS');
    expect(history.children[1].textContent).toContain('theme   Monokai');
    expect(history.children[1].innerHTML).toContain('<span style="color:var(--accent);">INTERVALS</span>');
    expect(history.children[1].innerHTML).toContain('<span style="color:var(--accent);">Monokai</span>');
  });

  it('handles export instr and export m8i commands', () => {
    initTerminal();
    trackerStore.loadSetsData(['Am7 Dm9 G13 Cmaj7']);

    const form = document.getElementById('cmdForm') as HTMLFormElement;
    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const history = document.getElementById('cmdHistory') as HTMLElement;

    input.value = 'export instr TESTPAD';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(history.children.length).toBe(2);
    expect(history.children[0].textContent).toBe('> export instr TESTPAD');
    expect(history.children[1].textContent).toContain("[ok] exported M8 instrument 'testpad.m8i'");
    expect(history.children[1].textContent).toContain('chord banks');
  });

  it('handles export song and export m8s commands', () => {
    initTerminal();
    trackerStore.loadSetsData(['Am7 Dm9 G13 Cmaj7']);

    const form = document.getElementById('cmdForm') as HTMLFormElement;
    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const history = document.getElementById('cmdHistory') as HTMLElement;

    input.value = 'export song MYTRACK';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(history.children.length).toBe(2);
    expect(history.children[0].textContent).toBe('> export song MYTRACK');
    expect(history.children[1].textContent).toContain("[ok] exported M8 song 'mytrack.m8s'");
    expect(history.children[1].textContent).toContain('1 chain(s)');
    expect(history.children[1].textContent).toContain('4 phrase(s)');
  });

  it('handles multi-set progression export with multiple chains', () => {
    initTerminal();
    trackerStore.loadSetsData(['Am7 Dm9 G13 Cmaj7', 'Fmaj7 Em7 Dm7 Cmaj7']);

    const form = document.getElementById('cmdForm') as HTMLFormElement;
    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const history = document.getElementById('cmdHistory') as HTMLElement;

    input.value = 'export m8s';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(history.children.length).toBe(2);
    expect(history.children[1].textContent).toContain("[ok] exported M8 song 'hypersyn-song.m8s'");
    expect(history.children[1].textContent).toContain('2 chain(s)');
    expect(history.children[1].textContent).toContain('8 phrase(s)');
  });

  it('prints warning when exporting progression that exceeds 16 chord shapes', () => {
    initTerminal();
    const eighteenChords = [
      'C', 'Cm', 'C7', 'Cmaj7', 'Cm7', 'Cdim', 'Cdim7', 'Caug',
      'Csus2', 'Csus4', 'C6', 'Cm6', 'C9', 'Cm9', 'Cmaj9', 'C11',
      'C13', 'Cadd9'
    ].join(' ');
    trackerStore.loadSetsData([eighteenChords]);

    const form = document.getElementById('cmdForm') as HTMLFormElement;
    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const history = document.getElementById('cmdHistory') as HTMLElement;

    input.value = 'export song';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(history.children.length).toBe(2);
    expect(history.children[1].textContent).toContain('[ok] exported M8 song');
    expect(history.children[1].textContent).toContain('[warn]');
    expect(history.children[1].textContent).toContain('16 chord bank limit');
  });

  it('includes export commands in help and about outputs', () => {
    initTerminal();

    const form = document.getElementById('cmdForm') as HTMLFormElement;
    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const history = document.getElementById('cmdHistory') as HTMLElement;

    input.value = 'help';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(history.children[1].textContent).toContain('export song [name]');
    expect(history.children[1].textContent).toContain('export instr [name]');

    input.value = 'about';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(history.children[3].textContent).toContain('export song|instr');
  });

  it('renders tab suggestions for export commands', () => {
    initTerminal();

    const input = document.getElementById('cmdInput') as HTMLInputElement;
    const suggestion = document.getElementById('cmdSuggestion') as HTMLElement;

    input.value = 'export s';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(suggestion.style.display).toBe('block');
    expect(suggestion.textContent).toContain('export song');
  });
});
