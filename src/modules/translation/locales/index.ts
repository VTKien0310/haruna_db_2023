import en from "./en.json";
import {
  createLocaleResolver,
  type LocaleKeyOf,
  type SameLocaleShape,
} from "@/libs/locales/LocaleResolver";

export const translationLocales = {
  en,
} as const satisfies Record<string, SameLocaleShape<typeof en>>;

export type TranslationLocale = keyof typeof translationLocales;
export type TranslationMessageKey = LocaleKeyOf<typeof en>;

export const t = createLocaleResolver<TranslationMessageKey, TranslationLocale>(
  translationLocales,
  "en",
);
