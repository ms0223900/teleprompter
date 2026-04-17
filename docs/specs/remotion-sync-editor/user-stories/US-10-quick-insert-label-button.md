# US-10：一鍵插入標籤按鈕

**作為** 創作者
**我想要** 點一顆按鈕就在游標處插入一個自動編號的標籤
**以便** 不用記憶語法、不用自己數編號，也不會重複命名

## 輸入格式
- 目前文稿字串 `text`
- 目前 textarea 游標選取範圍 `selectionStart` / `selectionEnd`
- 已存在的標籤清單（解析自 `text`，沿用 US-01 `parseLabels`）

## 輸出格式
- 編輯模式側欄／工具列新增按鈕：`+ 插入標籤`
- 點擊後：
  1. 計算下一個可用編號 `n`
  2. 於目前游標處插入 `[Step_<n>]`（若有選取區段則以插入覆蓋選取）
  3. 維持焦點在 textarea，並將游標移到插入後的位置（標籤結尾之後）
- 可選：若使用者尚未點擊過 textarea，`selectionStart` 為 `null`／不可用時，fallback 為「附加到文末」

## 自動編號規則
- **前綴**：預設 `Step_`（日後可抽為可設定常數，例如改成 `Scene_`）
- **編號來源**：掃描 `text` 中所有合法標籤，**僅挑出符合 `^<前綴>(\d+)$` 的標籤**取最大值 `+1`
  - 若無符合者 → 從 `1` 開始
  - 已存在 `Step_1`、`Step_2`、`Step_5` → 下一個為 `Step_6`
  - 存在與前綴無關的 `Intro`、`Outro` → 不影響編號，下一個仍為 `Step_<max+1>`（或 `Step_1`）
- **唯一性檢查**：若計算出的名稱剛好與既有同名（理論上不會發生，但安全起見），遞增直到不衝突

## 驗收條件
- [x] 按鈕存在於編輯模式可見處（側欄或編輯器上方工具列）
- [x] 點擊後在游標處插入 `[Step_<n>]`，n 為下一個可用編號
- [x] 首次使用（無任何 `Step_` 標籤）插入 `[Step_1]`
- [x] 已有 `[Step_1][Step_2]` → 下次為 `[Step_3]`
- [x] 已有 `[Step_1][Step_3]`（跳號）→ 下次為 `[Step_4]`（以最大值為基準，不回補跳號）
- [x] 已有不同前綴標籤（如 `[Intro]`）不影響 `Step_` 編號
- [x] 若 textarea 有選取文字，點擊後選取範圍被標籤覆蓋
- [x] 插入後游標停在標籤結尾之後
- [x] 插入後 textarea 保持焦點、捲動位置合理
- [x] 單元測試涵蓋「下一個編號」計算函式

## 技術設計建議
- 抽出純函式 `lib/labels/nextLabelName.ts`
  ```ts
  function nextLabelName(text: string, prefix?: string): string
  ```
- 按鈕元件負責處理 textarea ref 與游標操作：
  ```ts
  textarea.setRangeText(`[${name}]`, start, end, "end");
  textarea.focus();
  onChange(textarea.value);
  ```
- 將前綴設為常數 `DEFAULT_LABEL_PREFIX = "Step_"`，保留未來可傳入

## 不在此 US 範圍內
- 自訂前綴 UI（僅常數保留彈性，不做設定面板）
- 拖曳 / 重新排序標籤
- 插入時同步 scroll 到游標位置（若有需要再補）

## 依賴關係
- US-01（`parseLabels`、`LABEL_PATTERN`）
- US-02（`LabeledTextarea`：需要能透過 ref 存取底層 textarea 以操作 `selectionStart`/`setRangeText`；若目前元件未暴露 ref，需小幅調整）

## 驗收說明
- 實作：
  - `lib/labels/nextLabelName.ts`（`DEFAULT_LABEL_PREFIX = "Step_"`、`nextLabelName(text, prefix?)`）
  - `lib/mergeRefs.ts`（多 ref 合併工具，使 `LabeledTextarea` 可同時供自用與對外暴露 textarea）
  - `LabeledTextarea` 新增 `textareaRef` prop
  - 按鈕位於 `SyncSidebar` header「+ 插入標籤」
- 行為：以 `ta.selectionStart/End` 計算插入位置，`requestAnimationFrame` 內 `setSelectionRange` 以避免 React 更新前搶跑
- 選取文字時覆蓋選取；無 focus 時 fallback 附加到文末
- 測試：`lib/labels/nextLabelName.test.ts`（6 tests 全部通過）

**優先級**：P0
**相關需求**：PRD US-1 的體驗增強；US-07「快速開始」指引