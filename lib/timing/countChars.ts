/**
 * 計入「語速時長」的字元數。
 * 與 `TelePrompter` header 的 `getCleanCharCount` 一致：
 * 扣除 ASCII／中文標點與所有空白，其餘每個碼元各計 1。
 */
const NON_SPEECH = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~，。！？；：「」『』（）—…\s]/g;

export function countSpeechChars(text: string): number {
  if (!text) return 0;
  return text.replace(NON_SPEECH, "").length;
}
