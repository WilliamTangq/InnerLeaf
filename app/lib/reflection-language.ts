import { normalizeLanguage, type Language } from "./i18n";

export function detectReflectionLanguage(
  text: string,
  selectedUiLanguage: unknown
): Language {
  const uiLanguage = normalizeLanguage(selectedUiLanguage);
  const chineseChars = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latinWords = (text.match(/[A-Za-z]+(?:['-][A-Za-z]+)?/g) ?? []).length;

  if (chineseChars >= 4 && chineseChars >= latinWords * 0.2) {
    return "zh";
  }

  if (latinWords >= 3 && chineseChars < 4) {
    return "en";
  }

  return uiLanguage;
}
