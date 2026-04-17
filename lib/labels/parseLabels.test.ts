import { describe, expect, it } from "vitest";
import { parseLabels } from "./parseLabels";

describe("parseLabels", () => {
  it("returns empty array when there are no labels", () => {
    expect(parseLabels("純文字，沒有標籤")).toEqual([]);
  });

  it("extracts a single valid label", () => {
    const result = parseLabels("開場白 [Intro] 繼續");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      label: "Intro",
      contentBefore: "開場白 ",
    });
    expect(result[0].endIndex - result[0].startIndex).toBe("[Intro]".length);
  });

  it("extracts multiple labels in order with correct contentBefore slices", () => {
    const text = "第一段 [A] 第二段 [B] 結尾";
    const result = parseLabels(text);
    expect(result.map((r) => r.label)).toEqual(["A", "B"]);
    expect(result[0].contentBefore).toBe("第一段 ");
    expect(result[1].contentBefore).toBe(" 第二段 ");
  });

  it("accepts underscore and digits in label names", () => {
    const result = parseLabels("[step_1] [S2] [A_B_0]");
    expect(result.map((r) => r.label)).toEqual(["step_1", "S2", "A_B_0"]);
  });

  it("ignores labels with invalid characters", () => {
    expect(parseLabels("[中文]")).toEqual([]);
    expect(parseLabels("[ab c]")).toEqual([]);
    expect(parseLabels("[foo-bar]")).toEqual([]);
    expect(parseLabels("[]")).toEqual([]);
  });

  it("ignores unbalanced brackets", () => {
    expect(parseLabels("前文 [Intro 後文")).toEqual([]);
    expect(parseLabels("前文 Intro] 後文")).toEqual([]);
    expect(parseLabels("[[Intro]")).toHaveLength(1);
  });

  it("contentBefore excludes the label itself", () => {
    const result = parseLabels("A[X]B[Y]C");
    expect(result[0].contentBefore).toBe("A");
    expect(result[1].contentBefore).toBe("B");
  });

  it("handles text ending with a label", () => {
    const result = parseLabels("收尾 [End]");
    expect(result).toHaveLength(1);
    expect(result[0].endIndex).toBe("收尾 [End]".length);
  });

  it("handles text with only a label", () => {
    expect(parseLabels("[Only]")).toEqual([
      { label: "Only", startIndex: 0, endIndex: 6, contentBefore: "" },
    ]);
  });
});
