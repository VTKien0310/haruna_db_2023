import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AuthLoginPage from "@/modules/auth/pages/AuthLoginPage.vue";
import { AuthenticationService } from "@/modules/auth/services/AuthenticationService";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { TranslationService } from "@/modules/translation/TranslationService";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import { makeBackendFake } from "../../../fakes/BackendFake";
import { makeRouter, makeToast } from "../../../fakes/Collaborators";
import { appMountOptions } from "../../../support/mountApp";
import { t } from "@/modules/auth/locales";

vi.mock("@/modules/auth/AuthServiceContainer", () => ({
  useAuthenticationService: vi.fn(),
}));

describe("AuthLoginPage workflow", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let router: ReturnType<typeof makeRouter>;
  let toast: ReturnType<typeof makeToast>;
  beforeEach(() => {
    backend = makeBackendFake();
    router = makeRouter();
    toast = makeToast();
    vi.mocked(useAuthenticationService).mockReturnValue(
      new AuthenticationService(
        router,
        backend.port,
        toast.service,
        new GalleryListService(backend.port, toast.service),
        new ProfileService(backend.port, toast.service),
        new TranslationService(backend.port, toast.service),
      ),
    );
  });
  it("disables login until both fields are entered", async () => {
    const wrapper = mount(AuthLoginPage, appMountOptions());
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled"),
    ).toBeDefined();
    await wrapper.get('input[name="email"]').setValue("person@example.test");
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled"),
    ).toBeDefined();
    await wrapper.get('input[name="password"]').setValue("dummy-password");
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled"),
    ).toBeUndefined();
  });
  it.each([true, false])(
    "submits through the real service with success=%s",
    async (success) => {
      backend.auth.signInWithPassword.mockResolvedValue({
        error: success ? null : { message: "dummy" },
      });
      const wrapper = mount(AuthLoginPage, appMountOptions());
      await wrapper.get('input[name="email"]').setValue("person@example.test");
      await wrapper.get('input[name="password"]').setValue("dummy-password");
      await wrapper.get("form").trigger("submit");
      await flushPromises();
      expect(backend.auth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(
        (wrapper.get('input[name="email"]').element as HTMLInputElement).value,
      ).toBe(success ? "" : "person@example.test");
      if (success) expect(router.push).toHaveBeenCalledWith({ name: "master" });
      else expect(toast.error).toHaveBeenCalledWith(t("messages.loginFailed"));
    },
  );
  it("opens the forgot-password page", async () => {
    const wrapper = mount(AuthLoginPage, appMountOptions());
    await wrapper.get("button[type='button']").trigger("click");
    expect(router.push).toHaveBeenCalledWith({
      name: "auth.forgot-password",
    });
  });
});
