"use client";

import { LABEL_PATTERN } from "@/lib/labels/parseLabels";
import { useLayoutEffect, useMemo, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

type Token =
  | { kind: "text"; text: string }
  | { kind: "label"; text: string };

/**
 * 將文字拆成一般文字與合法標籤 token，供 backdrop 上色。
 * 末尾若為純文字，附加一個空格以避免行尾 label 的 span 被瀏覽器折疊掉高度。
 */
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  LABEL_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(LABEL_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      tokens.push({ kind: "text", text: text.slice(cursor, start) });
    }
    tokens.push({ kind: "label", text: match[0] });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) {
    tokens.push({ kind: "text", text: text.slice(cursor) });
  }
  return tokens;
}

/**
 * 具標籤語法突顯的 textarea：透明文字的原生 textarea 疊在 backdrop 之上，
 * backdrop 負責以著色 span 呈現合法 `[labelName]`。
 * 不修改游標、選取與輸入行為。
 */
export default function LabeledTextarea({
  value,
  onChange,
  placeholder,
  className = "",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  const tokens = useMemo(() => tokenize(value), [value]);

  // 同步 backdrop 捲動位置，避免打字至長文時文字與高亮錯位。
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    const bd = backdropRef.current;
    if (!ta || !bd) return;
    const sync = () => {
      bd.scrollTop = ta.scrollTop;
      bd.scrollLeft = ta.scrollLeft;
    };
    sync();
    ta.addEventListener("scroll", sync);
    return () => ta.removeEventListener("scroll", sync);
  }, []);

  /** textarea 與 backdrop 必須共用的版型 class，確保字元度量與換行點一致 */
  const sharedLayout =
    "absolute inset-0 w-full h-full p-8 rounded-3xl border text-lg leading-relaxed font-mono whitespace-pre-wrap break-words";

  return (
    <div className={`relative ${className}`}>
      <div
        ref={backdropRef}
        aria-hidden
        className={`${sharedLayout} border-transparent overflow-hidden pointer-events-none text-gray-300 select-none`}
      >
        {tokens.map((t, i) =>
          t.kind === "label" ? (
            <span
              key={i}
              className="text-blue-400 font-semibold bg-blue-500/10 rounded-sm"
            >
              {t.text}
            </span>
          ) : (
            <span key={i}>{t.text}</span>
          ),
        )}
        {"\n"}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`${sharedLayout} bg-transparent border-white/5 focus:border-blue-500/50 outline-none resize-none shadow-inner transition-all text-transparent caret-blue-400 selection:bg-blue-500/30 selection:text-transparent placeholder:text-gray-500`}
      />
    </div>
  );
}
