import type { MutableRefObject, Ref, RefCallback } from "react";

/**
 * 合併多個 ref（callback / object）為單一 callback ref。
 * 用於元件同時需要自用 ref 與對外暴露 ref 的情境。
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
}
