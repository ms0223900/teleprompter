# US-local-01：稿件本地儲存層（key、讀寫、SSR 安全）

**作為** 提詞器使用者  
**我想要** 稿件內容能以穩定、可版本演進的方式讀寫於瀏覽器本機  
**以便** 後續載入與自動儲存時行為一致且不崩潰

**輸入格式**

- 專案內約定之 `localStorage` key 名稱（或常數），以及可選的 schema 版本號。
- 呼叫環境：僅在 `typeof window !== "undefined"` 時操作 `localStorage`。

**輸出格式**

- 一個小型模組（例如 `lib/storage/manuscript.ts`，並自 `@/lib/storage` 匯出），至少提供：
  - `loadManuscript(): string | null` — 成功回傳已儲存字串；無資料或損毀時回傳 `null`（由呼叫端決定是否用預設稿）。
  - `saveManuscript(text: string): void` — 將完整稿件字串寫入本機。
- 可選：內部使用 JSON 包一層 `{ version: number, text: string }` 以利未來擴充；讀取時若版本不符或 parse 失敗，回傳 `null` 或安全降級。

**驗收條件**

- [x] 在無 `window` / SSR 情境下呼叫讀寫不會拋錯（no-op 或 guarded）。
- [x] `localStorage` quota 或寫入失敗時不導致整頁白屏（可靜默失敗或 `console.warn`，由實作約定）。
- [x] 單元測試或手動驗證：寫入後重新讀取與原字串一致（含換行、空字串邊界若產品允許）。

**驗收說明**：已實作 `lib/storage/manuscript.ts`（`loadManuscript` / `saveManuscript`、JSON `version`）；底層共用 `lib/storage/localStorageJson.ts`；公開匯入 `@/lib/storage`。讀寫皆守護 `typeof window`；寫入失敗 `console.warn`。請於瀏覽器手動確認編輯後重新整理內容一致。

**依賴關係**

- 無（本任務為本地儲存基礎，應最先完成）。

**優先級**：P0  
**相關功能**：`components/TelePrompter.tsx` 之 `text` 狀態來源／持久化
