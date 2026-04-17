# US-001：編輯 Label — 前端 UI 互動

**作為** 影片編輯者  
**我想要** 在側邊面板點擊 Label 項目後進入編輯模式  
**以便** 快速修正標記錯誤或更新名稱，無需離開當前工作區

**優先級**：P0  
**相關功能**：Side Panel Label Management — 編輯 Label（Spec §2、§3 AC1）

---

## 輸入格式

- 側邊面板已渲染 Label 列表，每個 Label 具備 `id: string` 與 `name: string`
- 使用者觸發「編輯」動作（雙擊文字 或 點擊編輯圖示）

## 輸出格式

- Label 文字區塊切換為 `<input>` 欄位，預填當前名稱
- 使用者按 `Enter` → 觸發儲存（交由 US-002 處理驗證與狀態更新）
- 使用者按 `Esc` → 放棄編輯，恢復原始文字顯示

## 驗收條件

- [ ] Label 列表每個項目顯示「編輯」圖示（鉛筆或類似符號）
- [ ] 點擊編輯圖示或雙擊 Label 文字後，文字區塊替換為 `<input>` 欄位
- [ ] Input 欄位預填當前 Label 名稱，並自動聚焦（`autoFocus`）
- [ ] 按 `Enter` 呼叫儲存流程（onSave callback / dispatch）
- [ ] 按 `Esc` 或點擊欄位外部，取消編輯並還原原始顯示
- [ ] Input 欄位寬度不超出側邊面板容器（Responsive）
- [ ] 同一時間只有一個 Label 可處於編輯狀態

## 依賴關係

- 無前置 US（可獨立開發 UI 層）
- 儲存成功/失敗的邏輯由 **US-002** 接手
