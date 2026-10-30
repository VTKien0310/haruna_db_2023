/**
 * Shared machinery for module-local DIY translations.
 *
 * Each module owns a `locales/` directory with one JSON file per locale,
 * grouped into top-level sections (e.g. `messages`, `elements`). This helper
 * provides dot-path key typing and resolution so call sites read
 * `t("messages.loginFailed")` with full type safety.
 */

type LocaleLeaf = string;
type LocaleSection = { [key: string]: LocaleLeaf | LocaleSection };

/** Recursively flattens nested locale shapes into dot-path keys. */
export type LocaleKeyOf<T> = {
  [K in keyof T & string]: T[K] extends LocaleLeaf
    ? K
    : T[K] extends LocaleSection
      ? `${K}.${LocaleKeyOf<T[K]>}`
      : never;
}[keyof T & string];

/** Constrains sibling locales to the exact key/value-type shape of the base. */
export type SameLocaleShape<T> = {
  [K in keyof T]: T[K] extends LocaleLeaf ? LocaleLeaf : SameLocaleShape<T[K]>;
};

export type LocaleParams = Record<string, string | number>;

function resolvePath(
  node: LocaleSection,
  dotPath: string,
): LocaleLeaf | undefined {
  let current: LocaleLeaf | LocaleSection | undefined = node;
  for (const segment of dotPath.split(".")) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Builds a typed `t()` for one module's locale map. Unresolvable keys fall
 * back to returning the key itself so a missing translation is visible in UI
 * instead of crashing rendering.
 */
export function createLocaleResolver<Key extends string, Locale extends string>(
  locales: Record<Locale, LocaleSection>,
  defaultLocale: Locale,
) {
  return function t(
    key: Key,
    params: LocaleParams = {},
    locale: Locale = defaultLocale,
  ): string {
    const message = resolvePath(locales[locale], key) ?? key;
    return Object.entries(params).reduce<string>(
      (resolved, [name, value]) =>
        resolved.replaceAll(`{${name}}`, String(value)),
      message,
    );
  };
}
