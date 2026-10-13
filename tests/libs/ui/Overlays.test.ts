import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import {
  HModal,
  HButton,
  useHarunaUiService,
  type HNotifications,
} from "@/libs/ui";
import { appMountOptions } from "../../support/mountApp";

function realModalOptions() {
  const options = appMountOptions();
  return {
    ...options,
    global: { ...options.global, stubs: { HModal: false } },
  };
}
function click(selector: string) {
  document.querySelector<HTMLButtonElement>(selector)!.click();
}

describe("HModal", () => {
  it("restores the original trigger when a lower overlay closes first", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = "auto";
    const first = mount(HModal, {
      ...realModalOptions(),
      props: { modelValue: true, title: "First" },
    });
    await flushPromises();
    const second = mount(HModal, {
      ...realModalOptions(),
      props: { modelValue: true, title: "Second" },
    });
    await flushPromises();
    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    second.unmount();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("auto");
  });
  it("focuses an empty dialog and ignores hidden controls and handled Escape events", async () => {
    const wrapper = mount(HModal, {
      ...realModalOptions(),
      props: { modelValue: true, noDismiss: true, hideDefaultActions: true },
      slots: {
        default:
          "<div hidden><button>Hidden</button></div><button disabled>Unavailable</button>",
      },
    });
    await flushPromises();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(document.activeElement).toBe(dialog);
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(dialog);
    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    escape.preventDefault();
    document.dispatchEvent(escape);
    expect(wrapper.emitted("cancel")).toBeUndefined();
    wrapper.unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  const Fixture = defineComponent({
    components: { HModal, HButton },
    setup() {
      return { open: ref(false) };
    },
    template: `<HButton @click="open = true">Open</HButton><HModal v-model="open" title="Edit" hide-default-actions><HButton>First</HButton><HButton>Last</HButton></HModal>`,
  });
  it("traps focus, dismisses on Escape and restores focus and body scrolling", async () => {
    document.body.style.overflow = "auto";
    const wrapper = mount(Fixture, realModalOptions());
    const trigger = wrapper.get("button").element as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    await flushPromises();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    const buttons = dialog.querySelectorAll<HTMLButtonElement>("button");
    expect(document.activeElement).toBe(buttons[0]);
    buttons[buttons.length - 1].focus();
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });
  it.each([
    { noDismiss: true },
    { noOutsideDismiss: true, noEscDismiss: true },
  ])("respects dismissal flags %j", async (flags) => {
    const wrapper = mount(HModal, {
      ...realModalOptions(),
      props: {
        modelValue: true,
        title: "Required update",
        hideDefaultActions: true,
        ...flags,
      },
    });
    await flushPromises();
    document
      .querySelector(".h-modal-backdrop")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[role="dialog"]')!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    wrapper.unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("only dismisses the top modal and keeps scrolling locked until all close", async () => {
    const first = mount(HModal, {
      ...realModalOptions(),
      props: { modelValue: true, title: "First" },
    });
    await flushPromises();
    const second = mount(HModal, {
      ...realModalOptions(),
      props: { modelValue: true, title: "Second" },
    });
    await flushPromises();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(first.emitted("cancel")).toBeUndefined();
    expect(second.emitted("cancel")).toHaveLength(1);
    second.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    first.unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("cleans up when unmounted before the opening tick completes", async () => {
    const wrapper = mount(HModal, {
      ...realModalOptions(),
      props: { modelValue: true },
    });
    wrapper.unmount();
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});

describe("Haruna notification services", () => {
  function mountNotifications() {
    let service: HNotifications;
    const Fixture = defineComponent({
      setup() {
        service = useHarunaUiService();
        return () => null;
      },
    });
    const wrapper = mount(Fixture, realModalOptions());
    return { wrapper, service: service! };
  }
  it("renders message text safely, expires toasts and supports manual dismissal", async () => {
    vi.useFakeTimers();
    const { wrapper, service } = mountNotifications();
    service.toast({
      message: "<img src=x onerror=alert(1)>",
      color: "danger",
      duration: 100,
    });
    await flushPromises();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(
      "<img src=x onerror=alert(1)>",
    );
    expect(
      document.querySelector("[data-haruna-notifications] img"),
    ).toBeNull();
    await vi.advanceTimersByTimeAsync(100);
    expect(document.querySelector('[role="alert"]')).toBeNull();
    service.toast({ message: "Persistent", duration: 0 });
    await flushPromises();
    click('button[aria-label="Dismiss notification"]');
    await flushPromises();
    expect(document.querySelector('[role="status"]')).toBeNull();
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([true, false])(
    "settles confirmation as %s through real controls",
    async (confirmed) => {
      const { wrapper, service } = mountNotifications();
      const promise = service.confirm("Proceed?");
      await flushPromises();
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
      );
      buttons
        .find((button) => button.textContent === (confirmed ? "OK" : "Cancel"))!
        .click();
      expect(await promise).toBe(confirmed);
      await flushPromises();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      wrapper.unmount();
    },
  );
  it("clears timers, pending confirmations and portal nodes on app unmount", async () => {
    vi.useFakeTimers();
    const { wrapper, service } = mountNotifications();
    service.toast("Pending");
    const promise = service.confirm("Pending?");
    await flushPromises();
    wrapper.unmount();
    expect(await promise).toBe(false);
    // jsdom schedules a zero-delay selectionchange event during focus cleanup.
    // Drain that event; an uncleared five-second toast timer must still fail.
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(document.querySelector("[data-haruna-notifications]")).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(await service.confirm("After unmount")).toBe(false);
    expect(service.toast("After unmount")).toBeNull();
  });
  it("keeps separate apps independent", async () => {
    const first = mountNotifications();
    const second = mountNotifications();
    first.service.toast({ message: "First", duration: 0 });
    second.service.toast({ message: "Second", duration: 0 });
    await flushPromises();
    first.wrapper.unmount();
    expect(document.body.textContent).not.toContain("First");
    expect(document.body.textContent).toContain("Second");
    second.wrapper.unmount();
  });
});
