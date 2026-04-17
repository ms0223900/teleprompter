/** 標籤語法：`[labelName]`，名稱限英數字與底線。 */
export const LABEL_PATTERN = /\[([A-Za-z0-9_]+)\]/g;

export type ParsedLabel = {
  /** 標籤名稱（不含方括號） */
  label: string;
  /** 標籤在原文的起始字元位置（含 `[`） */
  startIndex: number;
  /** 標籤在原文的結束位置（exclusive，`]` 之後） */
  endIndex: number;
  /**
   * 從「上一個標籤結束處（或文首）」到「此標籤起點」之間的內容，
   * 不包含標籤本身。
   */
  contentBefore: string;
};

/**
 * 從文字稿抽取合法標籤。非法括號內容（如 `[中文]`、`[ab c]`、未閉合）
 * 一律視為普通文字，不回傳。
 */
export function parseLabels(text: string): ParsedLabel[] {
  const result: ParsedLabel[] = [];
  let cursor = 0;

  LABEL_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(LABEL_PATTERN)) {
    const startIndex = match.index ?? 0;
    const endIndex = startIndex + match[0].length;
    result.push({
      label: match[1],
      startIndex,
      endIndex,
      contentBefore: text.slice(cursor, startIndex),
    });
    cursor = endIndex;
  }

  return result;
}
