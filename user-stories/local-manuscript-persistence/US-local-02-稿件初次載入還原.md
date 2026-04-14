# US-local-02：稿件初次載入從本機還原

**作為** 提詞器使用者  
**我想要** 重新開啟頁面時自動看到上次編輯的稿件內容  
**以便** 不必重複貼上或重打

**輸入格式**

- US-local-01 完成後之 `loadManuscript()`（或等價 API）。
- 元件現有預設稿：`DEFAULT_TEXT`（見 `TelePrompter.tsx`）。

**輸出格式**

- `TelePrompter`（或上層 client 包裝）在**用戶端掛載後**將 `text` 初始化為：
  - 若 `loadManuscript()` 回傳非空字串 → 使用該字串；
  - 若回傳 `null` / 空字串（依產品約定）→ 使用 `DEFAULT_TEXT`。
- 避免 hydration mismatch：若使用 Next.js App Router，首屏仍應與伺服器一致；常見作法為掛載後 `useEffect` 再合併本機稿（可能出現一次閃爍時，可選擇性在後續任務優化，本 US 以正確還原為主）。

**驗收條件**

- [x] 先在本機編輯並儲存稿件（可先用手動 `localStorage` 或完成 US-local-03 後驗證），重新整理頁面後編輯區仍為該內容。
- [x] 清除對應 key 或首次造訪時，編輯區為預設歡迎文（與現有 `DEFAULT_TEXT` 一致）。
- [x] 無 console 未捕捉錯誤。

**驗收說明**：`TelePrompter` 掛載後 `useEffect` 呼叫 `loadManuscript()`；僅當回傳非空字串時 `setText`，否則維持 `DEFAULT_TEXT`。與 SSR 首屏一致。

**依賴關係**

- 須先完成：**US-local-01**。

**優先級**：P0  
**相關功能**：`TelePrompter.tsx` 之 `useState(DEFAULT_TEXT)` 與掛載流程
