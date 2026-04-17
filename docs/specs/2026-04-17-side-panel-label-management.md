# AI Dev Spec: Side Panel Label Management (Edit & Delete)

## 1. 核心 User Story (Core User Stories)

- **編輯 Label**: As a 影片編輯者, I want 在側邊面板直接點擊並修改 Label 的內容, So that 我可以快速修正標記錯誤或更新資訊。
- **刪除 Label**: As a 影片編輯者, I want 能夠一鍵刪除不再需要的 Label, So that 保持工作區的整潔。

## 2. 功能細節 (Functional Specs)

### For Story: 編輯 Label
- **前端 UI**:
  - 側邊面板的 Label 項目應包含「編輯」按鈕或支援「雙擊/點擊」進入編輯狀態。
  - 進入編輯模式後，將文字顯示改為 Input 欄位。
  - 支援 `Enter` 鍵儲存變更，`Esc` 鍵放棄編輯。
- **後端/狀態行為**:
  - 呼叫更新 API 或 Dispatch 狀態變更（例如：`updateLabel(id, newData)`）。
  - 需驗證名稱是否符合規範（非空、長度限制）。

### For Story: 刪除 Label
- **前端 UI**:
  - Label 項目旁顯示明確的刪除圖示（垃圾桶）。
  - 點擊後必須顯示確認對話框（Confirmation Modal/Tooltip），防止誤刪。
- **後端/狀態行為**:
  - 呼叫刪除 API 或 Dispatch 刪除動作（例如：`deleteLabel(id)`）。
  - 成功後，UI 應立即移除該項目。

## 3. 驗收標準 (Acceptance Criteria, AC)

### AC 1: 成功編輯 Label
- **Given**: 使用者在側邊面板開啟 Label 列表。
- **When**: 點擊編輯按鈕，將名稱從 "Old Name" 改為 "New Name" 並儲存。
- **Then**: 
  - 列表顯示更新為 "New Name"。
  - 畫面上其他引用該 Label 的地方（如時間軸標記）也應同步更新。

### AC 2: 刪除 Label 的確認與取消
- **Given**: 使用者點擊刪除按鈕。
- **When**: 在彈出的確認視窗點擊「取消」。
- **Then**: 視窗關閉，Label 依然存在於列表中。

### AC 3: 成功執行刪除
- **Given**: 使用者在確認視窗點擊「確定」。
- **Then**: 
  - Label 從側邊面板消失。
  - 畫面上關聯的標記也一併移除。

## 4. 技術邊界 (Technical Boundaries)

- **DB/State Schema**: 確保 Label 物件具備 `id: string` 主鍵。
- **API & Permissions**: 僅有專案擁有者或具備編輯權限的使用者可執行。
- **Optimistic UI**: 建議在 API 回傳前先在 UI 上進行更新，提升使用者體驗。

## 5. MVP 判定 (MVP vs Later)

- **編輯名稱**: MVP: true
- **刪除功能**: MVP: true
- **編輯顏色**: MVP: false (後續優化)
- **批量管理**: MVP: false (後續優化)

## 6. 資訊缺失與風險 / 注意事項 (Missing Info / Risks / Notes)

### 一、開發實作時應注意 (Implementation-time Concerns)
- **Z-index**: 確保刪除確認視窗（Modal）不會被側邊面板遮擋。
- **Responsive**: 在小螢幕或窄面板下，編輯 Input 框不應超出容器寬度。

### 二、規格與需求灰區 (Spec-level Gaps / Pre-dev Questions)
- **Label 引用檢查**: 若 Label 正被某些邏輯引用（例如作為篩選條件），刪除是否會導致崩潰？

### 三、動態詢問與邊界調整 (Runtime/Dynamic Clarifications)
- **空名稱處理**: 如果使用者將名稱刪除成空字串並儲存，系統應自動恢復舊名稱或提示錯誤。
