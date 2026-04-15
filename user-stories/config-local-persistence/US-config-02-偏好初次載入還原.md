# US-config-02：偏好初次載入還原（避免 hydration 與覆寫競態）

**作為** 提詞器使用者  
**我想要** 頁面載入後自動還原本機儲存的偏好  
**以便** 首屏與重新整理後體驗一致，且不與 React SSR／hydration 衝突

**輸入格式**

- `loadPreferences()` 回傳之 `TeleprompterPreferences | null`（見 US-config-01）。
- 元件內既有預設常數：`DEFAULT_WPM`、`DEFAULT_FONT_SIZE`、`DEFAULT_IS_MIRRORED`、`DEFAULT_AUTO_WRAP`。

**輸出格式**

- `TelePrompter`（或等價容器）在 **client 掛載後** 以一次 `useEffect`（空依賴陣列）讀取本機偏好，並 `setState` 套用至 `wpm`、`fontSize`、`isMirrored`、`autoWrap`。
- 若需避免「還原完成前」後續 effect 誤寫入預設值覆蓋 `localStorage`，採用與稿件相同的 **`preferencesHydrated`（或合併為單一 `localDataHydrated`）** 旗標，僅在還原完成後才執行持久化寫入（見 US-config-03）。

**驗收條件**

- [x] 首次造訪（無存檔）時行為與現有預設值相同。
- [x] 曾儲存過偏好時，重新整理頁面後側邊欄／播放行為反映存檔值（語速、字體、鏡像、智慧斷句）。
- [x] 開發者工具中停用 `localStorage` 或回傳 `null` 時不崩潰，降級為預設值。

**驗收說明**

- 實作：`components/TelePrompter.tsx` 於掛載後 `useEffect([])` 呼叫 `loadPreferences()` 並 `setState`；`preferencesHydrated` 於還原完成後設為 `true`（見 US-config-03）。
- 手動：清除 `teleprompter:preferences:v1` 後重新整理，應為預設 WPM／字體／鏡像／智慧斷句；寫入合法 JSON 後重新整理應還原。

**依賴關係**

- 須先完成 **US-config-01**（讀取 API 與 schema）。

**優先級**：P0  
**相關功能**：`components/TelePrompter.tsx` 掛載流程
