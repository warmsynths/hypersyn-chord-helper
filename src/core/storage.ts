import { generateUUID } from "./utils";

export interface ChordSet {
  id: string;
  name: string;
  chords?: string;
  chordSets: string[];
}

/**
 * Retrieves all saved chord sets from localStorage, automatically migrating old schema presets.
 */
export const getSavedChordSets = (): ChordSet[] => {
  const setsStr = localStorage.getItem("hypersynChordSets");
  try {
    const sets: ChordSet[] = setsStr ? JSON.parse(setsStr) : [];
    let needsSave = false;

    // Automatically migrate old schema projects to new format
    sets.forEach((set) => {
      if (!set.chordSets || !Array.isArray(set.chordSets) || set.chordSets.length === 0) {
        set.chordSets = [set.chords || ""];
        needsSave = true;
      }
    });

    if (needsSave) {
      localStorage.setItem("hypersynChordSets", JSON.stringify(sets));
    }

    return sets;
  } catch {
    return [];
  }
};

/**
 * Saves the provided chord sets array to localStorage.
 */
export const setSavedChordSets = (sets: ChordSet[]): void => {
  localStorage.setItem("hypersynChordSets", JSON.stringify(sets));
};

/**
 * Saves a chord set by name and sequence array, replacing any existing set with the same name.
 */
export const saveChordSetByName = (
  name: string,
  chordSetsData: string[]
): { sets: ChordSet[]; savedSet: ChordSet } => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Please enter a name for the chord set.");
  }
  const sets = getSavedChordSets();
  const idx = sets.findIndex((s) => s.name === trimmedName);
  let savedSet: ChordSet;

  if (idx >= 0) {
    sets[idx].chords = chordSetsData[0] || ""; // legacy field
    sets[idx].chordSets = [...chordSetsData];
    savedSet = sets[idx];
  } else {
    savedSet = {
      id: generateUUID(),
      name: trimmedName,
      chords: chordSetsData[0] || "",
      chordSets: [...chordSetsData],
    };
    sets.push(savedSet);
  }

  setSavedChordSets(sets);
  return { sets, savedSet };
};

/**
 * Deletes a chord set at the specified index.
 */
export const deleteChordSetByIndex = (
  index: number
): { sets: ChordSet[]; deletedSet: ChordSet | null } => {
  const sets = getSavedChordSets();
  if (index < 0 || index >= sets.length) {
    return { sets, deletedSet: null };
  }
  const [deletedSet] = sets.splice(index, 1);
  setSavedChordSets(sets);
  return { sets, deletedSet };
};

/**
 * Prepares JSON export string and filename for downloadable preset export.
 */
export const exportChordSetsJson = (
  sets: ChordSet[],
  selectedIndex?: number
): { filename: string; json: string } => {
  const dataStr = JSON.stringify(sets, null, 2);
  let filename = "hypersyn-chord-sets.json";

  if (typeof selectedIndex === "number" && sets[selectedIndex] && sets[selectedIndex].name) {
    const base = sets[selectedIndex].name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (base.length > 0) {
      filename = `hypersyn-${base}.json`;
    }
  }

  return { filename, json: dataStr };
};

/**
 * Imports chord sets from a JSON string, avoiding duplicate IDs and applying schema migrations.
 */
export const importChordSetsJson = (
  jsonString: string
): { addedCount: number; updatedSets: ChordSet[] } => {
  const importedSets = JSON.parse(jsonString);
  if (!Array.isArray(importedSets)) {
    throw new Error("Invalid format");
  }
  const sets = getSavedChordSets();
  const existingIds = new Set(sets.map((s) => s.id));
  let addedCount = 0;

  importedSets.forEach((set) => {
    if (set && set.id && !existingIds.has(set.id)) {
      if (!set.chordSets || !Array.isArray(set.chordSets) || set.chordSets.length === 0) {
        set.chordSets = [set.chords || ""];
      }
      sets.push(set);
      addedCount++;
    }
  });

  if (addedCount > 0) {
    setSavedChordSets(sets);
  }

  return { addedCount, updatedSets: sets };
};
