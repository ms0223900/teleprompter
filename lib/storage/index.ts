/**
 * 提詞器本機持久化：共用 JSON／localStorage 底層與稿件／偏好網域 API。
 * UI 與測試請優先自 `@/lib/storage` 匯入。
 */
export {
  canUseLocalStorage,
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from "./localStorageJson";

export { MANUSCRIPT_STORAGE_KEY, loadManuscript, saveManuscript } from "./manuscript";

export {
  PREFERENCES_STORAGE_KEY,
  loadPreferences,
  savePreferences,
  type TeleprompterPreferences,
} from "./preferences";
