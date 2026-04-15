/** 與各模組 `console.warn` 前綴一致 */
const WARN_PREFIX = "[teleprompter]";

export function canUseLocalStorage(): boolean {
  return typeof window !== "undefined";
}

/**
 * 讀取並解析 JSON。SSR 或無資料、損毀時回傳 `null`。
 */
export function readJsonFromLocalStorage(key: string): unknown | null {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * 寫入 JSON。失敗時 `console.warn`，不拋錯。
 */
export function writeJsonToLocalStorage(
  key: string,
  value: unknown,
  warnLabel: string,
): void {
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`${WARN_PREFIX} Failed to save ${warnLabel}:`, e);
  }
}
