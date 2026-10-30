import en from "./en.json";

export const translationLocales = {
  en,
} as const satisfies Record<string, { [K in keyof typeof en]: string }>;

export type TranslationLocale = keyof typeof translationLocales;
export type TranslationMessageKey = keyof typeof en;

export function t(
  key: TranslationMessageKey,
  locale: TranslationLocale = "en",
): string {
  return translationLocales[locale][key];
}
