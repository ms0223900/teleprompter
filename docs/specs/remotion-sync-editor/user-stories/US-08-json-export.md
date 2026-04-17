# US-08：JSON 匯出（Remotion 可直接消費）

**作為** 開發者
**我想要** 一鍵匯出包含 Label 與 Frames 的 JSON
**以便** 將資料直接塞進 Remotion 的 `props`

## 輸入格式
- `LabelTiming[]`（來自 US-06）

## 輸出格式
- JSON 結構：
  ```json
  {
    "fps": 30,
    "wpm": 200,
    "segments": [
      { "label": "Intro",  "startFrame": 0,   "durationFrames": 120 },
      { "label": "Step1",  "startFrame": 120, "durationFrames": 300 }
    ]
  }
  ```
- 操作入口：側欄「匯出 JSON」按鈕 → 下載 `.json` 檔或複製到剪貼簿（兩者擇一即可，建議兩者皆有）

## 驗收條件
- [x] 匯出的 JSON 結構符合上述 schema
- [x] `startFrame` 累積正確且不重疊
- [x] `durationFrames` 與側欄顯示一致
- [x] 沒有標籤時按鈕 disabled 或給明確提示
- [x] 下載檔名具辨識性（例如 `sync-<timestamp>.json`）
- [x] 複製到剪貼簿時給成功回饋

## 驗收說明
- 實作：
  - `lib/timing/exportTimingsJson.ts`（`buildTimingsExport`、`formatTimingsJson`）
  - UI 於 `components/SyncSidebar.tsx` footer 提供「複製 JSON」「下載 JSON」雙按鈕
- JSON schema：`{ fps, wpm, segments: [{ label, startFrame, durationFrames }] }`
- 無標籤時兩顆按鈕皆 disabled（`opacity-40 cursor-not-allowed`）
- 成功/失敗 1.6s 浮動訊息回饋
- 檔名：`sync-<timestamp>.json`
- 測試：`lib/timing/exportTimingsJson.test.ts`（4 tests 全部通過）

## 依賴關係
- US-06（即時重算 Hook）
- US-07（側欄容器作為按鈕放置處，非強依賴）

**優先級**：P0
**相關需求**：REQ-7、US-4
