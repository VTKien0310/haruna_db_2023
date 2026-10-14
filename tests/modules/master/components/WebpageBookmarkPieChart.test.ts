import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import WebpageBookmarkPieChart from "@/modules/master/components/WebpageBookmarkPieChart.vue";
import { useThemeStore } from "@/modules/master/stores/ThemeStore";
import { ThemeService } from "@/modules/master/services/ThemeService";
import { appMountOptions } from "../../../support/mountApp";

vi.mock("vue-chartjs", async () => {
  const { defineComponent } = await import("vue");
  return {
    Doughnut: defineComponent({
      name: "Doughnut",
      props: ["data", "options"],
      template: '<div aria-label="Bookmark chart" />',
    }),
  };
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("color-scheme");
});

describe("WebpageBookmarkPieChart", () => {
  it("refreshes slice and legend colors after selecting a theme and stops reading colors on unmount", async () => {
    const properties = new Map([
      ["--color-brand-cyan", "#0d9488"],
      ["--color-brand-amber", "#f59e0b"],
      ["--color-text-primary", "#334155"],
    ]);
    const originalStyle = getComputedStyle(document.documentElement);
    const getStyle = vi
      .spyOn(globalThis, "getComputedStyle")
      .mockReturnValue(originalStyle);
    vi.spyOn(originalStyle, "getPropertyValue").mockImplementation(
      (token) => properties.get(token) ?? "",
    );
    const service = new ThemeService(document, () => localStorage);
    service.initialize();
    const wrapper = mount(WebpageBookmarkPieChart, {
      ...appMountOptions(),
      props: { linkCount: 7, directoryCount: 3 },
    });
    await nextTick();
    const renderedChart = wrapper.getComponent({ name: "Doughnut" });
    expect(renderedChart.props("data").datasets[0]).toMatchObject({
      data: [7, 3],
      backgroundColor: ["#0d9488", "#f59e0b"],
    });
    expect(renderedChart.props("options").plugins.legend.labels.color).toBe(
      "#334155",
    );
    properties.set("--color-brand-cyan", "#5eead4");
    properties.set("--color-brand-amber", "#fbbf24");
    properties.set("--color-text-primary", "#e2e8f0");
    service.select("haruna-dark");
    await nextTick();
    expect(renderedChart.props("data").datasets[0].backgroundColor).toEqual([
      "#5eead4",
      "#fbbf24",
    ]);
    expect(renderedChart.props("options").plugins.legend.labels.color).toBe(
      "#e2e8f0",
    );
    wrapper.unmount();
    const reads = getStyle.mock.calls.length;
    service.select("classic-light");
    await nextTick();
    expect(useThemeStore().themeId).toBe("classic-light");
    expect(getStyle).toHaveBeenCalledTimes(reads);
  });
});
