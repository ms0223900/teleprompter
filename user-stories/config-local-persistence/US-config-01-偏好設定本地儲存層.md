# US-config-01：偏好設定本地儲存層（key、讀寫、SSR 安全）

**作為** 提詞器使用者  
**我想要** 「偏好設定」內可調整的選項能以穩定、可版本演進的方式讀寫於瀏覽器本機  
**以便** 重新開啟頁面時不必重設語速、字體、鏡像與智慧斷句

**輸入格式**

- 專案內約定之 `localStorage` key（或常數），例如與稿件分開的 `teleprompter:preferences:v1`。
- 需持久化的欄位（與 `components/TelePrompter.tsx` 側邊「偏好設定」對齊，不含稿件本文）：
  - 語速 `wpm`（字／分，正整數，範圍與 UI 滑桿一致）
  - 字體大小 `fontSize`（px，正整數）
  - 鏡像顯示 `isMirrored`（boolean）
  - 智慧斷句 `autoWrap`（boolean）
- 呼叫環境：僅在 `typeof window !== "undefined"` 時操作 `localStorage`。

**輸出格式**

- 擴充既有 `lib/teleprompterStorage.ts` 或新增同層模組（例如 `lib/teleprompterPreferences.ts`），至少提供：
  - `loadPreferences(): TeleprompterPreferences | null` — 無資料、版本不符或損毀時回傳 `null`（由呼叫端使用預設值）。
  - `savePreferences(prefs: TeleprompterPreferences): void` — 寫入完整偏好物件。
- 內部使用 JSON 包一層 `{ version: number, ...fields }` 以利未來擴充；讀取時欄位型別不符則回傳 `null` 或安全降級（與稿件儲存層風格一致）。

**驗收條件**

- [ ] 在無 `window` / SSR 情境下呼叫讀寫不會拋錯（no-op 或 guarded）。
- [ ] `localStorage` quota 或寫入失敗時不導致整頁白屏（可靜默失敗或 `console.warn`，與稿件層一致）。
- [ ] 單元測試：寫入後重新讀取與原物件語意一致（含邊界：預設值與非法存檔時回 `null`）。

**驗收說明**：（實作完成後由實作者補上檔案路徑與手動驗證要點）

**依賴關係**

- 無（本任務為偏好本地儲存基礎；可與稿件儲存並行，但 key 必須分開）。

**優先級**：P0  
**相關功能**：`components/TelePrompter.tsx` 之 `wpm`、`fontSize`、`isMirrored`、`autoWrap`
