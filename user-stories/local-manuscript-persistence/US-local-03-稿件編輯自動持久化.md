# US-local-03：稿件編輯時自動寫入本機

**作為** 提詞器使用者  
**我想要** 在編輯稿件時內容自動存到本機  
**以便** 關閉分頁或當機前不會輕易遺失內容

**輸入格式**

- US-local-01 之 `saveManuscript(text: string)`。
- 目前編輯狀態來源：`text` 與 `setText`（textarea `onChange`）。

**輸出格式**

- 當 `text` 變更時，將最新全文寫入本機（建議 **debounce** 200–500ms，避免每鍵盤事件都打 `localStorage`）。
- 可選：`beforeunload` 或 `visibilitychange` 時補一次立即儲存，降低 debounce 窗口內關閉分頁的遺失風險（若實作，請在驗收條件勾選）。

**驗收條件**

- [ ] 編輯區連續輸入後，重新整理頁面，內容與最後編輯一致（與 US-local-02 一併驗收）。
- [ ] 切換「編輯／播放」模式不應清空已儲存稿（除非產品另有規格）。
- [ ] 效能可接受：長文輸入時介面不卡頓（debounce 生效）。

**依賴關係**

- 須先完成：**US-local-01**；建議與 **US-local-02** 併行或在其後（先能讀再寫，行為才完整）。

**優先級**：P0  
**相關功能**：`TelePrompter.tsx` 編輯模式 textarea 之 `value` / `onChange`
