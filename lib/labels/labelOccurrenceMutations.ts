import { parseLabels } from "./parseLabels";

/** US-002：名稱長度上限 */
export const MAX_LABEL_NAME_LENGTH = 100;

const LABEL_NAME_BODY = /^[A-Za-z0-9_]+$/;

export type ValidateLabelNameResult =
  | { ok: true; name: string }
  | { ok: false; message: string };

/**
 * 驗證標籤名稱（不含方括號）：非空、長度、字元集與 `LABEL_PATTERN` 一致。
 */
export function validateLabelName(raw: string): ValidateLabelNameResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "名稱不得為空" };
  }
  if (trimmed.length > MAX_LABEL_NAME_LENGTH) {
    return { ok: false, message: "名稱不得超過 100 字元" };
  }
  if (!LABEL_NAME_BODY.test(trimmed)) {
    return { ok: false, message: "名稱僅限英數字與底線" };
  }
  return { ok: true, name: trimmed };
}

export type ReplaceLabelAtOccurrenceResult =
  | { ok: true; text: string }
  | { ok: false; message: string };

/**
 * 將第 `occurrenceIndex` 個合法 `[label]` 整段替換為 `[newName]`（0-based）。
 * 同名標籤多次出現時只改其中一次。
 */
export function replaceLabelAtOccurrence(
  text: string,
  occurrenceIndex: number,
  newNameRaw: string,
): ReplaceLabelAtOccurrenceResult {
  const v = validateLabelName(newNameRaw);
  if (!v.ok) return v;

  const labels = parseLabels(text);
  if (occurrenceIndex < 0 || occurrenceIndex >= labels.length) {
    return { ok: false, message: "找不到指定的標籤" };
  }
  const target = labels[occurrenceIndex];
  const insertion = `[${v.name}]`;
  const next =
    text.slice(0, target.startIndex) + insertion + text.slice(target.endIndex);
  return { ok: true, text: next };
}

/**
 * 移除第 `occurrenceIndex` 個合法 `[label]` 標記本身（不含內文）。
 * index 無效時回傳原文不變。
 */
export function removeLabelAtOccurrence(
  text: string,
  occurrenceIndex: number,
): string {
  const labels = parseLabels(text);
  if (occurrenceIndex < 0 || occurrenceIndex >= labels.length) {
    return text;
  }
  const target = labels[occurrenceIndex];
  return text.slice(0, target.startIndex) + text.slice(target.endIndex);
}
