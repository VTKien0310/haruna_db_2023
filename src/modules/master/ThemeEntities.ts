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
  {
    id: "legacy",
    label: "Legacy",
    colorScheme: "light",
    themeColor: "#ffffff",
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin Latte",
    colorScheme: "light",
    themeColor: "#eff1f5",
  },
  {
    id: "catppuccin-frappe",
    label: "Catppuccin Frappé",
    colorScheme: "dark",
    themeColor: "#303446",
  },
  {
    id: "catppuccin-macchiato",
    label: "Catppuccin Macchiato",
    colorScheme: "dark",
    themeColor: "#24273a",
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    colorScheme: "dark",
    themeColor: "#1e1e2e",
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    colorScheme: "dark",
    themeColor: "#1a1b26",
  },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];
export const DEFAULT_THEME: ThemeId = "haruna-light";
export const THEME_STORAGE_KEY = "haruna-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === value);
}
