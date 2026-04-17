"use client";

import { ReactNode, RefObject, useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  /** 主要說明（可含標籤名稱） */
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 關閉後將焦點還原至此（例如刪除按鈕） */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * 輕量確認對話框：遮罩 z-index 高於側欄，Esc 等同取消。
 */
export default function ConfirmDialog({
  open,
  title = "確認",
  children,
  confirmLabel = "確定",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
  returnFocusRef,
}: Props) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        queueMicrotask(() => returnFocusRef?.current?.focus());
      }
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-xl border border-white/10 bg-gray-900 shadow-xl p-4 sm:p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-sm font-semibold text-gray-100 mb-2"
        >
          {title}
        </h2>
        <div className="text-xs text-gray-300 leading-relaxed mb-4">{children}</div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
