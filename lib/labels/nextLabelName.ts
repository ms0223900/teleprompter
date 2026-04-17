import { parseLabels } from "./parseLabels";

/** 一鍵插入按鈕預設前綴，可於未來抽為設定 */
export const DEFAULT_LABEL_PREFIX = "Step_";

/**
 * 依 `prefix` 掃描文字中「`{prefix}{數字}`」型標籤，取最大數字 + 1。
 * - 無符合者從 1 開始
 * - 跳號不回補（`Step_1, Step_3` → `Step_4`）
 * - 其他前綴標籤（例如 `Intro`）不影響計算
 * - 最終會確保輸出名稱不與既有標籤重名
 */
export function nextLabelName(
  text: string,
  prefix: string = DEFAULT_LABEL_PREFIX,
): string {
  const labels = parseLabels(text);
  const names = new Set(labels.map((l) => l.label));

  const numberRe = new RegExp(`^${escapeRegex(prefix)}(\\d+)$`);
  let max = 0;
  for (const l of labels) {
    const m = l.label.match(numberRe);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }

  let n = max + 1;
  let candidate = `${prefix}${n}`;
  while (names.has(candidate)) {
    n += 1;
    candidate = `${prefix}${n}`;
  }
  return candidate;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
