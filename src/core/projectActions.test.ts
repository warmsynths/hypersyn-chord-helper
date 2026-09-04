import {
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
  exportProjectJson,
  importProjectJson,
} from "./projectActions";
import { trackerStore } from "./trackerStore";
import { setSavedChordSets } from "./storage";

describe("core Project Actions module", () => {
  beforeEach(() => {
    localStorage.clear();
    setSavedChordSets([]);
    trackerStore.reset();
  });

  it("fails to save project when name is empty", () => {
    trackerStore.loadSetsData(["Am7 Dm9"]);
    const res = saveProject("");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Please enter a name");
  });

  it("saves project with chord steps and voicings", () => {
    trackerStore.loadSetsData(["Am7 Dm9", "G13 Cmaj7"]);
    trackerStore.setChordVoicing(0, 0, 1); // INV 1 on Am7
    trackerStore.setChordVoicing(0, 1, 4); // DROP 2 on Dm9

    const res = saveProject("JazzStandard");
    expect(res.ok).toBe(true);
    expect(res.data?.name).toBe("JazzStandard");
    expect(res.data?.chordSets).toEqual(["Am7 Dm9", "G13 Cmaj7"]);
    expect(res.data?.voicings).toEqual([[1, 4], [0, 0]]);
  });

  it("loads project by name and restores custom voicings", () => {
    trackerStore.loadSetsData(["Am7 Dm9"]);
    trackerStore.setChordVoicing(0, 0, 2); // INV 2
    saveProject("Bossa");

    // Clear tracker store
    trackerStore.reset();
    expect(trackerStore.getActiveStep().chords.length).toBe(0);

    // Load by name
    const loadRes = loadProject("Bossa");
    expect(loadRes.ok).toBe(true);
    expect(trackerStore.getSteps().length).toBe(1);
    expect(trackerStore.getActiveStep().chords[0].name).toBe("Am7");
    expect(trackerStore.getActiveStep().chords[0].voicingIndex).toBe(2);
  });

  it("loads project by index", () => {
    trackerStore.loadSetsData(["Cmaj7"]);
    saveProject("SetA");

    trackerStore.reset();
    const loadRes = loadProject(0);
    expect(loadRes.ok).toBe(true);
    expect(loadRes.data?.name).toBe("SetA");
  });

  it("returns error when loading non-existent project", () => {
    const res = loadProject("Ghost");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("not found");
  });

  it("deletes project by index", () => {
    trackerStore.loadSetsData(["Cmaj7"]);
    saveProject("DeleteMe");
    expect(listProjects().length).toBe(1);

    const delRes = deleteProject(0);
    expect(delRes.ok).toBe(true);
    expect(listProjects().length).toBe(0);
  });

  it("exports project JSON payload", () => {
    trackerStore.loadSetsData(["Cmaj7"]);
    saveProject("ExportMe");

    const res = exportProjectJson(0);
    expect(res.ok).toBe(true);
    expect(res.data?.filename).toBe("hypersyn-exportme.json");
    expect(res.data?.json).toContain("ExportMe");
  });

  it("imports projects from JSON text", () => {
    const jsonStr = JSON.stringify([
      {
        id: "imported-1",
        name: "ImportedProject",
        chordSets: ["Am7 Dm9"],
      },
    ]);

    const res = importProjectJson(jsonStr);
    expect(res.ok).toBe(true);
    expect(res.data?.addedCount).toBe(1);
    expect(listProjects().length).toBe(1);
  });
});
