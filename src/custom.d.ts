declare module 'human-engine' {
  export interface ChordOption {
    label: string;
    value: string;
  }
  export const CHORD_CORES: ChordOption[];
  export const CHORD_MODIFIERS: ChordOption[];
  export function getChordSuffix(core: string, modifier: string): string;
}
