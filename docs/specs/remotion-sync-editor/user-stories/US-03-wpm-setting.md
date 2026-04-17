# US-03：WPM 語速設定（既有功能 — 複用）

> ⚠️ **現況**：WPM 功能已於主幹實作完成，本 US 僅需「讓新 Sync Editor 模組讀取現有 state」，不需重做。

## 既有實作位置
- `components/TelePrompter.tsx`
  - `DEFAULT_WPM = 170`（L75）
  - `const [wpm, setWpm] = useState(DEFAULT_WPM)`（L124）
  - 滑桿 UI：`min=50, max=300, step=10`（L390–393）
- `lib/storage/preferences.ts`
  - `TeleprompterPreferences.wpm` 欄位
  - 驗證範圍 `WPM_MIN=50, WPM_MAX=300`，且須為整數
  - 透過 `PREFERENCES_STORAGE_KEY = "teleprompter:preferences:v1"` 持久化
- `lib/useDebouncedPersist.ts`：偏好變更後 debounce 寫入 localStorage

## 本 US 實際待辦（縮減範圍）
- [x] 將 `wpm` 從 `TelePrompter` 以 prop / Context 下傳給 Sync Editor 相關元件（US-06 Hook、US-07 側欄）
- [x] 確認 Sync Editor 模組**直接複用**既有 state，不建立第二個 WPM 來源（避免雙事實來源）

## 不需再做
- ~~輸入欄位 / 滑桿 UI~~（已存在）
- ~~localStorage 持久化~~（已存在）
- ~~輸入驗證 / 預設值~~（已存在）

## 驗收條件
- [x] Sync Editor 模組讀到的 WPM 與側邊欄滑桿同步
- [x] 調整滑桿後，US-07 側欄秒數/幀數即時連動
- [x] 不新增 localStorage key，沿用 `teleprompter:preferences:v1`

## 依賴關係
- 無（既有功能）

**優先級**：P0（但工作量極小）
**相關需求**：US-3
