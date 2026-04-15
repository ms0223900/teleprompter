import { describe, expect, it } from "vitest";
import { normalizeManuscriptLinesForPlayback } from "./mergePunctuationOnlyLines";

describe("normalizeManuscriptLinesForPlayback", () => {
  it("merges a punctuation-only line into the previous line", () => {
    expect(normalizeManuscriptLinesForPlayback("第一句\n，\n第二句")).toBe("第一句，\n第二句");
  });

  it("merges consecutive punctuation-only lines onto the same text line", () => {
    expect(normalizeManuscriptLinesForPlayback("你好\n，\n。")).toBe("你好，。");
    expect(normalizeManuscriptLinesForPlayback("A\n，。！\nB")).toBe("A，。！\nB");
  });

  it("keeps a leading punctuation-only line when there is no previous line", () => {
    expect(normalizeManuscriptLinesForPlayback("，")).toBe("，");
    expect(normalizeManuscriptLinesForPlayback("，\n正文")).toBe("，\n正文");
  });

  it("covers full-width CJK punctuation", () => {
    expect(normalizeManuscriptLinesForPlayback("前\n，\n後")).toBe("前，\n後");
    expect(normalizeManuscriptLinesForPlayback("前\n……\n後")).toBe("前……\n後");
  });

  it("covers ASCII punctuation-only lines", () => {
    expect(normalizeManuscriptLinesForPlayback("Hello\n...\nNext")).toBe("Hello...\nNext");
    expect(normalizeManuscriptLinesForPlayback("X\n!?")).toBe("X!?");
  });

  it("normalizes CRLF before processing", () => {
    expect(normalizeManuscriptLinesForPlayback("一句\r\n，\r\n二句")).toBe("一句，\n二句");
  });

  it("does not merge lines that are empty after trim", () => {
    expect(normalizeManuscriptLinesForPlayback("a\n\nb")).toBe("a\n\nb");
  });

  it("merges punctuation into the immediate previous line including when it was empty", () => {
    expect(normalizeManuscriptLinesForPlayback("第一\n\n，\n第二")).toBe("第一\n，\n第二");
  });
});
