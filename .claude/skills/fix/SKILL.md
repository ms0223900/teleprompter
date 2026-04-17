---
name: fix
description: >-
  Runs type-check first, then fixes TypeScript and ESLint issues, evaluates tests
  and build without rushing fixes unless fixing bugs. Uses selection or issue
  description to localize bugs. Final gate runs type-check, lint, test, and
  build when scripts exist. Use when the user asks to fix the project, pass CI,
  resolve type or lint errors, fix bugs, debug failures, or verify npm run build.
---

# fix

## 硬性順序（兩種情境皆同）

1. **讀取** 專案根目錄的 `package.json`，讀取 `scripts`，標記不存在的腳本為 **N/A**。
2. **下一個步驟一律為型別檢查（階段 A）**：若存在 `type-check`（或專案慣用的同等腳本，例如 `typecheck`），執行 `npm run type-check`。有失敗則修正至通過，**再**進入 Lint、修 bug 定位、其餘步驟。無型別腳本時標記 N/A 並跳過，不阻斷後續。

## 情境分流

| 情境 | 條件 | 流程 |
|------|------|------|
| **健康度／CI** | 目標是清專案／過 CI，未指向具體行為 bug | 步驟 1 → 階段 A → 階段 B–D → 階段 E |
| **修 bug** | 描述錯誤行為、例外、錯誤訊息、或明確要修某問題 | 步驟 1 → 階段 A → **修 bug**（下節）→ 階段 E |

若需大範圍清 lint／型別同時修 bug：以**最小變更修 bug**為優先，其餘列為後續或與使用者對齊。

## 修 bug

**前置**：已完成階段 A（型別通過）。勿在未跑或未通過型別檢查前仅凭行為推測大改（專案無型別腳本時除外）。

1. **定位範圍**
   - **有選取或明確檔案**：編輯器選取區塊、附加檔案、`@` 路徑或可解析路徑 → 優先讀該區上下文，必要時沿 import／呼叫堆疊／同檔相鄰邏輯**向外一步**，避免擴散。
   - **無選取**：從錯誤訊息、堆疊、重現步驟、預期 vs 實際出發，搭配搜尋推斷檔案與函式；不確定時縮小候選或向使用者確認。

2. **實作**：最小變更，風格與專案一致。Next.js 行為不確定時，先讀 `node_modules/next/dist/docs/`（見專案 `AGENTS.md`）。

3. **測試相關**：健康度流水線的階段 C 預設「只報告、不急修測試」。修 bug 完成後須跑 **階段 E**；若閘門中 `npm test` 失敗，回報範圍並判斷是否與本次修改相關——相關則修復或與使用者對齊。

## 流水線（健康度）

### 階段 A — 型別（全域第一項檢查）

- 執行：`npm run <type-check 腳本名>`（以 `package.json` 為準）。
- 依編譯器輸出修正 TypeScript，直到通過。不硬編碼 `tsc` 參數。

### 階段 B — Lint

- 執行：`npm run lint`（或專案慣例）。
- 可視需要執行 ESLint 的 `--fix` 等價指令（例如 `lint` 僅為 `eslint` 時，可 `npx eslint . --fix`，以不破壞專案約定為準）。先讀 `eslint.config.*` / `.eslintrc*`。

### 階段 C — 測試（僅在 `scripts.test` 存在時）

- 執行 `npm test`，**彙整報告**：通過／失敗數量、影響檔案或套件、粗略分類（斷言、mock、非同步、快照等）。
- **預設不自動改程式以修測試**，除非使用者另行要求。

### 階段 D — 打包

- 若存在 `build`：`npm run build`。
- **預設不急著深入修復**非型別／非 lint 的打包問題。
- 若錯誤明顯與 **`.env`、環境變數、secret、部署設定** 有關：只向使用者說明缺什麼、何處設定；不捏造 secret。

### 階段 E — 驗證閘門

在健康度（型別與同意項目完成）或修 bug（實作完成）後，執行**一條命令鏈**，且**只串接 `package.json` 中存在的 scripts**：

1. 依序：`type-check` → `lint` →（若存在 `test`）`test` →（若存在 `build`）`build`。
2. 建構方式：先讀 `scripts`，用 `&&` 連接存在的項目；**不要**對不存在的腳本執行 `npm test` 或 `npm run build`（避免 npm 預設失敗）。

範例（此 repo：`type-check`、`lint`、`build` 存在，無 `test`）：

```bash
npm run type-check && npm run lint && npm run build
```

## 風險與邊界

- 無選取且描述模糊：先縮小候選或確認，避免大範圍誤改。
- Lint `--fix` 無法修滿所有規則；其餘手動或另開任務。
- Build 失敗需區分程式錯誤 vs 環境／secret。
