import { beforeEach, describe, expect, it } from "vitest";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { useGalleryListStore } from "@/modules/gallery/stores/GalleryListStore";
import {
  makeBackendFake,
  queryResult,
  queryError,
} from "../../../fakes/BackendFake";
import { makeToast } from "../../../fakes/Collaborators";
import { makeMedia } from "../../../factories/Records";

describe("GalleryListService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let service: GalleryListService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    service = new GalleryListService(backend.port, toast.service);
  });
  it("appends pages and advances the offset", async () => {
    const first = backend.query(queryResult([makeMedia()]));
    await service.fetchMedia();
    const second = backend.query(queryResult([makeMedia({ id: "media-2" })]));
    await service.fetchMedia();
    expect(first.range).toHaveBeenCalledWith(0, 50);
    expect(second.range).toHaveBeenCalledWith(1, 51);
    expect(useGalleryListStore().media).toHaveLength(2);
    expect(useGalleryListStore().offset).toBe(2);
    expect(useGalleryListStore().isFetchingGalleryMedia).toBe(false);
  });
  it("stops after an empty page", async () => {
    backend.query(queryResult([]));
    await service.fetchMedia();
    await service.fetchMedia();
    expect(useGalleryListStore().hasFetchedAllRecords).toBe(true);
    expect(backend.spbClient.from).toHaveBeenCalledTimes(1);
  });
  it("prevents concurrent requests", async () => {
    backend.query(queryResult([]));
    const pending = service.fetchMedia();
    await service.fetchMedia();
    await pending;
    expect(backend.spbClient.from).toHaveBeenCalledTimes(1);
  });
  it.each([queryError(), queryResult(null)])(
    "clears loading after failure and permits retry %j",
    async (result) => {
      backend.query(result);
      await service.fetchMedia();
      expect(useGalleryListStore().isFetchingGalleryMedia).toBe(false);
      expect(toast.error).toHaveBeenCalled();
      backend.query(queryResult([makeMedia()]));
      await service.fetchMedia();
      expect(useGalleryListStore().media).toHaveLength(1);
    },
  );
  it("refreshes from the beginning", async () => {
    useGalleryListStore().media = [makeMedia()];
    useGalleryListStore().offset = 50;
    const query = backend.query(queryResult([]));
    await service.refreshMedia();
    expect(query.range).toHaveBeenCalledWith(0, 50);
    expect(useGalleryListStore().media).toEqual([]);
  });
  it("finds adjacent items and loads more at the end", async () => {
    const first = makeMedia();
    const second = makeMedia({ id: "media-2" });
    useGalleryListStore().media = [first];
    backend.query(queryResult([second]));
    expect(await service.getPrevAndNextMediaIdInList(first)).toEqual({
      prevId: null,
      nextId: second.id,
    });
    useGalleryListStore().hasFetchedAllRecords = true;
    expect(await service.getPrevAndNextMediaIdInList(second)).toEqual({
      prevId: first.id,
      nextId: null,
    });
    expect(
      await service.getPrevAndNextMediaIdInList(makeMedia({ id: "missing" })),
    ).toEqual({ prevId: null, nextId: null });
  });
});
