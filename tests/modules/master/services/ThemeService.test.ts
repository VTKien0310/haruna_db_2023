import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeService } from "@/modules/master/services/ThemeService";
import {
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
} from "@/modules/master/ThemeEntities";
import { useThemeStore } from "@/modules/master/stores/ThemeStore";
import { t } from "@/modules/master/locales";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("color-scheme");
});

describe("ThemeService", () => {
  it.each([null, "invalid", "__proto__", "Haruna Dark"])(
    "defaults to Haruna Light for preference %j",
    (value) => {
      const storage = { getItem: vi.fn(() => value), setItem: vi.fn() };
      new ThemeService(document, () => storage).initialize();
      expect(useThemeStore().themeId).toBe("haruna-light");
      expect(document.documentElement.dataset.theme).toBe("haruna-light");
      expect(document.documentElement.style.colorScheme).toBe("light");
      expect(
        document
          .querySelector('meta[name="theme-color"]')
          ?.getAttribute("content"),
      ).toBe("#ffffff");
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it.each(THEME_OPTIONS)(
    "restores $label and updates existing browser metadata",
    (theme) => {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id);
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#000000";
      document.head.append(meta);
      new ThemeService(document, () => localStorage).initialize();
      expect(useThemeStore().themeId).toBe(theme.id);
      expect(document.documentElement.dataset.theme).toBe(theme.id);
      expect(document.documentElement.style.colorScheme).toBe(
        theme.colorScheme,
      );
      expect(meta.content).toBe(theme.themeColor);
      expect(
        document.querySelectorAll('meta[name="theme-color"]'),
      ).toHaveLength(1);
    },
  );

  it.each(THEME_OPTIONS)("applies and persists $label immediately", (theme) => {
    const service = new ThemeService(document, () => localStorage);
    service.initialize();
    service.select(theme.id);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme.id);
    expect(useThemeStore().themeId).toBe(theme.id);
    expect(document.documentElement.dataset.theme).toBe(theme.id);
    expect(document.documentElement.style.colorScheme).toBe(theme.colorScheme);
    expect(
      document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content"),
    ).toBe(theme.themeColor);
    service.initialize();
    expect(useThemeStore().themeId).toBe(theme.id);
  });

  it("retains the current selection when passed an unknown theme", () => {
    const service = new ThemeService(document, () => localStorage);
    service.select("classic-dark");
    service.select("system");
    expect(useThemeStore().themeId).toBe("classic-dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("classic-dark");
    expect(document.documentElement.dataset.theme).toBe("classic-dark");
  });

  it("uses the default when accessing storage is blocked and notifies only on saving", () => {
    const notify = vi.fn();
    const service = new ThemeService(
      document,
      () => {
        throw new DOMException("Blocked", "SecurityError");
      },
      notify,
    );
    service.initialize();
    expect(useThemeStore().themeId).toBe("haruna-light");
    expect(notify).not.toHaveBeenCalled();
    service.select("haruna-dark");
    expect(useThemeStore().themeId).toBe("haruna-dark");
    expect(document.documentElement.dataset.theme).toBe("haruna-dark");
    expect(notify).toHaveBeenCalledWith(t("messages.themeSaveFailed"));
  });

  it("keeps a selection in memory when storage is full", () => {
    const notify = vi.fn();
    const storage = {
      getItem: () => "classic-light",
      setItem: () => {
        throw new DOMException("Full", "QuotaExceededError");
      },
    };
    const service = new ThemeService(document, () => storage, notify);
    service.initialize();
    service.select("classic-dark");
    expect(useThemeStore().themeId).toBe("classic-dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(notify).toHaveBeenCalledOnce();
  });
});
