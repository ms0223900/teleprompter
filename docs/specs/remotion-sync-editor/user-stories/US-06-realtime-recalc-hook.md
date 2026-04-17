# US-06：即時重算 Hook（Debounced）

**作為** 創作者
**我想要** 每打一個字就讓側欄秒數/幀數即時更新
**以便** 當場判斷文字是否太長或太短

## 輸入格式
- 文字稿（來自編輯器 state）
- WPM（來自 US-03）

## 輸出格式
- React Hook `useLabelTimings(text, wpm): LabelTiming[]`
- `LabelTiming`：
  ```ts
  type LabelTiming = {
    label: string;
    words: number;
    seconds: number;
    frames: number;
    startFrame: number;     // 自開頭累積
    durationFrames: number; // 等同於 frames
  };
  ```
- 內部使用 debounce（建議 150–250ms），避免每字符都重算造成卡頓。

## 驗收條件
- [ ] 文字變更後，側欄在 debounce 時間內更新
- [ ] WPM 變更立即重算（不 debounce 或縮短 debounce）
- [ ] 無標籤時回傳空陣列
- [ ] 多個標籤 `startFrame` 正確累積
- [ ] 大量輸入（>5000 字）時不卡頓

## 依賴關係
- US-01（解析）、US-04（基礎引擎）、US-05（停頓）、US-03（WPM）

**優先級**：P0
**相關需求**：REQ-5、US-2
