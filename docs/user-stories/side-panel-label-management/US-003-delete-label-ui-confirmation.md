# US-003：刪除 Label — 前端 UI 與確認對話框

**作為** 影片編輯者  
**我想要** 在 Label 旁點擊刪除圖示並看到確認提示  
**以便** 避免誤刪重要標記，並在確認後安全移除

**優先級**：P0  
**相關功能**：Side Panel Label Management — 刪除 Label（Spec §2、§3 AC2、§6）

---

## 輸入格式

- 側邊面板已渲染 Label 列表，每個 Label 具備 `id: string` 與 `name: string`
- 使用者點擊某個 Label 旁的垃圾桶（刪除）圖示

## 輸出格式

- 彈出確認對話框（Modal 或 Tooltip），顯示：
  - 提示文字（e.g. 「確定要刪除「{labelName}」嗎？」）
  - 「確定」按鈕 → 觸發刪除流程（交由 US-004 處理）
  - 「取消」按鈕 → 關閉對話框，Label 不變
- 對話框關閉後焦點回到觸發元素

## 驗收條件

- [x] 每個 Label 項目旁顯示垃圾桶圖示
- [x] 點擊垃圾桶後，彈出確認對話框（非直接刪除）
- [x] 對話框標題或內文包含被刪除 Label 的名稱
- [x] 點擊「取消」後：對話框關閉，Label 依然存在列表中（AC2）
- [x] 對話框的 z-index 高於側邊面板，不會被遮擋（Spec §6 Z-index）
- [x] 對話框在小螢幕下版面不破版（Responsive）
- [x] 鍵盤 `Esc` 可關閉對話框（等同取消）

## 驗收說明

- 實作：`components/ConfirmDialog.tsx`（`z-50`、遮罩、`Esc`、`returnFocusRef`）；`SyncSidebar` 內嵌刪除確認文案與 `Trash2` 觸發。

## 依賴關係

- 無前置 US（可獨立開發 UI 層）
- 確認後的刪除邏輯由 **US-004** 接手
