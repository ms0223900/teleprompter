import { LABEL_PATTERN } from "./parseLabels";

/**
 * 將文字中的合法標籤 `[labelName]` 置換為 `replacement`。
 * 預設移除（置換為空字串）；未來若要改成換行或其他分隔符，
 * 直接傳入 `replacement`（例如 `"\n"`）即可，不需改呼叫端。
 */
export function stripLabels(text: string, replacement: string = ""): string {
  return text.replace(LABEL_PATTERN, replacement);
}
