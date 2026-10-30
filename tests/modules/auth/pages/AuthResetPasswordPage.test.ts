import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AuthResetPasswordPage from "@/modules/auth/pages/AuthResetPasswordPage.vue";
import { AuthenticationService } from "@/modules/auth/services/AuthenticationService";
import { ProfileService } from "@/modules/auth/services/ProfileService";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { TranslationService } from "@/modules/translation/TranslationService";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import { makeBackendFake } from "../../../fakes/BackendFake";
import { makeRouter, makeToast } from "../../../fakes/Collaborators";
import { appMountOptions } from "../../../support/mountApp";

vi.mock("@/modules/auth/AuthServiceContainer", () => ({
  useAuthenticationService: vi.fn(),
}));
vi.mock("@ionic/vue", async () => {
  const { defineComponent, h, onMounted } = await import("vue");
  return {
    IonPage: defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          h("div", slots.default?.()),
    }),
    onIonViewDidEnter: onMounted,
  };
});

describe("AuthResetPasswordPage workflow", () => {
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
  it("disables update until both passwords match and meet the rules", async () => {
    useAuthStore().passwordRecoveryRequired = true;
    const wrapper = mount(AuthResetPasswordPage, appMountOptions());
    await flushPromises();
    const submit = wrapper.get('button[type="submit"]');
    expect(submit.attributes("disabled")).toBeDefined();
    for (const password of [
      "Short1!",
      "new-pass1",
      "NEW-PASS1",
      "Newpass1",
      "New-pass",
    ]) {
      await wrapper.get('input[name="password"]').setValue(password);
      await wrapper.get('input[name="confirmPassword"]').setValue(password);
      expect(submit.attributes("disabled")).toBeDefined();
    }
    await wrapper.get('input[name="password"]').setValue("New-pass1");
    await wrapper.get('input[name="confirmPassword"]').setValue("Other-pass1");
    expect(submit.attributes("disabled")).toBeDefined();
    await wrapper.get('input[name="confirmPassword"]').setValue("New-pass1");
    expect(submit.attributes("disabled")).toBeUndefined();
  });
  it("shows an invalid link and offers a new request", async () => {
    backend.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const wrapper = mount(AuthResetPasswordPage, appMountOptions());
    await flushPromises();
    expect(wrapper.text()).toContain(
      "This reset link is invalid or has expired.",
    );
    expect(wrapper.find("form").exists()).toBe(false);
    await wrapper.get("button").trigger("click");
    expect(router.push).toHaveBeenCalledWith({
      name: "auth.forgot-password",
    });
    expect(backend.auth.updateUser).not.toHaveBeenCalled();
  });
  it("shows the form when recovery starts after an invalid check", async () => {
    backend.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const wrapper = mount(AuthResetPasswordPage, appMountOptions());
    await flushPromises();
    expect(wrapper.text()).toContain(
      "This reset link is invalid or has expired.",
    );
    useAuthStore().passwordRecoveryRequired = true;
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(true);
    expect(wrapper.text()).not.toContain(
      "This reset link is invalid or has expired.",
    );
  });
  it("sends an existing signed-in visit home", async () => {
    backend.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });
    const wrapper = mount(AuthResetPasswordPage, appMountOptions());
    await flushPromises();
    expect(router.push).toHaveBeenCalledWith({ name: "master" });
    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.text()).not.toContain(
      "This reset link is invalid or has expired.",
    );
    expect(backend.auth.updateUser).not.toHaveBeenCalled();
  });
  it("updates the password and continues home", async () => {
    useAuthStore().passwordRecoveryRequired = true;
    backend.auth.updateUser.mockResolvedValue({ error: null });
    const wrapper = mount(AuthResetPasswordPage, appMountOptions());
    await flushPromises();
    await wrapper.get('input[name="password"]').setValue("New-pass1");
    await wrapper.get('input[name="confirmPassword"]').setValue("New-pass1");
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(backend.auth.updateUser).toHaveBeenCalledWith({
      password: "New-pass1",
    });
    expect(toast.info).toHaveBeenCalledWith("Password updated");
    expect(useAuthStore().passwordRecoveryRequired).toBe(false);
    expect(router.push).toHaveBeenCalledWith({ name: "master" });
    expect(
      (wrapper.get('input[name="password"]').element as HTMLInputElement).value,
    ).toBe("");
  });
});
