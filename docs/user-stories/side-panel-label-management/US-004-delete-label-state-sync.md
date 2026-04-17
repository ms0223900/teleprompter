# US-004：刪除 Label — 狀態更新與 UI 同步

**作為** 影片編輯者  
**我想要** 確認刪除後系統立即從列表與時間軸上移除該 Label  
**以便** 保持工作區整潔，並避免殘留的孤立標記造成混亂

**優先級**：P0  
**相關功能**：Side Panel Label Management — 刪除 Label（Spec §2、§3 AC3、§4、§6）

---

## 輸入格式

- 來自 US-003 確認對話框「確定」按鈕的觸發（`onConfirmDelete(id: string)`）
- 當前 Label 物件：`{ id: string, name: string, ... }`

## 輸出格式

- 呼叫 `deleteLabel(id)`（API 呼叫 或 state dispatch）
- Optimistic UI：在 API 回應前，state 先行移除該 Label
- 側邊面板列表立即移除該項目
- 時間軸（或其他引用該 Label 之處）對應標記一併移除
- API 回傳失敗時：UI 回滾，重新加回該 Label 並顯示錯誤訊息

## 驗收條件

- [ ] 點擊確認後，側邊面板 Label 列表即時移除該項目（Optimistic UI，AC3）
- [ ] 時間軸上與該 Label 關聯的所有標記同步消失（AC3）
- [ ] API 成功回應後，UI 狀態穩定，無殘留資料
- [ ] API 回傳失敗時，UI 回滾並顯示錯誤提示
- [ ] 權限不足時（非擁有者或無編輯權），API 拒絕請求並顯示對應提示
- [ ] 若 Label 正被其他邏輯引用（如篩選條件），刪除後不應造成 runtime crash（需處理孤立引用，Spec §6 Label 引用檢查）

## 依賴關係

- 依賴 **US-003**（需先有確認對話框觸發刪除事件）
- Label 物件須具備 `id: string` 主鍵（Spec §4 DB/State Schema）

## 風險備註

- **孤立引用問題**（灰區）：若 Label 被用作篩選條件或其他動態引用，刪除前應評估是否需要清除關聯，或在刪除後做 graceful fallback，以防 crash。需與產品確認行為。
