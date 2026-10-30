import en from "./en.json";

export const webpageBookmarkLocales = {
  en,
} as const satisfies Record<string, { [K in keyof typeof en]: string }>;

export type WebpageBookmarkLocale = keyof typeof webpageBookmarkLocales;
export type WebpageBookmarkMessageKey = keyof typeof en;

export function webpageBookmarkMessage(
  key: WebpageBookmarkMessageKey,
  params: Record<string, string | number> = {},
  locale: WebpageBookmarkLocale = "en",
): string {
  return Object.entries(params).reduce<string>(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    webpageBookmarkLocales[locale][key],
  );
}
