# US-wordcount-01：字數計算工具（總字數／去標點字數）

**作為** 提詞器使用者  
**我想要** 系統能以一致規則計算稿件的「總字數」與「去除標點後字數」  
**以便** 介面顯示與未來擴充（匯出、統計）共用同一套邏輯

**輸入格式**

- 單一參數：稿件全文 `string`（與 `TelePrompter` 之 `text` 狀態相同語意）。
- 執行環境：可於 Node／瀏覽器共用（不依賴 DOM）。

**輸出格式**

- 一個小型模組（建議 `lib/manuscriptWordCount.ts` 或等價路徑），至少匯出：
  - `getManuscriptCharStats(text: string): { totalChars: number; charsWithoutPunctuation: number }`
- **總字數**（`totalChars`）：與稿件字串長度一致；採 **JavaScript `string.length`**（UTF-16 code units），與 `<textarea>` 內容長度行為一致。
- **去除標點後字數**（`charsWithoutPunctuation`）：從原字串移除「標點符號」後剩餘字元數；標點定義建議採 **Unicode `\p{P}`**（`RegExp` 需 `u` 旗標），僅移除標點類字元，**保留**空白、換行、數字、字母與一般文字（含中日韓）。

**單元測試（TDD 必備）**

- 同目錄或慣例路徑新增 **`lib/manuscriptWordCount.test.ts`**（或 `*.spec.ts`，須與 **US-wordcount-00** 約定一致）。
- **開發順序**：先撰寫測試案例並確認**失敗**（紅）→ 實作至通過（綠）→ 重構。
- 測試案例至少涵蓋：**空字串**、**僅標點／空白**、**中英混排與全形／半形標點**、**至少一則**可手算預期 `charsWithoutPunctuation` 的具體範例（避免只斷言「小於總字數」而無法抓錯誤演算法）。

**驗收條件**

- [ ] `totalChars` 對任意 `text` 等於 `text.length`。
- [ ] 僅含標點與空白時：`charsWithoutPunctuation` 等於移除 `\p{P}` 後之長度（僅標點無文字時可為 0）。
- [ ] 含「，。！？」等全形標點與英文 `,.!?` 等時，去標點字數正確少於總字數（除非無標點）。
- [ ] 不含 `window`／DOM 依賴，可被純邏輯匯入。
- [ ] TypeScript 型別正確、無 ESLint 違規。
- [ ] **`npm run test:run` 通過**，且 `manuscriptWordCount` 相關單元測試全部綠燈。

**依賴關係**

- 須先完成：**US-wordcount-00**（測試前置作業與 TDD 約定）。

**優先級**：P0  
**相關功能**：稿件字串 `text`（`components/TelePrompter.tsx`）
