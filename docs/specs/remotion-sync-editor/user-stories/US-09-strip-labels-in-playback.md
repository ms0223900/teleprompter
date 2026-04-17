# US-09：播放模式剝除標籤文字

**作為** 創作者
**我想要** 在播放模式下不顯示 `[labelName]` 本身
**以便** 標籤只作為編輯期的分鏡記號，不會被讀進畫面或計入統計

## 輸入格式
- 文字稿（含合法標籤）
- 置換字元 `replacement: string`（預設 `""`）

## 輸出格式
- 純函式 `stripLabels(text: string, replacement?: string): string`
- 位置：`lib/labels/stripLabels.ts`
- 消費端（`components/TelePrompter.tsx`）：
  - 新增常數 `LABEL_PLAYBACK_REPLACEMENT`（目前為 `""`）
  - `processedLines` 與 `stats` 皆改以剝除後的 `playbackSourceText` 為來源
  - 編輯模式 textarea 仍顯示原文（標籤仍被使用者編輯）

## 驗收條件
- [x] 播放模式畫面、上／下行預覽皆不出現 `[labelName]`
- [x] 字數統計、預估時長以剝除後的字數為準
- [x] 編輯模式的標籤突顯不受影響
- [x] 非法括號內容不被剝除
- [x] `replacement` 可由單一常數切換（例如改為 `"\n"` 讓標籤成為斷行點）
- [x] 單元測試覆蓋預設剝除、自訂置換、非法括號、未閉合情境

## 驗收說明
- 實作：`lib/labels/stripLabels.ts`
- 測試：`lib/labels/stripLabels.test.ts`（6 tests 全部通過）
- 消費點：`components/TelePrompter.tsx`（`LABEL_PLAYBACK_REPLACEMENT`、`playbackSourceText`）
- 彈性：日後若要改為 `"\n"` 或其他分隔，只需修改 `LABEL_PLAYBACK_REPLACEMENT` 單一常數

## 依賴關係
- US-01（共用 `LABEL_PATTERN` regex）

**優先級**：P0
**相關需求**：使用者在 US-01/02 完成後指出的行為 gap
