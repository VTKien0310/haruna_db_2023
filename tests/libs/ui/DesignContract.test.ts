import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  HButton,
  HCard,
  HIcon,
  HProgressBar,
  HSidebar,
  HSkeleton,
  type HActionColor,
  type HButtonVariant,
  type HColor,
} from "@/libs/ui";
import { appMountOptions } from "../../support/mountApp";

describe("HButton design contract", () => {
  it.each(["solid", "outlined", "quiet"] as const)(
    "renders the %s action with shared corners",
    (variant) => {
      const wrapper = mount(HButton, {
        ...appMountOptions(),
        props: { variant, color: "danger" },
        slots: { default: "Delete" },
      });
      expect(wrapper.classes()).toContain(`h-button-${variant}`);
      expect(wrapper.classes()).toContain("rounded-(--h-control-radius)");
      expect(wrapper.element.style.getPropertyValue("--h-action-fill")).toBe(
        "var(--color-danger)",
      );
    },
  );
  it.each(["#ff0000", "backgroundPrimary", "__proto__", "constructor"])(
    "falls back for unsupported action color %s",
    (color) => {
      const wrapper = mount(HButton, {
        ...appMountOptions(),
        props: { color: color as HActionColor },
      });
      expect(wrapper.element.style.getPropertyValue("--h-action-fill")).toBe(
        "var(--color-primary)",
      );
    },
  );
  it("uses dark text for warning fills and preserves icon labels and slots while loading", async () => {
    const wrapper = mount(HButton, {
      ...appMountOptions(),
      props: { color: "warning", icon: "file_upload" },
    });
    expect(wrapper.attributes("aria-label")).toBe("file upload");
    expect(
      wrapper.element.style.getPropertyValue("--h-action-foreground"),
    ).toBe("var(--color-warning-foreground)");
    await wrapper.setProps({ loading: true });
    expect(wrapper.find('[aria-label="Loading"]').exists()).toBe(true);
    expect(wrapper.find(".h-icon").text()).toBe("file_upload");
    expect(wrapper.attributes("disabled")).toBeDefined();
  });
  it("defaults unsupported runtime variants to solid", () => {
    const wrapper = mount(HButton, {
      ...appMountOptions(),
      props: { variant: "tinted" as HButtonVariant },
    });
    expect(wrapper.classes()).toContain("h-button-solid");
  });
});

describe("Haruna surfaces and feedback", () => {
  it("uses fixed card, navigation and skeleton surfaces", () => {
    expect(mount(HCard, appMountOptions()).classes()).toContain(
      "bg-background-secondary",
    );
    expect(mount(HSidebar, appMountOptions()).classes()).toContain(
      "bg-background-primary",
    );
    const skeleton = mount(HSkeleton, {
      ...appMountOptions(),
      props: { width: "100%", height: "100%" },
    });
    expect(skeleton.classes()).toContain("h-pulse");
    expect(skeleton.classes()).toContain("rounded-(--h-control-radius)");
    expect(skeleton.attributes("aria-hidden")).toBe("true");
    expect(skeleton.element.style.height).toBe("100%");
  });
  it("restricts icon colors at runtime while preserving native accessibility", () => {
    const icon = mount(HIcon, {
      ...appMountOptions(),
      props: { name: "info", color: "#abc" as HColor },
      attrs: { "aria-label": "Information" },
    });
    expect(icon.element.style.color).toBe("var(--color-primary)");
    expect(icon.attributes("role")).toBe("img");
    expect(icon.attributes("aria-hidden")).toBeUndefined();
  });
  it("places a custom progress label after the fixed track and hides unknown percentages", async () => {
    const progress = mount(HProgressBar, {
      ...appMountOptions(),
      props: { modelValue: 25, showPercent: true },
    });
    const track = progress.get(".h-2");
    expect(track.text()).toBe("");
    expect(progress.text()).toBe("25%");
    await progress.setProps({ indeterminate: true });
    expect(progress.text()).toBe("");
    const custom = mount(HProgressBar, {
      ...appMountOptions(),
      props: { modelValue: 25 },
      slots: {
        default: ({ value }: { value: number }) => `Uploaded ${value} files`,
      },
    });
    expect(custom.text()).toBe("Uploaded 25 files");
    expect(custom.get(".h-2").text()).toBe("");
  });
});
