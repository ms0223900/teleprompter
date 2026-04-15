# US-punct-02：TelePrompter 整合「僅標點行併入上一行」

**作為** 提詞器使用者  
**我想要** 在**關閉與開啟**「智慧斷句／自動換行」時，播放用的行列表都套用同一套「僅標點行併入上一行」規則  
**以便** 編輯時換行貼上的標點獨立行不會在任一模式下單獨成為一整行

**輸入格式**

- **須先完成**：**US-punct-01**（`normalizeManuscriptLinesForPlayback` 或等價 API 與單元測試通過）。
- 現有行為：`components/TelePrompter.tsx` 中 `processedLines` 於 `autoWrap === false` 時為 `text.split('\n').filter(...)`；於 `autoWrap === true` 時為 `autoWrapText(text, ...)`。

**輸出格式**

- 在計算 `processedLines` 時，先以 `normalizeManuscriptLinesForPlayback(text)` 之**回傳值**作為後續輸入，再呼叫既有 `split`／`autoWrapText`。
  - 亦即：**合併發生於**寬度換行與段落切分**之前**，使「使用者單行僅標點」先併入上一行，再由 `autoWrapText` 做視覺換行。
- **不強制**改寫 `<textarea>` 內之 `text` 狀態（避免使用者輸入被靜默改動）；若未來產品要求「編輯區也自動合併」，另開需求。

**驗收條件**

- [x] `autoWrap` 開／關兩種路徑皆使用正規化後之稿件字串計算行列表。
- [x] 手動測試：稿件為  
  `第一句很長\n，\n第二句`  
  播放模式下「，` 不會單獨佔一行；高亮／進度與「合併後」之行數一致。
- [x] **迴歸**：未含僅標點獨立行之稿件，行為與實作前一致（除行數可能相同外，無多餘空白或斷行差異）。
- [x] `npm run lint`／`npm run type-check` 通過；若專案有 `npm test`，相關測試通過。

**依賴關係**

- 須先完成：**US-punct-01**。

**優先級**：P0  
**相關功能**：`components/TelePrompter.tsx`（`processedLines` 之 `useMemo`）
