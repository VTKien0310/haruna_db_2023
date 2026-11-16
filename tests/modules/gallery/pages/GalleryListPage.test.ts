import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { HButtonToggle, HProgressCircle } from "@/libs/ui";
import GalleryListPage from "@/modules/gallery/pages/GalleryListPage.vue";
import { useGalleryListStore } from "@/modules/gallery/stores/GalleryListStore";
import { makeMedia } from "../../../factories/Records";
import { appMountOptions } from "../../../support/mountApp";

const list = vi.hoisted(() => ({
  refreshMedia: vi.fn(),
  fetchMedia: vi.fn(),
}));
vi.mock("@/modules/gallery/GalleryServiceContainer", () => ({
  useGalleryListService: () => list,
}));
vi.mock("@/modules/gallery/components/GalleryToUploadPageButton.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("@/modules/gallery/components/GalleryGridItem.vue", () => ({
  default: {
    props: ["media"],
    template: '<div class="grid-item">{{ media.name }}</div>',
  },
}));
vi.mock("@/modules/gallery/components/GalleryListItem.vue", () => ({
  default: {
    props: ["media"],
    template: '<div class="list-item">{{ media.name }}</div>',
  },
}));

describe("GalleryListPage", () => {
  it("refreshes on mount, shows loading and switches views", async () => {
    const store = useGalleryListStore();
    store.media = [makeMedia()];
    store.isFetchingGalleryMedia = true;
    const wrapper = mount(GalleryListPage, appMountOptions());
    expect(list.refreshMedia).toHaveBeenCalledOnce();
    expect(wrapper.getComponent(HProgressCircle).isVisible()).toBe(true);
    expect(wrapper.get(".grid-item").isVisible()).toBe(true);
    expect(wrapper.get(".list-item").isVisible()).toBe(false);
    wrapper.getComponent(HButtonToggle).vm.$emit("update:modelValue", "list");
    await flushPromises();
    expect(wrapper.get(".list-item").isVisible()).toBe(true);
    store.isFetchingGalleryMedia = false;
    await flushPromises();
    expect(wrapper.getComponent(HProgressCircle).isVisible()).toBe(false);
  });
  it("loads more near the bottom and handles an empty list", async () => {
    const wrapper = mount(GalleryListPage, appMountOptions());
    expect(wrapper.find(".grid-item").exists()).toBe(false);
    const scroller = wrapper.get('[aria-label="Gallery media"]');
    Object.defineProperties(scroller.element, {
      scrollTop: { value: 760 },
      clientHeight: { value: 100 },
      scrollHeight: { value: 1000 },
    });
    await scroller.trigger("scroll");
    expect(list.fetchMedia).toHaveBeenCalledOnce();
  });
});
