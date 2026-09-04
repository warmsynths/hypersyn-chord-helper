import {
  getSavedChordSets,
  saveChordSetByName,
  deleteChordSetByIndex,
  exportChordSetsJson,
  importChordSetsJson,
  type ChordSet,
} from "./storage";
import { trackerStore } from "./trackerStore";

export interface ProjectActionResult<T = void> {
  ok: boolean;
  message: string;
  data?: T;
}

/**
 * Saves current progression session into localStorage presets.
 * Preserves both chord strings and customized voicings.
 */
export const saveProject = (name: string): ProjectActionResult<ChordSet> => {
  const trimmedName = name ? name.trim() : "";
  if (!trimmedName) {
    return {
      ok: false,
      message: "Please enter a name for the chord set.",
    };
  }

  const steps = trackerStore.getSteps();
  const setsData = steps.map((s) => s.rawText);
  const voicingsData = steps.map((s) => s.chords.map((c) => c.voicingIndex));

  try {
    const { savedSet } = saveChordSetByName(trimmedName, setsData, voicingsData);
    return {
      ok: true,
      message: `Saved chord set "${savedSet.name}".`,
      data: savedSet,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || "Failed to save chord set.",
    };
  }
};

/**
 * Loads a saved project by index, name, or UUID into the active session.
 */
export const loadProject = (idOrIndexOrName: string | number): ProjectActionResult<ChordSet> => {
  const sets = getSavedChordSets();
  let targetSet: ChordSet | undefined;

  if (typeof idOrIndexOrName === "number") {
    targetSet = sets[idOrIndexOrName];
  } else {
    const query = idOrIndexOrName.trim().toLowerCase();
    targetSet = sets.find(
      (s, idx) =>
        s.name.toLowerCase() === query ||
        s.id === idOrIndexOrName ||
        String(idx) === idOrIndexOrName
    );
  }

  if (!targetSet) {
    return {
      ok: false,
      message: "Chord set not found.",
    };
  }

  // Load steps and custom voicings into trackerStore
  const stepInputs = (targetSet.chordSets || []).map((chords, idx) => ({
    chords,
    voicings: targetSet?.voicings ? targetSet.voicings[idx] : undefined,
  }));

  trackerStore.loadStepsData(stepInputs);

  return {
    ok: true,
    message: `Loaded chord set "${targetSet.name}".`,
    data: targetSet,
  };
};

/**
 * Deletes a project preset by its index.
 */
export const deleteProject = (index: number): ProjectActionResult<ChordSet> => {
  if (typeof index !== "number" || isNaN(index) || index < 0) {
    return {
      ok: false,
      message: "Please select a valid chord set to delete.",
    };
  }

  const { deletedSet } = deleteChordSetByIndex(index);
  if (!deletedSet) {
    return {
      ok: false,
      message: "Chord set not found.",
    };
  }

  return {
    ok: true,
    message: `Deleted chord set "${deletedSet.name}".`,
    data: deletedSet,
  };
};

/**
 * Lists all saved project presets.
 */
export const listProjects = (): ChordSet[] => {
  return getSavedChordSets();
};

/**
 * Prepares JSON export payload for projects.
 */
export const exportProjectJson = (
  selectedIndex?: number
): ProjectActionResult<{ filename: string; json: string }> => {
  const sets = getSavedChordSets();
  const { filename, json } = exportChordSetsJson(sets, selectedIndex);
  return {
    ok: true,
    message: `Exported chord sets as ${filename}.`,
    data: { filename, json },
  };
};

/**
 * Imports projects from a JSON string.
 */
export const importProjectJson = (
  jsonString: string
): ProjectActionResult<{ addedCount: number }> => {
  try {
    const { addedCount } = importChordSetsJson(jsonString);
    if (addedCount > 0) {
      return {
        ok: true,
        message: `Imported ${addedCount} new chord set(s).`,
        data: { addedCount },
      };
    } else {
      return {
        ok: true,
        message: "No new chord sets to import.",
        data: { addedCount: 0 },
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || "Failed to import chord sets.",
    };
  }
};
