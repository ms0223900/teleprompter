"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import { DEFAULT_LABEL_PREFIX, nextLabelName } from "@/lib/labels/nextLabelName";
import {
  removeLabelAtOccurrence,
  replaceLabelAtOccurrence,
} from "@/lib/labels/labelOccurrenceMutations";
import { parseLabels } from "@/lib/labels/parseLabels";
import {
  buildTimingsExport,
  formatTimingsJson,
} from "@/lib/timing/exportTimingsJson";
import type { LabelTiming } from "@/lib/timing/useLabelTimings";
import { Copy, Download, HelpCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function makeExportFilename(): string {
  return `sync-${Date.now()}.json`;
}

type Props = {
  text: string;
  onTextChange: (next: string) => void;
  timings: LabelTiming[];
  wpm: number;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

/** 視覺警示閾值（秒） */
const SEG_TOO_LONG = 10;
const SEG_TOO_SHORT = 1;

export default function SyncSidebar({
  text,
  onTextChange,
  timings,
  wpm,
  textareaRef,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const parsedLabels = useMemo(() => parseLabels(text), [text]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editingRowRef = useRef<HTMLLIElement | null>(null);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setDraftName("");
    setEditError(null);
  }, []);

  const submitEdit = useCallback(() => {
    if (editingIndex === null) return;
    const result = replaceLabelAtOccurrence(text, editingIndex, draftName);
    if (!result.ok) {
      setEditError(result.message);
      return;
    }
    onTextChange(result.text);
    cancelEdit();
  }, [cancelEdit, draftName, editingIndex, onTextChange, text]);

  useEffect(() => {
    if (editingIndex === null) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = editingRowRef.current;
      if (el && !el.contains(e.target as Node)) {
        cancelEdit();
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [editingIndex, cancelEdit]);

  const startEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setDraftName(currentName);
    setEditError(null);
  };

  const openDeleteDialog = (index: number, trigger: HTMLButtonElement) => {
    deleteTriggerRef.current = trigger;
    setDeleteIndex(index);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setDeleteIndex(null);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;
    onTextChange(removeLabelAtOccurrence(text, deleteIndex));
    closeDeleteDialog();
  };

  const deleteLabelName =
    deleteIndex !== null ? parsedLabels[deleteIndex]?.label ?? "" : "";

  const insertLabel = () => {
    const ta = textareaRef.current;
    const name = nextLabelName(text, DEFAULT_LABEL_PREFIX);
    const insertion = `[${name}]`;
    if (!ta) {
      onTextChange(text + insertion);
      return;
    }
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? start;
    const next = text.slice(0, start) + insertion + text.slice(end);
    onTextChange(next);
    // 游標移至新標籤後
    const after = start + insertion.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(after, after);
    });
  };

  const copyJson = async () => {
    const json = formatTimingsJson(timings, wpm);
    try {
      await navigator.clipboard.writeText(json);
      flash("已複製 JSON");
    } catch {
      flash("複製失敗");
    }
  };

  const downloadJson = () => {
    const json = formatTimingsJson(timings, wpm);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = makeExportFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flash("JSON 已下載");
  };

  function flash(msg: string) {
    setExportMsg(msg);
    setTimeout(() => setExportMsg(null), 1600);
  }

  const hasLabels = parsedLabels.length > 0;
  const { segments } = buildTimingsExport(timings, wpm);
  const timingsInSync = timings.length === parsedLabels.length && timings.length > 0;
  const hasTimings = timings.length > 0;
  const exportReady = hasTimings && timingsInSync;

  return (
    <aside className="w-full md:w-96 shrink-0 h-full border-l border-white/5 bg-gray-900/30 backdrop-blur-sm flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-sm font-semibold text-gray-200">Sync Editor</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={insertLabel}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition"
            title="在游標處插入自動編號的標籤"
          >
            <Plus size={12} /> 插入標籤
          </button>
          <button
            onClick={() => setShowHelp((v) => !v)}
            className={`p-1.5 rounded-full transition ${
              showHelp ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
            title="使用說明"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {hasLabels && (
        <p className="px-4 py-2 text-[11px] text-gray-500 border-b border-white/5 leading-snug">
          雙擊標籤名稱可編輯，亦可點擊鉛筆圖示。
        </p>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {showHelp && <HelpPopover onClose={() => setShowHelp(false)} />}

        {!hasLabels ? (
          <UsageGuide />
        ) : (
          <ul className="divide-y divide-white/5">
            {parsedLabels.map((pl, i) => {
              const t = timings[i];
              const displayName = pl.label;
              const isEditing = editingIndex === i;
              return (
                <li
                  key={`${pl.startIndex}-${i}`}
                  ref={isEditing ? editingRowRef : undefined}
                  className="px-4 py-3 hover:bg-white/5"
                >
                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    {isEditing ? (
                      <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <input
                          autoFocus
                          value={draftName}
                          onChange={(e) => {
                            setDraftName(e.target.value);
                            setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              e.preventDefault();
                              cancelEdit();
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              submitEdit();
                            }
                          }}
                          className="w-full min-w-0 max-w-full rounded px-2 py-1 text-sm font-mono font-semibold text-blue-200 bg-black/40 border border-white/15 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          aria-invalid={!!editError}
                          aria-describedby={editError ? `edit-err-${i}` : undefined}
                        />
                        {editError && (
                          <p id={`edit-err-${i}`} className="text-[11px] text-rose-400">
                            {editError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onDoubleClick={() => startEdit(i, displayName)}
                        className="font-mono text-blue-300 font-semibold text-sm truncate text-left min-w-0 flex-1 hover:underline underline-offset-2"
                        title="雙擊編輯名稱"
                      >
                        [{displayName}]
                      </button>
                    )}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(i, displayName)}
                            className="p-1 rounded text-gray-500 hover:text-blue-300 hover:bg-white/5 transition"
                            title="編輯標籤名稱"
                            aria-label="編輯標籤名稱"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openDeleteDialog(i, e.currentTarget)}
                            className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-white/5 transition"
                            title="刪除此標籤"
                            aria-label="刪除此標籤"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      {t ? (
                        <span
                          className={`font-mono text-xs ml-1 ${severityClass(t.seconds)}`}
                        >
                          {t.seconds.toFixed(1)}s
                        </span>
                      ) : (
                        <span className="font-mono text-xs ml-1 text-gray-600">…</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-gray-500">
                    {t ? (
                      <>
                        <span title="字／詞數">{t.units} u</span>
                        <span title="段落長度（frames）">{t.durationFrames}f</span>
                        <span title="起始幀" className="ml-auto">
                          @{t.startFrame}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-600">統計更新中…</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer: export */}
      <div className="border-t border-white/5 p-3 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={copyJson}
            disabled={!exportReady}
            title={!exportReady && hasLabels ? "統計計算中，請稍候再試" : undefined}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Copy size={13} /> 複製 JSON
          </button>
          <button
            onClick={downloadJson}
            disabled={!exportReady}
            title={!exportReady && hasLabels ? "統計計算中，請稍候再試" : undefined}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Download size={13} /> 下載 JSON
          </button>
        </div>
        {exportMsg && (
          <p className="text-[11px] text-blue-400 text-center">{exportMsg}</p>
        )}
        {exportReady && (
          <p className="text-[10px] text-gray-600 text-center font-mono">
            fps 30 · wpm {wpm} · {segments.length} segments
          </p>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="刪除標籤"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        returnFocusRef={deleteTriggerRef}
      >
        <p>
          確定要刪除「<span className="font-mono text-blue-300">{deleteLabelName}</span>
          」嗎？此標籤在文稿中的該次出現會被移除，並影響分鏡統計。
        </p>
      </ConfirmDialog>
    </aside>
  );
}

function severityClass(seconds: number): string {
  if (seconds > SEG_TOO_LONG) return "text-amber-400";
  if (seconds < SEG_TOO_SHORT) return "text-rose-400";
  return "text-gray-300";
}

function HelpPopover({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative border-b border-white/5 bg-gray-950/80 px-4 py-3 text-xs text-gray-300 leading-relaxed">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-white"
        aria-label="關閉說明"
      >
        <X size={12} />
      </button>
      <p className="font-semibold text-gray-200 mb-1">語法規則</p>
      <p>
        格式：<code className="text-blue-300">[labelName]</code>，名稱限英數字與底線。
      </p>
      <p className="mt-2">
        合法：<code className="text-blue-300">[Intro]</code>、
        <code className="text-blue-300">[Step_1]</code>
      </p>
      <p>
        非法：<code className="text-gray-500">[中文]</code>、
        <code className="text-gray-500">[foo-bar]</code>
      </p>
      <p className="mt-2 text-gray-400">
        側欄標籤列表中，雙擊名稱可編輯，亦可點擊鉛筆圖示。
      </p>
    </div>
  );
}

function UsageGuide() {
  return (
    <div className="p-4 text-sm text-gray-300 leading-relaxed space-y-4">
      <section>
        <h3 className="text-gray-200 font-semibold mb-1">什麼是標籤？</h3>
        <p className="text-gray-400 text-xs">
          標籤（Label）是分鏡記號，用於在逐字稿中標示動畫切換點。
          寫稿同時就能看到每一段 Step 的預計秒數與幀數，可匯出為 Remotion 可消費的 JSON。
        </p>
      </section>

      <section>
        <h3 className="text-gray-200 font-semibold mb-1">語法規則</h3>
        <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
          <li>
            格式：<code className="text-blue-300">[labelName]</code>
          </li>
          <li>名稱限制：英數字與底線（A-Z、a-z、0-9、_）</li>
          <li>
            合法：<code className="text-blue-300">[Intro]</code>、
            <code className="text-blue-300">[Step_1]</code>、
            <code className="text-blue-300">[outro_2]</code>
          </li>
          <li>
            非法：<code className="text-gray-500">[中文]</code>、
            <code className="text-gray-500">[has space]</code>、
            <code className="text-gray-500">[foo-bar]</code>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-gray-200 font-semibold mb-1">範例</h3>
        <pre className="text-[11px] bg-black/40 rounded p-2 text-gray-300 whitespace-pre-wrap">
{`[Intro]
今天要介紹三個重點。
[Step_1]
第一個重點是……
[Step_2]
第二個重點是……
[Outro]
以上就是今天的分享，謝謝大家。`}
        </pre>
      </section>

      <section>
        <h3 className="text-gray-200 font-semibold mb-1">行為</h3>
        <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
          <li>編輯模式：標籤以藍色突顯</li>
          <li>播放模式：標籤不出現在畫面上，僅作切段依據</li>
          <li>側欄：顯示每段字詞數、秒數、幀數與累積起始幀</li>
          <li>側欄列表：雙擊標籤名稱可編輯，亦可點擊鉛筆圖示。</li>
          <li>匯出：<code>{"{ label, startFrame, durationFrames }"}</code></li>
        </ul>
      </section>

      <section>
        <h3 className="text-gray-200 font-semibold mb-1">快速開始</h3>
        <p className="text-xs text-gray-400">
          點右上角「+ 插入標籤」自動編號插入於游標處，或直接手動輸入。
        </p>
      </section>
    </div>
  );
}
