# US-wordcount-03：TelePrompter 字數顯示整合測試（組件行為）

**作為** 開發者  
**我想要** 用整合測試驗證「編輯模式下字數與稿件互動、播放模式下不顯示」等行為  
**以便** 重構 UI 時不迴歸，且與純函式單元測試分工清楚

**輸入格式**

- **須先完成**：**US-wordcount-00**（測試環境與 `@/` 解析）。
- **須先完成**：**US-wordcount-02**（編輯區已顯示字數；測試目標為真實組件行為）。  
  - 若採 **嚴格 TDD**：可與 US-wordcount-02 **並行**——先依本 US 撰寫**失敗**的整合測試，再實作 US-wordcount-02 至測試通過。
- 測試對象：`components/TelePrompter.tsx`（或專案實際 export 之預設組件）。

**輸出格式**

- 一至多個整合測試檔（例如 `components/TelePrompter.wordcount.test.tsx` 或 `__tests__/teleprompter-wordcount.test.tsx`），使用 **Vitest** + **React Testing Library** +（建議）**user-event**。
- 實作時建議為字數區塊設定 **穩定查詢方式**，供測試與無障礙共用，例如：
  - `aria-label`／`role="status"` 包裹「總字數」「不含標點字數」區域，或
  - 僅在測試約定 `data-testid`（次選，仍以可及性優先為佳）。
- **localStorage**：`TelePrompter` 掛載會觸發 `loadManuscript`。測試應 **mock `localStorage`** 或 **等待 hydration 完成**（`waitFor` / `findBy*`）再斷言字數，避免競態造成假失敗。

**建議案例（行為導向，可增刪）**

| 行為 | 預期 |
|------|------|
| 預設進入頁面、編輯模式 | 可見總字數與去標點字數（數值與空稿或還原稿一致；空稿則為 0／0） |
| 在 textarea 輸入／刪除文字 | 兩項數字即時與 `getManuscriptCharStats` 一致（可比對已知字串） |
| 切換至播放模式 | 字數區塊**不**出現在文件內（或不可見） |
| 切回編輯模式 | 字數區塊再次可見，且數值仍反映目前 `text` |

**驗收條件**

- [ ] `npm run test:run` 通過且包含本整合測試檔。
- [ ] 至少涵蓋上表「編輯即時更新」「播放不顯示字數」「切回編輯仍正確」三類行為（可合併或多個 `it`）。
- [ ] 不直接斷言內部 state 名稱；以使用者可見文字或 ARIA 可查詢節點為主。
- [ ] 無任意 `setTimeout` 硬等；優先 `waitFor`／`findBy` 處理非同步。
- [ ] 測試不依賴真實網路或手動操作。

**依賴關係**

- 須先完成：**US-wordcount-00**。  
- 須有可供測試的 UI：**US-wordcount-02**（或與 US-wordcount-02 並行採 TDD）。

**優先級**：P0  
**相關功能**：`TelePrompter` 編輯／播放模式切換、字數顯示區塊
