import { countSpeechChars } from "./countChars";

/** Remotion 第一階段固定 FPS（PRD 技術約束） */
export const DEFAULT_FPS = 30;

/**
 * 暴露給 UI 的計數入口：沿用 Header `getCleanCharCount` 的 char-based 規則，
 * 使 sidebar 與 header 時長完全一致。
 */
export function countUnits(text: string): number {
  return countSpeechChars(text);
}

export type FrameCalculation = {
  units: number;
  seconds: number;
  frames: number;
};

/**
 * 依 WPM 與 FPS 將文字轉換為秒數與幀數。
 * - `wpm` 必須 > 0，否則回傳 0
 * - 計數採 char-based（與 Header 一致），不納入標點停頓
 * - `frames = round(seconds * fps)`
 */
export function calculateFrames(
  text: string,
  wpm: number,
  fps: number = DEFAULT_FPS,
): FrameCalculation {
  const units = countUnits(text);
  if (units === 0 || wpm <= 0) {
    return { units, seconds: 0, frames: 0 };
  }
  const seconds = (units / wpm) * 60;
  const frames = Math.round(seconds * fps);
  return { units, seconds, frames };
}
