"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * `enabled` 為真且 `deps` 變動時，延遲 `debounceMs` 後呼叫 `flush`（前一次會被取消）。
 * 用於本機存檔 debounce；`flush` 內請讀 ref 取得最新快照。
 */
export function useDebouncedPersist(
  flush: () => void,
  enabled: boolean,
  debounceMs: number,
  ...deps: unknown[]
) {
  const flushRef = useRef(flush);
  useLayoutEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => {
      flushRef.current();
    }, debounceMs);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rest 參數為呼叫端傳入之觸發鍵（wpm、fontSize、text 等）
  }, [debounceMs, enabled, ...deps]);
}
