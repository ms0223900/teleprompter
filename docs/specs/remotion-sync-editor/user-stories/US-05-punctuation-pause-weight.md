# US-05：標點符號停頓權重

**作為** 創作者
**我想要** 系統自動為標點符號加上停頓 buffer frames
**以免** 實際錄音語氣停頓時，動畫跑得比說話快

## 輸入格式
- `text: string`（沿用 US-04 的分段輸入）
- 停頓對照表（可調，建議預設如下，單位為秒）：
  - 逗號類（`，,、;；`）：0.2s
  - 句號類（`。.!?！？`）：0.4s
  - 換行 `\n`：0.3s

## 輸出格式
- 純函式 `calculatePauseFrames(text: string): number`
- 整合至 US-04：`totalFrames = baseFrames + pauseFrames`

## 驗收條件
- [x] 每種標點類別的 buffer 值正確套用
- [x] 多個標點可疊加
- [x] 中英文標點皆被辨識
- [x] 停頓對照表集中管理，可日後調整
- [x] 單元測試涵蓋各類標點組合

## 驗收說明
- 實作：`lib/timing/calculatePauseFrames.ts`（暴露 `PAUSE_SECONDS`、`calculatePauseSeconds`、`calculatePauseFrames`）
- 集中於 `PAUSE_SECONDS` 常數物件，日後可直接調整
- 測試：`lib/timing/calculatePauseFrames.test.ts`（7 tests 全部通過）
- **目前狀態：停用於 `useLabelTimings`**。為了與 Header char-based 時長對齊（US-04 決策），暫不加入 pause buffer。函式保留以便日後重新啟用，或在 sidebar 另以欄位（例如 `pauseFrames`）單獨呈現不混入主時長。

## 依賴關係
- US-04（基礎時序引擎）

**優先級**：P1
**相關需求**：REQ-4、US-5
