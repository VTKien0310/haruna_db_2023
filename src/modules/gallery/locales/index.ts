import en from "./en.json";
import {
  createLocaleResolver,
  type LocaleKeyOf,
  type SameLocaleShape,
} from "@/libs/locales/LocaleResolver";

export const galleryLocales = {
  en,
} as const satisfies Record<string, SameLocaleShape<typeof en>>;

export type GalleryLocale = keyof typeof galleryLocales;
export type GalleryMessageKey = LocaleKeyOf<typeof en>;

export const t = createLocaleResolver<GalleryMessageKey, GalleryLocale>(
  galleryLocales,
  "en",
);
