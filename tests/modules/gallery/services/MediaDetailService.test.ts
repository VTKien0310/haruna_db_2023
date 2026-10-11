import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { MediaDetailService } from "@/modules/gallery/services/MediaDetailService";
import { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { MasterNavigationService } from "@/modules/master/services/MasterNavigationService";
import { domPort } from "@/ports/dom/DomPort";
import { BackendApiResult } from "@/ports/backend/BackendPortTypes";
import {
  makeBackendFake,
  queryError,
  queryResult,
} from "../../../fakes/BackendFake";
import { makeModal, makeRouter, makeToast } from "../../../fakes/Collaborators";
import { makeMedia, makeProfile } from "../../../factories/Records";

describe("MediaDetailService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let modal: ReturnType<typeof makeModal>;
  let router: ReturnType<typeof makeRouter>;
  let list: GalleryListService;
  let service: MediaDetailService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    modal = makeModal();
    router = makeRouter();
    list = new GalleryListService(backend.port, toast.service);
    service = new MediaDetailService(
      router,
      backend.port,
      toast.service,
      modal.service,
      new MasterNavigationService(router),
      list,
    );
  });
  it.each([
    [0, "0 Bytes"],
    [1024, "1 KB"],
    [1572864, "1.5 MB"],
  ])("formats %s bytes", (size, expected) => {
    expect(service.transformMediaSizeToHumanReadableFormat(Number(size))).toBe(
      expected,
    );
  });
  it("formats media date", () =>
    expect(
      service.transformMediaCreatedAtToHumanReadableFormat(makeMedia()),
    ).toBe("02/01/2026"));
  it("downloads a fake blob through the DOM port", async () => {
    const blob = new Blob(["dummy"]);
    backend.storage.download.mockResolvedValue(queryResult(blob));
    const download = vi
      .spyOn(domPort, "triggerDownloadBlob")
      .mockImplementation(() => {});
    await service.downloadMedia(makeMedia());
    expect(download).toHaveBeenCalledWith(blob, "photo.png");
  });
  it("reports download failure", async () => {
    backend.storage.download.mockResolvedValue(queryError());
    await service.downloadMedia(makeMedia());
    expect(toast.error).toHaveBeenCalled();
  });
  it("looks up an uploader only when present", async () => {
    expect(
      await service.getMediaUploader(makeMedia({ uploader_id: null })),
    ).toBeNull();
    backend.query(queryResult([makeProfile()]));
    expect(await service.getMediaUploader(makeMedia())).toEqual(makeProfile());
  });
  it.each([queryError(), queryResult([])])(
    "routes missing or failed lookups %j",
    async (result) => {
      backend.query(result);
      expect(await service.getMediaById("missing")).toBeNull();
      expect(router.replace).toHaveBeenCalledWith({
        name: result.error ? "bad-request" : "not-found",
      });
    },
  );
  it("returns media and signed URLs", async () => {
    backend.query(queryResult([makeMedia()]));
    expect(await service.getMediaById("media-1")).toEqual(makeMedia());
    backend.storage.createSignedUrl.mockResolvedValue(
      queryResult({ signedUrl: "https://media.invalid/full" }),
    );
    expect(await service.createFullSizeViewUrlForMedia(makeMedia())).toBe(
      "https://media.invalid/full",
    );
  });
  it("reuses a cached resized image", async () => {
    backend.storage.list.mockResolvedValue(
      queryResult([{ name: "500x500.jpeg" }]),
    );
    backend.storage.createSignedUrl.mockResolvedValue(
      queryResult({ signedUrl: "https://media.invalid/thumb" }),
    );
    expect(await service.createThumbnailUrlForMedia(makeMedia())).toBe(
      "https://media.invalid/thumb",
    );
    expect(backend.post).not.toHaveBeenCalled();
    expect(backend.storage.createSignedUrl).toHaveBeenCalledWith(
      "media-1/500x500.jpeg",
      1800,
    );
  });
  it("requests a resized image and falls back on failure", async () => {
    backend.storage.list.mockResolvedValue(queryResult([]));
    backend.post.mockResolvedValue(BackendApiResult.err(new Error("dummy")));
    backend.storage.createSignedUrl.mockResolvedValue(
      queryResult({ signedUrl: "https://media.invalid/fallback" }),
    );
    expect(await service.createThumbnailUrlForMedia(makeMedia(), false)).toBe(
      "https://media.invalid/fallback",
    );
    expect(backend.post).toHaveBeenCalledWith("medias/media-1/thumbnails", {
      width: 1024,
      height: 768,
    });
  });
  it("does nothing when deletion is cancelled", async () => {
    await service.deleteMedia(makeMedia());
    await flushPromises();
    expect(backend.spbClient.from).not.toHaveBeenCalled();
  });
  it("deletes record and storage then refreshes", async () => {
    modal.confirm.mockResolvedValue(true);
    const query = backend.query(queryResult());
    backend.storage.remove.mockResolvedValue(queryResult());
    const refresh = vi.spyOn(list, "refreshMedias").mockResolvedValue();
    await service.deleteMedia(makeMedia());
    await flushPromises();
    expect(query.eq).toHaveBeenCalledWith("id", "media-1");
    expect(backend.storage.remove).toHaveBeenCalledWith(["photo.png"]);
    expect(refresh).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith({ name: "gallery.list" });
  });
  it("does not delete storage if record deletion fails", async () => {
    modal.confirm.mockResolvedValue(true);
    backend.query(queryError());
    await service.deleteMedia(makeMedia());
    await flushPromises();
    expect(backend.storage.remove).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
