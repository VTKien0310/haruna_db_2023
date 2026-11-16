import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import WebpageBookmarkChild from "@/modules/webpage-bookmark/components/WebpageBookmarkChild.vue";
import { WebpageBookmarkType } from "@/modules/webpage-bookmark/WebpageBookmarkEntities";
import router from "@/router";
import { makeBookmark } from "../../../factories/Records";
import { appMountOptions } from "../../../support/mountApp";

vi.mock("@/router", async () => ({
  default: (await import("../../../fakes/Collaborators")).makeRouter(),
}));

describe("WebpageBookmarkChild", () => {
  beforeEach(() => {
    vi.spyOn(router, "push").mockResolvedValue();
  });

  it.each([
    [WebpageBookmarkType.DIRECTORY, "folder", "New directory"],
    [WebpageBookmarkType.LINK, "link", "GitHub 1"],
  ] as const)(
    "renders and opens a record of type %s",
    async (type, icon, name) => {
      const bookmark = makeBookmark({ type, name });
      const wrapper = mount(WebpageBookmarkChild, {
        ...appMountOptions(),
        props: { webpageBookmark: bookmark },
      });

      expect(wrapper.get(".h-icon").text()).toBe(icon);
      expect(wrapper.get("p").text()).toBe(name);
      await wrapper.trigger("click");
      expect(router.push).toHaveBeenCalledWith({
        name: "webpage-bookmark.root",
        params: { id: bookmark.id },
      });
    },
  );
});
