import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NavigateToParentBookmarkDirectoryBtn from "@/modules/webpage-bookmark/components/NavigateToParentBookmarkDirectoryBtn.vue";
import router from "@/router";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore";
import { makeVirtualWebBookmarkRootDirectory } from "@/modules/webpage-bookmark/WebpageBookmarkEntities";
import { makeBookmark } from "../../../factories/Records";
import { appMountOptions } from "../../../support/mountApp";

vi.mock("@/router", async () => ({
  default: (await import("../../../fakes/Collaborators")).makeRouter(),
}));

describe("NavigateToParentBookmarkDirectoryBtn", () => {
  beforeEach(() => {
    vi.spyOn(router, "push").mockResolvedValue();
  });
  it("disables navigation at root", () => {
    useWebpageBookmarkDetailStore().webpageBookmark =
      makeVirtualWebBookmarkRootDirectory("user-1");
    const wrapper = mount(
      NavigateToParentBookmarkDirectoryBtn,
      appMountOptions(),
    );
    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
  });
  it("navigates to the parent", async () => {
    useWebpageBookmarkDetailStore().webpageBookmark = makeBookmark({
      parent_id: "parent",
    });
    const wrapper = mount(
      NavigateToParentBookmarkDirectoryBtn,
      appMountOptions(),
    );
    await wrapper.get("button").trigger("click");
    expect(router.push).toHaveBeenCalledWith({
      name: "webpage-bookmark.root",
      params: { id: "parent" },
    });
  });
});
