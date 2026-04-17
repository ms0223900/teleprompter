import { describe, expect, it } from "vitest";
import {
  calculatePauseFrames,
  calculatePauseSeconds,
  PAUSE_SECONDS,
} from "./calculatePauseFrames";

describe("calculatePauseSeconds", () => {
  it("returns 0 for empty or punctuation-free text", () => {
    expect(calculatePauseSeconds("")).toBe(0);
    expect(calculatePauseSeconds("你好世界")).toBe(0);
  });

  it("sums commas", () => {
    expect(calculatePauseSeconds("，,、")).toBeCloseTo(PAUSE_SECONDS.comma * 3);
  });

  it("sums periods (Chinese and English)", () => {
    expect(calculatePauseSeconds("。.!?")).toBeCloseTo(PAUSE_SECONDS.period * 4);
  });

  it("sums newlines", () => {
    expect(calculatePauseSeconds("a\nb\nc")).toBeCloseTo(PAUSE_SECONDS.newline * 2);
  });

  it("mixes classes correctly", () => {
    const text = "你好，世界。再見\n下一段";
    const expected =
      PAUSE_SECONDS.comma * 1 +
      PAUSE_SECONDS.period * 1 +
      PAUSE_SECONDS.newline * 1;
    expect(calculatePauseSeconds(text)).toBeCloseTo(expected);
  });
});

describe("calculatePauseFrames", () => {
  it("converts to 30fps integer frames", () => {
    // one comma = 0.2s * 30 = 6 frames
    expect(calculatePauseFrames("，")).toBe(6);
    // one period = 0.4s * 30 = 12 frames
    expect(calculatePauseFrames("。")).toBe(12);
    // one newline = 0.3s * 30 = 9 frames
    expect(calculatePauseFrames("\n")).toBe(9);
  });

  it("supports custom fps", () => {
    expect(calculatePauseFrames("。", 60)).toBe(24);
  });
});
