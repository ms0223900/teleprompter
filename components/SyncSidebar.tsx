"use client";

import { DEFAULT_LABEL_PREFIX, nextLabelName } from "@/lib/labels/nextLabelName";
import {
  buildTimingsExport,
  formatTimingsJson,
} from "@/lib/timing/exportTimingsJson";
import type { LabelTiming } from "@/lib/timing/useLabelTimings";
import { Copy, Download, HelpCircle, Plus, X } from "lucide-react";
import { RefObject, useState } from "react";

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

  const hasTimings = timings.length > 0;
  const { segments } = buildTimingsExport(timings, wpm);

  return (
    <aside className="w-full md:w-96 shrink-0 h-full border-l border-white/5 bg-gray-900/30 backdrop-blur-sm flex flex-col overflow-hidden">
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {showHelp && <HelpPopover onClose={() => setShowHelp(false)} />}

        {!hasTimings ? (
          <UsageGuide />
        ) : (
          <ul className="divide-y divide-white/5">
            {timings.map((t, i) => (
              <li key={`${t.label}-${i}`} className="px-4 py-3 hover:bg-white/5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-blue-300 font-semibold text-sm truncate">
                    [{t.label}]
                  </span>
                  <span
                    className={`font-mono text-xs ${severityClass(t.seconds)}`}
                  >
                    {t.seconds.toFixed(1)}s
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-gray-500">
                  <span title="字／詞數">{t.units} u</span>
                  <span title="段落長度（frames）">{t.durationFrames}f</span>
                  <span title="起始幀" className="ml-auto">
                    @{t.startFrame}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: export */}
      <div className="border-t border-white/5 p-3 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={copyJson}
            disabled={!hasTimings}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Copy size={13} /> 複製 JSON
          </button>
          <button
            onClick={downloadJson}
            disabled={!hasTimings}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Download size={13} /> 下載 JSON
          </button>
        </div>
        {exportMsg && (
          <p className="text-[11px] text-blue-400 text-center">{exportMsg}</p>
        )}
        {hasTimings && (
          <p className="text-[10px] text-gray-600 text-center font-mono">
            fps 30 · wpm {wpm} · {segments.length} segments
          </p>
        )}
      </div>
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
