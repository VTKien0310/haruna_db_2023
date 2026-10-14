import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationService } from "@/modules/auth/services/AuthenticationService";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { TranslationService } from "@/modules/translation/TranslationService";
import { useGalleryListStore } from "@/modules/gallery/stores/GalleryListStore";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import { makeBackendFake } from "../../../fakes/BackendFake";
import { makeRouter, makeToast } from "../../../fakes/Collaborators";
import { makeHistory, makeMedia } from "../../../factories/Records";
import { ThemeService } from "@/modules/master/services/ThemeService";
import { useThemeStore } from "@/modules/master/stores/ThemeStore";
import { THEME_STORAGE_KEY } from "@/modules/master/ThemeEntities";

describe("AuthenticationService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let router: ReturnType<typeof makeRouter>;
  let profile: ProfileService;
  let service: AuthenticationService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    router = makeRouter();
    profile = new ProfileService(backend.port, toast.service);
    service = new AuthenticationService(
      router,
      backend.port,
      toast.service,
      new GalleryListService(backend.port, toast.service),
      profile,
      new TranslationService(backend.port, toast.service),
    );
  });
  it.each([null, { access_token: "dummy" }])(
    "checks dummy session %j",
    async (session) => {
      backend.auth.getSession.mockResolvedValue({
        data: { session },
        error: null,
      });
      expect(await service.isCurrentlyAuthenticated()).toBe(session !== null);
    },
  );
  it.each([null, { message: "denied" }])(
    "handles sign-in response %j",
    async (error) => {
      backend.auth.signInWithPassword.mockResolvedValue({ error });
      const credential = {
        email: "person@example.test",
        password: "dummy-password",
      };
      expect(await service.signIn(credential)).toBe(!error);
      expect(backend.auth.signInWithPassword).toHaveBeenCalledWith(credential);
      if (error) {
        expect(toast.error).toHaveBeenCalledWith("Login failed");
        expect(router.push).not.toHaveBeenCalled();
      } else expect(router.push).toHaveBeenCalledWith({ name: "master" });
    },
  );
  it("clears gallery and history after successful sign-out", async () => {
    useGalleryListStore().medias = [makeMedia()];
    useTranslationStore().histories = [makeHistory()];
    backend.auth.signOut.mockResolvedValue({ error: null });
    expect(await service.signOut()).toBe(true);
    expect(useGalleryListStore().medias).toEqual([]);
    expect(useTranslationStore().histories).toEqual([]);
  });
  it("preserves local state when sign-out fails", async () => {
    useGalleryListStore().medias = [makeMedia()];
    backend.auth.signOut.mockResolvedValue({ error: { message: "offline" } });
    expect(await service.signOut()).toBe(false);
    expect(useGalleryListStore().medias).toHaveLength(1);
    expect(toast.error).toHaveBeenCalled();
  });
  it("preserves the device theme through successful sign-out", async () => {
    try {
      new ThemeService(document, () => localStorage).select("classic-dark");
      backend.auth.signOut.mockResolvedValue({ error: null });
      expect(await service.signOut()).toBe(true);
      expect(useThemeStore().themeId).toBe("classic-dark");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("classic-dark");
      expect(document.documentElement.dataset.theme).toBe("classic-dark");
    } finally {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.removeProperty("color-scheme");
    }
  });
  it("refreshes profile on auth changes and redirects when signed out", async () => {
    backend.auth.onAuthStateChange.mockReturnValue({});
    const refresh = vi
      .spyOn(profile, "refreshCurrentUserProfile")
      .mockResolvedValue();
    await service.registerOnAuthStateChange();
    const callback = backend.auth.onAuthStateChange.mock.calls[0][0] as (
      event: string,
      session: unknown,
    ) => void;
    callback("SIGNED_IN", { user: { id: "user-1" } });
    expect(router.push).not.toHaveBeenCalled();
    callback("SIGNED_OUT", null);
    expect(router.push).toHaveBeenCalledWith({ name: "auth.login" });
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
