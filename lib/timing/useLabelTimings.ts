"use client";

import { parseLabels } from "@/lib/labels/parseLabels";
import { useEffect, useMemo, useState } from "react";
import { calculateFrames, countUnits, DEFAULT_FPS } from "./calculateFrames";

export type LabelTiming = {
  label: string;
  units: number;
  seconds: number;
  /** durationFrames 等同；維持兩個欄位以相容 PRD 術語 */
  frames: number;
  startFrame: number;
  durationFrames: number;
};

/**
 * PRD US-06：以 `text` 中的合法標籤為切點，計算每一段「自該標籤至下一標籤」
 * 的字／詞數、秒數、幀數，並累積 `startFrame`。
 *
 * 語意：label 為某個 Step 的起點，該 Step 的內容為**此 label 至下一個 label 之間**
 * 的文字（最後一個 label 則吃到文末）。首個 label 之前的「前言」若存在，
 * 不列入清單（符合 PRD「分鏡起點」定位）。
 *
 * `debounceMs` 僅對 `text` 變動套用 debounce；`wpm` 變動立即重算。
 */
export function useLabelTimings(
  text: string,
  wpm: number,
  debounceMs: number = 200,
  fps: number = DEFAULT_FPS,
): LabelTiming[] {
  const [debouncedText, setDebouncedText] = useState(text);

  useEffect(() => {
    const delay = debounceMs > 0 ? debounceMs : 0;
    const id = setTimeout(() => setDebouncedText(text), delay);
    return () => clearTimeout(id);
  }, [text, debounceMs]);

  return useMemo(() => {
    const labels = parseLabels(debouncedText);
    if (labels.length === 0) return [];

    const timings: LabelTiming[] = [];
    let cumulative = 0;

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const start = label.endIndex;
      const end = i + 1 < labels.length ? labels[i + 1].startIndex : debouncedText.length;
      const segment = debouncedText.slice(start, end);

      const { frames, seconds } = calculateFrames(segment, wpm, fps);

      timings.push({
        label: label.label,
        units: countUnits(segment),
        seconds,
        frames,
        startFrame: cumulative,
        durationFrames: frames,
      });
      cumulative += frames;
    }

    return timings;
  }, [debouncedText, wpm, fps]);
}
