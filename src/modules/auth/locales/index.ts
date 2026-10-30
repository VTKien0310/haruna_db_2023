import en from "./en.json";

export const authLocales = {
  en,
} as const satisfies Record<string, { [K in keyof typeof en]: string }>;

export type AuthLocale = keyof typeof authLocales;
export type AuthMessageKey = keyof typeof en;

export function t(key: AuthMessageKey, locale: AuthLocale = "en"): string {
  return authLocales[locale][key];
}
