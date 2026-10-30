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
import { useAuthStore } from "@/modules/auth/stores/AuthStore";

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
    useAuthStore().passwordRecoveryRequired = true;
    backend.auth.signOut.mockResolvedValue({ error: null });
    expect(await service.signOut()).toBe(true);
    expect(useGalleryListStore().medias).toEqual([]);
    expect(useTranslationStore().histories).toEqual([]);
    expect(useAuthStore().passwordRecoveryRequired).toBe(false);
  });
  it("preserves local state when sign-out fails", async () => {
    useGalleryListStore().medias = [makeMedia()];
    useAuthStore().passwordRecoveryRequired = true;
    backend.auth.signOut.mockResolvedValue({ error: { message: "offline" } });
    expect(await service.signOut()).toBe(false);
    expect(useGalleryListStore().medias).toHaveLength(1);
    expect(useAuthStore().passwordRecoveryRequired).toBe(true);
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
    useAuthStore().passwordRecoveryRequired = true;
    callback("SIGNED_OUT", null);
    expect(router.push).toHaveBeenCalledWith({ name: "auth.login" });
    expect(useAuthStore().passwordRecoveryRequired).toBe(false);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
  it("opens the reset page when a recovery session starts", async () => {
    backend.auth.onAuthStateChange.mockReturnValue({});
    vi.spyOn(profile, "refreshCurrentUserProfile").mockResolvedValue();
    await service.registerOnAuthStateChange();
    const callback = backend.auth.onAuthStateChange.mock.calls[0][0] as (
      event: string,
      session: unknown,
    ) => void;
    callback("PASSWORD_RECOVERY", { user: { id: "user-1" } });
    expect(useAuthStore().passwordRecoveryRequired).toBe(true);
    expect(router.push).toHaveBeenCalledWith({ name: "auth.reset-password" });
    expect(router.push).not.toHaveBeenCalledWith({ name: "auth.login" });
  });
  it.each([null, { code: "user_not_found", message: "User not found" }])(
    "confirms a reset email without revealing the account for %j",
    async (error) => {
      backend.auth.resetPasswordForEmail.mockResolvedValue({ error });
      expect(await service.requestPasswordReset("person@example.test")).toBe(
        true,
      );
      expect(backend.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "person@example.test",
        { redirectTo: `${window.location.origin}/auth/reset-password` },
      );
      expect(toast.info).toHaveBeenCalledWith(
        "If an account exists for that email, a reset link has been sent.",
      );
      expect(toast.error).not.toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: "auth.login" });
    },
  );
  it("shows a fixed error when a reset email cannot be sent", async () => {
    backend.auth.resetPasswordForEmail.mockResolvedValue({
      error: { code: "unexpected_failure", message: "smtp down" },
    });
    expect(await service.requestPasswordReset("person@example.test")).toBe(
      false,
    );
    expect(toast.error).toHaveBeenCalledWith("Could not send reset email");
    expect(toast.info).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(toast.error.mock.calls.flat().join(" ")).not.toContain("smtp");
  });
  it("allows password reset only during recovery", async () => {
    useAuthStore().passwordRecoveryRequired = true;
    expect(await service.preparePasswordReset()).toBe("ready");
    expect(backend.auth.getSession).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });
  it("sends an existing session home when recovery is not in progress", async () => {
    backend.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });
    expect(await service.preparePasswordReset()).toBe("authenticated");
    expect(router.push).toHaveBeenCalledWith({ name: "master" });
  });
  it("keeps the reset form when recovery starts while the session is loading", async () => {
    let resolveSession: (value: {
      data: { session: { user: { id: string } } };
      error: null;
    }) => void = () => {};
    backend.auth.getSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );
    const pending = service.preparePasswordReset();
    useAuthStore().passwordRecoveryRequired = true;
    resolveSession({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });
    expect(await pending).toBe("ready");
    expect(router.push).not.toHaveBeenCalled();
  });
  it("reports an invalid reset link when no session exists", async () => {
    backend.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    expect(await service.preparePasswordReset()).toBe("invalid");
    expect(router.push).not.toHaveBeenCalled();
  });
  it.each([null, { message: "weak" }])(
    "updates the password when recovery is active %j",
    async (error) => {
      useAuthStore().passwordRecoveryRequired = true;
      backend.auth.updateUser.mockResolvedValue({ error });
      expect(await service.resetPassword("New-pass1")).toBe(!error);
      expect(backend.auth.updateUser).toHaveBeenCalledWith({
        password: "New-pass1",
      });
      if (error) {
        expect(toast.error).toHaveBeenCalledWith("Could not update password");
        expect(toast.error.mock.calls.flat().join(" ")).not.toContain("weak");
        expect(useAuthStore().passwordRecoveryRequired).toBe(true);
        expect(router.push).not.toHaveBeenCalled();
      } else {
        expect(toast.info).toHaveBeenCalledWith("Password updated");
        expect(useAuthStore().passwordRecoveryRequired).toBe(false);
        expect(router.push).toHaveBeenCalledWith({ name: "master" });
      }
    },
  );
  it("does not change the password outside recovery or when it misses a rule", async () => {
    expect(await service.resetPassword("New-pass1")).toBe(false);
    useAuthStore().passwordRecoveryRequired = true;
    for (const password of [
      "Short1!",
      "new-pass1",
      "NEW-PASS1",
      "Newpass1",
      "New-pass",
    ]) {
      expect(await service.resetPassword(password)).toBe(false);
    }
    expect(backend.auth.updateUser).not.toHaveBeenCalled();
  });
});
