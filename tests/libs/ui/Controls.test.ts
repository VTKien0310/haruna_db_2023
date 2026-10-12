import { describe, expect, it } from "vitest";
import { DOMWrapper, flushPromises, mount } from "@vue/test-utils";
import {
  HButton,
  HButtonToggle,
  HFileUpload,
  HHover,
  HImage,
  HPagination,
  HProgressBar,
  HProgressCircle,
  HSelect,
  HSidebarItem,
} from "@/libs/ui";
import { appMountOptions } from "../../support/mountApp";

describe("HButton", () => {
  it("preserves submit semantics, slots, and blocks clicks while disabled or loading", async () => {
    const wrapper = mount(HButton, {
      ...appMountOptions(),
      props: { type: "submit", icon: "save" },
      slots: { default: "Save" },
    });
    expect(wrapper.attributes("type")).toBe("submit");
    expect(wrapper.text()).toContain("Save");
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
    await wrapper.setProps({ loading: true });
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true);
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
    await wrapper.setProps({ loading: false, disabled: true });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
  it("labels icon-only buttons and reflects toggle selection", async () => {
    const wrapper = mount(HButtonToggle, {
      ...appMountOptions(),
      props: {
        modelValue: "grid",
        options: [
          { value: "grid", icon: "grid_view" },
          { value: "list", icon: "splitscreen" },
        ],
        preset: "secondary",
      },
    });
    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("aria-label")).toBe("grid view");
    expect(buttons[0].attributes("aria-pressed")).toBe("true");
    await buttons[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([["list"]]);
  });
});

describe("HSelect", () => {
  const popup = () => new DOMWrapper(document.body);
  const props = {
    modelValue: "ja",
    options: [
      { code: "ja", name: "Japanese" },
      { code: "en", name: "English" },
    ],
    textBy: "name",
    valueBy: "code",
    label: "Language",
    searchable: true,
  } as const;
  const LanguageSelect = HSelect<{ code: string; name: string }>;
  function mountSelect(extra = {}) {
    return mount(LanguageSelect, {
      ...appMountOptions(),
      props: { ...props, options: [...props.options], ...extra },
    });
  }
  it("searches, navigates and emits mapped values through keyboard selection", async () => {
    const wrapper = mountSelect();
    const input = wrapper.get("input");
    expect((input.element as HTMLInputElement).value).toBe("Japanese");
    await input.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    expect(input.attributes("aria-expanded")).toBe("true");
    await input.setValue("eng");
    expect(popup().findAll('[role="option"]')).toHaveLength(1);
    expect(popup().get('[role="option"]').text()).toBe("English");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toEqual([["en"]]);
    expect(input.attributes("aria-expanded")).toBe("false");
  });
  it("handles empty searches, click selection, Escape and Tab", async () => {
    const wrapper = mountSelect();
    const input = wrapper.get("input");
    await input.trigger("click");
    await input.setValue("missing");
    expect(popup().get('[role="status"]').text()).toBe("No options found");
    await input.trigger("keydown", { key: "Escape" });
    expect((input.element as HTMLInputElement).value).toBe("Japanese");
    await input.trigger("click");
    await popup().findAll('[role="option"]')[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([["en"]]);
    await input.trigger("click");
    await input.trigger("keydown", { key: "Tab" });
    expect(popup().find('[role="listbox"]').exists()).toBe(false);
  });
  it("dismisses on outside pointer events, handles option updates and cleans up", async () => {
    const wrapper = mountSelect();
    await wrapper.get("input").trigger("click");
    await flushPromises();
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await flushPromises();
    expect(popup().find('[role="listbox"]').exists()).toBe(false);
    await wrapper.setProps({ options: [] });
    await wrapper.get("input").trigger("click");
    expect(popup().get('[role="status"]').text()).toBe("No options");
    wrapper.unmount();
    await flushPromises();
  });
  it.each([{ loading: true }, { disabled: true }])(
    "does not open while unavailable: %j",
    async (extra) => {
      const wrapper = mountSelect(extra);
      await wrapper.get("input").trigger("click");
      await wrapper.get("input").trigger("keydown", { key: "Enter" });
      expect(popup().find('[role="listbox"]').exists()).toBe(false);
    },
  );
});

describe("HFileUpload", () => {
  it("appends accepted files before notifying, removes files, and respects disabled state", async () => {
    const old = new File(["old"], "old.png", { type: "image/png" });
    const added = new File(["new"], "new.mp4", { type: "video/mp4" });
    const invalid = new File(["text"], "note.txt", { type: "text/plain" });
    const wrapper = mount(HFileUpload, {
      ...appMountOptions(),
      props: {
        modelValue: [old],
        fileTypes: "image/*,video/*",
        dropzone: true,
      },
    });
    const input = wrapper.get("input");
    Object.defineProperty(input.element, "files", {
      value: [added, invalid],
      configurable: true,
    });
    await input.trigger("change");
    expect(wrapper.emitted("update:modelValue")).toEqual([[[old, added]]]);
    expect(wrapper.emitted("file-added")).toEqual([[[added]]]);
    expect(wrapper.get('[role="alert"]').text()).toContain("unsupported");
    expect((input.element as HTMLInputElement).value).toBe("");
    await wrapper.setProps({ modelValue: [old, added] });
    await wrapper.get('button[aria-label="Remove old.png"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([[added]]);
    expect(wrapper.emitted("file-removed")).toEqual([[old]]);
    await wrapper.setProps({ disabled: true });
    await input.trigger("change");
    expect(wrapper.emitted("file-added")).toHaveLength(1);
  });
  it("supports drop and case-insensitive extension filtering", async () => {
    const file = new File(["data"], "PHOTO.PNG");
    const wrapper = mount(HFileUpload, {
      ...appMountOptions(),
      props: { modelValue: [], fileTypes: ".png", dropzone: true },
    });
    await wrapper.trigger("drop", { dataTransfer: { files: [file] } });
    expect(wrapper.emitted("update:modelValue")).toEqual([[[file]]]);
  });
});

describe("HImage", () => {
  it("transitions from loader to image, resets on source change and shows a fallback on error", async () => {
    const wrapper = mount(HImage, {
      ...appMountOptions(),
      props: { src: "data:image/png;base64,", alt: "Preview", ratio: 1 },
      slots: { loader: "Loading preview" },
    });
    expect(wrapper.text()).toBe("Loading preview");
    await wrapper.get("img").trigger("load");
    expect(wrapper.text()).not.toContain("Loading preview");
    await wrapper.setProps({ src: "data:image/png;base64,AAAA" });
    expect(wrapper.text()).toContain("Loading preview");
    await wrapper.get("img").trigger("error");
    expect(wrapper.text()).toBe("Image unavailable");
    expect(wrapper.get('[role="img"]').attributes("aria-label")).toBe(
      "Preview",
    );
  });
});

describe("HPagination and progress", () => {
  it("enforces bounds and disabled state while emitting page changes", async () => {
    const wrapper = mount(HPagination, {
      ...appMountOptions(),
      props: { modelValue: 1, pages: 3 },
    });
    expect(
      wrapper.get('[aria-label="Page 1"]').attributes("aria-current"),
    ).toBe("page");
    await wrapper.get("nav").trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.get('[aria-label="Page 2"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[2]]);
    await wrapper.setProps({ modelValue: 3, disabled: true });
    await wrapper.get('[aria-label="Page 2"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    await wrapper.setProps({ pages: 0 });
    expect(wrapper.find("nav").exists()).toBe(false);
  });
  it("clamps progress, handles a zero maximum and omits indeterminate values", async () => {
    const wrapper = mount(HProgressBar, {
      ...appMountOptions(),
      props: { modelValue: 200, max: 100, showPercent: true },
    });
    expect(wrapper.attributes("aria-valuenow")).toBe("100");
    expect(wrapper.text()).toContain("100%");
    await wrapper.setProps({ max: 0 });
    expect(wrapper.text()).toContain("0%");
    await wrapper.setProps({ indeterminate: true });
    expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    const circle = mount(HProgressCircle, {
      ...appMountOptions(),
      props: { indeterminate: true },
    });
    expect(circle.attributes("aria-valuenow")).toBeUndefined();
  });
});

describe("Navigation helpers", () => {
  it("exposes the active sidebar page and supports focus-based hover", async () => {
    const sidebar = mount(HSidebarItem, {
      ...appMountOptions(),
      props: { active: true },
      slots: { default: "Home" },
    });
    expect(sidebar.get("button").attributes("aria-current")).toBe("page");
    const hover = mount(HHover, appMountOptions());
    await hover.trigger("mouseenter");
    await hover.trigger("mouseleave");
    await hover.trigger("focusin");
    expect(hover.emitted("update:modelValue")).toEqual([
      [true],
      [false],
      [true],
    ]);
  });
});
