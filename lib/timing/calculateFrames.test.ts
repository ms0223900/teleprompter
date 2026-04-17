import { describe, expect, it } from "vitest";
import { calculateFrames, countUnits } from "./calculateFrames";

describe("countUnits (char-based, aligned with Header)", () => {
  it("counts zero for empty string", () => {
    expect(countUnits("")).toBe(0);
  });

  it("counts each Chinese character", () => {
    expect(countUnits("你好世界")).toBe(4);
  });

  it("counts each English letter / digit", () => {
    expect(countUnits("hello")).toBe(5);
    expect(countUnits("Spec 2")).toBe(5); // "Spec" 4 + "2" 1；空白扣除
  });

  it("strips whitespace and common punctuation", () => {
    expect(countUnits("，。！？  \n\t")).toBe(0);
    expect(countUnits("hello, world.")).toBe(10);
  });

  it("sums mixed Chinese and English as raw chars", () => {
    expect(countUnits("你好 world 再見")).toBe(2 + 5 + 2);
  });
});

describe("calculateFrames", () => {
  it("returns zero for empty string", () => {
    expect(calculateFrames("", 200)).toEqual({ units: 0, seconds: 0, frames: 0 });
  });

  it("returns zero when wpm is 0 or negative", () => {
    expect(calculateFrames("你好", 0).frames).toBe(0);
    expect(calculateFrames("你好", -10).frames).toBe(0);
  });

  it("computes frames at 30 fps for Chinese", () => {
    // 200 chars at 200 wpm = 1 min = 60s = 1800 frames
    const result = calculateFrames("你".repeat(200), 200);
    expect(result.units).toBe(200);
    expect(result.seconds).toBeCloseTo(60);
    expect(result.frames).toBe(1800);
  });

  it("responds to wpm changes", () => {
    const slow = calculateFrames("你好世界", 100).frames;
    const fast = calculateFrames("你好世界", 400).frames;
    expect(slow).toBeGreaterThan(fast);
  });

  it("supports custom fps", () => {
    // 60 chars / 60 wpm = 1 min = 60s * 60 fps = 3600
    const result = calculateFrames("你".repeat(60), 60, 60);
    expect(result.frames).toBe(3600);
  });

  it("rounds to nearest frame", () => {
    // 1 char / 200 wpm = 0.3s at 30fps = 9 frames
    expect(calculateFrames("你", 200).frames).toBe(9);
  });
});
