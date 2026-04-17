import { describe, expect, it } from "vitest";
import { stripLabels } from "./stripLabels";

describe("stripLabels", () => {
  it("removes a single label by default", () => {
    expect(stripLabels("開場 [Intro] 繼續")).toBe("開場  繼續");
  });

  it("removes multiple labels", () => {
    expect(stripLabels("A[X]B[Y]C")).toBe("ABC");
  });

  it("leaves invalid bracket content untouched", () => {
    expect(stripLabels("[中文] 文字")).toBe("[中文] 文字");
    expect(stripLabels("[ab c]")).toBe("[ab c]");
    expect(stripLabels("[foo-bar]")).toBe("[foo-bar]");
  });

  it("returns input unchanged when no labels", () => {
    expect(stripLabels("純文字")).toBe("純文字");
    expect(stripLabels("")).toBe("");
  });

  it("supports custom replacement (e.g. newline for future use)", () => {
    expect(stripLabels("A[X]B", "\n")).toBe("A\nB");
    expect(stripLabels("[A][B]", "|")).toBe("||");
  });

  it("ignores unbalanced brackets", () => {
    expect(stripLabels("[Intro 沒閉合")).toBe("[Intro 沒閉合");
    expect(stripLabels("Intro] 沒開頭")).toBe("Intro] 沒開頭");
  });
});
