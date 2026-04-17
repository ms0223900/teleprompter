import { describe, expect, it } from "vitest";
import { buildTimingsExport, formatTimingsJson } from "./exportTimingsJson";
import type { LabelTiming } from "./useLabelTimings";

const sample: LabelTiming[] = [
  { label: "Intro", units: 10, seconds: 3, frames: 90, startFrame: 0, durationFrames: 90 },
  { label: "Step_1", units: 20, seconds: 6, frames: 180, startFrame: 90, durationFrames: 180 },
];

describe("buildTimingsExport", () => {
  it("wraps segments with fps and wpm", () => {
    const out = buildTimingsExport(sample, 200);
    expect(out.fps).toBe(30);
    expect(out.wpm).toBe(200);
    expect(out.segments).toHaveLength(2);
  });

  it("keeps only label/startFrame/durationFrames per segment", () => {
    const out = buildTimingsExport(sample, 200);
    expect(out.segments[0]).toEqual({
      label: "Intro",
      startFrame: 0,
      durationFrames: 90,
    });
  });

  it("handles empty input", () => {
    expect(buildTimingsExport([], 200)).toEqual({ fps: 30, wpm: 200, segments: [] });
  });
});

describe("formatTimingsJson", () => {
  it("produces indented JSON", () => {
    const json = formatTimingsJson(sample, 200);
    expect(json).toContain('"fps": 30');
    expect(json).toContain('"label": "Intro"');
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
