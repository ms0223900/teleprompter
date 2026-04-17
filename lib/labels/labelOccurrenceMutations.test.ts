import { describe, expect, it } from "vitest";
import {
  MAX_LABEL_NAME_LENGTH,
  removeLabelAtOccurrence,
  replaceLabelAtOccurrence,
  validateLabelName,
} from "./labelOccurrenceMutations";

describe("validateLabelName", () => {
  it("rejects empty or whitespace-only", () => {
    expect(validateLabelName("")).toEqual({
      ok: false,
      message: "名稱不得為空",
    });
    expect(validateLabelName("   ")).toEqual({
      ok: false,
      message: "名稱不得為空",
    });
  });

  it("rejects when longer than max length", () => {
    const tooLong = "a".repeat(MAX_LABEL_NAME_LENGTH + 1);
    expect(validateLabelName(tooLong).ok).toBe(false);
    expect(validateLabelName(tooLong)).toMatchObject({
      message: "名稱不得超過 100 字元",
    });
  });

  it("accepts max length alphanumeric", () => {
    const ok = "a".repeat(MAX_LABEL_NAME_LENGTH);
    expect(validateLabelName(ok)).toEqual({ ok: true, name: ok });
  });

  it("rejects invalid characters", () => {
    expect(validateLabelName("a-b").ok).toBe(false);
    expect(validateLabelName("中文").ok).toBe(false);
  });

  it("trims and returns name", () => {
    expect(validateLabelName("  Foo_1  ")).toEqual({ ok: true, name: "Foo_1" });
  });
});

describe("replaceLabelAtOccurrence", () => {
  it("replaces only the nth occurrence when same name appears twice", () => {
    const text = "[A] x [A] y";
    const r = replaceLabelAtOccurrence(text, 1, "B");
    expect(r).toEqual({ ok: true, text: "[A] x [B] y" });
  });

  it("replaces first occurrence", () => {
    const text = "pre [Intro] post";
    expect(replaceLabelAtOccurrence(text, 0, "Outro")).toEqual({
      ok: true,
      text: "pre [Outro] post",
    });
  });

  it("returns validation error without mutating", () => {
    const text = "[X] a";
    expect(replaceLabelAtOccurrence(text, 0, "").ok).toBe(false);
    expect(replaceLabelAtOccurrence(text, 0, "bad-name").ok).toBe(false);
  });

  it("returns error when index out of range", () => {
    expect(replaceLabelAtOccurrence("[A]", 1, "B").ok).toBe(false);
    expect(replaceLabelAtOccurrence("[A]", -1, "B").ok).toBe(false);
  });
});

describe("removeLabelAtOccurrence", () => {
  it("removes only the nth label token", () => {
    const text = "[A]a[B]b";
    expect(removeLabelAtOccurrence(text, 1)).toBe("[A]ab");
  });

  it("removes first label", () => {
    expect(removeLabelAtOccurrence("[Intro] body", 0)).toBe(" body");
  });

  it("returns original text when index invalid", () => {
    const t = "[Only]";
    expect(removeLabelAtOccurrence(t, 1)).toBe(t);
  });
});
