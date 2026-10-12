import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { HButton, HDrawer, HModal } from "@/libs/ui";
import { appMountOptions } from "../../support/mountApp";

const Fixture = defineComponent({
  components: { HButton, HDrawer },
  setup() {
    return { open: ref(false) };
  },
  template: `<HButton @click="open = true">Menu</HButton><HDrawer v-model="open" id="navigation" top-offset="64px"><HButton>Home</HButton><HButton>Gallery</HButton></HDrawer>`,
});
const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!;

describe("HDrawer", () => {
  it("traps focus and restores the trigger and scrolling on Escape", async () => {
    document.body.style.overflow = "auto";
    const wrapper = mount(Fixture, appMountOptions());
    const trigger = wrapper.get("button").element as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    await flushPromises();
    expect(dialog().id).toBe("navigation");
    expect(dialog().getAttribute("aria-label")).toBe("Navigation");
    expect(dialog().getAttribute("aria-modal")).toBe("true");
    expect(
      (document.querySelector(".h-drawer-backdrop") as HTMLElement).style.top,
    ).toBe("64px");
    expect(document.body.style.overflow).toBe("hidden");
    const buttons = dialog().querySelectorAll<HTMLButtonElement>("button");
    expect(document.activeElement).toBe(buttons[0]);
    buttons[buttons.length - 1].focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(buttons[0]);
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flushPromises();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("auto");
    wrapper.unmount();
    document.body.style.overflow = "";
  });
  it.each(["backdrop", "close"])("dismisses with %s", async (method) => {
    const wrapper = mount(Fixture, appMountOptions());
    await wrapper.get("button").trigger("click");
    await flushPromises();
    if (method === "backdrop")
      document
        .querySelector(".h-drawer-backdrop")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    else
      document
        .querySelector<HTMLButtonElement>('[aria-label="Close navigation"]')!
        .click();
    await flushPromises();
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("lets a modal above the drawer handle Escape and keeps the drawer locked", async () => {
    const drawer = mount(HDrawer, {
      ...appMountOptions(),
      props: { modelValue: true },
    });
    await flushPromises();
    const options = appMountOptions();
    const modal = mount(HModal, {
      ...options,
      global: { ...options.global, stubs: { HModal: false } },
      props: { modelValue: true, title: "Update" },
    });
    await flushPromises();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(drawer.emitted("update:modelValue")).toBeUndefined();
    expect(modal.emitted("cancel")).toHaveLength(1);
    modal.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    drawer.unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("cleans up when closed rapidly or unmounted during opening", async () => {
    const wrapper = mount(HDrawer, {
      ...appMountOptions(),
      props: { modelValue: true },
    });
    await wrapper.setProps({ modelValue: false });
    await flushPromises();
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
    await wrapper.setProps({ modelValue: true });
    wrapper.unmount();
    await flushPromises();
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
