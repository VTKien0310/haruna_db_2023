import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { HButton } from "@/libs/ui";
import { GalleryRouteName } from "@/modules/gallery/GalleryRouter";
import GalleryToUploadPageButton from "@/modules/gallery/components/GalleryToUploadPageButton.vue";
import router from "@/router";
import { appMountOptions } from "../../../support/mountApp";

const fakeRouter = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/router", () => ({ default: fakeRouter }));

describe("GalleryToUploadPageButton", () => {
  it("uses the medium size and navigates to upload when activated", async () => {
    const wrapper = mount(GalleryToUploadPageButton, appMountOptions());

    try {
      const button = wrapper.getComponent(HButton);
      expect(button.classes()).toContain("h-button-size-medium");
      expect(button.classes()).not.toContain("h-button-size-large");
      expect(button.attributes("aria-label")).toBe("upload");

      await button.trigger("click");
      expect(router.push).toHaveBeenCalledWith({
        name: GalleryRouteName.UPLOAD,
      });
    } finally {
      wrapper.unmount();
    }
  });
});
