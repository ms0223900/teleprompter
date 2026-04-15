"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * 在分頁關閉或隱藏時補寫（搭配 debounce 持久化時避免遺失最後變更）。
 * `flush` 每次 render 會更新，事件永遠呼叫最新快照。
 */
export function useFlushOnHide(flush: () => void, enabled: boolean) {
  const flushRef = useRef(flush);
  useLayoutEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    if (!enabled) return;
    const run = () => {
      flushRef.current();
    };
    window.addEventListener("beforeunload", run);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") run();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", run);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);
}
