import { DEFAULT_FPS } from "./calculateFrames";
import type { LabelTiming } from "./useLabelTimings";

export type ExportedSegment = {
  label: string;
  startFrame: number;
  durationFrames: number;
};

export type ExportedTimings = {
  fps: number;
  wpm: number;
  segments: ExportedSegment[];
};

export function buildTimingsExport(
  timings: LabelTiming[],
  wpm: number,
  fps: number = DEFAULT_FPS,
): ExportedTimings {
  return {
    fps,
    wpm,
    segments: timings.map((t) => ({
      label: t.label,
      startFrame: t.startFrame,
      durationFrames: t.durationFrames,
    })),
  };
}

export function formatTimingsJson(
  timings: LabelTiming[],
  wpm: number,
  fps: number = DEFAULT_FPS,
): string {
  return JSON.stringify(buildTimingsExport(timings, wpm, fps), null, 2);
}
