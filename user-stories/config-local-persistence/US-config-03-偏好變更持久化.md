# US-config-03：偏好變更持久化（debounce 或即時）

**作為** 提詞器使用者  
**我想要** 在 UI 中調整偏好後，變更自動寫回本機  
**以便** 下次開啟無需再次調整

**輸入格式**

- 使用者透過設定面板變更：`wpm`、`fontSize`、`isMirrored`、`autoWrap`（與 US-config-01 欄位一致）。
- `preferencesHydrated === true`（見 US-config-02）之後才觸發寫入，避免初次掛載覆寫舊存檔。

**輸出格式**

- 任一偏好狀態變更後，呼叫 `savePreferences` 將**目前完整偏好快照**寫入 `localStorage`。
- 實作可選：
  - **滑桿類（wpm、fontSize）**：短 debounce（例如 150–300ms）減少寫入頻率；**切換類（isMirrored、autoWrap）**：可即時寫入。
  - 或單一 `useEffect` 依賴 `[wpm, fontSize, isMirrored, autoWrap, preferencesHydrated]`，在 `preferencesHydrated` 為真時 debounce 後寫入。
- 可選：與稿件相同，在 `beforeunload` / `visibilitychange` 時補寫最後一次（若採 debounce）。

**驗收條件**

- [ ] 調整語速或字體後重新整理，數值仍保留。
- [ ] 切換鏡像、智慧斷句後重新整理，狀態仍保留。
- [ ] 在還原完成前不會用預設值覆寫既有 `localStorage` 偏好。

**驗收說明**：（實作完成後由實作者補上）

**依賴關係**

- 須先完成 **US-config-01**（寫入 API）、**US-config-02**（還原與 `preferencesHydrated` 約定）。

**優先級**：P0  
**相關功能**：`components/TelePrompter.tsx` 之偏好 state 與設定面板 handler
