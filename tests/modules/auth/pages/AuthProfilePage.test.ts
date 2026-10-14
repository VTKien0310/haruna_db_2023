import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AuthProfilePage from "@/modules/auth/pages/AuthProfilePage.vue";
import { ThemeService } from "@/modules/master/services/ThemeService";
import {
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
} from "@/modules/master/ThemeEntities";
import { useThemeStore } from "@/modules/master/stores/ThemeStore";
import { useThemeService } from "@/modules/master/MasterServiceContainer";
import { appMountOptions } from "../../../support/mountApp";

const account = vi.hoisted(() => ({
  refresh: vi.fn(),
  update: vi.fn(),
  signOut: vi.fn(),
  resetUploads: vi.fn(),
}));
vi.mock("@/modules/auth/AuthServiceContainer", () => ({
  useProfileService: () => ({
    refreshCurrentUserProfile: account.refresh,
    updateCurrentUserProfile: account.update,
  }),
  useAuthenticationService: () => ({ signOut: account.signOut }),
}));
vi.mock("@/modules/gallery/GalleryServiceContainer", () => ({
  useUploadMediaService: () => ({ reset: account.resetUploads }),
}));
vi.mock("@/modules/master/MasterServiceContainer", () => ({
  useThemeService: vi.fn(),
}));

beforeEach(() => {
  account.refresh.mockResolvedValue(undefined);
  const service = new ThemeService(document, () => localStorage);
  service.initialize();
  vi.mocked(useThemeService).mockReturnValue(service);
});
afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("color-scheme");
});

describe("AuthProfilePage appearance", () => {
  it.each(THEME_OPTIONS)(
    "selects $label without submitting the account form",
    async (theme) => {
      const wrapper = mount(AuthProfilePage, appMountOptions());
      await flushPromises();
      const control = wrapper.get('[role="combobox"]');
      expect(control.attributes("aria-label")).toBe("Theme");
      expect(control.attributes("aria-describedby")).toBe(
        "theme-device-description",
      );
      expect(control.element.closest("form")).toBeNull();
      expect(wrapper.text()).toContain("Saved on this device.");
      await control.trigger("keydown", { key: "Enter" });
      const options = document.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(THEME_OPTIONS.length);
      const option = Array.from(options).find(
        (node) => node.textContent?.trim() === theme.label,
      )!;
      option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      option.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
      expect(useThemeStore().themeId).toBe(theme.id);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme.id);
      expect(document.documentElement.dataset.theme).toBe(theme.id);
      expect(account.update).not.toHaveBeenCalled();
      expect(account.signOut).not.toHaveBeenCalled();
      expect((control.element as HTMLInputElement).value).toBe(theme.label);
    },
  );
});
