import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import App from "@/App.vue";
import router from "@/router";
import { appMountOptions, SlotStub } from "../../../support/mountApp";

vi.mock("@/router", async () => {
  const { createMemoryHistory, createRouter } = await import("vue-router");
  const { defineComponent } = await import("vue");
  const component = defineComponent({ template: "<div>Page</div>" });
  return {
    default: createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "master", component },
        { path: "/gallery", name: "gallery.list", component },
        { path: "/translation", name: "translation", component },
        {
          path: "/webpage-bookmark/:id",
          name: "webpage-bookmark.root",
          component,
        },
        { path: "/auth", name: "auth.profile", component },
        { path: "/auth/login", name: "auth.login", component },
      ],
    }),
  };
});
// Bootstrap side effects are outside this UI regression; backend guards stay active.
vi.mock("@/modules/auth/AuthServiceContainer", () => ({
  useAuthenticationService: () => ({ registerOnAuthStateChange: vi.fn() }),
}));
vi.mock("@/modules/master/MasterServiceContainer", () => ({
  usePwaUpdateService: () => ({
    startWatching: vi.fn(),
    stopWatching: vi.fn(),
  }),
}));

async function mountShell() {
  await router.push("/gallery");
  const options = appMountOptions();
  const wrapper = mount(App, {
    ...options,
    global: {
      ...options.global,
      plugins: [...options.global.plugins, router],
      stubs: {
        ...options.global.stubs,
        IonApp: SlotStub,
        IonRouterOutlet: SlotStub,
      },
    },
  });
  await flushPromises();
  return wrapper;
}

describe("App shell", () => {
  it("navigates home from the branding and safely handles repeated activation", async () => {
    const wrapper = await mountShell();
    try {
      const branding = wrapper.get('button[aria-label="Go to home"]');
      expect(branding.attributes("type")).toBe("button");
      expect(branding.text()).toBe("Haruna");
      expect(branding.get("img").attributes("alt")).toBe("");

      await branding.get("img").trigger("click");
      await flushPromises();
      expect(router.currentRoute.value.name).toBe("master");
      expect(router.currentRoute.value.path).toBe("/");

      await branding.get("span.font-semibold").trigger("click");
      await flushPromises();
      expect(router.currentRoute.value.name).toBe("master");
      expect(
        wrapper
          .get('[aria-label="Open navigation"]')
          .attributes("aria-expanded"),
      ).toBe("false");
    } finally {
      wrapper.unmount();
    }
  });

  it("exposes menu state, active navigation and closes after a destination is selected", async () => {
    const wrapper = await mountShell();
    const menu = wrapper.get('[aria-label="Open navigation"]');
    expect(menu.attributes("aria-expanded")).toBe("false");
    expect(menu.attributes("aria-controls")).toBe("app-navigation");
    await menu.trigger("click");
    await flushPromises();
    expect(menu.attributes("aria-expanded")).toBe("true");
    expect(wrapper.get("header").attributes()).toHaveProperty("inert");
    const nav = document.querySelector('nav[aria-label="Main navigation"]')!;
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toContain(
      "Gallery",
    );
    const home = Array.from(
      nav.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.includes("Home"))!;
    home.click();
    await flushPromises();
    expect(router.currentRoute.value.name).toBe("master");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(menu.attributes("aria-expanded")).toBe("false");
    expect(wrapper.get("header").attributes()).not.toHaveProperty("inert");
  });
  it("closes on external navigation and hides the header on login", async () => {
    const wrapper = await mountShell();
    await wrapper.get('[aria-label="Open navigation"]').trigger("click");
    await flushPromises();
    await router.push("/auth/login");
    await flushPromises();
    expect(wrapper.find("header").exists()).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
