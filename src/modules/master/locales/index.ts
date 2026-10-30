import en from "./en.json";

export const masterLocales = {
  en,
} as const satisfies Record<string, { [K in keyof typeof en]: string }>;

export type MasterLocale = keyof typeof masterLocales;
export type MasterMessageKey = keyof typeof en;

export function t(key: MasterMessageKey, locale: MasterLocale = "en"): string {
  return masterLocales[locale][key];
}
