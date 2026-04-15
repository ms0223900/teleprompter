import { readJsonFromLocalStorage, writeJsonToLocalStorage } from "./teleprompterLocalStorage";

/** 與稿件分開；schema 升版可改 key 或於讀取時遷移 */
export const PREFERENCES_STORAGE_KEY = "teleprompter:preferences:v1";

const PREFERENCES_VERSION = 1;

/** 與側邊欄「偏好設定」一致；不含稿件本文 */
export type TeleprompterPreferences = {
  wpm: number;
  fontSize: number;
  isMirrored: boolean;
  autoWrap: boolean;
};

type StoredPreferences = {
  version: number;
} & TeleprompterPreferences;

/** 與 `TelePrompter` 滑桿一致 */
const WPM_MIN = 50;
const WPM_MAX = 300;

const FONT_SIZE_MIN = 20;
const FONT_SIZE_MAX = 100;

function isValidPreferences(value: unknown): value is TeleprompterPreferences {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const { wpm, fontSize, isMirrored, autoWrap } = o;
  if (
    typeof wpm !== "number" ||
    !Number.isInteger(wpm) ||
    wpm < WPM_MIN ||
    wpm > WPM_MAX
  ) {
    return false;
  }
  if (
    typeof fontSize !== "number" ||
    !Number.isInteger(fontSize) ||
    fontSize < FONT_SIZE_MIN ||
    fontSize > FONT_SIZE_MAX
  ) {
    return false;
  }
  if (typeof isMirrored !== "boolean" || typeof autoWrap !== "boolean") {
    return false;
  }
  return true;
}

/**
 * 讀取本機偏好。無資料、版本不符、型別不符或損毀時回傳 `null`。
 * 僅在瀏覽器環境存取 `localStorage`；SSR 下為 no-op，回傳 `null`。
 */
export function loadPreferences(): TeleprompterPreferences | null {
  const parsed = readJsonFromLocalStorage(PREFERENCES_STORAGE_KEY);
  if (parsed === null) return null;
  if (typeof parsed !== "object" || parsed === null) return null;
  if (!("version" in parsed)) return null;
  const { version } = parsed as { version: unknown };
  if (version !== PREFERENCES_VERSION) return null;
  if (!isValidPreferences(parsed)) return null;
  const { wpm, fontSize, isMirrored, autoWrap } = parsed as StoredPreferences;
  return { wpm, fontSize, isMirrored, autoWrap };
}

/**
 * 將完整偏好寫入本機。寫入失敗時僅 `console.warn`，不拋錯。
 */
export function savePreferences(prefs: TeleprompterPreferences): void {
  const payload: StoredPreferences = {
    version: PREFERENCES_VERSION,
    ...prefs,
  };
  writeJsonToLocalStorage(PREFERENCES_STORAGE_KEY, payload, "preferences");
}
