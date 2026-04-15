/**
 * 一行在 trim 後若僅由 Unicode 標點（\p{P}）組成，則視為「僅標點行」。
 * 空行（trim 後為空）不適用此規則。
 */
const PUNCTUATION_ONLY_LINE = /^\p{P}+$/u;

function isPunctuationOnlyLine(trimmedLine: string): boolean {
  if (trimmedLine.length === 0) return false;
  return PUNCTUATION_ONLY_LINE.test(trimmedLine);
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * 將逐字稿中「單行僅標點」之行併入上一行末尾（供播放行計算前使用）。
 * 不修改 DOM；不寫入 storage。
 */
export function normalizeManuscriptLinesForPlayback(text: string): string {
  const normalized = normalizeNewlines(text);
  const lines = normalized.split("\n");
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (isPunctuationOnlyLine(trimmed) && out.length > 0) {
      out[out.length - 1] += trimmed;
    } else {
      out.push(line);
    }
  }

  return out.join("\n");
}
