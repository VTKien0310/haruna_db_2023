import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService";
import { UpdateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/UpdateWebpageBookmarkService";
import { DeleteWebpageBookmarkService } from "@/modules/webpage-bookmark/services/DeleteWebpageBookmarkService";
import { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService";
import { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService";
import { MasterNavigationService } from "@/modules/master/services/MasterNavigationService";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore";
import {
  makeVirtualWebBookmarkRootDirectory,
  WEB_BOOKMARK_ROOT_DIR_ID,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../../fakes/BackendFake";
import { makeModal, makeRouter, makeToast } from "../../../fakes/Collaborators";
import { makeBookmark } from "../../../factories/Records";

let backend: ReturnType<typeof makeBackendFake>;
let toast: ReturnType<typeof makeToast>;
let modal: ReturnType<typeof makeModal>;
let router: ReturnType<typeof makeRouter>;
let list: ListWebpageBookmarkService;
let detail: WebpageBookmarkDetailService;
beforeEach(() => {
  backend = makeBackendFake();
  toast = makeToast();
  modal = makeModal();
  router = makeRouter();
  list = new ListWebpageBookmarkService(backend.port, toast.service);
  detail = new WebpageBookmarkDetailService(
    backend.port,
    toast.service,
    new MasterNavigationService(router),
    list,
  );
});

describe("ListWebpageBookmarkService", () => {
  it("lists root entries in deterministic order", async () => {
    useWebpageBookmarkDetailStore().webpageBookmark =
      makeVirtualWebBookmarkRootDirectory("user-1");
    const query = backend.query(queryResult([makeBookmark()]));
    await list.refreshChildrenWebpageBookmarks();
    expect(query.eq).toHaveBeenCalledWith("level", 1);
    expect(query.order.mock.calls.map((args) => args[0])).toEqual([
      "type",
      "name",
      "created_at",
    ]);
    expect(useWebpageBookmarkDetailStore().webpageBookmarkChildren).toEqual([
      makeBookmark(),
    ]);
  });
  it("filters children by parent and level", async () => {
    useWebpageBookmarkDetailStore().webpageBookmark = makeBookmark();
    const query = backend.query(queryResult([]));
    await list.refreshChildrenWebpageBookmarks();
    expect(query.eq).toHaveBeenCalledWith("parent_id", "bookmark-1");
    expect(query.eq).toHaveBeenCalledWith("level", 2);
  });
  it("clears children for a link without querying", async () => {
    useWebpageBookmarkDetailStore().webpageBookmark = makeBookmark({ type: 1 });
    useWebpageBookmarkDetailStore().webpageBookmarkChildren = [makeBookmark()];
    await list.refreshChildrenWebpageBookmarks();
    expect(useWebpageBookmarkDetailStore().webpageBookmarkChildren).toEqual([]);
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });
  it("reports list failure", async () => {
    useWebpageBookmarkDetailStore().webpageBookmark = makeBookmark();
    backend.query(queryError());
    await list.refreshChildrenWebpageBookmarks();
    expect(useWebpageBookmarkDetailStore().webpageBookmarkChildren).toEqual([]);
    expect(toast.error).toHaveBeenCalled();
  });
  it.each([
    "countWebpageBookmarkLinks",
    "countWebpageBookmarkDirectories",
  ] as const)("counts %s and handles failure", async (method) => {
    backend.query(queryResult(null, 5));
    expect(await list[method]()).toBe(5);
    backend.query(queryError());
    expect(await list[method]()).toBe(0);
    expect(toast.error).toHaveBeenCalled();
  });
  it("returns deepest level or zero", async () => {
    backend.query(queryResult([{ deepest_level: 4 }]));
    expect(await list.getDeepestLevelWebpageBookmark()).toBe(4);
    backend.query(queryResult([]));
    expect(await list.getDeepestLevelWebpageBookmark()).toBe(0);
  });
});

describe("WebpageBookmarkDetailService", () => {
  it("loads virtual root without querying for a root record", async () => {
    backend.query(queryResult([makeBookmark()]));
    await detail.loadWebpageBookmarkIntoStore(WEB_BOOKMARK_ROOT_DIR_ID);
    expect(useWebpageBookmarkDetailStore()).toMatchObject({
      currentIsRoot: true,
      currentIsDirectory: true,
      webpageBookmarkHeaderTitle: "~",
      isFetchingData: false,
    });
    expect(backend.spbClient.from).toHaveBeenCalledTimes(1);
  });
  it.each([1, 2, 3, 4])("builds the level %i breadcrumb", async (level) => {
    backend.query(
      queryResult([
        makeBookmark({
          id: "child",
          name: "Child",
          type: 1,
          level,
          root_id: "root",
          parent_id: "parent",
        }),
      ]),
    );
    if (level >= 2)
      backend.query(queryResult([makeBookmark({ id: "root", name: "Root" })]));
    if (level >= 3)
      backend.query(
        queryResult([makeBookmark({ id: "parent", name: "Parent" })]),
      );
    await detail.loadWebpageBookmarkIntoStore("child");
    expect(useWebpageBookmarkDetailStore().webpageBookmarkHeaderTitle).toBe(
      [
        "",
        "~ / Child",
        "~ / Root / Child",
        "~ / Root / Parent / Child",
        "~ / Root / .. / Parent / Child",
      ][level],
    );
    expect(useWebpageBookmarkDetailStore().isFetchingData).toBe(false);
  });
  it.each([queryError(), queryResult([])])(
    "handles missing/failed record %j",
    async (result) => {
      backend.query(result);
      await detail.loadWebpageBookmarkIntoStore("missing");
      expect(useWebpageBookmarkDetailStore().webpageBookmark).toBeNull();
      expect(useWebpageBookmarkDetailStore().isFetchingData).toBe(false);
      expect(router.replace).toHaveBeenCalled();
    },
  );
});

describe("CreateWebpageBookmarkService", () => {
  it.each([true, false])(
    "creates directory with root=%s and refreshes children",
    async (isRoot) => {
      useWebpageBookmarkDetailStore().webpageBookmark = isRoot
        ? makeVirtualWebBookmarkRootDirectory("user-1")
        : makeBookmark();
      const query = backend.query(queryResult());
      backend.query(queryResult([makeBookmark({ id: "new" })]));
      const service = new CreateWebpageBookmarkService(
        backend.port,
        toast.service,
        list,
      );
      expect(
        await service.createDirectory({ name: "New", description: "Notes" }),
      ).toBe(true);
      expect(query.insert).toHaveBeenCalledWith({
        name: "New",
        description: "Notes",
        url: "",
        type: 0,
        root_id: isRoot ? null : "bookmark-1",
        parent_id: isRoot ? null : "bookmark-1",
        level: isRoot ? 1 : 2,
      });
      expect(
        useWebpageBookmarkDetailStore().webpageBookmarkChildren[0].id,
      ).toBe("new");
      expect(useWebpageBookmarkDetailStore().isFetchingData).toBe(false);
    },
  );
  it("creates a link with its URL", async () => {
    useWebpageBookmarkDetailStore().webpageBookmark = makeBookmark();
    const query = backend.query(queryResult());
    backend.query(queryResult([]));
    const service = new CreateWebpageBookmarkService(
      backend.port,
      toast.service,
      list,
    );
    expect(
      await service.createLink({
        name: "Docs",
        url: "https://example.test",
        description: "",
      }),
    ).toBe(true);
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({ type: 1, url: "https://example.test" }),
    );
  });
  it.each(["createLink", "createDirectory"] as const)(
    "does not refresh after %s failure",
    async (method) => {
      useWebpageBookmarkDetailStore().webpageBookmark = makeBookmark();
      backend.query(queryError());
      const service = new CreateWebpageBookmarkService(
        backend.port,
        toast.service,
        list,
      );
      expect(
        await service[method]({
          name: "New",
          url: "https://example.test",
          description: "",
        }),
      ).toBe(false);
      expect(backend.spbClient.from).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalled();
    },
  );
});

describe("UpdateWebpageBookmarkService", () => {
  it.each([0, 1])("updates type %i and reloads detail", async (type) => {
    const service = new UpdateWebpageBookmarkService(
      backend.port,
      toast.service,
      detail,
    );
    const reload = vi
      .spyOn(detail, "loadWebpageBookmarkIntoStore")
      .mockResolvedValue();
    const query = backend.query(queryResult());
    const form = {
      name: "Updated",
      url: "https://example.test",
      description: "New",
    };
    const record = makeBookmark({ type });
    expect(
      await (type
        ? service.updateWebpageBookmarkLink(record, form)
        : service.updateWebpageBookmarkDirectory(record, form)),
    ).toBe(true);
    expect(query.update).toHaveBeenCalledWith(
      type ? form : { name: "Updated", description: "New" },
    );
    expect(reload).toHaveBeenCalledWith(record.id);
  });
  it("rejects wrong record types without queries", async () => {
    const service = new UpdateWebpageBookmarkService(
      backend.port,
      toast.service,
      detail,
    );
    expect(
      await service.updateWebpageBookmarkLink(makeBookmark(), {
        name: "x",
        url: "",
        description: "",
      }),
    ).toBe(false);
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });
  it("reports update failure without reloading", async () => {
    const reload = vi.spyOn(detail, "loadWebpageBookmarkIntoStore");
    backend.query(queryError());
    expect(
      await new UpdateWebpageBookmarkService(
        backend.port,
        toast.service,
        detail,
      ).updateWebpageBookmarkDirectory(makeBookmark(), {
        name: "x",
        description: "",
      }),
    ).toBe(false);
    expect(reload).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});

describe("DeleteWebpageBookmarkService", () => {
  it("cancels without querying", async () => {
    new DeleteWebpageBookmarkService(
      backend.port,
      toast.service,
      router,
      modal.service,
      detail,
    ).deleteWebpageBookmarkDirectory(makeBookmark());
    await flushPromises();
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });
  it.each([queryResult(null, 2), queryError(), queryResult(null, null)])(
    "prevents deletion without a confirmed empty directory %j",
    async (result) => {
      modal.confirm.mockResolvedValue(true);
      const query = backend.query(result);
      new DeleteWebpageBookmarkService(
        backend.port,
        toast.service,
        router,
        modal.service,
        detail,
      ).deleteWebpageBookmarkDirectory(makeBookmark());
      await flushPromises();
      expect(query.delete).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    },
  );
  it.each([0, 1])("deletes type %i and navigates to parent", async (type) => {
    modal.confirm.mockResolvedValue(true);
    if (!type) backend.query(queryResult(null, 0));
    const query = backend.query(queryResult());
    const service = new DeleteWebpageBookmarkService(
      backend.port,
      toast.service,
      router,
      modal.service,
      detail,
    );
    const record = makeBookmark({ type });
    if (type) service.deleteWebpageBookmarkLink(record);
    else service.deleteWebpageBookmarkDirectory(record);
    await flushPromises();
    expect(query.delete).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith({
      name: "webpage-bookmark.root",
      params: { id: WEB_BOOKMARK_ROOT_DIR_ID },
    });
    expect(toast.info).toHaveBeenCalled();
  });
});
