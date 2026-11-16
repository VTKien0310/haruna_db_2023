export const THEME_OPTIONS = [
  {
    id: "haruna-light",
    label: "Haruna Light",
    seed: "#1e1b4b",
    colorScheme: "light",
    themeColor: "#fcf8ff",
  },
  {
    id: "haruna-dark",
    label: "Haruna Dark",
    seed: "#1e1b4b",
    colorScheme: "dark",
    themeColor: "#131318",
  },
  {
    id: "classic-light",
    label: "Classic Light",
    seed: "#143441",
    colorScheme: "light",
    themeColor: "#f6fafd",
  },
  {
    id: "classic-dark",
    label: "Classic Dark",
    seed: "#143441",
    colorScheme: "dark",
    themeColor: "#0f1417",
  },
  {
    id: "legacy",
    label: "Legacy",
    seed: "#154ec1",
    colorScheme: "light",
    themeColor: "#faf8ff",
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin Latte",
    seed: "#8839ef",
    colorScheme: "light",
    themeColor: "#fef7ff",
  },
  {
    id: "catppuccin-frappe",
    label: "Catppuccin Frappé",
    seed: "#ca9ee6",
    colorScheme: "dark",
    themeColor: "#161217",
  },
  {
    id: "catppuccin-macchiato",
    label: "Catppuccin Macchiato",
    seed: "#c6a0f6",
    colorScheme: "dark",
    themeColor: "#151218",
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    seed: "#cba6f7",
    colorScheme: "dark",
    themeColor: "#151218",
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    seed: "#7aa2f7",
    colorScheme: "dark",
    themeColor: "#121318",
  },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];
export const DEFAULT_THEME: ThemeId = "haruna-light";
export const THEME_STORAGE_KEY = "haruna-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === value);
}
