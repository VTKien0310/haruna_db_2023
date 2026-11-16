import { describe, expect, it } from "vitest";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore";
import {
  makeVirtualWebBookmarkRootDirectory,
  WEB_BOOKMARK_ROOT_DIR_ID,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities";
import { makeBookmark } from "../../../factories/Records";

describe("WebpageBookmarkDetailStore", () => {
  it("derives root and parent navigation state from the current record", () => {
    const store = useWebpageBookmarkDetailStore();
    expect(store.currentIsRoot).toBe(false);
    expect(store.currentIsDirectory).toBe(false);
    expect(store.currentParentId).toBe(WEB_BOOKMARK_ROOT_DIR_ID);
    store.webpageBookmark = makeVirtualWebBookmarkRootDirectory("user-1");
    expect(store.currentIsRoot).toBe(true);
    expect(store.currentIsDirectory).toBe(true);
    store.webpageBookmark = makeBookmark({ type: 1, parent_id: "parent" });
    expect(store.currentIsRoot).toBe(false);
    expect(store.currentIsDirectory).toBe(false);
    expect(store.currentParentId).toBe("parent");
  });
});
