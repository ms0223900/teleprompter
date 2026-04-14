# US-wordcount-00：測試前置作業與 TDD 約定

**作為** 開發者  
**我想要** 專案具備可執行的單元測試與 React 組件測試環境，並約定紅／綠／重構流程  
**以便** 以 TDD 開發字數邏輯，並為後續整合測試鋪路

**輸入格式**

- 現有專案：`next` 16.x、`react` 19.x、`typescript`、路徑別名 `@/*`（見 `tsconfig.json`）。
- 無既有測試框架時，於本任務內引入。

**輸出格式**

- **套件（devDependencies，版本依專案相容性鎖定）**，至少包含：
  - `vitest` — 測試執行器（與 Vite 生態一致，利於 ESM／TS）。
  - `jsdom` — 模擬瀏覽器 DOM（供 RTL 使用）。
  - `@testing-library/react` — 組件測試。
  - `@testing-library/user-event` — 模擬使用者輸入（建議用於整合測試）。
  - `@testing-library/jest-dom` — 擴充斷言（如 `toBeInTheDocument()`）。
- **設定檔**（路徑可微調，但須文件化）：
  - `vitest.config.ts`（或等價）：`environment: 'jsdom'`；`resolve.alias` 與 `@/*` 對齊 `tsconfig` paths，確保 `@/lib/...` 在測試中可解析。
  - 測試 setup 檔（例如 `vitest.setup.ts`）：匯入 `@testing-library/jest-dom/vitest`（或專案文件約定之寫法）。
- **`package.json` scripts**：
  - `test` — 監聽模式（例如 `vitest`）。
  - `test:run` — CI 單次執行（例如 `vitest run`），供型別檢查／lint 之外自動驗證。
- **（可選）** `npm run test:run` 納入既有 CI；若尚無 CI，至少在 US 驗收時手動執行通過。

**TDD 約定（字數相關 US 共用）**

1. **US-wordcount-01**：先新增／更新 `*.test.ts` 中**失敗案例**（紅）→ 實作 `getManuscriptCharStats` 至通過（綠）→ 必要時重構；禁止「先寫實作、完全不寫測」作為完成定義。
2. **US-wordcount-02／03**：建議對 UI 採 **行為驅動**：整合測試（US-wordcount-03）描述使用者可見結果；可採「先寫整合測試（紅）→ 實作／調整組件（綠）」或「先最小實作再補測試」，但 **US-wordcount-03 驗收前須有通過的整合測試**。

**驗收條件**

- [ ] `npm run test:run` 可結束且 exit code 0（即使尚無業務測試，也至少需有 smoke：例如空測試套件不建議；可放一個最小 `describe` 或待 01 補上）。
- [ ] 在任一 `*.test.ts` / `*.test.tsx` 中可 `import` 專案內 `@/` 模組且不報路徑錯誤。
- [ ] `@testing-library/jest-dom` 斷言於測試檔可用（若採用該 matchers）。
- [ ] 文件或本 US 註明：後續單元測試檔命名慣例（例如 `lib/foo.test.ts` 與 `foo.ts` 同目錄）。

**依賴關係**

- 無（**須最先完成**；**US-wordcount-01** 依賴本 US）。

**優先級**：P0  
**相關功能**：全專案測試基礎設施；字數功能 TDD 前置
