/** localStorage key；若 schema 升版可改 key 或於讀取時遷移 */
export const MANUSCRIPT_STORAGE_KEY = "teleprompter:manuscript:v1";

const MANUSCRIPT_VERSION = 1;

type StoredManuscript = {
  version: number;
  text: string;
};

/**
 * 讀取已儲存稿件全文。無資料、格式不符或損毀時回傳 `null`。
 * 僅在瀏覽器環境存取 `localStorage`；SSR 下為 no-op，回傳 `null`。
 */
export function loadManuscript(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MANUSCRIPT_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      !("text" in parsed)
    ) {
      return null;
    }
    const { version, text } = parsed as StoredManuscript;
    if (version !== MANUSCRIPT_VERSION || typeof text !== "string") {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}

/**
 * 將完整稿件寫入本機。寫入失敗時僅 `console.warn`，不拋錯。
 */
export function saveManuscript(text: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredManuscript = {
      version: MANUSCRIPT_VERSION,
      text,
    };
    localStorage.setItem(MANUSCRIPT_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("[teleprompter] Failed to save manuscript:", e);
  }
}
