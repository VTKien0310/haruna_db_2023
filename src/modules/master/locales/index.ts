import en from "./en.json";
import {
  createLocaleResolver,
  type LocaleKeyOf,
  type SameLocaleShape,
} from "@/libs/locales/LocaleResolver";

export const masterLocales = {
  en,
} as const satisfies Record<string, SameLocaleShape<typeof en>>;

export type MasterLocale = keyof typeof masterLocales;
export type MasterMessageKey = LocaleKeyOf<typeof en>;

export const t = createLocaleResolver<MasterMessageKey, MasterLocale>(
  masterLocales,
  "en",
);
