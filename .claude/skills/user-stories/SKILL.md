---
name: user-stories
description: >-
  Breaks requirements into small, independent implementation tasks with explicit inputs, outputs, acceptance criteria, and dependencies; writes each task as a separate `{task-name}.md` file. Use when the user asks for user stories, requirement decomposition, module breakdown, implementation tasks from specs, or references 需求／模組拆解／解決方案 documents.
---

# User Stories & Implementation Task Breakdown

## When to use

Apply when the goal is to turn **需求、模組拆解、解決方案**（或等價脈絡）into **可追蹤的小單元實作任務**，且每項任務需可獨立完成並可驗收。

## Workflow

1. **Gather context** — 取得（或請使用者提供）：
   - 需求文件
   - 模組拆解文件
   - 解決方案文件
2. **Decompose** — 依下方「Task principles」產出多個**小**任務；任務之間依賴需與模組拆解一致。
3. **Output** — 每個任務寫成**獨立檔案**：`{任務名稱}.md`（檔名反映任務標題，便於追蹤）。

## Task principles

Each task must be small enough to finish in one focused effort. For **every** task document, include:

| 欄位 | 說明 |
|------|------|
| **輸入格式** | 需要哪些輸入資料或前置條件？ |
| **輸出格式** | 會產出什麼具體結果（檔案、API、UI 狀態等）？ |
| **驗收條件** | 何種情況下視為完成？ |
| **依賴關係** | 須先完成哪些其他任務？ |

Keep dependencies explicit and acyclic where possible; reference the module breakdown when ordering work.

## User story document shape (per task file)

When framing work as user stories, prefer:

- **標準格式**：「作為…我想要…以便…」
- **驗收條件**：Checklist（可勾選）
- **優先級標記**（例如 P0 / P1）
- **相關功能對應**（規格章節或模組 ID）

## Prompt template（與使用者協作時可套用）

使用者若未貼全文脈，可依此結構請其補齊或自行代入已知路徑：

```
請根據以下脈絡，整理為個別小單元的實作任務：

- 需求： {需求文件}
- 模組拆解：{模組拆解文件}
- 解決方案：{解決方案文件}

任務請依照「Task principles」生成；每一項任務不要太大。
每個任務存成獨立文件，檔名為「{任務名稱}.md」。
```

## Example (user story + acceptance)

```markdown
### US-002：查看「我們的日常」文章列表
**作為** 求職者
**我想要** 瀏覽「我們的日常」文章列表
**以便** 了解公司內部日常活動與文化

**驗收條件**：
- [ ] 區塊標題顯示「我們的日常」與「Career News」
- [ ] 每篇文章顯示標題、發布日期、標籤徽章
- [ ] 每篇文章前有藍色箭頭圖示，表示可點擊
- [ ] 文章列表垂直排列，每篇文章間有適當間距
- [ ] 預設每頁顯示 3 篇文章
- [ ] 標題可點擊，連結至文章詳情頁
- [ ] 日期格式為 YYYY-MM-DD
- [ ] 響應式設計在各種裝置上正常運作

**優先級**：P0
**相關功能**：文章列表區塊（2.1.2）
```

## Notes

- Prefer **many small tasks** over few large ones; split by vertical slice or by clear interface boundaries when unsure.
- If source docs conflict, surface the conflict and propose a resolution before locking task lists.
