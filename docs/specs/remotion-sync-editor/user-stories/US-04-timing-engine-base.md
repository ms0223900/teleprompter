# US-04：基礎時序運算引擎（WPM → Frames）

> ⚠️ **與既有實作的差異需先決策**
>
> `components/TelePrompter.tsx` L238 既有估時公式：
> ```ts
> const estimatedTotalSeconds = Math.ceil((totalChars / wpm) * 60);
> ```
> **以「字元數」計算**，不區分中英文。PRD 則要求「中文算字、英文算單詞」。
>
> **待決策**：
> - (A) Sync Editor 沿用既有 char-based 公式 → 行為一致、實作簡單、英文估時可能偏高。
> - (B) 採 PRD 的 bilingual 規則 → 更貼近真人語速，但與既有提詞器捲動速度估算不一致，需考慮是否一併改動既有邏輯。
>
> **建議**：先確認此決策再開工。若選 (B)，建議把 `calculateFrames` 做成共用工具，讓既有提詞器也能逐步遷移，避免兩套估時邏輯長期分歧。

---

**作為** 創作者
**我想要** 系統依 WPM 與 30 FPS 計算每段標籤間的總幀數
**以便** 了解每個 Step 的時間分配

## 輸入格式
- `text: string`（某段標籤間的內容）
- `wpm: number`（來自 US-03，已存在）
- 固定常數：`FPS = 30`
- 計數策略（依上述決策）：
  - (A) 字元數：`text.length`（或去空白後長度）
  - (B) 中文逐字（CJK 範圍）+ 英文逐單詞（空白切分，忽略標點）

## 輸出格式
- 純函式 `calculateFrames(text: string, wpm: number): { units: number; seconds: number; frames: number }`
- `frames = Math.round(seconds * 30)`
- 放置位置建議：`lib/timing/calculateFrames.ts`（新目錄，與 `lib/storage` 同層）

## 驗收條件
- [ ] 決策 A/B 已於 PR 說明中明確記錄
- [ ] 若採 (B)：中文、英文、中英混合、空字串皆有單元測試
- [ ] 若採 (A)：與 `TelePrompter.tsx` L238 行為一致，並抽為共用函式被雙方消費
- [ ] WPM 變更時輸出同步變化
- [ ] 空字串回傳 0 frames

## 依賴關係
- US-03（複用既有 WPM state）

**優先級**：P0
**相關需求**：REQ-3、US-2、技術約束（中英文兼容）
