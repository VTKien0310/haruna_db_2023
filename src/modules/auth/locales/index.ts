import en from "./en.json";
import {
  createLocaleResolver,
  type LocaleKeyOf,
  type SameLocaleShape,
} from "@/libs/locales/LocaleResolver";

export const authLocales = {
  en,
} as const satisfies Record<string, SameLocaleShape<typeof en>>;

export type AuthLocale = keyof typeof authLocales;
export type AuthMessageKey = LocaleKeyOf<typeof en>;

export const t = createLocaleResolver<AuthMessageKey, AuthLocale>(
  authLocales,
  "en",
);
