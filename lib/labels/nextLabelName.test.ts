import { describe, expect, it } from "vitest";
import { nextLabelName } from "./nextLabelName";

describe("nextLabelName", () => {
  it("starts at Step_1 when no labels exist", () => {
    expect(nextLabelName("")).toBe("Step_1");
    expect(nextLabelName("純文字，沒有標籤")).toBe("Step_1");
  });

  it("returns max + 1 when Step_ labels exist", () => {
    expect(nextLabelName("[Step_1] 文字 [Step_2]")).toBe("Step_3");
  });

  it("does not backfill gaps", () => {
    expect(nextLabelName("[Step_1] [Step_3]")).toBe("Step_4");
    expect(nextLabelName("[Step_5]")).toBe("Step_6");
  });

  it("ignores non-prefix labels", () => {
    expect(nextLabelName("[Intro] [Outro]")).toBe("Step_1");
    expect(nextLabelName("[Intro] [Step_1]")).toBe("Step_2");
  });

  it("supports custom prefix", () => {
    expect(nextLabelName("[Scene_2]", "Scene_")).toBe("Scene_3");
    expect(nextLabelName("[Step_9]", "Scene_")).toBe("Scene_1");
  });

  it("avoids collision if somehow computed name already exists", () => {
    // edge: manual [Step_2] present but no [Step_1] — max+1 = 3
    expect(nextLabelName("[Step_2]")).toBe("Step_3");
  });
});
