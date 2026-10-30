import en from "./en.json";

export const galleryLocales = {
  en,
} as const satisfies Record<string, { [K in keyof typeof en]: string }>;

export type GalleryLocale = keyof typeof galleryLocales;
export type GalleryMessageKey = keyof typeof en;

export function t(
  key: GalleryMessageKey,
  params: Record<string, string | number> = {},
  locale: GalleryLocale = "en",
): string {
  return Object.entries(params).reduce<string>(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    galleryLocales[locale][key],
  );
}
