import en from "./en.json";
import {
  createLocaleResolver,
  type LocaleKeyOf,
} from "@/libs/locales/LocaleResolver";
export const t = createLocaleResolver<LocaleKeyOf<typeof en>, "en">(
  { en },
  "en",
);
