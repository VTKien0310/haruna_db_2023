import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { VaIcon, VaImage } from "vuestic-ui";
import GalleryGridItem from "@/modules/gallery/components/GalleryGridItem.vue";
import { makeMedia } from "../../../factories/Records";
import { appMountOptions } from "../../../support/mountApp";

const fake = vi.hoisted(() => ({
  thumbnail: vi.fn(async () => "https://media.invalid/thumb"),
  navigate: vi.fn(),
}));
vi.mock("@/modules/gallery/GalleryServiceContainer", () => ({
  useMediaDetailService: () => ({ createThumbnailUrlForMedia: fake.thumbnail }),
  useGalleryNavigationService: () => ({
    navigateToMediaDetailPage: fake.navigate,
  }),
}));

describe("GalleryGridItem", () => {
  it.each([0, 1])(
    "renders media type %s and navigates on click",
    async (type) => {
      const options = appMountOptions();
      options.global.stubs = { ...options.global.stubs, ...{ VaImage: true } };
      const wrapper = mount(GalleryGridItem, {
        ...options,
        props: { media: makeMedia({ type }) },
      });
      expect(wrapper.findComponent(VaImage).exists()).toBe(false);
      await flushPromises();
      expect(wrapper.getComponent(VaImage).props("src")).toBe(
        "https://media.invalid/thumb",
      );
      expect(wrapper.findComponent(VaIcon).exists()).toBe(type === 1);
      await wrapper.getComponent(VaImage).trigger("click");
      expect(fake.navigate).toHaveBeenCalledWith("media-1");
    },
  );
  it("does not display an invalid thumbnail", async () => {
    fake.thumbnail.mockResolvedValue("");
    const wrapper = mount(GalleryGridItem, {
      ...appMountOptions(),
      props: { media: makeMedia() },
    });
    await flushPromises();
    expect(wrapper.findComponent(VaImage).exists()).toBe(false);
  });
});
