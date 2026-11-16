import { describe, expect, it } from "vitest";
import { MasterNavigationService } from "@/modules/master/services/MasterNavigationService";
import { GalleryNavigationService } from "@/modules/gallery/services/GalleryNavigationService";
import { makeRouter } from "../../../fakes/Collaborators";

describe("Navigation services", () => {
  it("replaces error routes", () => {
    const router = makeRouter();
    const service = new MasterNavigationService(router);
    service.navigateTo400();
    service.navigateTo404();
    expect(router.replace).toHaveBeenNthCalledWith(1, { name: "bad-request" });
    expect(router.replace).toHaveBeenNthCalledWith(2, { name: "not-found" });
  });
  it("pushes or replaces media detail with its identifier", () => {
    const router = makeRouter();
    const service = new GalleryNavigationService(router);
    service.navigateToMediaDetailPage("a");
    service.replaceMediaDetailPage("b");
    expect(router.push).toHaveBeenCalledWith({
      name: "gallery.detail",
      query: { file: "a" },
    });
    expect(router.replace).toHaveBeenCalledWith({
      name: "gallery.detail",
      query: { file: "b" },
    });
  });
});
