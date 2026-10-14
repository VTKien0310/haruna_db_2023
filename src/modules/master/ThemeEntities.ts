export const THEME_OPTIONS = [
  {
    id: "haruna-light",
    label: "Haruna Light",
    colorScheme: "light",
    themeColor: "#ffffff",
  },
  {
    id: "haruna-dark",
    label: "Haruna Dark",
    colorScheme: "dark",
    themeColor: "#1e1b4b",
  },
  {
    id: "classic-light",
    label: "Classic Light",
    colorScheme: "light",
    themeColor: "#ffffff",
  },
  {
    id: "classic-dark",
    label: "Classic Dark",
    colorScheme: "dark",
    themeColor: "#1e293b",
  },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];
export const DEFAULT_THEME: ThemeId = "haruna-light";
export const THEME_STORAGE_KEY = "haruna-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === value);
}
