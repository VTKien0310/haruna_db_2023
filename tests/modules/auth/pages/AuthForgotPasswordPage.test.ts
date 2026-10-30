import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AuthForgotPasswordPage from "@/modules/auth/pages/AuthForgotPasswordPage.vue";
import { AuthenticationService } from "@/modules/auth/services/AuthenticationService";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { TranslationService } from "@/modules/translation/TranslationService";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import { makeBackendFake } from "../../../fakes/BackendFake";
import { makeRouter, makeToast } from "../../../fakes/Collaborators";
import { appMountOptions } from "../../../support/mountApp";

vi.mock("@/modules/auth/AuthServiceContainer", () => ({
  useAuthenticationService: vi.fn(),
}));

describe("AuthForgotPasswordPage workflow", () => {
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
  it("disables send until an email is entered", async () => {
    const wrapper = mount(AuthForgotPasswordPage, appMountOptions());
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled"),
    ).toBeDefined();
    await wrapper.get('input[name="email"]').setValue("person@example.test");
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled"),
    ).toBeUndefined();
  });
  it.each([true, false])(
    "submits a reset request with success=%s",
    async (success) => {
      backend.auth.resetPasswordForEmail.mockResolvedValue({
        error: success ? null : { code: "unexpected_failure", message: "down" },
      });
      const wrapper = mount(AuthForgotPasswordPage, appMountOptions());
      await wrapper.get('input[name="email"]').setValue("person@example.test");
      await wrapper.get("form").trigger("submit");
      await flushPromises();
      expect(backend.auth.resetPasswordForEmail).toHaveBeenCalledTimes(1);
      expect(
        (wrapper.get('input[name="email"]').element as HTMLInputElement).value,
      ).toBe(success ? "" : "person@example.test");
      if (success) {
        expect(toast.info).toHaveBeenCalledWith(
          "If an account exists for that email, a reset link has been sent.",
        );
        expect(router.push).toHaveBeenCalledWith({ name: "auth.login" });
      } else {
        expect(toast.error).toHaveBeenCalledWith("Could not send reset email");
        expect(router.push).not.toHaveBeenCalled();
      }
    },
  );
});
