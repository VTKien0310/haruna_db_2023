import {
  DEFAULT_THEME,
  isThemeId,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  type ThemeId,
} from "../ThemeEntities";
import { t } from "../locales";
import { useThemeStore } from "../stores/ThemeStore";

export class ThemeService {
  private readonly store = useThemeStore();

  constructor(
    private readonly document: Document,
    private readonly storage: () => Pick<Storage, "getItem" | "setItem">,
    private readonly notifySaveFailure: (message: string) => void = () => {},
  ) {}

  initialize(): void {
    let themeId: ThemeId = DEFAULT_THEME;
    try {
      const saved = this.storage().getItem(THEME_STORAGE_KEY);
      if (isThemeId(saved)) themeId = saved;
    } catch {
      // Storage may be disabled; the application still has a usable theme.
    }
    this.apply(themeId);
  }

  select(value: string): void {
    if (!isThemeId(value)) return;
    this.apply(value);
    try {
      this.storage().setItem(THEME_STORAGE_KEY, value);
    } catch {
      this.notifySaveFailure(t("messages.themeSaveFailed"));
    }
  }

  private apply(themeId: ThemeId): void {
    const theme = THEME_OPTIONS.find((option) => option.id === themeId)!;
    const root = this.document.documentElement;
    root.dataset.theme = themeId;
    root.style.colorScheme = theme.colorScheme;
    let meta = this.document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = this.document.createElement("meta");
      meta.name = "theme-color";
      this.document.head.append(meta);
    }
    meta.content = theme.themeColor;
    this.store.themeId = themeId;
  }
}
