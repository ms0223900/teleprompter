import { DEFAULT_FPS } from "./calculateFrames";

/**
 * 標點停頓對照表（秒）。集中於此，日後可視真人錄音結果調整。
 * - comma 類：句內小停頓
 * - period 類：句末較長停頓
 * - newline：段落停頓
 */
export const PAUSE_SECONDS = {
  comma: 0.2,
  period: 0.4,
  newline: 0.3,
} as const;

const COMMA_CHARS = /[，,、;；]/g;
const PERIOD_CHARS = /[。.!?！？]/g;
const NEWLINE_CHARS = /\n/g;

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

/**
 * 累加文字中各類標點的停頓秒數。
 * 同一字元不會同時落入多類；對照表互斥即可。
 */
export function calculatePauseSeconds(text: string): number {
  if (!text) return 0;
  const commas = countMatches(text, COMMA_CHARS);
  const periods = countMatches(text, PERIOD_CHARS);
  const newlines = countMatches(text, NEWLINE_CHARS);
  return (
    commas * PAUSE_SECONDS.comma +
    periods * PAUSE_SECONDS.period +
    newlines * PAUSE_SECONDS.newline
  );
}

export function calculatePauseFrames(text: string, fps: number = DEFAULT_FPS): number {
  return Math.round(calculatePauseSeconds(text) * fps);
}
