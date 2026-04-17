# US-002：編輯 Label — 狀態更新與驗證邏輯

**作為** 影片編輯者  
**我想要** 在提交新名稱後系統自動驗證並同步更新所有相關 UI  
**以便** 確保名稱有效、畫面上時間軸標記也同步顯示新名稱

**優先級**：P0  
**相關功能**：Side Panel Label Management — 編輯 Label（Spec §2、§3 AC1、§4、§6）

---

## 輸入格式

- 來自 US-001 的儲存觸發（`onSave(id: string, newName: string)`）
- 當前 Label 物件：`{ id: string, name: string, ... }`

## 輸出格式

- 驗證通過：呼叫 `updateLabel(id, { name: newName })`（API 呼叫 或 state dispatch）
- Optimistic UI：在 API 回應前，state 先行更新為新名稱
- 側邊面板列表立即顯示新名稱
- 時間軸（或其他引用該 Label 之處）同步更新為新名稱
- 驗證失敗：Input 欄位停留，顯示錯誤提示（不關閉編輯模式）

## 驗收條件

- [x] 名稱為空字串時，系統不儲存，Input 欄位顯示錯誤提示（e.g. 「名稱不得為空」）
- [x] 名稱超過長度限制（建議 ≤ 100 字元）時，顯示錯誤提示
- [x] 驗證通過後，側邊面板列表即時更新為新名稱（Optimistic UI）
- [x] 時間軸上引用該 Label 的標記同步顯示新名稱
- [ ] API 回傳失敗時，UI 回滾為舊名稱並顯示錯誤訊息
- [ ] 權限不足時（非擁有者或無編輯權），API 拒絕請求並顯示對應提示

## 驗收說明

- 驗證與第 N 次出現替換：`lib/labels/labelOccurrenceMutations.ts`（`validateLabelName`、`replaceLabelAtOccurrence`）；成功時更新父層 `text`，`LabeledTextarea` 與 `useLabelTimings` 隨文稿同步。
- 側欄名稱顯示以 `parseLabels(text)` 為準，避免與 `useLabelTimings` debounce 不同步。
- 本專案目前無遠端 Label API 與帳號權限；上列兩項與 API／權限相關之 AC 留待接後端時再驗收。

## 依賴關係

- 依賴 **US-001**（需先有 UI 觸發儲存事件）
- Label 物件須具備 `id: string` 主鍵（Spec §4 DB/State Schema）
