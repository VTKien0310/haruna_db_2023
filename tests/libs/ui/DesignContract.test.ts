import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  HButton,
  HCard,
  HIcon,
  HProgressBar,
  HProgressCircle,
  HSidebar,
  HSidebarItem,
  HSkeleton,
  type HActionColor,
  type HButtonShape,
  type HButtonSize,
  type HButtonVariant,
  type HColor,
} from "@/libs/ui";
import { appMountOptions } from "../../support/mountApp";

describe("HButton design contract", () => {
  it.each(["filled", "tonal", "outlined", "text", "elevated"] as const)(
    "renders the %s action with M3 color roles",
    (variant) => {
      const wrapper = mount(HButton, {
        ...appMountOptions(),
        props: { variant, color: "error" },
        slots: { default: "Delete" },
      });
      expect(wrapper.classes()).toContain(`h-button-${variant}`);
      expect(wrapper.classes()).toContain("h-button-size-small");
      expect(wrapper.classes()).toContain("h-button-shape-round");
      expect(wrapper.element.style.getPropertyValue("--h-btn-container")).toBe(
        {
          filled: "var(--color-error)",
          tonal: "var(--color-error-container)",
          outlined: "transparent",
          text: "transparent",
          elevated: "var(--color-surface-container-low)",
        }[variant],
      );
      expect(wrapper.element.style.getPropertyValue("--h-btn-content")).toBe(
        {
          filled: "var(--color-on-error)",
          tonal: "var(--color-on-error-container)",
          outlined: "var(--color-error)",
          text: "var(--color-error)",
          elevated: "var(--color-error)",
        }[variant],
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
      expect(wrapper.element.style.getPropertyValue("--h-btn-container")).toBe(
        "var(--color-primary)",
      );
    },
  );
  it("uses the warning on-color and preserves icon labels and slots while loading", async () => {
    const wrapper = mount(HButton, {
      ...appMountOptions(),
      props: { color: "warning", icon: "file_upload" },
    });
    expect(wrapper.attributes("aria-label")).toBe("file upload");
    expect(wrapper.element.style.getPropertyValue("--h-btn-content")).toBe(
      "var(--color-on-warning)",
    );
    await wrapper.setProps({ loading: true });
    expect(wrapper.find('[aria-label="Loading"]').exists()).toBe(true);
    expect(wrapper.find(".h-icon").text()).toBe("file_upload");
    expect(wrapper.attributes("disabled")).toBeDefined();
  });
  it("defaults unsupported runtime variants, sizes and shapes to M3 defaults", () => {
    const wrapper = mount(HButton, {
      ...appMountOptions(),
      props: {
        variant: "solid" as HButtonVariant,
        size: "tiny" as HButtonSize,
        shape: "rounded" as HButtonShape,
      },
    });
    expect(wrapper.classes()).toContain("h-button-filled");
    expect(wrapper.classes()).toContain("h-button-size-small");
    expect(wrapper.classes()).toContain("h-button-shape-round");
  });
});

describe("Haruna surfaces and feedback", () => {
  it.each([
    ["elevated", "bg-surface-container-low", "shadow-level-1"],
    ["filled", "bg-surface-container-highest", undefined],
    ["outlined", "border-outline-variant", undefined],
  ] as const)("uses the %s card surface", (variant, surface, elevation) => {
    const card = mount(HCard, {
      ...appMountOptions(),
      props: { variant },
    });
    expect(card.classes()).toContain(surface);
    if (elevation) expect(card.classes()).toContain(elevation);
    expect(card.classes()).toContain("rounded-medium");
  });
  it("uses M3 navigation and skeleton surfaces", () => {
    expect(mount(HSidebar, appMountOptions()).classes()).toContain(
      "bg-surface-container-low",
    );
    const activeItem = mount(HSidebarItem, {
      ...appMountOptions(),
      props: { active: true },
      slots: { default: "Gallery" },
    });
    expect(activeItem.classes()).toContain("min-h-14");
    expect(activeItem.find(".bg-secondary-container").exists()).toBe(true);
    expect(activeItem.attributes("aria-current")).toBe("page");
    const skeleton = mount(HSkeleton, {
      ...appMountOptions(),
      props: { width: "100%", height: "100%" },
    });
    expect(skeleton.classes()).toContain("h-pulse");
    expect(skeleton.classes()).toContain("bg-surface-container-highest");
    expect(skeleton.classes()).toContain("rounded-small");
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
    expect(icon.classes()).toContain("material-symbols-outlined");
    expect(icon.attributes("role")).toBe("img");
    expect(icon.attributes("aria-hidden")).toBeUndefined();
  });
  it("places a custom progress label after the fixed track and hides unknown percentages", async () => {
    const progress = mount(HProgressBar, {
      ...appMountOptions(),
      props: { modelValue: 25, showPercent: true },
    });
    const track = progress.get(".h-progress-track");
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
    expect(custom.get(".h-progress-track").classes()).toContain("h-1");
    expect(custom.get(".h-progress-track").classes()).toContain(
      "bg-secondary-container",
    );
    expect(custom.get(".h-progress-indicator").classes()).toContain(
      "bg-primary",
    );
    expect(custom.get(".h-progress-stop").classes()).toContain(
      "h-progress-stop",
    );
    expect(
      mount(HProgressCircle, appMountOptions())
        .get(".h-progress-track")
        .classes(),
    ).toContain("h-progress-track");
  });
});
