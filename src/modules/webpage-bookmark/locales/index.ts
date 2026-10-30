import en from "./en.json";
import {
  createLocaleResolver,
  type LocaleKeyOf,
  type SameLocaleShape,
} from "@/libs/locales/LocaleResolver";

export const webpageBookmarkLocales = {
  en,
} as const satisfies Record<string, SameLocaleShape<typeof en>>;

export type WebpageBookmarkLocale = keyof typeof webpageBookmarkLocales;
export type WebpageBookmarkMessageKey = LocaleKeyOf<typeof en>;

export const t = createLocaleResolver<
  WebpageBookmarkMessageKey,
  WebpageBookmarkLocale
>(webpageBookmarkLocales, "en");
